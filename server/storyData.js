export const VILLAGE_WIDTH = 9;
export const VILLAGE_HEIGHT = 7;

// 9x7 Walkable Oakhaven Village Hub
// '#' pine/stone border, 'B' building facade, 'F' forge anvil, 'A' alchemy stand
// 'G' north Spire Dungeon Gate (4,0), 'N' Notice Board (2,2), '.' cobblestone plaza
export const VILLAGE_MAP = [
  '####G####',
  '#BB...BB#',
  '#.N.....#',
  '#.......#',
  '#F.....A#',
  '#BB...BB#',
  '#########',
];

export const STORY_CHAPTERS = [
  {
    chapter: 1,
    title: 'Shadows Over Oakhaven',
    floorReq: 1,
    bossFlag: 'boss_1_slain',
    villageUpgrade: 'lanterns',
    upgradeLabel: 'Town Lanterns Relit',
    synopsis:
      'A creeping Mist of Lethargy pours from the Pixel Spire, snuffing out Oakhaven lanterns. Retrieve the Bronze Key on Floor 1 and vanquish the Elder Papyrus Warden.',
    objective: 'Clear Floor 1 Boss & return to Elder Rowan',
    rewards: { coins: 45, shards: 40, xp: 100, loreId: 'lore_1' },
  },
  {
    chapter: 2,
    title: 'The Iron Syllabus',
    floorReq: 2,
    bossFlag: 'boss_2_slain',
    villageUpgrade: 'library_roof',
    upgradeLabel: 'Library Belltower Restored',
    synopsis:
      'With lanterns glowing again, Elder Rowan uncovers torn cipher pages: Malakor sealed the lower vaults behind an Iron Sentinel.',
    objective: 'Clear Floor 2 Boss & return to Elder Rowan',
    rewards: { coins: 70, shards: 65, xp: 160, loreId: 'lore_3' },
  },
  {
    chapter: 3,
    title: 'Ashes of Deadlines',
    floorReq: 3,
    bossFlag: 'boss_3_slain',
    villageUpgrade: 'astral_beacon',
    upgradeLabel: 'Spire Beacon Activated',
    synopsis:
      'Deep within Floor 3 slumbers the Crimson Deadline Wyrm, fed by broken focus and forgotten vows. Break its flame to light Oakhaven’s Astral Beacon.',
    objective: 'Clear Floor 3 Boss & return to Elder Rowan',
    rewards: { coins: 100, shards: 95, xp: 240, loreId: 'lore_5' },
  },
  {
    chapter: 4,
    title: 'The Hollow Archivist',
    floorReq: 4,
    bossFlag: 'boss_4_slain',
    villageUpgrade: 'golden_gate',
    upgradeLabel: 'Gilded North Gate',
    synopsis:
      'Floor 4 harbors the Arch-Lich of Burnout — Malakor’s own shade. Interrupt his Dark Rituals with Focus Break and reclaim the Grand Index.',
    objective: 'Clear Floor 4 Boss & return to Elder Rowan',
    rewards: { coins: 150, shards: 140, xp: 350, loreId: 'lore_7' },
  },
  {
    chapter: 5,
    title: 'Dawn Beyond the Spire',
    floorReq: 6,
    bossFlag: 'boss_6_slain',
    villageUpgrade: 'spire_crown',
    upgradeLabel: 'Eternal Dawn Crown',
    synopsis:
      'Though Malakor is freed from his trance, an ancient Echo Warden guards Floor 6. Conquer the summit to bring everlasting dawn to Oakhaven.',
    objective: 'Clear Floor 6 Boss & speak with Elder Rowan',
    rewards: { coins: 220, shards: 220, xp: 500, loreId: 'lore_8' },
  },
];

export const LORE_CODEX = [
  {
    id: 'lore_1',
    title: 'I. The Still Belltower',
    text: 'Before the Mist descended, Oakhaven’s belltower chimed whenever a scholar mastered a theorem, filling the valley with amber warmth.',
  },
  {
    id: 'lore_2',
    title: 'II. Malakor’s Wager',
    text: 'First Archivist Malakor feared forgetting everything he loved. He built the Pixel Spire to freeze time itself — unaware stillness breeds decay.',
  },
  {
    id: 'lore_3',
    title: 'III. Iron & Patience',
    text: 'Ancient sentinels do not yield to reckless strikes. Watch how a foe breathes: when a sentinel raises its iron shell, only focused insight shatters it.',
  },
  {
    id: 'lore_4',
    title: 'IV. Herb of Moonlit Clarity',
    text: 'Lyra’s notebooks reveal Moonpetal grows only near cracked dungeon walls — feeding on wandering torchlight and quiet determination.',
  },
  {
    id: 'lore_5',
    title: 'V. The Crimson Wyrm',
    text: 'Born from panic before unfinished tasks, the Wyrm grows bolder if you merely cower. Strike through its ritual before it feasts.',
  },
  {
    id: 'lore_6',
    title: 'VI. Pip’s Secret Ink',
    text: 'Spire walls bearing subtle hairline fissures conceal old vault chambers left behind by fleeing apprentices.',
  },
  {
    id: 'lore_7',
    title: 'VII. Malakor’s Apology',
    text: 'Scrawled beneath Floor 4: "Focus is not trapping a moment forever — it is caring enough to take the next step while the lantern still burns."',
  },
  {
    id: 'lore_8',
    title: 'VIII. Dawn Over Oakhaven',
    text: 'With the Spire’s heart harmonized, your real-world focus and Oakhaven’s lantern burn as a single flame.',
  },
];

export const DUNGEON_RIDDLES = [
  {
    id: 'riddle_silence',
    title: 'Pillar of Unbroken Focus',
    prompt: 'Carved in glowing runes: "The more you feed me distractions, the weaker I grow; speak my name and I break."',
    hint: 'Intuition whispers: Silence shatters the instant someone speaks.',
    options: ['Silence', 'Shadow', 'Torchlight'],
    correctIndex: 0,
    loreId: 'lore_2',
  },
  {
    id: 'riddle_candle',
    title: 'Runic Lantern Obelisk',
    prompt: 'Three sigils orbit a cold plinth: "My life is measured in hours; I serve you by being devoured. Thin, I am quick; fat, I am slow."',
    hint: 'Intuition whispers: Scholars study beside melted wax.',
    options: ['Hourglass', 'Candle', 'Brazier'],
    correctIndex: 1,
    loreId: 'lore_4',
  },
  {
    id: 'riddle_map',
    title: 'Cartographer’s Monolith',
    prompt: 'Pip’s ink notes point here: "I hold cities without houses, mountains without stone, and rivers without a drop of water."',
    hint: 'Intuition whispers: Every explorer carries one in their satchel.',
    options: ['Compass', 'Map', 'Keystone'],
    correctIndex: 1,
    loreId: 'lore_6',
  },
  {
    id: 'riddle_echo',
    title: 'Hollow Spire Plinth',
    prompt: 'A brass voice hums: "I speak without a mouth and hear without ears. No body have I, yet focus brings me clear."',
    hint: 'Intuition whispers: Shout into a deep stone hall.',
    options: ['Phantom', 'Echo', 'Breeze'],
    correctIndex: 1,
    loreId: 'lore_7',
  },
  {
    id: 'riddle_knowledge',
    title: 'Archivist’s Ledger',
    prompt: 'Gold letters shimmer: "The more of me you share with another scholar, the larger I grow inside your own keep."',
    hint: 'Intuition whispers: Elder Rowan tends a whole tower of it.',
    options: ['Knowledge', 'Gold', 'Obsidian'],
    correctIndex: 0,
    loreId: 'lore_1',
  },
  {
    id: 'riddle_key',
    title: 'Gated Rune Lock',
    prompt: 'Three bronze teeth turn in place: "No teeth for biting do I own, yet iron gates yield when I am shown."',
    hint: 'Intuition whispers: Look for what opens the Boss Sanctum.',
    options: ['Sword', 'Key', 'Shield'],
    correctIndex: 1,
    loreId: 'lore_3',
  },
];

export const SIDE_QUESTS = [
  {
    id: 'quest_bram_tongs',
    npcId: 'bram',
    title: 'Runic Tongs of Oakhaven',
    desc: 'Uncover Bram’s lost Runic Tongs hidden inside a Floor 2+ Secret Vault Chest.',
    reqFlag: 'bram_tongs_found',
    reward: { coins: 60, shards: 100, trust: 30, xp: 90 },
    perk: 'Trusted Perk: -20% Forge & Reforge costs!',
  },
  {
    id: 'quest_lyra_herbs',
    npcId: 'lyra',
    title: 'Moonpetal Panacea',
    desc: 'Gather 3 Moonpetal Herbs (🌿) growing inside the Pixel Spire for Lyra.',
    reqHerbs: 3,
    reward: { coins: 50, shards: 90, trust: 30, xp: 85 },
    perk: 'Trusted Perk: +20% Healing from Potions!',
  },
  {
    id: 'quest_pip_compass',
    npcId: 'pip',
    title: 'Pip’s Starlight Compass',
    desc: 'Recover Pip’s Starlight Compass on Floor 3+ (Boss or Secret Vault).',
    reqFlag: 'pip_compass_found',
    reward: { coins: 70, shards: 110, trust: 35, xp: 110 },
    perk: 'Trusted Perk: +1 Permanent Fog-of-War Torch Vision!',
  },
];

export const BOUNTY_DEFINITIONS = [
  {
    id: 'bounty_slayer',
    title: 'Spire Patrol Bounty',
    desc: 'Defeat 3 monsters inside the Pixel Spire.',
    target: 3,
    reward: { coins: 35, shards: 30, trust: 12 },
  },
  {
    id: 'bounty_seeker',
    title: 'Intuition Seeker',
    desc: 'Uncover 1 Cracked Secret Wall or Disarm 1 Trap using Search.',
    target: 1,
    reward: { coins: 40, shards: 35, trust: 14 },
  },
  {
    id: 'bounty_riddle',
    title: 'Runic Scholar',
    desc: 'Solve 1 Runic Riddle Pillar in the Spire.',
    target: 1,
    reward: { coins: 45, shards: 40, trust: 15 },
  },
];

export const NPCS = [
  {
    id: 'rowan',
    name: 'Elder Rowan',
    role: 'Village Archivist',
    x: 4,
    y: 2,
    spriteKey: 'npc_rowan',
    trustedPerk: 'Archivist Blessing (+15 Focus Charge on rest)',
  },
  {
    id: 'bram',
    name: 'Bram Ironhand',
    role: 'Master Blacksmith',
    x: 2,
    y: 4,
    spriteKey: 'npc_bram',
    trustedPerk: '-20% Coin & Shard cost on Gear Forge & Reforge',
  },
  {
    id: 'lyra',
    name: 'Lyra Thorn',
    role: 'Moonpetal Alchemist',
    x: 6,
    y: 4,
    spriteKey: 'npc_lyra',
    trustedPerk: 'Potions restore +20% extra HP & cleanse toxins',
  },
  {
    id: 'pip',
    name: 'Pip Swiftfoot',
    role: 'Spire Scout',
    x: 6,
    y: 2,
    spriteKey: 'npc_pip',
    trustedPerk: '+1 Permanent Dungeon Torch Vision Radius',
  },
];

export function trustRankLabel(score) {
  if (score >= 60) return 'Sworn Ally';
  if (score >= 25) return 'Trusted';
  if (score >= 10) return 'Acquaintance';
  return 'Stranger';
}

export function getNpcDialogue(npcId, ctx) {
  const { chapter, flags, affinity, quests, herbs, shards, coins, heroStats, equippedWeapon } = ctx;
  const currentChap = STORY_CHAPTERS[Math.min(STORY_CHAPTERS.length - 1, chapter - 1)];
  const bossDone = Boolean(flags[currentChap.bossFlag]);
  const allChaptersDone = chapter > STORY_CHAPTERS.length || (chapter === STORY_CHAPTERS.length && Boolean(flags.chapter_5_claimed));

  if (npcId === 'rowan') {
    const options = [];
    if (!allChaptersDone && bossDone) {
      options.push({
        id: 'advance_chapter',
        label: `Complete Chapter ${currentChap.chapter}: ${currentChap.title}`,
        desc: `Claim +${currentChap.rewards.coins}🪙, +${currentChap.rewards.shards}✦ & upgrade Oakhaven (${currentChap.upgradeLabel})!`,
        style: 'primary',
      });
    }
    options.push({
      id: 'rowan_blessing',
      label: 'Scholar’s Rest & Blessing (Free)',
      desc: `Restore HP to ${heroStats.maxHp} and charge Focus Burst to 100%.`,
      style: 'tab',
    });
    options.push({
      id: 'rowan_lore',
      label: 'Ask about Malakor & the Spire (+2 Trust)',
      desc: 'Discuss the mist and your study discipline.',
      style: 'badge',
    });

    const greeting = allChaptersDone
      ? `Dawn shines steadily over Oakhaven thanks to you, ${ctx.displayName}. Your focus has healed both Spire and hearth.`
      : bossDone
        ? `Marvelous! You felled the guardian of Floor ${currentChap.floorReq}! Let us record this triumph in Oakhaven’s Chronicle.`
        : `Welcome back, ${ctx.displayName}. Chapter ${currentChap.chapter} ("${currentChap.title}") awaits on Floor ${currentChap.floorReq}. Remember: Focus Purity sharpens your Intuition to spot traps and cracked walls!`;

    return { npcId, greeting, options };
  }

  if (npcId === 'bram') {
    const qState = quests.find((q) => q.id === 'quest_bram_tongs');
    const bramTrusted = (affinity.bram || 0) >= 25;
    const disc = bramTrusted ? 0.8 : 1;
    const reforgeShards = Math.round(25 * disc);
    const reforgeCoins = Math.round(25 * disc);

    const options = [];
    if (!qState) {
      options.push({
        id: 'accept_bram_tongs',
        label: 'Accept Quest: Runic Tongs of Oakhaven',
        desc: 'Find Bram’s tongs inside a Secret Vault Chest on Floor 2+.',
        style: 'primary',
      });
    } else if (!qState.claimed && flags.bram_tongs_found) {
      options.push({
        id: 'turnin_bram_tongs',
        label: 'Deliver Runic Tongs (+60🪙, +100✦, +30 Trust)',
        desc: 'Unlocks Trusted Blacksmith discount (-20% Forge & Reforge)!',
        style: 'primary',
      });
    }

    if (equippedWeapon) {
      options.push({
        id: 'craft_reforge',
        label: `Reforge ${equippedWeapon.name} (${reforgeShards}✦ + ${reforgeCoins}🪙)`,
        desc: `Re-rolls bonus stats & affix with ${heroStats.luck} Luck!${bramTrusted ? ' (20% Trusted Discount)' : ''}`,
        style: 'tab',
        craftKey: 'craft_reforge',
        targetItemId: equippedWeapon.id,
        disabled: shards < reforgeShards || coins < reforgeCoins,
      });
    }

    options.push({
      id: 'bram_spar',
      label: 'Ask Combat Technique Tips (+2 Trust)',
      desc: 'Learn how Parry counters Crushing Blows and Focus Break shatters Shells.',
      style: 'badge',
    });

    const greeting = bramTrusted
      ? `Ha! These Runic Tongs sing again, partner. All Forging and Reforging gets a 20% family discount from here on.`
      : `Anvils stay cold without good steel! Mind enemy intents down there — mash strikes against an Iron Shell and you'll crack your own knuckles.`;

    return { npcId, greeting, options };
  }

  if (npcId === 'lyra') {
    const qState = quests.find((q) => q.id === 'quest_lyra_herbs');
    const lyraTrusted = (affinity.lyra || 0) >= 25;
    const options = [];

    if (!qState) {
      options.push({
        id: 'accept_lyra_herbs',
        label: 'Accept Quest: Moonpetal Panacea',
        desc: 'Bring 3 Moonpetal Herbs (🌿) from the Spire.',
        style: 'primary',
      });
    } else if (!qState.claimed && herbs >= 3) {
      options.push({
        id: 'turnin_lyra_herbs',
        label: 'Deliver 3 Moonpetal Herbs (+50🪙, +90✦, +30 Trust)',
        desc: 'Permanently boosts Potion Healing by +20%!',
        style: 'primary',
      });
    }

    options.push({
      id: 'brew_potion',
      label: `Brew 2 Healing Potions (1🌿 + 10✦)`,
      desc: 'Restores 55% HP (75% at Trusted) and cleanses Venom in combat.',
      style: 'tab',
      craftKey: 'brew_potion',
      disabled: herbs < 1 || shards < 10,
    });
    options.push({
      id: 'brew_torch',
      label: `Craft 2 Dungeon Torches (15✦)`,
      desc: 'Keep your Fog-of-War vision bright deeper in the Spire.',
      style: 'tab',
      craftKey: 'brew_torch',
      disabled: shards < 15,
    });
    options.push({
      id: 'brew_intuition',
      label: `Brew Clarity Tonic (2🌿 + 20✦)`,
      desc: 'Grants +20 Luck & Intuition Buff across your next 6 encounters.',
      style: 'badge',
      craftKey: 'brew_intuition',
      disabled: herbs < 2 || shards < 20,
    });

    const greeting = lyraTrusted
      ? `Moonpetal blooms brightly because of you! Every potion I hand you now packs an extra restorative surge.`
      : `Torches gutter fast in the lower mist, and spiders poison the careless. Gather Moonpetal Herbs (🌿) for fresh brews anytime.`;

    return { npcId, greeting, options };
  }

  // Pip Swiftfoot + Notice Board Bounties
  const qState = quests.find((q) => q.id === 'quest_pip_compass');
  const pipTrusted = (affinity.pip || 0) >= 25;
  const options = [];

  if (!qState) {
    options.push({
      id: 'accept_pip_compass',
      label: 'Accept Quest: Pip’s Starlight Compass',
      desc: 'Recover Pip’s compass from Floor 3+ (Boss or Secret Vault).',
      style: 'primary',
    });
  } else if (!qState.claimed && flags.pip_compass_found) {
    options.push({
      id: 'turnin_pip_compass',
      label: 'Return Starlight Compass (+70🪙, +110✦, +35 Trust)',
      desc: 'Unlocks +1 Permanent Torch Vision Radius in all dungeons!',
      style: 'primary',
    });
  }

  for (const bDef of BOUNTY_DEFINITIONS) {
    const activeB = quests.find((q) => q.id === bDef.id && !q.claimed);
    if (!activeB) {
      options.push({
        id: `accept_${bDef.id}`,
        label: `Bounty: ${bDef.title}`,
        desc: `${bDef.desc} (Reward: +${bDef.reward.coins}🪙, +${bDef.reward.shards}✦)`,
        style: 'tab',
      });
    } else if (activeB.progress >= activeB.target) {
      options.push({
        id: `claim_${bDef.id}`,
        label: `Claim Bounty: ${bDef.title}`,
        desc: `Completed (${activeB.progress}/${activeB.target}) — claim +${bDef.reward.coins}🪙 & +${bDef.reward.shards}✦!`,
        style: 'primary',
      });
    }
  }

  options.push({
    id: 'pip_secret_tip',
    label: 'Ask Scout Advice (+2 Trust)',
    desc: 'Learn how Intuition reveals Cracked Secret Walls & Traps.',
    style: 'badge',
  });

  const greeting = pipTrusted
    ? `With that Starlight Compass back, you see a whole stride farther in the gloom! Check my Notice Board bounties whenever you head down.`
    : `Spot a wall with a hairline crack? Use Search right beside it — half the best relics in the Spire sit behind false brick!`;

  return { npcId, greeting, options };
}
