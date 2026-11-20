import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, Flame, LogOut, Settings2, Check, Target, Clock, Trash2 } from 'lucide-react';
import { Achievement, GameState, HeatmapDay, ShopBuyResponse, ShopState, Subject, SubjectStat, User, WeekDay } from '../types';
import { ThemeId, getThemeMeta, resolveAccent } from '../themes';
import { StorePanel } from './StorePanel';

interface ProfileViewProps {
  themeId?: ThemeId;
  user: User;
  heatmap: HeatmapDay[];
  weekTrend: WeekDay[];
  hourlyDistribution: number[];
  peakWindowLabel: string;
  subjectBreakdown: SubjectStat[];
  subjects: Subject[];
  shop: ShopState;
  game: GameState;
  achievements: Achievement[];
  onUpdateProfile: (payload: { displayName?: string; bio?: string; dailyGoalMins?: number }) => Promise<void>;
  onBuyShopItem: (itemKey: string) => Promise<ShopBuyResponse | void>;
  onRerollDailyShop: () => Promise<void>;
  onEquipGameItem: (itemId: number) => Promise<void>;
  onDeleteSubject: (subjectId: number) => Promise<void>;
  onLogout: () => void;
}

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
  weekTrend,
  hourlyDistribution,
  peakWindowLabel,
  subjectBreakdown,
  subjects,
  shop,
  game,
  achievements,
  onUpdateProfile,
  onBuyShopItem,
  onRerollDailyShop,
  onEquipGameItem,
  onDeleteSubject,
  onLogout,
}: ProfileViewProps) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [dailyGoalMins, setDailyGoalMins] = useState(user.dailyGoalMins);
  const [saving, setSaving] = useState(false);

  const themeMeta = getThemeMeta(themeId);
  const goalPct = Math.min(100, Math.round((user.todayMins / Math.max(1, user.dailyGoalMins)) * 100));
  const maxTrend = Math.max(30, ...weekTrend.map((d) => d.minutes));
  const maxHour = Math.max(15, ...(hourlyDistribution.length ? hourlyDistribution : [15]));

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
    <div className="space-y-4">
      {/* Identity & Daily Goal Hero */}
      <div className="glass-card rounded-3xl p-4 relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-14 h-14 rounded-2xl sp-inset border-2 flex items-center justify-center text-3xl shrink-0"
              style={{ borderColor: resolveAccent(user.themeColor, themeId) }}
            >
              {user.avatar}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white truncate">{user.displayName}</h2>
                <span className="px-2 py-0.5 rounded-full sp-badge text-[10px] font-bold">
                  Lv.{user.level}
                </span>
              </div>
              <div className="text-xs text-slate-400">@{user.username} • {user.title}</div>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">{user.bio}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="p-2 rounded-xl sp-badge text-slate-300 hover:text-white cursor-pointer"
              aria-label="Edit profile"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl sp-badge hover:border-rose-400/50 hover:text-rose-400 cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inline Edit Drawer */}
        {editing && (
          <form onSubmit={saveProfile} className="mt-4 pt-4 border-t border-white/10 space-y-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl sp-input text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Bio</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl sp-input text-xs"
              />
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
              className="w-full py-2.5 rounded-xl sp-btn-primary text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Save Changes
            </button>
          </form>
        )}

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="p-2.5 rounded-2xl sp-inset text-center">
            <div className="font-mono-num text-base font-extrabold text-white">
              {(user.totalMins / 60).toFixed(1)}h
            </div>
            <div className="text-[10px] text-slate-400">Total Focus</div>
          </div>
          <div className="p-2.5 rounded-2xl sp-inset text-center">
            <div className="font-mono-num text-base font-extrabold text-white flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" /> {user.streakDays}d
            </div>
            <div className="text-[10px] text-slate-400">Current Streak</div>
          </div>
          <div className="p-2.5 rounded-2xl sp-inset text-center">
            <div className="font-mono-num text-base font-extrabold text-white">
              {user.avgPurity}%
            </div>
            <div className="text-[10px] text-slate-400">Avg Purity</div>
          </div>
        </div>

        {/* Today's Goal Progress */}
        <div className="mt-3 p-3 rounded-2xl sp-inset">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Today's Goal
            </span>
            <span className="font-mono-num font-bold text-white">
              {user.todayMins}m / {user.dailyGoalMins}m ({goalPct}%)
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalPct}%` }}
              transition={{ duration: 0.7 }}
              className="h-full rounded-full"
              style={{ backgroundColor: themeMeta.colors.accent }}
            />
          </div>
        </div>
      </div>

      {/* 7-Day Study Bar Chart */}
      <div className="glass-card rounded-3xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
            Last 7 Days Focus
          </h3>
          <span className="font-mono-num text-xs font-bold text-white">{user.weekMins}m total</span>
        </div>
        <div className="grid grid-cols-7 gap-2 items-end h-28 pt-2">
          {weekTrend.map((d) => {
            const pct = Math.max(8, Math.round((d.minutes / maxTrend) * 100));
            return (
              <div key={d.date} className="flex flex-col items-center h-full justify-end gap-1.5">
                <span className="font-mono-num text-[10px] text-slate-400">{d.minutes}m</span>
                <div className="w-full flex-1 flex items-end justify-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="w-full max-w-[26px] rounded-t-lg"
                    style={{
                      backgroundColor: d.label === 'Today' ? themeMeta.colors.accent : themeMeta.colors.accent2,
                      opacity: d.label === 'Today' ? 1 : 0.65,
                    }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 90-Day Study Consistency Heatmap */}
      <div className="glass-card rounded-3xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            90-Day Study Heatmap
          </h3>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-sm inline-block border border-white/10" style={{ backgroundColor: themeMeta.colors.track }} />
            <span className="w-2.5 h-2.5 rounded-sm inline-block opacity-45" style={{ backgroundColor: themeMeta.colors.accent }} />
            <span className="w-2.5 h-2.5 rounded-sm inline-block opacity-75" style={{ backgroundColor: themeMeta.colors.accent }} />
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: themeMeta.colors.accent }} />
            <span>More</span>
          </div>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <div className="grid grid-rows-7 grid-flow-col gap-1.5 w-max">
            {heatmap.map((cell) => (
              <div
                key={cell.date}
                title={`${cell.date}: ${cell.minutes}m (${cell.count} sessions)`}
                className="w-3.5 h-3.5 rounded-[4px] border border-white/10 transition"
                style={heatStyle(cell.minutes, themeMeta.colors.accent, themeMeta.colors.track)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Subject Breakdown & Manage Subjects */}
      <div className="glass-card rounded-3xl p-4 space-y-2.5">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
          Subject Breakdown
        </h3>
        {subjectBreakdown.map((sub) => (
          <div key={sub.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">{sub.name}</span>
              <span className="font-mono-num text-slate-300 font-bold">
                {(sub.minutes / 60).toFixed(1)}h ({sub.pct}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${sub.pct}%`, backgroundColor: resolveAccent(sub.color, themeId) }}
              />
            </div>
          </div>
        ))}
        {subjects.length > 1 && (
          <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
            {subjects.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full sp-badge text-[11px] font-semibold"
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
                <button
                  type="button"
                  onClick={() => onDeleteSubject(s.id)}
                  title={`Delete ${s.name}`}
                  className="ml-0.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 24-Hour Focus Rhythm ("Early Bird vs. Night Owl") */}
      <div className="glass-card rounded-3xl p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            24h Focus Rhythm
          </h3>
          <span className="sp-badge px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            {peakWindowLabel}
          </span>
        </div>
        <div className="grid grid-cols-24 gap-0.5 items-end h-20 pt-1">
          {(hourlyDistribution.length === 24 ? hourlyDistribution : new Array(24).fill(0)).map((mins, hr) => {
            const pct = Math.max(8, Math.round((mins / maxHour) * 100));
            return (
              <div key={hr} title={`${hr}:00 — ${mins}m`} className="h-full flex items-end">
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${pct}%`,
                    backgroundColor: mins > 0 ? themeMeta.colors.accent : themeMeta.colors.track,
                  }}
                />
              </div>
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

      {/* Rotating Focus Coin Shop (Daily / Weekly / Monthly / Permanent) */}
      <StorePanel
        user={user}
        shop={shop}
        game={game}
        onBuyShopItem={onBuyShopItem}
        onRerollDailyShop={onRerollDailyShop}
        onEquipLoot={onEquipGameItem}
      />

      {/* Achievements Grid */}
      <div className="glass-card rounded-3xl p-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-3">
          <Award className="w-3.5 h-3.5" />
          Badges & Milestones
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`rounded-2xl p-3 border transition ${
                a.unlocked ? 'sp-tab-active' : 'sp-inset opacity-55'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xl">{a.icon}</span>
                <span className="font-mono-num text-[10px] font-bold text-slate-400">
                  {a.progress}/{a.target}
                </span>
              </div>
              <div className="text-xs font-bold text-white">{a.title}</div>
              <div className="text-[10px] text-slate-400 leading-snug mt-0.5">{a.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
