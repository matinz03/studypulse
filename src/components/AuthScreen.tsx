import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles, ArrowRight, Users, Trophy } from 'lucide-react';
import { User } from '../types';

interface AuthScreenProps {
  onSuccess: (token: string, user: User) => void;
}

const AVATARS = ['🚀', '🔥', '⚡', '🦀', '🧠', '🦊', '🎧', '🌙'];
const COLORS = ['#10B981', '#06B6D4', '#8B5CF6', '#F97316', '#EC4899'];

export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('🚀');
  const [themeColor, setThemeColor] = useState('#10B981');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body =
        mode === 'login'
          ? { username, password }
          : { username, displayName: displayName || username, password, avatar, themeColor };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      onSuccess(data.token, data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center px-4 py-8 relative">
      {/* Living Aurora Backdrop */}
      <div className="aurora-bg">
        <div className="aurora-orb-a" />
        <div className="aurora-orb-b" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand hero */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-violet-500 p-[2px] shadow-[0_0_32px_rgba(16,185,129,0.35)] mb-3">
            <div className="w-full h-full rounded-[14px] bg-[#0B101D] flex items-center justify-center">
              <Flame className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
            StudyPulse
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Focus together live. Protect your streak. Climb the board.
          </p>

          <div className="flex items-center gap-3 mt-4 text-xs text-slate-300">
            <span className="glass-pill px-2.5 py-1 rounded-full flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" /> Live Rooms
            </span>
            <span className="glass-pill px-2.5 py-1 rounded-full flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Friend Duels
            </span>
            <span className="glass-pill px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Focus Spirit
            </span>
          </div>
        </div>

        {/* Main Glass Auth Card */}
        <div className="glass-card rounded-3xl p-5 sm:p-6">
          {/* Segmented Mode Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900/80 border border-white/5 mb-5 relative">
            {(['login', 'register'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setMode(tab);
                  setError('');
                }}
                className={`relative z-10 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                  mode === tab ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === tab && (
                  <motion.div
                    layoutId="authTabPill"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/25 to-cyan-500/25 border border-emerald-400/30 -z-10"
                  />
                )}
                {tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Username</label>
              <input
                type="text"
                required
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="e.g. alex_focus"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400/60 transition"
              />
            </div>

            <AnimatePresence initial={false}>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3.5 overflow-hidden"
                >
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Display Name</label>
                    <input
                      type="text"
                      placeholder="How friends see you"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400/60 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Pick Avatar & Glow</label>
                    <div className="flex items-center justify-between gap-1.5 pb-1">
                      {AVATARS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setAvatar(em)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition ${
                            avatar === em
                              ? 'bg-emerald-500/25 border-2 border-emerald-400 scale-110'
                              : 'bg-slate-900/70 border border-white/5 hover:border-white/20'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2.5 mt-2">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setThemeColor(c)}
                          className={`w-6 h-6 rounded-full transition ${
                            themeColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0D1422] scale-110' : 'opacity-70'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={4}
                placeholder="At least 4 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400/60 transition"
              />
            </div>

            {error && (
              <div className="px-3.5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200">
                {error}
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full py-3.5 rounded-xl liquid-btn-primary font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Connecting...' : mode === 'login' ? 'Sign In & Lock In' : 'Create Account & Start'}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
