import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Flame, Swords, Zap, UserPlus, UserCheck, Search } from 'lucide-react';
import { LeaderboardEntry, PeerUser, User } from '../types';

interface CompeteViewProps {
  user: User;
  leaderboards: {
    today: LeaderboardEntry[];
    week: LeaderboardEntry[];
    all: LeaderboardEntry[];
  };
  directory: PeerUser[];
  onToggleFriend: (friendId: number) => Promise<void>;
  onNudgeFriend: (friendId: number) => Promise<void>;
}

function formatMinsShort(mins: number) {
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${mins}m`;
}

export function CompeteView({
  user,
  leaderboards,
  directory,
  onToggleFriend,
  onNudgeFriend,
}: CompeteViewProps) {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'all'>('week');
  const [scope, setScope] = useState<'all' | 'friends'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [selectedRivalId, setSelectedRivalId] = useState<number | null>(null);
  const [nudgedId, setNudgedId] = useState<number | null>(null);

  const friends = useMemo(() => directory.filter((d) => d.isFriend), [directory]);

  const availableSubjects = useMemo(() => {
    const raw = leaderboards[timeframe] || [];
    const totals = new Map<string, number>();
    for (const entry of raw) {
      if (!entry.subjectMinutes) continue;
      for (const [sub, mins] of Object.entries(entry.subjectMinutes)) {
        if (mins > 0) totals.set(sub, (totals.get(sub) || 0) + mins);
      }
    }
    return Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [leaderboards, timeframe]);

  const effectiveSubject =
    subjectFilter !== 'all' && availableSubjects.includes(subjectFilter) ? subjectFilter : 'all';

  const activeBoard = useMemo(() => {
    const raw = leaderboards[timeframe] || [];
    const scoped = scope === 'friends' ? raw.filter((r) => r.isSelf || r.isFriend) : raw;
    if (effectiveSubject === 'all') {
      return scoped.map((r, i) => ({ ...r, displayRank: i + 1 }));
    }
    return scoped
      .map((r) => ({
        ...r,
        minutes: r.subjectMinutes?.[effectiveSubject] || 0,
      }))
      .filter((r) => r.minutes > 0)
      .sort((a, b) => b.minutes - a.minutes || b.xp - a.xp)
      .map((r, i) => ({ ...r, displayRank: i + 1 }));
  }, [leaderboards, timeframe, scope, effectiveSubject]);

  const selfIdx = activeBoard.findIndex((r) => r.isSelf);
  const selfEntry = selfIdx >= 0 ? activeBoard[selfIdx] : null;
  const personAbove = selfIdx > 0 ? activeBoard[selfIdx - 1] : null;
  const gapToNext =
    selfEntry && personAbove ? Math.max(1, personAbove.minutes - selfEntry.minutes + 1) : 0;

  const top3 = activeBoard.slice(0, 3);
  const rest = activeBoard.slice(3);

  const rival = useMemo(() => {
    if (selectedRivalId) {
      const found = friends.find((f) => f.id === selectedRivalId);
      if (found) return found;
    }
    return friends[0] || directory[0] || null;
  }, [friends, directory, selectedRivalId]);

  const filteredDirectory = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return directory;
    return directory.filter(
      (d) => d.username.toLowerCase().includes(q) || d.displayName.toLowerCase().includes(q)
    );
  }, [directory, query]);

  async function handleNudge(id: number) {
    setNudgedId(id);
    await onNudgeFriend(id);
    setTimeout(() => setNudgedId(null), 1500);
  }

  // Reorder podium [2nd, 1st, 3rd]
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Timeframe & Scope Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl glass-card flex-1">
          {(
            [
              ['today', 'Today'],
              ['week', 'This Week'],
              ['all', 'All-Time'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTimeframe(k)}
              className={`relative py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                timeframe === k ? 'text-white' : 'text-slate-400'
              }`}
            >
              {timeframe === k && (
                <motion.div
                  layoutId="boardTimePill"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/30 to-cyan-500/25 border border-violet-400/40"
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setScope((s) => (s === 'all' ? 'friends' : 'all'))}
          className={`shrink-0 px-3 py-2.5 rounded-2xl text-xs font-bold border cursor-pointer transition ${
            scope === 'friends'
              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
              : 'glass-card text-slate-300 border-white/10'
          }`}
        >
          {scope === 'friends' ? 'Friends Only' : 'Everyone'}
        </button>
      </div>

      {/* Wrapping Subject Filter Pills */}
      {availableSubjects.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
          <button
            type="button"
            onClick={() => setSubjectFilter('all')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer transition ${
              effectiveSubject === 'all'
                ? 'bg-emerald-400/25 border border-emerald-300/60 text-emerald-100 shadow-[0_0_14px_rgba(16,185,129,0.25)]'
                : 'liquid-pill text-slate-300 hover:text-white'
            }`}
          >
            All Subjects
          </button>
          {availableSubjects.map((sub) => {
            const active = effectiveSubject === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => setSubjectFilter(sub)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer transition ${
                  active
                    ? 'bg-cyan-400/25 border border-cyan-300/60 text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.25)]'
                    : 'liquid-pill text-slate-300 hover:text-white'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      )}

      {/* Your Standing Liquid Glass Strip */}
      <div className="liquid-card rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="liquid-pill px-2 py-1 rounded-xl font-mono-num text-xs font-extrabold text-emerald-300 shrink-0">
            {selfEntry ? `#${selfEntry.displayRank}` : '--'}
          </span>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">
              Your Standing {effectiveSubject !== 'all' ? `• ${effectiveSubject}` : ''}
            </div>
            <div className="text-[11px] text-slate-300 truncate">
              {selfEntry
                ? selfEntry.displayRank === 1
                  ? 'Leading the board 👑'
                  : personAbove
                    ? `${formatMinsShort(gapToNext)} to pass ${personAbove.displayName}`
                    : `${formatMinsShort(selfEntry.minutes)} logged`
                : `No ${effectiveSubject} focus logged yet`}
            </div>
          </div>
        </div>
        <span className="font-mono-num text-xs font-extrabold text-cyan-200 shrink-0">
          {selfEntry ? formatMinsShort(selfEntry.minutes) : '0m'}
        </span>
      </div>

      {/* Animated Top-3 Liquid Glass Podium */}
      {podiumOrder.length > 0 && (
        <div className="glass-card rounded-3xl p-4 pt-6 relative overflow-hidden">
          <div className="flex items-end justify-center gap-3">
            {podiumOrder.map((entry) => {
              const isFirst = entry.displayRank === 1;
              const isSecond = entry.displayRank === 2;
              const heightClass = isFirst ? 'h-28' : isSecond ? 'h-20' : 'h-16';
              const pedestalGlass = isFirst
                ? 'bg-gradient-to-b from-amber-300/35 via-amber-500/15 to-amber-500/5 border-t-2 border-amber-300/80 border-x border-amber-400/30 shadow-[inset_0_1px_12px_rgba(251,191,36,0.35),0_8px_24px_rgba(251,191,36,0.18)]'
                : isSecond
                  ? 'bg-gradient-to-b from-sky-300/30 via-cyan-400/12 to-cyan-500/5 border-t-2 border-sky-300/75 border-x border-cyan-400/30 shadow-[inset_0_1px_10px_rgba(56,189,248,0.3),0_6px_18px_rgba(56,189,248,0.14)]'
                  : 'bg-gradient-to-b from-violet-300/30 via-violet-500/12 to-violet-500/5 border-t-2 border-violet-300/75 border-x border-violet-400/30 shadow-[inset_0_1px_10px_rgba(167,139,250,0.3),0_6px_18px_rgba(167,139,250,0.14)]';
              const badgeTone = isFirst
                ? 'bg-amber-400 text-slate-950 border-amber-200'
                : isSecond
                  ? 'bg-sky-300 text-slate-950 border-sky-100'
                  : 'bg-violet-300 text-slate-950 border-violet-100';

              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 max-w-[110px] flex flex-col items-center"
                >
                  <div className="relative mb-2">
                    {isFirst && (
                      <Crown className="w-5 h-5 text-amber-400 mx-auto mb-0.5 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
                    )}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl liquid-pill border-2 ${
                        entry.isSelf ? 'border-emerald-400' : 'border-white/25'
                      }`}
                    >
                      {entry.avatar}
                    </div>
                    <span
                      className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full border text-[10px] font-extrabold flex items-center justify-center ${badgeTone}`}
                    >
                      {entry.displayRank}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white truncate max-w-full">
                    {entry.displayName}
                  </div>
                  <div className="text-[11px] font-mono-num font-bold text-emerald-300 mb-1.5">
                    {formatMinsShort(entry.minutes)}
                  </div>
                  <div
                    className={`w-full ${heightClass} rounded-t-2xl backdrop-blur-md flex flex-col items-center justify-center gap-1 ${pedestalGlass}`}
                  >
                    <span className="text-[10px] font-bold text-slate-200 flex items-center gap-0.5">
                      <Flame className="w-3 h-3 text-orange-400" />
                      {entry.streakDays}d
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 1v1 Weekly Friend Duel Card */}
      {rival && (
        <div className="glass-card rounded-3xl p-4 border border-orange-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center">
                <Swords className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-orange-300">
                  1v1 Weekly Duel
                </h3>
                <p className="text-[11px] text-slate-400">Head-to-head focus battle</p>
              </div>
            </div>

            {friends.length > 1 && (
              <select
                value={rival.id}
                onChange={(e) => setSelectedRivalId(Number(e.target.value))}
                className="px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 text-[11px] text-slate-200 focus:outline-none"
              >
                {friends.map((f) => (
                  <option key={f.id} value={f.id}>
                    vs {f.displayName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {(() => {
            const myMins = user.weekMins;
            const rivalMins = rival.weekMins;
            const total = Math.max(1, myMins + rivalMins);
            const myShare = Math.round((myMins / total) * 100);
            const diff = myMins - rivalMins;
            return (
              <>
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{user.avatar}</span>
                    <div>
                      <div className="text-white">You</div>
                      <div className="font-mono-num text-emerald-300">{formatMinsShort(myMins)}</div>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-white/10 text-[10px] font-bold">
                    {diff >= 0 ? (
                      <span className="text-emerald-300">Ahead by {formatMinsShort(diff)}</span>
                    ) : (
                      <span className="text-orange-300">Trail by {formatMinsShort(Math.abs(diff))}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <div className="text-white">{rival.displayName}</div>
                      <div className="font-mono-num text-cyan-300">{formatMinsShort(rivalMins)}</div>
                    </div>
                    <span className="text-lg">{rival.avatar}</span>
                  </div>
                </div>

                {/* Split Tug-of-War Bar */}
                <div className="h-3 rounded-full bg-slate-900 overflow-hidden flex border border-white/10 mb-3">
                  <motion.div
                    initial={{ width: '50%' }}
                    animate={{ width: `${Math.max(8, Math.min(92, myShare))}%` }}
                    transition={{ type: 'spring', stiffness: 180, damping: 24 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                  />
                  <div className="flex-1 h-full bg-gradient-to-r from-orange-500 to-rose-500" />
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => handleNudge(rival.id)}
                  className="w-full py-2.5 rounded-xl bg-orange-500/15 border border-orange-400/35 text-xs font-bold text-orange-200 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-orange-500/25 transition"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{nudgedId === rival.id ? `Zapped ${rival.displayName}! ⚡` : `Nudge ${rival.displayName} to Lock In`}</span>
                </motion.button>
              </>
            );
          })()}
        </div>
      )}

      {/* Remaining Leaderboard Ranks */}
      {rest.length > 0 && (
        <div className="glass-card rounded-3xl p-3 space-y-1.5">
          {rest.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-2.5 rounded-2xl transition ${
                entry.isSelf ? 'bg-emerald-500/15 border border-emerald-400/30' : 'bg-slate-950/40'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 text-center font-mono-num text-xs font-extrabold text-slate-400">
                  #{entry.displayRank}
                </span>
                <span className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-lg shrink-0">
                  {entry.avatar}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                    {entry.displayName}
                    {entry.isSelf && <span className="text-[10px] text-emerald-300">(You)</span>}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Lv.{entry.level} • {entry.topSubject} • 🔥 {entry.streakDays}d
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono-num text-xs font-extrabold text-white">
                  {formatMinsShort(entry.minutes)}
                </div>
                <div className="text-[10px] text-slate-500">{entry.sessions} blocks</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discover & Connect with Study Friends */}
      <div className="glass-card rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white">Study Squad & Peers</h3>
          <span className="text-xs text-slate-400">{friends.length} friends</span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Find peers by name or @username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
          />
        </div>

        <div className="space-y-2">
          {filteredDirectory.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              No other study peers found yet. Invite friends to join StudyPulse!
            </p>
          ) : (
            filteredDirectory.map((peer) => (
            <div
              key={peer.id}
              className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-950/50 border border-white/5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl">
                    {peer.avatar}
                  </div>
                  {peer.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0B101D]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {peer.displayName}{' '}
                    <span className="text-[10px] font-normal text-slate-500">@{peer.username}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    🔥 {peer.streakDays}d streak • {formatMinsShort(peer.weekMins)} this week
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={() => onToggleFriend(peer.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition border ${
                  peer.isFriend
                    ? 'bg-emerald-500/15 border-emerald-400/35 text-emerald-300'
                    : 'bg-cyan-500 text-slate-950 border-transparent'
                }`}
              >
                {peer.isFriend ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                <span>{peer.isFriend ? 'Friends' : 'Add'}</span>
              </motion.button>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
