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
} from './db.js';

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

const SHOP_CATALOG = [
  {
    key: 'freeze_1',
    category: 'consumable',
    name: 'Streak Freeze Shield',
    desc: 'Automatically saves your daily streak if you miss a day.',
    icon: '🧊',
    price: 120,
  },
  {
    key: 'spirit_phoenix',
    category: 'spirit',
    name: 'Solar Phoenix Spirit',
    desc: 'Unlocks fiery amber-rose luminescence for your Focus Spirit.',
    icon: '🔥',
    price: 200,
  },
  {
    key: 'spirit_cyber',
    category: 'spirit',
    name: 'Cyber Prism Spirit',
    desc: 'Unlocks holographic neon cyan-violet Spirit aura.',
    icon: '💎',
    price: 250,
  },
  {
    key: 'title_archmage',
    category: 'title',
    name: 'Focus Archmage Title',
    desc: 'Sets your peer badge title to "Focus Archmage".',
    icon: '🧙',
    price: 180,
    titleValue: 'Focus Archmage',
  },
  {
    key: 'title_titan',
    category: 'title',
    name: 'Deep Work Titan Title',
    desc: 'Sets your peer badge title to "Deep Work Titan".',
    icon: '⚡',
    price: 300,
    titleValue: 'Deep Work Titan',
  },
];

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

function buildRoomOccupants(rooms) {
  const byRoom = new Map();
  for (const r of rooms) byRoom.set(r.id, []);

  for (const pres of livePresence.values()) {
    const rid = pres.roomId || rooms[0]?.id;
    if (!rid || !byRoom.has(rid)) continue;
    byRoom.get(rid).push({ ...pres, simulated: false });
  }

  return rooms.map((r) => {
    const occupants = byRoom.get(r.id) || [];
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
  const themeColor = /^#[0-9a-fA-F]{6}$/.test(req.body?.themeColor || '') ? req.body.themeColor : '#10B981';

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

function buildBootstrap(userId) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const todayStartMs = startOfToday.getTime();
  const weekStartMs = now - 7 * 86400_000;

  const userStats = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN created_at >= ? THEN duration_sec ELSE 0 END), 0) AS today_sec,
      COALESCE(SUM(CASE WHEN created_at >= ? THEN duration_sec ELSE 0 END), 0) AS week_sec,
      COALESCE(SUM(duration_sec), 0) AS total_sec,
      COUNT(*) AS sessions_count,
      COALESCE(AVG(purity_pct), 100) AS avg_purity
    FROM study_sessions WHERE user_id = ?
  `).get(todayStartMs, weekStartMs, userId);

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

  // 90-day heatmap & 7-day trend & subject breakdown & 24h rhythm for current user
  const mySessions = db.prepare('SELECT subject_name, subject_color, duration_sec, purity_pct, created_at FROM study_sessions WHERE user_id = ?').all(userId);
  const daySecMap = new Map();
  const dayCountMap = new Map();
  const subjMap = new Map();
  const hourSec = new Array(24).fill(0);
  let pureSessions = 0;

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

  const heatmap = [];
  for (let d = 89; d >= 0; d--) {
    const ts = now - d * 86400_000;
    const dk = dateKeyUTC(ts);
    heatmap.push({
      date: dk,
      minutes: Math.round((daySecMap.get(dk) || 0) / 60),
      count: dayCountMap.get(dk) || 0,
    });
  }

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

  const unlockSet = new Set(
    db.prepare('SELECT item_key FROM user_unlocks WHERE user_id = ?').all(userId).map((r) => r.item_key)
  );
  const shopItems = SHOP_CATALOG.map((item) => ({
    ...item,
    unlocked: item.category !== 'consumable' && unlockSet.has(item.key),
    equipped:
      (item.category === 'spirit' && (user.equipped_spirit || 'default') === item.key) ||
      (item.category === 'title' && user.title === item.titleValue),
  }));

  return {
    user: {
      ...sanitizeUser(user),
      todayMins: Math.round((userStats.today_sec || 0) / 60),
      weekMins: Math.round((userStats.week_sec || 0) / 60),
      totalMins: Math.round(totalSec / 60),
      sessionsCount: userStats.sessions_count || 0,
      avgPurity: Math.round(userStats.avg_purity || 100),
    },
    subjects,
    tasks,
    shopItems,
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
  const color = /^#[0-9a-fA-F]{6}$/.test(req.body?.color || '') ? req.body.color : '#10B981';
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
  const itemKey = String(req.body?.itemKey || '').trim();
  const item = SHOP_CATALOG.find((x) => x.key === itemKey);
  if (!item) return res.status(404).json({ error: 'Shop item not found' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (item.category === 'consumable') {
    if (user.coins < item.price) return res.status(400).json({ error: `Need ${item.price} Focus Coins` });
    db.prepare('UPDATE users SET coins = coins - ?, streak_freezes = streak_freezes + 1 WHERE id = ?').run(item.price, user.id);
    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    return res.json({ ok: true, action: 'purchased', itemKey, user: sanitizeUser(updated) });
  }

  const alreadyUnlocked = db.prepare('SELECT 1 FROM user_unlocks WHERE user_id = ? AND item_key = ?').get(user.id, itemKey);
  let action = 'equipped';
  if (!alreadyUnlocked) {
    if (user.coins < item.price) return res.status(400).json({ error: `Need ${item.price} Focus Coins` });
    db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(item.price, user.id);
    db.prepare('INSERT INTO user_unlocks (user_id, item_key, created_at) VALUES (?, ?, ?)').run(user.id, itemKey, Date.now());
    action = 'purchased_and_equipped';
  }

  if (item.category === 'spirit') {
    db.prepare('UPDATE users SET equipped_spirit = ? WHERE id = ?').run(item.key, user.id);
  } else if (item.category === 'title' && item.titleValue) {
    db.prepare('UPDATE users SET title = ? WHERE id = ?').run(item.titleValue, user.id);
  }

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  res.json({ ok: true, action, itemKey, user: sanitizeUser(updated) });
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
  const coinsEarned = Math.max(5, Math.round(xpEarned / 10));

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
    UPDATE users SET xp = xp + ?, coins = coins + ?, streak_days = ?, last_study_date = ?, streak_freezes = ? WHERE id = ?
  `).run(xpEarned, coinsEarned, nextStreak, todayStr, nextFreezes, req.user.id);

  if (taskId) {
    db.prepare('UPDATE study_tasks SET completed_pomos = completed_pomos + 1 WHERE id = ? AND user_id = ?').run(taskId, req.user.id);
  }
  db.prepare('DELETE FROM scheduled_timers WHERE user_id = ?').run(req.user.id);

  const session = db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(Number(info.lastInsertRowid));
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
    newStreak: nextStreak,
    usedFreeze,
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
