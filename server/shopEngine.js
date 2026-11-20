import {
  buildGameState,
  computeHeroStats,
  computeStudyBonuses,
  ensureGameProfile,
  generateLootItem,
} from './gameEngine.js';

export const PERMANENT_CATALOG = [
  {
    key: 'dungeon_torch',
    tier: 'permanent',
    category: 'energy',
    rarity: 'common',
    name: 'Dungeon Torch',
    desc: 'Restores +3 Adventure Energy immediately.',
    effectBadge: '+3 ⚡ Energy',
    icon: '🔥',
    price: 35,
  },
  {
    key: 'luck_clover',
    tier: 'permanent',
    category: 'luck_buff',
    rarity: 'uncommon',
    name: 'Four-Leaf Relic Clover',
    desc: 'Blesses your Hero with +15 Luck for the next 5 encounters.',
    effectBadge: '+15 🍀 Luck (5x)',
    icon: '🍀',
    price: 55,
  },
  {
    key: 'loot_crate_iron',
    tier: 'permanent',
    category: 'chest',
    rarity: 'rare',
    name: 'Iron Relic Chest',
    desc: 'Rolls a guaranteed Uncommon+ Piece of Gear scaled to your Floor & Luck.',
    effectBadge: 'Uncommon+ Gear',
    icon: '🧰',
    price: 90,
    minRarity: 'uncommon',
  },
  {
    key: 'freeze_1',
    tier: 'permanent',
    category: 'consumable',
    rarity: 'rare',
    name: 'Streak Freeze Shield',
    desc: 'Automatically saves your daily study streak if you miss a day.',
    effectBadge: '+1 🧊 Freeze',
    icon: '🧊',
    price: 120,
  },
  {
    key: 'hero_scholar',
    tier: 'permanent',
    category: 'hero',
    rarity: 'common',
    name: 'Arcane Scholar Class',
    desc: 'Balanced default class with +10% Hero XP bonus.',
    effectBadge: '+10% Hero XP',
    icon: '🎓',
    price: 0,
    heroKey: 'hero_scholar',
  },
  {
    key: 'hero_knight',
    tier: 'permanent',
    category: 'hero',
    rarity: 'rare',
    name: 'Pixel Paladin Class',
    desc: 'Armored vanguard starting with +30 Max HP & +4 DEF.',
    effectBadge: '+30 HP • +4 DEF',
    icon: '🛡️',
    price: 160,
    heroKey: 'hero_knight',
  },
  {
    key: 'title_archmage',
    tier: 'permanent',
    category: 'title',
    rarity: 'rare',
    name: 'Focus Archmage Title',
    desc: 'Sets your peer badge title to "Focus Archmage".',
    effectBadge: 'Profile Title',
    icon: '🧙',
    price: 180,
    titleValue: 'Focus Archmage',
  },
  {
    key: 'hero_rogue',
    tier: 'permanent',
    category: 'hero',
    rarity: 'epic',
    name: 'Shadow Rogue Class',
    desc: 'Fortune hunter class with +12 Base Luck & +8% Crit Chance.',
    effectBadge: '+12 LUCK • +8% CRIT',
    icon: '🗡️',
    price: 190,
    heroKey: 'hero_rogue',
  },
  {
    key: 'spirit_phoenix',
    tier: 'permanent',
    category: 'spirit',
    rarity: 'epic',
    name: 'Solar Phoenix Spirit',
    desc: 'Unlocks fiery amber-rose luminescence for your Focus Spirit.',
    effectBadge: 'Focus Spirit',
    icon: '🔥',
    price: 200,
  },
  {
    key: 'spirit_emerald',
    tier: 'permanent',
    category: 'spirit',
    rarity: 'rare',
    name: 'Verdant Jade Spirit',
    desc: 'Unlocks botanical emerald-gold prism aura.',
    effectBadge: 'Focus Spirit',
    icon: '🌿',
    price: 220,
  },
  {
    key: 'hero_mage',
    tier: 'permanent',
    category: 'hero',
    rarity: 'legendary',
    name: 'Chrono Mage Class',
    desc: 'Glass-cannon sorcerer with +6 ATK & +15% Boss/Skill DMG.',
    effectBadge: '+6 ATK • +15% Boss DMG',
    icon: '⏳',
    price: 240,
    heroKey: 'hero_mage',
  },
  {
    key: 'spirit_cyber',
    tier: 'permanent',
    category: 'spirit',
    rarity: 'epic',
    name: 'Cyber Prism Spirit',
    desc: 'Unlocks holographic neon cyan-violet Spirit aura.',
    effectBadge: 'Focus Spirit',
    icon: '💎',
    price: 250,
  },
  {
    key: 'title_chronomancer',
    tier: 'permanent',
    category: 'title',
    rarity: 'epic',
    name: 'Chronomancer Title',
    desc: 'Sets your peer badge title to "Chronomancer".',
    effectBadge: 'Profile Title',
    icon: '🌌',
    price: 260,
    titleValue: 'Chronomancer',
  },
  {
    key: 'title_titan',
    tier: 'permanent',
    category: 'title',
    rarity: 'epic',
    name: 'Deep Work Titan Title',
    desc: 'Sets your peer badge title to "Deep Work Titan".',
    effectBadge: 'Profile Title',
    icon: '⚡',
    price: 300,
    titleValue: 'Deep Work Titan',
  },
  {
    key: 'spirit_void',
    tier: 'permanent',
    category: 'spirit',
    rarity: 'legendary',
    name: 'Eclipse Void Spirit',
    desc: 'Unlocks astral indigo-violet obsidian prism aura.',
    effectBadge: 'Focus Spirit',
    icon: '🌒',
    price: 320,
  },
  {
    key: 'title_dungeon_lord',
    tier: 'permanent',
    category: 'title',
    rarity: 'legendary',
    name: 'Pixel Dungeon Lord Title',
    desc: 'Supreme crawler title "Pixel Dungeon Lord".',
    effectBadge: 'Legendary Title',
    icon: '👑',
    price: 380,
    titleValue: 'Pixel Dungeon Lord',
  },
];

export const DAILY_POOL = [
  {
    key: 'daily_hp_potion',
    tier: 'daily',
    category: 'potion_heal',
    rarity: 'common',
    name: 'Apothecary Brew Pack',
    desc: '+2 Healing Potions & restores Hero HP to 100%.',
    effectBadge: '+2 🧪 • Full HP',
    icon: '🧪',
    price: 30,
    maxPerPeriod: 2,
  },
  {
    key: 'daily_torch_bundle',
    tier: 'daily',
    category: 'energy_5',
    rarity: 'common',
    name: 'Daily Torch Bundle',
    desc: 'Flash deal: +5 Adventure Energy for extra dungeon runs.',
    effectBadge: '+5 ⚡ Energy',
    icon: '🔦',
    price: 40,
    origPrice: 55,
    maxPerPeriod: 2,
  },
  {
    key: 'daily_luck_charm',
    tier: 'daily',
    category: 'luck_buff_20',
    rarity: 'uncommon',
    name: 'Elixir of Serendipity',
    desc: 'Grants +20 Luck across your next 6 dungeon encounters.',
    effectBadge: '+20 🍀 Luck (6x)',
    icon: '✨',
    price: 45,
    origPrice: 65,
    maxPerPeriod: 1,
  },
  {
    key: 'daily_shard_pouch',
    tier: 'daily',
    category: 'shards_30',
    rarity: 'uncommon',
    name: 'Arcane Shard Pouch',
    desc: 'Adds +30 Arcane Shards for permanent Sanctuary upgrades & Forging.',
    effectBadge: '+30 ✦ Shards',
    icon: '🔮',
    price: 50,
    maxPerPeriod: 2,
  },
  {
    key: 'daily_whetstone',
    tier: 'daily',
    category: 'whetstone',
    rarity: 'uncommon',
    name: 'Runic Whetstone',
    desc: 'Forges your equipped Weapon by +1 Level (or +35 Shards if maxed).',
    effectBadge: '+1 Weapon Forge',
    icon: '⚒️',
    price: 55,
    maxPerPeriod: 1,
  },
  {
    key: 'daily_xp_scroll',
    tier: 'daily',
    category: 'xp_scroll',
    rarity: 'rare',
    name: 'Scholarly Tome Scroll',
    desc: 'Grants +120 Study XP and +50 Hero XP immediately.',
    effectBadge: '+120 XP • +50 Hero',
    icon: '📜',
    price: 65,
    maxPerPeriod: 1,
  },
  {
    key: 'daily_iron_chest',
    tier: 'daily',
    category: 'chest',
    rarity: 'rare',
    name: 'Discount Relic Chest',
    desc: 'Daily bargain: rolls guaranteed Uncommon+ gear with +10 Luck.',
    effectBadge: 'Uncommon+ Gear',
    icon: '🎁',
    price: 65,
    origPrice: 90,
    minRarity: 'uncommon',
    bonusLuck: 10,
    maxPerPeriod: 1,
  },
  {
    key: 'daily_freeze_deal',
    tier: 'daily',
    category: 'consumable',
    rarity: 'rare',
    name: 'Flash Streak Freeze',
    desc: 'Discounted Streak Freeze Shield (once per day).',
    effectBadge: '+1 🧊 (-29%)',
    icon: '❄️',
    price: 85,
    origPrice: 120,
    maxPerPeriod: 1,
  },
];

export const WEEKLY_POOL = [
  {
    key: 'weekly_energy_elixir',
    tier: 'weekly',
    category: 'weekly_energy',
    rarity: 'rare',
    name: 'Overcharge Flask',
    desc: '+15 Adventure Energy & +3 Healing Potions.',
    effectBadge: '+15 ⚡ • +3 🧪',
    icon: '⚡',
    price: 110,
    maxPerPeriod: 2,
  },
  {
    key: 'weekly_shard_crate',
    tier: 'weekly',
    category: 'shards_95',
    rarity: 'rare',
    name: 'Master Forge Crate',
    desc: '+95 Arcane Shards for high-rank Hero & Gear upgrades.',
    effectBadge: '+95 ✦ Shards',
    icon: '💠',
    price: 140,
    maxPerPeriod: 1,
  },
  {
    key: 'weekly_epic_chest',
    tier: 'weekly',
    category: 'chest',
    rarity: 'epic',
    name: 'Gilded Vault Chest',
    desc: 'Guaranteed Rare+ Gear rolled with +20 Bonus Luck.',
    effectBadge: 'Rare+ (+20 Luck)',
    icon: '🪙',
    price: 180,
    minRarity: 'rare',
    bonusLuck: 20,
    maxPerPeriod: 1,
  },
  {
    key: 'weekly_freeze_pack',
    tier: 'weekly',
    category: 'freeze_2',
    rarity: 'rare',
    name: 'Twin Frost Shields',
    desc: '+2 Streak Freeze Shields for tough exam weeks.',
    effectBadge: '+2 🧊 Freezes',
    icon: '🛡️',
    price: 195,
    origPrice: 240,
    maxPerPeriod: 1,
  },
  {
    key: 'weekly_vitality_orb',
    tier: 'weekly',
    category: 'perm_hp_15',
    rarity: 'epic',
    name: 'Heartfire Orb',
    desc: 'Permanently boosts Hero Base HP by +15 and heals to full.',
    effectBadge: 'Perm +15 Max HP',
    icon: '❤️‍🔥',
    price: 200,
    maxPerPeriod: 1,
  },
  {
    key: 'weekly_luck_tome',
    tier: 'weekly',
    category: 'perm_luck_2',
    rarity: 'epic',
    name: 'Tome of Golden Odds',
    desc: 'Permanently increases your Hero Base Luck by +2 forever.',
    effectBadge: 'Perm +2 🍀 Luck',
    icon: '📖',
    price: 210,
    maxPerPeriod: 1,
  },
];

export const MONTHLY_POOL = [
  {
    key: 'monthly_shard_hoard',
    tier: 'monthly',
    category: 'monthly_hoard',
    rarity: 'epic',
    name: 'Astral Shard Hoard',
    desc: 'Massive prestige pack: +260 Arcane Shards & +20 ⚡ Energy.',
    effectBadge: '+260 ✦ • +20 ⚡',
    icon: '💎',
    price: 300,
    maxPerPeriod: 1,
  },
  {
    key: 'monthly_starforge_core',
    tier: 'monthly',
    category: 'starforge',
    rarity: 'legendary',
    name: 'Starforge Core',
    desc: 'Permanent Ascension: +4 ATK, +3 DEF, +4 LUCK, +25 Max HP.',
    effectBadge: 'Perm All-Stats',
    icon: '☄️',
    price: 360,
    maxPerPeriod: 1,
  },
  {
    key: 'monthly_mythic_chest',
    tier: 'monthly',
    category: 'chest',
    rarity: 'legendary',
    name: 'Mythic Astral Vault',
    desc: 'Guaranteed Epic or Legendary Relic Gear (+35 Bonus Luck roll)!',
    effectBadge: 'Epic/Legendary',
    icon: '🏆',
    price: 420,
    minRarity: 'epic',
    bonusLuck: 35,
    maxPerPeriod: 1,
  },
  {
    key: 'monthly_title_sovereign',
    tier: 'monthly',
    category: 'title',
    rarity: 'legendary',
    name: 'Sovereign of Focus Title',
    desc: 'Limited monthly crown title "Sovereign of Focus".',
    effectBadge: 'Mythic Title',
    icon: '⚜️',
    price: 450,
    titleValue: 'Sovereign of Focus',
  },
  {
    key: 'monthly_spirit_aurora',
    tier: 'monthly',
    category: 'spirit',
    rarity: 'legendary',
    name: 'Aurora Celestial Spirit',
    desc: 'Limited monthly teal-gold celestial Focus Spirit skin.',
    effectBadge: 'Mythic Spirit',
    icon: '🌠',
    price: 480,
  },
  {
    key: 'monthly_lucky_crown',
    tier: 'monthly',
    category: 'lucky_crown',
    rarity: 'legendary',
    name: 'Crown of Serendipity',
    desc: 'Forges a guaranteed Legendary Charm Relic for your Hero.',
    effectBadge: 'Guaranteed Legendary',
    icon: '👑',
    price: 500,
    maxPerPeriod: 1,
  },
];

const ALL_ITEMS_BY_KEY = new Map(
  [...PERMANENT_CATALOG, ...DAILY_POOL, ...WEEKLY_POOL, ...MONTHLY_POOL].map((item) => [item.key, item])
);

export function getPeriodInfo(nowMs = Date.now()) {
  const d = new Date(nowMs);
  const dailyKey = d.toISOString().slice(0, 10);
  const monthlyKey = d.toISOString().slice(0, 7);

  // ISO-ish UTC Monday week calculation
  const utcDay = d.getUTCDay(); // 0=Sun..6=Sat
  const diffToMonday = (utcDay + 6) % 7;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diffToMonday));
  const jan1 = new Date(Date.UTC(monday.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((monday.getTime() - jan1.getTime()) / 86400_000 + 1) / 7);
  const weeklyKey = `${monday.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;

  const nextDayMs = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
  const nextWeekMs = monday.getTime() + 7 * 86400_000;
  const nextMonthMs = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);

  return {
    dailyKey,
    weeklyKey,
    monthlyKey,
    resetsInSec: {
      daily: Math.max(1, Math.floor((nextDayMs - nowMs) / 1000)),
      weekly: Math.max(1, Math.floor((nextWeekMs - nowMs) / 1000)),
      monthly: Math.max(1, Math.floor((nextMonthMs - nowMs) / 1000)),
    },
  };
}

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickRotating(pool, seedStr, count) {
  const scored = pool.map((item) => ({
    item,
    score: hashSeed(`${seedStr}:${item.key}`),
  }));
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, count).map((s) => s.item);
}

function getEffectiveDailyRerolls(db, gameProfile, dailyKey) {
  if (!gameProfile) return 0;
  if (gameProfile.daily_shop_date !== dailyKey) {
    db.prepare('UPDATE game_profiles SET daily_shop_date = ?, daily_shop_rerolls = 0 WHERE user_id = ?').run(
      dailyKey,
      gameProfile.user_id
    );
    return 0;
  }
  return gameProfile.daily_shop_rerolls || 0;
}

export function buildShopState(db, user, gameProfileRaw) {
  const profile = gameProfileRaw || ensureGameProfile(db, user.id);
  const periodInfo = getPeriodInfo();
  const rerolls = getEffectiveDailyRerolls(db, profile, periodInfo.dailyKey);

  const dailyList = pickRotating(DAILY_POOL, `daily:${periodInfo.dailyKey}:r${rerolls}`, 4);
  const weeklyList = pickRotating(WEEKLY_POOL, `weekly:${periodInfo.weeklyKey}`, 4);
  const monthlyList = pickRotating(MONTHLY_POOL, `monthly:${periodInfo.monthlyKey}`, 4);

  const unlockSet = new Set(
    db.prepare('SELECT item_key FROM user_unlocks WHERE user_id = ?').all(user.id).map((r) => r.item_key)
  );
  const purchaseRows = db.prepare('SELECT item_key, period_key, count FROM shop_purchases WHERE user_id = ?').all(user.id);
  const purchaseMap = new Map(purchaseRows.map((r) => [`${r.item_key}:${r.period_key}`, r.count]));

  const decorate = (item) => {
    const isPermanentUnlock = item.category === 'spirit' || item.category === 'title' || item.category === 'hero';
    const isStarterHero = item.key === 'hero_scholar';
    const unlocked = isPermanentUnlock && (isStarterHero || unlockSet.has(item.key));
    const equipped =
      (item.category === 'spirit' && (user.equipped_spirit || 'default') === item.key) ||
      (item.category === 'title' && user.title === item.titleValue) ||
      (item.category === 'hero' && (profile.hero_class || 'hero_scholar') === item.heroKey);

    const pKey =
      item.tier === 'daily'
        ? periodInfo.dailyKey
        : item.tier === 'weekly'
          ? periodInfo.weeklyKey
          : item.tier === 'monthly'
            ? periodInfo.monthlyKey
            : 'permanent';
    const purchasedCount = purchaseMap.get(`${item.key}:${pKey}`) || 0;
    const maxPerPeriod = item.maxPerPeriod ?? null;
    const remaining = maxPerPeriod !== null ? Math.max(0, maxPerPeriod - purchasedCount) : null;

    return {
      key: item.key,
      tier: item.tier,
      category: item.category,
      rarity: item.rarity,
      name: item.name,
      desc: item.desc,
      effectBadge: item.effectBadge,
      icon: item.icon,
      price: item.price,
      origPrice: item.origPrice,
      titleValue: item.titleValue,
      heroKey: item.heroKey,
      unlocked,
      equipped,
      maxPerPeriod,
      purchasedCount,
      remaining,
    };
  };

  return {
    periodKeys: {
      daily: periodInfo.dailyKey,
      weekly: periodInfo.weeklyKey,
      monthly: periodInfo.monthlyKey,
    },
    resetsInSec: periodInfo.resetsInSec,
    dailyRerollsUsed: rerolls,
    nextRerollCost: rerolls === 0 ? 0 : 25,
    sections: {
      daily: dailyList.map(decorate),
      weekly: weeklyList.map(decorate),
      monthly: monthlyList.map(decorate),
      permanent: PERMANENT_CATALOG.map(decorate),
    },
  };
}

export function rerollDailyShop(db, user, userStats) {
  const profile = ensureGameProfile(db, user.id);
  const periodInfo = getPeriodInfo();
  const rerolls = getEffectiveDailyRerolls(db, profile, periodInfo.dailyKey);
  const cost = rerolls === 0 ? 0 : 25;

  if (cost > 0 && user.coins < cost) {
    throw new Error(`Need ${cost} Focus Coins to reroll Daily Stock`);
  }
  if (cost > 0) {
    db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(cost, user.id);
  }
  db.prepare('UPDATE game_profiles SET daily_shop_date = ?, daily_shop_rerolls = daily_shop_rerolls + 1, updated_at = ? WHERE user_id = ?').run(
    periodInfo.dailyKey,
    Date.now(),
    user.id
  );

  const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  const refreshedProfile = db.prepare('SELECT * FROM game_profiles WHERE user_id = ?').get(user.id);
  return {
    ok: true,
    cost,
    message: cost === 0 ? 'Daily shop stock rerolled (Free)!' : `Daily stock rerolled (-${cost} 🪙)!`,
    shop: buildShopState(db, refreshedUser, refreshedProfile),
    game: buildGameState(db, refreshedUser, userStats),
  };
}

export function purchaseShopItem(db, user, userStats, itemKey) {
  const item = ALL_ITEMS_BY_KEY.get(itemKey);
  if (!item) {
    const err = new Error('Shop item not found');
    err.status = 404;
    throw err;
  }

  const profile = ensureGameProfile(db, user.id);
  const periodInfo = getPeriodInfo();
  const periodKey =
    item.tier === 'daily'
      ? periodInfo.dailyKey
      : item.tier === 'weekly'
        ? periodInfo.weeklyKey
        : item.tier === 'monthly'
          ? periodInfo.monthlyKey
          : 'permanent';

  // Ensure rotating items are currently on offer for this period
  if (item.tier === 'daily' || item.tier === 'weekly' || item.tier === 'monthly') {
    const shopState = buildShopState(db, user, profile);
    const activeSection = shopState.sections[item.tier];
    if (!activeSection.some((x) => x.key === item.key)) {
      throw new Error('This rotating offer is not currently stocked.');
    }
  }

  const isPermanentUnlock = item.category === 'spirit' || item.category === 'title' || item.category === 'hero';
  const isStarterHero = item.key === 'hero_scholar';

  // Permanent unlock/equip flow (Spirit, Title, Hero Class)
  if (isPermanentUnlock) {
    const alreadyUnlocked =
      isStarterHero ||
      Boolean(db.prepare('SELECT 1 FROM user_unlocks WHERE user_id = ? AND item_key = ?').get(user.id, item.key));
    let action = 'equipped';
    if (!alreadyUnlocked) {
      if (user.coins < item.price) throw new Error(`Need ${item.price} Focus Coins`);
      db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(item.price, user.id);
      db.prepare('INSERT INTO user_unlocks (user_id, item_key, created_at) VALUES (?, ?, ?)').run(
        user.id,
        item.key,
        Date.now()
      );
      action = 'purchased_and_equipped';
    }

    if (item.category === 'spirit') {
      db.prepare('UPDATE users SET equipped_spirit = ? WHERE id = ?').run(item.key, user.id);
    } else if (item.category === 'title' && item.titleValue) {
      db.prepare('UPDATE users SET title = ? WHERE id = ?').run(item.titleValue, user.id);
    } else if (item.category === 'hero' && item.heroKey) {
      db.prepare('UPDATE game_profiles SET hero_class = ?, updated_at = ? WHERE user_id = ?').run(
        item.heroKey,
        Date.now(),
        user.id
      );
    }

    const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    const refreshedProfile = db.prepare('SELECT * FROM game_profiles WHERE user_id = ?').get(user.id);
    return {
      ok: true,
      action,
      itemKey,
      message: action === 'equipped' ? `Equipped ${item.name}!` : `Unlocked & equipped ${item.name}!`,
      droppedItem: null,
      shop: buildShopState(db, refreshedUser, refreshedProfile),
      game: buildGameState(db, refreshedUser, userStats),
    };
  }

  // Per-period purchase limit check
  if (item.maxPerPeriod != null) {
    const rec = db
      .prepare('SELECT count FROM shop_purchases WHERE user_id = ? AND item_key = ? AND period_key = ?')
      .get(user.id, item.key, periodKey);
    if ((rec?.count || 0) >= item.maxPerPeriod) {
      throw new Error(`Sold out for this ${item.tier} reset!`);
    }
  }

  if (user.coins < item.price) {
    throw new Error(`Need ${item.price} Focus Coins`);
  }

  const rawItems = db.prepare('SELECT * FROM game_items WHERE user_id = ? AND equipped = 1').all(user.id);
  const heroStats = computeHeroStats(profile, rawItems, computeStudyBonuses(user, userStats));

  db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(item.price, user.id);

  let droppedItem = null;
  let message = `Purchased ${item.name}!`;
  const now = Date.now();

  switch (item.category) {
    case 'consumable':
      db.prepare('UPDATE users SET streak_freezes = streak_freezes + 1 WHERE id = ?').run(user.id);
      message = 'Armed +1 Streak Freeze Shield 🧊';
      break;
    case 'freeze_2':
      db.prepare('UPDATE users SET streak_freezes = streak_freezes + 2 WHERE id = ?').run(user.id);
      message = 'Armed +2 Streak Freeze Shields 🧊';
      break;
    case 'energy':
      db.prepare('UPDATE game_profiles SET energy = MIN(99, energy + 3), torches = torches + 1, updated_at = ? WHERE user_id = ?').run(now, user.id);
      message = '+3 Adventure Energy & +1 Dungeon Torch 🔥';
      break;
    case 'energy_5':
      db.prepare('UPDATE game_profiles SET energy = MIN(99, energy + 5), torches = torches + 2, updated_at = ? WHERE user_id = ?').run(now, user.id);
      message = '+5 Adventure Energy & +2 Dungeon Torches 🔥';
      break;
    case 'weekly_energy':
      db.prepare('UPDATE game_profiles SET energy = MIN(99, energy + 15), potions = potions + 3, updated_at = ? WHERE user_id = ?').run(now, user.id);
      message = '+15 Energy & +3 Healing Potions!';
      break;
    case 'luck_buff':
      db.prepare('UPDATE game_profiles SET luck_buff_charges = luck_buff_charges + 5, luck_buff_amount = MAX(luck_buff_amount, 15), updated_at = ? WHERE user_id = ?').run(now, user.id);
      message = '+15 Luck active for next 5 encounters 🍀';
      break;
    case 'luck_buff_20':
      db.prepare('UPDATE game_profiles SET luck_buff_charges = luck_buff_charges + 6, luck_buff_amount = MAX(luck_buff_amount, 20), updated_at = ? WHERE user_id = ?').run(now, user.id);
      message = '+20 Luck active for next 6 encounters ✨';
      break;
    case 'potion_heal':
      db.prepare('UPDATE game_profiles SET potions = potions + 2, hp = ?, updated_at = ? WHERE user_id = ?').run(heroStats.maxHp, now, user.id);
      message = '+2 Potions & Hero healed to Full HP 🧪';
      break;
    case 'shards_30':
      db.prepare('UPDATE game_profiles SET shards = shards + 30, updated_at = ? WHERE user_id = ?').run(now, user.id);
      message = '+30 Arcane Shards added ✦';
      break;
    case 'shards_95':
      db.prepare('UPDATE game_profiles SET shards = shards + 95, updated_at = ? WHERE user_id = ?').run(now, user.id);
      message = '+95 Arcane Shards added ✦';
      break;
    case 'monthly_hoard':
      db.prepare('UPDATE game_profiles SET shards = shards + 260, energy = MIN(99, energy + 20), updated_at = ? WHERE user_id = ?').run(now, user.id);
      message = 'Monthly Hoard: +260 ✦ Shards & +20 ⚡ Energy!';
      break;
    case 'whetstone': {
      const weapon = db.prepare("SELECT * FROM game_items WHERE user_id = ? AND equipped = 1 AND slot = 'weapon'").get(user.id);
      if (weapon && (weapon.upgrade_level || 0) < 10) {
        const nextLvl = (weapon.upgrade_level || 0) + 1;
        db.prepare('UPDATE game_items SET upgrade_level = ? WHERE id = ?').run(nextLvl, weapon.id);
        message = `Whetstone honed ${weapon.name} to +${nextLvl}! ⚒️`;
      } else {
        db.prepare('UPDATE game_profiles SET shards = shards + 35, updated_at = ? WHERE user_id = ?').run(now, user.id);
        message = 'Weapon already maxed — converted to +35 Arcane Shards ✦';
      }
      break;
    }
    case 'xp_scroll':
      db.prepare('UPDATE users SET xp = xp + 120 WHERE id = ?').run(user.id);
      db.prepare('UPDATE game_profiles SET hero_xp = hero_xp + 50, updated_at = ? WHERE user_id = ?').run(now, user.id);
      message = '+120 Study XP & +50 Hero XP gained 📜';
      break;
    case 'perm_hp_15':
      db.prepare('UPDATE game_profiles SET bonus_hp = bonus_hp + 15, hp = ?, updated_at = ? WHERE user_id = ?').run(heroStats.maxHp + 15, now, user.id);
      message = 'Permanent +15 Max HP & Full Heal ❤️‍🔥';
      break;
    case 'perm_luck_2':
      db.prepare('UPDATE game_profiles SET bonus_luck = bonus_luck + 2, updated_at = ? WHERE user_id = ?').run(now, user.id);
      message = 'Permanent +2 Hero Base Luck unlocked 📖';
      break;
    case 'starforge':
      db.prepare('UPDATE game_profiles SET bonus_atk = bonus_atk + 4, bonus_def = bonus_def + 3, bonus_luck = bonus_luck + 4, bonus_hp = bonus_hp + 25, hp = ?, updated_at = ? WHERE user_id = ?').run(heroStats.maxHp + 25, now, user.id);
      message = 'Starforge Core absorbed: +4 ATK, +3 DEF, +4 LUCK, +25 HP ☄️';
      break;
    case 'chest':
      droppedItem = generateLootItem(db, user.id, profile.floor, heroStats.luck, {
        minRarity: item.minRarity || 'uncommon',
        bonusLuck: item.bonusLuck || 0,
      });
      db.prepare('UPDATE game_profiles SET chests_opened = chests_opened + 1, updated_at = ? WHERE user_id = ?').run(now, user.id);
      message = `Opened Chest: [${droppedItem.rarity.toUpperCase()}] ${droppedItem.name}!`;
      break;
    case 'lucky_crown':
      droppedItem = generateLootItem(db, user.id, profile.floor, heroStats.luck + 40, {
        minRarity: 'legendary',
        forcedSlot: 'charm',
        forcedName: 'Crown of Serendipity',
      });
      message = 'Forged Legendary Relic: Crown of Serendipity 👑!';
      break;
    default:
      break;
  }

  db.prepare(`
    INSERT INTO shop_purchases (user_id, item_key, period_key, count, updated_at)
    VALUES (?, ?, ?, 1, ?)
    ON CONFLICT(user_id, item_key, period_key) DO UPDATE SET
      count = count + 1,
      updated_at = excluded.updated_at
  `).run(user.id, item.key, periodKey, now);

  const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  const refreshedProfile = db.prepare('SELECT * FROM game_profiles WHERE user_id = ?').get(user.id);
  return {
    ok: true,
    action: 'purchased',
    itemKey,
    message,
    droppedItem,
    shop: buildShopState(db, refreshedUser, refreshedProfile),
    game: buildGameState(db, refreshedUser, userStats),
  };
}
