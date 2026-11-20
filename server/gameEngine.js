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
    perk: '+15% Boss & Skill DMG',
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

const MONSTERS = [
  { key: 'slime', name: 'Ink Slime', hp: 38, atk: 7, def: 1, xp: 18, shards: 7 },
  { key: 'bat', name: 'Midnight Bat', hp: 42, atk: 9, def: 2, xp: 21, shards: 8 },
  { key: 'imp', name: 'Distraction Imp', hp: 48, atk: 10, def: 2, xp: 24, shards: 10 },
  { key: 'golem', name: 'Papyrus Golem', hp: 62, atk: 9, def: 5, xp: 28, shards: 12 },
  { key: 'wraith', name: 'Procrastination Wraith', hp: 56, atk: 12, def: 3, xp: 32, shards: 13 },
  { key: 'mimic', name: 'Ledger Mimic', hp: 64, atk: 13, def: 4, xp: 36, shards: 16 },
  { key: 'knight', name: 'Tome Knight', hp: 74, atk: 14, def: 6, xp: 40, shards: 17 },
  { key: 'stalker', name: 'Void Stalker', hp: 68, atk: 16, def: 4, xp: 42, shards: 18 },
  { key: 'drake', name: 'Archive Drake', hp: 82, atk: 17, def: 5, xp: 48, shards: 22 },
];

const BOSSES = [
  { key: 'golem', name: 'Elder Papyrus Warden' },
  { key: 'knight', name: 'Iron Syllabus Sentinel' },
  { key: 'drake', name: 'Crimson Deadline Wyrm' },
  { key: 'boss_lich', name: 'Arch-Lich of Burnout' },
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
        shards, potions, focus_charge, last_log_json, updated_at
      ) VALUES (?, 'hero_scholar', 0, 1, 1, 1, 110, 12, ?, 25, 2, 50, ?, ?)
    `).run(
      userId,
      now,
      JSON.stringify(['Entered the Pixel Spire Courtyard. Study blocks charge your Arcane Energy!']),
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
  let current = [];
  try {
    current = JSON.parse(profile.last_log_json || '[]');
    if (!Array.isArray(current)) current = [];
  } catch {
    current = [];
  }
  const merged = [...newLines, ...current].slice(0, 8);
  return JSON.stringify(merged);
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

export function generateLootItem(db, userId, floor, totalLuck, opts = {}) {
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
    // companion
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

  const finalName = opts.forcedName
    ? opts.forcedName
    : `${affixObj ? `${affixObj.name} ` : ''}${tpl.name}`;

  const now = Date.now();
  const info = db.prepare(`
    INSERT INTO game_items (user_id, slot, name, icon, sprite_key, rarity, affix, level, upgrade_level, atk, def, hp, luck, crit, equipped, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, 0, ?)
  `).run(userId, slot, finalName, tpl.icon, tpl.spriteKey, rarity, affixObj?.name || '', level, atk, def, hp, luck, crit, now);

  if (rarity === 'legendary') {
    db.prepare('UPDATE game_profiles SET legendaries_found = legendaries_found + 1 WHERE user_id = ?').run(userId);
  }
  trimBackpackIfNeeded(db, userId);

  const inserted = db.prepare('SELECT * FROM game_items WHERE id = ?').get(Number(info.lastInsertRowid));
  return formatGameItem(inserted);
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

  let encounter = null;
  if (profile.active_encounter_json) {
    try {
      encounter = JSON.parse(profile.active_encounter_json);
    } catch {
      encounter = null;
    }
  }
  let recentLogs = [];
  try {
    recentLogs = JSON.parse(profile.last_log_json || '[]');
  } catch {
    recentLogs = [];
  }

  return {
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
    biome: getBiomeForFloor(profile.floor),
    items,
    equippedBySlot,
    encounter,
    recentLogs,
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
  if (shouldDrop) {
    const minRarity = durationSec >= 2700 ? 'rare' : durationSec >= 1200 ? 'uncommon' : 'common';
    droppedItem = generateLootItem(db, user.id, profile.floor, heroStats.luck, { minRarity });
    const updatedProf = db.prepare('SELECT * FROM game_profiles WHERE user_id = ?').get(user.id);
    const logs = appendLogs(updatedProf, [`📚 Focus Drop (${mins}m): +${energyGained} ⚡, +${shardsGained} ✦ & found [${droppedItem.rarity.toUpperCase()}] ${droppedItem.name}!`]);
    db.prepare('UPDATE game_profiles SET last_log_json = ? WHERE user_id = ?').run(logs, user.id);
  } else {
    const updatedProf = db.prepare('SELECT * FROM game_profiles WHERE user_id = ?').get(user.id);
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

export function exploreRoom(db, user, userStats) {
  const profile = ensureGameProfile(db, user.id);
  if (profile.active_encounter_json) {
    throw new Error('Resolve your current encounter first.');
  }
  if (profile.energy < 1) {
    throw new Error('Out of Adventure Energy! Complete a study block or grab a Torch in the Store.');
  }

  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const studyBonuses = computeStudyBonuses(user, userStats);
  const heroStats = computeHeroStats(profile, rawItems, studyBonuses);

  const floor = profile.floor;
  const roomIndex = profile.room_index;
  const startingHp = heroStats.hp <= 0 ? Math.max(20, Math.round(heroStats.maxHp * 0.6)) : heroStats.hp;
  const luck = heroStats.luck;

  let encounter;
  let logMsg;

  if (roomIndex >= 5) {
    const bossTpl = BOSSES[(floor - 1) % BOSSES.length];
    const scale = 1 + (floor - 1) * 0.36;
    const bossMaxHp = Math.round(92 * scale);
    encounter = {
      type: 'combat',
      isBoss: true,
      turn: 1,
      charging: false,
      enemy: {
        key: bossTpl.key,
        name: `Floor ${floor} Boss: ${bossTpl.name}`,
        hp: bossMaxHp,
        maxHp: bossMaxHp,
        atk: Math.round(14 * scale),
        def: Math.round(4 + floor * 0.9),
        xpReward: Math.round(70 * scale),
        shardReward: Math.round(28 * scale),
      },
    };
    logMsg = `👑 Floor ${floor} Boss appears: ${bossTpl.name}!`;
  } else {
    const chestPct = 20 + Math.min(14, luck * 0.25);
    const shrinePct = 15 + Math.min(8, luck * 0.12);
    const merchantPct = 12;
    const r = Math.random() * 100;

    if (r < chestPct) {
      encounter = {
        type: 'chest',
        lockpickChance: Math.min(88, Math.round(42 + luck * 0.9)),
      };
      logMsg = `🧰 Found a locked Arcane Chest in Room ${roomIndex}!`;
    } else if (r < chestPct + shrinePct) {
      encounter = {
        type: 'shrine',
        gambleChance: Math.min(78, Math.round(35 + luck * 0.85)),
      };
      logMsg = `⛩️ Discovered an Ancient Shrine of Fortune in Room ${roomIndex}.`;
    } else if (r < chestPct + shrinePct + merchantPct) {
      encounter = {
        type: 'merchant',
      };
      logMsg = `🧳 A hooded Relic Merchant beckons from the shadows.`;
    } else {
      const mIdx = Math.min(MONSTERS.length - 1, Math.floor(Math.random() * Math.min(MONSTERS.length, 3 + floor)));
      const mTpl = MONSTERS[mIdx];
      const scale = 1 + (floor - 1) * 0.28;
      const mHp = Math.round(mTpl.hp * scale);
      encounter = {
        type: 'combat',
        isBoss: false,
        turn: 1,
        charging: false,
        enemy: {
          key: mTpl.key,
          name: mTpl.name,
          hp: mHp,
          maxHp: mHp,
          atk: Math.round(mTpl.atk * scale),
          def: Math.round(mTpl.def * (1 + (floor - 1) * 0.18)),
          xpReward: Math.round(mTpl.xp * scale),
          shardReward: Math.round(mTpl.shards * (1 + (floor - 1) * 0.22)),
        },
      };
      logMsg = `⚔️ Ambush in Room ${roomIndex}: ${mTpl.name}!`;
    }
  }

  const nextLogs = appendLogs(profile, [logMsg]);
  db.prepare(`
    UPDATE game_profiles
    SET energy = energy - 1, hp = ?, active_encounter_json = ?, last_log_json = ?, updated_at = ?
    WHERE user_id = ?
  `).run(startingHp, JSON.stringify(encounter), nextLogs, Date.now(), user.id);

  return {
    game: buildGameState(db, user, userStats),
    events: [{ kind: 'explore', target: 'room', text: encounter.type.toUpperCase() }],
    droppedItem: null,
  };
}

export function resolveCombatAction(db, user, userStats, action) {
  const profile = ensureGameProfile(db, user.id);
  let encounter = null;
  try {
    encounter = profile.active_encounter_json ? JSON.parse(profile.active_encounter_json) : null;
  } catch {
    encounter = null;
  }
  if (!encounter || encounter.type !== 'combat') {
    throw new Error('No active combat encounter.');
  }

  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const studyBonuses = computeStudyBonuses(user, userStats);
  const heroStats = computeHeroStats(profile, rawItems, studyBonuses);

  let heroHp = heroStats.hp;
  let focusCharge = profile.focus_charge;
  let potions = profile.potions;
  const enemy = { ...encounter.enemy };
  const events = [];
  const logLines = [];
  let guarding = false;
  let potionShield = false;
  let droppedItem = null;

  if (action === 'flee') {
    const nextLogs = appendLogs(profile, [`🏃 Escaped safely from ${enemy.name} back to camp.`]);
    db.prepare('UPDATE game_profiles SET active_encounter_json = NULL, last_log_json = ?, updated_at = ? WHERE user_id = ?').run(
      nextLogs,
      Date.now(),
      user.id
    );
    events.push({ kind: 'flee', target: 'hero', text: 'RETREAT' });
    return { game: buildGameState(db, user, userStats), events, droppedItem: null };
  }

  if (action === 'attack') {
    const raw = heroStats.atk * (0.92 + Math.random() * 0.2) - enemy.def * 0.45;
    const isCrit = Math.random() * 100 < heroStats.critPct + heroStats.luck * 0.15;
    const dmg = Math.max(2, Math.round(raw * (isCrit ? 1.75 : 1)));
    enemy.hp = Math.max(0, enemy.hp - dmg);
    focusCharge = Math.min(100, focusCharge + 25);
    events.push({ kind: isCrit ? 'crit' : 'hit', target: 'enemy', value: dmg, text: isCrit ? `CRIT ${dmg}!` : `-${dmg}` });
    logLines.push(`⚔️ ${isCrit ? 'CRITICAL strike' : 'Strike'} dealt ${dmg} DMG to ${enemy.name}.`);
  } else if (action === 'skill') {
    if (focusCharge < 50) throw new Error('Need 50% Focus Charge for Focus Burst!');
    focusCharge -= 50;
    const mageMult = profile.hero_class === 'hero_mage' ? 1.15 : 1.0;
    const isCrit = Math.random() * 100 < heroStats.critPct + 18;
    const dmg = Math.max(6, Math.round(heroStats.atk * 1.68 * mageMult * (isCrit ? 1.55 : 1)));
    enemy.hp = Math.max(0, enemy.hp - dmg);
    events.push({ kind: 'crit', target: 'enemy', value: dmg, text: isCrit ? `BURST CRIT ${dmg}!` : `BURST -${dmg}` });
    logLines.push(`✨ Focus Burst pierced defenses for ${dmg} DMG!`);
  } else if (action === 'guard') {
    guarding = true;
    const heal = Math.max(4, Math.round(heroStats.maxHp * 0.08));
    heroHp = Math.min(heroStats.maxHp, heroHp + heal);
    focusCharge = Math.min(100, focusCharge + 35);
    events.push({ kind: 'guard', target: 'hero', value: heal, text: `GUARD +${heal}` });
    logLines.push(`🛡️ Raised Focus Ward (+${heal} HP, +35% Focus Charge).`);
  } else if (action === 'potion') {
    if (potions < 1) throw new Error('No Healing Potions left!');
    potions -= 1;
    potionShield = true;
    const heal = Math.max(15, Math.round(heroStats.maxHp * 0.55));
    heroHp = Math.min(heroStats.maxHp, heroHp + heal);
    events.push({ kind: 'heal', target: 'hero', value: heal, text: `+${heal} HP` });
    logLines.push(`🧪 Drank Potion: restored +${heal} HP with Aegis ward.`);
  } else {
    throw new Error('Unknown combat action.');
  }

  // Victory Check
  if (enemy.hp <= 0) {
    const isBoss = Boolean(encounter.isBoss);
    const xpMult = profile.hero_class === 'hero_scholar' ? 1.1 : 1.0;
    const heroXpGain = Math.round(enemy.xpReward * xpMult);
    const shardsGain = enemy.shardReward + (isBoss ? Math.round(heroStats.luck * 0.35) : 0);
    const coinsGain = Math.max(3, Math.round((isBoss ? 12 : 4) + profile.floor * 1.4));

    const dropChance = isBoss ? 1.0 : Math.min(0.88, 0.42 + heroStats.luck * 0.0055);
    if (Math.random() < dropChance) {
      droppedItem = generateLootItem(db, user.id, profile.floor, heroStats.luck, {
        minRarity: isBoss ? 'rare' : undefined,
      });
      events.push({ kind: 'loot', target: 'enemy', text: `${droppedItem.rarity.toUpperCase()} DROP!` });
      logLines.unshift(`🎁 Loot Drop: [${droppedItem.rarity.toUpperCase()}] ${droppedItem.name}!`);
    }

    let nextFloor = profile.floor;
    let nextRoom = profile.room_index + 1;
    let nextBestFloor = profile.best_floor;
    if (isBoss || nextRoom > 5) {
      nextFloor = profile.floor + 1;
      nextRoom = 1;
      nextBestFloor = Math.max(profile.best_floor, nextFloor);
      logLines.unshift(`🏆 Floor ${profile.floor} cleared! Unlocked Floor ${nextFloor}!`);
    }

    logLines.push(`✅ Slain ${enemy.name}: +${heroXpGain} Hero XP, +${shardsGain} ✦, +${coinsGain} 🪙.`);
    const nextLogs = appendLogs(profile, logLines.slice(0, 3));

    db.prepare(`
      UPDATE game_profiles
      SET hero_xp = hero_xp + ?, hp = ?, potions = ?, focus_charge = ?, shards = shards + ?,
          floor = ?, room_index = ?, best_floor = ?,
          monsters_slain = monsters_slain + 1,
          bosses_slain = bosses_slain + ?,
          active_encounter_json = NULL, last_log_json = ?, updated_at = ?
      WHERE user_id = ?
    `).run(heroXpGain, heroHp, potions, focusCharge, shardsGain, nextFloor, nextRoom, nextBestFloor, isBoss ? 1 : 0, nextLogs, Date.now(), user.id);

    db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(coinsGain, user.id);
    consumeLuckBuffCharge(db, profile);

    return { game: buildGameState(db, user, userStats), events, droppedItem };
  }

  // Enemy Turn
  const dodged = !guarding && Math.random() * 100 < heroStats.dodgePct;
  if (dodged) {
    events.push({ kind: 'dodge', target: 'hero', text: 'DODGE!' });
    logLines.push(`💨 Quick reflexes! Dodged ${enemy.name}'s strike.`);
  } else {
    const chargeMult = encounter.charging ? 1.65 : 1.0;
    const dmgReduction = guarding ? 0.35 : potionShield ? 0.65 : 1.0;
    const rawEnemyDmg = Math.max(2, enemy.atk * chargeMult * (0.9 + Math.random() * 0.2) - heroStats.def * 0.55);
    const enemyDmg = Math.max(1, Math.round(rawEnemyDmg * dmgReduction));
    heroHp = Math.max(0, heroHp - enemyDmg);
    events.push({ kind: 'enemy_hit', target: 'hero', value: enemyDmg, text: `-${enemyDmg}` });
    logLines.push(`💥 ${enemy.name}${encounter.charging ? ' unleashed Heavy Attack' : ' struck'} for ${enemyDmg} DMG!`);

    if (guarding && enemy.hp > 0) {
      const counterDmg = Math.max(2, Math.round(heroStats.atk * 0.55));
      enemy.hp = Math.max(0, enemy.hp - counterDmg);
      events.push({ kind: 'hit', target: 'enemy', value: counterDmg, text: `COUNTER -${counterDmg}` });
      logLines.push(`⚡ Guard Counter hit ${enemy.name} for ${counterDmg} DMG!`);
    }
  }

  // Check if Counter killed enemy
  if (enemy.hp <= 0) {
    const isBoss = Boolean(encounter.isBoss);
    const heroXpGain = enemy.xpReward;
    const shardsGain = enemy.shardReward;
    const coinsGain = Math.max(3, Math.round((isBoss ? 12 : 4) + profile.floor * 1.4));
    droppedItem = generateLootItem(db, user.id, profile.floor, heroStats.luck, { minRarity: isBoss ? 'rare' : undefined });
    let nextFloor = isBoss || profile.room_index + 1 > 5 ? profile.floor + 1 : profile.floor;
    let nextRoom = isBoss || profile.room_index + 1 > 5 ? 1 : profile.room_index + 1;
    let nextBestFloor = Math.max(profile.best_floor, nextFloor);
    const nextLogs = appendLogs(profile, [`⚡ Counter-slain ${enemy.name}! Looted ${droppedItem.name}.`]);
    db.prepare(`
      UPDATE game_profiles
      SET hero_xp = hero_xp + ?, hp = ?, potions = ?, focus_charge = ?, shards = shards + ?,
          floor = ?, room_index = ?, best_floor = ?,
          monsters_slain = monsters_slain + 1, bosses_slain = bosses_slain + ?,
          active_encounter_json = NULL, last_log_json = ?, updated_at = ?
      WHERE user_id = ?
    `).run(heroXpGain, Math.max(1, heroHp), potions, focusCharge, shardsGain, nextFloor, nextRoom, nextBestFloor, isBoss ? 1 : 0, nextLogs, Date.now(), user.id);
    db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(coinsGain, user.id);
    consumeLuckBuffCharge(db, profile);
    return { game: buildGameState(db, user, userStats), events, droppedItem };
  }

  // Hero Defeated Check
  if (heroHp <= 0) {
    const reviveHp = Math.round(heroStats.maxHp * 0.6);
    const nextLogs = appendLogs(profile, [`💀 Overwhelmed by ${enemy.name}! Returned to Floor ${profile.floor} camp with all loot intact.`]);
    db.prepare(`
      UPDATE game_profiles
      SET hp = ?, potions = ?, focus_charge = 50, room_index = 1, active_encounter_json = NULL, last_log_json = ?, updated_at = ?
      WHERE user_id = ?
    `).run(reviveHp, potions, nextLogs, Date.now(), user.id);
    events.push({ kind: 'defeat', target: 'hero', text: 'FALLEN' });
    return { game: buildGameState(db, user, userStats), events, droppedItem: null };
  }

  const nextTurn = (encounter.turn || 1) + 1;
  const nextCharging = encounter.isBoss && nextTurn % 3 === 2;
  if (nextCharging) {
    logLines.push(`⚠️ ${enemy.name} is charging a Heavy Attack — prepare Guard!`);
  }
  const updatedEncounter = { ...encounter, enemy, turn: nextTurn, charging: nextCharging };
  const nextLogs = appendLogs(profile, logLines.slice(0, 3));
  db.prepare(`
    UPDATE game_profiles SET hp = ?, potions = ?, focus_charge = ?, active_encounter_json = ?, last_log_json = ?, updated_at = ? WHERE user_id = ?
  `).run(heroHp, potions, focusCharge, JSON.stringify(updatedEncounter), nextLogs, Date.now(), user.id);

  return { game: buildGameState(db, user, userStats), events, droppedItem: null };
}

export function resolveEventChoice(db, user, userStats, choice) {
  const profile = ensureGameProfile(db, user.id);
  let encounter = null;
  try {
    encounter = profile.active_encounter_json ? JSON.parse(profile.active_encounter_json) : null;
  } catch {
    encounter = null;
  }
  if (!encounter || encounter.type === 'combat') {
    throw new Error('No active event encounter.');
  }

  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const studyBonuses = computeStudyBonuses(user, userStats);
  const heroStats = computeHeroStats(profile, rawItems, studyBonuses);

  let heroHp = heroStats.hp;
  let shardsGain = 0;
  let coinsGain = 0;
  let coinsCost = 0;
  let potionsDelta = 0;
  let focusDelta = 0;
  let droppedItem = null;
  let advanceRoom = true;
  const events = [];
  const logLines = [];

  if (encounter.type === 'chest') {
    if (choice === 'open_safe') {
      droppedItem = generateLootItem(db, user.id, profile.floor, heroStats.luck, { minRarity: 'common' });
      shardsGain = 12 + profile.floor * 3;
      coinsGain = 6 + profile.floor * 2;
      events.push({ kind: 'loot', target: 'enemy', text: `${droppedItem.rarity.toUpperCase()}!` });
      logLines.push(`🧰 Opened Chest safely: +${shardsGain} ✦, +${coinsGain} 🪙 & [${droppedItem.rarity.toUpperCase()}] ${droppedItem.name}!`);
      db.prepare('UPDATE game_profiles SET chests_opened = chests_opened + 1 WHERE user_id = ?').run(user.id);
      consumeLuckBuffCharge(db, profile);
    } else if (choice === 'lockpick') {
      const success = Math.random() * 100 < (encounter.lockpickChance || 50);
      if (success) {
        droppedItem = generateLootItem(db, user.id, profile.floor, heroStats.luck, { minRarity: 'uncommon', bonusLuck: 25 });
        shardsGain = 24 + profile.floor * 5;
        coinsGain = 14 + profile.floor * 3;
        events.push({ kind: 'loot', target: 'enemy', text: 'JACKPOT!' });
        logLines.push(`🗝️ Lucky Lockpick! +25 Luck roll yielded [${droppedItem.rarity.toUpperCase()}] ${droppedItem.name}!`);
      } else {
        const trapDmg = Math.max(6, Math.round(heroStats.maxHp * 0.14));
        heroHp = Math.max(1, heroHp - trapDmg);
        droppedItem = generateLootItem(db, user.id, profile.floor, heroStats.luck, { minRarity: 'common' });
        shardsGain = 10;
        events.push({ kind: 'enemy_hit', target: 'hero', value: trapDmg, text: `TRAP -${trapDmg}` });
        logLines.push(`💥 Lockpick snapped (-${trapDmg} HP), still grabbed ${droppedItem.name}!`);
      }
      db.prepare('UPDATE game_profiles SET chests_opened = chests_opened + 1 WHERE user_id = ?').run(user.id);
      consumeLuckBuffCharge(db, profile);
    } else {
      throw new Error('Invalid chest choice.');
    }
  } else if (encounter.type === 'shrine') {
    if (choice === 'shrine_bless') {
      const heal = Math.round(heroStats.maxHp * 0.25);
      heroHp = Math.min(heroStats.maxHp, heroHp + heal);
      shardsGain = 14;
      db.prepare('UPDATE game_profiles SET luck_buff_charges = luck_buff_charges + 4, luck_buff_amount = MAX(luck_buff_amount, 12) WHERE user_id = ?').run(user.id);
      events.push({ kind: 'heal', target: 'hero', value: heal, text: '+12 LUCK!' });
      logLines.push(`⛩️ Shrine Blessing: +12 LUCK for 4 encounters, +${heal} HP & +14 ✦!`);
    } else if (choice === 'shrine_gamble') {
      if (user.coins < 20) throw new Error('Need 20 Focus Coins to gamble at the Shrine!');
      coinsCost = 20;
      const win = Math.random() * 100 < (encounter.gambleChance || 45);
      if (win) {
        coinsGain = 55;
        droppedItem = generateLootItem(db, user.id, profile.floor, heroStats.luck, { minRarity: 'rare', bonusLuck: 15 });
        events.push({ kind: 'loot', target: 'enemy', text: 'FORTUNE!' });
        logLines.push(`🎲 Shrine Jackpot! Won +55 🪙 & [${droppedItem.rarity.toUpperCase()}] ${droppedItem.name}!`);
      } else {
        shardsGain = 16;
        events.push({ kind: 'heal', target: 'hero', text: '+16 SHARDS' });
        logLines.push(`🎲 Shrine offered +16 ✦ Arcane Shards for your tribute.`);
      }
      consumeLuckBuffCharge(db, profile);
    } else if (choice === 'camp_rest') {
      const heal = Math.round(heroStats.maxHp * 0.55);
      heroHp = Math.min(heroStats.maxHp, heroHp + heal);
      focusDelta = 30;
      events.push({ kind: 'heal', target: 'hero', value: heal, text: `+${heal} HP` });
      logLines.push(`🔥 Shrine Campfire: healed +${heal} HP & +30% Focus Charge.`);
    } else {
      throw new Error('Invalid shrine choice.');
    }
  } else if (encounter.type === 'merchant') {
    if (choice === 'merchant_buy_potion') {
      if (user.coins < 20) throw new Error('Need 20 Focus Coins for potions!');
      coinsCost = 20;
      potionsDelta = 2;
      advanceRoom = false;
      events.push({ kind: 'heal', target: 'hero', text: '+2 POTIONS' });
      logLines.push(`🧪 Bought 2 Healing Potions from Merchant.`);
    } else if (choice === 'merchant_mystery_roll') {
      if (user.coins < 55) throw new Error('Need 55 Focus Coins for a Mystery Relic!');
      coinsCost = 55;
      droppedItem = generateLootItem(db, user.id, profile.floor, heroStats.luck, { minRarity: 'uncommon', bonusLuck: 15 });
      events.push({ kind: 'loot', target: 'enemy', text: `${droppedItem.rarity.toUpperCase()}!` });
      logLines.push(`📦 Bought Mystery Relic: [${droppedItem.rarity.toUpperCase()}] ${droppedItem.name}!`);
    } else if (choice === 'merchant_leave') {
      advanceRoom = true;
      logLines.push(`👋 Departed from the Relic Merchant.`);
    } else {
      throw new Error('Invalid merchant choice.');
    }
  }

  let nextRoom = profile.room_index;
  let nextFloor = profile.floor;
  if (advanceRoom) {
    nextRoom = profile.room_index + 1;
    if (nextRoom > 5) {
      nextRoom = 5; // keep boss room on room 5 until slain
    }
  }

  const netCoins = coinsGain - coinsCost;
  if (netCoins !== 0) {
    db.prepare('UPDATE users SET coins = MAX(0, coins + ?) WHERE id = ?').run(netCoins, user.id);
  }
  const nextLogs = appendLogs(profile, logLines);
  db.prepare(`
    UPDATE game_profiles
    SET hp = ?, shards = shards + ?, potions = potions + ?, focus_charge = MIN(100, focus_charge + ?),
        floor = ?, room_index = ?, active_encounter_json = ?, last_log_json = ?, updated_at = ?
    WHERE user_id = ?
  `).run(
    heroHp,
    shardsGain,
    potionsDelta,
    focusDelta,
    nextFloor,
    nextRoom,
    advanceRoom ? null : profile.active_encounter_json,
    nextLogs,
    Date.now(),
    user.id
  );

  return { game: buildGameState(db, user, userStats), events, droppedItem };
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

  const shardCost = 15 + (item.upgrade_level || 0) * 12;
  const coinCost = 10 + (item.upgrade_level || 0) * 8;
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

  return {
    game: buildGameState(db, user, userStats),
    greatSuccess,
    newUpgradeLevel: nextLvl,
    shardCost,
    coinCost,
  };
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

  const nextLogs = appendLogs(profile, [`♻️ Salvaged ${count} gear item${count === 1 ? '' : 's'} for +${shardsGained} ✦ Shards.`]);
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
    crit: { col: 'upg_crit', label: 'Focus Mastery (+2% CRIT)' },
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
    SET ${target.col} = ${target.col} + 1,
        hp = hp + ?,
        shards = shards - ?,
        last_log_json = ?,
        updated_at = ?
    WHERE user_id = ?
  `).run(stat === 'vit' ? 20 : 0, cost, nextLogs, Date.now(), user.id);

  return { game: buildGameState(db, user, userStats), stat, rank: rank + 1, cost };
}

export function restAtCamp(db, user, userStats) {
  const profile = ensureGameProfile(db, user.id);
  if (profile.active_encounter_json) throw new Error('Finish encounter before resting at camp');
  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const heroStats = computeHeroStats(profile, rawItems, computeStudyBonuses(user, userStats));
  const nextLogs = appendLogs(profile, [`⛺ Rested at Sanctum Camp: HP restored to ${heroStats.maxHp}.`]);
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
  if (profile.active_encounter_json) throw new Error('Finish current encounter before changing floors');
  const nextLogs = appendLogs(profile, [`🗺️ Moved expedition to Floor ${target} (${getBiomeForFloor(target).name}).`]);
  db.prepare('UPDATE game_profiles SET floor = ?, room_index = 1, last_log_json = ?, updated_at = ? WHERE user_id = ?').run(
    target,
    nextLogs,
    Date.now(),
    user.id
  );
  return { game: buildGameState(db, user, userStats) };
}
