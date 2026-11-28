import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Calendar,
  Flame,
  LogOut,
  Settings2,
  Check,
  Target,
  Clock,
  Trash2,
  Download,
  Receipt,
  BarChart3,
  ShoppingBag,
  LayoutGrid,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  Achievement,
  GameState,
  HeatmapDay,
  SessionEditPayload,
  ShopBuyResponse,
  ShopState,
  Subject,
  SubjectStat,
  TodayTimelineItem,
  User,
  WeekDay,
  WeeklyAnalyticsResponse,
} from '../types';
import { ThemeId, getThemeMeta, resolveAccent } from '../themes';
import { StorePanel } from './StorePanel';
import { SubjectManagerModal } from './SubjectManagerModal';
import { SubcategoryInput, subjectSubcategories } from './SubcategoryInput';
import { SubjectAnalytics, type SubjectAnalyticsPeriod } from './SubjectAnalytics';

function toLocalDateTimeValue(ts: number) {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface ProfileViewProps {
  themeId?: ThemeId;
  user: User;
  heatmap: HeatmapDay[];
  heatmap365?: HeatmapDay[];
  prevWeekMins?: number;
  todayTimeline?: TodayTimelineItem[];
  studyLogs?: TodayTimelineItem[];
  weekTrend: WeekDay[];
  hourlyDistribution: number[];
  peakWindowLabel: string;
  subjectBreakdown: SubjectStat[];
  subjects: Subject[];
  shop: ShopState;
  game: GameState;
  achievements: Achievement[];
  onUpdateProfile: (payload: { displayName?: string; bio?: string; dailyGoalMins?: number }) => Promise<void>;
  onUpdateSession?: (
    sessionId: number,
    payload: SessionEditPayload
  ) => Promise<void>;
  onDeleteSession?: (sessionId: number) => Promise<void>;
  onFetchWeeklyAnalytics?: (offset: number) => Promise<WeeklyAnalyticsResponse>;
  onUpdateSubject?: (
    subjectId: number,
    payload: { name?: string; color?: string; icon?: string; cascadeSessions?: boolean }
  ) => Promise<void>;
  onReorderSubjects?: (orderedIds: number[]) => Promise<void>;
  onMergeSubjects?: (sourceId: number, targetId: number) => Promise<void>;
  onChangePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
  onLogoutAllDevices?: () => Promise<void>;
  onBuyShopItem: (itemKey: string) => Promise<ShopBuyResponse | void>;
  onRerollDailyShop: () => Promise<void>;
  onEquipGameItem: (itemId: number) => Promise<void>;
  onDeleteSubject: (subjectId: number) => Promise<void>;
  onLogout: () => void;
}

type MeSection = 'all' | 'analytics' | 'receipt' | 'shop';

function heatStyle(mins: number, accent: string, insetTrack: string): React.CSSProperties {
  if (mins <= 0) return { backgroundColor: insetTrack };
  if (mins < 30) return { backgroundColor: accent, opacity: 0.28 };
  if (mins < 75) return { backgroundColor: accent, opacity: 0.55 };
  if (mins < 140) return { backgroundColor: accent, opacity: 0.8 };
  return { backgroundColor: accent, opacity: 1 };
}

export function ProfileView({
  themeId = 'shadcn-dark',
  user,
  heatmap,
  heatmap365,
  prevWeekMins = 0,
  todayTimeline = [],
  studyLogs = [],
  weekTrend,
  hourlyDistribution,
  peakWindowLabel,
  subjectBreakdown,
  subjects,
  shop,
  game,
  achievements,
  onUpdateProfile,
  onUpdateSession,
  onDeleteSession,
  onFetchWeeklyAnalytics,
  onUpdateSubject,
  onReorderSubjects,
  onMergeSubjects,
  onChangePassword,
  onLogoutAllDevices,
  onBuyShopItem,
  onRerollDailyShop,
  onEquipGameItem,
  onDeleteSubject,
  onLogout,
}: ProfileViewProps) {
  const [editing, setEditing] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'security'>('profile');
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [dailyGoalMins, setDailyGoalMins] = useState(user.dailyGoalMins);
  const [saving, setSaving] = useState(false);

  // Security drawer state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [secError, setSecError] = useState<string | null>(null);
  const [secBusy, setSecBusy] = useState(false);

  const [heatRange, setHeatRange] = useState<'90' | '365'>('90');
  const [section, setSection] = useState<MeSection>('all');
  const [logScope, setLogScope] = useState<'today' | 'all'>(() => (todayTimeline.length > 0 ? 'today' : 'all'));
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [logTopicInput, setLogTopicInput] = useState('');
  const [logSubcategory, setLogSubcategory] = useState('');
  const [logRevision, setLogRevision] = useState(0);
  const [logTopicColor, setLogTopicColor] = useState<string | undefined>(undefined);
  const [logDurationMins, setLogDurationMins] = useState<number>(25);
  const [logNoteInput, setLogNoteInput] = useState<string>('');
  const [logDateInput, setLogDateInput] = useState<string>('');
  const [savingLogId, setSavingLogId] = useState<number | null>(null);

  // Subject Manager modal
  const [showManageSubjects, setShowManageSubjects] = useState(false);

  // Week-by-Week Analytics (#9)
  const [breakdownPeriod, setBreakdownPeriod] = useState<SubjectAnalyticsPeriod>('all');
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [weeklyData, setWeeklyData] = useState<WeeklyAnalyticsResponse | null>(null);
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);
  const [selectedHourIdx, setSelectedHourIdx] = useState<number | null>(null);
  const fetchWeekRef = useRef(onFetchWeeklyAnalytics);
  fetchWeekRef.current = onFetchWeeklyAnalytics;

  useEffect(() => {
    const fetchWeek = fetchWeekRef.current;
    if (!fetchWeek) return;
    let cancelled = false;
    setLoadingWeek(true);
    fetchWeek(weekOffset)
      .then((res) => {
        if (!cancelled) {
          setWeeklyData(res);
          setSelectedDayIdx(null);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingWeek(false);
      });
    return () => {
      cancelled = true;
    };
  }, [weekOffset, user.sessionsCount, user.totalMins, logRevision]);

  const selectedWeek = weeklyData?.offset === weekOffset ? weeklyData : undefined;
  const allLogs = studyLogs.length > 0 ? studyLogs : [...todayTimeline].reverse();
  const visibleLogs = logScope === 'today' ? todayTimeline : allLogs;

  function openLogEditor(item: TodayTimelineItem) {
    if (editingLogId === item.id) {
      setEditingLogId(null);
      return;
    }
    setEditingLogId(item.id);
    setLogTopicInput(item.subjectName);
    setLogSubcategory(item.subcategory ?? '');
    setLogTopicColor(item.subjectColor);
    setLogDurationMins(Math.max(1, Math.round(item.durationSec / 60)));
    setLogNoteInput(item.note || '');
    setLogDateInput(toLocalDateTimeValue(item.createdAt));
  }

  async function saveLogEdit(sessionId: number, quickSubject?: { name: string; color: string }) {
    if (!onUpdateSession) return;
    const nextName = (quickSubject?.name ?? logTopicInput).trim().slice(0, 40);
    if (!nextName || savingLogId === sessionId) return;
    setSavingLogId(sessionId);
    try {
      const payload: SessionEditPayload = {
        subjectName: nextName,
        subjectColor: quickSubject?.color ?? logTopicColor,
      };
      if (!quickSubject) {
        payload.subcategory = logSubcategory;
        payload.durationSec = Math.max(60, Math.min(43200, Math.round((logDurationMins || 1) * 60)));
        payload.note = logNoteInput;
        if (logDateInput) {
          const parsed = new Date(logDateInput).getTime();
          if (Number.isFinite(parsed) && parsed > 0 && parsed <= Date.now() + 60_000) {
            payload.createdAt = parsed;
          }
        }
      }
      await onUpdateSession(sessionId, payload);
      setLogRevision((revision) => revision + 1);
      setEditingLogId(null);
    } finally {
      setSavingLogId(null);
    }
  }

  async function submitPasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!onChangePassword || secBusy) return;
    setSecError(null);
    if (newPassword.length < 4) {
      setSecError('New password must be at least 4 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecError('New password and confirmation do not match.');
      return;
    }
    setSecBusy(true);
    try {
      await onChangePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setSecError(err instanceof Error ? err.message : 'Unable to change password.');
    } finally {
      setSecBusy(false);
    }
  }

  const themeMeta = getThemeMeta(themeId);
  const activeHeatmap = heatRange === '365' && heatmap365?.length ? heatmap365 : heatmap;
  const weekDeltaPct =
    prevWeekMins > 0
      ? Math.round(((user.weekMins - prevWeekMins) / prevWeekMins) * 100)
      : user.weekMins > 0
        ? 100
        : 0;

  function triggerDownload(filename: string, mime: string, body: string) {
    const blob = new Blob([body], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const rows = ['date,subject,mode,duration_min,purity_pct,note,subcategory'];
    const cell = (value: string) => `"${value.replace(/"/g, '""')}"`;
    for (const s of todayTimeline) {
      rows.push(
        [
          new Date(s.createdAt).toISOString(), cell(s.subjectName), cell(s.mode),
          Math.max(1, Math.round(s.durationSec / 60)), s.purityPct, cell(s.note || ''), cell(s.subcategory || ''),
        ].join(',')
      );
    }
    triggerDownload(`studypulse_sessions_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv', rows.join('\n'));
  }

  function exportJson() {
    triggerDownload(
      `studypulse_analytics_${new Date().toISOString().slice(0, 10)}.json`,
      'application/json',
      JSON.stringify(
        { user: user.username, weekMins: user.weekMins, prevWeekMins, subjectBreakdown, todayTimeline, heatmap365: activeHeatmap },
        null,
        2
      )
    );
  }

  function exportIcal() {
    const fmt = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//StudyPulse//Focus Receipt//EN'];
    for (const s of todayTimeline) {
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:sp-${s.id}@study.matinz03.tech`);
      lines.push(`DTSTART:${fmt(s.createdAt - s.durationSec * 1000)}`);
      lines.push(`DTEND:${fmt(s.createdAt)}`);
      lines.push(`SUMMARY:StudyPulse - ${s.subjectName} (${s.purityPct}% Purity)`);
      lines.push(`DESCRIPTION:${(s.note || 'Deep Focus Block').replace(/\n/g, ' ')}`);
      lines.push('END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    triggerDownload(`studypulse_today.ics`, 'text/calendar', lines.join('\r\n'));
  }

  function downloadReceiptPng() {
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = Math.max(260, 150 + todayTimeline.length * 28);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = themeMeta.preview.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = themeMeta.preview.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
    ctx.fillStyle = themeMeta.preview.text;
    ctx.font = '800 18px monospace';
    ctx.fillText(`STUDYPULSE RECEIPT · @${user.username}`, 28, 46);
    ctx.font = '600 12px monospace';
    ctx.fillText(`Today: ${user.todayMins}m  |  Week: ${user.weekMins}m  |  Streak: ${user.streakDays}d`, 28, 72);
    ctx.fillStyle = themeMeta.colors.accent;
    ctx.fillRect(28, 86, canvas.width - 56, 2);
    let y = 114;
    if (!todayTimeline.length) {
      ctx.fillStyle = themeMeta.preview.text;
      ctx.fillText('Complete a session today to print blocks on your receipt.', 28, y);
    } else {
      for (const s of todayTimeline.slice(0, 10)) {
        const tm = new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        ctx.fillStyle = themeMeta.preview.text;
        ctx.fillText(
          `${tm}  ${s.subjectName.slice(0, 20).padEnd(20)}  ${Math.max(1, Math.round(s.durationSec / 60))}m · ${s.purityPct}%`,
          28,
          y
        );
        y += 24;
      }
    }
    const link = document.createElement('a');
    link.download = `studypulse_receipt_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  const goalPct = Math.min(100, Math.round((user.todayMins / Math.max(1, user.dailyGoalMins)) * 100));
  const maxTrend = Math.max(30, ...weekTrend.map((d) => d.minutes));
  const maxHour = Math.max(15, ...(hourlyDistribution.length ? hourlyDistribution : [15]));
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateProfile({ displayName, bio, dailyGoalMins });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* 1. COMPACT IDENTITY & 4-TILE KPI BENTO HERO */}
      <div className="glass-card studio-profile-summary relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-12 h-12 rounded-2xl sp-inset border-2 flex items-center justify-center text-2xl shrink-0"
              style={{ borderColor: resolveAccent(user.themeColor, themeId) }}
            >
              {user.avatar}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="studio-profile-name text-white truncate">{user.displayName}</h2>
                <span className="px-2 py-0.5 rounded-full sp-badge text-[10px] font-bold">Lv.{user.level}</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                @{user.username} • {user.title}
              </div>
              {user.bio && <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">{user.bio}</p>}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="w-9 h-9 rounded-xl sp-badge text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              aria-label="Account and profile settings"
              title="Profile & Security Settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="w-9 h-9 rounded-xl sp-badge hover:border-rose-400/50 hover:text-rose-400 flex items-center justify-center cursor-pointer"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {game.shadowSlave && (
          <div className="p-3 rounded-2xl sp-inset border border-white/10 space-y-2 text-[11px]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-extrabold text-white flex items-center gap-1.5">
                <span>{game.shadowSlave.aspect.icon}</span>
                <span>Nightmare Spell Runes:</span>
                <span style={{ color: game.shadowSlave.aspect.primaryColor }}>
                  [{game.shadowSlave.aspect.name}]
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full sp-badge text-[10px] font-bold text-amber-200">
                [{game.shadowSlave.trueName}] • {game.shadowSlave.rank} {game.shadowSlave.coreClass.name}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              {game.shadowSlave.attributes.map((a) => (
                <span key={a.id} className="px-2 py-0.5 rounded bg-white/5 border border-white/15 font-bold text-slate-200">
                  [{a.name}]
                </span>
              ))}
              <span className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-400/40 font-bold text-rose-200">
                Flaw: [{game.shadowSlave.flaw.name}]
              </span>
              <span className="px-2 py-0.5 rounded sp-badge text-slate-300">
                Shades: {game.shadowSlave.slainShades.count} • Memories: {game.shadowSlave.memories.length}
              </span>
            </div>
          </div>
        )}

        {/* Inline Account Settings & Security 2-Tab Drawer */}
        {editing && (
          <div className="pt-3 border-t border-white/10 space-y-3">
            <div className="grid grid-cols-2 p-1 rounded-xl sp-inset max-w-[240px]">
              <button
                type="button"
                onClick={() => setSettingsTab('profile')}
                className={`py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                  settingsTab === 'profile' ? 'sp-tab-active text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab('security')}
                className={`py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition ${
                  settingsTab === 'security' ? 'sp-tab-active text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3 h-3" /> Security
              </button>
            </div>

            {settingsTab === 'profile' ? (
              <form onSubmit={saveProfile} className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl sp-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Bio</label>
                    <input
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl sp-input text-xs"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Daily Study Goal</span>
                    <span className="font-mono-num text-white font-bold">{dailyGoalMins} mins / day</span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={360}
                    step={15}
                    value={dailyGoalMins}
                    onChange={(e) => setDailyGoalMins(Number(e.target.value))}
                    className="w-full accent-current"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2 rounded-xl sp-btn-primary text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save Changes
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                {onChangePassword && (
                  <form onSubmit={submitPasswordChange} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-200">Change Password</span>
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="text-[10px] font-bold text-slate-400 hover:text-white inline-flex items-center gap-1 cursor-pointer"
                      >
                        {showPw ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showPw ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label htmlFor="sp-cur-pw" className="block text-[10px] text-slate-400 mb-1">
                          Current Password
                        </label>
                        <input
                          id="sp-cur-pw"
                          type={showPw ? 'text' : 'password'}
                          autoComplete="current-password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl sp-input text-xs"
                        />
                      </div>
                      <div>
                        <label htmlFor="sp-new-pw" className="block text-[10px] text-slate-400 mb-1">
                          New Password (4+ chars)
                        </label>
                        <input
                          id="sp-new-pw"
                          type={showPw ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          minLength={4}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl sp-input text-xs"
                        />
                      </div>
                      <div>
                        <label htmlFor="sp-conf-pw" className="block text-[10px] text-slate-400 mb-1">
                          Confirm Password
                        </label>
                        <input
                          id="sp-conf-pw"
                          type={showPw ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          minLength={4}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl sp-input text-xs"
                        />
                      </div>
                    </div>
                    {secError && (
                      <p role="alert" className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl sp-danger-pill">
                        {secError}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={secBusy}
                      className="w-full py-2 rounded-xl sp-btn-primary text-xs font-extrabold cursor-pointer disabled:opacity-45"
                    >
                      {secBusy ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </form>
                )}

                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  {onLogoutAllDevices && (
                    <button
                      type="button"
                      onClick={onLogoutAllDevices}
                      className="px-3 py-1.5 rounded-xl sp-badge text-[11px] font-bold hover:text-white cursor-pointer"
                    >
                      Sign Out Other Devices
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onLogout}
                    className="px-3 py-1.5 rounded-xl sp-danger-pill text-[11px] font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out This Device
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Unified 4-Tile KPI Bento Strip (Total Hours, Streak, Purity, Today's Goal Progress) */}
        <div className="studio-profile-metrics">
          <div className="p-2.5 rounded-2xl sp-inset text-center">
            <div className="studio-profile-stat text-white">
              {(user.totalMins / 60).toFixed(1)}h
            </div>
            <div className="text-[10px] text-slate-400">Total Focus</div>
          </div>

          <div className="p-2.5 rounded-2xl sp-inset text-center">
            <div className="studio-profile-stat text-white flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5" /> {user.streakDays}d
            </div>
            <div className="text-[10px] text-slate-400">Current Streak</div>
          </div>

          <div className="p-2.5 rounded-2xl sp-inset text-center">
            <div className="studio-profile-stat text-white">{user.avgPurity}%</div>
            <div className="text-[10px] text-slate-400">Avg Purity</div>
          </div>

          <div className="p-2.5 rounded-2xl sp-inset flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Target className="w-3 h-3" /> Goal
              </span>
              <span className="font-mono-num font-extrabold text-white">{goalPct}%</span>
            </div>
            <div className="font-mono-num text-xs font-bold text-white truncate my-0.5">
              {user.todayMins}m / {user.dailyGoalMins}m
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goalPct}%` }}
                transition={{ duration: 0.6 }}
                className="h-full rounded-full"
                style={{ backgroundColor: themeMeta.colors.accent }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. ME WORKSPACE SECTION FILTER BAR (All Bento | Analytics | Receipt & Data | Shop & Badges) */}
      <div className="studio-segments studio-profile-segments" role="group" aria-label="Profile sections">
        {(
          [
            ['all', 'Overview', LayoutGrid],
            ['analytics', 'Analytics', BarChart3],
            ['receipt', 'Study logs', Receipt],
            ['shop', 'Rewards', ShoppingBag],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSection(key)}
            aria-pressed={section === key}
            className="focus-mode"
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* 3. ANALYTICS BENTO GRID (Week-by-Week Calendar Bars + Ghost Comparison + Tap Tooltips + 3-Tile Insights) */}
      {(section === 'all' || section === 'analytics') && (() => {
        const activeDays = weeklyData?.days || weekTrend.map((d) => ({ ...d, prevMinutes: 0, avgPurity: 100, sessions: 0 }));
        const maxBar = Math.max(
          30,
          ...activeDays.map((d) => Math.max(d.minutes, d.prevMinutes || 0))
        );
        const curDelta = weeklyData ? weeklyData.wowDeltaPct : weekDeltaPct;
        const curWeekTotal = weeklyData ? weeklyData.totalMins : user.weekMins;
        const selectedDay = selectedDayIdx !== null ? activeDays[selectedDayIdx] : null;
        const hourArr = hourlyDistribution.length === 24 ? hourlyDistribution : new Array(24).fill(0);

        return (
          <div className="space-y-3">
            {/* 2-Column Bento Row: Calendar Week Focus + 24h Focus Rhythm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="glass-card rounded-3xl p-3.5 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => setWeekOffset((w) => w - 1)}
                      aria-label="Previous week"
                      className="w-7 h-7 rounded-lg sp-badge flex items-center justify-center text-slate-300 hover:text-white cursor-pointer shrink-0"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-extrabold text-white truncate px-1">
                      {weeklyData ? weeklyData.label : 'This Week'}
                    </span>
                    <button
                      type="button"
                      disabled={weekOffset >= 0}
                      onClick={() => setWeekOffset((w) => Math.min(0, w + 1))}
                      aria-label="Next week"
                      className="w-7 h-7 rounded-lg sp-badge flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-35 cursor-pointer shrink-0"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    {weekOffset !== 0 && (
                      <button
                        type="button"
                        onClick={() => setWeekOffset(0)}
                        className="px-2 py-0.5 rounded-full sp-badge text-[9.5px] font-bold cursor-pointer shrink-0"
                      >
                        Today
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`px-1.5 py-0.5 rounded-full font-mono-num text-[9.5px] font-bold inline-flex items-center gap-0.5 ${
                        curDelta >= 0 ? 'sp-success-pill' : 'sp-danger-pill'
                      }`}
                    >
                      {curDelta >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      {curDelta >= 0 ? `+${curDelta}%` : `${curDelta}%`}
                    </span>
                    <span className="font-mono-num text-[11px] font-bold text-white">{curWeekTotal}m</span>
                  </div>
                </div>

                {selectedDay && (
                  <div className="px-2.5 py-1 rounded-xl sp-inset text-[10px] font-mono-num text-slate-200 flex items-center justify-between">
                    <span>{selectedDay.date}</span>
                    <span>
                      {selectedDay.minutes}m (prev {selectedDay.prevMinutes}m) • {selectedDay.avgPurity}% purity
                    </span>
                  </div>
                )}

                <div className={`grid grid-cols-7 gap-1.5 items-end h-24 pt-1 transition-opacity ${loadingWeek ? 'opacity-50' : ''}`}>
                  {activeDays.map((d, idx) => {
                    const pct = Math.max(8, Math.round((d.minutes / maxBar) * 100));
                    const prevPct = d.prevMinutes > 0 ? Math.max(6, Math.round((d.prevMinutes / maxBar) * 100)) : 0;
                    const isSelected = selectedDayIdx === idx;
                    return (
                      <button
                        key={d.date}
                        type="button"
                        onClick={() => setSelectedDayIdx(isSelected ? null : idx)}
                        className="flex flex-col items-center h-full justify-end gap-1 cursor-pointer focus-visible:outline-none"
                        title={`${d.date}: ${d.minutes}m (prev week: ${d.prevMinutes}m)`}
                      >
                        <span className="font-mono-num text-[9px] text-slate-400">{d.minutes}m</span>
                        <div className="w-full flex-1 flex items-end justify-center relative">
                          {prevPct > 0 && (
                            <div
                              className="absolute bottom-0 w-full max-w-[22px] rounded-t-md border border-dashed border-white/25 bg-white/5"
                              style={{ height: `${prevPct}%` }}
                            />
                          )}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${pct}%` }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className={`relative z-10 w-full max-w-[18px] rounded-t-md ${isSelected ? 'ring-2 ring-white' : ''}`}
                            style={{
                              backgroundColor: themeMeta.colors.accent,
                              opacity: d.minutes > 0 ? 0.92 : 0.25,
                            }}
                          />
                        </div>
                        <span className="text-[9.5px] font-semibold text-slate-400 truncate">{d.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 24-Hour Focus Rhythm Histogram with Tap Tooltip */}
              <div className="glass-card rounded-3xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1 truncate">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>24h Focus Rhythm</span>
                  </h3>
                  <span className="sp-badge px-2 py-0.5 rounded-full text-[9.5px] font-bold truncate">
                    {selectedHourIdx !== null
                      ? `${selectedHourIdx}:00 • ${hourArr[selectedHourIdx]}m`
                      : peakWindowLabel}
                  </span>
                </div>

                <div className="grid grid-cols-24 gap-0.5 items-end h-20 pt-1">
                  {hourArr.map((mins, hr) => {
                    const pct = Math.max(10, Math.round((mins / maxHour) * 100));
                    return (
                      <button
                        key={hr}
                        type="button"
                        onClick={() => setSelectedHourIdx(selectedHourIdx === hr ? null : hr)}
                        title={`${hr}:00 — ${mins}m`}
                        aria-label={`${hr}:00 focus ${mins} minutes`}
                        className="h-full flex items-end cursor-pointer"
                      >
                        <div
                          className={`w-full rounded-t-sm transition-all ${selectedHourIdx === hr ? 'ring-1 ring-white' : ''}`}
                          style={{
                            height: `${pct}%`,
                            backgroundColor: mins > 0 ? themeMeta.colors.accent : themeMeta.colors.track,
                          }}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between text-[9px] font-mono-num text-slate-500 mt-1.5">
                  <span>12a</span>
                  <span>6a</span>
                  <span>12p</span>
                  <span>6p</span>
                  <span>11p</span>
                </div>
              </div>
            </div>

            {/* 3-Tile Weekly Insights Bento */}
            {weeklyData && (
              <div className="grid grid-cols-3 gap-2">
                <div className="glass-card rounded-2xl p-3 space-y-0.5">
                  <div className="text-[9.5px] uppercase tracking-wider text-slate-400 font-bold">Top Subject</div>
                  <div className="text-xs font-extrabold text-white truncate">
                    {weeklyData.topSubject ? weeklyData.topSubject.name : 'No sessions'}
                  </div>
                  <div className="text-[10px] font-mono-num text-slate-400">
                    {weeklyData.topSubject
                      ? `${weeklyData.topSubject.minutes}m (${weeklyData.topSubject.wowDeltaPct >= 0 ? '+' : ''}${weeklyData.topSubject.wowDeltaPct}%)`
                      : '—'}
                  </div>
                </div>
                <div className="glass-card rounded-2xl p-3 space-y-0.5">
                  <div className="text-[9.5px] uppercase tracking-wider text-slate-400 font-bold">Week Purity &amp; Peak</div>
                  <div className="text-xs font-mono-num font-extrabold text-white">{weeklyData.avgPurity}% avg</div>
                  <div className="text-[10px] text-slate-400 truncate">{weeklyData.peakWindowLabel}</div>
                </div>
                <div className="glass-card rounded-2xl p-3 space-y-0.5">
                  <div className="text-[9.5px] uppercase tracking-wider text-slate-400 font-bold">Goal Consistency</div>
                  <div className="text-xs font-mono-num font-extrabold text-white">{weeklyData.goalDaysHit} / 7 days</div>
                  <div className="text-[10px] text-slate-400 truncate">Daily {user.dailyGoalMins}m target</div>
                </div>
              </div>
            )}

          {/* Unified Study Consistency Heatmap + Subject Breakdown Card */}
          <div className="glass-card rounded-3xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {heatRange}-Day Study Heatmap
                </h3>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setHeatRange('90')}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                      heatRange === '90' ? 'sp-btn-primary' : 'sp-badge'
                    }`}
                  >
                    90d
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeatRange('365')}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                      heatRange === '365' ? 'sp-btn-primary' : 'sp-badge'
                    }`}
                  >
                    365d
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>Less</span>
                <span
                  className="w-2.5 h-2.5 rounded-sm inline-block border border-white/10"
                  style={{ backgroundColor: themeMeta.colors.track }}
                />
                <span
                  className="w-2.5 h-2.5 rounded-sm inline-block opacity-45"
                  style={{ backgroundColor: themeMeta.colors.accent }}
                />
                <span
                  className="w-2.5 h-2.5 rounded-sm inline-block opacity-75"
                  style={{ backgroundColor: themeMeta.colors.accent }}
                />
                <span
                  className="w-2.5 h-2.5 rounded-sm inline-block"
                  style={{ backgroundColor: themeMeta.colors.accent }}
                />
                <span>More</span>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <div className="grid grid-rows-7 grid-flow-col gap-1.5 w-max">
                {activeHeatmap.map((cell) => (
                  <div
                    key={cell.date}
                    title={`${cell.date}: ${cell.minutes}m (${cell.count} sessions)`}
                    className="w-3.5 h-3.5 rounded-[4px] border border-white/10 transition"
                    style={heatStyle(cell.minutes, themeMeta.colors.accent, themeMeta.colors.track)}
                  />
                ))}
              </div>
            </div>

            <SubjectAnalytics
              breakdown={breakdownPeriod === 'all' ? subjectBreakdown : selectedWeek?.subjectBreakdown}
              themeId={themeId}
              period={breakdownPeriod}
              onChangePeriod={setBreakdownPeriod}
              onManageSubjects={() => setShowManageSubjects(true)}
              hasWeeklyBreakdown={weeklyData?.subjectBreakdown !== undefined}
              weekLabel={selectedWeek?.label}
              loading={breakdownPeriod === 'week' && loadingWeek}
            />
          </div>
        </div>
        );
      })()}

      {/* 4. YPT STUDY LOGS, DAILY RECEIPT & DATA EXPORTS */}
      {(section === 'all' || section === 'receipt') && (
        <div className="glass-card rounded-3xl p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" /> Study Logs, Receipt &amp; Exports
            </h3>
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="p-0.5 rounded-xl sp-inset flex items-center gap-0.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setLogScope('today')}
                  className={`px-2 py-0.5 rounded-lg cursor-pointer transition ${
                    logScope === 'today' ? 'sp-tab-active text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Today ({todayTimeline.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLogScope('all')}
                  className={`px-2 py-0.5 rounded-lg cursor-pointer transition ${
                    logScope === 'all' ? 'sp-tab-active text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Logs ({allLogs.length})
                </button>
              </div>
              <button
                type="button"
                onClick={downloadReceiptPng}
                className="px-2.5 py-1 rounded-xl sp-btn-primary text-[10px] font-extrabold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" /> Receipt PNG
              </button>
              <button
                type="button"
                onClick={exportCsv}
                className="px-2.5 py-1 rounded-xl sp-badge text-[10px] font-bold cursor-pointer hover:opacity-90"
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={exportJson}
                className="px-2.5 py-1 rounded-xl sp-badge text-[10px] font-bold cursor-pointer hover:opacity-90"
              >
                Export JSON
              </button>
              <button
                type="button"
                onClick={exportIcal}
                className="px-2.5 py-1 rounded-xl sp-badge text-[10px] font-bold cursor-pointer hover:opacity-90"
              >
                Export iCal
              </button>
            </div>
          </div>

          {visibleLogs.length === 0 ? (
            <div className="p-2.5 rounded-xl sp-inset text-[11px] text-slate-400">
              {logScope === 'today'
                ? 'No sessions recorded today yet. Switch to "All Logs" to inspect or re-tag earlier study sessions.'
                : 'Finish a study session to generate chronological receipt blocks and editable logs.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-72 overflow-y-auto glass-scroll pr-0.5">
              {visibleLogs.map((item) => {
                const isEditingRow = editingLogId === item.id;
                const d = new Date(item.createdAt);
                const stamp =
                  logScope === 'all'
                    ? `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl sp-inset text-[11px] space-y-1.5 border transition ${
                      isEditingRow ? 'sm:col-span-2 border-white/25' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono-num text-[10px] text-slate-400 shrink-0">{stamp}</span>
                        {onUpdateSession ? (
                          <button
                            type="button"
                            onClick={() => openLogEditor(item)}
                            title="Edit study log"
                            className="inline-flex items-center gap-1 font-bold text-white hover:underline cursor-pointer truncate min-w-0"
                          >
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: resolveAccent(item.subjectColor, themeId) }}
                            />
                            <span className="truncate">{item.subjectName}</span>
                            <Pencil className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          </button>
                        ) : (
                          <span className="font-bold text-white truncate">{item.subjectName}</span>
                        )}
                      </div>
                      <span className="font-mono-num text-[10px] text-slate-300 shrink-0">
                        {Math.max(1, Math.round(item.durationSec / 60))}m · {item.purityPct}%
                      </span>
                    </div>

                    {item.subcategory && !isEditingRow && (
                      <span className="inline-block max-w-full wrap-anywhere px-2 py-0.5 sp-badge">{item.subcategory}</span>
                    )}
                    {item.note && !isEditingRow && (
                      <div className="text-[10px] text-slate-400 truncate">&ldquo;{item.note}&rdquo;</div>
                    )}

                    {isEditingRow && onUpdateSession && (
                      <div className="pt-2 border-t border-white/10 space-y-2">
                        {subjects.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {subjects.map((sub) => (
                              <button
                                key={sub.id}
                                type="button"
                                disabled={savingLogId === item.id}
                                onClick={() => saveLogEdit(item.id, { name: sub.name, color: sub.color })}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer border transition ${
                                  sub.name.toLowerCase() === item.subjectName.toLowerCase()
                                    ? 'sp-tab-active'
                                    : 'sp-badge hover:opacity-90'
                                }`}
                              >
                                {sub.icon} {sub.name}
                              </button>
                            ))}
                          </div>
                        )}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            saveLogEdit(item.id);
                          }}
                          className="space-y-2"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            <div>
                              <label className="block text-[9.5px] text-slate-400 mb-0.5">Topic</label>
                              <input
                                type="text"
                                maxLength={40}
                                value={logTopicInput}
                                onChange={(e) => {
                                  if (e.target.value.trim().toLowerCase() !== logTopicInput.trim().toLowerCase()) setLogSubcategory('');
                                  setLogTopicInput(e.target.value);
                                  setLogTopicColor(undefined);
                                }}
                                placeholder="Custom topic name..."
                                className="w-full px-2.5 py-1 rounded-lg sp-input text-[11px]"
                              />
                            </div>
                            <div>
                              <label className="block text-[9.5px] text-slate-400 mb-0.5">Duration (mins)</label>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setLogDurationMins((m) => Math.max(1, m - 5))}
                                  className="px-2 py-1 rounded-lg sp-badge text-[10px] font-mono-num font-bold cursor-pointer"
                                >
                                  -5m
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  max={720}
                                  value={logDurationMins}
                                  onChange={(e) => setLogDurationMins(Math.max(1, Math.min(720, Number(e.target.value) || 1)))}
                                  className="w-16 text-center px-2 py-1 rounded-lg sp-input text-[11px] font-mono-num"
                                />
                                <button
                                  type="button"
                                  onClick={() => setLogDurationMins((m) => Math.min(720, m + 5))}
                                  className="px-2 py-1 rounded-lg sp-badge text-[10px] font-mono-num font-bold cursor-pointer"
                                >
                                  +5m
                                </button>
                              </div>
                            </div>
                          </div>

                          <SubcategoryInput
                            value={logSubcategory}
                            options={subjectSubcategories(logTopicInput, subjectBreakdown)}
                            onChange={setLogSubcategory}
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            <div>
                              <label className="block text-[9.5px] text-slate-400 mb-0.5">Date &amp; Time</label>
                              <input
                                type="datetime-local"
                                value={logDateInput}
                                onChange={(e) => setLogDateInput(e.target.value)}
                                className="w-full px-2.5 py-1 rounded-lg sp-input text-[10px] font-mono-num"
                              />
                            </div>
                            <div>
                              <label className="block text-[9.5px] text-slate-400 mb-0.5">Note</label>
                              <input
                                type="text"
                                maxLength={240}
                                value={logNoteInput}
                                onChange={(e) => setLogNoteInput(e.target.value)}
                                placeholder="Session note..."
                                className="w-full px-2.5 py-1 rounded-lg sp-input text-[11px]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            {onDeleteSession ? (
                              <button
                                type="button"
                                disabled={savingLogId === item.id}
                                onClick={async () => {
                                  setEditingLogId(null);
                                  await onDeleteSession(item.id);
                                }}
                                className="px-2.5 py-1 rounded-lg sp-danger-pill text-[10px] font-extrabold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" /> Delete Log
                              </button>
                            ) : (
                              <span />
                            )}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="submit"
                                disabled={savingLogId === item.id || !logTopicInput.trim()}
                                className="px-2.5 py-1 rounded-lg sp-btn-primary text-[10px] font-extrabold inline-flex items-center gap-1 cursor-pointer disabled:opacity-45"
                              >
                                <Check className="w-3 h-3" />
                                <span>{savingLogId === item.id ? 'Saving...' : 'Save'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingLogId(null)}
                                className="p-1 rounded-lg sp-badge text-slate-300 hover:text-white cursor-pointer"
                                aria-label="Cancel log edit"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. FOCUS COIN SHOP (2-COLUMN COMPACT BENTO) & BADGES GRID */}
      {(section === 'all' || section === 'shop') && (
        <div className="space-y-3">
          <StorePanel
            user={user}
            shop={shop}
            game={game}
            compact
            onBuyShopItem={onBuyShopItem}
            onRerollDailyShop={onRerollDailyShop}
            onEquipLoot={onEquipGameItem}
          />

          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Badges & Milestones
              </h3>
              <span className="sp-badge px-2 py-0.5 rounded-full text-[10px] font-mono-num font-bold">
                {unlockedCount}/{achievements.length} Unlocked
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className={`rounded-2xl p-2.5 border transition ${
                    a.unlocked ? 'sp-tab-active' : 'sp-inset opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{a.icon}</span>
                    <span className="font-mono-num text-[9.5px] font-bold text-slate-400">
                      {a.progress}/{a.target}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-white truncate">{a.title}</div>
                  <div className="text-[9.5px] text-slate-400 line-clamp-1 mt-0.5">{a.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showManageSubjects && (
          <SubjectManagerModal
            themeId={themeId}
            subjects={subjects}
            subjectBreakdown={subjectBreakdown}
            onClose={() => setShowManageSubjects(false)}
            onUpdateSubject={onUpdateSubject}
            onReorderSubjects={onReorderSubjects}
            onMergeSubjects={onMergeSubjects}
            onDeleteSubject={onDeleteSubject}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
