import {
  BOUNTY_DEFINITIONS,
  DUNGEON_RIDDLES,
  HEROIC_DEEDS,
  IDLE_ASCENSION_RELICS,
  IDLE_MYTHIC_BOUNTIES,
  IDLE_PROFESSIONS,
  IDLE_REALMS,
  IDLE_SQUAD_HEROES,
  IDLE_STAGE_ENEMIES,
  LOOP_CAMPFIRE_RELICS,
  LOOP_GRID_HEIGHT,
  LOOP_GRID_WIDTH,
  LOOP_PLACEABLE_CARD_KEYS,
  LOOP_ROAD_PATH,
  LOOP_TILE_CARDS,
  LOOP_TRAIT_SYNERGIES,
  LORE_CODEX,
  MYTHIC_SIDE_STORIES,
  NPCS,
  PARTY_ALLIES,
  SIDE_QUESTS,
  STORY_CHAPTERS,
  VILLAGE_HEIGHT,
  VILLAGE_MAP,
  VILLAGE_WIDTH,
  getNpcDialogue,
  trustRankLabel,
} from './storyData.js';
import {
  REWEAVE_FATE_COST,
  SS_ARC1_ACTS,
  SS_ASPECTS,
  SS_ATTRIBUTES,
  SS_COHORT,
  SS_CORE_CLASSES,
  SS_ECHOES,
  SS_FLAWS,
  SS_MEMORIES,
  SS_RANKS,
  SS_TRUE_NAMES,
} from './shadowSlaveData.js';
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
  mythic: { key: 'mythic', label: 'Mythic', weight: 0.25, mult: 4.6, salvage: 250 },
};

export const HERO_CLASSES = {
  hero_scholar: {
    key: 'hero_scholar',
    name: 'Dream Chronicler',
    atk: 12,
    def: 4,
    hp: 100,
    luck: 6,
    crit: 8,
    perk: '+10% Soul XP Resonance',
  },
  hero_knight: {
    key: 'hero_knight',
    name: 'Bright Castle Vanguard',
    atk: 11,
    def: 8,
    hp: 130,
    luck: 5,
    crit: 6,
    perk: '+30 HP & +4 DEF',
  },
  hero_rogue: {
    key: 'hero_rogue',
    name: 'Shadow Runner',
    atk: 14,
    def: 4,
    hp: 95,
    luck: 18,
    crit: 16,
    perk: '+12 Fate Affinity & +8% Crit',
  },
  hero_mage: {
    key: 'hero_mage',
    name: 'Spellweave Adept',
    atk: 18,
    def: 3,
    hp: 92,
    luck: 10,
    crit: 12,
    perk: '+15% Tyrant & Stagger DMG',
  },
};

export const HERO_SPECIALIZATIONS = {
  hero_scholar: [
    {
      key: 'chronomancer',
      name: 'Rune Seer',
      classKey: 'hero_scholar',
      bonusAtk: 4,
      bonusDef: 1,
      bonusHp: 12,
      bonusLuck: 6,
      bonusCrit: 4,
      bonusIntuition: 6,
      perk: '+6 Intuition, +6 Fate, +4 ATK & Runic Insight',
    },
    {
      key: 'archivist',
      name: 'Citadel Archivist',
      classKey: 'hero_scholar',
      bonusAtk: 6,
      bonusDef: 3,
      bonusHp: 22,
      bonusLuck: 4,
      bonusCrit: 6,
      bonusIntuition: 10,
      perk: '+10 Intuition, +22 HP & +6% Crit Lore Mastery',
    },
  ],
  hero_knight: [
    {
      key: 'templar',
      name: 'Bastion Defender',
      classKey: 'hero_knight',
      bonusAtk: 5,
      bonusDef: 6,
      bonusHp: 35,
      bonusLuck: 2,
      bonusCrit: 3,
      bonusIntuition: 4,
      perk: '+6 DEF, +35 HP & Bastion Aegis',
    },
    {
      key: 'vanguard',
      name: 'Dawnbreaker Striker',
      classKey: 'hero_knight',
      bonusAtk: 9,
      bonusDef: 4,
      bonusHp: 20,
      bonusLuck: 2,
      bonusCrit: 5,
      bonusIntuition: 2,
      perk: '+9 ATK, +4 DEF & Crushing Riposte',
    },
  ],
  hero_rogue: [
    {
      key: 'vaultbreaker',
      name: 'Fated Scavenger',
      classKey: 'hero_rogue',
      bonusAtk: 5,
      bonusDef: 2,
      bonusHp: 10,
      bonusLuck: 14,
      bonusCrit: 8,
      bonusIntuition: 8,
      perk: '+14 Fate, +8% Crit & +8 Intuition Seeker',
    },
    {
      key: 'nightblade',
      name: 'Shadow Assassin',
      classKey: 'hero_rogue',
      bonusAtk: 10,
      bonusDef: 1,
      bonusHp: 8,
      bonusLuck: 6,
      bonusCrit: 14,
      bonusIntuition: 4,
      perk: '+14% Crit & +10 ATK Shadow Step Ambush',
    },
  ],
  hero_mage: [
    {
      key: 'pyromancer',
      name: 'Immutable Flame',
      classKey: 'hero_mage',
      bonusAtk: 12,
      bonusDef: 1,
      bonusHp: 12,
      bonusLuck: 5,
      bonusCrit: 9,
      bonusIntuition: 4,
      perk: '+12 ATK & +9% Crit Surge',
    },
    {
      key: 'spellweaver',
      name: 'Lineage Weaver',
      classKey: 'hero_mage',
      bonusAtk: 8,
      bonusDef: 3,
      bonusHp: 22,
      bonusLuck: 8,
      bonusCrit: 6,
      bonusIntuition: 10,
      perk: '+10 Intuition, +8 Fate & Golden String Matrix',
    },
  ],
};

export const BIOMES = [
  { key: 'moss_library', name: 'Black Mountain Trial', minFloor: 1 },
  { key: 'clockwork_obs', name: 'The Crimson Labyrinth', minFloor: 4 },
  { key: 'crystal_archive', name: 'Dark City Cathedral', minFloor: 7 },
  { key: 'astral_sanctum', name: 'The Crimson Spire', minFloor: 10 },
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
    { name: 'Carapace Edge', icon: '🗡️', spriteKey: 'blade', atkBias: 1.0, critBias: 1.0 },
    { name: 'Crimson Odachi Shard', icon: '⚔️', spriteKey: 'blade', atkBias: 1.15, critBias: 0.9 },
    { name: 'True Darkness Glaive', icon: '🔱', spriteKey: 'staff', atkBias: 1.25, critBias: 0.7 },
    { name: 'Dawnbreaker Rapier', icon: '⚔️', spriteKey: 'blade', atkBias: 1.05, critBias: 1.25 },
  ],
  armor: [
    { name: "Puppeteer's Shroud", icon: '🧥', spriteKey: 'robe', defBias: 0.95, hpBias: 1.15 },
    { name: 'Carapace Legion Mail', icon: '🛡️', spriteKey: 'plate', defBias: 1.25, hpBias: 0.95 },
    { name: 'Undying Chain Mantle', icon: '🥋', spriteKey: 'robe', defBias: 1.05, hpBias: 1.1 },
  ],
  charm: [
    { name: 'Four-Strand Fate Knot', icon: '🧵', spriteKey: 'clover', luckBias: 1.25, critBias: 0.85 },
    { name: 'Silver Bell of Remembrance', icon: '🔔', spriteKey: 'star', luckBias: 1.05, critBias: 1.1 },
    { name: 'Shard of the Fallen Sun', icon: '🌑', spriteKey: 'crown', luckBias: 1.2, critBias: 1.0 },
  ],
  companion: [
    { name: 'Scavenger Echo', icon: '🦀', spriteKey: 'pet_owl', atkBias: 0.9, luckBias: 1.2 },
    { name: 'Shadow Hound Shard', icon: '🐺', spriteKey: 'pet_cat', luckBias: 1.15, critBias: 1.2 },
    { name: 'Fallen Wyrmling Echo', icon: '🐉', spriteKey: 'pet_dragon', atkBias: 1.25, luckBias: 0.85 },
    { name: 'Sanctuary Light Wisp', icon: '✨', spriteKey: 'pet_sprite', luckBias: 1.1, defBias: 1.05 },
  ],
};

const AFFIXES = [
  { name: 'Fated', luck: 5 },
  { name: 'Awakened', crit: 4, atk: 2 },
  { name: 'Onyx', def: 3, hp: 14 },
  { name: 'Runic', atk: 3, crit: 2 },
  { name: 'Ascended', luck: 4, hp: 10 },
  { name: 'Transcendent', atk: 3, luck: 3, crit: 2 },
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

export function computeItemPower(item) {
  return Math.round(
    (item?.atk || 0) * 3 +
      (item?.def || 0) * 2.2 +
      (item?.hp || 0) * 0.45 +
      (item?.luck || 0) * 2 +
      (item?.crit || 0) * 2.5
  );
}

export function formatGameItem(row) {
  if (!row) return null;
  const rar = RARITIES[row.rarity] || RARITIES.common;
  const scale = 1 + (row.upgrade_level || 0) * 0.14;
  const atk = Math.round((row.atk || 0) * scale);
  const def = Math.round((row.def || 0) * scale);
  const hp = Math.round((row.hp || 0) * scale);
  const luck = Math.round((row.luck || 0) * scale);
  const crit = Math.round((row.crit || 0) * scale);
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
    atk,
    def,
    hp,
    luck,
    crit,
    power: computeItemPower({ atk, def, hp, luck, crit }),
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
      JSON.stringify(['[Nightmare Spell]: You shiver on the Black Mountain. Your First Nightmare has begun.']),
      now
    );
    db.prepare(`
      INSERT INTO game_items (user_id, slot, name, icon, sprite_key, rarity, affix, level, upgrade_level, atk, def, hp, luck, crit, equipped, created_at)
      VALUES (?, 'weapon', 'Dormant Whisper Blade', '🗡️', 'blade', 'common', '', 1, 0, 4, 0, 0, 0, 2, 1, ?),
             (?, 'charm', 'Silver Bell Memory', '🔔', 'star', 'common', '', 1, 0, 0, 0, 0, 4, 0, 1, ?)
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
  const classSpecs = HERO_SPECIALIZATIONS[cls.key] || HERO_SPECIALIZATIONS.hero_scholar;
  const activeSpec = classSpecs.find((s) => s.key === profile.specialization) || classSpecs[0];
  const lvlInfo = heroLevelFromXp(profile.hero_xp || 0);
  const items = rawItems.map(formatGameItem);
  const equipped = items.filter((i) => i.equipped);
  const equippedCompanion = equipped.find((i) => i.slot === 'companion') || null;
  const isMythicCompanion = equippedCompanion?.rarity === 'mythic';
  const evolScore = (studyBonuses.totalMins || 0) + (equippedCompanion ? equippedCompanion.upgradeLevel * 60 : 0) + (isMythicCompanion ? 360 : 0);
  const companionEvolution = !equippedCompanion
    ? { stage: 0, label: 'No Companion Equipped', nextMins: 60 }
    : evolScore >= 360
      ? { stage: 3, label: 'Stage III · Mythic Familiar', nextMins: 0 }
      : evolScore >= 120
        ? { stage: 2, label: 'Stage II · Awakened Spirit', nextMins: Math.max(0, 360 - evolScore) }
        : { stage: 1, label: 'Stage I · Hatchling', nextMins: Math.max(0, 120 - evolScore) };
  const evolAtkBonus = companionEvolution.stage >= 3 ? 4 : companionEvolution.stage === 2 ? 2 : 0;
  const evolLuckBonus = companionEvolution.stage >= 3 ? 6 : companionEvolution.stage === 2 ? 3 : 0;

  const flags = parseJsonSafe(profile.story_flags_json, {});
  const recruitedAllies = Array.isArray(flags.recruitedAllies) ? flags.recruitedAllies : [];
  const activeAlly = PARTY_ALLIES.find((a) => a.id === flags.activeAllyId && recruitedAllies.includes(a.id)) || null;
  const allyBonus = activeAlly?.passiveBonuses || { atk: 0, def: 0, hp: 0, luck: 0, crit: 0 };

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

  const bonusAtk = (profile.bonus_atk || 0) + activeSpec.bonusAtk + evolAtkBonus + (allyBonus.atk || 0);
  const bonusDef = (profile.bonus_def || 0) + activeSpec.bonusDef + (allyBonus.def || 0);
  const bonusHp = (profile.bonus_hp || 0) + activeSpec.bonusHp + (allyBonus.hp || 0);
  const bonusLuck = (profile.bonus_luck || 0) + activeSpec.bonusLuck + evolLuckBonus + (allyBonus.luck || 0);

  const buffLuck = (profile.luck_buff_charges || 0) > 0 ? profile.luck_buff_amount || 0 : 0;
  const levelAtk = lvlInfo.heroLevel - 1;
  const levelHp = (lvlInfo.heroLevel - 1) * 6;

  const rawAtk = cls.atk + levelAtk + upgAtk + gearAtk + studyBonuses.studyAtk + bonusAtk;
  const atk = studyBonuses.focusFever ? Math.round(rawAtk * 1.2) : rawAtk;
  const def = cls.def + upgDef + gearDef + studyBonuses.studyDef + bonusDef;
  const maxHp = cls.hp + levelHp + upgHp + gearHp + studyBonuses.studyHp + bonusHp;
  const luck = cls.luck + upgLuck + gearLuck + bonusLuck + studyBonuses.streakLuck + studyBonuses.feverLuck + buffLuck;
  const critPct = Math.min(85, cls.crit + upgCrit + gearCrit + activeSpec.bonusCrit + studyBonuses.purityCrit + (allyBonus.crit || 0));
  const dodgePct = Math.min(45, Math.round(studyBonuses.purityDodge + Math.min(12, luck * 0.15)));

  const affinity = parseJsonSafe(profile.npc_affinity_json, { rowan: 0, bram: 0, lyra: 0, pip: 0 });
  const intuition = Math.max(
    4,
    (studyBonuses.purityIntuition || 8) + Math.floor(luck * 0.25) + (studyBonuses.scholarLevel - 1) + activeSpec.bonusIntuition + (buffLuck > 0 ? 5 : 0)
  );
  const visionRadius = 2 + (studyBonuses.focusFever ? 1 : 0) + ((affinity.pip || 0) >= 25 ? 1 : 0);

  return {
    ...lvlInfo,
    classKey: cls.key,
    className: cls.name,
    classPerk: cls.perk,
    specialization: activeSpec.key,
    activeSpecialization: activeSpec,
    specializations: classSpecs,
    companionEvolution,
    activeAllyId: activeAlly?.id || null,
    activeAllyName: activeAlly?.name || null,
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
       ORDER BY CASE rarity WHEN 'common' THEN 1 WHEN 'uncommon' THEN 2 WHEN 'rare' THEN 3 WHEN 'epic' THEN 4 WHEN 'legendary' THEN 5 ELSE 6 END ASC, id ASC`
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
  const profile = db.prepare('SELECT story_flags_json FROM game_profiles WHERE user_id = ?').get(userId);
  const flags = parseJsonSafe(profile?.story_flags_json, {});
  const autoCfg = flags?.idle?.automation || { autoEquipBest: true, autoSalvageMaxRarity: 'common' };

  const curEquippedRow = db
    .prepare('SELECT * FROM game_items WHERE user_id = ? AND slot = ? AND equipped = 1')
    .get(userId, spec.slot);
  const curEquippedPower = curEquippedRow ? computeItemPower(formatGameItem(curEquippedRow)) : -1;
  const newPower = computeItemPower(spec);
  const shouldAutoEquip = Boolean(autoCfg.autoEquipBest) && (!curEquippedRow || newPower > curEquippedPower);

  const rarOrderIdx = RARITY_ORDER.indexOf(spec.rarity);
  const salvageCap = autoCfg.autoSalvageMaxRarity || 'common';
  const salvageCapIdx = salvageCap === 'off' ? -1 : Math.min(2, RARITY_ORDER.indexOf(salvageCap)); // Never auto-salvage epic+
  const shouldAutoSalvage =
    !shouldAutoEquip &&
    salvageCapIdx >= 0 &&
    rarOrderIdx >= 0 &&
    rarOrderIdx <= salvageCapIdx &&
    spec.rarity !== 'mythic';

  if (shouldAutoSalvage) {
    const salvageVal = (RARITIES[spec.rarity]?.salvage || 6) + Math.floor((spec.level || 1) * 1.5);
    db.prepare('UPDATE game_profiles SET shards = shards + ? WHERE user_id = ?').run(salvageVal, userId);
    return {
      ...formatSatchelPreview(spec, -999),
      power: newPower,
      salvageValue: salvageVal,
      autoSalvagedShards: salvageVal,
      autoEquipped: false,
    };
  }

  if (shouldAutoEquip) {
    db.prepare('UPDATE game_items SET equipped = 0 WHERE user_id = ? AND slot = ?').run(userId, spec.slot);
  }

  const info = db.prepare(`
    INSERT INTO game_items (user_id, slot, name, icon, sprite_key, rarity, affix, level, upgrade_level, atk, def, hp, luck, crit, equipped, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    spec.slot,
    spec.name,
    spec.icon,
    spec.spriteKey,
    spec.rarity,
    spec.affix,
    spec.level,
    spec.atk,
    spec.def,
    spec.hp,
    spec.luck,
    spec.crit,
    shouldAutoEquip ? 1 : 0,
    now
  );
  if (spec.rarity === 'legendary' || spec.rarity === 'mythic') {
    db.prepare('UPDATE game_profiles SET legendaries_found = legendaries_found + 1 WHERE user_id = ?').run(userId);
  }
  trimBackpackIfNeeded(db, userId);
  const inserted = formatGameItem(db.prepare('SELECT * FROM game_items WHERE id = ?').get(Number(info.lastInsertRowid)));
  return { ...inserted, autoEquipped: shouldAutoEquip, autoSalvagedShards: 0 };
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

export function getIdleRealmForStage(stage) {
  let active = IDLE_REALMS[0];
  for (const r of IDLE_REALMS) {
    if (stage >= r.minStage) active = r;
  }
  return active;
}

const ROAD_COORD_SET = new Set(LOOP_ROAD_PATH.map((p) => `${p.x},${p.y}`));

function isCampfireCoord(x, y) {
  return x === LOOP_ROAD_PATH[0].x && y === LOOP_ROAD_PATH[0].y;
}

function isRoadCoord(x, y) {
  return ROAD_COORD_SET.has(`${x},${y}`);
}

function makeLoopHandCard(cardKey, stars = 1) {
  const validKey = LOOP_TILE_CARDS[cardKey]?.placeable ? cardKey : LOOP_PLACEABLE_CARD_KEYS[0];
  return {
    id: `lc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    cardKey: validKey,
    stars: Math.max(1, Math.min(3, Number(stars) || 1)),
  };
}

function rollRandomRelicChoices(activeRelics = [], count = 3) {
  const activeSet = new Set(activeRelics || []);
  const unowned = LOOP_CAMPFIRE_RELICS.filter((r) => !activeSet.has(r.id));
  const pool = unowned.length >= count ? [...unowned] : [...LOOP_CAMPFIRE_RELICS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).map((r) => r.id);
}

function rollLoopCardKey() {
  return LOOP_PLACEABLE_CARD_KEYS[Math.floor(Math.random() * LOOP_PLACEABLE_CARD_KEYS.length)];
}

function drawCardsIntoHand(loop, cardKeys, stars = 1) {
  if (!Array.isArray(loop.hand)) loop.hand = [];
  for (const key of cardKeys) {
    if (!LOOP_TILE_CARDS[key]?.placeable) continue;
    // Merge into an existing matching card if hand is already at capacity (7)
    if (loop.hand.length >= 7) {
      const match = loop.hand.find((c) => c.cardKey === key && (c.stars || 1) < 3);
      if (match) {
        match.stars = Math.min(3, (match.stars || 1) + 1);
      } else {
        // Merge any pair in hand to free a slot, otherwise replace oldest ★1 card
        let merged = false;
        for (let i = 0; i < loop.hand.length && !merged; i++) {
          for (let j = i + 1; j < loop.hand.length && !merged; j++) {
            if (loop.hand[i].cardKey === loop.hand[j].cardKey && loop.hand[i].stars < 3) {
              loop.hand[i].stars = Math.min(3, Math.max(loop.hand[i].stars, loop.hand[j].stars) + 1);
              loop.hand.splice(j, 1);
              merged = true;
            }
          }
        }
        if (loop.hand.length < 7) loop.hand.push(makeLoopHandCard(key, stars));
      }
    } else {
      loop.hand.push(makeLoopHandCard(key, stars));
    }
  }
}

export function recomputeLoopBoardSynergies(rawBoard = []) {
  const cleanBoard = (Array.isArray(rawBoard) ? rawBoard : []).map((t) => {
    const baseKey = LOOP_TILE_CARDS[t.baseKey]?.placeable
      ? t.baseKey
      : LOOP_TILE_CARDS[t.cardKey]?.placeable
        ? t.cardKey
        : 'starlight_meadow';
    return {
      x: Math.max(0, Math.min(LOOP_GRID_WIDTH - 1, Number(t.x || 0))),
      y: Math.max(0, Math.min(LOOP_GRID_HEIGHT - 1, Number(t.y || 0))),
      baseKey,
      cardKey: baseKey,
      stars: Math.max(1, Math.min(3, Number(t.stars || 1))),
      evolved: false,
    };
  });

  const getNeighbors = (tile) =>
    cleanBoard.filter(
      (other) =>
        !(other.x === tile.x && other.y === tile.y) &&
        Math.abs(other.x - tile.x) <= 1 &&
        Math.abs(other.y - tile.y) <= 1
    );

  let evolvedCount = 0;
  for (const tile of cleanBoard) {
    const neighbors = getNeighbors(tile);
    let evolvedKey = null;
    if (tile.baseKey === 'ruined_village' && neighbors.some((n) => n.baseKey === 'vampire_manor')) {
      evolvedKey = 'counts_estate';
    } else if (tile.baseKey === 'starlight_meadow' && neighbors.some((n) => n.baseKey !== 'starlight_meadow')) {
      evolvedKey = 'blooming_sanctuary';
    } else if (
      tile.baseKey === 'titan_mountain' &&
      neighbors.filter((n) => n.baseKey === 'titan_mountain').length >= 2
    ) {
      evolvedKey = 'celestial_summit';
    } else if (
      tile.baseKey === 'storm_conduit' &&
      neighbors.some((n) => n.baseKey === 'chrono_obelisk' || n.baseKey === 'storm_conduit')
    ) {
      evolvedKey = 'tesla_spire';
    } else if (tile.baseKey === 'alchemist_vault' && neighbors.length >= 3) {
      evolvedKey = 'mythic_treasury';
    }

    if (evolvedKey && LOOP_TILE_CARDS[evolvedKey]) {
      tile.evolved = true;
      tile.cardKey = evolvedKey;
      evolvedCount += 1;
    } else {
      tile.evolved = false;
      tile.cardKey = tile.baseKey;
    }
  }

  const traitCounts = {
    verdant: 0,
    storm: 0,
    crimson: 0,
    bastion: 0,
    titan: 0,
    chrono: 0,
  };

  let tileAtkPct = 0;
  let tileMaxHpFlat = 0;
  let tileDefFlat = 0;
  let tileLifestealPct = 0;
  let tileExecutePct = 0;
  let tileChainPct = 0;
  let tileSpeedPct = 0;
  let tileLootPct = 0;
  let tileCampfireHealPct = 0;
  let bonusGearRolls = 0;

  for (const tile of cleanBoard) {
    const def = LOOP_TILE_CARDS[tile.cardKey] || LOOP_TILE_CARDS[tile.baseKey];
    if (!def) continue;
    const mult = 1 + (tile.stars - 1) * 0.55 + (tile.evolved ? 0.5 : 0);
    const weight = tile.stars + (tile.evolved ? 1 : 0);
    for (const tr of def.traits || []) {
      if (traitCounts[tr] !== undefined) traitCounts[tr] += weight;
    }

    switch (tile.cardKey) {
      case 'starlight_meadow':
        tileMaxHpFlat += Math.round(25 * mult);
        tileCampfireHealPct += Math.round(6 * mult);
        break;
      case 'blooming_sanctuary':
        tileMaxHpFlat += Math.round(60 * mult);
        tileCampfireHealPct += Math.round(14 * mult);
        break;
      case 'titan_mountain':
        tileMaxHpFlat += Math.round(35 * mult);
        tileDefFlat += Math.round(4 * mult);
        break;
      case 'celestial_summit':
        tileMaxHpFlat += Math.round(95 * mult);
        tileDefFlat += Math.round(12 * mult);
        tileAtkPct += 12;
        break;
      case 'vampire_manor':
        tileLifestealPct += Math.round(12 * mult);
        tileAtkPct += Math.round(6 * mult);
        break;
      case 'ruined_village':
        tileCampfireHealPct += Math.round(10 * mult);
        tileLootPct += Math.round(8 * mult);
        break;
      case 'counts_estate':
        tileCampfireHealPct += Math.round(18 * mult);
        tileAtkPct += Math.round(18 * mult);
        tileLootPct += Math.round(18 * mult);
        break;
      case 'blood_grove':
        tileExecutePct = Math.max(tileExecutePct, Math.round(18 + tile.stars * 4));
        tileAtkPct += Math.round(8 * mult);
        break;
      case 'vanguard_outpost':
        tileDefFlat += Math.round(6 * mult);
        tileAtkPct += Math.round(10 * mult);
        break;
      case 'chrono_obelisk':
        tileSpeedPct += Math.round(18 * mult);
        break;
      case 'storm_conduit':
        tileChainPct += Math.round(16 * mult);
        tileAtkPct += Math.round(10 * mult);
        break;
      case 'tesla_spire':
        tileChainPct += Math.round(36 * mult);
        tileSpeedPct += Math.round(20 * mult);
        tileAtkPct += Math.round(16 * mult);
        break;
      case 'alchemist_vault':
        tileLootPct += Math.round(18 * mult);
        break;
      case 'mythic_treasury':
        tileLootPct += Math.round(45 * mult);
        bonusGearRolls += 1;
        break;
      case 'spider_cocoon':
        tileSpeedPct += Math.round(8 * mult);
        tileLootPct += Math.round(10 * mult);
        break;
      default:
        break;
    }
  }

  const activeTraits = LOOP_TRAIT_SYNERGIES.map((tr) => {
    const count = traitCounts[tr.id] || 0;
    let tier = 0;
    for (let i = 0; i < tr.breakpoints.length; i++) {
      if (count >= tr.breakpoints[i]) tier = i + 1;
    }
    return {
      ...tr,
      count,
      tier,
      activeDesc: tier > 0 ? tr.tierDescs[tier - 1] : tr.tierDescs[0],
    };
  });

  const tTier = Object.fromEntries(activeTraits.map((t) => [t.id, t.tier]));
  const maxHpPct = [0, 12, 28, 55][tTier.verdant || 0];
  const chainLightningPct = tileChainPct + [0, 18, 38, 65][tTier.storm || 0];
  const lifestealPct = tileLifestealPct + [0, 10, 22, 40][tTier.crimson || 0];
  const executePct = Math.max(tileExecutePct, [0, 0, 12, 20][tTier.crimson || 0]);
  const barrierBonusPct = [0, 12, 25, 45][tTier.bastion || 0];
  const defPct = [0, 14, 30, 55][tTier.titan || 0];
  const speedPct = tileSpeedPct + [0, 15, 32, 55][tTier.chrono || 0];
  const sackTraitPct = [0, 15, 30, 55][tTier.chrono || 0];

  return {
    board: cleanBoard,
    traitCounts,
    activeTraits,
    evolvedCount,
    bonuses: {
      atkPct: tileAtkPct,
      maxHpFlat: tileMaxHpFlat,
      maxHpPct,
      defFlat: tileDefFlat,
      defPct,
      lifestealPct,
      executePct,
      chainLightningPct,
      barrierBonusPct,
      speedPct,
      lootMult: Math.round((1 + (tileLootPct + sackTraitPct) / 100) * 100) / 100,
      campfireHealPct: 18 + tileCampfireHealPct + [0, 6, 12, 20][tTier.verdant || 0],
      bonusGearRolls,
    },
  };
}

function smartPickPlacementCell(cardKey, board) {
  const def = LOOP_TILE_CARDS[cardKey];
  if (!def || !def.placeable) return null;

  // Prefer upgrading a matching card on board to ★2/★3 if available
  const mergeTarget = board.find((t) => t.baseKey === cardKey && t.stars < 3);
  const occupied = new Set(board.map((t) => `${t.x},${t.y}`));

  const candidates = [];
  for (let y = 0; y < LOOP_GRID_HEIGHT; y++) {
    for (let x = 0; x < LOOP_GRID_WIDTH; x++) {
      if (isCampfireCoord(x, y)) continue;
      const road = isRoadCoord(x, y);
      if (def.placement === 'road' && !road) continue;
      if (def.placement === 'landscape' && road) continue;
      if (occupied.has(`${x},${y}`)) continue;

      const trialBoard = [...board.map((t) => ({ ...t })), { x, y, baseKey: cardKey, cardKey, stars: 1, evolved: false }];
      const beforeEvo = recomputeLoopBoardSynergies(board).evolvedCount;
      const afterEvo = recomputeLoopBoardSynergies(trialBoard).evolvedCount;
      const adjCount = board.filter((t) => Math.abs(t.x - x) <= 1 && Math.abs(t.y - y) <= 1).length;
      const isCourtyard = x >= 2 && x <= 4 && y === 2 ? 1 : 0;
      const score = (afterEvo - beforeEvo) * 100 + adjCount * 10 + isCourtyard * 5;
      candidates.push({ x, y, score, triggersEvo: afterEvo > beforeEvo });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  if (candidates[0]?.triggersEvo) return { x: candidates[0].x, y: candidates[0].y, isMerge: false };
  if (mergeTarget) return { x: mergeTarget.x, y: mergeTarget.y, isMerge: true };
  if (candidates[0]) return { x: candidates[0].x, y: candidates[0].y, isMerge: false };
  return null;
}

export function ensureIdleState(flags, profile, now = Date.now()) {
  const existing = flags.idle && typeof flags.idle === 'object' ? flags.idle : {};
  const stage = Math.max(1, Number(existing.stage || profile.floor || 1));
  const maxStage = Math.max(stage, Number(existing.maxStage || profile.best_floor || 1));
  const rawLoop = existing.loop && typeof existing.loop === 'object' ? existing.loop : {};
  const starterBoard = [
    { x: 2, y: 2, baseKey: 'starlight_meadow', cardKey: 'starlight_meadow', stars: 1, evolved: false },
    { x: 5, y: 2, baseKey: 'spider_cocoon', cardKey: 'spider_cocoon', stars: 1, evolved: false },
  ];
  const resolvedBoard = recomputeLoopBoardSynergies(
    Array.isArray(rawLoop.board) ? rawLoop.board : starterBoard
  );
  const starterHand = [
    makeLoopHandCard('vampire_manor', 1),
    makeLoopHandCard('ruined_village', 1),
    makeLoopHandCard('starlight_meadow', 1),
    makeLoopHandCard('titan_mountain', 1),
  ];
  const activeRelics = Array.isArray(rawLoop.activeRelics) ? rawLoop.activeRelics : [];
  const pendingRelicChoices = Array.isArray(rawLoop.pendingRelicChoices)
    ? rawLoop.pendingRelicChoices
    : rollRandomRelicChoices(activeRelics, 3);

  return {
    stage,
    maxStage,
    wave: Math.max(1, Math.min(10, Number(existing.wave || 1))),
    wavesClearedTotal: Number(existing.wavesClearedTotal || 0),
    overdriveWavesCleared: Number(existing.overdriveWavesCleared || 0),
    ascensions: Number(existing.ascensions || 0),
    celestialEmbers: Number(existing.celestialEmbers || 0),
    totalEmbersEarned: Number(existing.totalEmbersEarned || 0),
    overdriveUntilMs: Number(existing.overdriveUntilMs || 0),
    lastTickAtMs: Number(existing.lastTickAtMs || now),
    bossWallStuck: Boolean(existing.bossWallStuck),
    gambits: {
      ultPolicy: existing.gambits?.ultPolicy === 'boss_or_broken' ? 'boss_or_broken' : 'auto_ready',
      healThreshold: [25, 45, 70].includes(Number(existing.gambits?.healThreshold))
        ? Number(existing.gambits.healThreshold)
        : 45,
      stageProgression: existing.gambits?.stageProgression === 'farm_stage' ? 'farm_stage' : 'auto_push',
      focusTarget: existing.gambits?.focusTarget === 'highest_dps' ? 'highest_dps' : 'shield_break',
      battlePace: ['1x', '2x', 'overdrive'].includes(existing.gambits?.battlePace)
        ? existing.gambits.battlePace
        : '1x',
    },
    automation: {
      autoEquipBest: existing.automation?.autoEquipBest !== undefined ? Boolean(existing.automation.autoEquipBest) : true,
      autoSalvageMaxRarity: ['off', 'common', 'uncommon', 'rare'].includes(existing.automation?.autoSalvageMaxRarity)
        ? existing.automation.autoSalvageMaxRarity
        : 'common',
    },
    formation: {
      front: Array.isArray(existing.formation?.front) && existing.formation.front.length === 2
        ? existing.formation.front
        : ['solarius', 'kaelis'],
      back: Array.isArray(existing.formation?.back) && existing.formation.back.length === 2
        ? existing.formation.back
        : ['aurelia', 'seraphina'],
    },
    professions: {
      astral_mining: Math.max(1, Number(existing.professions?.astral_mining || 1)),
      alchemy_lab: Math.max(1, Number(existing.professions?.alchemy_lab || 1)),
      rune_scribes: Math.max(1, Number(existing.professions?.rune_scribes || 1)),
    },
    ascensionRelics: {
      relic_warlord: Math.max(0, Number(existing.ascensionRelics?.relic_warlord || 0)),
      relic_chronos: Math.max(0, Number(existing.ascensionRelics?.relic_chronos || 0)),
      relic_midas: Math.max(0, Number(existing.ascensionRelics?.relic_midas || 0)),
      relic_seeker: Math.max(0, Number(existing.ascensionRelics?.relic_seeker || 0)),
    },
    afkChest: {
      accumulatedSec: Math.max(0, Math.min(43200, Number(existing.afkChest?.accumulatedSec || 0))),
      shards: Math.max(0, Number(existing.afkChest?.shards || 0)),
      coins: Math.max(0, Number(existing.afkChest?.coins || 0)),
      xp: Math.max(0, Number(existing.afkChest?.xp || 0)),
      itemsRolled: Math.max(0, Number(existing.afkChest?.itemsRolled || 0)),
      lastClaimedAtMs: Number(existing.afkChest?.lastClaimedAtMs || now),
    },
    claimedMilestones: Array.isArray(existing.claimedMilestones) ? existing.claimedMilestones : [],
    loop: {
      loopCount: Math.max(1, Number(rawLoop.loopCount || 1)),
      tileIndex: Math.max(0, Math.min(LOOP_ROAD_PATH.length - 1, Number(rawLoop.tileIndex || 0))),
      threatPct: Math.max(0, Math.min(100, Number(rawLoop.threatPct ?? 18))),
      bossActive: Boolean(rawLoop.bossActive),
      autoArchitect: Boolean(rawLoop.autoArchitect),
      board: resolvedBoard.board,
      hand: Array.isArray(rawLoop.hand) ? rawLoop.hand : starterHand,
      activeRelics,
      pendingRelicChoices,
      lootSack: {
        shards: Math.max(0, Number(rawLoop.lootSack?.shards || 0)),
        coins: Math.max(0, Number(rawLoop.lootSack?.coins || 0)),
        xp: Math.max(0, Number(rawLoop.lootSack?.xp || 0)),
        embers: Math.max(0, Number(rawLoop.lootSack?.embers || 0)),
        gearRolls: Math.max(0, Number(rawLoop.lootSack?.gearRolls || 0)),
      },
      synergiesTriggered: Math.max(Number(rawLoop.synergiesTriggered || 0), resolvedBoard.evolvedCount),
    },
  };
}

// ==========================================
// SHADOW SLAVE: AWAKENING, SOUL SEA & FORGOTTEN SHORE ENGINE
// ==========================================

function pickWeightedAspect(seedNum) {
  const total = SS_ASPECTS.reduce((acc, a) => acc + (a.weight || 10), 0);
  const rand = ((Math.abs(Math.sin(seedNum * 12.9898) * 43758.5453) % 1) + Math.random()) * 0.5;
  let roll = rand * total;
  for (const asp of SS_ASPECTS) {
    roll -= asp.weight || 10;
    if (roll <= 0) return asp;
  }
  return SS_ASPECTS[0];
}

function pickUniqueItems(pool, count) {
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

function createCombatFromNode(node, actNum = 1) {
  if (!node) return null;
  return {
    nodeId: node.id,
    enemyKey: node.enemyKey || 'slime',
    name: node.enemyName || 'Carapace Scavenger',
    rank: node.enemyRank || 'Dormant',
    enemyClass: node.enemyClass || 'Beast',
    hp: node.hp || 85,
    maxHp: node.hp || 85,
    atk: node.atk || 12,
    intent: node.intent || 'CLAW_SWIPE',
    staggered: false,
    staggerTurns: 0,
    isBoss: Boolean(node.isBoss),
    act: actNum,
    fragments: node.fragments || 1,
    shards: node.shards || 8,
  };
}

function rollFreshShadowIdentity(userId, salt = 0) {
  const asp = pickWeightedAspect((userId || 1) + salt);
  const attrs = pickUniqueItems(SS_ATTRIBUTES, 3).map((a) => a.id);
  const flaw = SS_FLAWS[Math.floor(Math.random() * SS_FLAWS.length)];
  const trueName = SS_TRUE_NAMES[Math.floor(Math.random() * SS_TRUE_NAMES.length)];
  return {
    aspectId: asp.id,
    attributeIds: attrs,
    flawId: flaw.id,
    trueName,
    appraisal: asp.rank === 'Divine' || asp.rank === 'Sacred' ? 'Glorious' : 'Excellent',
  };
}

export function ensureShadowSlaveState(flags, profile) {
  const existing = flags.shadowSlave && typeof flags.shadowSlave === 'object' ? flags.shadowSlave : null;
  const freshId = existing ? null : rollFreshShadowIdentity(profile.user_id || 1);

  const aspectId =
    existing && SS_ASPECTS.some((a) => a.id === existing.aspectId)
      ? existing.aspectId
      : freshId.aspectId;
  const attrIds =
    existing && Array.isArray(existing.attributeIds) && existing.attributeIds.length >= 2
      ? existing.attributeIds.filter((id) => SS_ATTRIBUTES.some((a) => a.id === id)).slice(0, 3)
      : freshId.attributeIds;
  while (attrIds.length < 3) {
    const candidate = SS_ATTRIBUTES[Math.floor(Math.random() * SS_ATTRIBUTES.length)].id;
    if (!attrIds.includes(candidate)) attrIds.push(candidate);
  }
  const flawId =
    existing && SS_FLAWS.some((f) => f.id === existing.flawId) ? existing.flawId : freshId.flawId;

  const arcAct = Math.max(1, Math.min(4, Number(existing?.arcAct || 1)));
  const maxArcAct = Math.max(arcAct, Math.min(4, Number(existing?.maxArcAct || 1)));
  const actDef = SS_ARC1_ACTS.find((a) => a.act === arcAct) || SS_ARC1_ACTS[0];
  const nodeExists = actDef.nodes.some((n) => n.id === existing?.currentNodeId);
  const currentNodeId = nodeExists ? existing.currentNodeId : actDef.nodes[0].id;
  const curNode = actDef.nodes.find((n) => n.id === currentNodeId) || actDef.nodes[0];

  const attrObjs = attrIds.map((id) => SS_ATTRIBUTES.find((a) => a.id === id)).filter(Boolean);
  const attrHp = attrObjs.reduce((s, a) => s + (a.hpBonus || 0), 0);
  const attrEssence = attrObjs.reduce((s, a) => s + (a.essenceBonus || 0), 0);
  const rankIdx = Math.max(0, SS_RANKS.indexOf(existing?.rank || 'Dormant'));
  const coreCount = Math.max(1, Math.min(7, Number(existing?.coreCount || 1)));
  const heroMaxHp = Math.round((120 + attrHp + rankIdx * 55 + (coreCount - 1) * 45) * 1);
  const maxSoulEssence = Math.round(100 + attrEssence + (coreCount - 1) * 35);

  const memories =
    Array.isArray(existing?.memories) && existing.memories.length > 0
      ? existing.memories
      : [{ id: 'silver_bell', weaveLevel: 1, durability: 100, equipped: true }];

  const echoes =
    Array.isArray(existing?.echoes) && existing.echoes.length > 0
      ? existing.echoes
      : [{ id: 'stone_saint', unlocked: false, awakened: false, level: 1, fragmentsFed: 0 }];

  const activeCombat =
    existing?.activeCombat && existing.activeCombat.hp > 0
      ? existing.activeCombat
      : createCombatFromNode(curNode, arcAct);

  return {
    aspectId,
    attributeIds: attrIds,
    flawId,
    trueName: existing?.trueName || freshId.trueName,
    appraisal: existing?.appraisal || freshId.appraisal,
    rank: SS_RANKS[rankIdx] || 'Dormant',
    coreCount,
    soulFragments: Math.max(0, Number(existing?.soulFragments || 0)),
    soulEssence: Math.max(0, Math.min(maxSoulEssence, Number(existing?.soulEssence ?? Math.min(maxSoulEssence, 75)))),
    maxSoulEssence,
    heroHp: Math.max(1, Math.min(heroMaxHp, Number(existing?.heroHp ?? heroMaxHp))),
    heroMaxHp,
    arcAct,
    maxArcAct,
    currentNodeId,
    clearedNodeIds: Array.isArray(existing?.clearedNodeIds) ? existing.clearedNodeIds : [],
    sunProgress: Math.max(0, Math.min(100, Number(existing?.sunProgress ?? 18))),
    shadowWrap: ['weapon', 'body', 'echo'].includes(existing?.shadowWrap) ? existing.shadowWrap : 'weapon',
    activeCombat,
    memories,
    echoes,
    slainShades: {
      count: Math.max(1, Number(existing?.slainShades?.count || 1)),
      recent: Array.isArray(existing?.slainShades?.recent)
        ? existing.slainShades.recent.slice(0, 12)
        : ['Larva-Touched Caravan Slave'],
    },
    spellweaveStrings: Math.max(1, Number(existing?.spellweaveStrings || 1)),
    lastWhisper: existing?.lastWhisper || '[Your Nightmare has begun. Survive the Black Mountain to awaken your Soul Core.]',
  };
}

function buildShadowSlaveClientState(ss) {
  const aspect = SS_ASPECTS.find((a) => a.id === ss.aspectId) || SS_ASPECTS[0];
  const attributes = ss.attributeIds
    .map((id) => SS_ATTRIBUTES.find((a) => a.id === id))
    .filter(Boolean);
  const flaw = SS_FLAWS.find((f) => f.id === ss.flawId) || SS_FLAWS[0];
  const coreClass = SS_CORE_CLASSES.find((c) => c.coreCount === ss.coreCount) || SS_CORE_CLASSES[0];
  const currentAct = SS_ARC1_ACTS.find((a) => a.act === ss.arcAct) || SS_ARC1_ACTS[0];
  const currentNode = currentAct.nodes.find((n) => n.id === ss.currentNodeId) || currentAct.nodes[0];
  const sunPhase = ss.sunProgress >= 75 ? 'night' : ss.sunProgress >= 50 ? 'dusk' : 'day';

  const enrichedMemories = ss.memories
    .map((m) => {
      const def = SS_MEMORIES.find((d) => d.id === m.id);
      if (!def) return null;
      const scale = 1 + ((m.weaveLevel || 1) - 1) * 0.25;
      return {
        ...def,
        weaveLevel: m.weaveLevel || 1,
        durability: m.durability ?? 100,
        equipped: Boolean(m.equipped),
        effectiveAtk: Math.round(def.atk * scale),
        effectiveDef: Math.round(def.def * scale),
        weaveCost: 20 * (m.weaveLevel || 1),
      };
    })
    .filter(Boolean);

  const enrichedEchoes = ss.echoes
    .map((e) => {
      const def = SS_ECHOES.find((d) => d.id === e.id);
      if (!def) return null;
      const scale = 1 + ((e.level || 1) - 1) * 0.22 + (e.awakened ? 0.35 : 0);
      return {
        ...def,
        unlocked: Boolean(e.unlocked),
        awakened: Boolean(e.awakened),
        level: e.level || 1,
        effectiveAtk: Math.round(def.atk * scale),
        effectiveDef: Math.round(def.def * scale),
        upgradeCost: 30 * (e.level || 1),
      };
    })
    .filter(Boolean);

  const cohort = SS_COHORT.map((c, idx) => ({
    ...c,
    unlocked:
      c.id === 'sunny' ||
      (ss.arcAct >= 2 && (c.id === 'nephis' || c.id === 'cassie')) ||
      (ss.arcAct >= 3 && idx <= 4),
  }));

  const studyFragMult = attributes.reduce((m, a) => Math.max(m, a.studyFragmentMult || 1), 1);

  return {
    aspect,
    attributes,
    flaw,
    trueName: ss.trueName,
    appraisal: ss.appraisal,
    rank: ss.rank,
    coreCount: ss.coreCount,
    coreClass,
    soulFragments: ss.soulFragments,
    fragmentsPerCore: 1000,
    soulEssence: ss.soulEssence,
    maxSoulEssence: ss.maxSoulEssence,
    heroHp: ss.heroHp,
    heroMaxHp: ss.heroMaxHp,
    arcAct: ss.arcAct,
    maxArcAct: ss.maxArcAct,
    currentAct,
    allActs: SS_ARC1_ACTS.map((a) => ({
      act: a.act,
      key: a.key,
      title: a.title,
      subtitle: a.subtitle,
      unlocked: a.act <= ss.maxArcAct,
    })),
    currentNode,
    clearedNodeIds: ss.clearedNodeIds,
    sunProgress: ss.sunProgress,
    sunPhase,
    shadowWrap: ss.shadowWrap,
    activeCombat: ss.activeCombat,
    memories: enrichedMemories,
    echoes: enrichedEchoes,
    cohort,
    slainShades: ss.slainShades,
    spellweaveStrings: ss.spellweaveStrings,
    lastWhisper: ss.lastWhisper,
    studyFragMult,
    reweaveCost: REWEAVE_FATE_COST,
  };
}

export function computeIdleMetrics(idle, heroStats, now = Date.now()) {
  const warlordRank = idle.ascensionRelics.relic_warlord || 0;
  const chronosRank = idle.ascensionRelics.relic_chronos || 0;
  const midasRank = idle.ascensionRelics.relic_midas || 0;
  const seekerRank = idle.ascensionRelics.relic_seeker || 0;

  const miningLvl = idle.professions.astral_mining || 1;
  const alchemyLvl = idle.professions.alchemy_lab || 1;
  const scribesLvl = idle.professions.rune_scribes || 1;

  const loopAnalysis = recomputeLoopBoardSynergies(idle.loop?.board || []);
  const lb = loopAnalysis.bonuses;
  const activeRelicSet = new Set(idle.loop?.activeRelics || []);
  const scholarPrismAtkPct = activeRelicSet.has('scholar_prism') ? loopAnalysis.evolvedCount * 20 : 0;
  const heartstoneHp = activeRelicSet.has('titan_heartstone') ? 120 : 0;
  const midasRelicMult = activeRelicSet.has('midas_astrolabe') ? 1.45 : 1.0;
  const chronoRelicSpeed = activeRelicSet.has('chrono_pendulum') ? 0.25 : 0;

  const ascensionMult = 1 + (idle.ascensions || 0) * 0.35 + warlordRank * 0.25;
  const loopAtkMult = 1 + (lb.atkPct + scholarPrismAtkPct) / 100;
  const loopHpMult = 1 + lb.maxHpPct / 100;
  const profAtkMult = (1 + (miningLvl - 1) * 0.04) * loopAtkMult;
  const profHpMult = (1 + (alchemyLvl - 1) * 0.05) * loopHpMult;
  const overdriveActive = (idle.overdriveUntilMs || 0) > now;
  const studyFeverMult = heroStats.studyBonuses?.focusFever ? 1.25 : 1.0;
  const baseSpeedMult = 1 + chronosRank * 0.2 + lb.speedPct / 100 + chronoRelicSpeed;
  const speedMultiplier = Math.round((overdriveActive ? 4.0 : 1.0) * baseSpeedMult * studyFeverMult * 10) / 10;

  const effectiveHpPool = heroStats.maxHp + lb.maxHpFlat + heartstoneHp;
  const effectiveDef = heroStats.def + lb.defFlat * (1 + lb.defPct / 100);
  const squadPower = Math.round(
    (heroStats.atk * 4.2 * profAtkMult +
      effectiveHpPool * 0.35 * profHpMult +
      effectiveDef * 2.5 +
      heroStats.critPct * 2.2 +
      heroStats.luck * 1.4) *
      ascensionMult
  );
  const squadDps = Math.max(
    18,
    Math.round(
      heroStats.atk *
        3.1 *
        profAtkMult *
        ascensionMult *
        (1 + (heroStats.critPct + (scribesLvl - 1) * 2) * 0.008) *
        (1 + lb.chainLightningPct * 0.003)
    )
  );

  const midasMult = (1 + midasRank * 0.3) * lb.lootMult * midasRelicMult;
  const shardsPerHr = Math.round((45 + (miningLvl - 1) * 28 + idle.stage * 10) * midasMult * (overdriveActive ? 1.6 : 1));
  const coinsPerHr = Math.round((30 + (alchemyLvl - 1) * 18 + idle.stage * 7) * midasMult * (overdriveActive ? 1.5 : 1));
  const xpPerHr = Math.round((120 + (scribesLvl - 1) * 75 + idle.stage * 22) * (overdriveActive ? 1.6 : 1));

  const recommendedPower = Math.round(135 * Math.pow(1.36, Math.max(0, idle.stage - 1)));
  const bossRecPower = Math.round(165 * Math.pow(1.36, Math.max(0, idle.stage - 1)));
  const enemyDps = Math.max(
    9,
    Math.round(
      11 *
        Math.pow(1.32, Math.max(0, idle.stage - 1)) *
        (1 + ((idle.loop?.loopCount || 1) - 1) * 0.14) *
        (idle.wave === 10 || idle.loop?.bossActive ? 1.55 : 0.85 + idle.wave * 0.04)
    )
  );

  return {
    overdriveActive,
    overdriveRemainingSec: overdriveActive ? Math.max(0, Math.round((idle.overdriveUntilMs - now) / 1000)) : 0,
    speedMultiplier,
    ascensionMult: Math.round(ascensionMult * 100) / 100,
    midasMult: Math.round(midasMult * 100) / 100,
    effectiveLuck: heroStats.luck + (scribesLvl - 1) * 4 + seekerRank * 15,
    squadPower,
    squadDps,
    recommendedPower,
    bossRecPower,
    enemyDps,
    bossWallStuck: Boolean(idle.bossWallStuck),
    shardsPerHr,
    coinsPerHr,
    xpPerHr,
    loopAnalysis,
  };
}

function accrueIdleProgress(db, profile, flags, heroStats, now = Date.now()) {
  const idle = ensureIdleState(flags, profile, now);
  const elapsedSec = Math.min(43200, Math.max(0, Math.floor((now - (idle.lastTickAtMs || now)) / 1000)));
  if (elapsedSec >= 5) {
    const metrics = computeIdleMetrics(idle, heroStats, now);
    const addSec = Math.min(43200 - idle.afkChest.accumulatedSec, elapsedSec);
    if (addSec > 0) {
      const hrFraction = addSec / 3600;
      idle.afkChest.accumulatedSec += addSec;
      idle.afkChest.shards += Math.max(1, Math.round(metrics.shardsPerHr * hrFraction));
      idle.afkChest.coins += Math.max(1, Math.round(metrics.coinsPerHr * hrFraction));
      idle.afkChest.xp += Math.max(2, Math.round(metrics.xpPerHr * hrFraction));
      idle.afkChest.itemsRolled = Math.min(8, Math.floor(idle.afkChest.accumulatedSec / 300) + (idle.afkChest.shards >= 15 ? 1 : 0));
    }
    idle.lastTickAtMs = now;
    flags.idle = idle;
    db.prepare('UPDATE game_profiles SET story_flags_json = ?, updated_at = ? WHERE user_id = ?').run(
      JSON.stringify(flags),
      now,
      profile.user_id
    );
  }
  return idle;
}

function buildIdleClientState(idle, heroStats, now = Date.now(), shadowSlaveState = null) {
  const metrics = computeIdleMetrics(idle, heroStats, now);
  const realm = getIdleRealmForStage(idle.stage);
  const enemyTemplate = IDLE_STAGE_ENEMIES[(idle.stage + idle.wave - 2) % IDLE_STAGE_ENEMIES.length] || IDLE_STAGE_ENEMIES[0];
  const secondaryTemplate = IDLE_STAGE_ENEMIES[(idle.stage + idle.wave) % IDLE_STAGE_ENEMIES.length] || IDLE_STAGE_ENEMIES[1];
  const isBossWave = idle.wave === 10;
  const enemyMaxHp = Math.round((85 + idle.stage * 45 + idle.wave * 10) * (isBossWave ? 2.5 : 1));
  const enemyMaxShields = isBossWave ? 3 : enemyTemplate.shields;
  const secondaryMaxHp = Math.round(enemyMaxHp * 0.65);

  const professions = IDLE_PROFESSIONS.map((p) => {
    const level = Math.max(1, Number(idle.professions[p.id] || 1));
    const ratePerHr = Math.round((p.baseRatePerHr + (level - 1) * p.ratePerLevel) * metrics.midasMult);
    const upgradeCost = Math.round(p.baseCost * Math.pow(1.45, level - 1));
    return {
      ...p,
      level,
      ratePerHr,
      upgradeCost,
    };
  });

  const ascensionRelics = IDLE_ASCENSION_RELICS.map((r) => {
    const rank = Math.max(0, Number(idle.ascensionRelics[r.id] || 0));
    return {
      ...r,
      rank,
      nextCost: r.baseEmberCost + rank,
    };
  });

  const maxProfLevel = Math.max(
    idle.professions.astral_mining || 1,
    idle.professions.alchemy_lab || 1,
    idle.professions.rune_scribes || 1
  );
  const mythicMilestones = IDLE_MYTHIC_BOUNTIES.map((m) => {
    let progress = 0;
    if (m.reqKey === 'wavesClearedTotal') progress = idle.wavesClearedTotal || 0;
    else if (m.reqKey === 'stageOrProf') progress = Math.max(idle.maxStage || 1, maxProfLevel);
    else if (m.reqKey === 'ascensions') progress = idle.ascensions || 0;
    else if (m.reqKey === 'wavesForPhoenix') progress = Math.max(idle.maxStage || 1, idle.wavesClearedTotal || 0);
    const claimed = (idle.claimedMilestones || []).includes(m.id);
    return {
      ...m,
      progress: Math.min(m.target, progress),
      unlocked: progress >= m.target,
      claimed,
    };
  });

  const canAscend = idle.maxStage >= 2 || idle.wavesClearedTotal >= 4;
  const pendingEmbers = canAscend
    ? Math.max(2, idle.maxStage + Math.floor((idle.wavesClearedTotal || 0) / 6))
    : 0;

  const { loopAnalysis, ...publicMetrics } = metrics;
  const loopState = idle.loop || {};
  const activeRelicSet = new Set(loopState.activeRelics || []);
  const enrichedBoard = loopAnalysis.board.map((tile) => {
    const def = LOOP_TILE_CARDS[tile.cardKey] || LOOP_TILE_CARDS[tile.baseKey];
    return {
      ...tile,
      name: def?.name || tile.cardKey,
      icon: def?.icon || '🗺️',
      placement: def?.placement || 'landscape',
      color: def?.color || '#38bdf8',
      desc: def?.desc || '',
      traits: def?.traits || [],
    };
  });
  const enrichedHand = (loopState.hand || []).map((c) => {
    const def = LOOP_TILE_CARDS[c.cardKey];
    return {
      ...c,
      name: def?.name || c.cardKey,
      icon: def?.icon || '🃏',
      placement: def?.placement || 'landscape',
      color: def?.color || '#38bdf8',
      desc: def?.desc || '',
      traits: def?.traits || [],
      threat: def?.threat || 5,
    };
  });
  const activeRelicObjs = LOOP_CAMPFIRE_RELICS.filter((r) => activeRelicSet.has(r.id));
  const pendingRelicObjs = (loopState.pendingRelicChoices || [])
    .map((id) => LOOP_CAMPFIRE_RELICS.find((r) => r.id === id))
    .filter(Boolean);
  const loopCount = Math.max(1, Number(loopState.loopCount || 1));
  const greedMultiplier = Math.round((1 + (loopCount - 1) * 0.35) * 100) / 100;

  return {
    stage: idle.stage,
    maxStage: idle.maxStage,
    wave: idle.wave,
    isBossWave,
    wavesClearedTotal: idle.wavesClearedTotal || 0,
    realm,
    currentEnemy: {
      key: isBossWave ? 'dragon' : enemyTemplate.key,
      name: isBossWave ? `${realm.name} Warden` : enemyTemplate.name,
      hp: enemyMaxHp,
      maxHp: enemyMaxHp,
      shields: enemyMaxShields,
      maxShields: enemyMaxShields,
      isBoss: isBossWave,
    },
    secondaryEnemy: {
      key: isBossWave ? 'armor' : secondaryTemplate.key,
      name: isBossWave ? `${realm.name} Guard` : secondaryTemplate.name,
      hp: secondaryMaxHp,
      maxHp: secondaryMaxHp,
      shields: isBossWave ? 2 : 1,
      maxShields: isBossWave ? 2 : 1,
      isBoss: false,
    },
    squadHeroes: IDLE_SQUAD_HEROES.map((h) => ({
      ...h,
      row: idle.formation.front.includes(h.id) ? 'front' : 'back',
      effectiveAtk: Math.round((h.baseAtk + heroStats.atk * 0.65) * publicMetrics.ascensionMult),
      effectiveHp: Math.round((h.baseHp + heroStats.maxHp * 0.45) * publicMetrics.ascensionMult),
    })),
    formation: idle.formation,
    gambits: idle.gambits,
    automation: idle.automation,
    professions,
    ascensions: idle.ascensions || 0,
    celestialEmbers: idle.celestialEmbers || 0,
    totalEmbersEarned: idle.totalEmbersEarned || 0,
    canAscend,
    pendingEmbers,
    ascensionRelics,
    mythicMilestones,
    afkChest: {
      ...idle.afkChest,
      capSec: 43200,
    },
    loop: {
      gridWidth: LOOP_GRID_WIDTH,
      gridHeight: LOOP_GRID_HEIGHT,
      roadPath: LOOP_ROAD_PATH,
      loopCount,
      tileIndex: Math.max(0, Math.min(LOOP_ROAD_PATH.length - 1, Number(loopState.tileIndex || 0))),
      threatPct: Math.max(0, Math.min(100, Number(loopState.threatPct || 0))),
      bossActive: Boolean(loopState.bossActive),
      autoArchitect: Boolean(loopState.autoArchitect),
      greedMultiplier,
      board: enrichedBoard,
      hand: enrichedHand,
      activeTraits: loopAnalysis.activeTraits,
      bonuses: loopAnalysis.bonuses,
      activeRelics: activeRelicObjs,
      pendingRelicChoices: pendingRelicObjs,
      lootSack: loopState.lootSack || { shards: 0, coins: 0, xp: 0, embers: 0, gearRolls: 0 },
      synergiesTriggered: Number(loopState.synergiesTriggered || 0),
    },
    shadowSlave: shadowSlaveState,
    ...publicMetrics,
  };
}

export function buildGameState(db, user, userStats) {
  const profile = ensureGameProfile(db, user.id);
  const rawItems = db
    .prepare(
      `SELECT * FROM game_items WHERE user_id = ?
       ORDER BY equipped DESC, CASE rarity WHEN 'mythic' THEN 6 WHEN 'legendary' THEN 5 WHEN 'epic' THEN 4 WHEN 'rare' THEN 3 WHEN 'uncommon' THEN 2 ELSE 1 END DESC, id DESC`
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
  const now = Date.now();
  const hadShadow = Boolean(flags.shadowSlave);
  const ssRaw = ensureShadowSlaveState(flags, profile);
  if (!hadShadow) {
    flags.shadowSlave = ssRaw;
    db.prepare('UPDATE game_profiles SET story_flags_json = ?, updated_at = ? WHERE user_id = ?').run(
      JSON.stringify(flags),
      now,
      user.id
    );
  }
  const shadowSlave = buildShadowSlaveClientState(ssRaw);
  const idleRaw = accrueIdleProgress(db, profile, flags, heroStats, now);
  const idle = buildIdleClientState(idleRaw, heroStats, now, shadowSlave);
  const affinity = parseJsonSafe(profile.npc_affinity_json, { rowan: 0, bram: 0, lyra: 0, pip: 0 });
  const quests = parseJsonSafe(profile.active_quests_json, []);
  const dungeon = profile.mode === 'dungeon' ? parseJsonSafe(profile.dungeon_state_json, null) : null;

  const recruitedAllies = Array.isArray(flags.recruitedAllies) ? flags.recruitedAllies : [];
  const activeAllyId = recruitedAllies.includes(flags.activeAllyId) ? flags.activeAllyId : recruitedAllies[0] || null;
  const allies = PARTY_ALLIES.map((a) => {
    const recruited = recruitedAllies.includes(a.id);
    const active = a.id === activeAllyId && recruited;
    const freeByReq =
      a.recruitCostShards === 0 ||
      (a.recruitNpcId && (affinity[a.recruitNpcId] || 0) >= (a.recruitTrustReq || 10)) ||
      (a.recruitFloorReq && profile.best_floor >= a.recruitFloorReq);
    return {
      ...a,
      recruited,
      active,
      canRecruitFree: freeByReq,
      effectiveShardCost: freeByReq ? 0 : a.recruitCostShards,
    };
  });
  const activeAlly = allies.find((a) => a.active) || null;

  const sideStoriesState = flags.sideStories && typeof flags.sideStories === 'object' ? flags.sideStories : {};
  const mythicSideStories = MYTHIC_SIDE_STORIES.map((st) => {
    const prog = sideStoriesState[st.id] || { actIndex: 0, choices: [], completed: false };
    const actIdx = Math.min(st.acts.length, Number(prog.actIndex || 0));
    const completed = Boolean(prog.completed) || actIdx >= st.acts.length;
    const currentAct = completed ? null : st.acts[actIdx];
    return {
      ...st,
      actIndex: actIdx,
      totalActs: st.acts.length,
      completed,
      choicesTaken: Array.isArray(prog.choices) ? prog.choices : [],
      currentAct,
    };
  });

  const deedStats = flags.deedStats && typeof flags.deedStats === 'object' ? flags.deedStats : {};
  const claimedDeeds = Array.isArray(flags.claimedDeeds) ? flags.claimedDeeds : [];
  const heroicDeeds = HEROIC_DEEDS.map((d) => {
    const progress = Math.min(d.target, Number(deedStats[d.statKey] || 0));
    const completed = progress >= d.target;
    const claimed = claimedDeeds.includes(d.id);
    return {
      ...d,
      progress,
      completed,
      claimed,
    };
  });

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
    party: {
      activeAllyId,
      activeAlly,
      allies,
    },
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
      mythicSideStories,
      heroicDeeds,
    },
    items,
    equippedBySlot,
    encounter: activeEncounter,
    recentLogs: Array.isArray(recentLogs) ? recentLogs : [],
    idle,
    shadowSlave,
  };
}

export function grantStudyRewardsToGame(db, user, userStats, durationSec, purityPct, strictMode) {
  const profile = ensureGameProfile(db, user.id);
  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const studyBonuses = computeStudyBonuses(user, userStats);
  const heroStats = computeHeroStats(profile, rawItems, studyBonuses);
  const now = Date.now();

  const mins = Math.max(1, Math.round(durationSec / 60));
  const energyGained = Math.max(2, Math.min(20, Math.round(mins / 5) + (strictMode && purityPct >= 95 ? 2 : 0)));
  const shardsGained = Math.max(6, Math.round(mins * 0.9 + (purityPct >= 95 ? 5 : 0)));

  const flags = parseJsonSafe(profile.story_flags_json, {});
  const idle = ensureIdleState(flags, profile, now);
  const ss = ensureShadowSlaveState(flags, profile);
  const ssAttrs = ss.attributeIds.map((id) => SS_ATTRIBUTES.find((a) => a.id === id)).filter(Boolean);
  const fragMult = ssAttrs.reduce((m, a) => Math.max(m, a.studyFragmentMult || 1), 1);

  const essenceGain = Math.max(12, Math.round(mins * 1.4 + (strictMode && purityPct >= 95 ? 12 : 0)));
  const fragsGain = Math.max(1, Math.round((mins / 2.2) * fragMult));
  ss.soulEssence = Math.min(ss.maxSoulEssence, ss.soulEssence + essenceGain);
  ss.soulFragments += fragsGain;
  if (ss.soulFragments >= 1000 && ss.coreCount < 7) {
    ss.soulFragments -= 1000;
    ss.coreCount += 1;
    ss.lastWhisper = `[Your Soul Core has saturated and multiplied! You are now Class ${SS_CORE_CLASSES[ss.coreCount - 1]?.name || 'Monster'}.]`;
  } else {
    ss.lastWhisper = `[Soul Meditation (${mins}m): +${fragsGain} Soul Fragments absorbed (${ss.soulFragments}/1,000), +${essenceGain} Soul Essence restored.]`;
  }
  flags.shadowSlave = ss;

  const overdriveBonusMins = Math.max(15, mins + (idle.ascensionRelics.relic_chronos || 0) * 15);
  idle.overdriveUntilMs = Math.max(now, idle.overdriveUntilMs || 0) + overdriveBonusMins * 60_000;
  idle.wavesClearedTotal = (idle.wavesClearedTotal || 0) + Math.max(1, Math.floor(mins / 10));
  idle.lastTickAtMs = now;
  flags.idle = idle;

  db.prepare(`
    UPDATE game_profiles
    SET energy = MIN(99, energy + ?), shards = shards + ?, focus_charge = MIN(100, focus_charge + 30),
        story_flags_json = ?, updated_at = ?
    WHERE user_id = ?
  `).run(energyGained, shardsGained, JSON.stringify(flags), now, user.id);

  let droppedItem = null;
  const shouldDrop = durationSec >= 1200 || Math.random() < Math.min(0.65, 0.25 + heroStats.luck * 0.006);
  const updatedProf = db.prepare('SELECT * FROM game_profiles WHERE user_id = ?').get(user.id);
  if (shouldDrop) {
    const minRarity = durationSec >= 2700 ? 'rare' : durationSec >= 1200 ? 'uncommon' : 'common';
    droppedItem = generateLootItem(db, user.id, idle.stage, heroStats.luck, { minRarity });
    const logs = appendLogs(updatedProf, [
      `🌑 [Nightmare Spell Appraisal · ${mins}m]: +${fragsGain} Soul Frags, +${shardsGained}✦ Shards & wove [${droppedItem.rarity.toUpperCase()}] ${droppedItem.name}!`,
    ]);
    db.prepare('UPDATE game_profiles SET last_log_json = ? WHERE user_id = ?').run(logs, user.id);
  } else {
    const logs = appendLogs(updatedProf, [
      `🌑 [Nightmare Spell Appraisal · ${mins}m]: +${fragsGain} Soul Frags, +${essenceGain} Essence & +${shardsGained}✦ Shards absorbed.`,
    ]);
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
      const maxShields = ent.type === 'boss' ? 3 : 2;
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
          shields: maxShields,
          maxShields,
          stunned: false,
          vulnerableTurns: 0,
          armorBrokenTurns: 0,
          atkBonus: 0,
        },
        heroStatuses: {
          poisonTurns: 0,
          poisonDmg: 0,
          flankingTurns: 0,
          evasionActive: false,
          allyWardTurns: 0,
          allyCooldown: 0,
          comboChain: 0,
        },
      };
      logLines.push(`${ent.type === 'boss' ? '👑 BOSS BATTLE:' : '⚔️ Encountered'} ${ent.name} (${maxShields}🛡️ Guard Shields)!`);
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

export function resolveCombatAction(db, user, userStats, action, studyCastOpts = null) {
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
  const flags = parseJsonSafe(profile.story_flags_json, {});
  const deedStats = flags.deedStats && typeof flags.deedStats === 'object' ? { ...flags.deedStats } : {};
  const recruitedAllies = Array.isArray(flags.recruitedAllies) ? flags.recruitedAllies : [];
  const activeAlly = PARTY_ALLIES.find((a) => a.id === flags.activeAllyId && recruitedAllies.includes(a.id)) || null;
  const hasMythicWeapon = rawItems.some((i) => i.slot === 'weapon' && i.rarity === 'mythic');
  const hasMythicArmor = rawItems.some((i) => i.slot === 'armor' && i.rarity === 'mythic');
  const hasMythicCharm = rawItems.some((i) => i.slot === 'charm' && i.rarity === 'mythic');

  let heroHp = heroStats.hp;
  let focusCharge = profile.focus_charge;
  let potions = profile.potions;
  const enemy = {
    ...encounter.enemy,
    maxShields: encounter.enemy?.maxShields || (encounter.isBoss ? 3 : 2),
    shields: encounter.enemy?.shields !== undefined ? encounter.enemy.shields : (encounter.isBoss ? 3 : 2),
  };
  const heroStatuses = {
    poisonTurns: encounter.heroStatuses?.poisonTurns || 0,
    poisonDmg: encounter.heroStatuses?.poisonDmg || 0,
    flankingTurns: encounter.heroStatuses?.flankingTurns || 0,
    evasionActive: false,
    allyWardTurns: encounter.heroStatuses?.allyWardTurns || 0,
    allyCooldown: Math.max(0, (encounter.heroStatuses?.allyCooldown || 0) - 1),
    comboChain: encounter.heroStatuses?.comboChain || 0,
  };
  const events = [];
  const logLines = [];
  let guarding = false;
  let potionWard = false;
  let finisherBonusActive = false;
  let droppedItem = null;

  const damageEnemyShields = (count) => {
    if (count <= 0 || enemy.shields <= 0) return 0;
    const broken = Math.min(enemy.shields, count);
    enemy.shields = Math.max(0, enemy.shields - broken);
    deedStats.shieldsBroken = (deedStats.shieldsBroken || 0) + broken;
    if (enemy.shields === 0) {
      enemy.stunned = true;
      enemy.vulnerableTurns = Math.max(enemy.vulnerableTurns || 0, 2);
      enemy.armorBrokenTurns = Math.max(enemy.armorBrokenTurns || 0, 2);
      focusCharge = Math.min(100, focusCharge + 20);
      events.push({ kind: 'crit', target: 'enemy', text: '💥 BROKEN!' });
      logLines.push(`💥 GUARD SHATTERED! ${enemy.name} is BROKEN (+50% DMG taken & Stunned)!`);
    }
    return broken;
  };

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
    const isFlanking = heroStatuses.flankingTurns > 0;
    if (enemy.intent === 'SHELL' && !enemy.stunned && !isFlanking) {
      const chip = Math.max(1, Math.round(heroStats.atk * 0.25));
      const recoil = Math.max(3, Math.round((enemy.atk + (enemy.atkBonus || 0)) * 0.45));
      enemy.hp = Math.max(0, enemy.hp - chip);
      heroHp = Math.max(1, heroHp - recoil);
      events.push({ kind: 'hit', target: 'enemy', value: chip, text: `SHELL -${chip}` });
      events.push({ kind: 'enemy_hit', target: 'hero', value: recoil, text: `THORNS -${recoil}` });
      logLines.push(`🛡️ Clanked off ${enemy.name}’s Iron Shell (-${chip}) & took ${recoil} Thorns recoil! Use ⚡ Focus Break or 💨 Dash Flank!`);
    } else {
      const vulnMult = (enemy.vulnerableTurns > 0 ? 1.5 : 1.0) * (enemy.shields === 0 ? 1.2 : 1.0);
      const effDef = enemy.armorBrokenTurns > 0 || isFlanking ? enemy.def * 0.3 : enemy.def * 0.6;
      const raw = heroStats.atk * (0.95 + Math.random() * 0.14) - effDef;
      const isCrit = isFlanking || Math.random() * 100 < heroStats.critPct + heroStats.luck * 0.15;
      const flankMult = isFlanking ? 1.25 : 1.0;
      const dmg = Math.max(4, Math.round(raw * vulnMult * flankMult * (isCrit ? 1.75 : 1)));
      enemy.hp = Math.max(0, enemy.hp - dmg);
      focusCharge = Math.min(100, focusCharge + (isFlanking ? 30 : 25));
      heroStatuses.comboChain = (heroStatuses.comboChain || 0) + 1;

      if (isFlanking) {
        heroStatuses.flankingTurns = Math.max(0, heroStatuses.flankingTurns - 1);
        events.push({ kind: 'crit', target: 'enemy', value: dmg, text: `⚡ FLANK CRIT ${dmg}!` });
        logLines.push(`⚡ FLANKING BACKSTAB dealt ${dmg} critical DMG & bypassed armor!`);
        damageEnemyShields(hasMythicWeapon ? 2 : 1);
      } else {
        events.push({ kind: isCrit ? 'crit' : 'hit', target: 'enemy', value: dmg, text: isCrit ? `CRIT ${dmg}!` : `-${dmg}` });
        logLines.push(`⚔️ ${isCrit ? 'CRITICAL' : 'Strike'} dealt ${dmg} DMG${vulnMult > 1 ? ' (Broken/Vulnerable!)' : ''}.`);
        if (isCrit && hasMythicWeapon) {
          damageEnemyShields(1);
        }
      }
      if (isCrit && enemy.intent === 'RITUAL' && !enemy.stunned) {
        enemy.stunned = true;
        enemy.vulnerableTurns = 2;
        logLines.push('⚡ Critical Strike INTERRUPTED Dark Ritual!');
      }
    }
  } else if (action === 'dash') {
    heroStatuses.flankingTurns = 2;
    heroStatuses.evasionActive = true;
    heroStatuses.comboChain = (heroStatuses.comboChain || 0) + 1;
    deedStats.dashesUsed = (deedStats.dashesUsed || 0) + 1;
    const chargeBonus = hasMythicCharm ? 28 : 18;
    focusCharge = Math.min(100, focusCharge + chargeBonus);
    const chipDmg = Math.max(3, Math.round(heroStats.atk * 0.45));
    enemy.hp = Math.max(0, enemy.hp - chipDmg);
    events.push({ kind: 'dodge', target: 'hero', text: '💨 FLANKING!' });
    events.push({ kind: 'hit', target: 'enemy', value: chipDmg, text: `FEINT -${chipDmg}` });
    logLines.push(`💨 Tactical Sidestep! Dealt ${chipDmg} feint cut, gained +45% Evasion & entered FLANKING STANCE (next strike Guaranteed Crit + Shield Break)!`);
  } else if (action === 'skill') {
    if (focusCharge < 40) throw new Error('Need 40% Focus Charge for Focus Break!');
    focusCharge -= 40;
    heroStatuses.comboChain = (heroStatuses.comboChain || 0) + 1;
    const mageMult = profile.hero_class === 'hero_mage' ? 1.15 : 1.0;
    const vulnMult = (enemy.vulnerableTurns > 0 ? 1.45 : 1.0) * (heroStatuses.flankingTurns > 0 ? 1.2 : 1.0);
    if (heroStatuses.flankingTurns > 0) heroStatuses.flankingTurns--;

    if (enemy.intent === 'SHELL' && !enemy.stunned) {
      const dmg = Math.max(9, Math.round(heroStats.atk * 1.85 * mageMult));
      enemy.hp = Math.max(0, enemy.hp - dmg);
      enemy.stunned = true;
      enemy.armorBrokenTurns = 2;
      events.push({ kind: 'crit', target: 'enemy', value: dmg, text: `SHATTER -${dmg}!` });
      logLines.push(`💥 SHATTERED ${enemy.name}’s Iron Shell for ${dmg} DMG! Enemy STUNNED!`);
      damageEnemyShields(2);
    } else if (enemy.intent === 'RITUAL' && !enemy.stunned) {
      const dmg = Math.max(9, Math.round(heroStats.atk * 1.7 * mageMult));
      enemy.hp = Math.max(0, enemy.hp - dmg);
      enemy.stunned = true;
      enemy.vulnerableTurns = 2;
      events.push({ kind: 'crit', target: 'enemy', value: dmg, text: `INTERRUPT -${dmg}!` });
      logLines.push(`⚡ INTERRUPTED Dark Ritual for ${dmg} DMG! Enemy STUNNED & Vulnerable!`);
      damageEnemyShields(2);
    } else {
      const dmg = Math.max(8, Math.round(heroStats.atk * 1.65 * mageMult * vulnMult));
      enemy.hp = Math.max(0, enemy.hp - dmg);
      events.push({ kind: 'crit', target: 'enemy', value: dmg, text: `BREAK -${dmg}` });
      logLines.push(`✨ Focus Break pierced armor for ${dmg} DMG & cracked enemy guard!`);
      damageEnemyShields(2);
    }
  } else if (action === 'ally_skill') {
    if (!activeAlly) throw new Error('Recruit & select a Party Ally in the Party tab first!');
    if (heroStatuses.allyCooldown > 0) throw new Error(`${activeAlly.name} is recovering (ready next turn)!`);
    heroStatuses.allyCooldown = 2;
    heroStatuses.comboChain = (heroStatuses.comboChain || 0) + 1;
    deedStats.allyAssistsUsed = (deedStats.allyAssistsUsed || 0) + 1;
    focusCharge = Math.min(100, focusCharge + 22);

    if (activeAlly.id === 'ally_kaelen') {
      const dmg = Math.max(7, Math.round(heroStats.atk * 1.25));
      enemy.hp = Math.max(0, enemy.hp - dmg);
      heroStatuses.allyWardTurns = 1;
      events.push({ kind: 'parry', target: 'hero', text: '🛡️ KAELEN ASSIST!' });
      events.push({ kind: 'crit', target: 'enemy', value: dmg, text: `AEGIS -${dmg}!` });
      logLines.push(`🛡️ Sir Kaelen unleashed Aegis Shieldbreaker for ${dmg} DMG & raised Vanguard Ward (+35% DEF)!`);
      damageEnemyShields(2);
    } else if (activeAlly.id === 'ally_lyra') {
      const heal = Math.max(15, Math.round(heroStats.maxHp * 0.28));
      const dmg = Math.max(5, Math.round(heroStats.atk * 0.95));
      heroHp = Math.min(heroStats.maxHp, heroHp + heal);
      heroStatuses.poisonTurns = 0;
      enemy.hp = Math.max(0, enemy.hp - dmg);
      enemy.vulnerableTurns = Math.max(enemy.vulnerableTurns || 0, 2);
      events.push({ kind: 'heal', target: 'hero', value: heal, text: `🧪 LYRA +${heal} HP` });
      events.push({ kind: 'crit', target: 'enemy', value: dmg, text: `FLASK -${dmg}` });
      logLines.push(`🧪 Lyra hurled a Starlight Flask: restored +${heal} HP, cleansed Venom, dealt ${dmg} DMG & inflicted Vulnerable!`);
      damageEnemyShields(1);
    } else if (activeAlly.id === 'ally_pip') {
      const dmg = Math.max(7, Math.round(heroStats.atk * 1.2));
      enemy.hp = Math.max(0, enemy.hp - dmg);
      heroStatuses.flankingTurns = 2;
      heroStatuses.evasionActive = true;
      events.push({ kind: 'dodge', target: 'hero', text: '🏹 PIP GRAPNEL!' });
      events.push({ kind: 'crit', target: 'enemy', value: dmg, text: `ARROW -${dmg}!` });
      logLines.push(`🏹 Pip fired Grappling Hook Flank for ${dmg} DMG & pulled you into Flanking Stance (+45% Dodge & Guaranteed Crit)!`);
      damageEnemyShields(1);
    } else {
      // ally_vespera
      const dmg = Math.max(8, Math.round(heroStats.atk * 1.25));
      enemy.hp = Math.max(0, enemy.hp - dmg);
      focusCharge = Math.min(100, focusCharge + 25);
      events.push({ kind: 'secret', target: 'hero', text: '⏳ CHRONO +45%⚡' });
      events.push({ kind: 'crit', target: 'enemy', value: dmg, text: `STASIS -${dmg}!` });
      logLines.push(`⏳ Vespera cast Chrono-Stasis Sigil for ${dmg} Astral DMG & surged +45% Focus Charge!`);
      damageEnemyShields(2);
    }
  } else if (action === 'finisher') {
    const canExecute = enemy.shields === 0 || enemy.hp <= Math.ceil(enemy.maxHp * 0.35);
    if (focusCharge < 75 && !canExecute) {
      throw new Error('Need 75% Focus Charge (or BROKEN / <35% HP enemy) for Ultimate Finisher!');
    }
    const cost = canExecute ? Math.min(focusCharge, 45) : 75;
    focusCharge = Math.max(0, focusCharge - cost);
    finisherBonusActive = true;
    deedStats.finishersUsed = (deedStats.finishersUsed || 0) + 1;
    heroStatuses.comboChain = (heroStatuses.comboChain || 0) + 2;

    const finisherTitle = activeAlly ? activeAlly.finisherName : 'Grand Archivist’s Astral Judgment';
    const comboMult = 1 + Math.min(0.35, (heroStatuses.comboChain || 0) * 0.06) + (hasMythicCharm ? 0.15 : 0);
    const dmg = Math.max(18, Math.round(heroStats.atk * 2.75 * comboMult));
    enemy.hp = Math.max(0, enemy.hp - dmg);

    if (activeAlly?.id === 'ally_lyra') {
      const heal = Math.round(heroStats.maxHp * 0.2);
      heroHp = Math.min(heroStats.maxHp, heroHp + heal);
      events.push({ kind: 'heal', target: 'hero', value: heal, text: `+${heal} HP` });
    }
    damageEnemyShields(enemy.shields);
    events.push({ kind: 'finisher', target: 'enemy', value: dmg, text: `🌟 ${finisherTitle.toUpperCase()} -${dmg}!` });
    logLines.push(`🌟 ULTIMATE FINISHER [${finisherTitle}]! Unleashed a cinematic multi-hit strike for ${dmg} CRITICAL DMG!`);
  } else if (action === 'guard') {
    guarding = true;
    deedStats.perfectParries = (deedStats.perfectParries || 0) + 1;
    const heal = Math.max(3, Math.round(heroStats.maxHp * 0.06));
    heroHp = Math.min(heroStats.maxHp, heroHp + heal);
    focusCharge = Math.min(100, focusCharge + (enemy.intent === 'HEAVY' ? 40 : 30));
    events.push({ kind: 'guard', target: 'hero', value: heal, text: enemy.intent === 'HEAVY' ? 'PARRY READY!' : `WARD +${heal}` });
    logLines.push(`🛡️ Raised Parry & Ward stance (+${heal} HP).`);
  } else if (action === 'potion') {
    if (potions < 1) throw new Error('No Healing Potions left!');
    potions -= 1;
    potionWard = true;
    const healRatio = lyraTrusted || activeAlly?.id === 'ally_lyra' ? 0.75 : 0.55;
    const heal = Math.max(18, Math.round(heroStats.maxHp * healRatio));
    heroHp = Math.min(heroStats.maxHp, heroHp + heal);
    heroStatuses.poisonTurns = 0;
    events.push({ kind: 'heal', target: 'hero', value: heal, text: `+${heal} HP` });
    logLines.push(`🧪 Drank Potion: restored +${heal} HP & cleansed Venom!`);
  } else if (action === 'study_cast' && studyCastOpts) {
    const mult = studyCastOpts.studyMultiplier || 1.65;
    const vulnMult = enemy.vulnerableTurns > 0 ? 1.4 : 1.0;
    const dmg = Math.max(studyCastOpts.isCorrect ? 10 : 4, Math.round(heroStats.atk * mult * vulnMult));
    enemy.hp = Math.max(0, enemy.hp - dmg);
    if (studyCastOpts.isCorrect) {
      focusCharge = Math.min(100, focusCharge + 15);
      heroStatuses.comboChain = (heroStatuses.comboChain || 0) + 1;
      if (enemy.intent === 'SHELL' || enemy.intent === 'RITUAL') {
        enemy.stunned = true;
        enemy.vulnerableTurns = 2;
      }
      events.push({ kind: 'crit', target: 'enemy', value: dmg, text: `RECALL CRIT -${dmg}!` });
      logLines.push(`📖 Study Cast [${studyCastOpts.conceptTitle || 'Vault'}]: Answered right! Dealt ${dmg} Arcane DMG!`);
      damageEnemyShields(1);
    } else {
      events.push({ kind: 'hit', target: 'enemy', value: dmg, text: `SPARK -${dmg}` });
      logLines.push(`📖 Study Cast miss-spark dealt ${dmg} DMG — review "${studyCastOpts.conceptTitle || 'concept'}"!`);
    }
  } else {
    throw new Error('Invalid combat action.');
  }

  flags.deedStats = deedStats;

  // Victory Handler
  if (enemy.hp <= 0) {
    const isBoss = Boolean(encounter.isBoss);
    const xpMult = (profile.hero_class === 'hero_scholar' ? 1.1 : 1.0) * (finisherBonusActive ? 1.25 : 1.0);
    const heroXpGain = Math.round(enemy.xpReward * xpMult);
    const baseShards = enemy.shardReward + (isBoss ? Math.round(heroStats.luck * 0.35) : 0);
    const shardsGain = finisherBonusActive ? Math.round(baseShards * 1.35) : baseShards;
    const coinsGain = Math.max(4, Math.round((isBoss ? 18 : 6) + (dungeon?.floor || profile.floor) * 2));
    if (finisherBonusActive) {
      logLines.unshift(`🌟 FINISHER EXECUTION BONUS! +35% Shards (${shardsGain}✦) & +25% Hero XP (${heroXpGain} XP)!`);
    }

    let quests = parseJsonSafe(profile.active_quests_json, []);
    quests = incrementBountyProgress(quests, 'bounty_slayer', 1);

    const dropChance = isBoss ? 1.0 : Math.min(0.92, 0.45 + heroStats.luck * 0.0055 + (finisherBonusActive ? 0.15 : 0));
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
    const nextLogs = appendLogs(profile, logLines.slice(0, 4));

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

  // Enemy Turn (Respects Stun, Heavy Parry, Sidestep Evasion, Ritual, Hex)
  const darkBonus = dungeon && dungeon.torch < 25 ? 1.25 : 1.0;
  const wardMult = heroStatuses.allyWardTurns > 0 ? 0.65 : 1.0;
  if (heroStatuses.allyWardTurns > 0) heroStatuses.allyWardTurns--;

  if (enemy.stunned) {
    enemy.stunned = false;
    if (enemy.shields === 0) {
      enemy.shields = enemy.maxShields;
    }
    events.push({ kind: 'secret', target: 'enemy', text: 'STUNNED!' });
    logLines.push(`💫 ${enemy.name} is STUNNED and loses its turn!`);
  } else {
    const intent = enemy.intent;
    const effAtk = (enemy.atk + (enemy.atkBonus || 0)) * darkBonus;
    const effectiveDodgePct = Math.min(80, heroStats.dodgePct + (heroStatuses.evasionActive ? 45 : 0));

    if (intent === 'HEAVY') {
      if (guarding) {
        const enemyDmg = Math.max(1, Math.round(effAtk * 2.1 * 0.15 * wardMult));
        const riposteMult = hasMythicArmor ? 1.2 : 0.85;
        const riposte = Math.max(6, Math.round(heroStats.atk * riposteMult));
        heroHp = Math.max(0, heroHp - enemyDmg);
        enemy.hp = Math.max(0, enemy.hp - riposte);
        enemy.stunned = true;
        enemy.vulnerableTurns = 2;
        events.push({ kind: 'parry', target: 'hero', text: 'PERFECT PARRY!' });
        events.push({ kind: 'crit', target: 'enemy', value: riposte, text: `RIPOSTE -${riposte}` });
        logLines.push(`⚔️ PERFECT PARRY! Blunted Crushing Blow (-${enemyDmg} HP), STUNNED foe & countered for ${riposte}!`);
        damageEnemyShields(hasMythicArmor ? 2 : 1);
      } else {
        const dodged = Math.random() * 100 < effectiveDodgePct;
        if (dodged) {
          const counter = heroStatuses.evasionActive ? Math.max(4, Math.round(heroStats.atk * 0.6)) : 0;
          if (counter > 0) {
            enemy.hp = Math.max(0, enemy.hp - counter);
            events.push({ kind: 'crit', target: 'enemy', value: counter, text: `COUNTER -${counter}` });
          }
          events.push({ kind: 'dodge', target: 'hero', text: heroStatuses.evasionActive ? '💨 SIDESTEP!' : 'DODGE!' });
          logLines.push(`💨 Sidestepped ${enemy.name}’s Crushing Blow${counter > 0 ? ` & countered for ${counter} DMG` : ''}!`);
        } else {
          const red = (potionWard ? 0.6 : 1.0) * wardMult;
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
      logLines.push(`🩸 ${enemy.name} finished Dark Ritual (+${healAmt} HP & +4 ATK)! Interrupt with ⚡ Focus Break!`);
    } else if (intent === 'HEX') {
      const dodged = !guarding && heroStatuses.evasionActive && Math.random() * 100 < effectiveDodgePct;
      if (dodged) {
        events.push({ kind: 'dodge', target: 'hero', text: '💨 EVADED HEX!' });
        logLines.push(`💨 Dashed clear of ${enemy.name}’s Venom Hex!`);
      } else {
        const dmgRed = (guarding ? 0.35 : potionWard ? 0.6 : 1.0) * wardMult;
        const dmg = Math.max(1, Math.round((effAtk * 0.8 - heroStats.def * 0.4) * dmgRed));
        heroHp = Math.max(0, heroHp - dmg);
        events.push({ kind: 'enemy_hit', target: 'hero', value: dmg, text: `-${dmg}` });
        if (guarding) {
          logLines.push(`🛡️ Warded off ${enemy.name}’s Venom Hex (-${dmg} HP)!`);
          damageEnemyShields(1);
        } else {
          heroStatuses.poisonTurns = 3;
          heroStatuses.poisonDmg = Math.max(3, Math.round(heroStats.maxHp * 0.07));
          logLines.push(`☠️ Hexed! Took ${dmg} DMG + Venom (-${heroStatuses.poisonDmg}/turn)!`);
        }
      }
    } else {
      // STRIKE or SHELL light hit
      const dodged = !guarding && Math.random() * 100 < effectiveDodgePct;
      if (dodged) {
        const counter = heroStatuses.evasionActive ? Math.max(4, Math.round(heroStats.atk * 0.55)) : 0;
        if (counter > 0) {
          enemy.hp = Math.max(0, enemy.hp - counter);
          events.push({ kind: 'crit', target: 'enemy', value: counter, text: `COUNTER -${counter}` });
        }
        events.push({ kind: 'dodge', target: 'hero', text: heroStatuses.evasionActive ? '💨 SIDESTEP!' : 'DODGE!' });
        logLines.push(`💨 Evaded ${enemy.name}’s strike${counter > 0 ? ` & sliced back for ${counter} DMG` : ''}!`);
      } else {
        const mult = intent === 'SHELL' ? 0.6 : 1.0;
        const dmgRed = (guarding ? 0.4 : potionWard ? 0.6 : 1.0) * wardMult;
        const dmg = Math.max(1, Math.round((effAtk * mult - heroStats.def * 0.55) * dmgRed));
        heroHp = Math.max(0, heroHp - dmg);
        events.push({ kind: 'enemy_hit', target: 'hero', value: dmg, text: `-${dmg}` });
        logLines.push(`💥 ${enemy.name} struck for ${dmg} DMG.`);
      }
    }
  }

  // Apply Poison Tick at end of round
  if (heroHp > 0 && heroStatuses.poisonTurns > 0) {
    heroHp = Math.max(0, heroHp - heroStatuses.poisonDmg);
    heroStatuses.poisonTurns--;
    events.push({ kind: 'trap', target: 'hero', value: heroStatuses.poisonDmg, text: `VENOM -${heroStatuses.poisonDmg}` });
  }

  // Check if Riposte or Sidestep Counter Killed Enemy
  if (enemy.hp <= 0) {
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
    const nextLogs = appendLogs(profile, [`⚡ Counter-Riposte finished ${enemy.name}! Looted ${spec.name}.`]);
    db.prepare(`
      UPDATE game_profiles SET hp = ?, potions = ?, focus_charge = ?, monsters_slain = monsters_slain + 1,
      story_flags_json = ?, dungeon_state_json = ?, active_encounter_json = NULL, last_log_json = ?, updated_at = ? WHERE user_id = ?
    `).run(Math.max(1, heroHp), potions, focusCharge, JSON.stringify(flags), dungeon ? JSON.stringify(dungeon) : profile.dungeon_state_json, nextLogs, Date.now(), user.id);
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
          story_flags_json = ?, dungeon_state_json = NULL, active_encounter_json = NULL, last_log_json = ?, updated_at = ?
      WHERE user_id = ?
    `).run(reviveHp, potions, keptShards, JSON.stringify(flags), nextLogs, Date.now(), user.id);
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
  const nextLogs = appendLogs(profile, logLines.slice(0, 4));
  db.prepare(`
    UPDATE game_profiles SET hp = ?, potions = ?, focus_charge = ?, story_flags_json = ?, active_encounter_json = ?, last_log_json = ?, updated_at = ? WHERE user_id = ?
  `).run(heroHp, potions, focusCharge, JSON.stringify(flags), JSON.stringify(updatedEncounter), nextLogs, Date.now(), user.id);

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

export function selectSpecialization(db, user, userStats, specKey) {
  const profile = ensureGameProfile(db, user.id);
  const specs = HERO_SPECIALIZATIONS[profile.hero_class] || HERO_SPECIALIZATIONS.hero_scholar;
  const chosen = specs.find((s) => s.key === specKey);
  if (!chosen) throw new Error('Specialization not available for your hero class');
  const logs = appendLogs(profile, [`🌟 Attuned Mastery Specialization: ${chosen.name} (${chosen.perk}).`]);
  db.prepare('UPDATE game_profiles SET specialization = ?, last_log_json = ?, updated_at = ? WHERE user_id = ?').run(
    chosen.key,
    logs,
    Date.now(),
    user.id
  );
  return { game: buildGameState(db, user, userStats), message: `Attuned ${chosen.name}!` };
}

export function gradeFlashcardSm2(card, quality) {
  const q = Math.max(1, Math.min(4, Number(quality) || 3));
  const now = Date.now();
  const prevEase = Number(card.ease_factor || 2.5);
  const ease = Math.max(1.3, prevEase + (0.1 - (4 - q) * (0.08 + (4 - q) * 0.02)));
  let repetitions = Number(card.repetitions || 0);
  let intervalDays = Number(card.interval_days || 0);
  let nextReviewAt = now;

  if (q < 2) {
    repetitions = 0;
    intervalDays = 0;
    nextReviewAt = now + 5 * 60_000;
  } else if (repetitions === 0) {
    repetitions = 1;
    intervalDays = q === 4 ? 3 : 1;
    nextReviewAt = now + intervalDays * 86400_000;
  } else if (repetitions === 1) {
    repetitions = 2;
    intervalDays = q === 4 ? 7 : 4;
    nextReviewAt = now + intervalDays * 86400_000;
  } else {
    repetitions += 1;
    const mult = q === 4 ? 1.3 : q === 2 ? 0.8 : 1.0;
    intervalDays = Math.max(1, Math.round(Math.max(1, intervalDays) * ease * mult));
    nextReviewAt = now + intervalDays * 86400_000;
  }

  return {
    easeFactor: Math.round(ease * 100) / 100,
    intervalDays,
    repetitions,
    nextReviewAt,
    reviewCount: (card.review_count || 0) + 1,
  };
}

export function resolveStudyCast(db, user, userStats, { cardId, selectedIndex, grade }) {
  const profile = ensureGameProfile(db, user.id);
  const card = db.prepare('SELECT * FROM flashcards WHERE id = ? AND user_id = ?').get(Number(cardId), user.id);
  if (!card) throw new Error('Flashcard not found');

  const options = parseJsonSafe(card.options_json, []);
  const hasMcq = Array.isArray(options) && options.length > 0 && selectedIndex !== undefined && selectedIndex !== null;
  const isCorrect = hasMcq ? Number(selectedIndex) === Number(card.correct_index) : Number(grade || 3) >= 2;
  const effQuality = grade ? Number(grade) : isCorrect ? 3 : 1;
  const sm2 = gradeFlashcardSm2(card, effQuality);

  db.prepare(`
    UPDATE flashcards
    SET ease_factor = ?, interval_days = ?, repetitions = ?, next_review_at = ?, review_count = ?
    WHERE id = ? AND user_id = ?
  `).run(sm2.easeFactor, sm2.intervalDays, sm2.repetitions, sm2.nextReviewAt, sm2.reviewCount, card.id, user.id);

  const xpGain = isCorrect ? 10 : 4;
  const coinsGain = isCorrect ? 2 : 0;
  const shardsGain = isCorrect ? 6 : 2;
  db.prepare('UPDATE users SET xp = xp + ?, coins = coins + ? WHERE id = ?').run(xpGain, coinsGain, user.id);
  db.prepare(
    'UPDATE game_profiles SET shards = shards + ?, focus_charge = MIN(100, focus_charge + ?), updated_at = ? WHERE user_id = ?'
  ).run(shardsGain, isCorrect ? 10 : 4, Date.now(), user.id);

  const encounter = parseJsonSafe(profile.active_encounter_json, null);
  const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);

  if (encounter?.type === 'combat') {
    const res = resolveCombatAction(db, refreshedUser, userStats, 'study_cast', {
      studyMultiplier: isCorrect ? 1.65 : 0.65,
      isCorrect,
      conceptTitle: card.concept_title || card.subject_name,
    });
    return {
      ...res,
      isCorrect,
      xpGain,
      coinsGain,
      shardsGain,
      card: { ...card, easeFactor: sm2.easeFactor, intervalDays: sm2.intervalDays, nextReviewAt: sm2.nextReviewAt },
    };
  }

  if (encounter?.type === 'riddle') {
    const dungeon = profile.mode === 'dungeon' && profile.dungeon_state_json ? JSON.parse(profile.dungeon_state_json) : null;
    const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
    const heroStats = computeHeroStats(ensureGameProfile(db, user.id), rawItems, computeStudyBonuses(refreshedUser, userStats));
    let droppedItem = null;
    const events = [];
    let hp = heroStats.hp;
    let logMsg = '';
    if (isCorrect) {
      const spec = rollLootSpec(dungeon?.floor || profile.floor, heroStats.luck, { minRarity: 'rare', bonusLuck: 15 });
      if (dungeon) {
        dungeon.satchel.items.push(spec);
        dungeon.satchel.shards = (dungeon.satchel.shards || 0) + 25;
        droppedItem = formatSatchelPreview(spec, -dungeon.satchel.items.length);
      } else {
        droppedItem = insertLootSpec(db, user.id, spec);
        db.prepare('UPDATE game_profiles SET shards = shards + 25 WHERE user_id = ?').run(user.id);
      }
      if (dungeon && encounter.entityId) {
        const ent = dungeon.entities.find((e) => e.id === encounter.entityId);
        if (ent) ent.done = true;
      }
      events.push({ kind: 'secret', target: 'enemy', text: 'VAULT SOLVED!' });
      logMsg = `📖 Study Riddle [${card.concept_title}]: Unlocked [${spec.rarity.toUpperCase()}] ${spec.name} (+25✦)!`;
      db.prepare(
        'UPDATE game_profiles SET dungeon_state_json = ?, active_encounter_json = NULL, last_log_json = ?, updated_at = ? WHERE user_id = ?'
      ).run(
        dungeon ? JSON.stringify(dungeon) : profile.dungeon_state_json,
        appendLogs(profile, [logMsg]),
        Date.now(),
        user.id
      );
    } else {
      hp = Math.max(1, hp - 8);
      events.push({ kind: 'trap', target: 'hero', value: 8, text: 'HEX -8' });
      logMsg = `💥 Vault Recall miss (-8 HP): Review "${card.concept_title}" and try again!`;
      db.prepare('UPDATE game_profiles SET hp = ?, last_log_json = ?, updated_at = ? WHERE user_id = ?').run(
        hp,
        appendLogs(profile, [logMsg]),
        Date.now(),
        user.id
      );
    }
    return {
      game: buildGameState(db, refreshedUser, userStats),
      events,
      droppedItem,
      isCorrect,
      xpGain,
      coinsGain,
      shardsGain,
    };
  }

  // When outside legacy encounters (Idle RPG mode), answering a University question activates 30m 4.0x Overdrive & restores Soul Essence/Fragments!
  const latestProfile = ensureGameProfile(db, user.id);
  const flags = parseJsonSafe(latestProfile.story_flags_json, {});
  const now = Date.now();
  const idle = ensureIdleState(flags, latestProfile, now);
  const ss = ensureShadowSlaveState(flags, latestProfile);
  const essenceQuizGain = isCorrect ? 28 : 8;
  const fragsQuizGain = isCorrect ? 2 : 0;
  ss.soulEssence = Math.min(ss.maxSoulEssence, ss.soulEssence + essenceQuizGain);
  ss.soulFragments += fragsQuizGain;
  if (ss.soulFragments >= 1000 && ss.coreCount < 7) {
    ss.soulFragments -= 1000;
    ss.coreCount += 1;
  }
  ss.lastWhisper = isCorrect
    ? `[Nightmare Spell]: Study insight absorbed (+${fragsQuizGain} Soul Fragments, +${essenceQuizGain} Soul Essence).`
    : `[Nightmare Spell]: Slight ripple (+${essenceQuizGain} Essence).`;
  flags.shadowSlave = ss;
  let droppedItem = null;
  let msg = '';
  let bonusWaves = isCorrect ? 2 : 1;

  if (isCorrect) {
    const overdriveDurationMs = (30 + (idle.ascensionRelics.relic_chronos || 0) * 15) * 60_000;
    idle.overdriveUntilMs = Math.max(now, idle.overdriveUntilMs || 0) + overdriveDurationMs;
    idle.overdriveWavesCleared = (idle.overdriveWavesCleared || 0) + bonusWaves;
  }

  let nextWave = idle.wave + bonusWaves;
  let nextStage = idle.stage;
  let nextMaxStage = idle.maxStage;
  let bossKills = 0;
  while (nextWave > 10) {
    nextWave -= 10;
    bossKills += 1;
    nextMaxStage = Math.max(nextMaxStage, nextStage + 1);
    if (idle.gambits.stageProgression === 'auto_push') {
      nextStage += 1;
    }
  }
  idle.wave = nextWave;
  idle.stage = nextStage;
  idle.maxStage = nextMaxStage;
  idle.wavesClearedTotal = (idle.wavesClearedTotal || 0) + bonusWaves;
  idle.lastTickAtMs = now;

  // Draw +2 ★2 Tactical Loop Cards on correct Study Quiz answer (+1 ★1 on miss)
  const cardsDrawn = isCorrect ? [rollLoopCardKey(), rollLoopCardKey()] : [rollLoopCardKey()];
  drawCardsIntoHand(idle.loop, cardsDrawn, isCorrect ? 2 : 1);
  if (isCorrect) {
    idle.loop.lootSack.shards += 22;
    idle.loop.lootSack.gearRolls += 1;
  }
  flags.idle = idle;

  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const heroStats = computeHeroStats(latestProfile, rawItems, computeStudyBonuses(refreshedUser, userStats));
  const extraShards = isCorrect ? 18 + idle.stage * 3 : 5;
  const extraXp = isCorrect ? 25 + idle.stage * 5 : 8;
  if (isCorrect) {
    droppedItem = generateLootItem(db, user.id, idle.stage, heroStats.luck + 10, { minRarity: 'uncommon' });
    msg = `🎓 Study Overdrive [${card.concept_title || card.subject_name}]! +30m 4.0× Speed, +2 ★2 Tactical Cards, +2 Waves & +${extraShards}✦!`;
  } else {
    msg = `📖 Study Spark [${card.concept_title || card.subject_name}]: +1 Tactical Card, +${shardsGain + extraShards}✦ & +1 Wave progress!`;
  }

  db.prepare(`
    UPDATE game_profiles
    SET shards = shards + ?, hero_xp = hero_xp + ?, floor = ?, best_floor = ?,
        monsters_slain = monsters_slain + ?, bosses_slain = bosses_slain + ?,
        story_flags_json = ?, last_log_json = ?, updated_at = ?
    WHERE user_id = ?
  `).run(
    extraShards,
    extraXp,
    idle.stage,
    idle.maxStage,
    bonusWaves,
    bossKills,
    JSON.stringify(flags),
    appendLogs(latestProfile, [msg]),
    now,
    user.id
  );

  return {
    game: buildGameState(db, db.prepare('SELECT * FROM users WHERE id = ?').get(user.id), userStats),
    events: [
      { kind: isCorrect ? 'finisher' : 'hit', target: 'enemy', text: isCorrect ? '⚡ 4× OVERDRIVE!' : 'STUDY SPARK' },
    ],
    droppedItem,
    message: msg,
    isCorrect,
    xpGain: xpGain + extraXp,
    coinsGain,
    shardsGain: shardsGain + extraShards,
  };
}

// ==========================================
// PARTY RECRUITMENT, MYTHIC SIDE STORIES, HEROIC DEEDS & VANGUARD TRIAL
// ==========================================

export function managePartyAlly(db, user, userStats, { allyId }) {
  const profile = ensureGameProfile(db, user.id);
  const ally = PARTY_ALLIES.find((a) => a.id === allyId);
  if (!ally) throw new Error('Party ally not found');

  const flags = parseJsonSafe(profile.story_flags_json, {});
  const affinity = parseJsonSafe(profile.npc_affinity_json, {});
  const recruited = new Set(Array.isArray(flags.recruitedAllies) ? flags.recruitedAllies : []);

  let shardCost = 0;
  let msg = '';
  if (!recruited.has(ally.id)) {
    const freeByReq =
      ally.recruitCostShards === 0 ||
      (ally.recruitNpcId && (affinity[ally.recruitNpcId] || 0) >= (ally.recruitTrustReq || 10)) ||
      (ally.recruitFloorReq && profile.best_floor >= ally.recruitFloorReq);
    shardCost = freeByReq ? 0 : ally.recruitCostShards;
    if (profile.shards < shardCost) {
      throw new Error(`Need ${shardCost} ✦ Arcane Shards (or ${ally.recruitReqLabel}) to recruit ${ally.name}!`);
    }
    recruited.add(ally.id);
    msg = `🤝 Recruited ${ally.name} (${ally.title}) into your Vanguard Party! Unlocked Assist [${ally.skillName}] & Dual-Tech [${ally.finisherName}]!`;
  } else {
    msg = `🛡️ Set ${ally.name} as your Active Vanguard Party Ally!`;
  }

  flags.recruitedAllies = [...recruited];
  flags.activeAllyId = ally.id;
  const nextLogs = appendLogs(profile, [msg]);

  db.prepare(`
    UPDATE game_profiles
    SET shards = shards - ?, hp = hp + ?, story_flags_json = ?, last_log_json = ?, updated_at = ?
    WHERE user_id = ?
  `).run(shardCost, shardCost === 0 && !Array.isArray(flags.recruitedAllies) ? 10 : 0, JSON.stringify(flags), nextLogs, Date.now(), user.id);

  const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  return {
    game: buildGameState(db, refreshedUser, userStats),
    message: msg,
    events: [{ kind: 'secret', target: 'hero', text: `${ally.name.toUpperCase()} JOINED!` }],
  };
}

export function advanceMythicSideStory(db, user, userStats, { storyId, choiceId }) {
  const profile = ensureGameProfile(db, user.id);
  const story = MYTHIC_SIDE_STORIES.find((s) => s.id === storyId);
  if (!story) throw new Error('Mythic side story not found');

  const flags = parseJsonSafe(profile.story_flags_json, {});
  const sideStories = flags.sideStories && typeof flags.sideStories === 'object' ? { ...flags.sideStories } : {};
  const prog = sideStories[story.id] || { actIndex: 0, choices: [], completed: false };
  if (prog.completed || prog.actIndex >= story.acts.length) {
    throw new Error('This Mythic Side Story is already completed!');
  }

  const currentAct = story.acts[prog.actIndex];
  const chosen = currentAct.choices.find((c) => c.id === choiceId) || currentAct.choices[0];
  const nextActIndex = prog.actIndex + 1;
  const isNowComplete = nextActIndex >= story.acts.length;

  sideStories[story.id] = {
    actIndex: nextActIndex,
    choices: [...(Array.isArray(prog.choices) ? prog.choices : []), chosen.id],
    completed: isNowComplete,
  };
  flags.sideStories = sideStories;

  let shardsGain = chosen.shards || 25;
  let xpGain = chosen.xp || 35;
  let droppedItem = null;
  const logLines = [`📖 ${story.title} (${currentAct.title}): ${chosen.outcome}`];
  const events = [{ kind: 'secret', target: 'hero', text: isNowComplete ? '👑 MYTHIC FORGED!' : `ACT ${currentAct.act} COMPLETE` }];

  if (isNowComplete) {
    const deedStats = flags.deedStats && typeof flags.deedStats === 'object' ? { ...flags.deedStats } : {};
    deedStats.mythicStoriesCompleted = (deedStats.mythicStoriesCompleted || 0) + 1;
    flags.deedStats = deedStats;

    droppedItem = insertLootSpec(db, user.id, {
      ...story.mythicReward,
      level: Math.max(story.mythicReward.level || 5, profile.best_floor),
    });
    // Automatically equip the newly forged Mythic Relic if the player prefers or leave ready in inventory and equip if slot is common
    const curEquipped = db
      .prepare('SELECT id, rarity FROM game_items WHERE user_id = ? AND slot = ? AND equipped = 1')
      .get(user.id, story.mythicReward.slot);
    if (!curEquipped || curEquipped.rarity !== 'mythic') {
      db.prepare('UPDATE game_items SET equipped = 0 WHERE user_id = ? AND slot = ?').run(user.id, story.mythicReward.slot);
      db.prepare('UPDATE game_items SET equipped = 1 WHERE id = ? AND user_id = ?').run(droppedItem.id, user.id);
      droppedItem.equipped = true;
    }
    logLines.unshift(`👑 MYTHIC RELIC FORGED & EQUIPPED: [${story.mythicReward.name}] (${story.mythicReward.passiveDesc})!`);
  }

  const nextLogs = appendLogs(profile, logLines);
  db.prepare(`
    UPDATE game_profiles
    SET shards = shards + ?, hero_xp = hero_xp + ?, story_flags_json = ?, last_log_json = ?, updated_at = ?
    WHERE user_id = ?
  `).run(shardsGain, xpGain, JSON.stringify(flags), nextLogs, Date.now(), user.id);

  const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  return {
    game: buildGameState(db, refreshedUser, userStats),
    droppedItem,
    message: logLines[0],
    events,
  };
}

export function claimHeroicDeed(db, user, userStats, { deedId }) {
  const profile = ensureGameProfile(db, user.id);
  const deed = HEROIC_DEEDS.find((d) => d.id === deedId);
  if (!deed) throw new Error('Heroic deed not found');

  const flags = parseJsonSafe(profile.story_flags_json, {});
  const deedStats = flags.deedStats && typeof flags.deedStats === 'object' ? flags.deedStats : {};
  const claimedDeeds = new Set(Array.isArray(flags.claimedDeeds) ? flags.claimedDeeds : []);

  if (claimedDeeds.has(deed.id)) throw new Error('Heroic deed already claimed');
  const progress = Number(deedStats[deed.statKey] || 0);
  if (progress < deed.target) {
    throw new Error(`Complete deed first (${progress}/${deed.target})!`);
  }

  claimedDeeds.add(deed.id);
  flags.claimedDeeds = [...claimedDeeds];

  const r = deed.reward;
  db.prepare('UPDATE users SET coins = coins + ?, title = ? WHERE id = ?').run(r.coins || 0, deed.heroTitle, user.id);
  const msg = `🏅 Claimed Heroic Deed [${deed.title}]! +${r.shards}✦, +${r.coins}🪙, ${deed.perkLabel}!`;
  const nextLogs = appendLogs(profile, [msg]);

  db.prepare(`
    UPDATE game_profiles
    SET shards = shards + ?,
        bonus_atk = bonus_atk + ?,
        bonus_def = bonus_def + ?,
        bonus_hp = bonus_hp + ?,
        bonus_luck = bonus_luck + ?,
        hp = hp + ?,
        story_flags_json = ?,
        last_log_json = ?,
        updated_at = ?
    WHERE user_id = ?
  `).run(
    r.shards || 0,
    r.bonusAtk || 0,
    r.bonusDef || 0,
    r.bonusHp || 0,
    r.bonusLuck || 0,
    r.bonusHp || 0,
    JSON.stringify(flags),
    nextLogs,
    Date.now(),
    user.id
  );

  const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  return {
    game: buildGameState(db, refreshedUser, userStats),
    message: msg,
    events: [{ kind: 'loot', target: 'hero', text: `🏅 ${deed.heroTitle.toUpperCase()}!` }],
  };
}

export function startVanguardTrial(db, user, userStats) {
  const profile = ensureGameProfile(db, user.id);
  if (profile.active_encounter_json) {
    return { game: buildGameState(db, user, userStats), events: [] };
  }

  const floor = Math.max(1, profile.floor || 1);
  const champions = [
    { key: 'armor', name: 'Rune-Forged Sentinel', cycle: ['HEAVY', 'SHELL', 'STRIKE'] },
    { key: 'wraith', name: 'Astral Chronowraith', cycle: ['HEX', 'RITUAL', 'HEAVY'] },
    { key: 'golem', name: 'Obsidian Spire Golem', cycle: ['SHELL', 'HEAVY', 'STRIKE'] },
  ];
  const champ = champions[(floor + (profile.monsters_slain || 0)) % champions.length];
  const maxHp = 48 + floor * 20;
  const atk = 9 + floor * 3;
  const def = 3 + floor;
  const intent = champ.cycle[0];

  const encounter = {
    type: 'combat',
    entityId: null,
    isBoss: false,
    turn: 1,
    enemy: {
      key: champ.key,
      name: champ.name,
      hp: maxHp,
      maxHp,
      atk,
      def,
      xpReward: 30 + floor * 10,
      shardReward: 16 + floor * 5,
      cycle: champ.cycle,
      intentIndex: 0,
      intent,
      intentValue: computeIntentValue({ atk, atkBonus: 0 }, intent, floor),
      shields: 2,
      maxShields: 2,
      stunned: false,
      vulnerableTurns: 0,
      armorBrokenTurns: 0,
      atkBonus: 0,
    },
    heroStatuses: {
      poisonTurns: 0,
      poisonDmg: 0,
      flankingTurns: 0,
      evasionActive: false,
      allyWardTurns: 0,
      allyCooldown: 0,
      comboChain: 0,
    },
  };

  const msg = `⚔️ Entered the Vanguard Trial Arena against ${champ.name} (2🛡️ Guard Shields)! Test your Dash Flank, Ally Assist & Ultimate Finisher!`;
  const nextLogs = appendLogs(profile, [msg]);
  db.prepare(`
    UPDATE game_profiles
    SET active_encounter_json = ?, focus_charge = MAX(focus_charge, 75), last_log_json = ?, updated_at = ?
    WHERE user_id = ?
  `).run(JSON.stringify(encounter), nextLogs, Date.now(), user.id);

  return {
    game: buildGameState(db, user, userStats),
    message: msg,
    events: [{ kind: 'step', target: 'hero', text: 'VANGUARD TRIAL!' }],
  };
}

// ==========================================
// AETHELGARD: ASTRAL VANGUARD IDLE RPG ENGINE
// ==========================================

export function processIdleWaveTick(
  db,
  user,
  userStats,
  { wavesCleared = 1, timerRunning = false, triggerUltimate = false, outcome = 'clear' } = {}
) {
  const profile = ensureGameProfile(db, user.id);
  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const studyBonuses = computeStudyBonuses(user, userStats);
  const heroStats = computeHeroStats(profile, rawItems, studyBonuses);
  const flags = parseJsonSafe(profile.story_flags_json, {});
  const now = Date.now();
  const idle = ensureIdleState(flags, profile, now);

  if (timerRunning) {
    idle.overdriveUntilMs = Math.max(idle.overdriveUntilMs || 0, now + 90_000);
  }

  // Emergency Portal Extraction on wipe: saves 60% of Expedition Loot Sack and retreats safely
  if (outcome === 'wipe') {
    const sack = idle.loop.lootSack || { shards: 0, coins: 0, xp: 0, embers: 0, gearRolls: 0 };
    const recoveryShards = Math.max(5 + idle.stage, Math.round((sack.shards || 0) * 0.6));
    const recoveryCoins = Math.round((sack.coins || 0) * 0.6);
    const recoveryXp = Math.round((sack.xp || 0) * 0.6);

    idle.loop.lootSack = { shards: 0, coins: 0, xp: 0, embers: 0, gearRolls: 0 };
    idle.loop.loopCount = 1;
    idle.loop.tileIndex = 0;
    idle.loop.threatPct = 0;
    idle.loop.bossActive = false;
    idle.bossWallStuck = true;
    idle.wave = Math.max(1, idle.wave === 10 ? 9 : idle.wave - 1);
    idle.gambits.stageProgression = 'farm_stage';
    idle.lastTickAtMs = now;
    flags.idle = idle;

    const msg = `🌀 Emergency Portal Extraction! Saved 60% of Expedition Sack (+${recoveryShards}✦, +${recoveryCoins}🪙, +${recoveryXp} XP) and returned to Campfire.`;
    if (recoveryCoins > 0) {
      db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(recoveryCoins, user.id);
    }
    db.prepare(`
      UPDATE game_profiles
      SET shards = shards + ?, hero_xp = hero_xp + ?, story_flags_json = ?, last_log_json = ?, updated_at = ?
      WHERE user_id = ?
    `).run(recoveryShards, recoveryXp, JSON.stringify(flags), appendLogs(profile, [msg]), now, user.id);

    const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    return {
      game: buildGameState(db, refreshedUser, userStats),
      shardsGained: recoveryShards,
      events: [{ kind: 'defeat', target: 'hero', text: '🌀 60% PORTAL EXTRACT!' }],
      message: msg,
    };
  }

  const metrics = computeIdleMetrics(idle, heroStats, now);
  const steps = Math.max(1, Math.min(5, Math.round(Number(wavesCleared || 1))));
  const wasBoss = idle.wave === 10 || idle.loop.bossActive || steps >= 10;

  let curWave = idle.wave;
  let curStage = idle.stage;
  let curMaxStage = idle.maxStage;
  let bossesSlainDelta = 0;

  if (idle.gambits.stageProgression === 'farm_stage' && !triggerUltimate) {
    // Farm Waves 1-9 safely while prepping for Boss Challenge
    curWave = ((idle.wave - 1 + steps) % 9) + 1;
  } else {
    curWave = idle.wave + steps;
    while (curWave > 10) {
      curWave -= 10;
      bossesSlainDelta += 1;
      curMaxStage = Math.max(curMaxStage, curStage + 1);
      idle.bossWallStuck = false;
      if (idle.gambits.stageProgression === 'auto_push') {
        curStage += 1;
      }
    }
  }

  // Advance Loop Architect expedition along the 12-tile loop
  const loop = idle.loop;
  const prevTile = loop.tileIndex || 0;
  const rawNextTile = prevTile + steps;
  const wrappedCampfire = rawNextTile >= LOOP_ROAD_PATH.length;
  loop.tileIndex = rawNextTile % LOOP_ROAD_PATH.length;

  const greedMult = 1 + ((loop.loopCount || 1) - 1) * 0.35;
  const lb = metrics.loopAnalysis.bonuses;
  const boardHasCocoon = loop.board.some((t) => t.baseKey === 'spider_cocoon');
  const boardHasEstate = loop.board.some((t) => t.cardKey === 'counts_estate' || t.baseKey === 'ruined_village');

  const sackShards = Math.max(
    4,
    Math.round((5 + curStage * 2 + (boardHasCocoon ? 4 : 0)) * steps * greedMult * lb.lootMult)
  );
  const sackCoins = Math.max(
    3,
    Math.round((3 + curStage + (boardHasEstate ? 6 : 0)) * steps * greedMult * lb.lootMult)
  );
  const sackXp = Math.max(8, Math.round((10 + curStage * 4) * steps * greedMult));

  loop.lootSack.shards += sackShards;
  loop.lootSack.coins += sackCoins;
  loop.lootSack.xp += sackXp;
  if (bossesSlainDelta > 0) {
    loop.lootSack.gearRolls += 1;
    loop.lootSack.shards += 18 + curStage * 4;
    loop.bossActive = false;
    loop.threatPct = 0;
  } else {
    loop.threatPct = Math.min(100, (loop.threatPct || 0) + 14 * steps);
    if (loop.threatPct >= 100) loop.bossActive = true;
  }

  if (wrappedCampfire) {
    loop.loopCount = (loop.loopCount || 1) + 1;
    loop.lootSack.gearRolls = Math.min(6, (loop.lootSack.gearRolls || 0) + 1);
    if (!loop.pendingRelicChoices || loop.pendingRelicChoices.length === 0) {
      loop.pendingRelicChoices = rollRandomRelicChoices(loop.activeRelics, 3);
    }
  }

  const drawCount = wrappedCampfire || triggerUltimate || boardHasCocoon ? 2 : 1;
  const drawnKeys = Array.from({ length: drawCount }, () => rollLoopCardKey());
  drawCardsIntoHand(loop, drawnKeys, 1);

  if (loop.autoArchitect && loop.hand.length > 0) {
    const autoCard = loop.hand[0];
    const targetCell = smartPickPlacementCell(autoCard.cardKey, loop.board);
    if (targetCell) {
      loop.hand.shift();
      if (targetCell.isMerge) {
        const match = loop.board.find((t) => t.x === targetCell.x && t.y === targetCell.y);
        if (match && match.stars < 3) match.stars += 1;
      } else {
        loop.board.push({
          x: targetCell.x,
          y: targetCell.y,
          baseKey: autoCard.cardKey,
          cardKey: autoCard.cardKey,
          stars: autoCard.stars || 1,
          evolved: false,
        });
      }
      const nextSyn = recomputeLoopBoardSynergies(loop.board);
      loop.board = nextSyn.board;
      loop.synergiesTriggered = Math.max(loop.synergiesTriggered || 0, nextSyn.evolvedCount);
    }
  }

  idle.wave = curWave;
  idle.stage = curStage;
  idle.maxStage = curMaxStage;
  idle.wavesClearedTotal = (idle.wavesClearedTotal || 0) + steps;
  if (metrics.overdriveActive || timerRunning) {
    idle.overdriveWavesCleared = (idle.overdriveWavesCleared || 0) + steps;
  }
  idle.lastTickAtMs = now;
  flags.idle = idle;

  const mult = metrics.midasMult * (metrics.overdriveActive || timerRunning ? 2.2 : 1.0) * (triggerUltimate ? 1.35 : 1.0);
  const shardsGain = Math.max(3, Math.round((3 + curStage + (bossesSlainDelta > 0 ? 10 : 0)) * steps * mult));
  const coinsGain = Math.max(2, Math.round((2 + curStage + (bossesSlainDelta > 0 ? 6 : 0)) * steps * metrics.midasMult));
  const xpGain = Math.max(6, Math.round((8 + curStage * 4 + (bossesSlainDelta > 0 ? 20 : 0)) * steps * mult));

  let droppedItem = null;
  const dropChance = bossesSlainDelta > 0 || triggerUltimate ? 1.0 : Math.min(0.65, 0.28 + metrics.effectiveLuck * 0.004);
  if (Math.random() < dropChance) {
    const minRarity = bossesSlainDelta > 0 ? 'rare' : metrics.overdriveActive ? 'uncommon' : 'common';
    droppedItem = generateLootItem(db, user.id, curStage, metrics.effectiveLuck, { minRarity });
  }

  const events = [
    {
      kind: triggerUltimate ? 'finisher' : bossesSlainDelta > 0 ? 'crit' : 'hit',
      target: 'enemy',
      text: triggerUltimate
        ? `🌟 +${sackShards}✦ SACK · +${drawCount}🃏`
        : bossesSlainDelta > 0
          ? `👑 STAGE ${curStage} CLEAR!`
          : `+${sackShards}✦ +${drawCount}🃏`,
    },
  ];
  let logText = `🌑 [Forgotten Shore Skirmish · Act ${curStage}]: +${sackShards}✦ Shards, +${drawCount} Memory Thread${drawCount > 1 ? 's' : ''}`;
  if (droppedItem) {
    if (droppedItem.autoEquipped) {
      logText += ` & [Spell Wove] ${droppedItem.name} (${droppedItem.rarity.toUpperCase()})!`;
    } else if (droppedItem.autoSalvagedShards > 0) {
      logText += ` (+${droppedItem.autoSalvagedShards}✦ Soul Essence extracted)`;
    } else {
      logText += ` & Claimed ${droppedItem.name}!`;
    }
  }
  const nextLogs = wasBoss || triggerUltimate || droppedItem || wrappedCampfire ? appendLogs(profile, [logText]) : profile.last_log_json;

  db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(coinsGain, user.id);
  db.prepare(`
    UPDATE game_profiles
    SET shards = shards + ?, hero_xp = hero_xp + ?, floor = ?, best_floor = ?,
        monsters_slain = monsters_slain + ?, bosses_slain = bosses_slain + ?,
        story_flags_json = ?, last_log_json = ?, updated_at = ?
    WHERE user_id = ?
  `).run(
    shardsGain,
    xpGain,
    curStage,
    curMaxStage,
    steps,
    bossesSlainDelta,
    JSON.stringify(flags),
    nextLogs,
    now,
    user.id
  );

  const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  return {
    game: buildGameState(db, refreshedUser, userStats),
    droppedItem: droppedItem && !droppedItem.autoSalvagedShards ? droppedItem : null,
    shardsGained: shardsGain,
    coinsGained: coinsGain,
    xpGained: xpGain,
    events,
    message: triggerUltimate || bossesSlainDelta > 0 ? logText : undefined,
  };
}

export function claimIdleAfkChest(db, user, userStats) {
  const profile = ensureGameProfile(db, user.id);
  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const heroStats = computeHeroStats(profile, rawItems, computeStudyBonuses(user, userStats));
  const flags = parseJsonSafe(profile.story_flags_json, {});
  const now = Date.now();
  const idle = accrueIdleProgress(db, profile, flags, heroStats, now);
  const metrics = computeIdleMetrics(idle, heroStats, now);

  const shardsGain = Math.max(12, idle.afkChest.shards || 0);
  const coinsGain = Math.max(8, idle.afkChest.coins || 0);
  const xpGain = Math.max(30, idle.afkChest.xp || 0);
  const lootRolls = Math.max(1, Math.min(3, idle.afkChest.itemsRolled || 1));

  let bestDrop = null;
  for (let i = 0; i < lootRolls; i++) {
    const drop = generateLootItem(db, user.id, idle.stage, metrics.effectiveLuck, { minRarity: i === 0 ? 'uncommon' : 'common' });
    if (!bestDrop || computeItemPower(drop) > computeItemPower(bestDrop)) {
      bestDrop = drop;
    }
  }

  idle.afkChest = {
    accumulatedSec: 0,
    shards: 0,
    coins: 0,
    xp: 0,
    itemsRolled: 0,
    lastClaimedAtMs: now,
  };
  idle.lastTickAtMs = now;
  flags.idle = idle;

  const msg = `🏰 Claimed Citadel Tribute (+${shardsGain}✦ Soul Shards, +${coinsGain}🪙 Coins, +${xpGain} Soul XP & ${lootRolls} Memor${lootRolls > 1 ? 'ies' : 'y'})!`;
  const nextLogs = appendLogs(profile, [msg]);

  db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(coinsGain, user.id);
  db.prepare(`
    UPDATE game_profiles
    SET shards = shards + ?, hero_xp = hero_xp + ?, chests_opened = chests_opened + 1,
        story_flags_json = ?, last_log_json = ?, updated_at = ?
    WHERE user_id = ?
  `).run(shardsGain, xpGain, JSON.stringify(flags), nextLogs, now, user.id);

  const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  return {
    game: buildGameState(db, refreshedUser, userStats),
    droppedItem: bestDrop && !bestDrop.autoSalvagedShards ? bestDrop : null,
    shardsGained: shardsGain,
    message: msg,
    events: [{ kind: 'loot', target: 'hero', text: `🎁 +${shardsGain}✦ +${coinsGain}🪙` }],
  };
}

export function updateIdleConfig(db, user, userStats, payload = {}) {
  const profile = ensureGameProfile(db, user.id);
  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const heroStats = computeHeroStats(profile, rawItems, computeStudyBonuses(user, userStats));
  const flags = parseJsonSafe(profile.story_flags_json, {});
  const now = Date.now();
  const idle = ensureIdleState(flags, profile, now);
  const ss = ensureShadowSlaveState(flags, profile);
  let msg = '';
  const customEvents = [];
  let droppedItem = null;

  if (payload.shadowAction && typeof payload.shadowAction === 'object') {
    const actPayload = payload.shadowAction;
    const actionType = String(actPayload.type || '');
    const actDef = SS_ARC1_ACTS.find((a) => a.act === ss.arcAct) || SS_ARC1_ACTS[0];
    const aspect = SS_ASPECTS.find((a) => a.id === ss.aspectId) || SS_ASPECTS[0];
    const attrObjs = ss.attributeIds.map((id) => SS_ATTRIBUTES.find((a) => a.id === id)).filter(Boolean);
    const attrAtk = attrObjs.reduce((s, a) => s + (a.atkBonus || 0), 0);
    const attrDef = attrObjs.reduce((s, a) => s + (a.defBonus || 0), 0);
    const attrLuck = attrObjs.reduce((s, a) => s + (a.luckBonus || 0), 0);
    const fragMult = attrObjs.reduce((m, a) => Math.max(m, a.studyFragmentMult || 1), 1);
    const memAtk = ss.memories.reduce((s, m) => {
      const def = SS_MEMORIES.find((d) => d.id === m.id);
      return s + (def ? Math.round(def.atk * (1 + ((m.weaveLevel || 1) - 1) * 0.25)) : 0);
    }, 0);
    const memDef = ss.memories.reduce((s, m) => {
      const def = SS_MEMORIES.find((d) => d.id === m.id);
      return s + (def ? Math.round(def.def * (1 + ((m.weaveLevel || 1) - 1) * 0.25)) : 0);
    }, 0);
    const rankBonus = Math.max(0, SS_RANKS.indexOf(ss.rank)) * 12;

    if (actionType === 'wrap_shadow') {
      const t = ['weapon', 'body', 'echo'].includes(actPayload.target) ? actPayload.target : 'weapon';
      ss.shadowWrap = t;
      msg =
        t === 'weapon'
          ? '🗡️ Wrapped Shadow around Weapon (+85% Armor Penetration & Slash DMG).'
          : t === 'body'
            ? '🛡️ Wrapped Shadow around Body (+70% Guard & Deflect Stagger Window).'
            : '🗿 Wrapped Shadow around Stone Saint / Echo (+60% Echo Strike DMG).';
      ss.lastWhisper = `[Shadow Control]: ${msg}`;
      customEvents.push({ kind: 'guard', target: 'hero', text: `🌑 WRAP ${t.toUpperCase()}` });
    } else if (actionType === 'select_act') {
      const targetAct = Number(actPayload.act || 1);
      if (targetAct < 1 || targetAct > ss.maxArcAct) {
        throw new Error(`Conquer the Boss of Act ${ss.maxArcAct} before entering Act ${targetAct}!`);
      }
      const nextActDef = SS_ARC1_ACTS.find((a) => a.act === targetAct) || SS_ARC1_ACTS[0];
      ss.arcAct = targetAct;
      ss.currentNodeId = nextActDef.nodes[0].id;
      ss.sunProgress = 15;
      ss.activeCombat = createCombatFromNode(nextActDef.nodes[0], targetAct);
      msg = `🗺️ Entered ${nextActDef.title}`;
      ss.lastWhisper = `[Nightmare Spell]: ${nextActDef.title} — ${nextActDef.subtitle}`;
    } else if (actionType === 'move_node') {
      const targetNode = actDef.nodes.find((n) => n.id === String(actPayload.nodeId || ''));
      if (!targetNode) throw new Error('Target 3D Nightmare node not found in current Act.');
      if (targetNode.id === ss.currentNodeId && ss.activeCombat && ss.activeCombat.hp > 0) {
        msg = `⚔️ Engaging ${ss.activeCombat.name} at ${targetNode.name}.`;
      } else {
        const moveCost = targetNode.id === ss.currentNodeId ? 4 : 10;
        if (ss.soulEssence < moveCost) {
          throw new Error(
            `Need ${moveCost} Soul Essence! Meditate in Focus tab, Deflect in combat, or Camp on a High Statue.`
          );
        }
        ss.soulEssence -= moveCost;
        ss.sunProgress = Math.min(100, ss.sunProgress + 16);

        if (ss.sunProgress >= 75 && targetNode.altitude === 'low') {
          const safeNode = actDef.nodes.find((n) => n.altitude === 'high') || actDef.nodes[0];
          const shardPenalty = Math.min(profile.shards, Math.max(0, Math.round(profile.shards * 0.25)));
          ss.heroHp = Math.max(18, Math.round(ss.heroHp * 0.65));
          if (ss.memories[0]) ss.memories[0].durability = Math.max(25, (ss.memories[0].durability ?? 100) - 15);
          ss.currentNodeId = safeNode.id;
          ss.sunProgress = 20;
          ss.activeCombat = createCombatFromNode(safeNode, ss.arcAct);
          if (shardPenalty > 0) {
            db.prepare('UPDATE game_profiles SET shards = MAX(0, shards - ?) WHERE user_id = ?').run(shardPenalty, user.id);
          }
          msg = `🌊 SWALLOWED BY THE BLACK SEA! Abyssal tendrils forced an emergency Memory retreat to ${safeNode.name} (-${shardPenalty}✦).`;
          ss.lastWhisper = `[The Dark Sea]: Never linger in the low coral after Dusk!`;
          customEvents.push({ kind: 'enemy_hit', target: 'hero', text: '🌊 BLACK SEA TIDE!' });
        } else {
          ss.currentNodeId = targetNode.id;
          ss.activeCombat = createCombatFromNode(targetNode, ss.arcAct);
          msg = `🧭 Moved to ${targetNode.name} (${targetNode.altitude === 'high' ? 'High Safe Stone' : 'Low Coral'}) — Encountered ${targetNode.enemyName}!`;
          ss.lastWhisper = `[${targetNode.name}]: ${targetNode.desc}`;
          customEvents.push({ kind: 'step', target: 'hero', text: `${targetNode.name}` });
        }
      }
    } else if (actionType === 'combat_move') {
      const move = ['slash', 'deflect', 'aspect_art'].includes(actPayload.move) ? actPayload.move : 'slash';
      const curNode = actDef.nodes.find((n) => n.id === ss.currentNodeId) || actDef.nodes[0];
      if (!ss.activeCombat || ss.activeCombat.hp <= 0) {
        ss.activeCombat = createCombatFromNode(curNode, ss.arcAct);
      }
      const combat = ss.activeCombat;
      const moveCost = move === 'aspect_art' ? 18 : move === 'deflect' ? 5 : 6;
      if (ss.soulEssence < moveCost) {
        throw new Error(`Need ${moveCost} Soul Essence for ${move}! Use Deflect (+12 Essence) or Focus Meditation.`);
      }
      ss.soulEssence -= moveCost;

      const totalAtk = Math.round(14 + (heroStats.atk || 12) * 0.7 + attrAtk + memAtk + rankBonus + (ss.coreCount - 1) * 14);
      const totalDef = Math.round(4 + (heroStats.def || 4) * 0.5 + attrDef + memDef + (ss.coreCount - 1) * 8);
      const activeEcho = ss.echoes.find((e) => e.unlocked);
      const echoBonusDmg = activeEcho
        ? Math.round(
            ((SS_ECHOES.find((d) => d.id === activeEcho.id)?.atk || 12) * (1 + ((activeEcho.level || 1) - 1) * 0.22)) *
              (ss.shadowWrap === 'echo' ? 1.6 : 0.65)
          )
        : 0;

      if (move === 'deflect') {
        const cleanStagger = ss.shadowWrap === 'body' || combat.intent === 'HEAVY_CRUSH' || Math.random() < 0.72;
        ss.soulEssence = Math.min(ss.maxSoulEssence, ss.soulEssence + 17); // Net +12
        const riposte = Math.round(totalAtk * 0.55);
        combat.hp = Math.max(0, combat.hp - riposte);
        if (cleanStagger) {
          combat.staggered = true;
          combat.staggerTurns = 2;
          customEvents.push({ kind: 'parry', target: 'enemy', text: `🛡️ STAGGER! +12⚡` });
          msg = `🛡️ Shadow Deflect cracked ${combat.name}'s carapace! Exposed Weak Spot (+12 Essence, -${riposte} Riposte).`;
        } else {
          customEvents.push({ kind: 'guard', target: 'hero', text: '🛡️ GUARD +12⚡' });
          msg = `🛡️ Parried ${combat.name}'s strike and recovered +12 Soul Essence!`;
        }
      } else if (move === 'aspect_art') {
        const stagMult = combat.staggered ? 2.1 : 1.0;
        const wrapMult = ss.shadowWrap === 'weapon' ? 1.45 : 1.15;
        const dmg = Math.max(20, Math.round(totalAtk * 2.15 * stagMult * wrapMult) + echoBonusDmg);
        combat.hp = Math.max(0, combat.hp - dmg);
        combat.staggered = true;
        combat.staggerTurns = 1;
        const healAmt = Math.round(ss.heroMaxHp * (aspect.id === 'lightbringer' ? 0.22 : 0.12));
        ss.heroHp = Math.min(ss.heroMaxHp, ss.heroHp + healAmt);
        customEvents.push({ kind: 'crit', target: 'enemy', text: `${aspect.icon} -${dmg}!` });
        msg = `${aspect.icon} Unleashed [${aspect.abilityName}] on ${combat.name} for ${dmg} DMG (+${healAmt} HP)!`;
      } else {
        const stagMult = combat.staggered ? 2.15 : 1.0;
        const wrapMult = ss.shadowWrap === 'weapon' ? 1.85 : 1.0;
        const dmg = Math.max(10, Math.round(totalAtk * stagMult * wrapMult) + echoBonusDmg);
        combat.hp = Math.max(0, combat.hp - dmg);
        if (combat.staggerTurns > 0) {
          combat.staggerTurns -= 1;
          if (combat.staggerTurns <= 0) combat.staggered = false;
        }
        customEvents.push({ kind: combat.staggered ? 'crit' : 'hit', target: 'enemy', text: `-${dmg}` });
        msg = `⚔️ Soul Slash struck ${combat.name} for ${dmg} DMG${echoBonusDmg > 0 ? ` (+${echoBonusDmg} Echo)` : ''}!`;
      }

      if (combat.hp <= 0) {
        const fragsEarned = Math.max(1, Math.round((combat.fragments || 1) * fragMult));
        const shardsEarned = Math.round((combat.shards || 8) + attrLuck * 0.2);
        const xpEarned = 18 + ss.arcAct * 12 + (combat.isBoss ? 40 : 0);

        ss.soulFragments += fragsEarned;
        if (ss.soulFragments >= 1000 && ss.coreCount < 7) {
          ss.soulFragments -= 1000;
          ss.coreCount += 1;
          ss.lastWhisper = `[Your Soul Core has saturated and split! You are now Class ${SS_CORE_CLASSES[ss.coreCount - 1]?.name || 'Monster'}.]`;
        }
        ss.slainShades.count += 1;
        ss.slainShades.recent = [combat.name, ...(ss.slainShades.recent || [])].slice(0, 12);
        if (!ss.clearedNodeIds.includes(curNode.id)) ss.clearedNodeIds.push(curNode.id);

        // Slow-burn rare Memory / Echo drops (plus guaranteed Act Boss drops)
        let spellDropText = '';
        const memChance = combat.isBoss ? 1.0 : Math.min(0.28, 0.09 + attrLuck * 0.005);
        if (Math.random() < memChance) {
          const unowned = SS_MEMORIES.filter((m) => !ss.memories.some((um) => um.id === m.id));
          if (unowned.length > 0) {
            const pick = unowned[0];
            ss.memories.push({ id: pick.id, weaveLevel: 1, durability: 100, equipped: true });
            spellDropText += ` • [YOU HAVE RECEIVED A MEMORY: ${pick.icon} ${pick.name}!]`;
          }
        }
        if (ss.arcAct === 2 && combat.isBoss) {
          const saint = ss.echoes.find((e) => e.id === 'stone_saint');
          if (saint && !saint.unlocked) {
            saint.unlocked = true;
            spellDropText += ' • [YOU HAVE RECEIVED AN ECHO: 🗿 Stone Saint!]';
          }
        } else if (combat.isBoss && ss.arcAct === 4) {
          if (!ss.echoes.some((e) => e.id === 'nightmare_steed')) {
            ss.echoes.push({ id: 'nightmare_steed', unlocked: true, awakened: false, level: 1 });
            spellDropText += ' • [YOU HAVE RECEIVED AN ECHO: 🐎 Nightmare!]';
          }
        } else if (Math.random() < 0.03 + attrLuck * 0.002) {
          if (!ss.echoes.some((e) => e.id === 'carapace_scavenger')) {
            ss.echoes.push({ id: 'carapace_scavenger', unlocked: true, awakened: false, level: 1 });
            spellDropText += ' • [YOU HAVE RECEIVED AN ECHO: 🦀 Carapace Scavenger!]';
          }
        }

        // Act Boss unlock
        if (combat.isBoss) {
          if (ss.arcAct >= ss.maxArcAct && ss.maxArcAct < 4) {
            ss.maxArcAct = ss.arcAct + 1;
            spellDropText += ` • 🔓 UNLOCKED ACT ${ss.maxArcAct}!`;
          }
          if (ss.arcAct === 1 && ss.appraisal !== 'Glorious') ss.appraisal = 'Glorious';
          if (ss.arcAct === 4 && ss.rank === 'Dormant') ss.rank = 'Awakened';
        }

        db.prepare(`
          UPDATE game_profiles
          SET shards = shards + ?, hero_xp = hero_xp + ?, monsters_slain = monsters_slain + 1, bosses_slain = bosses_slain + ?
          WHERE user_id = ?
        `).run(shardsEarned, xpEarned, combat.isBoss ? 1 : 0, user.id);

        ss.lastWhisper = `[You have slain ${combat.rank} ${combat.enemyClass}: ${combat.name}. +${fragsEarned} Soul Fragments (${ss.soulFragments}/1,000), +${shardsEarned}✦.${spellDropText}]`;
        msg = ss.lastWhisper;
        ss.activeCombat = createCombatFromNode(curNode, ss.arcAct);
      } else {
        // Enemy counterattack
        const bodyMit = ss.shadowWrap === 'body' ? 0.35 : 0.85;
        const stagMit = combat.staggered ? 0.25 : 1.0;
        const incoming = Math.max(3, Math.round((combat.atk * bodyMit - totalDef * 0.35) * stagMit));
        ss.heroHp = Math.max(0, ss.heroHp - incoming);
        combat.intent = Math.random() < 0.45 ? 'HEAVY_CRUSH' : 'CLAW_SWIPE';
        if (ss.heroHp <= 0) {
          const safeNode = actDef.nodes.find((n) => n.altitude === 'high') || actDef.nodes[0];
          ss.heroHp = Math.round(ss.heroMaxHp * 0.4);
          ss.currentNodeId = safeNode.id;
          ss.sunProgress = 18;
          ss.activeCombat = createCombatFromNode(safeNode, ss.arcAct);
          msg = `💀 Overwhelmed by ${combat.name}! Emergency retreat to ${safeNode.name} at Dawn.`;
          ss.lastWhisper = `[Emergency Tether]: Rest at High Ground or Strengthen Memories before challenging stronger Nightmare Creatures.`;
          customEvents.push({ kind: 'enemy_hit', target: 'hero', text: '💀 RETREATED TO STATUE!' });
        } else {
          ss.lastWhisper = `${msg} (${combat.name} countered for -${incoming} HP).`;
        }
      }
    } else if (actionType === 'camp_statue') {
      const highNode =
        actDef.nodes.find((n) => n.id === ss.currentNodeId && n.altitude === 'high') ||
        actDef.nodes.find((n) => n.altitude === 'high') ||
        actDef.nodes[0];
      if (ss.sunProgress >= 75 && actDef.nodes.find((n) => n.id === ss.currentNodeId)?.altitude === 'low') {
        throw new Error('Too late! The Black Sea is already flooding low ground — escape to a High Statue node!');
      }
      ss.currentNodeId = highNode.id;
      ss.sunProgress = 10;
      ss.heroHp = ss.heroMaxHp;
      ss.soulEssence = Math.min(ss.maxSoulEssence, ss.soulEssence + 45);
      ss.activeCombat = createCombatFromNode(highNode, ss.arcAct);
      msg = `🏕️ Camped atop ${highNode.name} until Dawn! Restored full HP (${ss.heroHp}) & +45 Soul Essence.`;
      ss.lastWhisper = `[Dawn Breaks]: The Black Sea recedes across the Crimson Coral.`;
      customEvents.push({ kind: 'heal', target: 'hero', text: '☀️ DAWN +45⚡' });
    } else if (actionType === 'weave_memory') {
      const mem = ss.memories.find((m) => m.id === String(actPayload.memoryId || ''));
      if (!mem) throw new Error('Memory not found in Soul Sea.');
      const def = SS_MEMORIES.find((d) => d.id === mem.id);
      const cost = 20 * (mem.weaveLevel || 1);
      if (profile.shards < cost) {
        throw new Error(`Need ${cost}✦ Soul Shards to weave another Golden Essence String into ${def?.name || mem.id}.`);
      }
      db.prepare('UPDATE game_profiles SET shards = shards - ? WHERE user_id = ?').run(cost, user.id);
      mem.weaveLevel = (mem.weaveLevel || 1) + 1;
      mem.durability = 100;
      ss.spellweaveStrings += 1;
      msg = `🧵 Wove Golden Essence String #${mem.weaveLevel} into [${def?.icon || '🔮'} ${def?.name || mem.id}] (-${cost}✦)!`;
      ss.lastWhisper = `[Weaver's Loom]: ${def?.name} weave reinforced to Tier ${mem.weaveLevel}.`;
      customEvents.push({ kind: 'finisher', target: 'hero', text: `🧵 WEAVE TIER ${mem.weaveLevel}!` });
    } else if (actionType === 'awaken_echo') {
      const echo = ss.echoes.find((e) => e.id === String(actPayload.echoId || 'stone_saint'));
      if (!echo) throw new Error('Echo blueprint not found.');
      const def = SS_ECHOES.find((d) => d.id === echo.id);
      const cost = 30 * (echo.level || 1);
      if (profile.shards < cost) throw new Error(`Need ${cost}✦ Soul Shards to awaken/upgrade ${def?.name}.`);
      db.prepare('UPDATE game_profiles SET shards = shards - ? WHERE user_id = ?').run(cost, user.id);
      echo.unlocked = true;
      echo.awakened = true;
      echo.level = (echo.level || 1) + 1;
      msg = `🗿 Infused Shadow Essence into [${def?.icon} ${def?.name}] -> Lv.${echo.level} Shadow Companion!`;
      ss.lastWhisper = `[Shadow Transformation]: ${def?.name} rises silently within your Soul Sea.`;
      customEvents.push({ kind: 'loot', target: 'hero', text: `🗿 SHADOW LV.${echo.level}!` });
    } else if (actionType === 'reweave_fate') {
      if (profile.shards < REWEAVE_FATE_COST.shards || user.coins < REWEAVE_FATE_COST.coins) {
        throw new Error(
          `Altar of Weaver demands ${REWEAVE_FATE_COST.shards}✦ Soul Shards & ${REWEAVE_FATE_COST.coins}🪙 Coins (~15–20h study) to tear and re-knit Fate!`
        );
      }
      db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(REWEAVE_FATE_COST.coins, user.id);
      db.prepare('UPDATE game_profiles SET shards = shards - ? WHERE user_id = ?').run(REWEAVE_FATE_COST.shards, user.id);
      const rolled = rollFreshShadowIdentity(user.id, now % 99991);
      ss.aspectId = rolled.aspectId;
      ss.attributeIds = rolled.attributeIds;
      ss.flawId = rolled.flawId;
      ss.trueName = rolled.trueName;
      ss.appraisal = rolled.appraisal;
      const newAsp = SS_ASPECTS.find((a) => a.id === ss.aspectId);
      msg = `🕸️ [ALTAR OF WEAVER]: Fate severed & re-knitted! Awakened Aspect [${newAsp?.name}] & True Name [${ss.trueName}]!`;
      ss.lastWhisper = msg;
      customEvents.push({ kind: 'finisher', target: 'hero', text: `🕸️ RE-WOVEN FATE!` });
    }
  }

  if (payload.placeCard && typeof payload.placeCard === 'object') {
    const { cardId, cardKey, x, y } = payload.placeCard;
    let handIdx = -1;
    if (cardId) handIdx = idle.loop.hand.findIndex((c) => c.id === cardId);
    if (handIdx < 0 && cardKey) handIdx = idle.loop.hand.findIndex((c) => c.cardKey === cardKey);
    if (handIdx < 0 && idle.loop.hand.length > 0 && !cardId && !cardKey) handIdx = 0;
    if (handIdx < 0) {
      throw new Error('Selected tactical card not found in hand — clear tiles or answer a Study Quiz to draw cards!');
    }

    const card = idle.loop.hand[handIdx];
    const cardDef = LOOP_TILE_CARDS[card.cardKey];
    if (!cardDef || !cardDef.placeable) throw new Error('Invalid Loop Architect card');

    let tx = Number.isInteger(x) ? Number(x) : null;
    let ty = Number.isInteger(y) ? Number(y) : null;
    if (tx === null || ty === null) {
      const pick = smartPickPlacementCell(card.cardKey, idle.loop.board);
      if (!pick) throw new Error('No valid empty cells remain for this tile type — try merging duplicates!');
      tx = pick.x;
      ty = pick.y;
    }

    if (tx < 0 || tx >= LOOP_GRID_WIDTH || ty < 0 || ty >= LOOP_GRID_HEIGHT) {
      throw new Error('Grid coordinates out of 7×5 Loop bounds');
    }
    if (isCampfireCoord(tx, ty)) {
      throw new Error('The Campfire anchor tile cannot be overwritten!');
    }
    const roadCell = isRoadCoord(tx, ty);
    if (cardDef.placement === 'road' && !roadCell) {
      throw new Error(`${cardDef.name} must be placed directly on the Expedition Road!`);
    }
    if (cardDef.placement === 'landscape' && roadCell) {
      throw new Error(`${cardDef.name} must be placed on Landscape / Courtyard tiles off the road!`);
    }

    const prevEvoCount = recomputeLoopBoardSynergies(idle.loop.board).evolvedCount;
    const occupying = idle.loop.board.find((t) => t.x === tx && t.y === ty);
    let actionLabel = '';
    if (occupying) {
      if (occupying.baseKey === card.cardKey && occupying.stars < 3) {
        occupying.stars = Math.min(3, occupying.stars + Math.max(1, card.stars || 1));
        idle.loop.hand.splice(handIdx, 1);
        actionLabel = `★ Merged ${cardDef.icon} ${cardDef.name} up to ★${occupying.stars}`;
      } else {
        throw new Error('That cell is already occupied by a different structure — choose an empty cell or matching tile!');
      }
    } else {
      idle.loop.board.push({
        x: tx,
        y: ty,
        baseKey: card.cardKey,
        cardKey: card.cardKey,
        stars: card.stars || 1,
        evolved: false,
      });
      idle.loop.hand.splice(handIdx, 1);
      actionLabel = `🗺️ Placed ${cardDef.icon} ${cardDef.name} at (${tx},${ty})`;
    }

    const nextAnalysis = recomputeLoopBoardSynergies(idle.loop.board);
    idle.loop.board = nextAnalysis.board;
    idle.loop.threatPct = Math.min(100, (idle.loop.threatPct || 0) + (cardDef.threat || 6));
    if (idle.loop.threatPct >= 100) idle.loop.bossActive = true;

    if (nextAnalysis.evolvedCount > prevEvoCount) {
      const gainedEvo = nextAnalysis.evolvedCount - prevEvoCount;
      idle.loop.synergiesTriggered = (idle.loop.synergiesTriggered || 0) + gainedEvo;
      idle.loop.lootSack.shards += 15 * gainedEvo;
      idle.loop.lootSack.coins += 10 * gainedEvo;
      customEvents.push({ kind: 'crit', target: 'hero', text: '⚡ ADJACENCY EVOLVED!' });
      msg = `⚡ ADJACENCY SYNERGY DISCOVERED! ${actionLabel} & awakened an Evolved Structure (+${15 * gainedEvo}✦ into Sack)!`;
    } else {
      customEvents.push({ kind: 'hit', target: 'hero', text: `${cardDef.icon} PLACED!` });
      msg = actionLabel;
    }
  }

  if (payload.mergeHand === true) {
    let merges = 0;
    // First merge hand cards onto matching <3★ board tiles
    for (let i = idle.loop.hand.length - 1; i >= 0; i--) {
      const hc = idle.loop.hand[i];
      const boardMatch = idle.loop.board.find((t) => t.baseKey === hc.cardKey && t.stars < 3);
      if (boardMatch) {
        boardMatch.stars = Math.min(3, boardMatch.stars + 1);
        idle.loop.hand.splice(i, 1);
        merges += 1;
      }
    }
    // Then merge duplicate cards inside hand into ★2/★3 cards
    for (let i = 0; i < idle.loop.hand.length; i++) {
      for (let j = i + 1; j < idle.loop.hand.length; j++) {
        if (idle.loop.hand[i].cardKey === idle.loop.hand[j].cardKey && idle.loop.hand[i].stars < 3) {
          idle.loop.hand[i].stars = Math.min(3, Math.max(idle.loop.hand[i].stars, idle.loop.hand[j].stars) + 1);
          idle.loop.hand.splice(j, 1);
          merges += 1;
          j -= 1;
        }
      }
    }
    const nextAnalysis = recomputeLoopBoardSynergies(idle.loop.board);
    idle.loop.board = nextAnalysis.board;
    if (merges > 0) {
      drawCardsIntoHand(idle.loop, [rollLoopCardKey()], 1);
      customEvents.push({ kind: 'finisher', target: 'hero', text: `✨ ${merges}× STAR MERGE!` });
      msg = `✨ Merged ${merges} duplicate Tactical Card${merges > 1 ? 's' : ''} into higher Star ranks & drew +1 Card!`;
    } else {
      msg = 'No duplicate Tactical Cards ready to merge yet — place cards on the 7×5 board or battle to draw more!';
    }
  }

  if (typeof payload.pickRelic === 'string' && payload.pickRelic) {
    const relic = LOOP_CAMPFIRE_RELICS.find((r) => r.id === payload.pickRelic);
    if (!relic) throw new Error('Unknown Campfire Relic');
    if (!idle.loop.activeRelics.includes(relic.id)) {
      idle.loop.activeRelics.push(relic.id);
    }
    idle.loop.pendingRelicChoices = [];
    customEvents.push({ kind: 'heal', target: 'hero', text: `${relic.icon} ${relic.name}!` });
    msg = `🕯️ Claimed Campfire Relic [${relic.icon} ${relic.name}]: ${relic.desc}`;
  }

  if (payload.extractLoop === true) {
    const analysis = recomputeLoopBoardSynergies(idle.loop.board);
    const metrics = computeIdleMetrics(idle, heroStats, now);
    const sack = idle.loop.lootSack || { shards: 0, coins: 0, xp: 0, embers: 0, gearRolls: 0 };
    const totalShards = Math.max(12, Math.round(sack.shards || 0));
    const totalCoins = Math.max(6, Math.round(sack.coins || 0));
    const totalXp = Math.max(20, Math.round(sack.xp || 0));
    const totalRolls = Math.max(1, Math.min(4, (sack.gearRolls || 0) + analysis.bonuses.bonusGearRolls));

    for (let r = 0; r < totalRolls; r++) {
      const roll = generateLootItem(db, user.id, idle.stage, metrics.effectiveLuck + 6, {
        minRarity: r === 0 && (idle.loop.loopCount || 1) >= 2 ? 'rare' : 'uncommon',
      });
      if (!droppedItem || computeItemPower(roll) > computeItemPower(droppedItem)) {
        droppedItem = roll;
      }
    }

    const oldLoopCount = idle.loop.loopCount || 1;
    idle.loop.lootSack = { shards: 0, coins: 0, xp: 0, embers: 0, gearRolls: 0 };
    idle.loop.loopCount = 1;
    idle.loop.tileIndex = 0;
    idle.loop.threatPct = 0;
    idle.loop.bossActive = false;
    idle.wavesClearedTotal = (idle.wavesClearedTotal || 0) + 1;
    drawCardsIntoHand(idle.loop, [rollLoopCardKey(), rollLoopCardKey()], 1);

    db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(totalCoins, user.id);
    db.prepare('UPDATE game_profiles SET shards = shards + ?, hero_xp = hero_xp + ?, chests_opened = chests_opened + 1 WHERE user_id = ?').run(
      totalShards,
      totalXp,
      user.id
    );

    customEvents.push({ kind: 'loot', target: 'hero', text: `🏕️ +${totalShards}✦ EXTRACTED!` });
    msg = `🏕️ Campfire Extraction (100% Loot from Loop #${oldLoopCount})! Banked +${totalShards}✦ Shards, +${totalCoins}🪙 Coins, +${totalXp} XP & ${totalRolls} Gear Roll${totalRolls > 1 ? 's' : ''}!`;
  }

  if (payload.toggleAutoArchitect !== undefined) {
    idle.loop.autoArchitect = Boolean(payload.toggleAutoArchitect);
    msg = `🤖 Auto-Architect Mode: ${idle.loop.autoArchitect ? 'ON (places & merges cards automatically)' : 'OFF (Manual Strategy)'}`;
  }

  if (payload.gambits && typeof payload.gambits === 'object') {
    const g = payload.gambits;
    if (g.ultPolicy === 'auto_ready' || g.ultPolicy === 'boss_or_broken') {
      idle.gambits.ultPolicy = g.ultPolicy;
    }
    if ([25, 45, 70].includes(Number(g.healThreshold))) {
      idle.gambits.healThreshold = Number(g.healThreshold);
    }
    if (g.stageProgression === 'auto_push' || g.stageProgression === 'farm_stage') {
      idle.gambits.stageProgression = g.stageProgression;
      if (g.stageProgression === 'auto_push') idle.bossWallStuck = false;
    }
    if (g.focusTarget === 'shield_break' || g.focusTarget === 'highest_dps') {
      idle.gambits.focusTarget = g.focusTarget;
    }
    if (g.battlePace === '1x' || g.battlePace === '2x' || g.battlePace === 'overdrive') {
      idle.gambits.battlePace = g.battlePace;
    }
    if (!msg) msg = '⚙️ Updated Squad AI Gambit tactics!';
  }

  if (payload.challengeBoss === true) {
    idle.wave = 10;
    idle.bossWallStuck = false;
    idle.loop.bossActive = true;
    idle.loop.threatPct = 100;
    idle.gambits.stageProgression = 'auto_push';
    msg = `👑 Challenging Stage ${idle.stage} Boss Warden!`;
  }

  if (payload.automation && typeof payload.automation === 'object') {
    const a = payload.automation;
    if (a.autoEquipBest !== undefined) {
      idle.automation.autoEquipBest = Boolean(a.autoEquipBest);
    }
    if (['off', 'common', 'uncommon', 'rare'].includes(a.autoSalvageMaxRarity)) {
      idle.automation.autoSalvageMaxRarity = a.autoSalvageMaxRarity;
    }
    msg = `🤖 Automation: Auto-Equip ${idle.automation.autoEquipBest ? 'ON' : 'OFF'} • Auto-Salvage: ${idle.automation.autoSalvageMaxRarity.toUpperCase()}`;
  }

  if (payload.swapHeroRow && typeof payload.swapHeroRow === 'string') {
    const heroId = payload.swapHeroRow;
    if (idle.formation.front.includes(heroId)) {
      const idxF = idle.formation.front.indexOf(heroId);
      const swapTarget = idle.formation.back[0];
      idle.formation.front[idxF] = swapTarget;
      idle.formation.back[0] = heroId;
      msg = `🔄 Moved ${heroId} to Back Row and ${swapTarget} to Front Vanguard!`;
    } else if (idle.formation.back.includes(heroId)) {
      const idxB = idle.formation.back.indexOf(heroId);
      const swapTarget = idle.formation.front[1];
      idle.formation.back[idxB] = swapTarget;
      idle.formation.front[1] = heroId;
      msg = `🔄 Moved ${heroId} to Front Vanguard and ${swapTarget} to Back Row!`;
    }
  }

  if (payload.stage !== undefined) {
    const reqStage = Number(payload.stage);
    if (Number.isInteger(reqStage) && reqStage >= 1 && reqStage <= idle.maxStage) {
      idle.stage = reqStage;
      idle.wave = 1;
      msg = `🗺️ Moved Squad to Stage ${reqStage} (${getIdleRealmForStage(reqStage).name})!`;
    }
  }

  flags.idle = idle;
  flags.shadowSlave = ss;
  const nextLogs = msg ? appendLogs(profile, [msg]) : profile.last_log_json;
  db.prepare(`
    UPDATE game_profiles SET floor = ?, story_flags_json = ?, last_log_json = ?, updated_at = ? WHERE user_id = ?
  `).run(idle.stage, JSON.stringify(flags), nextLogs, now, user.id);

  const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  return {
    game: buildGameState(db, refreshedUser, userStats),
    droppedItem: droppedItem && !droppedItem.autoSalvagedShards ? droppedItem : null,
    message: msg || 'Updated Squad settings',
    events: customEvents,
  };
}

export function upgradeIdleProfession(db, user, userStats, { professionId }) {
  const profile = ensureGameProfile(db, user.id);
  const profDef = IDLE_PROFESSIONS.find((p) => p.id === professionId);
  if (!profDef) throw new Error('Unknown Guild Profession');

  const flags = parseJsonSafe(profile.story_flags_json, {});
  const now = Date.now();
  const idle = ensureIdleState(flags, profile, now);
  const curLvl = Math.max(1, Number(idle.professions[profDef.id] || 1));
  const cost = Math.round(profDef.baseCost * Math.pow(1.45, curLvl - 1));
  if (profile.shards < cost) throw new Error(`Need ${cost} ✦ Shards to upgrade ${profDef.name}!`);

  idle.professions[profDef.id] = curLvl + 1;
  flags.idle = idle;
  const msg = `🏛️ Upgraded ${profDef.name} to Lv.${curLvl + 1} (${profDef.squadPerk})!`;
  const nextLogs = appendLogs(profile, [msg]);

  db.prepare(`
    UPDATE game_profiles SET shards = shards - ?, story_flags_json = ?, last_log_json = ?, updated_at = ? WHERE user_id = ?
  `).run(cost, JSON.stringify(flags), nextLogs, now, user.id);

  const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  return {
    game: buildGameState(db, refreshedUser, userStats),
    message: msg,
    events: [{ kind: 'loot', target: 'hero', text: `🏛️ LV.${curLvl + 1}!` }],
  };
}

export function performIdleAscension(db, user, userStats) {
  const profile = ensureGameProfile(db, user.id);
  const flags = parseJsonSafe(profile.story_flags_json, {});
  const now = Date.now();
  const idle = ensureIdleState(flags, profile, now);

  if (idle.maxStage < 2 && (idle.wavesClearedTotal || 0) < 4) {
    throw new Error('Reach Stage 2 or clear at least 4 Waves before Ascending!');
  }

  const embersEarned = Math.max(2, idle.maxStage + Math.floor((idle.wavesClearedTotal || 0) / 6));
  idle.ascensions = (idle.ascensions || 0) + 1;
  idle.celestialEmbers = (idle.celestialEmbers || 0) + embersEarned;
  idle.totalEmbersEarned = (idle.totalEmbersEarned || 0) + embersEarned;
  idle.stage = 1;
  idle.wave = 1;
  flags.idle = idle;

  const msg = `🩸 SOUL LINEAGE AWAKENING #${idle.ascensions}! Harvested +${embersEarned} 🩸 Weaver Sparks (+35% Permanent Nightmare Power per Awakening)!`;
  const nextLogs = appendLogs(profile, [msg]);

  db.prepare(`
    UPDATE game_profiles SET floor = 1, story_flags_json = ?, last_log_json = ?, updated_at = ? WHERE user_id = ?
  `).run(JSON.stringify(flags), nextLogs, now, user.id);

  const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  return {
    game: buildGameState(db, refreshedUser, userStats),
    message: msg,
    events: [{ kind: 'finisher', target: 'hero', text: `🔥 +${embersEarned} EMBERS!` }],
  };
}

export function upgradeAscensionRelic(db, user, userStats, { relicId }) {
  const profile = ensureGameProfile(db, user.id);
  const relicDef = IDLE_ASCENSION_RELICS.find((r) => r.id === relicId);
  if (!relicDef) throw new Error('Unknown Ascension Relic');

  const flags = parseJsonSafe(profile.story_flags_json, {});
  const now = Date.now();
  const idle = ensureIdleState(flags, profile, now);
  const curRank = Math.max(0, Number(idle.ascensionRelics[relicDef.id] || 0));
  const cost = relicDef.baseEmberCost + curRank;
  if ((idle.celestialEmbers || 0) < cost) {
    throw new Error(`Need ${cost} 🔥 Celestial Embers (Ascend at Stage 2+ to earn Embers)!`);
  }

  idle.celestialEmbers -= cost;
  idle.ascensionRelics[relicDef.id] = curRank + 1;
  flags.idle = idle;

  const msg = `🧬 Wove ${relicDef.name} to Rank ${curRank + 1}!`;
  const nextLogs = appendLogs(profile, [msg]);
  db.prepare(`
    UPDATE game_profiles SET story_flags_json = ?, last_log_json = ?, updated_at = ? WHERE user_id = ?
  `).run(JSON.stringify(flags), nextLogs, now, user.id);

  const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  return {
    game: buildGameState(db, refreshedUser, userStats),
    message: msg,
    events: [{ kind: 'loot', target: 'hero', text: `👑 RANK ${curRank + 1}` }],
  };
}

export function claimIdleMythicMilestone(db, user, userStats, { milestoneId }) {
  const profile = ensureGameProfile(db, user.id);
  const mDef = IDLE_MYTHIC_BOUNTIES.find((m) => m.id === milestoneId);
  if (!mDef) throw new Error('Unknown Mythic Milestone');

  const flags = parseJsonSafe(profile.story_flags_json, {});
  const now = Date.now();
  const idle = ensureIdleState(flags, profile, now);
  const claimed = new Set(idle.claimedMilestones || []);
  if (claimed.has(mDef.id)) throw new Error('Mythic Relic already forged!');

  const maxProfLevel = Math.max(
    idle.professions.astral_mining || 1,
    idle.professions.alchemy_lab || 1,
    idle.professions.rune_scribes || 1
  );
  let progress = 0;
  if (mDef.reqKey === 'wavesClearedTotal') progress = idle.wavesClearedTotal || 0;
  else if (mDef.reqKey === 'stageOrProf') progress = Math.max(idle.maxStage || 1, maxProfLevel);
  else if (mDef.reqKey === 'ascensions') progress = idle.ascensions || 0;
  else if (mDef.reqKey === 'wavesForPhoenix') progress = Math.max(idle.maxStage || 1, idle.wavesClearedTotal || 0);

  if (progress < mDef.target) {
    throw new Error(`Milestone in progress (${progress}/${mDef.target}) — keep auto-battling!`);
  }

  claimed.add(mDef.id);
  idle.claimedMilestones = [...claimed];
  flags.idle = idle;

  const droppedItem = insertLootSpec(db, user.id, {
    ...mDef.mythicReward,
    level: Math.max(mDef.mythicReward.level || 5, idle.maxStage),
  });
  if (droppedItem?.id > 0) {
    db.prepare('UPDATE game_items SET equipped = 0 WHERE user_id = ? AND slot = ?').run(user.id, mDef.mythicReward.slot);
    db.prepare('UPDATE game_items SET equipped = 1 WHERE id = ? AND user_id = ?').run(droppedItem.id, user.id);
    droppedItem.equipped = true;
  }

  const msg = `🕸️ [DIVINE MEMORY WOVEN & BOUND]: [${mDef.mythicReward.name}]!`;
  const nextLogs = appendLogs(profile, [msg]);
  db.prepare(`
    UPDATE game_profiles SET shards = shards + 50, story_flags_json = ?, last_log_json = ?, updated_at = ? WHERE user_id = ?
  `).run(JSON.stringify(flags), nextLogs, now, user.id);

  const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  return {
    game: buildGameState(db, refreshedUser, userStats),
    droppedItem,
    message: msg,
    events: [{ kind: 'finisher', target: 'hero', text: '👑 MYTHIC FORGED!' }],
  };
}
