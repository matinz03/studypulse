export type TabKey = 'focus' | 'quest' | 'rooms' | 'compete' | 'feed' | 'me';
export type TimerMode = 'pomodoro' | 'deep' | 'custom' | 'stopwatch' | 'sprint' | 'break';
export type ShopTier = 'daily' | 'weekly' | 'monthly' | 'permanent';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type GearSlot = 'weapon' | 'armor' | 'charm' | 'companion';

export interface User {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  themeColor: string;
  bio: string;
  title: string;
  xp: number;
  coins: number;
  streakDays: number;
  streakFreezes: number;
  equippedSpirit: string;
  lastStudyDate: string | null;
  dailyGoalMins: number;
  level: number;
  currentLevelMinXp: number;
  nextLevelXp: number;
  levelProgressPct: number;
  todayMins: number;
  weekMins: number;
  totalMins: number;
  sessionsCount: number;
  avgPurity: number;
}

export interface StudyTask {
  id: number;
  userId: number;
  title: string;
  subjectName: string;
  targetPomos: number;
  completedPomos: number;
  done: boolean;
  createdAt: number;
}

export interface ShopItem {
  key: string;
  tier: ShopTier;
  category: string;
  rarity: ItemRarity;
  name: string;
  desc: string;
  effectBadge?: string;
  icon: string;
  price: number;
  origPrice?: number;
  titleValue?: string;
  heroKey?: string;
  unlocked: boolean;
  equipped: boolean;
  maxPerPeriod: number | null;
  purchasedCount: number;
  remaining: number | null;
}

export interface ShopState {
  periodKeys: {
    daily: string;
    weekly: string;
    monthly: string;
  };
  resetsInSec: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  dailyRerollsUsed: number;
  nextRerollCost: number;
  sections: {
    daily: ShopItem[];
    weekly: ShopItem[];
    monthly: ShopItem[];
    permanent: ShopItem[];
  };
}

export interface GameItem {
  id: number;
  userId: number;
  slot: GearSlot;
  name: string;
  icon: string;
  spriteKey: string;
  rarity: ItemRarity;
  affix: string;
  level: number;
  upgradeLevel: number;
  atk: number;
  def: number;
  hp: number;
  luck: number;
  crit: number;
  power?: number;
  equipped: boolean;
  salvageValue: number;
  createdAt: number;
  autoEquipped?: boolean;
  autoSalvagedShards?: number;
}

export type EnemyIntent = 'STRIKE' | 'HEAVY' | 'SHELL' | 'RITUAL' | 'HEX' | 'STUNNED';
export type GameMode = 'village' | 'dungeon';

export interface NpcDialogueOption {
  id: string;
  label: string;
  desc: string;
  style: 'primary' | 'tab' | 'badge';
  craftKey?: string;
  targetItemId?: number;
  disabled?: boolean;
}

export interface NpcSummary {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  spriteKey: string;
  trustedPerk: string;
  affinity: number;
  rankLabel: string;
  hasAction: boolean;
  dialogue: {
    npcId: string;
    greeting: string;
    options: NpcDialogueOption[];
  };
}

export interface QuestProgressEntry {
  id: string;
  npcId: string;
  title: string;
  desc: string;
  target: number;
  progress: number;
  claimed: boolean;
  type: 'side' | 'bounty';
}

export interface StoryChapterInfo {
  chapter: number;
  title: string;
  floorReq: number;
  bossFlag: string;
  villageUpgrade: string;
  upgradeLabel: string;
  synopsis: string;
  objective: string;
  rewards: { coins: number; shards: number; xp: number; loreId: string };
  completed: boolean;
  bossDefeated: boolean;
  active: boolean;
}

export interface LoreEntry {
  id: string;
  title: string;
  text: string;
  unlocked: boolean;
}

export interface DungeonEntity {
  id: string;
  type: 'boss' | 'monster' | 'key' | 'chest' | 'trap' | 'riddle' | 'brazier' | 'herb' | 'lore' | 'shrine';
  x: number;
  y: number;
  key?: string;
  name?: string;
  hp?: number;
  maxHp?: number;
  detected?: boolean;
  disarmed?: boolean;
  triggered?: boolean;
  isSecretVault?: boolean;
  done: boolean;
}

export interface DungeonSatchel {
  shards: number;
  coins: number;
  herbs: number;
  items: Array<{ name: string; icon: string; rarity: ItemRarity }>;
  questRelics: string[];
}

export interface DungeonState {
  floor: number;
  tiles: string[][];
  fov: number[][];
  playerX: number;
  playerY: number;
  entranceX: number;
  entranceY: number;
  bossGate: { x: number; y: number } | null;
  torch: number;
  keys: number;
  steps: number;
  bossDefeated: boolean;
  sensedHint: string | null;
  entities: DungeonEntity[];
  satchel: DungeonSatchel;
}

export interface GameDropOdds {
  common: number;
  uncommon: number;
  rare: number;
  epic: number;
  legendary: number;
}

export interface GameStudyBonuses {
  scholarLevel: number;
  streakDays: number;
  avgPurity: number;
  todayMins: number;
  dailyGoalMins: number;
  totalMins: number;
  studyAtk: number;
  studyDef: number;
  studyHp: number;
  streakLuck: number;
  purityCrit: number;
  purityDodge: number;
  purityIntuition?: number;
  focusFever: boolean;
  feverLuck: number;
  feverAtkPct: number;
  todayEnergyTier: string;
}

export interface HeroSpecialization {
  key: string;
  name: string;
  classKey: string;
  bonusAtk: number;
  bonusDef: number;
  bonusHp: number;
  bonusLuck: number;
  bonusCrit: number;
  bonusIntuition: number;
  perk: string;
}

export interface CompanionEvolution {
  stage: number;
  label: string;
  nextMins: number;
}

export interface PartyAllyInfo {
  id: string;
  name: string;
  title: string;
  role: string;
  icon: string;
  spriteKey: string;
  recruitCostShards: number;
  recruitReqLabel: string;
  lore: string;
  passiveLabel: string;
  passiveBonuses: { atk: number; def: number; hp: number; luck: number; crit: number };
  skillName: string;
  skillIcon: string;
  skillDesc: string;
  finisherName: string;
  finisherDesc: string;
  recruited: boolean;
  active: boolean;
  canRecruitFree: boolean;
  effectiveShardCost: number;
}

export interface MythicSideStoryAct {
  act: number;
  title: string;
  narrative: string;
  choices: Array<{
    id: string;
    label: string;
    outcome: string;
    shards: number;
    xp: number;
  }>;
}

export interface MythicSideStoryInfo {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  npcName: string;
  synopsis: string;
  mythicReward: {
    slot: GearSlot;
    name: string;
    icon: string;
    spriteKey: string;
    rarity: ItemRarity;
    affix: string;
    level: number;
    atk: number;
    def: number;
    hp: number;
    luck: number;
    crit: number;
    passiveDesc: string;
  };
  acts: MythicSideStoryAct[];
  actIndex: number;
  totalActs: number;
  completed: boolean;
  choicesTaken: string[];
  currentAct: MythicSideStoryAct | null;
}

export interface HeroicDeedInfo {
  id: string;
  title: string;
  icon: string;
  desc: string;
  statKey: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  reward: { shards: number; coins: number; bonusAtk: number; bonusDef: number; bonusHp: number; bonusLuck: number };
  perkLabel: string;
  heroTitle: string;
}

export interface GameHeroStats {
  heroLevel: number;
  heroXp: number;
  currentHeroMinXp: number;
  nextHeroXp: number;
  heroProgressPct: number;
  classKey: string;
  className: string;
  classPerk: string;
  specialization?: string;
  activeSpecialization?: HeroSpecialization;
  specializations?: HeroSpecialization[];
  companionEvolution?: CompanionEvolution;
  activeAllyId?: string | null;
  activeAllyName?: string | null;
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  luck: number;
  critPct: number;
  dodgePct: number;
  intuition: number;
  visionRadius: number;
  dropOdds: GameDropOdds;
  studyBonuses: GameStudyBonuses;
  luckBreakdown: {
    base: number;
    gear: number;
    upgrades: number;
    streak: number;
    fever: number;
    buff: number;
  };
}

export interface GameEncounter {
  type: 'combat' | 'chest' | 'shrine' | 'merchant' | 'riddle';
  entityId?: string;
  isBoss?: boolean;
  isSecretVault?: boolean;
  turn?: number;
  charging?: boolean;
  lockpickChance?: number;
  gambleChance?: number;
  riddleId?: string;
  title?: string;
  prompt?: string;
  hint?: string | null;
  options?: string[];
  heroStatuses?: {
    poisonTurns: number;
    poisonDmg: number;
    flankingTurns?: number;
    evasionActive?: boolean;
    allyWardTurns?: number;
    allyCooldown?: number;
    comboChain?: number;
  };
  enemy?: {
    key: string;
    name: string;
    hp: number;
    maxHp: number;
    atk: number;
    def: number;
    xpReward: number;
    shardReward: number;
    intent?: EnemyIntent;
    intentValue?: number;
    shields?: number;
    maxShields?: number;
    stunned?: boolean;
    vulnerableTurns?: number;
    armorBrokenTurns?: number;
    atkBonus?: number;
  };
}

export interface GameTurnEvent {
  kind: string;
  target: string;
  value?: number;
  text?: string;
}

export interface GameProfileData {
  heroClass: string;
  floor: number;
  roomIndex: number;
  bestFloor: number;
  hp: number;
  maxHp: number;
  energy: number;
  shards: number;
  potions: number;
  herbs: number;
  torches: number;
  focusCharge: number;
  luckBuffCharges: number;
  luckBuffAmount: number;
  monstersSlain: number;
  bossesSlain: number;
  chestsOpened: number;
  legendariesFound: number;
  upgrades: {
    atk: number;
    vit: number;
    luck: number;
    crit: number;
  };
  upgradeCosts: {
    atk: number;
    vit: number;
    luck: number;
    crit: number;
  };
}

export interface IdleSquadHero {
  id: string;
  name: string;
  title: string;
  defaultRow: 'front' | 'back';
  row: 'front' | 'back';
  role: string;
  icon: string;
  spriteKey: string;
  skillName: string;
  skillDesc: string;
  baseAtk: number;
  baseDef: number;
  baseHp: number;
  effectiveAtk: number;
  effectiveHp: number;
}

export interface IdleProfessionInfo {
  id: string;
  name: string;
  icon: string;
  resourceKey: 'shards' | 'coins' | 'xp';
  resourceLabel: string;
  baseRatePerHr: number;
  ratePerLevel: number;
  squadPerk: string;
  baseCost: number;
  level: number;
  ratePerHr: number;
  upgradeCost: number;
}

export interface IdleAscensionRelicInfo {
  id: string;
  name: string;
  icon: string;
  effectLabel: string;
  baseEmberCost: number;
  rank: number;
  nextCost: number;
}

export interface IdleMythicMilestoneInfo {
  id: string;
  title: string;
  icon: string;
  desc: string;
  reqKey: string;
  target: number;
  progress: number;
  unlocked: boolean;
  claimed: boolean;
  mythicReward: {
    slot: GearSlot;
    name: string;
    icon: string;
    spriteKey: string;
    rarity: ItemRarity;
    affix: string;
    level: number;
    atk: number;
    def: number;
    hp: number;
    luck: number;
    crit: number;
    passiveDesc: string;
  };
}

export interface IdleAfkChestState {
  accumulatedSec: number;
  capSec: number;
  shards: number;
  coins: number;
  xp: number;
  itemsRolled: number;
  lastClaimedAtMs: number;
}

export interface IdleGambitsConfig {
  ultPolicy: 'auto_ready' | 'boss_or_broken';
  healThreshold: 25 | 45 | 70;
  stageProgression: 'auto_push' | 'farm_stage';
  focusTarget: 'shield_break' | 'highest_dps';
  battlePace?: '1x' | '2x' | 'overdrive';
}

export interface IdleAutomationConfig {
  autoEquipBest: boolean;
  autoSalvageMaxRarity: 'off' | 'common' | 'uncommon' | 'rare';
}

export interface LoopTileCardDef {
  key: string;
  name: string;
  icon: string;
  placement: 'road' | 'landscape';
  traits: string[];
  color: string;
  desc: string;
}

export interface LoopPlacedTile {
  x: number;
  y: number;
  baseKey: string;
  cardKey: string;
  stars: number;
  evolved: boolean;
  name: string;
  icon: string;
  placement: 'road' | 'landscape';
  color: string;
  desc: string;
  traits: string[];
}

export interface LoopHandCard {
  id: string;
  cardKey: string;
  stars: number;
  name: string;
  icon: string;
  placement: 'road' | 'landscape';
  traits: string[];
  color: string;
  desc: string;
  threat: number;
}

export interface LoopTraitStatus {
  id: string;
  name: string;
  icon: string;
  breakpoints: number[];
  tierDescs: string[];
  count: number;
  tier: number;
  activeDesc: string;
}

export interface LoopRelicDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

export interface LoopLootSack {
  shards: number;
  coins: number;
  xp: number;
  embers: number;
  gearRolls: number;
}

export interface IdleLoopState {
  gridWidth: number;
  gridHeight: number;
  roadPath: { x: number; y: number }[];
  loopCount: number;
  tileIndex: number;
  threatPct: number;
  bossActive: boolean;
  autoArchitect: boolean;
  greedMultiplier: number;
  board: LoopPlacedTile[];
  hand: LoopHandCard[];
  activeTraits: LoopTraitStatus[];
  bonuses: {
    atkPct: number;
    maxHpFlat: number;
    maxHpPct: number;
    defFlat: number;
    defPct: number;
    lifestealPct: number;
    executePct: number;
    chainLightningPct: number;
    barrierBonusPct: number;
    speedPct: number;
    lootMult: number;
    campfireHealPct: number;
    bonusGearRolls: number;
  };
  activeRelics: LoopRelicDef[];
  pendingRelicChoices: LoopRelicDef[];
  lootSack: LoopLootSack;
  synergiesTriggered: number;
}

export interface IdleGameState {
  stage: number;
  maxStage: number;
  wave: number;
  isBossWave: boolean;
  wavesClearedTotal: number;
  realm: {
    key: string;
    name: string;
    minStage: number;
    accent: string;
  };
  currentEnemy: {
    key: string;
    name: string;
    hp: number;
    maxHp: number;
    shields: number;
    maxShields: number;
    isBoss: boolean;
  };
  secondaryEnemy?: {
    key: string;
    name: string;
    hp: number;
    maxHp: number;
    shields: number;
    maxShields: number;
    isBoss: boolean;
  };
  recommendedPower?: number;
  bossRecPower?: number;
  enemyDps?: number;
  bossWallStuck?: boolean;
  squadHeroes: IdleSquadHero[];
  formation: {
    front: string[];
    back: string[];
  };
  gambits: IdleGambitsConfig;
  automation: IdleAutomationConfig;
  professions: IdleProfessionInfo[];
  ascensions: number;
  celestialEmbers: number;
  totalEmbersEarned: number;
  canAscend: boolean;
  pendingEmbers: number;
  ascensionRelics: IdleAscensionRelicInfo[];
  mythicMilestones: IdleMythicMilestoneInfo[];
  afkChest: IdleAfkChestState;
  overdriveActive: boolean;
  overdriveRemainingSec: number;
  speedMultiplier: number;
  ascensionMult: number;
  midasMult: number;
  effectiveLuck: number;
  squadPower: number;
  squadDps: number;
  shardsPerHr: number;
  coinsPerHr: number;
  xpPerHr: number;
  loop?: IdleLoopState;
  shadowSlave?: ShadowSlaveState;
}

export interface ShadowSlaveAspect {
  id: string;
  name: string;
  rank: string;
  title: string;
  icon: string;
  primaryColor: string;
  secondaryColor: string;
  ringStyle: string;
  abilityName: string;
  abilityDesc: string;
  passiveBonus: string;
  lore: string;
}

export interface ShadowSlaveAttribute {
  id: string;
  name: string;
  category: string;
  desc: string;
  atkBonus: number;
  defBonus: number;
  hpBonus: number;
  essenceBonus: number;
  luckBonus: number;
  studyFragmentMult: number;
}

export interface ShadowSlaveFlaw {
  id: string;
  name: string;
  desc: string;
  combatRule: string;
  studyRule: string;
}

export interface ShadowSlaveNode {
  id: string;
  name: string;
  altitude: 'low' | 'high';
  pos: [number, number, number];
  desc: string;
  enemyKey: string;
  enemyName: string;
  enemyRank: string;
  enemyClass: string;
  hp: number;
  atk: number;
  intent: string;
  fragments: number;
  shards: number;
  isBoss: boolean;
}

export interface ShadowSlaveAct {
  act: number;
  key: string;
  title: string;
  subtitle: string;
  skyColor: string;
  fogColor: string;
  accentColor: string;
  nodes: ShadowSlaveNode[];
}

export interface ShadowSlaveCombat {
  nodeId: string;
  enemyKey: string;
  name: string;
  rank: string;
  enemyClass: string;
  hp: number;
  maxHp: number;
  atk: number;
  intent: string;
  staggered: boolean;
  staggerTurns: number;
  isBoss: boolean;
  act: number;
  fragments: number;
  shards: number;
}

export interface ShadowSlaveMemory {
  id: string;
  name: string;
  type: string;
  tier: string;
  icon: string;
  atk: number;
  def: number;
  essenceBonus: number;
  enchantment: string;
  weaveLevel: number;
  durability: number;
  equipped: boolean;
  effectiveAtk: number;
  effectiveDef: number;
  weaveCost: number;
}

export interface ShadowSlaveEcho {
  id: string;
  name: string;
  rank: string;
  class: string;
  icon: string;
  atk: number;
  def: number;
  desc: string;
  unlocked: boolean;
  awakened: boolean;
  level: number;
  effectiveAtk: number;
  effectiveDef: number;
  upgradeCost: number;
}

export type ShadowActionPayload =
  | { type: 'wrap_shadow'; target: 'weapon' | 'body' | 'echo' }
  | { type: 'select_act'; act: number }
  | { type: 'move_node'; nodeId: string }
  | { type: 'combat_move'; move: 'slash' | 'deflect' | 'aspect_art' }
  | { type: 'camp_statue' }
  | { type: 'weave_memory'; memoryId: string }
  | { type: 'awaken_echo'; echoId: string }
  | { type: 'reweave_fate' };

export interface ShadowSlaveState {
  aspect: ShadowSlaveAspect;
  attributes: ShadowSlaveAttribute[];
  flaw: ShadowSlaveFlaw;
  trueName: string;
  appraisal: string;
  rank: string;
  coreCount: number;
  coreClass: { coreCount: number; name: string; label: string; fragmentsPerCore: number };
  soulFragments: number;
  fragmentsPerCore: number;
  soulEssence: number;
  maxSoulEssence: number;
  heroHp: number;
  heroMaxHp: number;
  arcAct: number;
  maxArcAct: number;
  currentAct: ShadowSlaveAct;
  allActs: { act: number; key: string; title: string; subtitle: string; unlocked: boolean }[];
  currentNode: ShadowSlaveNode;
  clearedNodeIds: string[];
  sunProgress: number;
  sunPhase: 'day' | 'dusk' | 'night';
  shadowWrap: 'weapon' | 'body' | 'echo';
  activeCombat: ShadowSlaveCombat | null;
  memories: ShadowSlaveMemory[];
  echoes: ShadowSlaveEcho[];
  cohort: { id: string; name: string; trueName: string; icon: string; role: string; unlocked: boolean }[];
  slainShades: { count: number; recent: string[] };
  spellweaveStrings: number;
  lastWhisper: string;
  studyFragMult: number;
  reweaveCost: { shards: number; coins: number };
}

export interface GameState {
  mode: GameMode;
  profile: GameProfileData;
  heroStats: GameHeroStats;
  party?: {
    activeAllyId: string | null;
    activeAlly: PartyAllyInfo | null;
    allies: PartyAllyInfo[];
  };
  idle?: IdleGameState;
  shadowSlave?: ShadowSlaveState;
  biome: {
    key: string;
    name: string;
    minFloor: number;
  };
  village: {
    x: number;
    y: number;
    width: number;
    height: number;
    map: string[];
    upgrades: string[];
    npcs: NpcSummary[];
  };
  dungeon: DungeonState | null;
  story: {
    chapter: number;
    chapters: StoryChapterInfo[];
    flags: Record<string, unknown>;
    npcAffinity: Record<string, number>;
    quests: QuestProgressEntry[];
    loreCodex: LoreEntry[];
    mythicSideStories?: MythicSideStoryInfo[];
    heroicDeeds?: HeroicDeedInfo[];
  };
  items: GameItem[];
  equippedBySlot: Record<GearSlot, GameItem | null>;
  encounter: GameEncounter | null;
  recentLogs: string[];
}

export interface SessionGameRewards {
  energyGained: number;
  shardsGained: number;
  droppedItem: GameItem | null;
  focusFeverActive: boolean;
}

export interface ShopBuyResponse {
  ok: boolean;
  action: string;
  itemKey: string;
  message: string;
  droppedItem: GameItem | null;
  user: User;
  shop: ShopState;
  game: GameState;
}

export interface GameActionResponse {
  game: GameState;
  user: User;
  shop?: ShopState;
  events?: GameTurnEvent[];
  droppedItem?: GameItem | null;
  shardsGained?: number;
  greatSuccess?: boolean;
  interactedNpcId?: string;
  atGate?: boolean;
  atNoticeBoard?: boolean;
  message?: string;
}

export interface Subject {
  id: number;
  name: string;
  color: string;
  icon: string;
}

export interface PeerUser {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  themeColor: string;
  bio: string;
  title: string;
  xp: number;
  level: number;
  streakDays: number;
  isFriend: boolean;
  todayMins: number;
  weekMins: number;
  isOnline: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  themeColor: string;
  title: string;
  streakDays: number;
  xp: number;
  level: number;
  isFriend: boolean;
  isSelf: boolean;
  minutes: number;
  sessions: number;
  topSubject: string;
  subjectMinutes?: Record<string, number>;
}

export interface RoomOccupant {
  userId: number;
  username: string;
  displayName: string;
  avatar: string;
  themeColor: string;
  status: 'studying' | 'break' | 'idle';
  roomId: number;
  subjectName: string;
  subjectColor: string;
  taskTitle?: string;
  startedAtMs: number;
  baseElapsedSec: number;
  mode: string;
  heroClass?: string;
  heroLevel?: number;
  companionSpriteKey?: string | null;
  simulated?: boolean;
}

export interface RoomRaidContributor {
  userId: number;
  displayName: string;
  avatar: string;
  damage: number;
}

export interface RoomRaidState {
  roomId: number;
  weekKey: string;
  bossName: string;
  bossIcon: string;
  bossHp: number;
  bossMaxHp: number;
  contributors: RoomRaidContributor[];
}

export interface RoomSyncTimer {
  phase: 'focus' | 'break';
  remainingSec: number;
  cycleDurationSec: number;
  phaseDurationSec: number;
}

export interface RoomChatMessage {
  id: number;
  roomId: number;
  userId: number;
  username: string;
  displayName: string;
  avatar: string;
  content: string;
  createdAt: number;
}

export interface Room {
  id: number;
  name: string;
  topic: string;
  icon: string;
  accent: string;
  createdBy: number | null;
  occupants: RoomOccupant[];
  activeCount: number;
  totalCount: number;
  raid?: RoomRaidState;
  syncTimer?: RoomSyncTimer;
  messages?: RoomChatMessage[];
}

export interface FeedReaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface FeedComment {
  id: number;
  userId: number;
  username: string;
  displayName: string;
  avatar: string;
  content: string;
  createdAt: number;
}

export interface FeedItem {
  id: number;
  userId: number;
  username: string;
  displayName: string;
  avatar: string;
  themeColor: string;
  streakDays: number;
  level: number;
  isFriend: boolean;
  subjectName: string;
  subjectColor: string;
  mode: string;
  durationSec: number;
  purityPct: number;
  xpEarned: number;
  note: string;
  createdAt: number;
  reactions: FeedReaction[];
  comments: FeedComment[];
}

export interface HeatmapDay {
  date: string;
  minutes: number;
  count: number;
}

export interface WeekDay {
  date: string;
  label: string;
  minutes: number;
}

export interface SubjectStat {
  name: string;
  color: string;
  minutes: number;
  pct: number;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

export interface UniversityCourse {
  key: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  portalUrl: string;
  defaultExamDate: string;
  defaultTargetHours: number;
  readingTrail: string[];
}

export interface FlashcardItem {
  id: number;
  cardKey: string | null;
  courseKey: string;
  subjectName: string;
  conceptTitle: string;
  category?: 'theory' | 'trace' | 'numeric';
  difficulty?: 'core' | 'exam' | 'lab';
  front: string;
  back: string;
  options: string[];
  correctIndex: number;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewAt: number;
  reviewCount: number;
  isDue: boolean;
}

export interface ExamGoal {
  id: number;
  courseKey: string;
  subjectName: string;
  examTitle: string;
  examDate: string;
  targetHours: number;
  createdAt: number;
}

export interface StudyNoteItem {
  id: number;
  subjectName: string;
  title: string;
  contentMd: string;
  recallPrompts: string[];
  updatedAt: number;
}

export interface UniversityData {
  portalUrl: string;
  courses: UniversityCourse[];
  flashcards: FlashcardItem[];
  dueCount: number;
  examGoals: ExamGoal[];
  notes: StudyNoteItem[];
}

export interface LeagueStatus {
  tierKey: string;
  tierName: string;
  tierIcon: string;
  minMins: number;
  nextTierName: string | null;
  nextTierMins: number | null;
  weekMins: number;
  rankInLeague: number;
}

export interface FocusDuel {
  id: number;
  opponentId: number | null;
  opponentName: string;
  opponentAvatar: string;
  targetMins: number;
  wagerCoins: number;
  userMins: number;
  opponentMins: number;
  startedAt: number;
  endsAt: number;
  status: string;
  claimed: boolean;
}

export interface TodayTimelineItem {
  id: number;
  subjectName: string;
  subjectColor: string;
  mode: string;
  durationSec: number;
  purityPct: number;
  note: string;
  createdAt: number;
}

export interface BootstrapData {
  user: User;
  subjects: Subject[];
  tasks: StudyTask[];
  shopItems: ShopItem[];
  shop: ShopState;
  game: GameState;
  university?: UniversityData;
  league?: LeagueStatus;
  activeDuel?: FocusDuel;
  prevWeekMins?: number;
  todayTimeline?: TodayTimelineItem[];
  vapidPublicKey: string;
  directory: PeerUser[];
  leaderboards: {
    today: LeaderboardEntry[];
    week: LeaderboardEntry[];
    all: LeaderboardEntry[];
  };
  rooms: Room[];
  feed: FeedItem[];
  heatmap: HeatmapDay[];
  heatmap365?: HeatmapDay[];
  weekTrend: WeekDay[];
  hourlyDistribution: number[];
  peakWindowLabel: string;
  subjectBreakdown: SubjectStat[];
  achievements: Achievement[];
  onlineCount: number;
}

export interface FloatingEmoji {
  id: string;
  emoji: string;
  xOffset: number;
  sender: string;
}
