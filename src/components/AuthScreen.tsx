import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioLines, ArrowRight, Palette } from 'lucide-react';
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
    <main className="studio-auth">
      <header className="studio-auth-header">
        <div className="studio-brand">
          <span className="studio-mark"><AudioLines aria-hidden="true" /></span>
          <span>StudyPulse</span>
        </div>
        <button
          type="button"
          onClick={onOpenThemeModal}
          aria-label="Select theme"
          className="studio-icon-button"
          title={themeMeta.name}
        >
          <Palette size={17} aria-hidden="true" />
        </button>
      </header>

      <div className="studio-auth-layout">
        <div className="studio-auth-art">
          <div>
            <p>Find your focus.</p>
            <span>Study on your own or join a live room.</span>
          </div>
        </div>

        <section className="studio-auth-form" aria-labelledby="auth-heading">
          <h1 id="auth-heading">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          {/* Segmented Mode Switcher */}
          <div className="studio-auth-modes" role="group" aria-label="Account action">
            {(['login', 'register'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                aria-pressed={mode === tab}
                onClick={() => {
                  setMode(tab);
                  setError('');
                }}
                className="focus-mode"
              >
                {tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="studio-form-grid">
            <div>
              <label htmlFor="auth-username">Username</label>
              <input
                id="auth-username"
                name="username"
                type="text"
                autoComplete="username"
                spellCheck={false}
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
                    <label htmlFor="auth-display-name">Display Name</label>
                    <input
                      id="auth-display-name"
                      name="displayName"
                      type="text"
                      autoComplete="nickname"
                      placeholder="How friends see you"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl sp-input text-sm transition"
                    />
                  </div>

                  <div>
                    <p className="studio-form-legend">Avatar and ring color</p>
                    <div className="studio-avatar-options" role="group" aria-label="Avatar">
                      {AVATARS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setAvatar(em)}
                          aria-label={`Avatar ${em}`}
                          aria-pressed={avatar === em}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition cursor-pointer ${
                            avatar === em ? 'sp-tab-active scale-105' : 'sp-inset hover:border-white/25'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                    <div className="studio-color-options" role="group" aria-label="Ring color">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setThemeColor(c)}
                          aria-label={`Ring color ${c}`}
                          aria-pressed={themeColor === c}
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
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={4}
                placeholder="At least 4 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl sp-input text-sm transition"
              />
            </div>

            {error && (
              <div className="studio-auth-error" role="alert">
                {error}
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="focus-action-primary studio-auth-submit"
            >
              {loading ? 'Connecting…' : mode === 'login' ? 'Sign in' : 'Create account'}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </motion.button>
          </form>
        </section>
      </div>
    </main>
  );
}
