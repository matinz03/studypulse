import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles, ArrowRight, Users, Trophy, Palette } from 'lucide-react';
import { User } from '../types';
import { ThemeId, getThemeMeta } from '../themes';

interface AuthScreenProps {
  onSuccess: (token: string, user: User) => void;
  themeId: ThemeId;
  onOpenThemeModal: () => void;
}

const AVATARS = ['🚀', '🔥', '⚡', '🦀', '🧠', '🦊', '🎧', '🌙'];
const COLORS = ['#FAFAFA', '#D4D4D8', '#A1A1AA', '#71717A', '#18181B'];

export function AuthScreen({ onSuccess, themeId, onOpenThemeModal }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('🚀');
  const [themeColor, setThemeColor] = useState('#FAFAFA');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const themeMeta = getThemeMeta(themeId);

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
      {/* Monochrome Spatial Backdrop */}
      <div className="aurora-bg">
        <div className="aurora-orb-a" />
        <div className="aurora-orb-b" />
      </div>

      {/* Floating Top-Right Select Theme Trigger */}
      <div className="fixed top-4 right-4 z-20">
        <button
          type="button"
          onClick={onOpenThemeModal}
          aria-label="Select theme"
          className="px-3 py-1.5 rounded-full liquid-dock text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>{themeMeta.name}</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Hero */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl liquid-dock flex items-center justify-center mb-3">
            <Flame className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">StudyPulse</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Focus together live. Protect your streak. Climb the board.
          </p>

          <div className="flex items-center gap-2 mt-4 text-[11px] font-semibold">
            <span className="sp-badge px-2.5 py-1 rounded-full flex items-center gap-1">
              <Users className="w-3 h-3" /> Live Rooms
            </span>
            <span className="sp-badge px-2.5 py-1 rounded-full flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Friend Duels
            </span>
            <span className="sp-badge px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Focus Spirit
            </span>
          </div>
        </div>

        {/* Main Shadcn Frosted Glass Auth Card */}
        <div className="glass-card rounded-3xl p-5 sm:p-6">
          {/* Segmented Mode Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-2xl sp-inset mb-5 relative">
            {(['login', 'register'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setMode(tab);
                  setError('');
                }}
                className={`relative z-10 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                  mode === tab ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === tab && (
                  <motion.div
                    layoutId="authTabPill"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute inset-0 rounded-xl sp-tab-active -z-10"
                  />
                )}
                {tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username</label>
              <input
                type="text"
                required
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="e.g. alex_focus"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl sp-input text-sm transition"
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Display Name</label>
                    <input
                      type="text"
                      placeholder="How friends see you"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl sp-input text-sm transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pick Avatar & Ring</label>
                    <div className="flex items-center justify-between gap-1.5 pb-1">
                      {AVATARS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setAvatar(em)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition cursor-pointer ${
                            avatar === em ? 'sp-tab-active scale-105' : 'sp-inset hover:border-white/25'
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
                          className={`w-6 h-6 rounded-md border border-white/25 transition cursor-pointer ${
                            themeColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-105' : 'opacity-70'
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={4}
                placeholder="At least 4 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl sp-input text-sm transition"
              />
            </div>

            {error && (
              <div className="px-3.5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-xs text-rose-300">
                {error}
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full py-3 rounded-xl sp-btn-primary font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
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
