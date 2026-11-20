export type TabKey = 'focus' | 'quest' | 'rooms' | 'compete' | 'feed' | 'me';
export type TimerMode = 'pomodoro' | 'deep' | 'custom' | 'stopwatch' | 'sprint' | 'break';
export type ShopTier = 'daily' | 'weekly' | 'monthly' | 'permanent';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
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
  equipped: boolean;
  salvageValue: number;
  createdAt: number;
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

export interface GameState {
  mode: GameMode;
  profile: GameProfileData;
  heroStats: GameHeroStats;
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
