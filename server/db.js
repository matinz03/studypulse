import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { STARTER_STUDY_NOTES, UNIVERSITY_COURSES, UNIVERSITY_FLASHCARDS } from './universityData.js';

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
    streak_freezes INTEGER NOT NULL DEFAULT 1,
    equipped_spirit TEXT NOT NULL DEFAULT 'default',
    tasks_seeded INTEGER NOT NULL DEFAULT 0,
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

  CREATE TABLE IF NOT EXISTS study_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject_name TEXT NOT NULL DEFAULT 'Focus',
    target_pomos INTEGER NOT NULL DEFAULT 1,
    completed_pomos INTEGER NOT NULL DEFAULT 0,
    done INTEGER NOT NULL DEFAULT 0,
    rewarded INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT UNIQUE NOT NULL,
    subscription_json TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS scheduled_timers (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    target_end_ms INTEGER NOT NULL,
    mode TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    task_title TEXT NOT NULL DEFAULT '',
    duration_sec INTEGER NOT NULL,
    fired INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS user_unlocks (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_key TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, item_key)
  );

  CREATE TABLE IF NOT EXISTS shop_purchases (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_key TEXT NOT NULL,
    period_key TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, item_key, period_key)
  );

  CREATE TABLE IF NOT EXISTS game_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    hero_class TEXT NOT NULL DEFAULT 'hero_scholar',
    hero_xp INTEGER NOT NULL DEFAULT 0,
    floor INTEGER NOT NULL DEFAULT 1,
    room_index INTEGER NOT NULL DEFAULT 1,
    best_floor INTEGER NOT NULL DEFAULT 1,
    hp INTEGER NOT NULL DEFAULT 110,
    energy INTEGER NOT NULL DEFAULT 12,
    last_energy_regen_ms INTEGER NOT NULL DEFAULT 0,
    shards INTEGER NOT NULL DEFAULT 25,
    potions INTEGER NOT NULL DEFAULT 2,
    focus_charge INTEGER NOT NULL DEFAULT 50,
    luck_buff_charges INTEGER NOT NULL DEFAULT 0,
    luck_buff_amount INTEGER NOT NULL DEFAULT 0,
    upg_atk INTEGER NOT NULL DEFAULT 0,
    upg_vit INTEGER NOT NULL DEFAULT 0,
    upg_luck INTEGER NOT NULL DEFAULT 0,
    upg_crit INTEGER NOT NULL DEFAULT 0,
    bonus_atk INTEGER NOT NULL DEFAULT 0,
    bonus_def INTEGER NOT NULL DEFAULT 0,
    bonus_hp INTEGER NOT NULL DEFAULT 0,
    bonus_luck INTEGER NOT NULL DEFAULT 0,
    monsters_slain INTEGER NOT NULL DEFAULT 0,
    bosses_slain INTEGER NOT NULL DEFAULT 0,
    chests_opened INTEGER NOT NULL DEFAULT 0,
    legendaries_found INTEGER NOT NULL DEFAULT 0,
    daily_shop_date TEXT NOT NULL DEFAULT '',
    daily_shop_rerolls INTEGER NOT NULL DEFAULT 0,
    active_encounter_json TEXT,
    last_log_json TEXT,
    mode TEXT NOT NULL DEFAULT 'village',
    village_x INTEGER NOT NULL DEFAULT 4,
    village_y INTEGER NOT NULL DEFAULT 4,
    story_chapter INTEGER NOT NULL DEFAULT 1,
    story_flags_json TEXT NOT NULL DEFAULT '{}',
    npc_affinity_json TEXT NOT NULL DEFAULT '{"rowan":0,"bram":0,"lyra":0,"pip":0}',
    active_quests_json TEXT NOT NULL DEFAULT '[]',
    herbs INTEGER NOT NULL DEFAULT 1,
    torches INTEGER NOT NULL DEFAULT 2,
    dungeon_state_json TEXT,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS game_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slot TEXT NOT NULL,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    sprite_key TEXT NOT NULL,
    rarity TEXT NOT NULL,
    affix TEXT NOT NULL DEFAULT '',
    level INTEGER NOT NULL DEFAULT 1,
    upgrade_level INTEGER NOT NULL DEFAULT 0,
    atk INTEGER NOT NULL DEFAULT 0,
    def INTEGER NOT NULL DEFAULT 0,
    hp INTEGER NOT NULL DEFAULT 0,
    luck INTEGER NOT NULL DEFAULT 0,
    crit INTEGER NOT NULL DEFAULT 0,
    equipped INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_key TEXT,
    course_key TEXT NOT NULL DEFAULT 'custom',
    subject_name TEXT NOT NULL,
    concept_title TEXT NOT NULL DEFAULT '',
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    options_json TEXT NOT NULL DEFAULT '[]',
    correct_index INTEGER NOT NULL DEFAULT 0,
    ease_factor REAL NOT NULL DEFAULT 2.5,
    interval_days INTEGER NOT NULL DEFAULT 0,
    repetitions INTEGER NOT NULL DEFAULT 0,
    next_review_at INTEGER NOT NULL DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS exam_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_key TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    exam_title TEXT NOT NULL,
    exam_date TEXT NOT NULL,
    target_hours INTEGER NOT NULL DEFAULT 40,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS study_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_name TEXT NOT NULL,
    title TEXT NOT NULL,
    content_md TEXT NOT NULL,
    recall_prompts_json TEXT NOT NULL DEFAULT '[]',
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS room_raids (
    room_id INTEGER PRIMARY KEY REFERENCES study_rooms(id) ON DELETE CASCADE,
    week_key TEXT NOT NULL,
    boss_name TEXT NOT NULL,
    boss_icon TEXT NOT NULL,
    boss_hp INTEGER NOT NULL,
    boss_max_hp INTEGER NOT NULL,
    contributors_json TEXT NOT NULL DEFAULT '[]',
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS room_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS focus_duels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opponent_id INTEGER,
    opponent_name TEXT NOT NULL,
    opponent_avatar TEXT NOT NULL,
    target_mins INTEGER NOT NULL DEFAULT 90,
    wager_coins INTEGER NOT NULL DEFAULT 20,
    user_start_mins INTEGER NOT NULL DEFAULT 0,
    opp_base_mins INTEGER NOT NULL DEFAULT 0,
    started_at INTEGER NOT NULL,
    ends_at INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    claimed INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user_time ON study_sessions(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_sessions_time ON study_sessions(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_game_items_user ON game_items(user_id, equipped DESC, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_flashcards_user ON flashcards(user_id, next_review_at ASC);
  CREATE INDEX IF NOT EXISTS idx_room_messages_room ON room_messages(room_id, created_at DESC);
`);

// Safe migrations for existing production DBs
const userCols = new Set(db.prepare('PRAGMA table_info(users)').all().map((c) => c.name));
if (!userCols.has('streak_freezes')) {
  db.exec('ALTER TABLE users ADD COLUMN streak_freezes INTEGER NOT NULL DEFAULT 1');
}
if (!userCols.has('equipped_spirit')) {
  db.exec("ALTER TABLE users ADD COLUMN equipped_spirit TEXT NOT NULL DEFAULT 'default'");
}
if (!userCols.has('tasks_seeded')) {
  db.exec('ALTER TABLE users ADD COLUMN tasks_seeded INTEGER NOT NULL DEFAULT 0');
}

const gpCols = new Set(db.prepare('PRAGMA table_info(game_profiles)').all().map((c) => c.name));
const gpMigrations = [
  ['mode', "TEXT NOT NULL DEFAULT 'village'"],
  ['village_x', 'INTEGER NOT NULL DEFAULT 4'],
  ['village_y', 'INTEGER NOT NULL DEFAULT 4'],
  ['story_chapter', 'INTEGER NOT NULL DEFAULT 1'],
  ['story_flags_json', "TEXT NOT NULL DEFAULT '{}'"],
  ['npc_affinity_json', "TEXT NOT NULL DEFAULT '{\"rowan\":0,\"bram\":0,\"lyra\":0,\"pip\":0}'"],
  ['active_quests_json', "TEXT NOT NULL DEFAULT '[]'"],
  ['herbs', 'INTEGER NOT NULL DEFAULT 1'],
  ['torches', 'INTEGER NOT NULL DEFAULT 2'],
  ['dungeon_state_json', 'TEXT'],
  ['specialization', "TEXT NOT NULL DEFAULT 'chronomancer'"],
];
for (const [col, def] of gpMigrations) {
  if (!gpCols.has(col)) {
    db.exec(`ALTER TABLE game_profiles ADD COLUMN ${col} ${def}`);
  }
}

export const DEFAULT_SUBJECTS = [
  { name: 'Rust & Systems', color: '#FAFAFA', icon: '🦀' },
  { name: 'Algorithms', color: '#E4E4E7', icon: '⚡' },
  { name: 'Machine Learning', color: '#D4D4D8', icon: '🧠' },
  { name: 'Calculus', color: '#A1A1AA', icon: '📐' },
  { name: 'UI Engineering', color: '#71717A', icon: '✨' },
];

export function createStarterSubjects(userId) {
  const insert = db.prepare('INSERT INTO subjects (user_id, name, color, icon) VALUES (?, ?, ?, ?)');
  for (const s of DEFAULT_SUBJECTS) {
    insert.run(userId, s.name, s.color, s.icon);
  }
}

export function ensureUniversitySeed(userId) {
  const now = Date.now();
  const fcCount = db.prepare('SELECT COUNT(*) AS c FROM flashcards WHERE user_id = ?').get(userId).c;
  if (fcCount === 0) {
    const insCard = db.prepare(`
      INSERT INTO flashcards (user_id, card_key, course_key, subject_name, concept_title, front, back, options_json, correct_index, ease_factor, interval_days, repetitions, next_review_at, review_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 2.5, 0, 0, ?, 0, ?)
    `);
    const tx = db.transaction(() => {
      for (const c of UNIVERSITY_FLASHCARDS) {
        insCard.run(
          userId,
          c.key,
          c.courseKey,
          c.subjectName,
          c.conceptTitle,
          c.front,
          c.back,
          JSON.stringify(c.options || []),
          c.correctIndex ?? 0,
          now,
          now
        );
      }
    });
    tx();
  }

  const examCount = db.prepare('SELECT COUNT(*) AS c FROM exam_goals WHERE user_id = ?').get(userId).c;
  if (examCount === 0) {
    const insExam = db.prepare(`
      INSERT INTO exam_goals (user_id, course_key, subject_name, exam_title, exam_date, target_hours, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of UNIVERSITY_COURSES) {
      insExam.run(userId, c.key, c.name, `${c.shortName} Final Exam`, c.defaultExamDate, c.defaultTargetHours, now);
    }
  }

  const noteCount = db.prepare('SELECT COUNT(*) AS c FROM study_notes WHERE user_id = ?').get(userId).c;
  if (noteCount === 0) {
    const insNote = db.prepare(`
      INSERT INTO study_notes (user_id, subject_name, title, content_md, recall_prompts_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const n of STARTER_STUDY_NOTES) {
      insNote.run(userId, n.subjectName, n.title, n.contentMd, JSON.stringify(n.recallPrompts || []), now);
    }
  }
}

export function dateKeyUTC(ts) {
  return new Date(ts).toISOString().slice(0, 10);
}

function seedDefaultRooms() {
  const roomCount = db.prepare('SELECT COUNT(*) AS c FROM study_rooms').get().c;
  if (roomCount > 0) return;

  const now = Date.now();
  const rooms = [
    ['Late Night Rust & Code 💻', 'Systems, Web & Compilers', '💻', '#FAFAFA'],
    ['Deep Work Library 🏛️', 'Zero-distraction silent focus', '🏛️', '#D4D4D8'],
    ['Pomodoro Sprint Arena ⚡', '25m sprints + 5m stretch', '⚡', '#A1A1AA'],
    ['Finals Crunch Squad 🔥', 'Exam prep, math & flashcards', '🔥', '#71717A'],
  ];
  const insertRoom = db.prepare(
    'INSERT INTO study_rooms (name, topic, icon, accent, created_by, created_at) VALUES (?, ?, ?, ?, NULL, ?)'
  );
  for (const r of rooms) {
    insertRoom.run(r[0], r[1], r[2], r[3], now);
  }
}

seedDefaultRooms();
