import express from 'express';
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { createRequire } from 'node:module';
const webpush = createRequire(import.meta.url)('web-push');
import {
  db,
  hashPassword,
  verifyPassword,
  createStarterSubjects,
  dateKeyUTC,
  ensureUniversitySeed,
} from './db.js';
import {
  advanceMythicSideStory,
  buildGameState,
  claimHeroicDeed,
  claimIdleAfkChest,
  claimIdleMythicMilestone,
  craftAtNpc,
  dungeonExtract,
  dungeonMove,
  dungeonSearch,
  dungeonUseTorch,
  ensureGameProfile,
  enterDungeon,
  equipGameItem,
  exploreRoom,
  gradeFlashcardSm2,
  grantStudyRewardsToGame,
  heroLevelFromXp,
  managePartyAlly,
  moveInVillage,
  performIdleAscension,
  processIdleWaveTick,
  resolveCombatAction,
  resolveEventChoice,
  resolvePuzzleChoice,
  resolveStudyCast,
  restAtCamp,
  salvageGameItem,
  selectFloor,
  selectSpecialization,
  startVanguardTrial,
  talkToNpc,
  updateIdleConfig,
  upgradeAscensionRelic,
  upgradeGameItem,
  upgradeHeroStat,
  upgradeIdleProfession,
} from './gameEngine.js';
import { buildShopState, purchaseShopItem, rerollDailyShop } from './shopEngine.js';
import { UNIVERSITY_COURSES, UNIVERSITY_PORTAL_URL } from './universityData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DATA_DIR = path.dirname(process.env.DB_PATH || path.join(ROOT_DIR, 'data', 'studypulse.db'));
const PORT = Number(process.env.PORT || 8080);

// Persistent HMAC secret so tokens remain valid across restarts
fs.mkdirSync(DATA_DIR, { recursive: true });
const SECRET_FILE = path.join(DATA_DIR, '.auth_secret');
let AUTH_SECRET = process.env.AUTH_SECRET || '';
if (!AUTH_SECRET) {
  if (fs.existsSync(SECRET_FILE)) {
    AUTH_SECRET = fs.readFileSync(SECRET_FILE, 'utf8').trim();
  } else {
    AUTH_SECRET = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(SECRET_FILE, AUTH_SECRET, { mode: 0o600 });
  }
}

// Persistent Web Push VAPID keys for lock-screen / closed-browser notifications
const VAPID_FILE = path.join(DATA_DIR, '.vapid_keys.json');
let vapidKeys;
if (fs.existsSync(VAPID_FILE)) {
  vapidKeys = JSON.parse(fs.readFileSync(VAPID_FILE, 'utf8'));
} else {
  vapidKeys = webpush.generateVAPIDKeys();
  fs.writeFileSync(VAPID_FILE, JSON.stringify(vapidKeys, null, 2), { mode: 0o600 });
}
webpush.setVapidDetails('mailto:focus@study.matinz03.tech', vapidKeys.publicKey, vapidKeys.privateKey);

function getUserStudyStats(userId) {
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const todayStartMs = startOfToday.getTime();
  const weekStartMs = now - 7 * 86400_000;

  return db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN created_at >= ? THEN duration_sec ELSE 0 END), 0) AS today_sec,
      COALESCE(SUM(CASE WHEN created_at >= ? THEN duration_sec ELSE 0 END), 0) AS week_sec,
      COALESCE(SUM(duration_sec), 0) AS total_sec,
      COUNT(*) AS sessions_count,
      COALESCE(AVG(purity_pct), 100) AS avg_purity
    FROM study_sessions WHERE user_id = ?
  `).get(todayStartMs, weekStartMs, userId);
}

function signToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!parsed.uid || (parsed.exp && Date.now() > parsed.exp)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function levelFromXp(xp) {
  const level = Math.floor(Math.sqrt(Math.max(0, xp) / 120)) + 1;
  const currentLevelMinXp = 120 * (level - 1) * (level - 1);
  const nextLevelXp = 120 * level * level;
  const pct = Math.min(100, Math.max(0, Math.round(((xp - currentLevelMinXp) / (nextLevelXp - currentLevelMinXp)) * 100)));
  return { level, currentLevelMinXp, nextLevelXp, levelProgressPct: pct };
}

function sanitizeUser(u) {
  if (!u) return null;
  const lvl = levelFromXp(u.xp);
  return {
    id: u.id,
    username: u.username,
    displayName: u.display_name,
    avatar: u.avatar,
    themeColor: u.theme_color,
    bio: u.bio,
    title: u.title,
    xp: u.xp,
    coins: u.coins,
    streakDays: u.streak_days,
    lastStudyDate: u.last_study_date,
    dailyGoalMins: u.daily_goal_mins,
    streakFreezes: u.streak_freezes ?? 1,
    equippedSpirit: u.equipped_spirit || 'default',
    createdAt: u.created_at,
    ...lvl,
  };
}

const app = express();
app.use(express.json({ limit: '1mb' }));

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Authentication required' });
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.uid);
  if (!user) return res.status(401).json({ error: 'User not found' });
  req.user = user;
  next();
}

// Live WebSocket presence map: userId -> object
const livePresence = new Map();
const wsSockets = new Set();

const RAID_BOSSES = [
  { bossName: 'Arch-Lich of Procrastination', bossIcon: '💀', bossMaxHp: 2500 },
  { bossName: 'Dread Dragon of Multitasking', bossIcon: '🐉', bossMaxHp: 3000 },
  { bossName: 'Null-Pointer Leviathan', bossIcon: '👾', bossMaxHp: 2800 },
  { bossName: 'Chronos Deadline Titan', bossIcon: '⏳', bossMaxHp: 3200 },
];

function getIsoWeekKey(ts = Date.now()) {
  const d = new Date(ts);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function parseJsonSafeLocal(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}

function getSyncedRoomTimer(nowMs = Date.now()) {
  const cycleDurationSec = 1800; // 25m Focus + 5m Break
  const secOfCycle = Math.floor(nowMs / 1000) % cycleDurationSec;
  const phase = secOfCycle < 1500 ? 'focus' : 'break';
  const remainingSec = phase === 'focus' ? 1500 - secOfCycle : 1800 - secOfCycle;
  return {
    phase,
    remainingSec,
    cycleDurationSec,
    phaseDurationSec: phase === 'focus' ? 1500 : 300,
  };
}

function ensureRoomRaid(roomId) {
  const weekKey = getIsoWeekKey();
  const row = db.prepare('SELECT * FROM room_raids WHERE room_id = ?').get(roomId);
  const weekSeed = weekKey.split('-W')[1] ? Number(weekKey.split('-W')[1]) : 1;
  const template = RAID_BOSSES[(roomId + weekSeed) % RAID_BOSSES.length];
  if (!row || row.week_key !== weekKey) {
    const now = Date.now();
    db.prepare(`
      INSERT INTO room_raids (room_id, week_key, boss_name, boss_icon, boss_hp, boss_max_hp, contributors_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, '[]', ?)
      ON CONFLICT(room_id) DO UPDATE SET
        week_key = excluded.week_key,
        boss_name = excluded.boss_name,
        boss_icon = excluded.boss_icon,
        boss_hp = excluded.boss_hp,
        boss_max_hp = excluded.boss_max_hp,
        contributors_json = '[]',
        updated_at = excluded.updated_at
    `).run(roomId, weekKey, template.bossName, template.bossIcon, template.bossMaxHp, template.bossMaxHp, now);
    return {
      roomId,
      weekKey,
      bossName: template.bossName,
      bossIcon: template.bossIcon,
      bossHp: template.bossMaxHp,
      bossMaxHp: template.bossMaxHp,
      contributors: [],
    };
  }
  return {
    roomId: row.room_id,
    weekKey: row.week_key,
    bossName: row.boss_name,
    bossIcon: row.boss_icon,
    bossHp: row.boss_hp,
    bossMaxHp: row.boss_max_hp,
    contributors: parseJsonSafeLocal(row.contributors_json, []),
  };
}

function applyRaidDamageToRoom(roomId, user, dmg) {
  if (!roomId || dmg <= 0) return ensureRoomRaid(roomId);
  const raid = ensureRoomRaid(roomId);
  const nextHp = Math.max(0, raid.bossHp - Math.round(dmg));
  const map = new Map();
  for (const c of raid.contributors) {
    map.set(c.userId, { ...c });
  }
  const existing = map.get(user.id) || {
    userId: user.id,
    displayName: user.display_name,
    avatar: user.avatar,
    damage: 0,
  };
  existing.damage += Math.round(dmg);
  existing.displayName = user.display_name;
  existing.avatar = user.avatar;
  map.set(user.id, existing);
  const sorted = [...map.values()].sort((a, b) => b.damage - a.damage).slice(0, 6);
  db.prepare('UPDATE room_raids SET boss_hp = ?, contributors_json = ?, updated_at = ? WHERE room_id = ?').run(
    nextHp,
    JSON.stringify(sorted),
    Date.now(),
    roomId
  );
  return { ...raid, bossHp: nextHp, contributors: sorted };
}

function getHeroMetaMap() {
  const gpRows = db.prepare('SELECT user_id, hero_class, hero_xp FROM game_profiles').all();
  const compRows = db
    .prepare("SELECT user_id, sprite_key FROM game_items WHERE equipped = 1 AND slot = 'companion'")
    .all();
  const compByUser = new Map(compRows.map((c) => [c.user_id, c.sprite_key]));
  const map = new Map();
  for (const gp of gpRows) {
    map.set(gp.user_id, {
      heroClass: gp.hero_class || 'hero_scholar',
      heroLevel: heroLevelFromXp(gp.hero_xp || 0).heroLevel,
      companionSpriteKey: compByUser.get(gp.user_id) || null,
    });
  }
  return map;
}

function buildRoomOccupants(rooms) {
  const byRoom = new Map();
  for (const r of rooms) byRoom.set(r.id, []);
  const heroMap = getHeroMetaMap();

  for (const pres of livePresence.values()) {
    const rid = pres.roomId || rooms[0]?.id;
    if (!rid || !byRoom.has(rid)) continue;
    const hMeta = heroMap.get(pres.userId) || { heroClass: 'hero_scholar', heroLevel: 1, companionSpriteKey: null };
    byRoom.get(rid).push({
      ...pres,
      heroClass: hMeta.heroClass,
      heroLevel: hMeta.heroLevel,
      companionSpriteKey: hMeta.companionSpriteKey,
      simulated: false,
    });
  }

  const syncTimer = getSyncedRoomTimer();
  const msgStmt = db.prepare(`
    SELECT id, room_id AS roomId, user_id AS userId, username, display_name AS displayName, avatar, content, created_at AS createdAt
    FROM room_messages
    WHERE room_id = ?
    ORDER BY created_at DESC
    LIMIT 20
  `);

  return rooms.map((r) => {
    const occupants = byRoom.get(r.id) || [];
    const raid = ensureRoomRaid(r.id);
    const messages = msgStmt.all(r.id).reverse();
    return {
      id: r.id,
      name: r.name,
      topic: r.topic,
      icon: r.icon,
      accent: r.accent,
      createdBy: r.created_by,
      occupants,
      activeCount: occupants.filter((o) => o.status === 'studying').length,
      totalCount: occupants.length,
      raid,
      syncTimer,
      messages,
    };
  });
}

function broadcast(payload) {
  const msg = JSON.stringify(payload);
  for (const ws of wsSockets) {
    if (ws.readyState === 1) ws.send(msg);
  }
}

function broadcastPresence() {
  const rooms = db.prepare('SELECT * FROM study_rooms ORDER BY id ASC').all();
  broadcast({ type: 'presence_snapshot', rooms: buildRoomOccupants(rooms) });
}

async function sendPushToUser(userId, payloadObj) {
  const subs = db.prepare('SELECT id, endpoint, subscription_json FROM push_subscriptions WHERE user_id = ?').all(userId);
  if (!subs.length) return 0;
  let sent = 0;
  const payloadStr = JSON.stringify(payloadObj);
  for (const row of subs) {
    try {
      await webpush.sendNotification(JSON.parse(row.subscription_json), payloadStr);
      sent += 1;
    } catch (err) {
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        db.prepare('DELETE FROM push_subscriptions WHERE id = ?').run(row.id);
      }
    }
  }
  return sent;
}

// Server-side lock-screen timer expiration scheduler (fires even when phone screen is locked / browser exited)
setInterval(() => {
  const now = Date.now();
  const due = db.prepare('SELECT * FROM scheduled_timers WHERE fired = 0 AND target_end_ms <= ?').all(now);
  if (!due.length) return;
  const markFired = db.prepare('UPDATE scheduled_timers SET fired = 1 WHERE user_id = ?');
  for (const row of due) {
    markFired.run(row.user_id);
    broadcast({
      type: 'timer_expired',
      userId: row.user_id,
      mode: row.mode,
      subjectName: row.subject_name,
      durationSec: row.duration_sec,
    });
    const mins = Math.max(1, Math.round(row.duration_sec / 60));
    const pushPayload =
      row.mode === 'break'
        ? {
            title: '☕ Break Over — Time to Lock In!',
            body: 'Your break is finished. Jump back into your next focus sprint!',
            tag: 'studypulse-break',
            data: { url: '/?tab=focus', mode: 'break' },
          }
        : {
            title: "⏰ Time's Up! Focus Block Complete",
            body: `${mins}m on ${row.subject_name} complete! Tap to claim your XP & Coins 🔥`,
            tag: 'studypulse-timer',
            data: { url: '/?tab=focus', mode: row.mode },
          };
    sendPushToUser(row.user_id, pushPayload).catch(() => {});
  }
}, 1000);

// Routes
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    onlineUsers: livePresence.size,
  });
});

app.post('/api/auth/register', (req, res) => {
  const usernameRaw = String(req.body?.username || '').trim().toLowerCase();
  const displayName = String(req.body?.displayName || '').trim() || usernameRaw;
  const password = String(req.body?.password || '');
  const avatar = String(req.body?.avatar || '🔥').slice(0, 8);
  const themeColor = /^#[0-9a-fA-F]{6}$/.test(req.body?.themeColor || '') ? req.body.themeColor : '#FAFAFA';

  if (!/^[a-z0-9_]{3,20}$/.test(usernameRaw)) {
    return res.status(400).json({ error: 'Username must be 3-20 characters (letters, numbers, underscore).' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(usernameRaw);
  if (existing) {
    return res.status(409).json({ error: 'Username is already taken. Please pick another.' });
  }

  const now = Date.now();
  const info = db.prepare(`
    INSERT INTO users (username, display_name, password_hash, avatar, theme_color, bio, title, xp, coins, streak_days, daily_goal_mins, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 120, ?)
  `).run(
    usernameRaw,
    displayName.slice(0, 32),
    hashPassword(password),
    avatar,
    themeColor,
    'Ready to lock in and chase focus goals.',
    'Rising Spark',
    now
  );

  const uid = Number(info.lastInsertRowid);
  createStarterSubjects(uid);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(uid);
  const token = signToken({ uid, username: user.username, exp: now + 30 * 86400_000 });
  res.status(201).json({ token, user: sanitizeUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const username = String(req.body?.username || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  const token = signToken({ uid: user.id, username: user.username, exp: Date.now() + 30 * 86400_000 });
  res.json({ token, user: sanitizeUser(user) });
});

function buildFullUser(userId) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return null;
  const userStats = getUserStudyStats(userId);
  const totalSec = userStats.total_sec || 0;
  return {
    ...sanitizeUser(user),
    todayMins: Math.round((userStats.today_sec || 0) / 60),
    weekMins: Math.round((userStats.week_sec || 0) / 60),
    totalMins: Math.round(totalSec / 60),
    sessionsCount: userStats.sessions_count || 0,
    avgPurity: Math.round(userStats.avg_purity || 100),
  };
}

function formatFlashcardRow(row) {
  const now = Date.now();
  return {
    id: row.id,
    cardKey: row.card_key || null,
    courseKey: row.course_key || 'custom',
    subjectName: row.subject_name,
    conceptTitle: row.concept_title || '',
    category: row.category || 'theory',
    difficulty: row.difficulty || 'exam',
    front: row.front,
    back: row.back,
    options: parseJsonSafeLocal(row.options_json, []),
    correctIndex: Number(row.correct_index || 0),
    easeFactor: Number(row.ease_factor || 2.5),
    intervalDays: Number(row.interval_days || 0),
    repetitions: Number(row.repetitions || 0),
    nextReviewAt: Number(row.next_review_at || 0),
    reviewCount: Number(row.review_count || 0),
    isDue: Number(row.next_review_at || 0) <= now,
  };
}

function buildAutoMcqOptions(userId, courseKey, answerText) {
  const correctClean = String(answerText).trim().slice(0, 125);
  const peers = db
    .prepare(
      `SELECT back FROM flashcards WHERE user_id = ? AND (course_key = ? OR ? = 'custom') AND length(back) > 8 ORDER BY RANDOM() LIMIT 24`
    )
    .all(userId, courseKey, courseKey);
  const distractors = [];
  for (const p of peers) {
    const candidate = String(p.back).split('.')[0].trim().slice(0, 125);
    if (
      candidate.length >= 6 &&
      candidate.toLowerCase() !== correctClean.toLowerCase() &&
      !distractors.some((d) => d.toLowerCase() === candidate.toLowerCase())
    ) {
      distractors.push(candidate);
      if (distractors.length >= 3) break;
    }
  }
  const fallbacks = [
    'None of the listed mechanisms apply here',
    'Occurs only during unprivileged Thread initialization',
    'Handled exclusively at the physical Layer 1 repeater',
  ];
  for (const fb of fallbacks) {
    if (distractors.length >= 3) break;
    if (fb.toLowerCase() !== correctClean.toLowerCase()) distractors.push(fb);
  }
  const pool = [correctClean, ...distractors.slice(0, 3)];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
  }
  return { options: pool, correctIndex: pool.indexOf(correctClean) };
}

function computeLeagueState(weekMins, weekBoard) {
  const tiers = [
    { tierKey: 'bronze', tierName: 'Bronze Desk', tierIcon: '🥉', minMins: 0 },
    { tierKey: 'silver', tierName: 'Silver Scholar', tierIcon: '🥈', minMins: 60 },
    { tierKey: 'gold', tierName: 'Gold Archivist', tierIcon: '🥇', minMins: 180 },
    { tierKey: 'obsidian', tierName: 'Obsidian Spire', tierIcon: '🔮', minMins: 420 },
    { tierKey: 'astral', tierName: 'Astral Grandmaster', tierIcon: '🌟', minMins: 900 },
  ];
  let idx = 0;
  for (let i = 0; i < tiers.length; i++) {
    if (weekMins >= tiers[i].minMins) idx = i;
  }
  const cur = tiers[idx];
  const nxt = tiers[idx + 1] || null;
  const selfIdx = weekBoard.findIndex((r) => r.isSelf);
  return {
    tierKey: cur.tierKey,
    tierName: cur.tierName,
    tierIcon: cur.tierIcon,
    minMins: cur.minMins,
    nextTierName: nxt ? nxt.tierName : null,
    nextTierMins: nxt ? nxt.minMins : null,
    weekMins,
    rankInLeague: selfIdx >= 0 ? selfIdx + 1 : 1,
  };
}

function buildDuelState(userId, weekMins, weekBoard, directory) {
  const now = Date.now();
  let duel = db
    .prepare('SELECT * FROM focus_duels WHERE user_id = ? ORDER BY id DESC LIMIT 1')
    .get(userId);
  if (!duel || (duel.claimed && now > duel.ends_at)) {
    const rival = directory[0] || { id: null, displayName: 'Elder Rowan', avatar: '🧙', weekMins: 25 };
    const startedAt = now;
    const endsAt = now + 7 * 86400_000;
    const info = db.prepare(`
      INSERT INTO focus_duels (user_id, opponent_id, opponent_name, opponent_avatar, target_mins, wager_coins, user_start_mins, opp_base_mins, started_at, ends_at, status, claimed)
      VALUES (?, ?, ?, ?, 60, 20, ?, ?, ?, ?, 'active', 0)
    `).run(userId, rival.id || null, rival.displayName || 'Elder Rowan', rival.avatar || '🧙', weekMins, rival.weekMins || 0, startedAt, endsAt);
    duel = db.prepare('SELECT * FROM focus_duels WHERE id = ?').get(Number(info.lastInsertRowid));
  }

  let oppLiveMins = 0;
  if (duel.opponent_id) {
    const oppBoard = weekBoard.find((r) => r.id === duel.opponent_id);
    oppLiveMins = Math.max(0, (oppBoard?.minutes || 0) - duel.opp_base_mins);
  } else {
    const daysElapsed = Math.max(0, (now - duel.started_at) / 86400_000);
    oppLiveMins = Math.min(duel.target_mins, Math.round(daysElapsed * 15));
  }
  const userMins = Math.max(0, weekMins - duel.user_start_mins);
  const status = duel.claimed
    ? 'claimed'
    : userMins >= duel.target_mins
      ? 'won'
      : now > duel.ends_at
        ? 'expired'
        : 'active';
  return {
    id: duel.id,
    opponentId: duel.opponent_id,
    opponentName: duel.opponent_name,
    opponentAvatar: duel.opponent_avatar,
    targetMins: duel.target_mins,
    wagerCoins: duel.wager_coins,
    userMins,
    opponentMins: oppLiveMins,
    startedAt: duel.started_at,
    endsAt: duel.ends_at,
    status,
    claimed: Boolean(duel.claimed),
  };
}

function buildBootstrap(userId) {
  ensureUniversitySeed(userId);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const todayStartMs = startOfToday.getTime();
  const weekStartMs = now - 7 * 86400_000;
  const prevWeekStartMs = now - 14 * 86400_000;

  const userStats = getUserStudyStats(userId);

  const subjects = db.prepare('SELECT id, name, color, icon FROM subjects WHERE user_id = ? ORDER BY id ASC').all(userId);
  const friendRows = db.prepare('SELECT friend_id FROM friendships WHERE user_id = ?').all(userId);
  const friendSet = new Set(friendRows.map((r) => r.friend_id));

  const allUsers = db.prepare('SELECT * FROM users ORDER BY xp DESC').all();
  const sessionsAll = db.prepare(`
    SELECT user_id, subject_name, subject_color, duration_sec, purity_pct, created_at
    FROM study_sessions
  `).all();

  // Compute leaderboards cleanly in JS using cached query
  const makeBoard = (sinceMs) => {
    const map = new Map();
    for (const u of allUsers) {
      map.set(u.id, {
        id: u.id,
        username: u.username,
        displayName: u.display_name,
        avatar: u.avatar,
        themeColor: u.theme_color,
        title: u.title,
        streakDays: u.streak_days,
        xp: u.xp,
        level: levelFromXp(u.xp).level,
        isFriend: friendSet.has(u.id),
        isSelf: u.id === userId,
        seconds: 0,
        sessions: 0,
        subjectSec: new Map(),
      });
    }
    for (const s of sessionsAll) {
      if (s.created_at < sinceMs) continue;
      const entry = map.get(s.user_id);
      if (!entry) continue;
      entry.seconds += s.duration_sec;
      entry.sessions += 1;
      entry.subjectSec.set(s.subject_name, (entry.subjectSec.get(s.subject_name) || 0) + s.duration_sec);
    }
    return [...map.values()]
      .sort((a, b) => b.seconds - a.seconds || b.xp - a.xp)
      .map((e, idx) => {
        let topSubject = 'General';
        let topSec = -1;
        for (const [k, v] of e.subjectSec.entries()) {
          if (v > topSec) {
            topSec = v;
            topSubject = k;
          }
        }
        return {
          rank: idx + 1,
          id: e.id,
          username: e.username,
          displayName: e.displayName,
          avatar: e.avatar,
          themeColor: e.themeColor,
          title: e.title,
          streakDays: e.streakDays,
          xp: e.xp,
          level: e.level,
          isFriend: e.isFriend,
          isSelf: e.isSelf,
          minutes: Math.round(e.seconds / 60),
          sessions: e.sessions,
          topSubject,
          subjectMinutes: Object.fromEntries(
            [...e.subjectSec.entries()].map(([k, v]) => [k, Math.round(v / 60)])
          ),
        };
      });
  };

  const todayBoard = makeBoard(todayStartMs);
  const weekBoard = makeBoard(weekStartMs);
  const allBoard = makeBoard(0);

  const weekMap = new Map(weekBoard.map((r) => [r.id, r]));
  const todayMap = new Map(todayBoard.map((r) => [r.id, r]));
  const directory = allUsers
    .filter((u) => u.id !== userId)
    .map((u) => ({
      id: u.id,
      username: u.username,
      displayName: u.display_name,
      avatar: u.avatar,
      themeColor: u.theme_color,
      bio: u.bio,
      title: u.title,
      xp: u.xp,
      level: levelFromXp(u.xp).level,
      streakDays: u.streak_days,
      isFriend: friendSet.has(u.id),
      todayMins: todayMap.get(u.id)?.minutes || 0,
      weekMins: weekMap.get(u.id)?.minutes || 0,
      isOnline: livePresence.has(u.id),
    }));

  // Rooms with live presence
  const rawRooms = db.prepare('SELECT * FROM study_rooms ORDER BY id ASC').all();
  const rooms = buildRoomOccupants(rawRooms);

  // Feed items (shared sessions)
  const feedRows = db.prepare(`
    SELECT s.*, u.username, u.display_name, u.avatar, u.theme_color, u.streak_days, u.xp
    FROM study_sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.shared_to_feed = 1
    ORDER BY s.created_at DESC
    LIMIT 35
  `).all();

  const reactRows = db.prepare('SELECT session_id, user_id, emoji FROM feed_reactions').all();
  const commentRows = db.prepare(`
    SELECT c.id, c.session_id, c.user_id, c.content, c.created_at, u.username, u.display_name, u.avatar
    FROM feed_comments c
    JOIN users u ON u.id = c.user_id
    ORDER BY c.created_at ASC
  `).all();

  const reactBySession = new Map();
  for (const r of reactRows) {
    if (!reactBySession.has(r.session_id)) reactBySession.set(r.session_id, []);
    reactBySession.get(r.session_id).push(r);
  }
  const commentsBySession = new Map();
  for (const c of commentRows) {
    if (!commentsBySession.has(c.session_id)) commentsBySession.set(c.session_id, []);
    commentsBySession.get(c.session_id).push({
      id: c.id,
      userId: c.user_id,
      username: c.username,
      displayName: c.display_name,
      avatar: c.avatar,
      content: c.content,
      createdAt: c.created_at,
    });
  }

  const EMOJIS = ['🔥', '👏', '🧠', '❤️'];
  const feed = feedRows.map((row) => {
    const rs = reactBySession.get(row.id) || [];
    const reactions = EMOJIS.map((emoji) => {
      const matching = rs.filter((x) => x.emoji === emoji);
      return {
        emoji,
        count: matching.length,
        reacted: matching.some((x) => x.user_id === userId),
      };
    });
    return {
      id: row.id,
      userId: row.user_id,
      username: row.username,
      displayName: row.display_name,
      avatar: row.avatar,
      themeColor: row.theme_color,
      streakDays: row.streak_days,
      level: levelFromXp(row.xp).level,
      isFriend: row.user_id === userId || friendSet.has(row.user_id),
      subjectName: row.subject_name,
      subjectColor: row.subject_color,
      mode: row.mode,
      durationSec: row.duration_sec,
      purityPct: row.purity_pct,
      xpEarned: row.xp_earned,
      note: row.note,
      createdAt: row.created_at,
      reactions,
      comments: commentsBySession.get(row.id) || [],
    };
  });

  // 365-day & 90-day heatmap, week-over-week delta, today timeline & 24h rhythm
  const mySessions = db
    .prepare('SELECT id, subject_name, subject_color, mode, duration_sec, purity_pct, note, created_at FROM study_sessions WHERE user_id = ? ORDER BY created_at ASC')
    .all(userId);
  const daySecMap = new Map();
  const dayCountMap = new Map();
  const subjMap = new Map();
  const hourSec = new Array(24).fill(0);
  let pureSessions = 0;
  let prevWeekSec = 0;
  const todayTimeline = [];

  for (const s of mySessions) {
    const dk = dateKeyUTC(s.created_at);
    daySecMap.set(dk, (daySecMap.get(dk) || 0) + s.duration_sec);
    dayCountMap.set(dk, (dayCountMap.get(dk) || 0) + 1);
    const hr = new Date(s.created_at).getHours();
    hourSec[hr] += s.duration_sec;
    const curSub = subjMap.get(s.subject_name) || { name: s.subject_name, color: s.subject_color, seconds: 0 };
    curSub.seconds += s.duration_sec;
    subjMap.set(s.subject_name, curSub);
    if (s.purity_pct >= 95 && s.duration_sec >= 300) pureSessions++;
    if (s.created_at >= prevWeekStartMs && s.created_at < weekStartMs) {
      prevWeekSec += s.duration_sec;
    }
    if (s.created_at >= todayStartMs) {
      todayTimeline.push({
        id: s.id,
        subjectName: s.subject_name,
        subjectColor: s.subject_color,
        mode: s.mode,
        durationSec: s.duration_sec,
        purityPct: s.purity_pct,
        note: s.note,
        createdAt: s.created_at,
      });
    }
  }

  const hourlyDistribution = hourSec.map((sec) => Math.round(sec / 60));
  let peakHour = 0;
  let peakMin = 0;
  for (let h = 0; h < 24; h++) {
    if (hourlyDistribution[h] > peakMin) {
      peakMin = hourlyDistribution[h];
      peakHour = h;
    }
  }
  const formatHour = (h) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? 'AM' : 'PM'}`;
  const peakWindowLabel =
    peakMin <= 0
      ? 'Flexible Scholar'
      : peakHour >= 5 && peakHour < 12
        ? `Early Bird (Peak ${formatHour(peakHour)})`
        : peakHour >= 12 && peakHour < 17
          ? `Afternoon Deep Work (Peak ${formatHour(peakHour)})`
          : peakHour >= 17 && peakHour < 21
            ? `Evening Sprinter (Peak ${formatHour(peakHour)})`
            : `Night Owl (Peak ${formatHour(peakHour)})`;

  const heatmap365 = [];
  for (let d = 364; d >= 0; d--) {
    const ts = now - d * 86400_000;
    const dk = dateKeyUTC(ts);
    heatmap365.push({
      date: dk,
      minutes: Math.round((daySecMap.get(dk) || 0) / 60),
      count: dayCountMap.get(dk) || 0,
    });
  }
  const heatmap = heatmap365.slice(-90);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekTrend = [];
  for (let d = 6; d >= 0; d--) {
    const dt = new Date(now - d * 86400_000);
    const dk = dt.toISOString().slice(0, 10);
    weekTrend.push({
      date: dk,
      label: d === 0 ? 'Today' : dayNames[dt.getUTCDay()],
      minutes: Math.round((daySecMap.get(dk) || 0) / 60),
    });
  }

  const totalSec = userStats.total_sec || 0;
  const subjectBreakdown = [...subjMap.values()]
    .sort((a, b) => b.seconds - a.seconds)
    .map((x) => ({
      name: x.name,
      color: x.color,
      minutes: Math.round(x.seconds / 60),
      pct: totalSec > 0 ? Math.max(1, Math.round((x.seconds / totalSec) * 100)) : 0,
    }));

  const totalHours = totalSec / 3600;
  const achievements = [
    { id: 'first', title: 'First Spark', desc: 'Complete your first focus session', icon: '✨', unlocked: userStats.sessions_count >= 1, progress: Math.min(1, userStats.sessions_count), target: 1 },
    { id: 'deep', title: 'Deep Diver', desc: 'Log a 45+ minute focus block', icon: '🌊', unlocked: mySessions.some((s) => s.duration_sec >= 2700), progress: mySessions.some((s) => s.duration_sec >= 2700) ? 1 : 0, target: 1 },
    { id: 'purity', title: 'Laser Lock', desc: '3 sessions with 95%+ Focus Purity', icon: '🛡️', unlocked: pureSessions >= 3, progress: Math.min(3, pureSessions), target: 3 },
    { id: 'streak3', title: '3-Day Flame', desc: 'Keep a 3-day study streak alive', icon: '🔥', unlocked: user.streak_days >= 3, progress: Math.min(3, user.streak_days), target: 3 },
    { id: 'streak7', title: 'Week Warrior', desc: 'Reach a 7-day consecutive streak', icon: '⚔️', unlocked: user.streak_days >= 7, progress: Math.min(7, user.streak_days), target: 7 },
    { id: 'social', title: 'Squad Builder', desc: 'Connect with 3 study friends', icon: '🤝', unlocked: friendSet.size >= 3, progress: Math.min(3, friendSet.size), target: 3 },
    { id: 'hours10', title: '10-Hour Club', desc: 'Accumulate 10+ total focus hours', icon: '⏳', unlocked: totalHours >= 10, progress: Math.min(10, Math.floor(totalHours)), target: 10 },
    { id: 'level5', title: 'Focus Nova', desc: 'Reach Scholar Level 5', icon: '🌟', unlocked: levelFromXp(user.xp).level >= 5, progress: Math.min(5, levelFromXp(user.xp).level), target: 5 },
  ];

  const taskRows = db
    .prepare('SELECT * FROM study_tasks WHERE user_id = ? ORDER BY done ASC, id DESC')
    .all(userId);
  const tasks = taskRows.map((t) => ({
    id: t.id,
    userId: t.user_id,
    title: t.title,
    subjectName: t.subject_name,
    targetPomos: t.target_pomos,
    completedPomos: t.completed_pomos,
    done: Boolean(t.done),
    createdAt: t.created_at,
  }));

  const gameProfileRaw = ensureGameProfile(db, userId);
  const shop = buildShopState(db, user, gameProfileRaw);
  const game = buildGameState(db, user, userStats);

  const flashcards = db
    .prepare('SELECT * FROM flashcards WHERE user_id = ? ORDER BY next_review_at ASC, id ASC')
    .all(userId)
    .map(formatFlashcardRow);
  const examGoals = db
    .prepare('SELECT id, course_key AS courseKey, subject_name AS subjectName, exam_title AS examTitle, exam_date AS examDate, target_hours AS targetHours, created_at AS createdAt FROM exam_goals WHERE user_id = ? ORDER BY exam_date ASC')
    .all(userId);
  const notes = db
    .prepare('SELECT id, subject_name AS subjectName, title, content_md AS contentMd, recall_prompts_json, updated_at AS updatedAt FROM study_notes WHERE user_id = ? ORDER BY updated_at DESC')
    .all(userId)
    .map((n) => ({
      id: n.id,
      subjectName: n.subjectName,
      title: n.title,
      contentMd: n.contentMd,
      recallPrompts: parseJsonSafeLocal(n.recall_prompts_json, []),
      updatedAt: n.updatedAt,
    }));

  const weekMins = Math.round((userStats.week_sec || 0) / 60);
  const league = computeLeagueState(weekMins, weekBoard);
  const activeDuel = buildDuelState(userId, weekMins, weekBoard, directory);

  return {
    user: {
      ...sanitizeUser(user),
      todayMins: Math.round((userStats.today_sec || 0) / 60),
      weekMins,
      totalMins: Math.round(totalSec / 60),
      sessionsCount: userStats.sessions_count || 0,
      avgPurity: Math.round(userStats.avg_purity || 100),
    },
    subjects,
    tasks,
    shopItems: shop.sections.permanent,
    shop,
    game,
    university: {
      portalUrl: UNIVERSITY_PORTAL_URL,
      courses: UNIVERSITY_COURSES,
      flashcards,
      dueCount: flashcards.filter((c) => c.isDue).length,
      examGoals,
      notes,
    },
    league,
    activeDuel,
    prevWeekMins: Math.round(prevWeekSec / 60),
    todayTimeline,
    vapidPublicKey: vapidKeys.publicKey,
    directory,
    leaderboards: {
      today: todayBoard,
      week: weekBoard,
      all: allBoard,
    },
    rooms,
    feed,
    heatmap,
    heatmap365,
    weekTrend,
    hourlyDistribution,
    peakWindowLabel,
    subjectBreakdown,
    achievements,
    onlineCount: rooms.reduce((acc, r) => acc + r.activeCount, 0),
  };
}

app.get('/api/bootstrap', authMiddleware, (req, res) => {
  res.json(buildBootstrap(req.user.id));
});

app.get('/api/push/vapid-public-key', (_req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

app.post('/api/push/subscribe', authMiddleware, (req, res) => {
  const sub = req.body?.subscription || req.body;
  const endpoint = String(sub?.endpoint || '');
  if (!endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return res.status(400).json({ error: 'Invalid push subscription object' });
  }
  const now = Date.now();
  db.prepare(`
    INSERT INTO push_subscriptions (user_id, endpoint, subscription_json, created_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(endpoint) DO UPDATE SET
      user_id = excluded.user_id,
      subscription_json = excluded.subscription_json,
      created_at = excluded.created_at
  `).run(req.user.id, endpoint, JSON.stringify(sub), now);
  res.status(201).json({ ok: true });
});

app.post('/api/push/test', authMiddleware, async (req, res) => {
  const sent = await sendPushToUser(req.user.id, {
    title: '🔔 StudyPulse Lock-Screen Alert Active!',
    body: "You'll get notified right on your lock screen the moment your timer finishes.",
    tag: 'studypulse-test',
    data: { url: '/' },
  });
  res.json({ ok: true, sent });
});

app.post('/api/timer/schedule', authMiddleware, (req, res) => {
  const targetEndMs = Number(req.body?.targetEndMs);
  const mode = String(req.body?.mode || 'pomodoro').slice(0, 20);
  const subjectName = String(req.body?.subjectName || 'Focus').slice(0, 40);
  const taskTitle = String(req.body?.taskTitle || '').slice(0, 100);
  const durationSec = Math.max(5, Math.min(43200, Math.round(Number(req.body?.durationSec || 1500))));
  if (!Number.isFinite(targetEndMs) || targetEndMs <= Date.now()) {
    return res.status(400).json({ error: 'Invalid targetEndMs timestamp' });
  }
  db.prepare(`
    INSERT INTO scheduled_timers (user_id, target_end_ms, mode, subject_name, task_title, duration_sec, fired)
    VALUES (?, ?, ?, ?, ?, ?, 0)
    ON CONFLICT(user_id) DO UPDATE SET
      target_end_ms = excluded.target_end_ms,
      mode = excluded.mode,
      subject_name = excluded.subject_name,
      task_title = excluded.task_title,
      duration_sec = excluded.duration_sec,
      fired = 0
  `).run(req.user.id, Math.round(targetEndMs), mode, subjectName, taskTitle, durationSec);
  res.json({ ok: true, targetEndMs: Math.round(targetEndMs) });
});

app.post('/api/timer/cancel', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM scheduled_timers WHERE user_id = ?').run(req.user.id);
  res.json({ ok: true });
});

app.post('/api/subjects', authMiddleware, (req, res) => {
  const name = String(req.body?.name || '').trim().slice(0, 32);
  const color = /^#[0-9a-fA-F]{6}$/.test(req.body?.color || '') ? req.body.color : '#FAFAFA';
  const icon = String(req.body?.icon || '📘').slice(0, 8);
  if (!name) return res.status(400).json({ error: 'Subject name is required' });

  const info = db.prepare('INSERT INTO subjects (user_id, name, color, icon) VALUES (?, ?, ?, ?)').run(req.user.id, name, color, icon);
  res.status(201).json({ id: Number(info.lastInsertRowid), name, color, icon });
});

app.delete('/api/subjects/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const count = db.prepare('SELECT COUNT(*) AS c FROM subjects WHERE user_id = ?').get(req.user.id).c;
  if (count <= 1) {
    return res.status(400).json({ error: 'Keep at least one active subject' });
  }
  const info = db.prepare('DELETE FROM subjects WHERE id = ? AND user_id = ?').run(id, req.user.id);
  if (!info.changes) return res.status(404).json({ error: 'Subject not found' });
  res.json({ ok: true });
});

app.post('/api/tasks', authMiddleware, (req, res) => {
  const title = String(req.body?.title || '').trim().slice(0, 100);
  const subjectName = String(req.body?.subjectName || 'Focus').trim().slice(0, 40);
  const targetPomos = Math.max(1, Math.min(8, Math.round(Number(req.body?.targetPomos || 1))));
  if (!title) return res.status(400).json({ error: 'Task title is required' });
  const now = Date.now();
  const info = db.prepare(
    'INSERT INTO study_tasks (user_id, title, subject_name, target_pomos, completed_pomos, done, rewarded, created_at) VALUES (?, ?, ?, ?, 0, 0, 0, ?)'
  ).run(req.user.id, title, subjectName, targetPomos, now);
  res.status(201).json({
    id: Number(info.lastInsertRowid),
    userId: req.user.id,
    title,
    subjectName,
    targetPomos,
    completedPomos: 0,
    done: false,
    createdAt: now,
  });
});

app.patch('/api/tasks/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM study_tasks WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Task not found' });

  const nextDone = req.body?.done !== undefined ? (req.body.done ? 1 : 0) : row.done;
  const nextCompleted =
    req.body?.completedPomos !== undefined
      ? Math.max(0, Math.min(20, Math.round(Number(req.body.completedPomos))))
      : row.completed_pomos;
  const nextTitle = req.body?.title !== undefined ? String(req.body.title).trim().slice(0, 100) || row.title : row.title;

  let bonusXp = 0;
  let bonusCoins = 0;
  let nextRewarded = row.rewarded;
  if (nextDone === 1 && !row.rewarded) {
    bonusXp = 15;
    bonusCoins = 3;
    nextRewarded = 1;
    db.prepare('UPDATE users SET xp = xp + ?, coins = coins + ? WHERE id = ?').run(bonusXp, bonusCoins, req.user.id);
    ensureGameProfile(db, req.user.id);
    db.prepare('UPDATE game_profiles SET energy = MIN(99, energy + 1), shards = shards + 8, updated_at = ? WHERE user_id = ?').run(Date.now(), req.user.id);
  }

  db.prepare('UPDATE study_tasks SET title = ?, done = ?, completed_pomos = ?, rewarded = ? WHERE id = ? AND user_id = ?').run(
    nextTitle,
    nextDone,
    nextCompleted,
    nextRewarded,
    id,
    req.user.id
  );
  const updated = db.prepare('SELECT * FROM study_tasks WHERE id = ?').get(id);
  res.json({
    task: {
      id: updated.id,
      userId: updated.user_id,
      title: updated.title,
      subjectName: updated.subject_name,
      targetPomos: updated.target_pomos,
      completedPomos: updated.completed_pomos,
      done: Boolean(updated.done),
      createdAt: updated.created_at,
    },
    bonusXp,
    bonusCoins,
  });
});

app.delete('/api/tasks/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM study_tasks WHERE id = ? AND user_id = ?').run(id, req.user.id);
  res.json({ ok: true });
});

app.post('/api/shop/buy', authMiddleware, (req, res) => {
  try {
    const itemKey = String(req.body?.itemKey || '').trim();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const result = purchaseShopItem(db, user, getUserStudyStats(req.user.id), itemKey);
    res.json({ ...result, user: buildFullUser(req.user.id) });
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message || 'Purchase failed' });
  }
});

app.post('/api/shop/reroll-daily', authMiddleware, (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const result = rerollDailyShop(db, user, getUserStudyStats(req.user.id));
    res.json({ ...result, user: buildFullUser(req.user.id) });
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message || 'Reroll failed' });
  }
});

app.get('/api/game/state', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({
    game: buildGameState(db, user, getUserStudyStats(req.user.id)),
    user: buildFullUser(req.user.id),
  });
});

function withGameHandler(fn) {
  return (req, res) => {
    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
      const userStats = getUserStudyStats(req.user.id);
      const result = fn(req, user, userStats);
      const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
      const gameProfileRaw = ensureGameProfile(db, req.user.id);
      res.json({
        ...result,
        user: buildFullUser(req.user.id),
        shop: buildShopState(db, refreshedUser, gameProfileRaw),
      });
    } catch (err) {
      res.status(err.status || 400).json({ error: err.message || 'Game action failed' });
    }
  };
}

app.post('/api/game/explore', authMiddleware, withGameHandler((_req, user, stats) => exploreRoom(db, user, stats)));
app.post('/api/game/combat', authMiddleware, withGameHandler((req, user, stats) => resolveCombatAction(db, user, stats, String(req.body?.action || ''))));
app.post('/api/game/choice', authMiddleware, withGameHandler((req, user, stats) => resolveEventChoice(db, user, stats, String(req.body?.choice || ''))));
app.post('/api/game/equip', authMiddleware, withGameHandler((req, user, stats) => equipGameItem(db, user, stats, Number(req.body?.itemId))));
app.post('/api/game/upgrade-item', authMiddleware, withGameHandler((req, user, stats) => upgradeGameItem(db, user, stats, Number(req.body?.itemId))));
app.post('/api/game/salvage', authMiddleware, withGameHandler((req, user, stats) => salvageGameItem(db, user, stats, { itemId: Number(req.body?.itemId), maxRarity: req.body?.maxRarity })));
app.post('/api/game/upgrade-stat', authMiddleware, withGameHandler((req, user, stats) => upgradeHeroStat(db, user, stats, String(req.body?.stat || ''))));
app.post('/api/game/camp-rest', authMiddleware, withGameHandler((_req, user, stats) => restAtCamp(db, user, stats)));
app.post('/api/game/floor-select', authMiddleware, withGameHandler((req, user, stats) => selectFloor(db, user, stats, Number(req.body?.floor))));
app.post('/api/game/village/move', authMiddleware, withGameHandler((req, user, stats) => moveInVillage(db, user, stats, Number(req.body?.dx || 0), Number(req.body?.dy || 0))));
app.post('/api/game/npc/talk', authMiddleware, withGameHandler((req, user, stats) => talkToNpc(db, user, stats, String(req.body?.npcId || ''), req.body?.choiceId ? String(req.body.choiceId) : undefined)));
app.post('/api/game/npc/craft', authMiddleware, withGameHandler((req, user, stats) => craftAtNpc(db, user, stats, String(req.body?.craftKey || ''), req.body?.targetItemId ? Number(req.body.targetItemId) : undefined)));
app.post('/api/game/dungeon/enter', authMiddleware, withGameHandler((req, user, stats) => enterDungeon(db, user, stats, req.body?.floor ? Number(req.body.floor) : undefined)));
app.post('/api/game/dungeon/move', authMiddleware, withGameHandler((req, user, stats) => dungeonMove(db, user, stats, Number(req.body?.dx || 0), Number(req.body?.dy || 0))));
app.post('/api/game/dungeon/search', authMiddleware, withGameHandler((_req, user, stats) => dungeonSearch(db, user, stats)));
app.post('/api/game/dungeon/torch', authMiddleware, withGameHandler((_req, user, stats) => dungeonUseTorch(db, user, stats)));
app.post('/api/game/dungeon/extract', authMiddleware, withGameHandler((_req, user, stats) => dungeonExtract(db, user, stats)));
app.post('/api/game/dungeon/puzzle', authMiddleware, withGameHandler((req, user, stats) => resolvePuzzleChoice(db, user, stats, Number(req.body?.optionIndex ?? -1))));
app.post('/api/game/specialization', authMiddleware, withGameHandler((req, user, stats) => selectSpecialization(db, user, stats, String(req.body?.specKey || ''))));
app.post('/api/game/study-cast', authMiddleware, withGameHandler((req, user, stats) => resolveStudyCast(db, user, stats, {
  cardId: Number(req.body?.cardId),
  selectedIndex: req.body?.selectedIndex !== undefined ? Number(req.body.selectedIndex) : undefined,
  grade: req.body?.grade !== undefined ? Number(req.body.grade) : undefined,
})));
app.post('/api/game/party', authMiddleware, withGameHandler((req, user, stats) => managePartyAlly(db, user, stats, {
  allyId: String(req.body?.allyId || ''),
})));
app.post('/api/game/side-story', authMiddleware, withGameHandler((req, user, stats) => advanceMythicSideStory(db, user, stats, {
  storyId: String(req.body?.storyId || ''),
  choiceId: String(req.body?.choiceId || ''),
})));
app.post('/api/game/deed', authMiddleware, withGameHandler((req, user, stats) => claimHeroicDeed(db, user, stats, {
  deedId: String(req.body?.deedId || ''),
})));
app.post('/api/game/trial', authMiddleware, withGameHandler((_req, user, stats) => startVanguardTrial(db, user, stats)));
app.post('/api/game/idle/tick', authMiddleware, withGameHandler((req, user, stats) => processIdleWaveTick(db, user, stats, {
  wavesCleared: req.body?.wavesCleared !== undefined ? Number(req.body.wavesCleared) : 1,
  timerRunning: Boolean(req.body?.timerRunning),
  triggerUltimate: Boolean(req.body?.triggerUltimate),
})));
app.post('/api/game/idle/claim-afk', authMiddleware, withGameHandler((_req, user, stats) => claimIdleAfkChest(db, user, stats)));
app.post('/api/game/idle/config', authMiddleware, withGameHandler((req, user, stats) => updateIdleConfig(db, user, stats, req.body || {})));
app.post('/api/game/idle/upgrade-profession', authMiddleware, withGameHandler((req, user, stats) => upgradeIdleProfession(db, user, stats, {
  professionId: String(req.body?.professionId || ''),
})));
app.post('/api/game/idle/ascend', authMiddleware, withGameHandler((_req, user, stats) => performIdleAscension(db, user, stats)));
app.post('/api/game/idle/upgrade-relic', authMiddleware, withGameHandler((req, user, stats) => upgradeAscensionRelic(db, user, stats, {
  relicId: String(req.body?.relicId || ''),
})));
app.post('/api/game/idle/forge-mythic', authMiddleware, withGameHandler((req, user, stats) => claimIdleMythicMilestone(db, user, stats, {
  milestoneId: String(req.body?.milestoneId || ''),
})));

app.post('/api/university/sync-subjects', authMiddleware, (req, res) => {
  ensureUniversitySeed(req.user.id);
  const existing = db.prepare('SELECT name FROM subjects WHERE user_id = ?').all(req.user.id);
  const names = new Set(existing.map((s) => s.name.toLowerCase()));
  const ins = db.prepare('INSERT INTO subjects (user_id, name, color, icon) VALUES (?, ?, ?, ?)');
  let added = 0;
  for (const c of UNIVERSITY_COURSES) {
    if (!names.has(c.name.toLowerCase())) {
      ins.run(req.user.id, c.name, c.color, c.icon);
      added++;
    }
  }
  const subjects = db.prepare('SELECT id, name, color, icon FROM subjects WHERE user_id = ? ORDER BY id ASC').all(req.user.id);
  res.json({ ok: true, added, subjects });
});

app.post('/api/university/flashcards', authMiddleware, (req, res) => {
  const now = Date.now();
  const markdownText = String(req.body?.markdownText || '').trim();
  const courseKey = String(req.body?.courseKey || 'custom').slice(0, 32);
  const subjectName = String(req.body?.subjectName || 'General').trim().slice(0, 50);
  const conceptTitle = String(req.body?.conceptTitle || 'Custom Note').trim().slice(0, 60);
  const category = ['theory', 'trace', 'numeric'].includes(req.body?.category) ? req.body.category : 'theory';
  const difficulty = ['core', 'exam', 'lab'].includes(req.body?.difficulty) ? req.body.difficulty : 'exam';

  const ins = db.prepare(`
    INSERT INTO flashcards (user_id, card_key, course_key, subject_name, concept_title, category, difficulty, front, back, options_json, correct_index, ease_factor, interval_days, repetitions, next_review_at, review_count, created_at)
    VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, 2.5, 0, 0, ?, 0, ?)
  `);

  const created = [];
  if (markdownText) {
    const lines = markdownText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const clean = line.replace(/^[-*]\s*/, '');
      const parts = clean.includes('::') ? clean.split('::') : clean.includes('->') ? clean.split('->') : null;
      if (parts && parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
        const backText = parts[1].trim().slice(0, 500);
        const auto = buildAutoMcqOptions(req.user.id, courseKey, backText);
        const info = ins.run(
          req.user.id,
          courseKey,
          subjectName,
          conceptTitle,
          category,
          difficulty,
          parts[0].trim().slice(0, 240),
          backText,
          JSON.stringify(auto.options),
          auto.correctIndex,
          now,
          now
        );
        created.push(formatFlashcardRow(db.prepare('SELECT * FROM flashcards WHERE id = ?').get(Number(info.lastInsertRowid))));
      }
    }
  } else {
    const front = String(req.body?.front || '').trim().slice(0, 280);
    const back = String(req.body?.back || '').trim().slice(0, 600);
    if (!front || !back) return res.status(400).json({ error: 'Card front and back are required' });
    let options = Array.isArray(req.body?.options)
      ? req.body.options.map((x) => String(x).trim().slice(0, 140)).filter(Boolean)
      : [];
    let correctIndex = Math.max(0, Math.min(Math.max(0, options.length - 1), Number(req.body?.correctIndex || 0)));
    if (options.length < 2) {
      const auto = buildAutoMcqOptions(req.user.id, courseKey, back);
      options = auto.options;
      correctIndex = auto.correctIndex;
    }
    const info = ins.run(
      req.user.id,
      courseKey,
      subjectName,
      conceptTitle,
      category,
      difficulty,
      front,
      back,
      JSON.stringify(options),
      correctIndex,
      now,
      now
    );
    created.push(formatFlashcardRow(db.prepare('SELECT * FROM flashcards WHERE id = ?').get(Number(info.lastInsertRowid))));
  }
  const flashcards = db.prepare('SELECT * FROM flashcards WHERE user_id = ? ORDER BY next_review_at ASC, id ASC').all(req.user.id).map(formatFlashcardRow);
  res.status(201).json({ ok: true, created, flashcards });
});

app.post('/api/university/exam-complete', authMiddleware, (req, res) => {
  const results = Array.isArray(req.body?.results) ? req.body.results.slice(0, 60) : [];
  if (results.length === 0) return res.status(400).json({ error: 'Exam results are required' });

  let correctCount = 0;
  const updCard = db.prepare(`
    UPDATE flashcards SET ease_factor = ?, interval_days = ?, repetitions = ?, next_review_at = ?, review_count = ?
    WHERE id = ? AND user_id = ?
  `);
  const getCard = db.prepare('SELECT * FROM flashcards WHERE id = ? AND user_id = ?');

  const tx = db.transaction(() => {
    for (const r of results) {
      const card = getCard.get(Number(r.cardId), req.user.id);
      if (!card) continue;
      const isCorrect = Boolean(r.isCorrect);
      if (isCorrect) correctCount++;
      const sm2 = gradeFlashcardSm2(card, isCorrect ? 4 : 1);
      updCard.run(sm2.easeFactor, sm2.intervalDays, sm2.repetitions, sm2.nextReviewAt, sm2.reviewCount, card.id, req.user.id);
    }
  });
  tx();

  const totalCount = results.length;
  const scorePct = Math.round((correctCount / Math.max(1, totalCount)) * 100);
  const xpEarned = correctCount * 12 + (scorePct >= 80 ? 40 : 15);
  const coinsEarned = correctCount * 3 + (scorePct >= 80 ? 15 : 5);
  const shardsEarned = correctCount * 4;

  db.prepare('UPDATE users SET xp = xp + ?, coins = coins + ? WHERE id = ?').run(xpEarned, coinsEarned, req.user.id);
  ensureGameProfile(db, req.user.id);
  db.prepare('UPDATE game_profiles SET shards = shards + ?, focus_charge = MIN(100, focus_charge + 15), updated_at = ? WHERE user_id = ?').run(
    shardsEarned,
    Date.now(),
    req.user.id
  );

  const flashcards = db.prepare('SELECT * FROM flashcards WHERE user_id = ? ORDER BY next_review_at ASC, id ASC').all(req.user.id).map(formatFlashcardRow);
  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({
    ok: true,
    correctCount,
    totalCount,
    scorePct,
    xpEarned,
    coinsEarned,
    shardsEarned,
    flashcards,
    user: buildFullUser(req.user.id),
    game: buildGameState(db, updatedUser, getUserStudyStats(req.user.id)),
  });
});

app.post('/api/university/review', authMiddleware, (req, res) => {
  const cardId = Number(req.body?.cardId);
  const grade = Number(req.body?.grade ?? 3);
  const selectedIndex = req.body?.selectedIndex !== undefined ? Number(req.body.selectedIndex) : undefined;
  const card = db.prepare('SELECT * FROM flashcards WHERE id = ? AND user_id = ?').get(cardId, req.user.id);
  if (!card) return res.status(404).json({ error: 'Flashcard not found' });

  const options = parseJsonSafeLocal(card.options_json, []);
  const hasMcq = Array.isArray(options) && options.length > 0 && selectedIndex !== undefined;
  const isCorrect = hasMcq ? selectedIndex === Number(card.correct_index) : grade >= 2;
  const effQuality = req.body?.grade !== undefined ? grade : isCorrect ? 3 : 1;
  const sm2 = gradeFlashcardSm2(card, effQuality);

  db.prepare(`
    UPDATE flashcards SET ease_factor = ?, interval_days = ?, repetitions = ?, next_review_at = ?, review_count = ?
    WHERE id = ? AND user_id = ?
  `).run(sm2.easeFactor, sm2.intervalDays, sm2.repetitions, sm2.nextReviewAt, sm2.reviewCount, card.id, req.user.id);

  const xpGain = isCorrect ? 10 : 4;
  const coinsGain = isCorrect ? 2 : 0;
  db.prepare('UPDATE users SET xp = xp + ?, coins = coins + ? WHERE id = ?').run(xpGain, coinsGain, req.user.id);
  ensureGameProfile(db, req.user.id);
  db.prepare('UPDATE game_profiles SET shards = shards + ?, focus_charge = MIN(100, focus_charge + 6), updated_at = ? WHERE user_id = ?').run(
    isCorrect ? 5 : 2,
    Date.now(),
    req.user.id
  );

  const updatedCard = formatFlashcardRow(db.prepare('SELECT * FROM flashcards WHERE id = ?').get(card.id));
  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({
    ok: true,
    isCorrect,
    xpGain,
    coinsGain,
    flashcard: updatedCard,
    user: buildFullUser(req.user.id),
    game: buildGameState(db, updatedUser, getUserStudyStats(req.user.id)),
  });
});

app.post('/api/university/notes', authMiddleware, (req, res) => {
  const id = req.body?.id ? Number(req.body.id) : null;
  const subjectName = String(req.body?.subjectName || 'Study Session').trim().slice(0, 60);
  const title = String(req.body?.title || '').trim().slice(0, 120);
  const contentMd = String(req.body?.contentMd || '').trim().slice(0, 4000);
  const recallPrompts = Array.isArray(req.body?.recallPrompts) ? req.body.recallPrompts.slice(0, 10) : [];
  if (!title || !contentMd) return res.status(400).json({ error: 'Note title and Markdown content are required' });

  const now = Date.now();
  let savedId = id;
  if (id) {
    const own = db.prepare('SELECT id FROM study_notes WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!own) return res.status(404).json({ error: 'Note not found' });
    db.prepare('UPDATE study_notes SET subject_name = ?, title = ?, content_md = ?, recall_prompts_json = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(
      subjectName,
      title,
      contentMd,
      JSON.stringify(recallPrompts),
      now,
      id,
      req.user.id
    );
  } else {
    const info = db.prepare('INSERT INTO study_notes (user_id, subject_name, title, content_md, recall_prompts_json, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(
      req.user.id,
      subjectName,
      title,
      contentMd,
      JSON.stringify(recallPrompts),
      now
    );
    savedId = Number(info.lastInsertRowid);
  }
  const notes = db.prepare('SELECT id, subject_name AS subjectName, title, content_md AS contentMd, recall_prompts_json, updated_at AS updatedAt FROM study_notes WHERE user_id = ? ORDER BY updated_at DESC').all(req.user.id).map((n) => ({
    ...n,
    recallPrompts: parseJsonSafeLocal(n.recall_prompts_json, []),
  }));
  res.json({ ok: true, id: savedId, notes });
});

app.delete('/api/university/notes/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM study_notes WHERE id = ? AND user_id = ?').run(Number(req.params.id), req.user.id);
  res.json({ ok: true });
});

app.post('/api/university/exams', authMiddleware, (req, res) => {
  const id = req.body?.id ? Number(req.body.id) : null;
  const courseKey = String(req.body?.courseKey || 'custom').slice(0, 32);
  const subjectName = String(req.body?.subjectName || 'Focus').trim().slice(0, 60);
  const examTitle = String(req.body?.examTitle || `${subjectName} Exam`).trim().slice(0, 80);
  const examDate = String(req.body?.examDate || '2027-01-30').slice(0, 12);
  const targetHours = Math.max(2, Math.min(300, Math.round(Number(req.body?.targetHours || 40))));

  if (id) {
    db.prepare('UPDATE exam_goals SET subject_name = ?, exam_title = ?, exam_date = ?, target_hours = ? WHERE id = ? AND user_id = ?').run(
      subjectName,
      examTitle,
      examDate,
      targetHours,
      id,
      req.user.id
    );
  } else {
    db.prepare('INSERT INTO exam_goals (user_id, course_key, subject_name, exam_title, exam_date, target_hours, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      req.user.id,
      courseKey,
      subjectName,
      examTitle,
      examDate,
      targetHours,
      Date.now()
    );
  }
  const examGoals = db.prepare('SELECT id, course_key AS courseKey, subject_name AS subjectName, exam_title AS examTitle, exam_date AS examDate, target_hours AS targetHours, created_at AS createdAt FROM exam_goals WHERE user_id = ? ORDER BY exam_date ASC').all(req.user.id);
  res.json({ ok: true, examGoals });
});

app.post('/api/sessions', authMiddleware, (req, res) => {
  const subjectName = String(req.body?.subjectName || 'Focus Block').trim().slice(0, 40);
  const subjectColor = /^#[0-9a-fA-F]{6}$/.test(req.body?.subjectColor || '') ? req.body.subjectColor : '#10B981';
  const mode = String(req.body?.mode || 'pomodoro').slice(0, 20);
  const durationSec = Math.max(5, Math.min(43200, Math.round(Number(req.body?.durationSec || 0))));
  const purityPct = Math.max(10, Math.min(100, Math.round(Number(req.body?.purityPct ?? 100))));
  const strictMode = Boolean(req.body?.strictMode);
  const taskId = Number(req.body?.taskId || 0) || null;
  const note = String(req.body?.note || '').trim().slice(0, 280);
  const shareToFeed = req.body?.shareToFeed === false ? 0 : 1;

  const mins = Math.max(1, Math.round(durationSec / 60));
  const purityBonus = purityPct >= 95 ? 35 : purityPct >= 80 ? 15 : 0;
  const baseXp = Math.max(20, mins * 12 + purityBonus);
  const xpEarned = strictMode && purityPct >= 95 ? Math.round(baseXp * 1.25) : baseXp;
  const baseCoins = Math.max(5, Math.round(xpEarned / 10));
  const requestedWager = [0, 15, 30].includes(Number(req.body?.wagerCoins || 0)) ? Number(req.body?.wagerCoins || 0) : 0;
  const activeWager = requestedWager > 0 && req.user.coins >= requestedWager ? requestedWager : 0;
  let wagerOutcome = 'none';
  let coinsDelta = baseCoins;
  if (activeWager > 0) {
    if (purityPct >= 90 && durationSec >= 300) {
      coinsDelta += activeWager;
      wagerOutcome = 'won';
    } else if (purityPct < 80) {
      coinsDelta = Math.max(-req.user.coins, baseCoins - activeWager);
      wagerOutcome = 'lost';
    }
  }
  const coinsEarned = Math.max(0, coinsDelta);

  const now = Date.now();
  const todayStr = dateKeyUTC(now);
  const yesterdayStr = dateKeyUTC(now - 86400_000);

  let nextStreak = req.user.streak_days || 0;
  let nextFreezes = req.user.streak_freezes ?? 0;
  let usedFreeze = false;

  if (!req.user.last_study_date) {
    nextStreak = 1;
  } else if (req.user.last_study_date === todayStr) {
    nextStreak = Math.max(1, nextStreak);
  } else if (req.user.last_study_date === yesterdayStr) {
    nextStreak += 1;
  } else if (nextFreezes > 0 && nextStreak > 0) {
    nextFreezes -= 1;
    nextStreak += 1;
    usedFreeze = true;
  } else {
    nextStreak = 1;
  }

  const info = db.prepare(`
    INSERT INTO study_sessions (user_id, subject_name, subject_color, mode, duration_sec, purity_pct, xp_earned, note, shared_to_feed, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, subjectName, subjectColor, mode, durationSec, purityPct, xpEarned, note, shareToFeed, now);

  db.prepare(`
    UPDATE users SET xp = xp + ?, coins = MAX(0, coins + ?), streak_days = ?, last_study_date = ?, streak_freezes = ? WHERE id = ?
  `).run(xpEarned, coinsDelta, nextStreak, todayStr, nextFreezes, req.user.id);

  if (wagerOutcome === 'won') {
    ensureGameProfile(db, req.user.id);
    db.prepare('UPDATE game_profiles SET shards = shards + 15 WHERE user_id = ?').run(req.user.id);
  }

  const activeRoomId = livePresence.get(req.user.id)?.roomId || Number(req.body?.roomId || 0) || db.prepare('SELECT id FROM study_rooms ORDER BY id ASC LIMIT 1').get()?.id;
  let raidDamageDealt = 0;
  if (activeRoomId) {
    raidDamageDealt = mins * 15 + (purityPct >= 95 ? 25 : 0);
    applyRaidDamageToRoom(activeRoomId, req.user, raidDamageDealt);
    broadcastPresence();
  }

  if (taskId) {
    db.prepare('UPDATE study_tasks SET completed_pomos = completed_pomos + 1 WHERE id = ? AND user_id = ?').run(taskId, req.user.id);
  }
  db.prepare('DELETE FROM scheduled_timers WHERE user_id = ?').run(req.user.id);

  const session = db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(Number(info.lastInsertRowid));
  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const gameRewards = grantStudyRewardsToGame(
    db,
    updatedUser,
    getUserStudyStats(req.user.id),
    durationSec,
    purityPct,
    strictMode
  );

  broadcast({
    type: 'session_completed',
    userId: req.user.id,
    displayName: req.user.display_name,
    subjectName,
    durationSec,
    xpEarned,
  });

  res.status(201).json({
    session,
    xpEarned,
    coinsEarned,
    wagerOutcome,
    raidDamageDealt,
    newStreak: nextStreak,
    usedFreeze,
    gameRewards,
  });
});

app.post('/api/friends/toggle', authMiddleware, (req, res) => {
  const friendId = Number(req.body?.friendId);
  if (!friendId || friendId === req.user.id) return res.status(400).json({ error: 'Invalid friend ID' });
  const target = db.prepare('SELECT id, display_name FROM users WHERE id = ?').get(friendId);
  if (!target) return res.status(404).json({ error: 'User not found' });

  const exists = db.prepare('SELECT 1 FROM friendships WHERE user_id = ? AND friend_id = ?').get(req.user.id, friendId);
  if (exists) {
    db.prepare('DELETE FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)').run(req.user.id, friendId, friendId, req.user.id);
    return res.json({ isFriend: false });
  } else {
    const now = Date.now();
    db.prepare('INSERT OR IGNORE INTO friendships (user_id, friend_id, created_at) VALUES (?, ?, ?)').run(req.user.id, friendId, now);
    db.prepare('INSERT OR IGNORE INTO friendships (user_id, friend_id, created_at) VALUES (?, ?, ?)').run(friendId, req.user.id, now);
    return res.json({ isFriend: true });
  }
});

app.post('/api/friends/nudge', authMiddleware, (req, res) => {
  const friendId = Number(req.body?.friendId);
  const target = db.prepare('SELECT id, display_name FROM users WHERE id = ?').get(friendId);
  if (!target) return res.status(404).json({ error: 'User not found' });

  broadcast({
    type: 'nudge',
    fromUserId: req.user.id,
    fromDisplayName: req.user.display_name,
    fromAvatar: req.user.avatar,
    toUserId: target.id,
  });
  res.json({ ok: true, targetDisplayName: target.display_name });
});

app.post('/api/feed/:id/react', authMiddleware, (req, res) => {
  const sessionId = Number(req.params.id);
  const emoji = String(req.body?.emoji || '🔥').slice(0, 8);
  const session = db.prepare('SELECT id FROM study_sessions WHERE id = ?').get(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const exists = db.prepare('SELECT 1 FROM feed_reactions WHERE session_id = ? AND user_id = ? AND emoji = ?').get(sessionId, req.user.id, emoji);
  if (exists) {
    db.prepare('DELETE FROM feed_reactions WHERE session_id = ? AND user_id = ? AND emoji = ?').run(sessionId, req.user.id, emoji);
    return res.json({ reacted: false });
  } else {
    db.prepare('INSERT INTO feed_reactions (session_id, user_id, emoji, created_at) VALUES (?, ?, ?, ?)').run(sessionId, req.user.id, emoji, Date.now());
    return res.json({ reacted: true });
  }
});

app.post('/api/feed/:id/comment', authMiddleware, (req, res) => {
  const sessionId = Number(req.params.id);
  const content = String(req.body?.content || '').trim().slice(0, 280);
  if (!content) return res.status(400).json({ error: 'Comment cannot be empty' });
  const session = db.prepare('SELECT id FROM study_sessions WHERE id = ?').get(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const now = Date.now();
  const info = db.prepare('INSERT INTO feed_comments (session_id, user_id, content, created_at) VALUES (?, ?, ?, ?)').run(sessionId, req.user.id, content, now);
  res.status(201).json({
    id: Number(info.lastInsertRowid),
    userId: req.user.id,
    username: req.user.username,
    displayName: req.user.display_name,
    avatar: req.user.avatar,
    content,
    createdAt: now,
  });
});

app.post('/api/rooms', authMiddleware, (req, res) => {
  const name = String(req.body?.name || '').trim().slice(0, 42);
  const topic = String(req.body?.topic || 'Open co-study room').trim().slice(0, 60);
  const icon = String(req.body?.icon || '✨').slice(0, 8);
  const accent = /^#[0-9a-fA-F]{6}$/.test(req.body?.accent || '') ? req.body.accent : '#10B981';
  if (!name) return res.status(400).json({ error: 'Room name required' });

  const info = db.prepare('INSERT INTO study_rooms (name, topic, icon, accent, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    name,
    topic,
    icon,
    accent,
    req.user.id,
    Date.now()
  );
  broadcastPresence();
  res.status(201).json({ id: Number(info.lastInsertRowid), name, topic, icon, accent });
});

app.delete('/api/rooms/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const room = db.prepare('SELECT * FROM study_rooms WHERE id = ?').get(id);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const count = db.prepare('SELECT COUNT(*) AS c FROM study_rooms').get().c;
  if (count <= 1) {
    return res.status(400).json({ error: 'Keep at least one active study room' });
  }

  db.prepare('DELETE FROM study_rooms WHERE id = ?').run(id);
  const fallbackRoom = db.prepare('SELECT id FROM study_rooms ORDER BY id ASC LIMIT 1').get();
  const fallbackRoomId = fallbackRoom?.id || 1;

  for (const [uid, pres] of livePresence.entries()) {
    if (pres.roomId === id) {
      livePresence.set(uid, { ...pres, roomId: fallbackRoomId });
    }
  }
  broadcastPresence();
  res.json({ ok: true, deletedId: id, fallbackRoomId });
});

app.post('/api/rooms/:id/chat', authMiddleware, (req, res) => {
  const roomId = Number(req.params.id);
  const room = db.prepare('SELECT id FROM study_rooms WHERE id = ?').get(roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  const content = String(req.body?.content || '').trim().slice(0, 240);
  if (!content) return res.status(400).json({ error: 'Message cannot be empty' });

  const now = Date.now();
  const info = db.prepare(`
    INSERT INTO room_messages (room_id, user_id, username, display_name, avatar, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(roomId, req.user.id, req.user.username, req.user.display_name, req.user.avatar, content, now);

  const msg = {
    id: Number(info.lastInsertRowid),
    roomId,
    userId: req.user.id,
    username: req.user.username,
    displayName: req.user.display_name,
    avatar: req.user.avatar,
    content,
    createdAt: now,
  };
  broadcastPresence();
  res.status(201).json({ ok: true, message: msg });
});

app.post('/api/rooms/:id/raid-strike', authMiddleware, (req, res) => {
  const roomId = Number(req.params.id);
  const room = db.prepare('SELECT id FROM study_rooms WHERE id = ?').get(roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const gp = ensureGameProfile(db, req.user.id);
  if ((gp.energy || 0) < 1) {
    return res.status(400).json({ error: 'Need at least 1 ⚡ Energy to launch a Raid Strike!' });
  }
  const st = buildGameState(db, req.user, getUserStudyStats(req.user.id));
  const dmg = Math.max(25, Math.round(st.heroStats.atk * 3));
  db.prepare('UPDATE game_profiles SET energy = energy - 1, shards = shards + 8, updated_at = ? WHERE user_id = ?').run(
    Date.now(),
    req.user.id
  );
  db.prepare('UPDATE users SET xp = xp + 15 WHERE id = ?').run(req.user.id);
  const raid = applyRaidDamageToRoom(roomId, req.user, dmg);
  broadcastPresence();
  const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({
    ok: true,
    dmg,
    raid,
    user: buildFullUser(req.user.id),
    game: buildGameState(db, refreshedUser, getUserStudyStats(req.user.id)),
  });
});

app.post('/api/compete/duel', authMiddleware, (req, res) => {
  const action = String(req.body?.action || 'create');
  const now = Date.now();
  const weekStartMs = now - 7 * 86400_000;
  const weekSec = db.prepare('SELECT COALESCE(SUM(duration_sec), 0) AS s FROM study_sessions WHERE user_id = ? AND created_at >= ?').get(req.user.id, weekStartMs).s;
  const weekMins = Math.round((weekSec || 0) / 60);

  if (action === 'claim') {
    const duel = db.prepare('SELECT * FROM focus_duels WHERE user_id = ? ORDER BY id DESC LIMIT 1').get(req.user.id);
    if (!duel || duel.claimed) return res.status(400).json({ error: 'No claimable duel' });
    const progress = Math.max(0, weekMins - duel.user_start_mins);
    if (progress < duel.target_mins) return res.status(400).json({ error: 'Reach duel goal minutes first!' });
    const rewardCoins = duel.wager_coins * 2;
    db.prepare('UPDATE focus_duels SET claimed = 1, status = ? WHERE id = ?').run('claimed', duel.id);
    db.prepare('UPDATE users SET coins = coins + ?, xp = xp + 50 WHERE id = ?').run(rewardCoins, req.user.id);
    return res.json({ ok: true, rewardCoins, user: buildFullUser(req.user.id) });
  }

  const targetMins = Math.max(15, Math.min(600, Math.round(Number(req.body?.targetMins || 60))));
  const wagerCoins = Math.max(5, Math.min(100, Math.round(Number(req.body?.wagerCoins || 20))));
  const oppId = req.body?.opponentId ? Number(req.body.opponentId) : null;
  const oppUser = oppId ? db.prepare('SELECT id, display_name, avatar FROM users WHERE id = ?').get(oppId) : null;
  const oppWeekSec = oppUser
    ? db.prepare('SELECT COALESCE(SUM(duration_sec), 0) AS s FROM study_sessions WHERE user_id = ? AND created_at >= ?').get(oppUser.id, weekStartMs).s
    : 0;

  const info = db.prepare(`
    INSERT INTO focus_duels (user_id, opponent_id, opponent_name, opponent_avatar, target_mins, wager_coins, user_start_mins, opp_base_mins, started_at, ends_at, status, claimed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0)
  `).run(
    req.user.id,
    oppUser?.id || null,
    oppUser?.display_name || 'Elder Rowan',
    oppUser?.avatar || '🧙',
    targetMins,
    wagerCoins,
    weekMins,
    Math.round((oppWeekSec || 0) / 60),
    now,
    now + 7 * 86400_000
  );
  const created = db.prepare('SELECT * FROM focus_duels WHERE id = ?').get(Number(info.lastInsertRowid));
  res.status(201).json({
    ok: true,
    duel: {
      id: created.id,
      opponentId: created.opponent_id,
      opponentName: created.opponent_name,
      opponentAvatar: created.opponent_avatar,
      targetMins: created.target_mins,
      wagerCoins: created.wager_coins,
      userMins: 0,
      opponentMins: 0,
      startedAt: created.started_at,
      endsAt: created.ends_at,
      status: 'active',
      claimed: false,
    },
  });
});

app.patch('/api/profile', authMiddleware, (req, res) => {
  const displayName = req.body?.displayName ? String(req.body.displayName).trim().slice(0, 32) : req.user.display_name;
  const bio = req.body?.bio !== undefined ? String(req.body.bio).trim().slice(0, 140) : req.user.bio;
  const avatar = req.body?.avatar ? String(req.body.avatar).slice(0, 8) : req.user.avatar;
  const themeColor = /^#[0-9a-fA-F]{6}$/.test(req.body?.themeColor || '') ? req.body.themeColor : req.user.theme_color;
  const dailyGoalMins = req.body?.dailyGoalMins ? Math.max(15, Math.min(720, Math.round(Number(req.body.dailyGoalMins)))) : req.user.daily_goal_mins;

  db.prepare('UPDATE users SET display_name = ?, bio = ?, avatar = ?, theme_color = ?, daily_goal_mins = ? WHERE id = ?').run(
    displayName,
    bio,
    avatar,
    themeColor,
    dailyGoalMins,
    req.user.id
  );
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: sanitizeUser(updated) });
});

// Serve static Vite build in production
if (fs.existsSync(DIST_DIR)) {
  app.use((req, res, next) => {
    if (req.path === '/sw.js' || req.path === '/manifest.webmanifest') {
      res.setHeader('Cache-Control', 'no-cache');
    }
    next();
  });
  app.use(express.static(DIST_DIR, { maxAge: '1h' }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/ws')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  if (request.url?.startsWith('/ws')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', (ws) => {
  wsSockets.add(ws);
  ws.userId = null;

  const rooms = db.prepare('SELECT * FROM study_rooms ORDER BY id ASC').all();
  ws.send(JSON.stringify({ type: 'presence_snapshot', rooms: buildRoomOccupants(rooms) }));

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return;
    }

    if (msg.type === 'auth') {
      const decoded = verifyToken(msg.token);
      if (!decoded) return;
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.uid);
      if (!user) return;
      ws.userId = user.id;
      ws.userMeta = user;
      const requestedRoomId = Number(msg.roomId);
      const validRequestedRoom =
        Number.isInteger(requestedRoomId) && requestedRoomId > 0
          ? db.prepare('SELECT id FROM study_rooms WHERE id = ?').get(requestedRoomId)
          : null;
      const defaultRoom =
        validRequestedRoom || db.prepare('SELECT id FROM study_rooms ORDER BY id ASC LIMIT 1').get();
      livePresence.set(user.id, {
        userId: user.id,
        username: user.username,
        displayName: user.display_name,
        avatar: user.avatar,
        themeColor: user.theme_color,
        status: 'idle',
        roomId: defaultRoom?.id || 1,
        subjectName: 'Ready',
        subjectColor: user.theme_color,
        startedAtMs: Date.now(),
        baseElapsedSec: 0,
        mode: 'pomodoro',
      });
      broadcastPresence();
    } else if (msg.type === 'timer_sync' && ws.userId) {
      const u = ws.userMeta || db.prepare('SELECT * FROM users WHERE id = ?').get(ws.userId);
      if (!u) return;
      livePresence.set(ws.userId, {
        userId: u.id,
        username: u.username,
        displayName: u.display_name,
        avatar: u.avatar,
        themeColor: u.theme_color,
        status: ['studying', 'break', 'idle'].includes(msg.status) ? msg.status : 'idle',
        roomId: Number(msg.roomId) || 1,
        subjectName: String(msg.subjectName || 'Focus').slice(0, 32),
        subjectColor: String(msg.subjectColor || u.theme_color).slice(0, 16),
        taskTitle: String(msg.taskTitle || '').slice(0, 80),
        startedAtMs: Date.now(),
        baseElapsedSec: Math.max(0, Math.round(Number(msg.elapsedSec || 0))),
        mode: String(msg.mode || 'pomodoro').slice(0, 20),
      });
      broadcastPresence();
    } else if (msg.type === 'room_reaction' && ws.userId) {
      const u = ws.userMeta;
      broadcast({
        type: 'room_reaction',
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        roomId: Number(msg.roomId) || 1,
        emoji: String(msg.emoji || '🔥').slice(0, 8),
        username: u?.username || 'peer',
        displayName: u?.display_name || 'Peer',
        avatar: u?.avatar || '🔥',
      });
    }
  });

  ws.on('close', () => {
    wsSockets.delete(ws);
    if (ws.userId) {
      livePresence.delete(ws.userId);
      broadcastPresence();
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`StudyPulse server listening on http://0.0.0.0:${PORT}`);
});
