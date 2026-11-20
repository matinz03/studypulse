import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, ShieldCheck, Sparkles, Flame, Clock } from 'lucide-react';
import { FeedItem } from '../types';
import { ThemeId, getThemeMeta } from '../themes';

interface FeedViewProps {
  themeId?: ThemeId;
  feed: FeedItem[];
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

export function FeedView({ themeId = 'shadcn-dark', feed, onReact, onComment, onJumpToFocus }: FeedViewProps) {
  const [filter, setFilter] = useState<'all' | 'friends'>('all');
  const [openCommentsId, setOpenCommentsId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const themeMeta = getThemeMeta(themeId);

  const items = useMemo(
    () => (filter === 'friends' ? feed.filter((f) => f.isFriend) : feed),
    [feed, filter]
  );

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="grid grid-cols-2 p-1 rounded-2xl glass-card flex-1 max-w-[230px]">
          {(
            [
              ['all', 'Everyone'],
              ['friends', 'Friends'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`relative py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                filter === k ? 'text-white' : 'text-slate-400'
              }`}
            >
              {filter === k && (
                <motion.div
                  layoutId="feedFilterPill"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-xl sp-tab-active"
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.94 }}
          type="button"
          onClick={onJumpToFocus}
          className="px-3 py-2 rounded-2xl sp-btn-primary text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
        >
          <Flame className="w-3.5 h-3.5" /> Log Session
        </motion.button>
      </div>

      {items.length === 0 ? (
        <div className="glass-card rounded-3xl p-8 text-center">
          <p className="text-sm font-bold text-white">
            {filter === 'friends' ? 'No friend posts yet' : 'No study sessions shared yet'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Add study peers in Compete or finish a session to kick off the feed!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const commentsOpen = openCommentsId === item.id || item.comments.length > 0;
            return (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl p-4 relative overflow-hidden"
              >
                {/* Top subtle hairline accent */}
                <div
                  className="absolute inset-x-0 top-0 h-[2px] opacity-35"
                  style={{ backgroundColor: themeMeta.colors.accent }}
                />

                {/* Author Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl sp-inset flex items-center justify-center text-xl shrink-0">
                      {item.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-white truncate">
                          {item.displayName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md sp-badge text-[10px] font-bold">
                          Lv.{item.level}
                        </span>
                        {item.streakDays >= 2 && (
                          <span className="px-1.5 py-0.5 rounded-md sp-badge text-[10px] font-bold">
                            🔥 {item.streakDays}d
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        @{item.username} • {relativeTime(item.createdAt)}
                      </div>
                    </div>
                  </div>

                  <span className="shrink-0 px-2.5 py-1 rounded-full sp-badge text-[11px] font-bold">
                    {item.subjectName}
                  </span>
                </div>

                {/* Strava-style Session Stat Strip */}
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
                    "{item.note}"
                  </p>
                )}

                {/* Proof Milestone Badges */}
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {item.purityPct >= 95 && (
                    <span className="px-2 py-0.5 rounded-full sp-badge text-[10px] font-bold">
                      🛡️ Laser Lock
                    </span>
                  )}
                  {item.durationSec >= 2700 && (
                    <span className="px-2 py-0.5 rounded-full sp-badge text-[10px] font-bold">
                      🌊 Deep Dive
                    </span>
                  )}
                  {/Architect|Data|Cloud|Internet|OSPF|BGP|CIDR/i.test(item.subjectName) && (
                    <span className="px-2 py-0.5 rounded-full sp-badge text-[10px] font-bold">
                      🎓 University Vault
                    </span>
                  )}
                  {item.xpEarned >= 120 && (
                    <span className="px-2 py-0.5 rounded-full sp-badge text-[10px] font-bold">
                      ⚔️ Raid Striker
                    </span>
                  )}
                </div>

                {/* Reaction Bar + Comment Toggle */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {item.reactions.map((r) => (
                      <motion.button
                        key={r.emoji}
                        whileTap={{ scale: 0.85 }}
                        type="button"
                        onClick={() => onReact(item.id, r.emoji)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer transition border ${
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
                    className="px-2.5 py-1 rounded-full sp-badge text-xs font-semibold hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{item.comments.length}</span>
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

                      <form onSubmit={(e) => submitComment(e, item.id)} className="flex items-center gap-1.5 pt-1">
                        <input
                          type="text"
                          maxLength={200}
                          placeholder="Drop kudos or a quick note..."
                          value={drafts[item.id] || ''}
                          onChange={(e) => setDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          className="flex-1 px-3 py-1.5 rounded-xl sp-input text-xs"
                        />
                        <button
                          type="submit"
                          disabled={submittingId === item.id}
                          className="p-2 rounded-xl sp-btn-primary cursor-pointer"
                          aria-label="Send comment"
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
