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

export const PARTY_ALLIES = [
  {
    id: 'ally_kaelen',
    name: 'Sir Kaelen',
    title: 'Iron Vanguard of Oakhaven',
    role: 'Vanguard Tank & Shieldbreaker',
    icon: '🛡️',
    spriteKey: 'hero_knight',
    recruitCostShards: 0,
    recruitReqLabel: 'Swear the Vanguard Oath (Free in Oakhaven)',
    lore: 'Former Captain of the Spire Watch who held the Moss Gate alone for three nights when Malakor’s Shadow Mist descended.',
    passiveLabel: '+15 Max HP & +3 DEF while in active party',
    passiveBonuses: { atk: 2, def: 3, hp: 15, luck: 0, crit: 0 },
    skillName: 'Aegis Shieldbreaker',
    skillIcon: '🛡️',
    skillDesc: 'Deals 1.25× ATK physical damage, shatters 2 Enemy Guard Shields & grants Hero +35% DEF Ward for 1 turn.',
    finisherName: 'Dawnbreaker Cross-Slash',
    finisherDesc: 'Hero & Sir Kaelen converge in a twin solar cross-cleave for 2.75× ATK true critical damage, shattering all shields!',
  },
  {
    id: 'ally_lyra',
    name: 'Lyra Thorn',
    title: 'Moonpetal Combat Alchemist',
    role: 'Alchemical Healer & Catalyst',
    icon: '🧪',
    spriteKey: 'npc_lyra',
    recruitCostShards: 35,
    recruitNpcId: 'lyra',
    recruitTrustReq: 10,
    recruitReqLabel: '10+ Lyra Trust or 35✦ Shards for Field Satchel',
    lore: 'Oakhaven’s master apothecary who distills starlight and moonpetal into volatile battlefield catalysts.',
    passiveLabel: '+10 LUCK & +20% Potion Healing while in active party',
    passiveBonuses: { atk: 1, def: 1, hp: 10, luck: 10, crit: 2 },
    skillName: 'Volatile Starlight Flask',
    skillIcon: '🧪',
    skillDesc: 'Restores 28% Max HP, cleanses Venom, shatters 1 Enemy Shield & inflicts 2 turns of Vulnerable (+50% DMG taken).',
    finisherName: 'Eclipse Supernova Elixir',
    finisherDesc: 'Lyra hurls a prismatic catalyst while you detonate it with pure Focus for 2.6× ATK arcane damage + 20% HP heal!',
  },
  {
    id: 'ally_pip',
    name: 'Pip Swiftfoot',
    title: 'Starlight Ranger & Scout',
    role: 'Flanking Striker & Trickster',
    icon: '🏹',
    spriteKey: 'npc_pip',
    recruitCostShards: 35,
    recruitNpcId: 'pip',
    recruitTrustReq: 10,
    recruitReqLabel: '10+ Pip Trust or 35✦ Shards for Grapnel Gear',
    lore: 'Nimble Spire cartographer whose grappling hook and starlight arrows expose every blind spot in the gloom.',
    passiveLabel: '+8% CRIT & +4 ATK while in active party',
    passiveBonuses: { atk: 4, def: 0, hp: 8, luck: 6, crit: 8 },
    skillName: 'Grappling Hook Flank',
    skillIcon: '🪝',
    skillDesc: 'Deals 1.2× ATK piercing arrow damage, shatters 1 Enemy Shield & pulls Hero into Flanking Stance (2 turns: +45% Dodge & Guaranteed Crit)!',
    finisherName: 'Phantom Arrow Storm',
    finisherDesc: 'Pip rains 12 starlight arrows pinning the foe’s shadow while you deliver a lethal backstab execution (2.85× ATK)!',
  },
  {
    id: 'ally_vespera',
    name: 'Vespera',
    title: 'Astral Chronomancer',
    role: 'Arcane Time-Weaver',
    icon: '⏳',
    spriteKey: 'hero_mage',
    recruitCostShards: 50,
    recruitFloorReq: 2,
    recruitReqLabel: 'Reach Floor 2+ or 50✦ Shards to Anchor Chrono-Sigil',
    lore: 'An ethereal scholar caught between ticks of the Great Astrolabe who bends time around disciplined minds.',
    passiveLabel: '+5 ATK, +6 LUCK & +15% Finisher Power while in active party',
    passiveBonuses: { atk: 5, def: 1, hp: 10, luck: 6, crit: 5 },
    skillName: 'Chrono-Stasis Sigil',
    skillIcon: '⏳',
    skillDesc: 'Deals 1.25× ATK astral damage, shatters 2 Enemy Guard Shields & surges +25% Focus Charge to the Hero!',
    finisherName: 'Chrono Singularity Collapse',
    finisherDesc: 'Freezes time across the arena and collapses 7 delayed arcane strikes simultaneously for 3.0× ATK devastation!',
  },
];

export const MYTHIC_SIDE_STORIES = [
  {
    id: 'story_belltower',
    title: 'The Sunken Belltower of Oakhaven',
    subtitle: 'Chronicle of the Dawnchime',
    icon: '🔔',
    npcName: 'Elder Rowan & Sir Kaelen',
    synopsis: 'Beneath Oakhaven’s flooded roots, an ancient bronze bell tolls only when a scholar reaches true stillness. Descend the sunken steps and awaken the First Archivist’s blade.',
    mythicReward: {
      slot: 'weapon',
      name: 'Dawnchime Astral Blade',
      icon: '🗡️',
      spriteKey: 'sword',
      rarity: 'mythic',
      affix: 'Mythic Dawn-Forged',
      level: 5,
      atk: 34,
      def: 4,
      hp: 25,
      luck: 14,
      crit: 16,
      passiveDesc: 'Critical & Flanking strikes shatter +1 extra Enemy Guard Shield.',
    },
    acts: [
      {
        act: 1,
        title: 'Act I: Echoes Beneath the Well',
        narrative: 'Water laps at the spiral stair under Oakhaven’s dry well. Runic sluice gates block the lower sanctum where the bronze bell slumbers.',
        choices: [
          {
            id: 'bell_act1_torch',
            label: 'Dive through the flooded arch with a blazing Rune-Torch',
            outcome: 'You brave the freezing currents and force the bronze lever from within (+25✦ Shards, +35 Hero XP)!',
            shards: 25,
            xp: 35,
          },
          {
            id: 'bell_act1_glyphs',
            label: 'Decipher the hydraulic drainage glyphs carved in the stone',
            outcome: 'Your scholar’s intuition aligns the three water-runes, draining the staircase dry (+25✦ Shards, +35 Hero XP)!',
            shards: 25,
            xp: 35,
          },
        ],
      },
      {
        act: 2,
        title: 'Act II: The Bell-Keeper’s Phantom',
        narrative: 'A spectral sentinel clad in verdigris armor materializes before the belfry doors, raising a resonating halberd to test your resolve.',
        choices: [
          {
            id: 'bell_act2_duel',
            label: 'Cross blades in an honorable vanguard duel of parries',
            outcome: 'Three ringing parries shatter the phantom’s doubt. He bows and parts the bronze doors (+30✦ Shards, +45 Hero XP)!',
            shards: 30,
            xp: 45,
          },
          {
            id: 'bell_act2_oath',
            label: 'Recite the First Archivist’s Oath of Unbroken Focus',
            outcome: 'The ancient words echo through the vault; the sentinel salutes a true heir of Oakhaven (+30✦ Shards, +45 Hero XP)!',
            shards: 30,
            xp: 45,
          },
        ],
      },
      {
        act: 3,
        title: 'Act III: Ringing the Dawn Chime',
        narrative: 'Resting inside the silent bell is a star-metal hilt wrapped in shadow mist. One resonant toll will forge the blade anew.',
        choices: [
          {
            id: 'bell_act3_strike',
            label: 'Strike the Great Bell with a full Focus Surge',
            outcome: 'A golden shockwave purges the mist and crystallizes the Mythic Dawnchime Astral Blade in your grasp!',
            shards: 50,
            xp: 80,
          },
          {
            id: 'bell_act3_harmonize',
            label: 'Harmonize the bell’s chord with Elder Rowan’s staff',
            outcome: 'Pure harmonic light condenses along the fuller, forging the Mythic Dawnchime Astral Blade!',
            shards: 50,
            xp: 80,
          },
        ],
      },
    ],
  },
  {
    id: 'story_starforged',
    title: 'Bram’s Star-Forged Oath',
    subtitle: 'Chronicle of the Unbreakable Aegis',
    icon: '⚒️',
    npcName: 'Bram Ironhand',
    synopsis: 'Blacksmith Bram reveals a fallen meteorite core hidden beneath his anvil since the night the Spire fell. Help him stoke star-fire to forge a Mythic bulwark.',
    mythicReward: {
      slot: 'armor',
      name: 'Aegis of the First Archivist',
      icon: '🛡️',
      spriteKey: 'plate',
      rarity: 'mythic',
      affix: 'Mythic Star-Forged',
      level: 5,
      atk: 8,
      def: 26,
      hp: 110,
      luck: 12,
      crit: 6,
      passiveDesc: 'Parry & Ward reflects +40% bonus counter-damage and shatters 2 Shields.',
    },
    acts: [
      {
        act: 1,
        title: 'Act I: The Cold Meteorite',
        narrative: 'Ordinary coal cannot melt astral iron. Bram wipes sweat from his brow as the star-ore glows with a stubborn indigo chill.',
        choices: [
          {
            id: 'star_act1_shards',
            label: 'Infuse crystalline Focus Shards directly into the furnace',
            outcome: 'The forge roars with sapphire star-fire as the meteorite begins to yield (+25✦ Shards, +35 Hero XP)!',
            shards: 25,
            xp: 35,
          },
          {
            id: 'star_act1_bellows',
            label: 'Pump the twin runic bellows with relentless rhythm',
            outcome: 'Your steady cadence drives the hearth to white-hot brilliance (+25✦ Shards, +35 Hero XP)!',
            shards: 25,
            xp: 35,
          },
        ],
      },
      {
        act: 2,
        title: 'Act II: Tempering in Shadow Mist',
        narrative: 'Drawn by the ringing hammer, wraiths of the Spire press against the smithy shutters while the breastplate is still malleable.',
        choices: [
          {
            id: 'star_act2_guard',
            label: 'Stand guard at the anvil and parry every shadow tendril',
            outcome: 'Not a single spark is lost while Bram hammers the pauldrons into form (+30✦ Shards, +45 Hero XP)!',
            shards: 30,
            xp: 45,
          },
          {
            id: 'star_act2_runes',
            label: 'Inscribe counter-hex wards along the glowing steel rim',
            outcome: 'The wraiths recoil from the blazing sigils etched into the plate (+30✦ Shards, +45 Hero XP)!',
            shards: 30,
            xp: 45,
          },
        ],
      },
      {
        act: 3,
        title: 'Act III: The Unbreakable Bulwark',
        narrative: 'The star-metal armor awaits its final quench to lock in its mythic resilience.',
        choices: [
          {
            id: 'star_act3_elixir',
            label: 'Quench the white-hot breastplate in Moonpetal dew',
            outcome: 'Steam rises like aurora light — the Mythic Aegis of the First Archivist is yours!',
            shards: 50,
            xp: 80,
          },
          {
            id: 'star_act3_crest',
            label: 'Stamp the Golden Oak Crest over the heart-plate',
            outcome: 'The crest flares with undying resolve — the Mythic Aegis of the First Archivist is forged!',
            shards: 50,
            xp: 80,
          },
        ],
      },
    ],
  },
  {
    id: 'story_eclipse',
    title: 'Lyra’s Eclipse Panacea',
    subtitle: 'Chronicle of the Chrono-Hourglass',
    icon: '⏳',
    npcName: 'Lyra Thorn & Vespera',
    synopsis: 'A rare lunar eclipse aligns over the Pixel Spire, allowing Lyra and Vespera to trap crystallized time inside an astral hourglass charm.',
    mythicReward: {
      slot: 'charm',
      name: 'Chrono-Hourglass of Oakhaven',
      icon: '⏳',
      spriteKey: 'hourglass',
      rarity: 'mythic',
      affix: 'Mythic Time-Woven',
      level: 5,
      atk: 12,
      def: 8,
      hp: 45,
      luck: 28,
      crit: 14,
      passiveDesc: 'Grants +10 bonus Focus Charge on Tactical Dash & +15% Finisher damage.',
    },
    acts: [
      {
        act: 1,
        title: 'Act I: Gathering Twilight Spores',
        narrative: 'Under the silver eclipse, bioluminescent petals open for only twelve breaths along the Spire’s outer terrace.',
        choices: [
          {
            id: 'ecl_act1_climb',
            label: 'Vault across the crumbling parapet with Pip’s grapnel',
            outcome: 'You snatch three pristine eclipse blossoms before the petals close (+25✦ Shards, +35 Hero XP)!',
            shards: 25,
            xp: 35,
          },
          {
            id: 'ecl_act1_distill',
            label: 'Capture the reflected moonlight in Lyra’s silver condenser',
            outcome: 'Pure lunar essence fills the phial with shimmering silver sand (+25✦ Shards, +35 Hero XP)!',
            shards: 25,
            xp: 35,
          },
        ],
      },
      {
        act: 2,
        title: 'Act II: The Alchemist’s Crucible',
        narrative: 'Time itself warps around Lyra’s cauldron; bubbles float backward as Vespera weaves a containment sigil.',
        choices: [
          {
            id: 'ecl_act2_anchor',
            label: 'Anchor the temporal vortex with your disciplined focus',
            outcome: 'The swirling sands obey your cadence and settle into golden harmony (+30✦ Shards, +45 Hero XP)!',
            shards: 30,
            xp: 45,
          },
          {
            id: 'ecl_act2_catalyst',
            label: 'Drop a charged Arcane Shard into the eye of the crucible',
            outcome: 'The reaction crystallizes into indestructible star-glass (+30✦ Shards, +45 Hero XP)!',
            shards: 30,
            xp: 45,
          },
        ],
      },
      {
        act: 3,
        title: 'Act III: Crystallized Eternity',
        narrative: 'The hourglass frame is sealed. Every grain that falls sharpens reflexes and bends fortune toward its bearer.',
        choices: [
          {
            id: 'ecl_act3_turn',
            label: 'Invert the hourglass to awaken its first temporal pulse',
            outcome: 'Time slows around your fingertips — claimed the Mythic Chrono-Hourglass of Oakhaven!',
            shards: 50,
            xp: 80,
          },
          {
            id: 'ecl_act3_bless',
            label: 'Bind the hourglass to your scholar’s compass chain',
            outcome: 'Fortune and precision surge together — claimed the Mythic Chrono-Hourglass of Oakhaven!',
            shards: 50,
            xp: 80,
          },
        ],
      },
    ],
  },
  {
    id: 'story_phoenix',
    title: 'The Astral Phoenix’s Rebirth',
    subtitle: 'Chronicle of Solaria',
    icon: '🦅',
    npcName: 'Pip Swiftfoot & Elder Rowan',
    synopsis: 'High in the Astral Sanctum, a petrified ember-egg of the First Scholar’s familiar awaits reawakening through deeds of valor and wisdom.',
    mythicReward: {
      slot: 'companion',
      name: 'Solaria, Mythic Astral Phoenix',
      icon: '🦅',
      spriteKey: 'pet_dragon',
      rarity: 'mythic',
      affix: 'Mythic Celestial',
      level: 5,
      atk: 24,
      def: 12,
      hp: 60,
      luck: 24,
      crit: 14,
      passiveDesc: 'Awakens Stage III Mythic Familiar aura and empowers Dual-Tech Finishers.',
    },
    acts: [
      {
        act: 1,
        title: 'Act I: The Petrified Cinder',
        narrative: 'Found atop a shattered observatory spire, the stone egg still radiates a faint heartbeat beneath a crust of ash.',
        choices: [
          {
            id: 'phx_act1_hearth',
            label: 'Nestle the ember-egg beside Oakhaven’s restored hearth',
            outcome: 'Hairline veins of golden fire spiderweb across the shell (+25✦ Shards, +35 Hero XP)!',
            shards: 25,
            xp: 35,
          },
          {
            id: 'phx_act1_codex',
            label: 'Read aloud from the ancient Lore Codex of the Spire',
            outcome: 'The familiar recognizes the cadence of scholars and chirps from within (+25✦ Shards, +35 Hero XP)!',
            shards: 25,
            xp: 35,
          },
        ],
      },
      {
        act: 2,
        title: 'Act II: Wings of Starlight',
        narrative: 'The shell parts in a cascade of harmless sparks, revealing a fledgling phoenix with feathers of woven aurora.',
        choices: [
          {
            id: 'phx_act2_flight',
            label: 'Guide Solaria on a scouting flight above the Spire canopy',
            outcome: 'Her keen eyes map hidden currents of magic across the valley (+30✦ Shards, +45 Hero XP)!',
            shards: 30,
            xp: 45,
          },
          {
            id: 'phx_act2_pact',
            label: 'Share a drop of Focus Elixir to seal a familiar’s bond',
            outcome: 'Solaria perches on your shoulder, enveloping you in warm ward-light (+30✦ Shards, +45 Hero XP)!',
            shards: 30,
            xp: 45,
          },
        ],
      },
      {
        act: 3,
        title: 'Act III: Ascension of Solaria',
        narrative: 'Spreading her full celestial wings, Solaria pledges to fight beside you through every shadow of the Spire.',
        choices: [
          {
            id: 'phx_act3_soar',
            label: 'Unleash a synchronized sky-dive flare over Oakhaven',
            outcome: 'Solaria ascends in radiant splendor — claimed Mythic Companion: Solaria, Astral Phoenix!',
            shards: 50,
            xp: 80,
          },
          {
            id: 'phx_act3_crown',
            label: 'Name her Guardian Familiar of the Oakhaven Chronicle',
            outcome: 'Her plumage blazes with mythic power — claimed Mythic Companion: Solaria, Astral Phoenix!',
            shards: 50,
            xp: 80,
          },
        ],
      },
    ],
  },
];

export const HEROIC_DEEDS = [
  {
    id: 'deed_shieldbreaker',
    title: 'Shatterer of Iron',
    icon: '🛡️',
    desc: 'Shatter 2 Enemy Guard Shields in combat using Focus Break, Flanking Strikes, or Ally Assists.',
    statKey: 'shieldsBroken',
    target: 2,
    reward: { shards: 60, coins: 40, bonusAtk: 2, bonusDef: 0, bonusHp: 0, bonusLuck: 0 },
    perkLabel: '+2 Permanent ATK & Title: Shieldbreaker',
    heroTitle: 'Shieldbreaker',
  },
  {
    id: 'deed_duelist',
    title: 'Phantom Step Duelist',
    icon: '💨',
    desc: 'Execute 2 Tactical Dash / Sidestep maneuvers in combat to gain Evasion & Flanking Backstabs.',
    statKey: 'dashesUsed',
    target: 2,
    reward: { shards: 60, coins: 40, bonusAtk: 1, bonusDef: 0, bonusHp: 0, bonusLuck: 4 },
    perkLabel: '+1 ATK, +4 LUCK & Title: Phantom Blade',
    heroTitle: 'Phantom Blade',
  },
  {
    id: 'deed_finisher',
    title: 'Master of Ultimate Finishers',
    icon: '🌟',
    desc: 'Unleash 1 Ultimate Finisher or Dual-Tech Execution in combat.',
    statKey: 'finishersUsed',
    target: 1,
    reward: { shards: 90, coins: 60, bonusAtk: 3, bonusDef: 0, bonusHp: 10, bonusLuck: 0 },
    perkLabel: '+3 Permanent ATK, +10 HP & Title: Astral Executor',
    heroTitle: 'Astral Executor',
  },
  {
    id: 'deed_commander',
    title: 'Vanguard Party Commander',
    icon: '🤝',
    desc: 'Call upon your active Recruited Party Ally for 2 Ally Assist maneuvers in battle.',
    statKey: 'allyAssistsUsed',
    target: 2,
    reward: { shards: 75, coins: 50, bonusAtk: 0, bonusDef: 2, bonusHp: 15, bonusLuck: 0 },
    perkLabel: '+15 Permanent Max HP, +2 DEF & Title: Oakhaven Commander',
    heroTitle: 'Oakhaven Commander',
  },
  {
    id: 'deed_parry',
    title: 'Unyielding Aegis',
    icon: '⚔️',
    desc: 'Trigger 1 Perfect Parry or Guard Ward against an enemy assault.',
    statKey: 'perfectParries',
    target: 1,
    reward: { shards: 65, coins: 45, bonusAtk: 0, bonusDef: 3, bonusHp: 10, bonusLuck: 0 },
    perkLabel: '+3 Permanent DEF, +10 HP & Title: Iron Bulwark',
    heroTitle: 'Iron Bulwark',
  },
  {
    id: 'deed_mythic',
    title: 'Seeker of Mythic Relics',
    icon: '👑',
    desc: 'Complete all 3 Acts of any Mythic Side Story to forge a Mythic Relic.',
    statKey: 'mythicStoriesCompleted',
    target: 1,
    reward: { shards: 120, coins: 80, bonusAtk: 2, bonusDef: 2, bonusHp: 15, bonusLuck: 6 },
    perkLabel: '+2 ATK, +2 DEF, +15 HP, +6 LUCK & Title: Mythic Chronicler',
    heroTitle: 'Mythic Chronicler',
  },
];

// ==========================================
// AETHELGARD: ASTRAL VANGUARD (IDLE RPG WORLD)
// ==========================================

export const IDLE_REALMS = [
  { key: 'moss_library', name: 'Verdant Sky-Bastion', minStage: 1, accent: '#4ade80' },
  { key: 'clockwork_obs', name: 'Chrono-Forge Citadel', minStage: 4, accent: '#f59e0b' },
  { key: 'crystal_archive', name: 'Prism Frost Caverns', minStage: 7, accent: '#38bdf8' },
  { key: 'astral_sanctum', name: 'Eclipse Void Sanctum', minStage: 10, accent: '#c084fc' },
  { key: 'astral_sanctum', name: 'Singularity Throne', minStage: 15, accent: '#f43f5e' },
];

export const IDLE_SQUAD_HEROES = [
  {
    id: 'solarius',
    name: 'Solarius',
    title: 'Dawnbreaker Paladin',
    defaultRow: 'front',
    role: 'Vanguard Aegis & Shieldbreaker',
    icon: '🛡️',
    spriteKey: 'hero_knight',
    skillName: 'Solar Aegis Smash',
    skillDesc: '1.8× DMG, shatters 2 Enemy Shields & grants +25% Squad Barrier',
    baseAtk: 14,
    baseDef: 12,
    baseHp: 140,
  },
  {
    id: 'kaelis',
    name: 'Kaelis',
    title: 'Phantom Nightblade',
    defaultRow: 'front',
    role: 'Flanking Crit Assassin',
    icon: '🗡️',
    spriteKey: 'hero_rogue',
    skillName: 'Shadowstep Cross-Cut',
    skillDesc: '2.3× Guaranteed Critical Backstab & shatters 1 Enemy Shield',
    baseAtk: 20,
    baseDef: 6,
    baseHp: 105,
  },
  {
    id: 'aurelia',
    name: 'Aurelia',
    title: 'Chrono-Weaver',
    defaultRow: 'back',
    role: 'AoE Astral Artillerist',
    icon: '⏳',
    spriteKey: 'hero_mage',
    skillName: 'Singularity Nova',
    skillDesc: '2.1× AoE Arcane Burst, shatters 2 Shields & +25% Ultimate Gauge',
    baseAtk: 22,
    baseDef: 5,
    baseHp: 98,
  },
  {
    id: 'seraphina',
    name: 'Seraphina',
    title: 'Starlight Sage',
    defaultRow: 'back',
    role: 'Squad Healer & Tactician',
    icon: '✨',
    spriteKey: 'hero_scholar',
    skillName: 'Celestial Panacea',
    skillDesc: 'Restores 35% Squad HP & inflicts +50% Vulnerable DMG on foes',
    baseAtk: 15,
    baseDef: 8,
    baseHp: 115,
  },
];

export const IDLE_PROFESSIONS = [
  {
    id: 'astral_mining',
    name: 'Astral Shard Quarry',
    icon: '⛏️',
    resourceKey: 'shards',
    resourceLabel: 'Shards/hr',
    baseRatePerHr: 45,
    ratePerLevel: 28,
    squadPerk: '+4% Squad ATK per Level',
    baseCost: 25,
  },
  {
    id: 'alchemy_lab',
    name: 'Starlight Alchemy Guild',
    icon: '⚗️',
    resourceKey: 'coins',
    resourceLabel: 'Coins/hr',
    baseRatePerHr: 30,
    ratePerLevel: 18,
    squadPerk: '+5% Squad Max HP & Regen per Level',
    baseCost: 25,
  },
  {
    id: 'rune_scribes',
    name: 'Chrono-Rune Archive',
    icon: '📜',
    resourceKey: 'xp',
    resourceLabel: 'Hero XP/hr',
    baseRatePerHr: 120,
    ratePerLevel: 75,
    squadPerk: '+2% Crit & +4 Luck per Level',
    baseCost: 25,
  },
];

export const IDLE_ASCENSION_RELICS = [
  {
    id: 'relic_warlord',
    name: 'Crown of the Astral Warlord',
    icon: '👑',
    effectLabel: '+25% All Squad Damage & Crit Power per Rank',
    baseEmberCost: 1,
  },
  {
    id: 'relic_chronos',
    name: 'Hourglass of Eternal Overdrive',
    icon: '⏳',
    effectLabel: '+20% Base Idle Speed & +15m Study Overdrive Duration per Rank',
    baseEmberCost: 1,
  },
  {
    id: 'relic_midas',
    name: 'Chalice of Starlight Fortune',
    icon: '🏆',
    effectLabel: '+30% Shard, Coin & AFK Chest Yield per Rank',
    baseEmberCost: 1,
  },
  {
    id: 'relic_seeker',
    name: 'Eye of the Mythic Weaver',
    icon: '👁️',
    effectLabel: '+15 Mythic & Legendary Drop Luck per Rank',
    baseEmberCost: 1,
  },
];

export const IDLE_STAGE_ENEMIES = [
  { key: 'slime', name: 'Astral Ooze', shields: 1 },
  { key: 'bat', name: 'Void-Wing Stalker', shields: 1 },
  { key: 'skeleton', name: 'Aethelgard Bonesworn', shields: 2 },
  { key: 'mimic', name: 'Gilded Vault Mimic', shields: 2 },
  { key: 'armor', name: 'Runic Sentinel', shields: 3 },
  { key: 'wraith', name: 'Eclipse Chronowraith', shields: 2 },
  { key: 'golem', name: 'Monolith Colossus', shields: 3 },
  { key: 'dragon', name: 'Starfire Wyrmling', shields: 3 },
];

export const IDLE_MYTHIC_BOUNTIES = [
  {
    id: 'ms_overdrive',
    title: 'First Overdrive Surge',
    icon: '⚡',
    desc: 'Clear 2 waves during Study/Quiz Overdrive or clear 3 waves total.',
    reqKey: 'wavesClearedTotal',
    target: 2,
    mythicReward: {
      slot: 'weapon',
      name: "Solarius's Dawnstar Greatsword",
      icon: '🗡️',
      spriteKey: 'blade',
      rarity: 'mythic',
      affix: 'Mythic Astral-Forged',
      level: 5,
      atk: 38,
      def: 6,
      hp: 30,
      luck: 14,
      crit: 18,
      passiveDesc: 'Squad auto-attacks break +1 extra Guard Shield and boost Overdrive DPS by +25%.',
    },
  },
  {
    id: 'ms_stage2',
    title: 'Conqueror of Stage 2',
    icon: '🛡️',
    desc: 'Unlock Stage 2 (or upgrade a Guild Profession to Lv.2+) in Aethelgard.',
    reqKey: 'stageOrProf',
    target: 2,
    mythicReward: {
      slot: 'armor',
      name: 'Aegis of the Eternal Rift',
      icon: '🛡️',
      spriteKey: 'plate',
      rarity: 'mythic',
      affix: 'Mythic Rift-Plated',
      level: 5,
      atk: 10,
      def: 28,
      hp: 120,
      luck: 12,
      crit: 6,
      passiveDesc: 'Absorbs boss burst hits and empowers Seraphina healing by +35%.',
    },
  },
  {
    id: 'ms_ascend',
    title: 'Rebirth of the Vanguard',
    icon: '🔥',
    desc: 'Perform 1 Celestial Ascension Rebirth (available at Stage 2+ or 3+ Waves).',
    reqKey: 'ascensions',
    target: 1,
    mythicReward: {
      slot: 'charm',
      name: 'Chrono-Singularity Core',
      icon: '⏳',
      spriteKey: 'star',
      rarity: 'mythic',
      affix: 'Mythic Time-Woven',
      level: 5,
      atk: 14,
      def: 8,
      hp: 50,
      luck: 30,
      crit: 16,
      passiveDesc: 'Accelerates Ultimate Gauge charging by +35% and boosts AFK Chest Shards.',
    },
  },
  {
    id: 'ms_stage4',
    title: 'Citadel Sovereign',
    icon: '🦅',
    desc: 'Reach Stage 4 (Chrono-Forge Citadel) or accumulate 4+ total waves cleared.',
    reqKey: 'wavesForPhoenix',
    target: 4,
    mythicReward: {
      slot: 'companion',
      name: 'Solaria, Mythic Astral Phoenix',
      icon: '🦅',
      spriteKey: 'pet_dragon',
      rarity: 'mythic',
      affix: 'Mythic Celestial',
      level: 6,
      atk: 26,
      def: 12,
      hp: 65,
      luck: 26,
      crit: 15,
      passiveDesc: 'Fires starlight bolts alongside your 4-Hero Squad & awakens Stage III Mythic Aura.',
    },
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
