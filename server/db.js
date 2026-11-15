import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = process.env.DB_PATH || path.resolve(process.cwd(), 'data', 'studypulse.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, keyHex] = stored.split(':');
  const expected = Buffer.from(keyHex, 'hex');
  const derived = crypto.scryptSync(password, salt, 64);
  return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT NOT NULL DEFAULT '🔥',
    theme_color TEXT NOT NULL DEFAULT '#10B981',
    bio TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL DEFAULT 'Focus Explorer',
    xp INTEGER NOT NULL DEFAULT 0,
    coins INTEGER NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 0,
    last_study_date TEXT,
    daily_goal_mins INTEGER NOT NULL DEFAULT 120,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '📚'
  );

  CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_name TEXT NOT NULL,
    subject_color TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'pomodoro',
    duration_sec INTEGER NOT NULL,
    purity_pct INTEGER NOT NULL DEFAULT 100,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    note TEXT NOT NULL DEFAULT '',
    shared_to_feed INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS friendships (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, friend_id)
  );

  CREATE TABLE IF NOT EXISTS feed_reactions (
    session_id INTEGER NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (session_id, user_id, emoji)
  );

  CREATE TABLE IF NOT EXISTS feed_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS study_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    topic TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '🚀',
    accent TEXT NOT NULL DEFAULT '#10B981',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user_time ON study_sessions(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_sessions_time ON study_sessions(created_at DESC);
`);

export const DEFAULT_SUBJECTS = [
  { name: 'Rust & Systems', color: '#F97316', icon: '🦀' },
  { name: 'Algorithms', color: '#06B6D4', icon: '⚡' },
  { name: 'Machine Learning', color: '#8B5CF6', icon: '🧠' },
  { name: 'Calculus', color: '#10B981', icon: '📐' },
  { name: 'UI Engineering', color: '#EC4899', icon: '✨' },
];

export function createStarterSubjects(userId) {
  const insert = db.prepare('INSERT INTO subjects (user_id, name, color, icon) VALUES (?, ?, ?, ?)');
  for (const s of DEFAULT_SUBJECTS) {
    insert.run(userId, s.name, s.color, s.icon);
  }
}

export function dateKeyUTC(ts) {
  return new Date(ts).toISOString().slice(0, 10);
}

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (count > 0) return;

  const now = Date.now();
  const todayStr = dateKeyUTC(now);

  const seedUsers = [
    {
      username: 'matin',
      display_name: 'Matin',
      avatar: '🚀',
      theme_color: '#10B981',
      bio: 'Building ultra-fast systems & shipping products daily.',
      title: 'Systems Sprinter',
      streak_days: 14,
      daily_goal_mins: 150,
    },
    {
      username: 'sara_cs',
      display_name: 'Sara K.',
      avatar: '⚡',
      theme_color: '#06B6D4',
      bio: 'Distributed systems + LeetCode grind before morning coffee.',
      title: 'Grandmaster Owl',
      streak_days: 28,
      daily_goal_mins: 180,
    },
    {
      username: 'luca_ml',
      display_name: 'Luca M.',
      avatar: '🧠',
      theme_color: '#8B5CF6',
      bio: 'Transformers, CUDA kernels & linear algebra deep work.',
      title: 'Neural Architect',
      streak_days: 21,
      daily_goal_mins: 180,
    },
    {
      username: 'elena_med',
      display_name: 'Elena R.',
      avatar: '🩺',
      theme_color: '#EC4899',
      bio: 'Anatomy flashcards + 50m Pomodoro blocks.',
      title: 'Flow Alchemist',
      streak_days: 19,
      daily_goal_mins: 120,
    },
    {
      username: 'marco_rust',
      display_name: 'Marco V.',
      avatar: '🦀',
      theme_color: '#F97316',
      bio: 'Zero-cost abstractions & late night compiler hacking.',
      title: 'Ferris Knight',
      streak_days: 11,
      daily_goal_mins: 120,
    },
    {
      username: 'yuki_math',
      display_name: 'Yuki T.',
      avatar: '📐',
      theme_color: '#14B8A6',
      bio: 'Stochastic calculus & competitive programming.',
      title: 'Proof Hunter',
      streak_days: 34,
      daily_goal_mins: 150,
    },
    {
      username: 'amir_sys',
      display_name: 'Amir N.',
      avatar: '🛰️',
      theme_color: '#3B82F6',
      bio: 'Kubernetes, networking & OS internals.',
      title: 'Kernel Nomad',
      streak_days: 9,
      daily_goal_mins: 90,
    },
  ];

  const demoPasswordHash = hashPassword('studypulse');
  const insertUser = db.prepare(`
    INSERT INTO users (username, display_name, password_hash, avatar, theme_color, bio, title, xp, coins, streak_days, last_study_date, daily_goal_mins, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const userIds = [];
  for (let i = 0; i < seedUsers.length; i++) {
    const u = seedUsers[i];
    const info = insertUser.run(
      u.username,
      u.display_name,
      demoPasswordHash,
      u.avatar,
      u.theme_color,
      u.bio,
      u.title,
      2400 + (seedUsers.length - i) * 780,
      320 + (seedUsers.length - i) * 45,
      u.streak_days,
      todayStr,
      u.daily_goal_mins,
      now - 90 * 86400_000
    );
    const uid = Number(info.lastInsertRowid);
    userIds.push(uid);
    createStarterSubjects(uid);
  }

  // Friendships for @matin (id = 1) with sara, luca, elena, marco
  const insertFriend = db.prepare('INSERT OR IGNORE INTO friendships (user_id, friend_id, created_at) VALUES (?, ?, ?)');
  for (const fid of [2, 3, 4, 5]) {
    insertFriend.run(1, fid, now - 30 * 86400_000);
    insertFriend.run(fid, 1, now - 30 * 86400_000);
  }
  insertFriend.run(2, 3, now - 20 * 86400_000);
  insertFriend.run(3, 2, now - 20 * 86400_000);

  // Study rooms
  const rooms = [
    ['Late Night Rust & Code 💻', 'Systems, Web & Compilers', '💻', '#10B981'],
    ['Deep Work Library 🏛️', 'Zero-distraction silent focus', '🏛️', '#06B6D4'],
    ['Pomodoro Sprint Arena ⚡', '25m sprints + 5m stretch', '⚡', '#F97316'],
    ['Finals Crunch Squad 🔥', 'Exam prep, math & flashcards', '🔥', '#8B5CF6'],
  ];
  const insertRoom = db.prepare('INSERT INTO study_rooms (name, topic, icon, accent, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)');
  for (const r of rooms) {
    insertRoom.run(r[0], r[1], r[2], r[3], 1, now - 25 * 86400_000);
  }

  // Deterministic 90-day session history
  const sampleNotes = [
    'Locked in on async state machines without touching my phone once.',
    'Finished 4 medium graph DP problems cleanly!',
    'Implemented attention masks & benchmarked throughput.',
    'Reviewed eigenvalue proofs and solved the entire problem set.',
    'Polished responsive spring animations & micro-interactions.',
    '50-minute deep block: zero tab switches!',
    'Early morning sprint before lectures started.',
    'Crushed practice exam under strict Pomodoro timing.',
  ];

  const insertSession = db.prepare(`
    INSERT INTO study_sessions (user_id, subject_name, subject_color, mode, duration_sec, purity_pct, xp_earned, note, shared_to_feed, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const userXpTotals = new Array(userIds.length).fill(0);
  const insertedFeedIds = [];

  for (let day = 89; day >= 0; day--) {
    for (let uIdx = 0; uIdx < userIds.length; uIdx++) {
      const uid = userIds[uIdx];
      // Deterministic pseudo-random density per user & day
      const hash = (day * 37 + uIdx * 17) % 10;
      const sessionsToday = day === 0 ? 2 : day <= 14 ? (hash < 8 ? (hash % 2) + 1 : 0) : (hash < 6 ? 1 : 0);

      for (let s = 0; s < sessionsToday; s++) {
        const subj = DEFAULT_SUBJECTS[(day + uIdx + s) % DEFAULT_SUBJECTS.length];
        const mins = 25 + ((day * 13 + uIdx * 19 + s * 23) % 55);
        const durationSec = mins * 60;
        const purity = day === 0 ? 98 : 88 + ((day + uIdx + s) % 13);
        const xpEarned = Math.round(mins * 12 + (purity >= 95 ? 40 : 10));
        const tsOffsetHours = 2 + ((uIdx * 3 + s * 5) % 10);
        const createdAt = day === 0
          ? now - ((uIdx + 1) * 35 + s * 90) * 60_000
          : now - day * 86400_000 - tsOffsetHours * 3600_000;
        const shareToFeed = day <= 3 && (s === 0 || uIdx <= 4) ? 1 : 0;
        const note = shareToFeed ? sampleNotes[(day + uIdx + s) % sampleNotes.length] : '';

        const res = insertSession.run(
          uid,
          subj.name,
          subj.color,
          mins >= 45 ? 'deep' : 'pomodoro',
          durationSec,
          purity,
          xpEarned,
          note,
          shareToFeed,
          createdAt
        );
        userXpTotals[uIdx] += xpEarned;
        if (shareToFeed) {
          insertedFeedIds.push({ id: Number(res.lastInsertRowid), uid });
        }
      }
    }
  }

  // Sync user XP totals cleanly
  const updateXp = db.prepare('UPDATE users SET xp = ?, coins = ? WHERE id = ?');
  for (let i = 0; i < userIds.length; i++) {
    updateXp.run(userXpTotals[i], Math.round(userXpTotals[i] / 12), userIds[i]);
  }

  // Seed reactions & comments on recent feed items
  const insertReact = db.prepare('INSERT OR IGNORE INTO feed_reactions (session_id, user_id, emoji, created_at) VALUES (?, ?, ?, ?)');
  const insertComment = db.prepare('INSERT INTO feed_comments (session_id, user_id, content, created_at) VALUES (?, ?, ?, ?)');
  const emojis = ['🔥', '👏', '🧠', '❤️'];
  const replies = [
    'Clean streak! Keep locking in 🔥',
    '98% purity is unreal — inspiring!',
    'Saving a desk in the Rust room for next sprint!',
    'Massive session! Dual you on the weekly board tomorrow ⚡',
  ];

  const recentFeed = insertedFeedIds.slice(-10);
  for (let i = 0; i < recentFeed.length; i++) {
    const item = recentFeed[i];
    insertReact.run(item.id, userIds[(i + 1) % userIds.length], emojis[i % emojis.length], now - i * 600_000);
    insertReact.run(item.id, userIds[(i + 2) % userIds.length], emojis[(i + 1) % emojis.length], now - i * 500_000);
    if (i >= recentFeed.length - 4) {
      insertComment.run(
        item.id,
        userIds[(item.uid + 1) % userIds.length],
        replies[i % replies.length],
        now - i * 400_000
      );
    }
  }
}

seedIfEmpty();
