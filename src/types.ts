export type TabKey = 'focus' | 'rooms' | 'compete' | 'feed' | 'me';
export type TimerMode = 'pomodoro' | 'deep' | 'stopwatch' | 'sprint';

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
