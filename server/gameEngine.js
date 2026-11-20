import {
  BOUNTY_DEFINITIONS,
  DUNGEON_RIDDLES,
  LORE_CODEX,
  NPCS,
  SIDE_QUESTS,
  STORY_CHAPTERS,
  VILLAGE_HEIGHT,
  VILLAGE_MAP,
  VILLAGE_WIDTH,
  getNpcDialogue,
  trustRankLabel,
} from './storyData.js';
import {
  generateDungeonFloor,
  isWalkableTile,
  updateDungeonFov,
} from './dungeonGenerator.js';

export const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const RARITIES = {
  common: { key: 'common', label: 'Common', weight: 56, mult: 1.0, salvage: 6 },
  uncommon: { key: 'uncommon', label: 'Uncommon', weight: 26, mult: 1.35, salvage: 14 },
  rare: { key: 'rare', label: 'Rare', weight: 12, mult: 1.8, salvage: 28 },
  epic: { key: 'epic', label: 'Epic', weight: 4.8, mult: 2.45, salvage: 55 },
  legendary: { key: 'legendary', label: 'Legendary', weight: 1.2, mult: 3.4, salvage: 110 },
};

export const HERO_CLASSES = {
  hero_scholar: {
    key: 'hero_scholar',
    name: 'Arcane Scholar',
    atk: 12,
    def: 4,
    hp: 100,
    luck: 6,
    crit: 8,
    perk: '+10% Hero XP',
  },
  hero_knight: {
    key: 'hero_knight',
    name: 'Pixel Paladin',
    atk: 11,
    def: 8,
    hp: 130,
    luck: 5,
    crit: 6,
    perk: '+30 HP & +4 DEF',
  },
  hero_rogue: {
    key: 'hero_rogue',
    name: 'Shadow Rogue',
    atk: 14,
    def: 4,
    hp: 95,
    luck: 18,
    crit: 16,
    perk: '+12 Luck & +8% Crit',
  },
  hero_mage: {
    key: 'hero_mage',
    name: 'Chrono Mage',
    atk: 18,
    def: 3,
    hp: 92,
    luck: 10,
    crit: 12,
    perk: '+15% Boss & Focus Break DMG',
  },
};

export const BIOMES = [
  { key: 'moss_library', name: 'Mossy Library Ruins', minFloor: 1 },
  { key: 'clockwork_obs', name: 'Clockwork Observatory', minFloor: 4 },
  { key: 'crystal_archive', name: 'Crystal Archive Cavern', minFloor: 7 },
  { key: 'astral_sanctum', name: 'Obsidian Astral Sanctum', minFloor: 10 },
];

export function getBiomeForFloor(floor) {
  let active = BIOMES[0];
  for (const b of BIOMES) {
    if (floor >= b.minFloor) active = b;
  }
  return active;
}

const GEAR_TEMPLATES = {
  weapon: [
    { name: 'Focus Wand', icon: '🪄', spriteKey: 'wand', atkBias: 1.0, critBias: 1.0 },
    { name: 'Inkwell Blade', icon: '🗡️', spriteKey: 'blade', atkBias: 1.15, critBias: 0.8 },
    { name: 'Theorem Staff', icon: '🔮', spriteKey: 'staff', atkBias: 1.25, critBias: 0.6 },
    { name: 'Quill Rapier', icon: '⚔️', spriteKey: 'blade', atkBias: 1.05, critBias: 1.25 },
  ],
  armor: [
    { name: 'Scholar Robe', icon: '🧥', spriteKey: 'robe', defBias: 0.85, hpBias: 1.15 },
    { name: 'Citation Mail', icon: '🛡️', spriteKey: 'plate', defBias: 1.25, hpBias: 0.9 },
    { name: 'Aegis Cloak', icon: '🥋', spriteKey: 'robe', defBias: 1.0, hpBias: 1.1 },
  ],
  charm: [
    { name: 'Lucky Clover', icon: '🍀', spriteKey: 'clover', luckBias: 1.25, critBias: 0.8 },
    { name: 'Prism Star', icon: '🌟', spriteKey: 'star', luckBias: 1.05, critBias: 1.1 },
    { name: 'Serendipity Signet', icon: '💍', spriteKey: 'crown', luckBias: 1.2, critBias: 1.0 },
  ],
  companion: [
    { name: 'Athena Owl', icon: '🦉', spriteKey: 'pet_owl', atkBias: 0.8, luckBias: 1.25 },
    { name: 'Inkwell Cat', icon: '🐈', spriteKey: 'pet_cat', luckBias: 1.15, critBias: 1.2 },
    { name: 'Ember Drake', icon: '🐉', spriteKey: 'pet_dragon', atkBias: 1.25, luckBias: 0.8 },
    { name: 'Lumen Wisp', icon: '✨', spriteKey: 'pet_sprite', luckBias: 1.1, defBias: 1.0 },
  ],
};

const AFFIXES = [
  { name: 'Lucky', luck: 5 },
  { name: 'Keen', crit: 4, atk: 2 },
  { name: 'Fortified', def: 3, hp: 14 },
  { name: 'Runic', atk: 3, crit: 2 },
  { name: 'Gilded', luck: 4, hp: 10 },
  { name: 'Astral', atk: 3, luck: 3, crit: 2 },
];

export function scholarLevelFromXp(xp) {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 120)) + 1;
}

export function heroLevelFromXp(xp) {
  const heroLevel = Math.floor(Math.sqrt(Math.max(0, xp) / 80)) + 1;
  const currentHeroMinXp = 80 * (heroLevel - 1) * (heroLevel - 1);
  const nextHeroXp = 80 * heroLevel * heroLevel;
  const heroProgressPct = Math.min(
    100,
    Math.max(0, Math.round(((xp - currentHeroMinXp) / (nextHeroXp - currentHeroMinXp)) * 100))
  );
  return { heroLevel, heroXp: xp, currentHeroMinXp, nextHeroXp, heroProgressPct };
}

export function computeRawWeights(totalLuck) {
  const luck = Math.max(0, Number(totalLuck) || 0);
  return {
    common: Math.max(12, 56 - luck * 0.72),
    uncommon: Math.max(18, 26 + luck * 0.14 - Math.max(0, luck - 45) * 0.1),
    rare: 12 + luck * 0.34,
    epic: 4.8 + luck * 0.22,
    legendary: 1.2 + luck * 0.14,
  };
}

export function computeDropOdds(totalLuck) {
  const raw = computeRawWeights(totalLuck);
  const total = raw.common + raw.uncommon + raw.rare + raw.epic + raw.legendary;
  return {
    common: Math.round((raw.common / total) * 1000) / 10,
    uncommon: Math.round((raw.uncommon / total) * 1000) / 10,
    rare: Math.round((raw.rare / total) * 1000) / 10,
    epic: Math.round((raw.epic / total) * 1000) / 10,
    legendary: Math.round((raw.legendary / total) * 1000) / 10,
  };
}

export function rollRarity(totalLuck, minTierIndex = 0) {
  const raw = computeRawWeights(totalLuck);
  let total = 0;
  const active = [];
  for (let i = minTierIndex; i < RARITY_ORDER.length; i++) {
    const key = RARITY_ORDER[i];
    total += raw[key];
    active.push([key, raw[key]]);
  }
  let roll = Math.random() * total;
  for (const [key, weight] of active) {
    roll -= weight;
    if (roll <= 0) return key;
  }
  return active[active.length - 1][0];
}

function parseJsonSafe(str, fallback) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export function formatGameItem(row) {
  if (!row) return null;
  const rar = RARITIES[row.rarity] || RARITIES.common;
  const scale = 1 + (row.upgrade_level || 0) * 0.14;
  return {
    id: row.id,
    userId: row.user_id,
    slot: row.slot,
    name: row.name,
    icon: row.icon,
    spriteKey: row.sprite_key,
    rarity: row.rarity,
    affix: row.affix || '',
    level: row.level,
    upgradeLevel: row.upgrade_level || 0,
    atk: Math.round((row.atk || 0) * scale),
    def: Math.round((row.def || 0) * scale),
    hp: Math.round((row.hp || 0) * scale),
    luck: Math.round((row.luck || 0) * scale),
    crit: Math.round((row.crit || 0) * scale),
    baseAtk: row.atk || 0,
    baseDef: row.def || 0,
    baseHp: row.hp || 0,
    baseLuck: row.luck || 0,
    baseCrit: row.crit || 0,
    equipped: Boolean(row.equipped),
    salvageValue: rar.salvage + (row.upgrade_level || 0) * 8 + Math.floor(row.level * 1.5),
    createdAt: row.created_at,
  };
}

export function ensureGameProfile(db, userId) {
  const now = Date.now();
  let row = db.prepare('SELECT * FROM game_profiles WHERE user_id = ?').get(userId);
  if (!row) {
    db.prepare(`
      INSERT INTO game_profiles (
        user_id, hero_class, hero_xp, floor, room_index, best_floor, hp, energy, last_energy_regen_ms,
        shards, potions, focus_charge, herbs, torches, mode, village_x, village_y, story_chapter,
        story_flags_json, npc_affinity_json, active_quests_json, last_log_json, updated_at
      ) VALUES (?, 'hero_scholar', 0, 1, 1, 1, 110, 12, ?, 25, 2, 50, 1, 2, 'village', 4, 4, 1, '{}', ?, '[]', ?, ?)
    `).run(
      userId,
      now,
      JSON.stringify({ rowan: 0, bram: 0, lyra: 0, pip: 0 }),
      JSON.stringify(['Arrived in Oakhaven Village. Speak with Elder Rowan to begin Chapter 1!']),
      now
    );
    db.prepare(`
      INSERT INTO game_items (user_id, slot, name, icon, sprite_key, rarity, affix, level, upgrade_level, atk, def, hp, luck, crit, equipped, created_at)
      VALUES (?, 'weapon', 'Wooden Focus Wand', '🪄', 'wand', 'common', '', 1, 0, 4, 0, 0, 0, 2, 1, ?),
             (?, 'charm', 'Paper Lucky Star', '🍀', 'star', 'common', '', 1, 0, 0, 0, 0, 4, 0, 1, ?)
    `).run(userId, now, userId, now);
    row = db.prepare('SELECT * FROM game_profiles WHERE user_id = ?').get(userId);
  }

  // Passive slow energy regen (1 energy / 20 min up to soft cap 6; studying bypasses cap up to 99)
  const regenBase = row.last_energy_regen_ms || now;
  const elapsedTicks = Math.floor(Math.max(0, now - regenBase) / (20 * 60_000));
  if (elapsedTicks > 0) {
    const nextRegenMs = regenBase + elapsedTicks * 20 * 60_000;
    const nextEnergy = row.energy < 6 ? Math.min(6, row.energy + elapsedTicks) : row.energy;
    db.prepare('UPDATE game_profiles SET energy = ?, last_energy_regen_ms = ?, updated_at = ? WHERE user_id = ?').run(
      nextEnergy,
      nextRegenMs,
      now,
      userId
    );
    row = db.prepare('SELECT * FROM game_profiles WHERE user_id = ?').get(userId);
  }
  return row;
}

export function computeStudyBonuses(user, userStats) {
  const scholarLevel = scholarLevelFromXp(user.xp || 0);
  const streakDays = user.streak_days || 0;
  const avgPurity = Math.round(userStats?.avg_purity ?? 100);
  const todayMins = Math.round((userStats?.today_sec || 0) / 60);
  const dailyGoalMins = user.daily_goal_mins || 120;
  const totalMins = Math.round((userStats?.total_sec || 0) / 60);

  const studyAtk = (scholarLevel - 1) * 2;
  const studyDef = Math.floor(scholarLevel - 1);
  const studyHp = (scholarLevel - 1) * 12;
  const streakLuck = Math.min(30, streakDays * 3);
  const purityCrit = Math.max(0, Math.round(((avgPurity - 60) / 40) * 12));
  const purityDodge = Math.max(0, Math.round(((avgPurity - 60) / 40) * 10));
  const purityIntuition = Math.max(2, Math.round(((avgPurity - 55) / 45) * 18));
  const focusFever = todayMins >= dailyGoalMins && dailyGoalMins > 0;
  const feverLuck = focusFever ? 10 : 0;
  const feverAtkPct = focusFever ? 20 : 0;
  const todayEnergyTier =
    todayMins >= 60 ? 'Blazing Scholar' : todayMins >= 25 ? 'Warmed Up' : todayMins > 0 ? 'Spark Lit' : 'Rested';

  return {
    scholarLevel,
    streakDays,
    avgPurity,
    todayMins,
    dailyGoalMins,
    totalMins,
    studyAtk,
    studyDef,
    studyHp,
    streakLuck,
    purityCrit,
    purityDodge,
    purityIntuition,
    focusFever,
    feverLuck,
    feverAtkPct,
    todayEnergyTier,
  };
}

export function computeHeroStats(profile, rawItems, studyBonuses) {
  const cls = HERO_CLASSES[profile.hero_class] || HERO_CLASSES.hero_scholar;
  const lvlInfo = heroLevelFromXp(profile.hero_xp || 0);
  const items = rawItems.map(formatGameItem);
  const equipped = items.filter((i) => i.equipped);

  const gearAtk = equipped.reduce((a, b) => a + b.atk, 0);
  const gearDef = equipped.reduce((a, b) => a + b.def, 0);
  const gearHp = equipped.reduce((a, b) => a + b.hp, 0);
  const gearLuck = equipped.reduce((a, b) => a + b.luck, 0);
  const gearCrit = equipped.reduce((a, b) => a + b.crit, 0);

  const upgAtk = (profile.upg_atk || 0) * 3;
  const upgDef = (profile.upg_vit || 0) * 2;
  const upgHp = (profile.upg_vit || 0) * 20;
  const upgLuck = (profile.upg_luck || 0) * 4;
  const upgCrit = (profile.upg_crit || 0) * 2;

  const bonusAtk = profile.bonus_atk || 0;
  const bonusDef = profile.bonus_def || 0;
  const bonusHp = profile.bonus_hp || 0;
  const bonusLuck = profile.bonus_luck || 0;

  const buffLuck = (profile.luck_buff_charges || 0) > 0 ? profile.luck_buff_amount || 0 : 0;
  const levelAtk = lvlInfo.heroLevel - 1;
  const levelHp = (lvlInfo.heroLevel - 1) * 6;

  const rawAtk = cls.atk + levelAtk + upgAtk + gearAtk + studyBonuses.studyAtk + bonusAtk;
  const atk = studyBonuses.focusFever ? Math.round(rawAtk * 1.2) : rawAtk;
  const def = cls.def + upgDef + gearDef + studyBonuses.studyDef + bonusDef;
  const maxHp = cls.hp + levelHp + upgHp + gearHp + studyBonuses.studyHp + bonusHp;
  const luck = cls.luck + upgLuck + gearLuck + bonusLuck + studyBonuses.streakLuck + studyBonuses.feverLuck + buffLuck;
  const critPct = Math.min(75, cls.crit + upgCrit + gearCrit + studyBonuses.purityCrit);
  const dodgePct = Math.min(40, Math.round(studyBonuses.purityDodge + Math.min(12, luck * 0.15)));

  const affinity = parseJsonSafe(profile.npc_affinity_json, { rowan: 0, bram: 0, lyra: 0, pip: 0 });
  const intuition = Math.max(
    4,
    (studyBonuses.purityIntuition || 8) + Math.floor(luck * 0.25) + (studyBonuses.scholarLevel - 1) + (buffLuck > 0 ? 5 : 0)
  );
  const visionRadius = 2 + (studyBonuses.focusFever ? 1 : 0) + ((affinity.pip || 0) >= 25 ? 1 : 0);

  return {
    ...lvlInfo,
    classKey: cls.key,
    className: cls.name,
    classPerk: cls.perk,
    maxHp,
    hp: Math.max(0, Math.min(maxHp, profile.hp)),
    atk,
    def,
    luck,
    critPct,
    dodgePct,
    intuition,
    visionRadius,
    dropOdds: computeDropOdds(luck),
    studyBonuses,
    luckBreakdown: {
      base: cls.luck + bonusLuck,
      gear: gearLuck,
      upgrades: upgLuck,
      streak: studyBonuses.streakLuck,
      fever: studyBonuses.feverLuck,
      buff: buffLuck,
    },
  };
}

function appendLogs(profile, newLines) {
  const current = parseJsonSafe(profile.last_log_json, []);
  const arr = Array.isArray(current) ? current : [];
  return JSON.stringify([...newLines, ...arr].slice(0, 10));
}

function trimBackpackIfNeeded(db, userId) {
  const unequipped = db
    .prepare(
      `SELECT id, rarity FROM game_items WHERE user_id = ? AND equipped = 0
       ORDER BY CASE rarity WHEN 'common' THEN 1 WHEN 'uncommon' THEN 2 WHEN 'rare' THEN 3 WHEN 'epic' THEN 4 ELSE 5 END ASC, id ASC`
    )
    .all(userId);
  if (unequipped.length <= 40) return;
  const excess = unequipped.slice(0, unequipped.length - 40);
  let shardsRecovered = 0;
  const delStmt = db.prepare('DELETE FROM game_items WHERE id = ? AND user_id = ?');
  for (const r of excess) {
    shardsRecovered += RARITIES[r.rarity]?.salvage || 6;
    delStmt.run(r.id, userId);
  }
  if (shardsRecovered > 0) {
    db.prepare('UPDATE game_profiles SET shards = shards + ? WHERE user_id = ?').run(shardsRecovered, userId);
  }
}

export function rollLootSpec(floor, totalLuck, opts = {}) {
  const effectiveLuck = totalLuck + (opts.bonusLuck || 0);
  const minIdx = opts.minRarity ? Math.max(0, RARITY_ORDER.indexOf(opts.minRarity)) : 0;
  const rarity = rollRarity(effectiveLuck, minIdx);
  const rarMeta = RARITIES[rarity] || RARITIES.common;

  const slots = ['weapon', 'armor', 'charm', 'companion'];
  const slot = opts.forcedSlot && slots.includes(opts.forcedSlot) ? opts.forcedSlot : slots[Math.floor(Math.random() * slots.length)];
  const pool = GEAR_TEMPLATES[slot];
  const tpl = pool[Math.floor(Math.random() * pool.length)];

  const rarityIndex = RARITY_ORDER.indexOf(rarity);
  const affixObj = rarityIndex >= 2 ? AFFIXES[Math.floor(Math.random() * AFFIXES.length)] : null;
  const level = Math.max(1, floor);
  const tierFactor = rarMeta.mult * (1 + (level - 1) * 0.24);
  const jitter = () => 0.9 + Math.random() * 0.22;

  let atk = 0;
  let def = 0;
  let hp = 0;
  let luck = 0;
  let crit = 0;

  if (slot === 'weapon') {
    atk = Math.max(3, Math.round(4.5 * tierFactor * (tpl.atkBias || 1) * jitter()));
    crit = Math.max(1, Math.round(2.0 * rarMeta.mult * (tpl.critBias || 1)));
    if (rarityIndex >= 2) luck += Math.round(2 * rarityIndex);
  } else if (slot === 'armor') {
    def = Math.max(2, Math.round(2.8 * tierFactor * (tpl.defBias || 1) * jitter()));
    hp = Math.max(10, Math.round(14 * tierFactor * (tpl.hpBias || 1) * jitter()));
  } else if (slot === 'charm') {
    luck = Math.max(3, Math.round(4.5 * tierFactor * (tpl.luckBias || 1) * jitter()));
    crit = Math.max(1, Math.round(2.0 * rarMeta.mult * (tpl.critBias || 1)));
  } else {
    atk = Math.max(2, Math.round(2.5 * tierFactor * (tpl.atkBias || 1)));
    luck = Math.max(3, Math.round(3.5 * tierFactor * (tpl.luckBias || 1)));
    def = Math.round(1.4 * tierFactor * (tpl.defBias || 0.7));
    crit = Math.round(1.5 * rarMeta.mult * (tpl.critBias || 0.8));
  }

  if (affixObj) {
    atk += affixObj.atk || 0;
    def += affixObj.def || 0;
    hp += affixObj.hp || 0;
    luck += affixObj.luck || 0;
    crit += affixObj.crit || 0;
  }

  return {
    slot,
    name: opts.forcedName || `${affixObj ? `${affixObj.name} ` : ''}${tpl.name}`,
    icon: tpl.icon,
    spriteKey: tpl.spriteKey,
    rarity,
    affix: affixObj?.name || '',
    level,
    atk,
    def,
    hp,
    luck,
    crit,
  };
}

function insertLootSpec(db, userId, spec) {
  const now = Date.now();
  const info = db.prepare(`
    INSERT INTO game_items (user_id, slot, name, icon, sprite_key, rarity, affix, level, upgrade_level, atk, def, hp, luck, crit, equipped, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, 0, ?)
  `).run(userId, spec.slot, spec.name, spec.icon, spec.spriteKey, spec.rarity, spec.affix, spec.level, spec.atk, spec.def, spec.hp, spec.luck, spec.crit, now);
  if (spec.rarity === 'legendary') {
    db.prepare('UPDATE game_profiles SET legendaries_found = legendaries_found + 1 WHERE user_id = ?').run(userId);
  }
  trimBackpackIfNeeded(db, userId);
  return formatGameItem(db.prepare('SELECT * FROM game_items WHERE id = ?').get(Number(info.lastInsertRowid)));
}

export function generateLootItem(db, userId, floor, totalLuck, opts = {}) {
  const spec = rollLootSpec(floor, totalLuck, opts);
  return insertLootSpec(db, userId, spec);
}

function formatSatchelPreview(spec, tempId) {
  const rar = RARITIES[spec.rarity] || RARITIES.common;
  return {
    id: tempId,
    userId: 0,
    slot: spec.slot,
    name: spec.name,
    icon: spec.icon,
    spriteKey: spec.spriteKey,
    rarity: spec.rarity,
    affix: spec.affix,
    level: spec.level,
    upgradeLevel: 0,
    atk: spec.atk,
    def: spec.def,
    hp: spec.hp,
    luck: spec.luck,
    crit: spec.crit,
    equipped: false,
    salvageValue: rar.salvage,
    createdAt: Date.now(),
  };
}

function incrementBountyProgress(quests, questId, delta = 1) {
  for (const q of quests) {
    if (q.id === questId && !q.claimed) {
      q.progress = Math.min(q.target || 1, (q.progress || 0) + delta);
    }
  }
  return quests;
}

function computeIntentValue(enemy, intent, floor) {
  const atk = enemy.atk + (enemy.atkBonus || 0);
  switch (intent) {
    case 'HEAVY':
      return Math.max(8, Math.round(atk * 2.1));
    case 'STRIKE':
      return Math.max(4, Math.round(atk));
    case 'HEX':
      return Math.max(4, Math.round(atk * 0.8));
    case 'SHELL':
      return Math.max(3, Math.round(atk * 0.6));
    case 'RITUAL':
      return Math.max(4, Math.round(4 + floor));
    default:
      return 0;
  }
}

export function buildGameState(db, user, userStats) {
  const profile = ensureGameProfile(db, user.id);
  const rawItems = db
    .prepare(
      `SELECT * FROM game_items WHERE user_id = ?
       ORDER BY equipped DESC, CASE rarity WHEN 'legendary' THEN 5 WHEN 'epic' THEN 4 WHEN 'rare' THEN 3 WHEN 'uncommon' THEN 2 ELSE 1 END DESC, id DESC`
    )
    .all(user.id);
  const studyBonuses = computeStudyBonuses(user, userStats);
  const heroStats = computeHeroStats(profile, rawItems, studyBonuses);
  const items = rawItems.map(formatGameItem);
  const equippedBySlot = {
    weapon: items.find((i) => i.equipped && i.slot === 'weapon') || null,
    armor: items.find((i) => i.equipped && i.slot === 'armor') || null,
    charm: items.find((i) => i.equipped && i.slot === 'charm') || null,
    companion: items.find((i) => i.equipped && i.slot === 'companion') || null,
  };

  const encounter = parseJsonSafe(profile.active_encounter_json, null);
  const recentLogs = parseJsonSafe(profile.last_log_json, []);
  const flags = parseJsonSafe(profile.story_flags_json, {});
  const affinity = parseJsonSafe(profile.npc_affinity_json, { rowan: 0, bram: 0, lyra: 0, pip: 0 });
  const quests = parseJsonSafe(profile.active_quests_json, []);
  const dungeon = profile.mode === 'dungeon' ? parseJsonSafe(profile.dungeon_state_json, null) : null;

  const chapterNum = profile.story_chapter || 1;
  const chapters = STORY_CHAPTERS.map((c) => ({
    ...c,
    completed: Boolean(flags[`chapter_${c.chapter}_claimed`]),
    bossDefeated: Boolean(flags[c.bossFlag]),
    active: c.chapter === chapterNum && !flags[`chapter_${c.chapter}_claimed`],
  }));

  const villageUpgrades = [];
  for (const c of STORY_CHAPTERS) {
    if (flags[`chapter_${c.chapter}_claimed`]) villageUpgrades.push(c.villageUpgrade);
  }

  const unlockedLoreIds = Array.isArray(flags.loreUnlocked) ? flags.loreUnlocked : [];
  const loreCodex = LORE_CODEX.map((l) => ({
    ...l,
    unlocked: unlockedLoreIds.includes(l.id),
  }));

  const npcs = NPCS.map((n) => {
    const score = affinity[n.id] || 0;
    const dlg = getNpcDialogue(n.id, {
      chapter: chapterNum,
      flags,
      affinity,
      quests,
      herbs: profile.herbs || 0,
      shards: profile.shards || 0,
      coins: user.coins || 0,
      displayName: user.display_name,
      heroStats,
      equippedWeapon: equippedBySlot.weapon,
    });
    return {
      ...n,
      affinity: score,
      rankLabel: trustRankLabel(score),
      hasAction: dlg.options.some((o) => o.style === 'primary' && !o.disabled),
      dialogue: dlg,
    };
  });

  // Format riddle prompt if active riddle encounter
  let activeEncounter = encounter;
  if (encounter?.type === 'riddle') {
    const r = DUNGEON_RIDDLES.find((x) => x.id === encounter.riddleId) || DUNGEON_RIDDLES[0];
    activeEncounter = {
      ...encounter,
      title: r.title,
      prompt: r.prompt,
      hint: heroStats.intuition >= 14 ? r.hint : null,
      options: r.options,
    };
  }

  return {
    mode: dungeon ? 'dungeon' : 'village',
    profile: {
      heroClass: profile.hero_class,
      floor: profile.floor,
      roomIndex: profile.room_index,
      bestFloor: profile.best_floor,
      hp: heroStats.hp,
      maxHp: heroStats.maxHp,
      energy: profile.energy,
      shards: profile.shards,
      potions: profile.potions,
      herbs: profile.herbs || 0,
      torches: profile.torches || 0,
      focusCharge: profile.focus_charge,
      luckBuffCharges: profile.luck_buff_charges,
      luckBuffAmount: profile.luck_buff_amount,
      monstersSlain: profile.monsters_slain,
      bossesSlain: profile.bosses_slain,
      chestsOpened: profile.chests_opened,
      legendariesFound: profile.legendaries_found,
      upgrades: {
        atk: profile.upg_atk,
        vit: profile.upg_vit,
        luck: profile.upg_luck,
        crit: profile.upg_crit,
      },
      upgradeCosts: {
        atk: 15 + profile.upg_atk * 12,
        vit: 15 + profile.upg_vit * 12,
        luck: 15 + profile.upg_luck * 12,
        crit: 15 + profile.upg_crit * 12,
      },
    },
    heroStats,
    biome: getBiomeForFloor(dungeon ? dungeon.floor : profile.floor),
    village: {
      x: profile.village_x ?? 4,
      y: profile.village_y ?? 4,
      width: VILLAGE_WIDTH,
      height: VILLAGE_HEIGHT,
      map: VILLAGE_MAP,
      upgrades: villageUpgrades,
      npcs,
    },
    dungeon,
    story: {
      chapter: chapterNum,
      chapters,
      flags,
      npcAffinity: affinity,
      quests,
      loreCodex,
      sideQuestsAvailable: SIDE_QUESTS,
      bountiesAvailable: BOUNTY_DEFINITIONS,
    },
    items,
    equippedBySlot,
    encounter: activeEncounter,
    recentLogs: Array.isArray(recentLogs) ? recentLogs : [],
  };
}

export function grantStudyRewardsToGame(db, user, userStats, durationSec, purityPct, strictMode) {
  const profile = ensureGameProfile(db, user.id);
  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const studyBonuses = computeStudyBonuses(user, userStats);
  const heroStats = computeHeroStats(profile, rawItems, studyBonuses);

  const mins = Math.max(1, Math.round(durationSec / 60));
  const energyGained = Math.max(2, Math.min(20, Math.round(mins / 5) + (strictMode && purityPct >= 95 ? 2 : 0)));
  const shardsGained = Math.max(6, Math.round(mins * 0.9 + (purityPct >= 95 ? 5 : 0)));

  db.prepare(`
    UPDATE game_profiles
    SET energy = MIN(99, energy + ?), shards = shards + ?, focus_charge = MIN(100, focus_charge + 30), updated_at = ?
    WHERE user_id = ?
  `).run(energyGained, shardsGained, Date.now(), user.id);

  let droppedItem = null;
  const shouldDrop = durationSec >= 1200 || Math.random() < Math.min(0.65, 0.25 + heroStats.luck * 0.006);
  const updatedProf = db.prepare('SELECT * FROM game_profiles WHERE user_id = ?').get(user.id);
  if (shouldDrop) {
    const minRarity = durationSec >= 2700 ? 'rare' : durationSec >= 1200 ? 'uncommon' : 'common';
    droppedItem = generateLootItem(db, user.id, profile.floor, heroStats.luck, { minRarity });
    const logs = appendLogs(updatedProf, [`📚 Focus Drop (${mins}m): +${energyGained} ⚡, +${shardsGained} ✦ & found [${droppedItem.rarity.toUpperCase()}] ${droppedItem.name}!`]);
    db.prepare('UPDATE game_profiles SET last_log_json = ? WHERE user_id = ?').run(logs, user.id);
  } else {
    const logs = appendLogs(updatedProf, [`📚 Study Charge (${mins}m): +${energyGained} ⚡ Energy & +${shardsGained} ✦ Shards`]);
    db.prepare('UPDATE game_profiles SET last_log_json = ? WHERE user_id = ?').run(logs, user.id);
  }

  return {
    energyGained,
    shardsGained,
    droppedItem,
    focusFeverActive: studyBonuses.focusFever,
  };
}

function consumeLuckBuffCharge(db, profile) {
  if ((profile.luck_buff_charges || 0) <= 0) return;
  const next = profile.luck_buff_charges - 1;
  db.prepare(
    'UPDATE game_profiles SET luck_buff_charges = ?, luck_buff_amount = CASE WHEN ? <= 0 THEN 0 ELSE luck_buff_amount END WHERE user_id = ?'
  ).run(next, next, profile.user_id);
}

// ==========================================
// OAKHAVEN VILLAGE, NPCS, STORY & CRAFTING
// ==========================================

export function moveInVillage(db, user, userStats, dx, dy) {
  const profile = ensureGameProfile(db, user.id);
  if (profile.mode === 'dungeon') throw new Error('Leave the dungeon before walking in Oakhaven');
  if (Math.abs(dx) + Math.abs(dy) !== 1) throw new Error('Invalid village move');

  const nx = (profile.village_x ?? 4) + dx;
  const ny = (profile.village_y ?? 4) + dy;
  if (nx < 0 || ny < 0 || nx >= VILLAGE_WIDTH || ny >= VILLAGE_HEIGHT) {
    return { game: buildGameState(db, user, userStats), events: [] };
  }

  const npc = NPCS.find((n) => n.x === nx && n.y === ny);
  if (npc) {
    const refreshed = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    return { game: buildGameState(db, refreshed, userStats), interactedNpcId: npc.id, events: [] };
  }

  const tile = VILLAGE_MAP[ny][nx];
  if (tile !== '.' && tile !== 'G' && tile !== 'N') {
    return { game: buildGameState(db, user, userStats), events: [] };
  }

  db.prepare('UPDATE game_profiles SET village_x = ?, village_y = ?, updated_at = ? WHERE user_id = ?').run(
    nx,
    ny,
    Date.now(),
    user.id
  );
  return {
    game: buildGameState(db, user, userStats),
    atGate: tile === 'G',
    atNoticeBoard: tile === 'N',
    events: [],
  };
}

export function talkToNpc(db, user, userStats, npcId, choiceId) {
  const profile = ensureGameProfile(db, user.id);
  const npc = NPCS.find((n) => n.id === npcId);
  if (!npc) throw new Error('Unknown villager');

  const flags = parseJsonSafe(profile.story_flags_json, {});
  const affinity = parseJsonSafe(profile.npc_affinity_json, { rowan: 0, bram: 0, lyra: 0, pip: 0 });
  let quests = parseJsonSafe(profile.active_quests_json, []);
  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const heroStats = computeHeroStats(profile, rawItems, computeStudyBonuses(user, userStats));

  // Move player near NPC for nice visual immersion
  const targetX = Math.max(1, Math.min(VILLAGE_WIDTH - 2, npc.x));
  const targetY = Math.min(VILLAGE_HEIGHT - 2, npc.y + 1);
  let logMsg = `💬 Spoke with ${npc.name}.`;
  let shardsGain = 0;
  let coinsGain = 0;
  let xpGain = 0;
  let herbsDelta = 0;
  let nextHp = profile.hp;
  let nextFocus = profile.focus_charge;
  let nextChapter = profile.story_chapter || 1;

  if (choiceId === 'advance_chapter') {
    const chap = STORY_CHAPTERS[Math.min(STORY_CHAPTERS.length - 1, nextChapter - 1)];
    if (!flags[chap.bossFlag]) throw new Error(`Defeat the Floor ${chap.floorReq} Boss first!`);
    if (flags[`chapter_${chap.chapter}_claimed`]) throw new Error('Chapter already claimed');

    flags[`chapter_${chap.chapter}_claimed`] = true;
    nextChapter = Math.min(STORY_CHAPTERS.length + 1, chap.chapter + 1);
    coinsGain = chap.rewards.coins;
    shardsGain = chap.rewards.shards;
    xpGain = chap.rewards.xp;
    affinity.rowan = (affinity.rowan || 0) + 15;
    nextHp = heroStats.maxHp;
    const loreSet = new Set(Array.isArray(flags.loreUnlocked) ? flags.loreUnlocked : []);
    if (chap.rewards.loreId) loreSet.add(chap.rewards.loreId);
    flags.loreUnlocked = [...loreSet];
    logMsg = `📖 Chapter ${chap.chapter} Complete! +${coinsGain}🪙, +${shardsGain}✦ & Oakhaven upgraded (${chap.upgradeLabel})!`;
  } else if (choiceId === 'rowan_blessing') {
    nextHp = heroStats.maxHp;
    nextFocus = 100;
    logMsg = `✨ Elder Rowan blessed you: HP restored to ${heroStats.maxHp} & Focus Burst 100%!`;
  } else if (choiceId === 'rowan_lore' || choiceId === 'bram_spar' || choiceId === 'pip_secret_tip') {
    const talkFlag = `talk_${choiceId}_c${nextChapter}`;
    if (!flags[talkFlag]) {
      flags[talkFlag] = true;
      affinity[npcId] = (affinity[npcId] || 0) + 2;
      logMsg = `🤝 Bond deepened with ${npc.name} (+2 Trust)!`;
    } else {
      logMsg = `💬 Chatted with ${npc.name} about the Pixel Spire.`;
    }
  } else if (choiceId === 'accept_bram_tongs' || choiceId === 'accept_lyra_herbs' || choiceId === 'accept_pip_compass') {
    const qId = choiceId.replace('accept_', 'quest_');
    const def = SIDE_QUESTS.find((q) => q.id === qId);
    if (def && !quests.some((q) => q.id === qId)) {
      quests.push({ id: def.id, npcId: def.npcId, title: def.title, desc: def.desc, target: def.reqHerbs || 1, progress: 0, claimed: false, type: 'side' });
      logMsg = `📜 Accepted Side Quest: ${def.title}`;
    }
  } else if (choiceId === 'turnin_bram_tongs') {
    const q = quests.find((x) => x.id === 'quest_bram_tongs' && !x.claimed);
    if (!q || !flags.bram_tongs_found) throw new Error('Runic Tongs not found yet');
    q.claimed = true;
    q.progress = 1;
    coinsGain = 60;
    shardsGain = 100;
    xpGain = 90;
    affinity.bram = (affinity.bram || 0) + 30;
    logMsg = `⚒️ Returned Bram’s Runic Tongs! +60🪙, +100✦ & Bram is now Trusted (-20% Forge cost)!`;
  } else if (choiceId === 'turnin_lyra_herbs') {
    const q = quests.find((x) => x.id === 'quest_lyra_herbs' && !x.claimed);
    if (!q || (profile.herbs || 0) < 3) throw new Error('Need 3 Moonpetal Herbs');
    q.claimed = true;
    q.progress = 3;
    herbsDelta = -3;
    coinsGain = 50;
    shardsGain = 90;
    xpGain = 85;
    affinity.lyra = (affinity.lyra || 0) + 30;
    logMsg = `🌿 Delivered 3 Moonpetal Herbs to Lyra! +50🪙, +90✦ & Potions now heal +20% more!`;
  } else if (choiceId === 'turnin_pip_compass') {
    const q = quests.find((x) => x.id === 'quest_pip_compass' && !x.claimed);
    if (!q || !flags.pip_compass_found) throw new Error('Starlight Compass not found yet');
    q.claimed = true;
    q.progress = 1;
    coinsGain = 70;
    shardsGain = 110;
    xpGain = 110;
    affinity.pip = (affinity.pip || 0) + 35;
    logMsg = `🧭 Returned Pip’s Starlight Compass! +70🪙, +110✦ & +1 Permanent Torch Vision Radius!`;
  } else if (choiceId.startsWith('accept_bounty_')) {
    const bId = choiceId.replace('accept_', '');
    const bDef = BOUNTY_DEFINITIONS.find((b) => b.id === bId);
    if (!bDef) throw new Error('Unknown bounty');
    quests = quests.filter((q) => !(q.id === bId && q.claimed));
    if (!quests.some((q) => q.id === bId && !q.claimed)) {
      quests.push({ id: bDef.id, npcId: 'pip', title: bDef.title, desc: bDef.desc, target: bDef.target, progress: 0, claimed: false, type: 'bounty' });
      logMsg = `📌 Accepted Notice Board Bounty: ${bDef.title}`;
    }
  } else if (choiceId.startsWith('claim_bounty_')) {
    const bId = choiceId.replace('claim_', '');
    const bDef = BOUNTY_DEFINITIONS.find((b) => b.id === bId);
    const active = quests.find((q) => q.id === bId && !q.claimed);
    if (!bDef || !active || active.progress < active.target) throw new Error('Bounty not completed yet');
    active.claimed = true;
    coinsGain = bDef.reward.coins;
    shardsGain = bDef.reward.shards;
    affinity.pip = (affinity.pip || 0) + bDef.reward.trust;
    logMsg = `🏆 Claimed "${bDef.title}": +${coinsGain}🪙, +${shardsGain}✦ & +${bDef.reward.trust} Trust!`;
  }

  if (coinsGain > 0) {
    db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(coinsGain, user.id);
  }
  const nextLogs = appendLogs(profile, [logMsg]);
  db.prepare(`
    UPDATE game_profiles
    SET village_x = ?, village_y = ?, story_chapter = ?, story_flags_json = ?, npc_affinity_json = ?,
        active_quests_json = ?, shards = shards + ?, herbs = MAX(0, herbs + ?), hero_xp = hero_xp + ?,
        hp = ?, focus_charge = ?, last_log_json = ?, updated_at = ?
    WHERE user_id = ?
  `).run(
    targetX,
    targetY,
    nextChapter,
    JSON.stringify(flags),
    JSON.stringify(affinity),
    JSON.stringify(quests),
    shardsGain,
    herbsDelta,
    xpGain,
    nextHp,
    nextFocus,
    nextLogs,
    Date.now(),
    user.id
  );

  const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  return { game: buildGameState(db, refreshedUser, userStats), message: logMsg, events: [] };
}

export function craftAtNpc(db, user, userStats, craftKey, targetItemId) {
  const profile = ensureGameProfile(db, user.id);
  const affinity = parseJsonSafe(profile.npc_affinity_json, {});
  const now = Date.now();
  let msg = '';

  if (craftKey === 'brew_potion') {
    if ((profile.herbs || 0) < 1 || profile.shards < 10) throw new Error('Need 1 Moonpetal Herb & 10 Arcane Shards');
    db.prepare('UPDATE game_profiles SET herbs = herbs - 1, shards = shards - 10, potions = potions + 2, updated_at = ? WHERE user_id = ?').run(now, user.id);
    msg = '🧪 Lyra brewed +2 Healing Potions!';
  } else if (craftKey === 'brew_torch') {
    if (profile.shards < 15) throw new Error('Need 15 Arcane Shards');
    db.prepare('UPDATE game_profiles SET shards = shards - 15, torches = torches + 2, updated_at = ? WHERE user_id = ?').run(now, user.id);
    msg = '🔥 Lyra infused +2 Dungeon Torches!';
  } else if (craftKey === 'brew_intuition') {
    if ((profile.herbs || 0) < 2 || profile.shards < 20) throw new Error('Need 2 Moonpetal Herbs & 20 Arcane Shards');
    db.prepare(
      'UPDATE game_profiles SET herbs = herbs - 2, shards = shards - 20, luck_buff_charges = luck_buff_charges + 6, luck_buff_amount = MAX(luck_buff_amount, 20), updated_at = ? WHERE user_id = ?'
    ).run(now, user.id);
    msg = '✨ Drank Clarity Tonic (+20 Luck & +5 Intuition for 6 encounters)!';
  } else if (craftKey === 'craft_reforge') {
    const disc = (affinity.bram || 0) >= 25 ? 0.8 : 1;
    const shardCost = Math.round(25 * disc);
    const coinCost = Math.round(25 * disc);
    if (profile.shards < shardCost) throw new Error(`Need ${shardCost} Arcane Shards`);
    if (user.coins < coinCost) throw new Error(`Need ${coinCost} Focus Coins`);

    const item = db.prepare('SELECT * FROM game_items WHERE id = ? AND user_id = ?').get(targetItemId, user.id);
    if (!item) throw new Error('Item not found');

    const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
    const heroStats = computeHeroStats(profile, rawItems, computeStudyBonuses(user, userStats));
    const rolled = rollLootSpec(Math.max(item.level, profile.floor), heroStats.luck + 12, {
      forcedSlot: item.slot,
      minRarity: item.rarity,
    });
    const nextAtk = Math.max(item.atk, rolled.atk);
    const nextDef = Math.max(item.def, rolled.def);
    const nextHp = Math.max(item.hp, rolled.hp);
    const nextLuck = Math.max(item.luck, rolled.luck);
    const nextCrit = Math.max(item.crit, rolled.crit);

    db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(coinCost, user.id);
    db.prepare('UPDATE game_profiles SET shards = shards - ?, updated_at = ? WHERE user_id = ?').run(shardCost, now, user.id);
    db.prepare('UPDATE game_items SET name = ?, rarity = ?, affix = ?, atk = ?, def = ?, hp = ?, luck = ?, crit = ? WHERE id = ?').run(
      rolled.name,
      rolled.rarity,
      rolled.affix,
      nextAtk,
      nextDef,
      nextHp,
      nextLuck,
      nextCrit,
      item.id
    );
    msg = `⚒️ Bram Reforged ${rolled.name} (${rolled.rarity.toUpperCase()})!`;
  } else {
    throw new Error('Unknown crafting recipe');
  }

  const nextLogs = appendLogs(db.prepare('SELECT * FROM game_profiles WHERE user_id = ?').get(user.id), [msg]);
  db.prepare('UPDATE game_profiles SET last_log_json = ? WHERE user_id = ?').run(nextLogs, user.id);
  const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  return { game: buildGameState(db, refreshedUser, userStats), message: msg, events: [] };
}

// ==========================================
// FOG-OF-WAR TOP-DOWN DUNGEON & EXPLORATION
// ==========================================

export function enterDungeon(db, user, userStats, requestedFloor) {
  const profile = ensureGameProfile(db, user.id);
  if (profile.mode === 'dungeon' && profile.dungeon_state_json) {
    return { game: buildGameState(db, user, userStats), events: [] };
  }
  if (profile.energy < 2) {
    throw new Error('Need 2 ⚡ Study Energy to enter the Spire! Log a focus block or grab Torches in the Store.');
  }

  const targetFloor = requestedFloor ? Math.max(1, Math.min(profile.best_floor, Number(requestedFloor))) : profile.floor;
  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const heroStats = computeHeroStats(profile, rawItems, computeStudyBonuses(user, userStats));
  const flags = parseJsonSafe(profile.story_flags_json, {});
  const usedRiddles = Array.isArray(flags.riddlesSolved) ? flags.riddlesSolved : [];

  const dungeon = generateDungeonFloor(targetFloor, heroStats.intuition, heroStats.visionRadius, usedRiddles);
  const enterHp = heroStats.hp <= 0 ? Math.round(heroStats.maxHp * 0.7) : Math.max(heroStats.hp, Math.round(heroStats.maxHp * 0.6));
  const nextLogs = appendLogs(profile, [`🚪 Descended into Floor ${targetFloor} (${getBiomeForFloor(targetFloor).name}). Find the 🔑 Key & unlock the Boss!`]);

  db.prepare(`
    UPDATE game_profiles
    SET mode = 'dungeon', floor = ?, energy = energy - 2, hp = ?, active_encounter_json = NULL,
        dungeon_state_json = ?, last_log_json = ?, updated_at = ?
    WHERE user_id = ?
  `).run(targetFloor, enterHp, JSON.stringify(dungeon), nextLogs, Date.now(), user.id);

  return { game: buildGameState(db, user, userStats), events: [{ kind: 'step', target: 'hero', text: `FLOOR ${targetFloor}` }] };
}

export function dungeonMove(db, user, userStats, dx, dy) {
  const profile = ensureGameProfile(db, user.id);
  if (profile.mode !== 'dungeon' || !profile.dungeon_state_json) throw new Error('Not inside a dungeon');
  if (profile.active_encounter_json) throw new Error('Finish the current encounter first');
  if (Math.abs(dx) + Math.abs(dy) !== 1) throw new Error('Move 1 tile orthogonally');

  const dungeon = JSON.parse(profile.dungeon_state_json);
  const nx = dungeon.playerX + dx;
  const ny = dungeon.playerY + dy;
  if (nx < 0 || ny < 0 || nx >= dungeon.tiles[0].length || ny >= dungeon.tiles.length) {
    return { game: buildGameState(db, user, userStats), events: [] };
  }

  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const heroStats = computeHeroStats(profile, rawItems, computeStudyBonuses(user, userStats));
  const tile = dungeon.tiles[ny][nx];

  if (tile === 'L') {
    if (dungeon.keys < 1) {
      const nextLogs = appendLogs(profile, ['🔒 Locked Boss Sanctum! Search the wing for the Bronze Key (🔑).']);
      db.prepare('UPDATE game_profiles SET last_log_json = ? WHERE user_id = ?').run(nextLogs, user.id);
      return { game: buildGameState(db, user, userStats), events: [{ kind: 'trap', target: 'hero', text: 'LOCKED' }] };
    }
    dungeon.keys -= 1;
    dungeon.tiles[ny][nx] = '.';
  } else if (!isWalkableTile(tile)) {
    const hollowMsg = tile === 'S' && heroStats.intuition >= 11 ? '🪨 Hairline fissures shimmer here — use 🔍 Search!' : null;
    if (hollowMsg) {
      db.prepare('UPDATE game_profiles SET last_log_json = ? WHERE user_id = ?').run(appendLogs(profile, [hollowMsg]), user.id);
    }
    return { game: buildGameState(db, user, userStats), events: [] };
  }

  dungeon.playerX = nx;
  dungeon.playerY = ny;
  dungeon.steps = (dungeon.steps || 0) + 1;
  dungeon.torch = Math.max(0, (dungeon.torch ?? 100) - 3);
  updateDungeonFov(dungeon, heroStats.visionRadius, heroStats.intuition);

  let hp = heroStats.hp;
  let flags = parseJsonSafe(profile.story_flags_json, {});
  let encounter = null;
  const logLines = [];
  const events = [{ kind: 'step', target: 'hero', text: tile === 'L' ? 'UNLOCKED!' : '' }];

  const ent = dungeon.entities.find((e) => !e.done && e.x === nx && e.y === ny);
  if (ent) {
    if (ent.type === 'key') {
      ent.done = true;
      dungeon.keys += 1;
      events.push({ kind: 'loot', target: 'hero', text: '+1 KEY!' });
      logLines.push('🔑 Picked up the Bronze Boss Key!');
    } else if (ent.type === 'herb') {
      ent.done = true;
      dungeon.satchel.herbs = (dungeon.satchel.herbs || 0) + 1;
      events.push({ kind: 'heal', target: 'hero', text: '+1 HERB' });
      logLines.push('🌿 Harvested Moonpetal Herb into your Expedition Satchel!');
    } else if (ent.type === 'brazier') {
      ent.done = true;
      dungeon.torch = Math.min(100, dungeon.torch + 45);
      updateDungeonFov(dungeon, heroStats.visionRadius, heroStats.intuition);
      events.push({ kind: 'heal', target: 'hero', text: '+45 TORCH' });
      logLines.push('🔥 Relit ancient wall brazier (+45% Torchlight)!');
    } else if (ent.type === 'lore') {
      ent.done = true;
      const unlocked = new Set(Array.isArray(flags.loreUnlocked) ? flags.loreUnlocked : []);
      const nextLore = LORE_CODEX.find((l) => !unlocked.has(l.id)) || LORE_CODEX[0];
      unlocked.add(nextLore.id);
      flags.loreUnlocked = [...unlocked];
      dungeon.satchel.shards = (dungeon.satchel.shards || 0) + 15;
      events.push({ kind: 'secret', target: 'hero', text: 'LORE +15✦' });
      logLines.push(`📜 Deciphered Lore: "${nextLore.title}" (+15 ✦ Shards)!`);
    } else if (ent.type === 'trap') {
      ent.detected = true;
      if (ent.disarmed) {
        logLines.push('⚙️ Stepped past a disarmed spike plate.');
      } else if (Math.random() * 100 < heroStats.intuition * 1.4) {
        ent.disarmed = true;
        ent.done = true;
        logLines.push('👁️ High Intuition spotted the tripwire in time! Safely bypassed.');
        events.push({ kind: 'dodge', target: 'hero', text: 'INTUITION!' });
      } else {
        ent.triggered = true;
        ent.done = true;
        const dmg = Math.max(4, Math.round(heroStats.maxHp * 0.14));
        hp = Math.max(1, hp - dmg);
        events.push({ kind: 'trap', target: 'hero', value: dmg, text: `TRAP -${dmg}` });
        logLines.push(`💥 Triggered a hidden Spike Trap (-${dmg} HP)! Use Search with high Intuition to disarm traps.`);
      }
    } else if (ent.type === 'chest') {
      encounter = {
        type: 'chest',
        entityId: ent.id,
        isSecretVault: Boolean(ent.isSecretVault),
        lockpickChance: Math.min(90, Math.round(45 + heroStats.luck * 0.9)),
      };
      logLines.push(ent.isSecretVault ? '✨ Secret Vault Chest discovered!' : '🧰 Found a chained Dungeon Chest!');
    } else if (ent.type === 'riddle') {
      encounter = {
        type: 'riddle',
        entityId: ent.id,
        riddleId: ent.riddleId,
      };
      logLines.push('🗿 Reached a glowing Runic Riddle Pillar!');
    } else if (ent.type === 'shrine') {
      encounter = {
        type: 'shrine',
        entityId: ent.id,
        gambleChance: Math.min(82, Math.round(38 + heroStats.luck * 0.85)),
      };
      logLines.push('⛩️ Discovered an Altar of Fortune in the mist.');
    } else if (ent.type === 'monster' || ent.type === 'boss') {
      const cycle = ent.cycle || ['STRIKE', 'HEAVY', 'SHELL'];
      const intent = cycle[0];
      encounter = {
        type: 'combat',
        entityId: ent.id,
        isBoss: ent.type === 'boss',
        turn: 1,
        enemy: {
          key: ent.key,
          name: ent.name,
          hp: ent.hp,
          maxHp: ent.maxHp,
          atk: ent.atk,
          def: ent.def,
          xpReward: ent.xpReward,
          shardReward: ent.shardReward,
          cycle,
          intentIndex: 0,
          intent,
          intentValue: computeIntentValue(ent, intent, dungeon.floor),
          stunned: false,
          vulnerableTurns: 0,
          armorBrokenTurns: 0,
          atkBonus: 0,
        },
        heroStatuses: { poisonTurns: 0, poisonDmg: 0 },
      };
      logLines.push(`${ent.type === 'boss' ? '👑 BOSS BATTLE:' : '⚔️ Encountered'} ${ent.name}!`);
    }
  }

  const nextLogs = logLines.length ? appendLogs(profile, logLines) : profile.last_log_json;
  db.prepare(`
    UPDATE game_profiles
    SET hp = ?, story_flags_json = ?, dungeon_state_json = ?, active_encounter_json = ?, last_log_json = ?, updated_at = ?
    WHERE user_id = ?
  `).run(hp, JSON.stringify(flags), JSON.stringify(dungeon), encounter ? JSON.stringify(encounter) : null, nextLogs, Date.now(), user.id);

  return { game: buildGameState(db, user, userStats), events, droppedItem: null };
}

export function dungeonSearch(db, user, userStats) {
  const profile = ensureGameProfile(db, user.id);
  if (profile.mode !== 'dungeon' || !profile.dungeon_state_json) throw new Error('Not inside a dungeon');
  if (profile.active_encounter_json) throw new Error('Finish the current encounter first');

  const dungeon = JSON.parse(profile.dungeon_state_json);
  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const heroStats = computeHeroStats(profile, rawItems, computeStudyBonuses(user, userStats));
  let quests = parseJsonSafe(profile.active_quests_json, []);

  const { playerX: px, playerY: py, tiles, entities } = dungeon;
  let foundSecret = false;
  let disarmedCount = 0;
  let xpGain = 0;
  let shardsGain = 0;
  const events = [];

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = px + dx;
      const ny = py + dy;
      if (tiles[ny]?.[nx] === 'S') {
        tiles[ny][nx] = '.';
        foundSecret = true;
        xpGain += 18;
        events.push({ kind: 'secret', target: 'hero', text: 'SECRET PASSAGE!' });
      }
      const trap = entities.find((e) => !e.done && e.type === 'trap' && e.x === nx && e.y === ny && !e.disarmed);
      if (trap) {
        trap.detected = true;
        trap.disarmed = true;
        trap.done = true;
        disarmedCount++;
        xpGain += 15;
        shardsGain += 12;
        events.push({ kind: 'secret', target: 'hero', text: 'DISARMED +12✦' });
      }
    }
  }

  let logMsg;
  if (foundSecret || disarmedCount > 0) {
    updateDungeonFov(dungeon, heroStats.visionRadius, heroStats.intuition);
    dungeon.satchel.shards = (dungeon.satchel.shards || 0) + shardsGain;
    quests = incrementBountyProgress(quests, 'bounty_seeker', 1);
    const parts = [];
    if (foundSecret) parts.push('Cracked Secret Wall crumbled open — Secret Vault revealed!');
    if (disarmedCount > 0) parts.push(`Disarmed ${disarmedCount} trap(s) (+${shardsGain} ✦)`);
    logMsg = `🔍 ${parts.join(' & ')}`;
  } else {
    // True Intuition directional whisper toward nearest Key or Cracked Secret Wall
    let target = entities.find((e) => !e.done && e.type === 'key');
    let label = 'Bronze Key';
    if (!target) {
      for (let y = 0; y < tiles.length; y++) {
        for (let x = 0; x < tiles[0].length; x++) {
          if (tiles[y][x] === 'S') {
            target = { x, y };
            label = 'hollow wall';
          }
        }
      }
    }
    if (target) {
      const ns = target.y < py ? 'North' : target.y > py ? 'South' : '';
      const ew = target.x < px ? 'West' : target.x > px ? 'East' : '';
      const dir = [ns, ew].filter(Boolean).join('-') || 'right beneath you';
      logMsg = `🔍 Intuition (${heroStats.intuition}): Senses a faint resonance (${label}) toward the ${dir}.`;
    } else {
      logMsg = '🔍 Searched the stones nearby — this chamber is clear.';
    }
    events.push({ kind: 'explore', target: 'hero', text: 'SEARCHED' });
  }

  const nextLogs = appendLogs(profile, [logMsg]);
  db.prepare(`
    UPDATE game_profiles
    SET hero_xp = hero_xp + ?, active_quests_json = ?, dungeon_state_json = ?, last_log_json = ?, updated_at = ?
    WHERE user_id = ?
  `).run(xpGain, JSON.stringify(quests), JSON.stringify(dungeon), nextLogs, Date.now(), user.id);

  return { game: buildGameState(db, user, userStats), events, message: logMsg };
}

export function dungeonUseTorch(db, user, userStats) {
  const profile = ensureGameProfile(db, user.id);
  if (profile.mode !== 'dungeon' || !profile.dungeon_state_json) throw new Error('Not inside a dungeon');
  if ((profile.torches || 0) < 1) throw new Error('Out of Torches! Craft at Lyra’s or buy in the Store.');

  const dungeon = JSON.parse(profile.dungeon_state_json);
  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const heroStats = computeHeroStats(profile, rawItems, computeStudyBonuses(user, userStats));

  dungeon.torch = Math.min(100, (dungeon.torch || 0) + 55);
  updateDungeonFov(dungeon, heroStats.visionRadius, heroStats.intuition);
  const nextLogs = appendLogs(profile, ['🔥 Lit a fresh Dungeon Torch — warm light chases back the Fog!']);

  db.prepare(`
    UPDATE game_profiles SET torches = torches - 1, dungeon_state_json = ?, last_log_json = ?, updated_at = ? WHERE user_id = ?
  `).run(JSON.stringify(dungeon), nextLogs, Date.now(), user.id);

  return { game: buildGameState(db, user, userStats), events: [{ kind: 'heal', target: 'hero', text: '+55 TORCH' }] };
}

export function dungeonExtract(db, user, userStats) {
  const profile = ensureGameProfile(db, user.id);
  if (profile.mode !== 'dungeon' || !profile.dungeon_state_json) throw new Error('Not in dungeon');
  const dungeon = JSON.parse(profile.dungeon_state_json);
  const onStairs = dungeon.playerX === dungeon.entranceX && dungeon.playerY === dungeon.entranceY;
  if (!onStairs && !dungeon.bossDefeated) {
    throw new Error('Walk back to the Extraction Stairs (🚪) or slay the Floor Boss to extract safely!');
  }

  const s = dungeon.satchel || { shards: 0, coins: 0, herbs: 0, items: [], questRelics: [] };
  const flags = parseJsonSafe(profile.story_flags_json, {});
  for (const rel of s.questRelics || []) flags[rel] = true;

  for (const spec of s.items || []) {
    insertLootSpec(db, user.id, spec);
  }
  if (s.coins > 0) {
    db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(s.coins, user.id);
  }

  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const heroStats = computeHeroStats(profile, rawItems, computeStudyBonuses(user, userStats));
  const msg = `🏡 Extracted safely to Oakhaven! Banked +${s.shards} ✦, +${s.coins} 🪙, +${s.herbs} 🌿 & ${(s.items || []).length} gear item(s)!`;
  const nextLogs = appendLogs(profile, [msg]);

  db.prepare(`
    UPDATE game_profiles
    SET mode = 'village', shards = shards + ?, herbs = herbs + ?, hp = MIN(?, hp + 20),
        story_flags_json = ?, active_encounter_json = NULL, dungeon_state_json = NULL, last_log_json = ?, updated_at = ?
    WHERE user_id = ?
  `).run(s.shards || 0, s.herbs || 0, heroStats.maxHp, JSON.stringify(flags), nextLogs, Date.now(), user.id);

  const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  return { game: buildGameState(db, refreshedUser, userStats), message: msg, events: [{ kind: 'loot', target: 'hero', text: 'EXTRACTED!' }] };
}

// ==========================================
// TACTICAL INTENT COMBAT & PUZZLE / EVENTS
// ==========================================

export function resolveCombatAction(db, user, userStats, action) {
  const profile = ensureGameProfile(db, user.id);
  const encounter = parseJsonSafe(profile.active_encounter_json, null);
  if (!encounter || encounter.type !== 'combat') {
    throw new Error('No active combat encounter.');
  }

  const dungeon = profile.mode === 'dungeon' ? parseJsonSafe(profile.dungeon_state_json, null) : null;
  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const studyBonuses = computeStudyBonuses(user, userStats);
  const heroStats = computeHeroStats(profile, rawItems, studyBonuses);
  const affinity = parseJsonSafe(profile.npc_affinity_json, {});
  const lyraTrusted = (affinity.lyra || 0) >= 25;

  let heroHp = heroStats.hp;
  let focusCharge = profile.focus_charge;
  let potions = profile.potions;
  const enemy = { ...encounter.enemy };
  const heroStatuses = { poisonTurns: encounter.heroStatuses?.poisonTurns || 0, poisonDmg: encounter.heroStatuses?.poisonDmg || 0 };
  const events = [];
  const logLines = [];
  let guarding = false;
  let potionWard = false;
  let droppedItem = null;

  if (action === 'flee') {
    if (dungeon && encounter.entityId) {
      const target = dungeon.entities.find((e) => e.id === encounter.entityId);
      if (target) target.hp = enemy.hp;
    }
    const nextLogs = appendLogs(profile, [`🏃 Disengaged cleanly from ${enemy.name} into the mist.`]);
    db.prepare(
      'UPDATE game_profiles SET active_encounter_json = NULL, dungeon_state_json = ?, last_log_json = ?, updated_at = ? WHERE user_id = ?'
    ).run(dungeon ? JSON.stringify(dungeon) : profile.dungeon_state_json, nextLogs, Date.now(), user.id);
    return { game: buildGameState(db, user, userStats), events: [{ kind: 'dodge', target: 'hero', text: 'ESCAPED' }], droppedItem: null };
  }

  // Player Turn Resolution against Enemy Intent
  if (action === 'attack') {
    if (enemy.intent === 'SHELL' && !enemy.stunned) {
      const chip = Math.max(1, Math.round(heroStats.atk * 0.25));
      const recoil = Math.max(3, Math.round((enemy.atk + (enemy.atkBonus || 0)) * 0.45));
      enemy.hp = Math.max(0, enemy.hp - chip);
      heroHp = Math.max(1, heroHp - recoil);
      events.push({ kind: 'hit', target: 'enemy', value: chip, text: `SHELL -${chip}` });
      events.push({ kind: 'enemy_hit', target: 'hero', value: recoil, text: `THORNS -${recoil}` });
      logLines.push(`🛡️ Clanked off ${enemy.name}’s Iron Shell (-${chip}) & took ${recoil} Thorns recoil! Use ⚡ Focus Break!`);
    } else {
      const vulnMult = enemy.vulnerableTurns > 0 ? 1.5 : 1.0;
      const effDef = enemy.armorBrokenTurns > 0 ? enemy.def * 0.4 : enemy.def * 0.6;
      const raw = heroStats.atk * (0.94 + Math.random() * 0.16) - effDef;
      const isCrit = Math.random() * 100 < heroStats.critPct + heroStats.luck * 0.15;
      const dmg = Math.max(3, Math.round(raw * vulnMult * (isCrit ? 1.7 : 1)));
      enemy.hp = Math.max(0, enemy.hp - dmg);
      focusCharge = Math.min(100, focusCharge + 25);
      events.push({ kind: isCrit ? 'crit' : 'hit', target: 'enemy', value: dmg, text: isCrit ? `CRIT ${dmg}!` : `-${dmg}` });
      logLines.push(`⚔️ ${isCrit ? 'CRITICAL' : 'Strike'} dealt ${dmg} DMG${vulnMult > 1 ? ' (Vulnerable!)' : ''}.`);
      if (isCrit && enemy.intent === 'RITUAL' && !enemy.stunned) {
        enemy.stunned = true;
        enemy.vulnerableTurns = 2;
        logLines.push('⚡ Critical Strike INTERRUPTED Dark Ritual!');
      }
    }
  } else if (action === 'skill') {
    if (focusCharge < 40) throw new Error('Need 40% Focus Charge for Focus Break!');
    focusCharge -= 40;
    const mageMult = profile.hero_class === 'hero_mage' ? 1.15 : 1.0;
    const vulnMult = enemy.vulnerableTurns > 0 ? 1.45 : 1.0;
    if (enemy.intent === 'SHELL' && !enemy.stunned) {
      const dmg = Math.max(8, Math.round(heroStats.atk * 1.8 * mageMult));
      enemy.hp = Math.max(0, enemy.hp - dmg);
      enemy.stunned = true;
      enemy.armorBrokenTurns = 2;
      events.push({ kind: 'crit', target: 'enemy', value: dmg, text: `SHATTER -${dmg}!` });
      logLines.push(`💥 SHATTERED ${enemy.name}’s Iron Shell for ${dmg} DMG! Enemy STUNNED!`);
    } else if (enemy.intent === 'RITUAL' && !enemy.stunned) {
      const dmg = Math.max(8, Math.round(heroStats.atk * 1.65 * mageMult));
      enemy.hp = Math.max(0, enemy.hp - dmg);
      enemy.stunned = true;
      enemy.vulnerableTurns = 2;
      events.push({ kind: 'crit', target: 'enemy', value: dmg, text: `INTERRUPT -${dmg}!` });
      logLines.push(`⚡ INTERRUPTED Dark Ritual for ${dmg} DMG! Enemy STUNNED & Vulnerable!`);
    } else {
      const dmg = Math.max(7, Math.round(heroStats.atk * 1.6 * mageMult * vulnMult));
      enemy.hp = Math.max(0, enemy.hp - dmg);
      events.push({ kind: 'crit', target: 'enemy', value: dmg, text: `BREAK -${dmg}` });
      logLines.push(`✨ Focus Break pierced armor for ${dmg} DMG!`);
    }
  } else if (action === 'guard') {
    guarding = true;
    const heal = Math.max(3, Math.round(heroStats.maxHp * 0.06));
    heroHp = Math.min(heroStats.maxHp, heroHp + heal);
    focusCharge = Math.min(100, focusCharge + (enemy.intent === 'HEAVY' ? 40 : 30));
    events.push({ kind: 'guard', target: 'hero', value: heal, text: enemy.intent === 'HEAVY' ? 'PARRY READY!' : `WARD +${heal}` });
    logLines.push(`🛡️ Raised Parry & Ward stance (+${heal} HP).`);
  } else if (action === 'potion') {
    if (potions < 1) throw new Error('No Healing Potions left!');
    potions -= 1;
    potionWard = true;
    const healRatio = lyraTrusted ? 0.75 : 0.55;
    const heal = Math.max(18, Math.round(heroStats.maxHp * healRatio));
    heroHp = Math.min(heroStats.maxHp, heroHp + heal);
    heroStatuses.poisonTurns = 0;
    events.push({ kind: 'heal', target: 'hero', value: heal, text: `+${heal} HP` });
    logLines.push(`🧪 Drank Potion: restored +${heal} HP & cleansed Venom!`);
  } else {
    throw new Error('Invalid combat action.');
  }

  // Victory Handler
  if (enemy.hp <= 0) {
    const isBoss = Boolean(encounter.isBoss);
    const xpMult = profile.hero_class === 'hero_scholar' ? 1.1 : 1.0;
    const heroXpGain = Math.round(enemy.xpReward * xpMult);
    const shardsGain = enemy.shardReward + (isBoss ? Math.round(heroStats.luck * 0.35) : 0);
    const coinsGain = Math.max(4, Math.round((isBoss ? 18 : 6) + (dungeon?.floor || profile.floor) * 2));

    let flags = parseJsonSafe(profile.story_flags_json, {});
    let quests = parseJsonSafe(profile.active_quests_json, []);
    quests = incrementBountyProgress(quests, 'bounty_slayer', 1);

    const dropChance = isBoss ? 1.0 : Math.min(0.9, 0.45 + heroStats.luck * 0.0055);
    const curFloor = dungeon ? dungeon.floor : profile.floor;
    if (Math.random() < dropChance) {
      const spec = rollLootSpec(curFloor, heroStats.luck, { minRarity: isBoss ? 'rare' : undefined });
      if (dungeon) {
        dungeon.satchel.items.push(spec);
        droppedItem = formatSatchelPreview(spec, -dungeon.satchel.items.length);
      } else {
        droppedItem = insertLootSpec(db, user.id, spec);
      }
      events.push({ kind: 'loot', target: 'enemy', text: `${spec.rarity.toUpperCase()}!` });
      logLines.unshift(`🎁 Loot Drop: [${spec.rarity.toUpperCase()}] ${spec.name}!`);
    }

    if (dungeon && encounter.entityId) {
      const ent = dungeon.entities.find((e) => e.id === encounter.entityId);
      if (ent) ent.done = true;
      dungeon.satchel.shards = (dungeon.satchel.shards || 0) + shardsGain;
      dungeon.satchel.coins = (dungeon.satchel.coins || 0) + coinsGain;
      if (isBoss) {
        dungeon.bossDefeated = true;
        flags[`boss_${curFloor}_slain`] = true;
        if (curFloor >= 3 && !flags.pip_compass_found) {
          dungeon.satchel.questRelics.push('pip_compass_found');
          logLines.unshift('🧭 Found Pip’s Starlight Compass in the Boss’s Vault!');
        }
      }
    }

    const nextBest = isBoss ? Math.max(profile.best_floor, curFloor + 1) : profile.best_floor;
    const nextFloor = isBoss ? curFloor + 1 : curFloor;
    const nextLogs = appendLogs(profile, logLines.slice(0, 3));

    db.prepare(`
      UPDATE game_profiles
      SET hero_xp = hero_xp + ?, hp = ?, potions = ?, focus_charge = ?,
          shards = shards + ?, floor = ?, best_floor = ?,
          monsters_slain = monsters_slain + 1, bosses_slain = bosses_slain + ?,
          story_flags_json = ?, active_quests_json = ?,
          dungeon_state_json = ?, active_encounter_json = NULL, last_log_json = ?, updated_at = ?
      WHERE user_id = ?
    `).run(
      heroXpGain,
      heroHp,
      potions,
      focusCharge,
      dungeon ? 0 : shardsGain,
      nextFloor,
      nextBest,
      isBoss ? 1 : 0,
      JSON.stringify(flags),
      JSON.stringify(quests),
      dungeon ? JSON.stringify(dungeon) : profile.dungeon_state_json,
      nextLogs,
      Date.now(),
      user.id
    );
    if (!dungeon) {
      db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(coinsGain, user.id);
    }
    consumeLuckBuffCharge(db, profile);
    return { game: buildGameState(db, user, userStats), events, droppedItem };
  }

  // Enemy Turn (Respects Stun, Heavy Parry, Ritual, Hex)
  const darkBonus = dungeon && dungeon.torch < 25 ? 1.25 : 1.0;
  if (enemy.stunned) {
    enemy.stunned = false;
    events.push({ kind: 'secret', target: 'enemy', text: 'STUNNED!' });
    logLines.push(`💫 ${enemy.name} is STUNNED and loses its turn!`);
  } else {
    const intent = enemy.intent;
    const effAtk = (enemy.atk + (enemy.atkBonus || 0)) * darkBonus;

    if (intent === 'HEAVY') {
      if (guarding) {
        const enemyDmg = Math.max(1, Math.round(effAtk * 2.1 * 0.15));
        const riposte = Math.max(5, Math.round(heroStats.atk * 0.8));
        heroHp = Math.max(0, heroHp - enemyDmg);
        enemy.hp = Math.max(0, enemy.hp - riposte);
        enemy.stunned = true;
        enemy.vulnerableTurns = 2;
        events.push({ kind: 'parry', target: 'hero', text: 'PERFECT PARRY!' });
        events.push({ kind: 'crit', target: 'enemy', value: riposte, text: `RIPOSTE -${riposte}` });
        logLines.push(`⚔️ PERFECT PARRY! Blunted Crushing Blow (-${enemyDmg} HP), STUNNED foe & countered for ${riposte}!`);
      } else {
        const dodged = Math.random() * 100 < heroStats.dodgePct;
        if (dodged) {
          events.push({ kind: 'dodge', target: 'hero', text: 'DODGE!' });
          logLines.push(`💨 Barely dodged ${enemy.name}’s Crushing Blow!`);
        } else {
          const red = potionWard ? 0.6 : 1.0;
          const enemyDmg = Math.max(3, Math.round((effAtk * 2.1 - heroStats.def * 0.5) * red));
          heroHp = Math.max(0, heroHp - enemyDmg);
          events.push({ kind: 'enemy_hit', target: 'hero', value: enemyDmg, text: `CRUSH -${enemyDmg}` });
          logLines.push(`💥 CRUSHING BLOW hit for ${enemyDmg} DMG!`);
        }
      }
    } else if (intent === 'RITUAL') {
      const healAmt = Math.max(8, Math.round(enemy.maxHp * 0.25));
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmt);
      enemy.atkBonus = (enemy.atkBonus || 0) + 4;
      events.push({ kind: 'enemy_hit', target: 'enemy', text: `+${healAmt} HP & +4 ATK` });
      logLines.push(`🩸 ${enemy.name} finished Dark Ritual (+${healAmt} HP & +4 ATK)! Should have interrupted with ⚡ Focus Break!`);
    } else if (intent === 'HEX') {
      const dmgRed = guarding ? 0.35 : potionWard ? 0.6 : 1.0;
      const dmg = Math.max(1, Math.round((effAtk * 0.8 - heroStats.def * 0.4) * dmgRed));
      heroHp = Math.max(0, heroHp - dmg);
      events.push({ kind: 'enemy_hit', target: 'hero', value: dmg, text: `-${dmg}` });
      if (guarding) {
        logLines.push(`🛡️ Warded off ${enemy.name}’s Venom Hex (-${dmg} HP)!`);
      } else {
        heroStatuses.poisonTurns = 3;
        heroStatuses.poisonDmg = Math.max(3, Math.round(heroStats.maxHp * 0.07));
        logLines.push(`☠️ Hexed! Took ${dmg} DMG + Venom (-${heroStatuses.poisonDmg}/turn)!`);
      }
    } else {
      // STRIKE or SHELL light hit
      const mult = intent === 'SHELL' ? 0.6 : 1.0;
      const dmgRed = guarding ? 0.4 : potionWard ? 0.6 : 1.0;
      const dmg = Math.max(1, Math.round((effAtk * mult - heroStats.def * 0.55) * dmgRed));
      heroHp = Math.max(0, heroHp - dmg);
      events.push({ kind: 'enemy_hit', target: 'hero', value: dmg, text: `-${dmg}` });
      logLines.push(`💥 ${enemy.name} struck for ${dmg} DMG.`);
    }
  }

  // Apply Poison Tick at end of round
  if (heroHp > 0 && heroStatuses.poisonTurns > 0) {
    heroHp = Math.max(0, heroHp - heroStatuses.poisonDmg);
    heroStatuses.poisonTurns--;
    events.push({ kind: 'trap', target: 'hero', value: heroStatuses.poisonDmg, text: `VENOM -${heroStatuses.poisonDmg}` });
  }

  // Check if Riposte Killed Enemy
  if (enemy.hp <= 0) {
    // Re-enter clean defeat branch by running simplified victory
    const curFloor = dungeon ? dungeon.floor : profile.floor;
    const isBoss = Boolean(encounter.isBoss);
    const coinsGain = Math.max(4, Math.round((isBoss ? 18 : 6) + curFloor * 2));
    const shardsGain = enemy.shardReward;
    const spec = rollLootSpec(curFloor, heroStats.luck, { minRarity: isBoss ? 'rare' : undefined });
    if (dungeon) {
      dungeon.satchel.items.push(spec);
      dungeon.satchel.shards += shardsGain;
      dungeon.satchel.coins += coinsGain;
      if (encounter.entityId) {
        const ent = dungeon.entities.find((e) => e.id === encounter.entityId);
        if (ent) ent.done = true;
      }
      if (isBoss) dungeon.bossDefeated = true;
      droppedItem = formatSatchelPreview(spec, -dungeon.satchel.items.length);
    } else {
      droppedItem = insertLootSpec(db, user.id, spec);
      db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(coinsGain, user.id);
    }
    const nextLogs = appendLogs(profile, [`⚡ Riposte finished ${enemy.name}! Looted ${spec.name}.`]);
    db.prepare(`
      UPDATE game_profiles SET hp = ?, potions = ?, focus_charge = ?, monsters_slain = monsters_slain + 1,
      dungeon_state_json = ?, active_encounter_json = NULL, last_log_json = ?, updated_at = ? WHERE user_id = ?
    `).run(Math.max(1, heroHp), potions, focusCharge, dungeon ? JSON.stringify(dungeon) : profile.dungeon_state_json, nextLogs, Date.now(), user.id);
    return { game: buildGameState(db, user, userStats), events, droppedItem };
  }

  // Hero Defeat -> Extract back to Oakhaven losing 50% unbanked Satchel shards/coins & unbanked satchel items
  if (heroHp <= 0) {
    const reviveHp = Math.round(heroStats.maxHp * 0.55);
    const keptShards = dungeon ? Math.floor((dungeon.satchel?.shards || 0) * 0.5) : 0;
    const keptCoins = dungeon ? Math.floor((dungeon.satchel?.coins || 0) * 0.5) : 0;
    if (keptCoins > 0) db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(keptCoins, user.id);
    const nextLogs = appendLogs(profile, [
      `💀 Fallen in Floor ${dungeon?.floor || profile.floor}! Pip dragged you back to Oakhaven (rescued ${keptShards}✦, ${keptCoins}🪙; unbanked gear lost).`,
    ]);
    db.prepare(`
      UPDATE game_profiles
      SET mode = 'village', hp = ?, potions = ?, focus_charge = 50, shards = shards + ?,
          dungeon_state_json = NULL, active_encounter_json = NULL, last_log_json = ?, updated_at = ?
      WHERE user_id = ?
    `).run(reviveHp, potions, keptShards, nextLogs, Date.now(), user.id);
    events.push({ kind: 'defeat', target: 'hero', text: 'RESCUED!' });
    const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    return { game: buildGameState(db, refreshedUser, userStats), events, droppedItem: null };
  }

  // Advance Statuses & Select Next Explicit Intent
  if (enemy.vulnerableTurns > 0) enemy.vulnerableTurns--;
  if (enemy.armorBrokenTurns > 0) enemy.armorBrokenTurns--;

  let nextIdx = enemy.intentIndex || 0;
  let nextIntent;
  if (enemy.stunned) {
    nextIntent = 'STUNNED';
  } else {
    nextIdx = (nextIdx + 1) % enemy.cycle.length;
    nextIntent = enemy.cycle[nextIdx];
  }
  enemy.intentIndex = nextIdx;
  enemy.intent = nextIntent;
  enemy.intentValue = computeIntentValue(enemy, nextIntent, dungeon?.floor || profile.floor);

  const updatedEncounter = { ...encounter, enemy, heroStatuses, turn: (encounter.turn || 1) + 1 };
  const nextLogs = appendLogs(profile, logLines.slice(0, 3));
  db.prepare(`
    UPDATE game_profiles SET hp = ?, potions = ?, focus_charge = ?, active_encounter_json = ?, last_log_json = ?, updated_at = ? WHERE user_id = ?
  `).run(heroHp, potions, focusCharge, JSON.stringify(updatedEncounter), nextLogs, Date.now(), user.id);

  return { game: buildGameState(db, user, userStats), events, droppedItem: null };
}

export function resolveEventChoice(db, user, userStats, choice) {
  const profile = ensureGameProfile(db, user.id);
  const encounter = parseJsonSafe(profile.active_encounter_json, null);
  if (!encounter || encounter.type === 'combat' || encounter.type === 'riddle') {
    throw new Error('No active event encounter.');
  }

  const dungeon = profile.mode === 'dungeon' ? parseJsonSafe(profile.dungeon_state_json, null) : null;
  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const heroStats = computeHeroStats(profile, rawItems, computeStudyBonuses(user, userStats));

  let heroHp = heroStats.hp;
  let shardsGain = 0;
  let coinsGain = 0;
  let coinsCost = 0;
  let focusDelta = 0;
  let droppedItem = null;
  const curFloor = dungeon ? dungeon.floor : profile.floor;
  const flags = parseJsonSafe(profile.story_flags_json, {});
  const events = [];
  const logLines = [];

  if (encounter.type === 'chest') {
    const minRare = encounter.isSecretVault ? 'rare' : 'common';
    if (choice === 'open_safe') {
      const spec = rollLootSpec(curFloor, heroStats.luck, { minRarity: minRare });
      if (dungeon) {
        dungeon.satchel.items.push(spec);
        droppedItem = formatSatchelPreview(spec, -dungeon.satchel.items.length);
      } else {
        droppedItem = insertLootSpec(db, user.id, spec);
      }
      shardsGain = 14 + curFloor * 4;
      coinsGain = 8 + curFloor * 2;
      events.push({ kind: 'loot', target: 'enemy', text: `${spec.rarity.toUpperCase()}!` });
      logLines.push(`🧰 Opened Chest safely: +${shardsGain}✦, +${coinsGain}🪙 & [${spec.rarity.toUpperCase()}] ${spec.name}!`);
    } else if (choice === 'lockpick') {
      const success = Math.random() * 100 < (encounter.lockpickChance || 50);
      if (success) {
        const spec = rollLootSpec(curFloor, heroStats.luck, { minRarity: encounter.isSecretVault ? 'epic' : 'uncommon', bonusLuck: 28 });
        if (dungeon) {
          dungeon.satchel.items.push(spec);
          droppedItem = formatSatchelPreview(spec, -dungeon.satchel.items.length);
        } else {
          droppedItem = insertLootSpec(db, user.id, spec);
        }
        shardsGain = 26 + curFloor * 6;
        coinsGain = 16 + curFloor * 4;
        events.push({ kind: 'loot', target: 'enemy', text: 'JACKPOT!' });
        logLines.push(`🗝️ Lucky Lockpick! Found [${spec.rarity.toUpperCase()}] ${spec.name}!`);
      } else {
        const trapDmg = Math.max(5, Math.round(heroStats.maxHp * 0.14));
        heroHp = Math.max(1, heroHp - trapDmg);
        const spec = rollLootSpec(curFloor, heroStats.luck, { minRarity: 'common' });
        if (dungeon) {
          dungeon.satchel.items.push(spec);
          droppedItem = formatSatchelPreview(spec, -dungeon.satchel.items.length);
        } else {
          droppedItem = insertLootSpec(db, user.id, spec);
        }
        shardsGain = 10;
        events.push({ kind: 'trap', target: 'hero', value: trapDmg, text: `TRAP -${trapDmg}` });
        logLines.push(`💥 Lockpick snapped (-${trapDmg} HP), still grabbed ${spec.name}!`);
      }
    }

    if (encounter.isSecretVault && curFloor >= 2 && !flags.bram_tongs_found && dungeon) {
      if (!dungeon.satchel.questRelics.includes('bram_tongs_found')) {
        dungeon.satchel.questRelics.push('bram_tongs_found');
        logLines.unshift('⚒️ Found Bram’s Runic Tongs inside the Secret Vault!');
      }
    }
    db.prepare('UPDATE game_profiles SET chests_opened = chests_opened + 1 WHERE user_id = ?').run(user.id);
    consumeLuckBuffCharge(db, profile);
  } else if (encounter.type === 'shrine') {
    if (choice === 'shrine_bless') {
      const heal = Math.round(heroStats.maxHp * 0.25);
      heroHp = Math.min(heroStats.maxHp, heroHp + heal);
      shardsGain = 15;
      db.prepare('UPDATE game_profiles SET luck_buff_charges = luck_buff_charges + 4, luck_buff_amount = MAX(luck_buff_amount, 12) WHERE user_id = ?').run(user.id);
      events.push({ kind: 'heal', target: 'hero', value: heal, text: '+12 LUCK!' });
      logLines.push(`⛩️ Shrine Blessing: +12 LUCK (4x), +${heal} HP & +15✦!`);
    } else if (choice === 'shrine_gamble') {
      if (user.coins < 20) throw new Error('Need 20 Focus Coins to gamble!');
      coinsCost = 20;
      const win = Math.random() * 100 < (encounter.gambleChance || 45);
      if (win) {
        coinsGain = 55;
        const spec = rollLootSpec(curFloor, heroStats.luck, { minRarity: 'rare', bonusLuck: 18 });
        if (dungeon) {
          dungeon.satchel.items.push(spec);
          droppedItem = formatSatchelPreview(spec, -dungeon.satchel.items.length);
        } else {
          droppedItem = insertLootSpec(db, user.id, spec);
        }
        events.push({ kind: 'loot', target: 'enemy', text: 'FORTUNE!' });
        logLines.push(`🎲 Shrine Jackpot! +55🪙 & [${spec.rarity.toUpperCase()}] ${spec.name}!`);
      } else {
        shardsGain = 18;
        events.push({ kind: 'heal', target: 'hero', text: '+18 SHARDS' });
        logLines.push(`🎲 Shrine returned +18✦ Shards for your tribute.`);
      }
    } else {
      const heal = Math.round(heroStats.maxHp * 0.55);
      heroHp = Math.min(heroStats.maxHp, heroHp + heal);
      focusDelta = 30;
      events.push({ kind: 'heal', target: 'hero', value: heal, text: `+${heal} HP` });
      logLines.push(`🔥 Shrine Ember: healed +${heal} HP & +30% Focus Charge.`);
    }
  }

  if (dungeon) {
    if (encounter.entityId) {
      const ent = dungeon.entities.find((e) => e.id === encounter.entityId);
      if (ent) ent.done = true;
    }
    dungeon.satchel.shards = (dungeon.satchel.shards || 0) + shardsGain;
    dungeon.satchel.coins = (dungeon.satchel.coins || 0) + coinsGain;
  } else {
    db.prepare('UPDATE game_profiles SET shards = shards + ? WHERE user_id = ?').run(shardsGain, user.id);
    if (coinsGain > 0) db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(coinsGain, user.id);
  }
  if (coinsCost > 0) {
    db.prepare('UPDATE users SET coins = MAX(0, coins - ?) WHERE id = ?').run(coinsCost, user.id);
  }

  const nextLogs = appendLogs(profile, logLines);
  db.prepare(`
    UPDATE game_profiles
    SET hp = ?, focus_charge = MIN(100, focus_charge + ?), dungeon_state_json = ?, active_encounter_json = NULL, last_log_json = ?, updated_at = ?
    WHERE user_id = ?
  `).run(heroHp, focusDelta, dungeon ? JSON.stringify(dungeon) : profile.dungeon_state_json, nextLogs, Date.now(), user.id);

  const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  return { game: buildGameState(db, refreshedUser, userStats), events, droppedItem };
}

export function resolvePuzzleChoice(db, user, userStats, optionIndex) {
  const profile = ensureGameProfile(db, user.id);
  const encounter = parseJsonSafe(profile.active_encounter_json, null);
  if (!encounter || encounter.type !== 'riddle') throw new Error('No active riddle pillar');

  const dungeon = profile.mode === 'dungeon' && profile.dungeon_state_json ? JSON.parse(profile.dungeon_state_json) : null;
  const riddle = DUNGEON_RIDDLES.find((r) => r.id === encounter.riddleId) || DUNGEON_RIDDLES[0];
  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const heroStats = computeHeroStats(profile, rawItems, computeStudyBonuses(user, userStats));
  let flags = parseJsonSafe(profile.story_flags_json, {});
  let quests = parseJsonSafe(profile.active_quests_json, []);

  let hp = heroStats.hp;
  let droppedItem = null;
  let logMsg;
  const events = [];

  if (Number(optionIndex) === riddle.correctIndex) {
    const spec = rollLootSpec(dungeon?.floor || profile.floor, heroStats.luck, { minRarity: 'rare', bonusLuck: 15 });
    if (dungeon) {
      dungeon.satchel.items.push(spec);
      dungeon.satchel.shards = (dungeon.satchel.shards || 0) + 25;
      droppedItem = formatSatchelPreview(spec, -dungeon.satchel.items.length);
    } else {
      droppedItem = insertLootSpec(db, user.id, spec);
      db.prepare('UPDATE game_profiles SET shards = shards + 25 WHERE user_id = ?').run(user.id);
    }
    const lore = new Set(Array.isArray(flags.loreUnlocked) ? flags.loreUnlocked : []);
    if (riddle.loreId) lore.add(riddle.loreId);
    flags.loreUnlocked = [...lore];
    const solved = new Set(Array.isArray(flags.riddlesSolved) ? flags.riddlesSolved : []);
    solved.add(riddle.id);
    flags.riddlesSolved = [...solved];
    quests = incrementBountyProgress(quests, 'bounty_riddle', 1);
    events.push({ kind: 'secret', target: 'enemy', text: 'SOLVED!' });
    logMsg = `🗿 Solved "${riddle.title}"! Unlocked Lore & found [${spec.rarity.toUpperCase()}] ${spec.name} (+25✦)!`;
  } else {
    const dmg = Math.max(5, Math.round(heroStats.maxHp * 0.14));
    hp = Math.max(1, hp - dmg);
    events.push({ kind: 'trap', target: 'hero', value: dmg, text: `HEX -${dmg}` });
    logMsg = `💥 Wrong rune! Runic backlash struck for -${dmg} HP.`;
  }

  if (dungeon && encounter.entityId) {
    const ent = dungeon.entities.find((e) => e.id === encounter.entityId);
    if (ent) ent.done = true;
  }

  const nextLogs = appendLogs(profile, [logMsg]);
  db.prepare(`
    UPDATE game_profiles
    SET hp = ?, hero_xp = hero_xp + ?, story_flags_json = ?, active_quests_json = ?,
        dungeon_state_json = ?, active_encounter_json = NULL, last_log_json = ?, updated_at = ?
    WHERE user_id = ?
  `).run(
    hp,
    Number(optionIndex) === riddle.correctIndex ? 25 : 0,
    JSON.stringify(flags),
    JSON.stringify(quests),
    dungeon ? JSON.stringify(dungeon) : profile.dungeon_state_json,
    nextLogs,
    Date.now(),
    user.id
  );

  return { game: buildGameState(db, user, userStats), events, droppedItem };
}

// Legacy fallback alias so nothing breaks if called externally
export function exploreRoom(db, user, userStats) {
  return enterDungeon(db, user, userStats);
}

export function equipGameItem(db, user, userStats, itemId) {
  ensureGameProfile(db, user.id);
  const item = db.prepare('SELECT * FROM game_items WHERE id = ? AND user_id = ?').get(itemId, user.id);
  if (!item) throw new Error('Item not found');
  db.prepare('UPDATE game_items SET equipped = 0 WHERE user_id = ? AND slot = ?').run(user.id, item.slot);
  db.prepare('UPDATE game_items SET equipped = 1 WHERE id = ? AND user_id = ?').run(itemId, user.id);
  return { game: buildGameState(db, user, userStats), item: formatGameItem(db.prepare('SELECT * FROM game_items WHERE id = ?').get(itemId)) };
}

export function upgradeGameItem(db, user, userStats, itemId) {
  const profile = ensureGameProfile(db, user.id);
  const item = db.prepare('SELECT * FROM game_items WHERE id = ? AND user_id = ?').get(itemId, user.id);
  if (!item) throw new Error('Item not found');
  if ((item.upgrade_level || 0) >= 10) throw new Error('Gear already at max Forge +10!');

  const affinity = parseJsonSafe(profile.npc_affinity_json, {});
  const disc = (affinity.bram || 0) >= 25 ? 0.8 : 1.0;
  const shardCost = Math.round((15 + (item.upgrade_level || 0) * 12) * disc);
  const coinCost = Math.round((10 + (item.upgrade_level || 0) * 8) * disc);
  if (profile.shards < shardCost) throw new Error(`Need ${shardCost} Arcane Shards`);
  if (user.coins < coinCost) throw new Error(`Need ${coinCost} Focus Coins`);

  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const heroStats = computeHeroStats(profile, rawItems, computeStudyBonuses(user, userStats));
  const greatChance = Math.min(35, 6 + heroStats.luck * 0.45);
  const greatSuccess = Math.random() * 100 < greatChance;
  const nextLvl = Math.min(10, (item.upgrade_level || 0) + (greatSuccess ? 2 : 1));

  db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(coinCost, user.id);
  const nextLogs = appendLogs(profile, [`⚒️ Forged ${item.name} to +${nextLvl}${greatSuccess ? ' (LUCKY +2 GREAT SUCCESS!)' : ''}!`]);
  db.prepare('UPDATE game_profiles SET shards = shards - ?, last_log_json = ?, updated_at = ? WHERE user_id = ?').run(
    shardCost,
    nextLogs,
    Date.now(),
    user.id
  );
  db.prepare('UPDATE game_items SET upgrade_level = ? WHERE id = ? AND user_id = ?').run(nextLvl, itemId, user.id);

  return { game: buildGameState(db, user, userStats), greatSuccess, newUpgradeLevel: nextLvl, shardCost, coinCost };
}

export function salvageGameItem(db, user, userStats, { itemId, maxRarity }) {
  const profile = ensureGameProfile(db, user.id);
  let shardsGained = 0;
  let count = 0;

  if (maxRarity) {
    const capIdx = RARITY_ORDER.indexOf(maxRarity);
    if (capIdx < 0 || capIdx >= 3) throw new Error('Invalid bulk salvage rarity cap');
    const allowed = RARITY_ORDER.slice(0, capIdx + 1);
    const candidates = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 0').all(user.id);
    const delStmt = db.prepare('DELETE FROM game_items WHERE id = ? AND user_id = ?');
    for (const row of candidates) {
      if (!allowed.includes(row.rarity)) continue;
      shardsGained += formatGameItem(row).salvageValue;
      delStmt.run(row.id, user.id);
      count++;
    }
    if (count === 0) throw new Error(`No unequipped ${maxRarity} gear to salvage.`);
  } else {
    const row = db.prepare('SELECT * FROM game_items WHERE id = ? AND user_id = ?').get(itemId, user.id);
    if (!row) throw new Error('Item not found');
    if (row.equipped) throw new Error('Unequip item before salvaging');
    shardsGained = formatGameItem(row).salvageValue;
    db.prepare('DELETE FROM game_items WHERE id = ? AND user_id = ?').run(itemId, user.id);
    count = 1;
  }

  const nextLogs = appendLogs(profile, [`♻️ Salvaged ${count} gear item${count === 1 ? '' : 's'} for +${shardsGained}✦.`]);
  db.prepare('UPDATE game_profiles SET shards = shards + ?, last_log_json = ?, updated_at = ? WHERE user_id = ?').run(
    shardsGained,
    nextLogs,
    Date.now(),
    user.id
  );

  return { game: buildGameState(db, user, userStats), shardsGained, count };
}

export function upgradeHeroStat(db, user, userStats, stat) {
  const colMap = {
    atk: { col: 'upg_atk', label: 'Might (+3 ATK)' },
    vit: { col: 'upg_vit', label: 'Vitality (+20 HP & +2 DEF)' },
    luck: { col: 'upg_luck', label: 'Fortune (+4 LUCK)' },
    crit: { col: 'upg_crit', label: 'Focus Precision (+2% CRIT)' },
  };
  const target = colMap[stat];
  if (!target) throw new Error('Invalid upgrade stat');

  const profile = ensureGameProfile(db, user.id);
  const rank = profile[target.col] || 0;
  if (rank >= 20) throw new Error('Stat already at max Sanctuary Rank 20');
  const cost = 15 + rank * 12;
  if (profile.shards < cost) throw new Error(`Need ${cost} Arcane Shards`);

  const nextLogs = appendLogs(profile, [`✨ Upgraded Sanctuary ${target.label} to Rank ${rank + 1}!`]);
  db.prepare(`
    UPDATE game_profiles
    SET ${target.col} = ${target.col} + 1, hp = hp + ?, shards = shards - ?, last_log_json = ?, updated_at = ?
    WHERE user_id = ?
  `).run(stat === 'vit' ? 20 : 0, cost, nextLogs, Date.now(), user.id);

  return { game: buildGameState(db, user, userStats), stat, rank: rank + 1, cost };
}

export function restAtCamp(db, user, userStats) {
  const profile = ensureGameProfile(db, user.id);
  if (profile.active_encounter_json) throw new Error('Finish encounter before resting');
  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const heroStats = computeHeroStats(profile, rawItems, computeStudyBonuses(user, userStats));
  const nextLogs = appendLogs(profile, [`⛺ Rested cleanly: HP restored to ${heroStats.maxHp}.`]);
  db.prepare('UPDATE game_profiles SET hp = ?, focus_charge = MAX(focus_charge, 50), last_log_json = ?, updated_at = ? WHERE user_id = ?').run(
    heroStats.maxHp,
    nextLogs,
    Date.now(),
    user.id
  );
  return { game: buildGameState(db, user, userStats) };
}

export function selectFloor(db, user, userStats, floorNum) {
  const profile = ensureGameProfile(db, user.id);
  const target = Number(floorNum);
  if (!Number.isInteger(target) || target < 1 || target > profile.best_floor) {
    throw new Error(`Floor must be between 1 and ${profile.best_floor}`);
  }
  if (profile.mode === 'dungeon') throw new Error('Extract from the current dungeon before changing floors');
  db.prepare('UPDATE game_profiles SET floor = ?, updated_at = ? WHERE user_id = ?').run(target, Date.now(), user.id);
  return { game: buildGameState(db, user, userStats) };
}
