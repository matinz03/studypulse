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
  focusFever: boolean;
  feverLuck: number;
  feverAtkPct: number;
  todayEnergyTier: string;
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
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  luck: number;
  critPct: number;
  dodgePct: number;
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
  type: 'combat' | 'chest' | 'shrine' | 'merchant';
  isBoss?: boolean;
  turn?: number;
  charging?: boolean;
  lockpickChance?: number;
  gambleChance?: number;
  enemy?: {
    key: string;
    name: string;
    hp: number;
    maxHp: number;
    atk: number;
    def: number;
    xpReward: number;
    shardReward: number;
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
  profile: GameProfileData;
  heroStats: GameHeroStats;
  biome: {
    key: string;
    name: string;
    minFloor: number;
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
  simulated?: boolean;
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

export interface BootstrapData {
  user: User;
  subjects: Subject[];
  tasks: StudyTask[];
  shopItems: ShopItem[];
  shop: ShopState;
  game: GameState;
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
