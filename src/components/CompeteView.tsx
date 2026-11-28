import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Flame, Swords, Zap, UserPlus, UserCheck, Search, Award } from 'lucide-react';
import { FocusDuel, LeaderboardEntry, LeagueStatus, PeerUser, SubjectStat, User } from '../types';
import {
  StudyFilters, StudyMetrics, formatStudyActivity, selectStudyActivity, studyFilterLabel, subcategoryOptions,
  subjectKey, subjectOptions,
} from './StudyFilters';

interface CompeteViewProps {
  user: User;
  leaderboards: {
    today: LeaderboardEntry[];
    week: LeaderboardEntry[];
    all: LeaderboardEntry[];
  };
  subjectBreakdown: SubjectStat[];
  recentSubjectBreakdown?: Record<'today' | 'week', SubjectStat[]>;
  directory: PeerUser[];
  league?: LeagueStatus;
  activeDuel?: FocusDuel;
  onStartDuel?: (payload: { opponentId?: number | null; targetMins?: number; wagerCoins?: number }) => Promise<void>;
  onClaimDuel?: () => Promise<void>;
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
  subjectBreakdown,
  recentSubjectBreakdown,
  directory,
  league,
  activeDuel,
  onStartDuel,
  onClaimDuel,
  onToggleFriend,
  onNudgeFriend,
}: CompeteViewProps) {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'all'>('week');
  const [scope, setScope] = useState<'all' | 'friends'>('all');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [query, setQuery] = useState('');
  const [selectedRivalId, setSelectedRivalId] = useState<number | null>(null);
  const [nudgedId, setNudgedId] = useState<number | null>(null);

  const friends = useMemo(() => directory.filter((d) => d.isFriend), [directory]);

  const boardSubjects = useMemo(
    () => leaderboards.all.flatMap((entry) =>
      entry.subjectActivity ?? Object.entries(entry.subjectMinutes ?? {}).map(([name, minutes]) => ({
        name, seconds: minutes * 60, sessions: 0, subcategories: [],
      }))
    ),
    [leaderboards.all]
  );
  const availableSubjects = subjectOptions([
    ...subjectBreakdown.map(({ name }) => name),
    ...boardSubjects.map(({ name }) => name),
  ]);
  const subject = availableSubjects.some((choice) => choice.value === subjectFilter) ? subjectFilter : '';
  const availableSubcategories = subject ? subcategoryOptions([
    ...subjectBreakdown
      .filter((item) => subjectKey(item.name) === subject)
      .flatMap((item) => item.subcategories?.map(({ name }) => name) ?? []),
    ...boardSubjects
      .filter((item) => subjectKey(item.name) === subject)
      .flatMap((item) => item.subcategories.map(({ name }) => name)),
  ]) : [];
  const subcategory = availableSubcategories.some((choice) => choice.value === subcategoryFilter) ? subcategoryFilter : '';
  const selectedLabel = studyFilterLabel(availableSubjects, availableSubcategories, subject, subcategory);

  function changeSubject(value: string) {
    setSubjectFilter(value);
    setSubcategoryFilter('');
  }

  const activeBoard = useMemo(() => {
    const board = leaderboards[timeframe];
    const scoped = scope === 'friends' ? board.filter((entry) => entry.isSelf || entry.isFriend) : board;
    if (!subject) {
      return scoped.map((entry, index) => ({
        ...entry, rankSeconds: entry.seconds ?? entry.minutes * 60, displayRank: index + 1,
      }));
    }
    return scoped
      .map((entry) => {
        const subjects = entry.subjectActivity ?? Object.entries(entry.subjectMinutes ?? {})
          .map(([name, minutes]) => ({ name, minutes }));
        const activity = selectStudyActivity(subjects, subject, subcategory);
        return { ...entry, rankSeconds: activity.seconds };
      })
      .filter((entry) => entry.rankSeconds > 0)
      .sort((a, b) => b.rankSeconds - a.rankSeconds || b.xp - a.xp)
      .map((entry, index) => ({ ...entry, displayRank: index + 1 }));
  }, [leaderboards, timeframe, scope, subject, subcategory]);

  const selfIdx = activeBoard.findIndex((entry) => entry.isSelf);
  const selfEntry = activeBoard[selfIdx];
  const personAbove = activeBoard[selfIdx - 1];
  const gapToNext = selfEntry && personAbove ? personAbove.rankSeconds - selfEntry.rankSeconds + 1 : 0;
  const personalBreakdown = timeframe === 'all' ? subjectBreakdown : recentSubjectBreakdown?.[timeframe];
  const myActivity = personalBreakdown
    ? selectStudyActivity(personalBreakdown, subject, subcategory)
    : { seconds: selfEntry?.rankSeconds ?? 0, sessions: selfEntry?.sessions ?? 0 };
  const periodLabel = { today: 'Today', week: 'This week', all: 'All time' }[timeframe];

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
      {/* Weekly Tiered League Banner */}
      {league && (
        <div className="studio-panel studio-league space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-10 h-10 rounded-2xl sp-inset flex items-center justify-center text-2xl shrink-0">
                {league.tierIcon}
              </span>
              <div className="min-w-0">
                <div className="studio-league-title">
                  <span>{league.tierName} Sleeper Division</span>
                  <span className="px-2 py-0.5 rounded-full sp-badge text-[10px] font-mono-num">
                    #{league.rankInLeague}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {league.nextTierName
                    ? `${Math.max(0, (league.nextTierMins || 0) - league.weekMins)}m to promote to ${league.nextTierName}`
                    : 'Highest weekly league tier reached!'}
                </div>
              </div>
            </div>
            <span className="text-xs font-mono-num font-bold text-white shrink-0">
              {league.weekMins}m / wk
            </span>
          </div>
          {league.nextTierMins && (
            <div className="h-2 rounded-full sp-inset overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.round(((league.weekMins - league.minMins) / Math.max(1, league.nextTierMins - league.minMins)) * 100))}%`,
                  backgroundColor: 'var(--sp-accent)',
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Timeframe & Scope Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="studio-segments studio-league-filters" role="group" aria-label="Leaderboard period">
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
              aria-pressed={timeframe === k}
              className="focus-mode"
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setScope((s) => (s === 'all' ? 'friends' : 'all'))}
          aria-pressed={scope === 'friends'}
          className={`shrink-0 px-3 py-2.5 rounded-2xl text-xs font-bold border cursor-pointer transition ${
            scope === 'friends' ? 'sp-btn-primary' : 'glass-card hover:border-white/25'
          }`}
        >
          {scope === 'friends' ? 'Friends Only' : 'Everyone'}
        </button>
      </div>

      <StudyFilters
        subjects={availableSubjects}
        subcategories={availableSubcategories}
        subject={subject}
        subcategory={subcategory}
        onSubjectChange={changeSubject}
        onSubcategoryChange={setSubcategoryFilter}
      />

      <section className="studio-panel space-y-2 p-3 sm:p-4" aria-label="Your standing">
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 px-2 py-1 sp-badge font-mono-num text-xs font-bold" aria-label={selfEntry ? `Rank ${selfEntry.displayRank}` : 'Unranked'}>
              {selfEntry ? `#${selfEntry.displayRank}` : '—'}
            </span>
            <div className="min-w-0">
              <h2>Your standing <span className="text-xs font-medium text-slate-400">· {periodLabel}</span></h2>
              <p className="text-xs text-slate-400 wrap-anywhere">{selectedLabel}</p>
            </div>
          </div>
          <StudyMetrics activity={myActivity} />
        </div>
        {selfEntry && (
          <p className="text-xs text-slate-300 wrap-anywhere">
            {selfEntry.displayRank === 1 && selfEntry.rankSeconds > 0
              ? 'Leading the board'
              : gapToNext > 0 ? `${formatStudyActivity(gapToNext)} to pass ${personAbove.displayName}` : null}
          </p>
        )}
        {subcategory && (
          <p className="text-xs text-slate-400">Rank uses shared sessions. Your totals include private sessions.</p>
        )}
      </section>

      {activeBoard.length === 0 && (
        <p className="studio-panel p-4 text-sm text-slate-400">No ranked activity matches these filters.</p>
      )}

      {/* Monochrome Animated Top-3 Podium */}
      {podiumOrder.length > 0 && (
        <div className="glass-card rounded-3xl p-4 pt-6 relative overflow-hidden">
          <div className="flex items-end justify-center gap-3">
            {podiumOrder.map((entry) => {
              const isFirst = entry.displayRank === 1;
              const isSecond = entry.displayRank === 2;
              const heightClass = isFirst ? 'h-28' : isSecond ? 'h-20' : 'h-16';
              const pedestalGlass = isFirst
                ? 'sp-tab-active border-t-2'
                : 'sp-inset border-t border-x';

              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 max-w-[110px] flex flex-col items-center"
                >
                  <div className="relative mb-2">
                    {isFirst && <Crown className="w-5 h-5 text-white mx-auto mb-0.5" />}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl sp-inset border-2 ${
                        entry.isSelf ? 'border-white' : 'border-white/20'
                      }`}
                    >
                      {entry.avatar}
                    </div>
                    <span
                      className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full border text-[10px] font-extrabold flex items-center justify-center ${
                        isFirst ? 'sp-btn-primary' : 'sp-badge'
                      }`}
                    >
                      {entry.displayRank}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white truncate max-w-full">
                    {entry.displayName}
                  </div>
                  <div className="text-[11px] font-mono-num font-bold text-slate-300 mb-1.5">
                    {formatStudyActivity(entry.rankSeconds)}
                  </div>
                  <div
                    className={`w-full ${heightClass} rounded-t-2xl backdrop-blur-md flex flex-col items-center justify-center gap-1 ${pedestalGlass}`}
                  >
                    <span className="text-[10px] font-bold text-slate-200 flex items-center gap-0.5">
                      <Flame className="w-3 h-3" />
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
        <div className="glass-card rounded-3xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl sp-badge flex items-center justify-center">
                <Swords className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                  ⚔️ 1v1 Cohort Trial
                </h3>
                <p className="text-[11px] text-slate-400">Head-to-head Sleeper focus rivalry</p>
              </div>
            </div>

            {friends.length > 1 && (
              <select
                value={rival.id}
                onChange={(e) => setSelectedRivalId(Number(e.target.value))}
                className="px-2.5 py-1 rounded-xl sp-input text-[11px]"
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
                      <div className="font-mono-num text-slate-300">{formatMinsShort(myMins)}</div>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full sp-badge text-[10px] font-bold">
                    {diff >= 0
                      ? `Ahead by ${formatMinsShort(diff)}`
                      : `Trail by ${formatMinsShort(Math.abs(diff))}`}
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <div className="text-white">{rival.displayName}</div>
                      <div className="font-mono-num text-slate-400">{formatMinsShort(rivalMins)}</div>
                    </div>
                    <span className="text-lg">{rival.avatar}</span>
                  </div>
                </div>

                {/* Split Tug-of-War Bar */}
                <div className="h-3 rounded-full sp-inset overflow-hidden flex mb-3">
                  <motion.div
                    initial={{ width: '50%' }}
                    animate={{ width: `${Math.max(8, Math.min(92, myShare))}%` }}
                    transition={{ type: 'spring', stiffness: 180, damping: 24 }}
                    className="h-full"
                    style={{ backgroundColor: 'var(--sp-accent)' }}
                  />
                  <div className="flex-1 h-full bg-zinc-600/40" />
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => handleNudge(rival.id)}
                  className="w-full py-2.5 rounded-xl sp-badge text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{nudgedId === rival.id ? `Zapped ${rival.displayName}! ⚡` : `Nudge ${rival.displayName} to Lock In`}</span>
                </motion.button>
              </>
            );
          })()}
        </div>
      )}

      {/* Active 1v1 Focus Pact & Duel Chest */}
      {activeDuel && (
        <div className="glass-card rounded-3xl p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-8 h-8 rounded-xl sp-badge flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-white truncate">
                  🩸 7-Day Soul Oath vs {activeDuel.opponentAvatar} {activeDuel.opponentName}
                </div>
                <div className="text-[10px] text-slate-400">
                  Target: {activeDuel.targetMins}m · Reward: +{activeDuel.wagerCoins * 2} 🪙 + 50 XP
                </div>
              </div>
            </div>
            {activeDuel.status === 'won' && !activeDuel.claimed && onClaimDuel ? (
              <button
                type="button"
                onClick={onClaimDuel}
                className="px-3 py-1.5 rounded-xl sp-btn-primary text-[11px] font-extrabold cursor-pointer shrink-0"
              >
                Claim Chest
              </button>
            ) : onStartDuel && (
              <button
                type="button"
                onClick={() => onStartDuel({ opponentId: rival?.id || null, targetMins: 60, wagerCoins: 20 })}
                className="px-2.5 py-1.5 rounded-xl sp-badge text-[10px] font-bold cursor-pointer shrink-0"
              >
                New 60m Pact
              </button>
            )}
          </div>
          <div className="h-2 rounded-full sp-inset overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, Math.round((activeDuel.userMins / Math.max(1, activeDuel.targetMins)) * 100))}%`,
                backgroundColor: 'var(--sp-accent)',
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono-num text-slate-400">
            <span>You: {activeDuel.userMins}/{activeDuel.targetMins}m</span>
            <span>{activeDuel.opponentName}: {activeDuel.opponentMins}m</span>
          </div>
        </div>
      )}

      {/* Remaining Leaderboard Ranks */}
      {rest.length > 0 && (
        <div className="glass-card rounded-3xl p-3 space-y-1.5">
          {rest.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-2.5 rounded-2xl transition border ${
                entry.isSelf ? 'sp-tab-active' : 'sp-inset border-white/5'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 text-center font-mono-num text-xs font-extrabold text-slate-400">
                  #{entry.displayRank}
                </span>
                <span className="w-9 h-9 rounded-xl sp-inset flex items-center justify-center text-lg shrink-0">
                  {entry.avatar}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                    {entry.displayName}
                    {entry.isSelf && <span className="text-[10px] text-slate-400">(You)</span>}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Lv.{entry.level} • {subject ? selectedLabel : entry.topSubject} • 🔥 {entry.streakDays}d
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono-num text-xs font-extrabold text-white">
                  {formatStudyActivity(entry.rankSeconds)}
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
          <h3 className="text-sm font-extrabold text-white">🛡️ Awakened Cohort & Peers</h3>
          <span className="text-xs text-slate-400">{friends.length} allies</span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Find peers by name or @username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl sp-input text-xs"
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
                className="flex items-center justify-between gap-2 p-2.5 rounded-2xl sp-inset"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl sp-badge flex items-center justify-center text-xl">
                      {peer.avatar}
                    </div>
                    {peer.isOnline && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-950"
                        style={{ backgroundColor: 'var(--sp-accent)' }}
                      />
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
                    peer.isFriend ? 'sp-badge' : 'sp-btn-primary'
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
