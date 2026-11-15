import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Share2, ShieldCheck, Flame, Coins, X, Download, Coffee } from 'lucide-react';
import { Subject, TimerMode, User } from '../types';
import { formatClock } from './FocusView';

interface SessionCompleteModalProps {
  user: User;
  subject: Subject;
  mode: TimerMode;
  durationSec: number;
  purityPct: number;
  strictMode?: boolean;
  initialNote?: string;
  onSave: (payload: { note: string; shareToFeed: boolean; startBreakAfter?: boolean }) => Promise<void>;
  onDiscard: () => void;
}

export function SessionCompleteModal({
  user,
  subject,
  mode,
  durationSec,
  purityPct,
  strictMode = false,
  initialNote,
  onSave,
  onDiscard,
}: SessionCompleteModalProps) {
  const [note, setNote] = useState(initialNote || '');
  const [shareToFeed, setShareToFeed] = useState(true);
  const [saving, setSaving] = useState(false);

  const mins = Math.max(1, Math.round(durationSec / 60));
  const purityBonus = purityPct >= 95 ? 35 : purityPct >= 80 ? 15 : 0;
  const baseXp = Math.max(20, mins * 12 + purityBonus);
  const estXp = strictMode && purityPct >= 95 ? Math.round(baseXp * 1.25) : baseXp;
  const estCoins = Math.max(5, Math.round(estXp / 10));

  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await onSave({ note, shareToFeed });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAndBreak() {
    if (saving) return;
    setSaving(true);
    try {
      await onSave({ note, shareToFeed: false, startBreakAfter: true });
    } finally {
      setSaving(false);
    }
  }

  function handleDownloadCard() {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#060A14';
    ctx.fillRect(0, 0, 900, 500);

    const g1 = ctx.createRadialGradient(180, 110, 20, 180, 110, 420);
    g1.addColorStop(0, `${subject.color || '#10B981'}55`);
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, 900, 500);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(36, 36, 828, 428, 32);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#6EE7B7';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('STUDYPULSE • VERIFIED FOCUS BLOCK', 72, 88);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(`${subject.icon} ${subject.name}`, 72, 146);

    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`${user.displayName} (@${user.username}) • ${Math.max(1, user.streakDays)}d streak`, 72, 184);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 72px monospace';
    ctx.fillText(formatClock(durationSec), 72, 290);

    ctx.fillStyle = '#34D399';
    ctx.font = 'bold 32px monospace';
    ctx.fillText(`${purityPct}% Purity`, 410, 272);

    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 32px monospace';
    ctx.fillText(`+${estXp} XP`, 410, 316);

    if (note.trim()) {
      ctx.fillStyle = '#CBD5E1';
      ctx.font = 'italic 22px sans-serif';
      ctx.fillText(`"${note.trim().slice(0, 62)}"`, 72, 392);
    }

    const link = document.createElement('a');
    link.download = `studypulse-${subject.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        className="w-full max-w-md glass-card rounded-3xl p-5 border border-emerald-400/35 relative"
      >
        <button
          type="button"
          onClick={onDiscard}
          className="absolute top-4 right-4 p-1.5 rounded-full glass-pill text-slate-400 hover:text-white cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-xs font-extrabold text-emerald-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Focus Block Complete!
          </div>
          <h2 className="text-xl font-extrabold text-white">Awesome Lock-In, {user.displayName}</h2>
        </div>

        {/* Visual Strava-style Share Card Preview */}
        <div
          className="rounded-2xl p-4 mb-4 border border-white/15 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${subject.color}28 0%, rgba(15,23,42,0.95) 65%)`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{subject.icon}</span>
              <div>
                <div className="text-xs font-extrabold text-white">{subject.name}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">{mode} block</div>
              </div>
            </div>
            <div className="text-xs font-bold text-orange-300 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> {Math.max(1, user.streakDays)}d streak
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-[10px] text-slate-400">Time</div>
              <div className="font-mono-num text-lg font-extrabold text-white">{formatClock(durationSec)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Purity
              </div>
              <div className="font-mono-num text-lg font-extrabold text-emerald-300">{purityPct}%</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Reward</div>
              <div className="font-mono-num text-lg font-extrabold text-amber-300">+{estXp} XP</div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400">
              {strictMode && purityPct >= 95 ? '🔒 Strict Lock 1.25x XP active' : 'Shareable card ready'}
            </span>
            <button
              type="button"
              onClick={handleDownloadCard}
              className="px-2.5 py-1 rounded-full liquid-pill text-[11px] font-bold text-cyan-200 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" /> Download PNG
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              What did you accomplish? (optional)
            </label>
            <textarea
              rows={2}
              maxLength={240}
              placeholder="e.g. Solved 3 dynamic programming problems cleanly..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/75 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 resize-none"
            />
          </div>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-white/5 cursor-pointer">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>Share card to Friends Feed</span>
            </div>
            <input
              type="checkbox"
              checked={shareToFeed}
              onChange={(e) => setShareToFeed(e.target.checked)}
              className="w-4 h-4 accent-emerald-400"
            />
          </label>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onDiscard}
              className="px-3.5 py-3 rounded-xl glass-pill text-xs font-bold text-slate-300 cursor-pointer"
            >
              Discard
            </button>
            {mode !== 'break' && (
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveAndBreak}
                className="px-3 py-3 rounded-xl liquid-pill text-xs font-bold text-amber-200 flex items-center gap-1 cursor-pointer hover:bg-white/10"
              >
                <Coffee className="w-3.5 h-3.5" /> 5m Break
              </button>
            )}
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={saving}
              type="submit"
              className="flex-1 py-3 rounded-xl liquid-btn-primary text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{saving ? 'Logging...' : 'Claim Rewards & Log'}</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-950/15">
                <Coins className="w-3 h-3" /> +{estCoins}
              </span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
