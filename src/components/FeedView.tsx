import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Flame,
  Clock,
  Pencil,
  Check,
  X,
  Users,
  Globe,
  User as UserIcon,
} from 'lucide-react';
import { FeedFilters, FeedItem, LeaderboardEntry, SessionEditPayload, Subject, SubjectStat } from '../types';
import { SubcategoryInput, subjectSubcategories } from './SubcategoryInput';
import {
  StudyFilters, StudyMetrics, selectStudyActivity, studyFilterLabel, subcategoryKey, subcategoryOptions,
  subjectKey, subjectOptions,
} from './StudyFilters';
import { ThemeId, getThemeMeta, resolveAccent } from '../themes';

interface FeedViewProps {
  themeId?: ThemeId;
  feed: FeedItem[];
  publicLeaderboard: LeaderboardEntry[];
  onFetchFeed: (filters: FeedFilters) => Promise<FeedItem[]>;
  currentUserId?: number;
  subjects?: Subject[];
  subjectBreakdown?: SubjectStat[];
  onUpdateSession?: (
    sessionId: number,
    payload: SessionEditPayload
  ) => Promise<void>;
  onReact: (sessionId: number, emoji: string) => Promise<void>;
  onComment: (sessionId: number, content: string) => Promise<void>;
  onJumpToFocus: () => void;
}

function relativeTime(ts: number) {
  const diffMin = Math.max(0, Math.floor((Date.now() - ts) / 60_000));
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const hrs = Math.floor(diffMin / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDurationBadge(sec: number) {
  const mins = Math.max(1, Math.round(sec / 60));
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  if (sec < 60) return `${sec}s`;
  return `${mins}m`;
}

export function FeedView({
  themeId = 'shadcn-dark',
  feed,
  publicLeaderboard,
  onFetchFeed,
  currentUserId,
  subjects = [],
  subjectBreakdown = [],
  onUpdateSession,
  onReact,
  onComment,
  onJumpToFocus,
}: FeedViewProps) {
  const [filter, setFilter] = useState<FeedFilters['scope']>('all');
  const [filteredFeed, setFilteredFeed] = useState<{ key: string; items: FeedItem[] | null }>();
  const [subjectFilter, setSubjectFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [openCommentsId, setOpenCommentsId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [topicInput, setTopicInput] = useState('');
  const [subcategoryInput, setSubcategoryInput] = useState('');
  const [topicColor, setTopicColor] = useState<string | undefined>(undefined);
  const [noteInput, setNoteInput] = useState('');
  const [savingPostId, setSavingPostId] = useState<number | null>(null);

  const themeMeta = getThemeMeta(themeId);

  const scopedItems = useMemo(() => {
    if (filter === 'friends') {
      return feed.filter((f) => f.isFriend && f.userId !== currentUserId);
    }
    if (filter === 'mine') {
      return feed.filter((f) => f.userId === currentUserId);
    }
    return feed;
  }, [feed, filter, currentUserId]);

  const publicSubjects = useMemo(
    () => publicLeaderboard.flatMap((entry) => entry.subjectActivity?.filter((item) => item.subcategories.length) ?? []),
    [publicLeaderboard]
  );
  const availableSubjects = subjectOptions([
    ...subjects.map(({ name }) => name),
    ...subjectBreakdown.map(({ name }) => name),
    ...publicSubjects.map(({ name }) => name),
    ...feed.map(({ subjectName }) => subjectName),
  ]);
  const subject = availableSubjects.some((choice) => choice.value === subjectFilter) ? subjectFilter : '';
  const availableSubcategories = subject ? subcategoryOptions([
    ...subjectBreakdown
      .filter((item) => subjectKey(item.name) === subject)
      .flatMap((item) => item.subcategories?.map(({ name }) => name) ?? []),
    ...publicSubjects.filter((item) => subjectKey(item.name) === subject)
      .flatMap((item) => item.subcategories.map(({ name }) => name)),
    ...feed.filter((item) => subjectKey(item.subjectName) === subject).map((item) => item.subcategory),
  ]) : [];
  const subcategory = availableSubcategories.some((choice) => choice.value === subcategoryFilter) ? subcategoryFilter : '';
  const selectedLabel = studyFilterLabel(availableSubjects, availableSubcategories, subject, subcategory);
  const myActivity = selectStudyActivity(subjectBreakdown, subject, subcategory);
  const recentMatches = scopedItems.filter((item) =>
    (!subject || subjectKey(item.subjectName) === subject) && (!subcategory || subcategoryKey(item.subcategory) === subcategory)
  );

  const shouldFetch = filter !== 'all' || Boolean(subject || subcategory);
  const requestKey = JSON.stringify([filter, subject, subcategory]);
  const matchingResult = shouldFetch && filteredFeed?.key === requestKey ? filteredFeed : undefined;
  const isLoading = shouldFetch && !matchingResult;
  const items = matchingResult?.items ?? recentMatches;

  useEffect(() => {
    if (!shouldFetch) return;
    let cancelled = false;
    onFetchFeed({ scope: filter, subject, subcategory })
      .then((items) => { if (!cancelled) setFilteredFeed({ key: requestKey, items }); })
      .catch(() => { if (!cancelled) setFilteredFeed({ key: requestKey, items: null }); });
    return () => { cancelled = true; };
  }, [feed, filter, subject, subcategory, shouldFetch, requestKey, onFetchFeed]);

  function changeSubject(value: string) {
    setSubjectFilter(value);
    setSubcategoryFilter('');
  }

  async function submitComment(e: React.FormEvent, sessionId: number) {
    e.preventDefault();
    const text = (drafts[sessionId] || '').trim();
    if (!text || submittingId === sessionId) return;
    setSubmittingId(sessionId);
    try {
      await onComment(sessionId, text);
      setDrafts((prev) => ({ ...prev, [sessionId]: '' }));
    } finally {
      setSubmittingId(null);
    }
  }

  async function savePostEdit(sessionId: number, customName?: string, customColor?: string) {
    if (!onUpdateSession) return;
    const nextName = (customName ?? topicInput).trim().slice(0, 40);
    if (!nextName || savingPostId === sessionId) return;
    setSavingPostId(sessionId);
    try {
      await onUpdateSession(sessionId, {
        subjectName: nextName,
        subjectColor: customColor ?? topicColor,
        subcategory: customName !== undefined ? undefined : subcategoryInput,
        note: customName !== undefined ? undefined : noteInput,
      });
      setEditingPostId(null);
    } finally {
      setSavingPostId(null);
    }
  }

  const filterTabs = [
    { key: 'all' as const, label: 'Everyone', Icon: Globe },
    { key: 'friends' as const, label: 'Friends', Icon: Users },
    { key: 'mine' as const, label: 'Mine', Icon: UserIcon },
  ];

  return (
    <div className="studio-feed space-y-3.5">
      {/* Header Controls: 3-Way Scope Segmented Filter + Log Session CTA */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Study log scope"
          className="studio-segments studio-feed-filters"
        >
          {filterTabs.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
              className="focus-mode"
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.94 }}
          type="button"
          onClick={onJumpToFocus}
          className="focus-action-primary"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Log Session</span>
        </motion.button>
      </div>

      <StudyFilters
        subjects={availableSubjects}
        subcategories={availableSubcategories}
        subject={subject}
        subcategory={subcategory}
        onSubjectChange={changeSubject}
        onSubcategoryChange={setSubcategoryFilter}
      />

      <section className="studio-panel flex flex-wrap items-center justify-between gap-x-5 gap-y-3 p-3 sm:p-4" aria-label="Your study totals">
        <div className="min-w-0">
          <h2>Your study <span className="text-xs font-medium text-slate-400">· All time</span></h2>
          <p className="text-xs text-slate-400 wrap-anywhere">{selectedLabel}</p>
        </div>
        <StudyMetrics activity={myActivity} />
      </section>

      {matchingResult?.items === null && (
        <p className="text-xs text-slate-400" role="status">Showing matching posts from the recent feed.</p>
      )}
      {/* Feed Cards List */}
      {isLoading ? (
        <p className="studio-panel p-4 text-sm text-slate-400" role="status">Loading posts…</p>
      ) : items.length === 0 ? (
        <div className="glass-card rounded-3xl p-8 text-center space-y-2">
          <p className="text-sm font-extrabold text-white">
            {subject || subcategory ? 'No posts match these filters' : filter === 'friends'
              ? 'No friend study logs yet'
              : filter === 'mine'
                ? 'You have not shared any logs yet'
                : 'No study sessions shared yet'}
          </p>
          <p className="text-xs text-slate-400">
            {subject || subcategory ? 'Choose another subject or subcategory to see more posts.' : filter === 'friends'
              ? 'Add peers in Compete to see their focus logs here.'
              : 'Share a completed study session to see it here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const commentsOpen = openCommentsId === item.id || item.comments.length > 0;
            const isOwn = Boolean(currentUserId && item.userId === currentUserId);
            const postAccent = resolveAccent(item.subjectColor, themeId) || themeMeta.colors.accent;
            const isEditing = editingPostId === item.id;

            return (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl p-4 relative overflow-hidden"
              >
                {/* Top Subject Accent Bar */}
                <div
                  className="absolute inset-x-0 top-0 h-[2.5px] opacity-65"
                  style={{ backgroundColor: postAccent }}
                />

                {/* Author Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-2xl sp-inset flex items-center justify-center text-xl shrink-0 border"
                      style={{ borderColor: `${resolveAccent(item.themeColor, themeId)}55` }}
                    >
                      {item.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-extrabold text-white truncate">
                          {item.displayName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md sp-badge text-[10px] font-bold">
                          Lv.{item.level}
                        </span>
                        {item.streakDays >= 2 && (
                          <span className="px-1.5 py-0.5 rounded-md sp-badge text-[10px] font-mono-num font-bold inline-flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5" /> {item.streakDays}d
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        @{item.username} • {relativeTime(item.createdAt)}
                      </div>
                    </div>
                  </div>

                  {isOwn && onUpdateSession ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (isEditing) {
                          setEditingPostId(null);
                        } else {
                          setEditingPostId(item.id);
                          setTopicInput(item.subjectName);
                          setSubcategoryInput(item.subcategory ?? '');
                          setTopicColor(item.subjectColor);
                          setNoteInput(item.note || '');
                        }
                      }}
                      title="Edit session topic and subcategory"
                      className="shrink-0 min-h-[32px] px-2.5 py-1 rounded-full sp-badge text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer hover:opacity-90"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: postAccent }}
                      />
                      <span>{item.subjectName}</span>
                      <Pencil className="w-3 h-3 opacity-75" />
                    </button>
                  ) : (
                    <span className="shrink-0 px-2.5 py-1 rounded-full sp-badge text-[11px] font-bold inline-flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: postAccent }}
                      />
                      <span>{item.subjectName}</span>
                    </span>
                  )}
                </div>

                {item.subcategory && !isEditing && (
                  <div className="mb-2 inline-block max-w-full wrap-anywhere px-2 py-1 sp-badge text-xs">{item.subcategory}</div>
                )}

                {/* Inline Topic + Note Editor for Own Posts */}
                {isEditing && onUpdateSession && (
                  <div className="mb-3 p-3 rounded-2xl sp-inset border border-white/15 space-y-2">
                    {subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {subjects.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            disabled={savingPostId === item.id}
                            onClick={() => savePostEdit(item.id, sub.name, sub.color)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer border transition ${
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
                        savePostEdit(item.id);
                      }}
                      className="space-y-1.5"
                    >
                      <input
                        type="text"
                        maxLength={40}
                        value={topicInput}
                        onChange={(e) => {
                          if (e.target.value.trim().toLowerCase() !== topicInput.trim().toLowerCase()) setSubcategoryInput('');
                          setTopicInput(e.target.value);
                          setTopicColor(undefined);
                        }}
                        placeholder="Custom topic name..."
                        className="w-full px-3 py-1.5 rounded-xl sp-input text-xs"
                      />
                      <SubcategoryInput
                        value={subcategoryInput}
                        options={subjectSubcategories(topicInput, subjectBreakdown)}
                        onChange={setSubcategoryInput}
                      />
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          maxLength={240}
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="Session note (optional)..."
                          className="flex-1 px-3 py-1.5 rounded-xl sp-input text-xs"
                        />
                        <button
                          type="submit"
                          disabled={savingPostId === item.id || !topicInput.trim()}
                          className="px-3 py-1.5 rounded-xl sp-btn-primary text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer disabled:opacity-45"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{savingPostId === item.id ? 'Saving...' : 'Save'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPostId(null)}
                          className="w-8 h-8 rounded-xl sp-badge text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
                          aria-label="Cancel post edit"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Session Stat Strip */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl sp-inset mb-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Focus
                    </div>
                    <div className="font-mono-num text-sm font-extrabold text-white mt-0.5">
                      {formatDurationBadge(item.durationSec)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Purity
                    </div>
                    <div className="font-mono-num text-sm font-extrabold text-white mt-0.5">
                      {item.purityPct}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Earned
                    </div>
                    <div className="font-mono-num text-sm font-extrabold text-white mt-0.5">
                      +{item.xpEarned} XP
                    </div>
                  </div>
                </div>

                {item.note && (
                  <p className="text-xs text-slate-200 leading-relaxed mb-3 sp-inset px-3 py-2 rounded-xl">
                    &ldquo;{item.note}&rdquo;
                  </p>
                )}

                {/* Milestone Pills */}
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {item.purityPct >= 95 && (
                    <span className="px-2 py-0.5 rounded-full sp-success-pill text-[10px] font-bold inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> 95%+ Laser Lock
                    </span>
                  )}
                  {item.durationSec >= 2700 && (
                    <span className="px-2 py-0.5 rounded-full sp-badge text-[10px] font-bold inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Deep Block
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full sp-badge text-[10px] font-semibold uppercase tracking-wider">
                    {item.mode}
                  </span>
                </div>

                {/* Reaction Bar + Comment Toggle */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {item.reactions.map((r) => (
                      <motion.button
                        key={r.emoji}
                        whileTap={{ scale: 0.88 }}
                        type="button"
                        onClick={() => onReact(item.id, r.emoji)}
                        className={`min-h-[32px] px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer transition border ${
                          r.reacted ? 'sp-tab-active' : 'sp-badge hover:opacity-90'
                        }`}
                      >
                        <span>{r.emoji}</span>
                        {r.count > 0 && <span className="font-mono-num text-[11px]">{r.count}</span>}
                      </motion.button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpenCommentsId(openCommentsId === item.id ? null : item.id)}
                    className="min-h-[32px] px-2.5 py-1 rounded-full sp-badge text-xs font-semibold hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="font-mono-num">{item.comments.length}</span>
                  </button>
                </div>

                {/* Expandable Comments */}
                <AnimatePresence initial={false}>
                  {commentsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-white/10 space-y-2 overflow-hidden"
                    >
                      {item.comments.map((c) => (
                        <div key={c.id} className="flex items-start gap-2 text-xs">
                          <span className="text-sm shrink-0">{c.avatar}</span>
                          <div className="flex-1 sp-inset rounded-xl px-2.5 py-1.5">
                            <span className="font-bold text-white mr-1.5">{c.displayName}</span>
                            <span className="text-slate-300">{c.content}</span>
                          </div>
                        </div>
                      ))}

                      <form onSubmit={(e) => submitComment(e, item.id)} className="flex gap-1.5">
                        <input
                          type="text"
                          maxLength={180}
                          placeholder="Drop encouragement or a tip..."
                          value={drafts[item.id] || ''}
                          onChange={(e) => setDrafts((p) => ({ ...p, [item.id]: e.target.value }))}
                          className="flex-1 px-3 py-1.5 rounded-xl sp-input text-xs"
                        />
                        <button
                          type="submit"
                          disabled={submittingId === item.id || !(drafts[item.id] || '').trim()}
                          aria-label="Send comment"
                          className="px-3 py-1.5 rounded-xl sp-btn-primary text-xs font-bold flex items-center gap-1 disabled:opacity-45 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
