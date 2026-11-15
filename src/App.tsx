import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Users, Trophy, Flame, User as UserIcon, Coins, Radio, Zap } from 'lucide-react';
import { AuthScreen } from './components/AuthScreen';
import { FocusView, formatClock } from './components/FocusView';
import { RoomsView } from './components/RoomsView';
import { CompeteView } from './components/CompeteView';
import { FeedView } from './components/FeedView';
import { ProfileView } from './components/ProfileView';
import { SessionCompleteModal } from './components/SessionCompleteModal';
import { BootstrapData, FloatingEmoji, Subject, TabKey, TimerMode, User } from './types';
import { soundEngine, SoundPreset } from './utils/soundEngine';

const TOKEN_KEY = 'studypulse_token';

const TARGETS: Record<TimerMode, number> = {
  pomodoro: 25 * 60,
  deep: 50 * 60,
  stopwatch: 0,
  sprint: 60,
};

interface ToastMsg {
  id: number;
  text: string;
}

export function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [data, setData] = useState<BootstrapData | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [tab, setTab] = useState<TabKey>('focus');

  // Timer state
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [purityPct, setPurityPct] = useState(100);
  const [wakeLocked, setWakeLocked] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number>(1);
  const [soundPreset, setSoundPreset] = useState<SoundPreset>('off');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [pendingDurationSec, setPendingDurationSec] = useState(0);
  const [focusTask, setFocusTask] = useState('');

  // Realtime UI state
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  const pushToast = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const spawnEmoji = useCallback((emoji: string, sender: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const xOffset = 10 + Math.floor(Math.random() * 78);
    setFloatingEmojis((prev) => [...prev.slice(-14), { id, emoji, xOffset, sender }]);
    window.setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((x) => x.id !== id));
    }, 2400);
  }, []);

  const apiFetch = useCallback(
    async (url: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers || {});
      if (token) headers.set('Authorization', `Bearer ${token}`);
      if (init?.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
      const res = await fetch(url, { ...init, headers });
      if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setData(null);
        throw new Error('Session expired');
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Request failed');
      return json;
    },
    [token]
  );

  const refreshBootstrap = useCallback(async () => {
    if (!token) return;
    try {
      const boot: BootstrapData = await apiFetch('/api/bootstrap');
      setData(boot);
      if (boot.subjects.length > 0) {
        setSelectedSubjectId((prev) =>
          prev && boot.subjects.some((s) => s.id === prev) ? prev : boot.subjects[0].id
        );
      }
      if (boot.rooms.length > 0) {
        setSelectedRoomId((prev) =>
          boot.rooms.some((r) => r.id === prev) ? prev : boot.rooms[0].id
        );
      }
    } catch {
      // handled cleanly in apiFetch
    } finally {
      setLoading(false);
    }
  }, [token, apiFetch]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      refreshBootstrap();
    } else {
      setLoading(false);
    }
  }, [token, refreshBootstrap]);

  const activeSubject: Subject = useMemo(() => {
    const subs = data?.subjects || [];
    return subs.find((s) => s.id === selectedSubjectId) || subs[0] || { id: 0, name: 'Deep Focus', color: '#10B981', icon: '⚡' };
  }, [data?.subjects, selectedSubjectId]);

  const currentRoom = useMemo(() => {
    const rooms = data?.rooms || [];
    return rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  }, [data?.rooms, selectedRoomId]);

  // WebSocket Connection
  useEffect(() => {
    if (!token || !data?.user) return;
    let closedByUs = false;
    let reconnectTimer: number | null = null;

    function connect() {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${proto}//${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'auth', token }));
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type === 'presence_snapshot' && Array.isArray(msg.rooms)) {
            setData((prev) =>
              prev
                ? {
                    ...prev,
                    rooms: msg.rooms,
                    onlineCount: msg.rooms.reduce((acc: number, r: { activeCount: number }) => acc + r.activeCount, 0),
                  }
                : prev
            );
          } else if (msg.type === 'room_reaction') {
            if (msg.username !== data?.user.username) {
              spawnEmoji(msg.emoji, msg.displayName || msg.username);
            }
          } else if (msg.type === 'nudge' && msg.toUserId === data?.user.id) {
            pushToast(`${msg.fromAvatar || '⚡'} ${msg.fromDisplayName} nudged you to lock in!`);
          } else if (msg.type === 'session_completed' && msg.userId !== data?.user.id) {
            pushToast(`${msg.displayName} just logged ${Math.max(1, Math.round(msg.durationSec / 60))}m on ${msg.subjectName}!`);
          }
        } catch {
          // ignore malformed ws message
        }
      };

      ws.onclose = () => {
        if (!closedByUs) {
          reconnectTimer = window.setTimeout(connect, 2500);
        }
      };
    }

    connect();
    return () => {
      closedByUs = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [token, data?.user?.id, data?.user?.username, pushToast, spawnEmoji]);

  // Sync live study presence over WS whenever state changes
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !data?.user) return;
    ws.send(
      JSON.stringify({
        type: 'timer_sync',
        status: isRunning ? 'studying' : elapsedSec > 0 ? 'break' : 'idle',
        roomId: selectedRoomId,
        subjectName: activeSubject.name,
        subjectColor: activeSubject.color,
        elapsedSec,
        mode,
      })
    );
  }, [isRunning, selectedRoomId, activeSubject.name, activeSubject.color, mode, data?.user?.id]);

  // High-accuracy Focus Timer Ticker
  useEffect(() => {
    if (!isRunning) return;
    lastTickRef.current = Date.now();

    const interval = window.setInterval(() => {
      const now = Date.now();
      const deltaSec = Math.floor((now - lastTickRef.current) / 1000);
      if (deltaSec >= 1) {
        lastTickRef.current += deltaSec * 1000;
        setElapsedSec((prev) => {
          const next = prev + deltaSec;
          const target = TARGETS[mode];
          if (mode !== 'stopwatch' && target > 0 && next >= target) {
            setIsRunning(false);
            setPendingDurationSec(target);
            setShowCompleteModal(true);
            return target;
          }
          return next;
        });
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [isRunning, mode]);

  // Focus Purity Shield (Page Visibility)
  useEffect(() => {
    function handleVisibility() {
      if (!isRunning) return;
      if (document.hidden) {
        setPurityPct((p) => Math.max(40, p - 4));
      } else {
        pushToast('Focus Purity dipped slightly while away — stay locked in! 🛡️');
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isRunning, pushToast]);

  // Screen Wake Lock while actively studying on phone
  useEffect(() => {
    let active = true;
    async function manageWakeLock() {
      if (isRunning && 'wakeLock' in navigator) {
        try {
          const nav = navigator as unknown as { wakeLock: { request: (t: string) => Promise<{ release: () => Promise<void> }> } };
          const sentinel = await nav.wakeLock.request('screen');
          if (active) {
            wakeLockRef.current = sentinel;
            setWakeLocked(true);
          } else {
            await sentinel.release();
          }
        } catch {
          setWakeLocked(false);
        }
      } else if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
        } catch {
          // ignore
        }
        wakeLockRef.current = null;
        setWakeLocked(false);
      }
    }
    manageWakeLock();
    return () => {
      active = false;
    };
  }, [isRunning]);

  // Cleanup audio on unmount / logout
  useEffect(() => () => soundEngine.stop(), []);

  function handleAuthSuccess(newToken: string, user: User) {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    pushToast(`Welcome, ${user.displayName}! Ready to lock in 🔥`);
  }

  function handleLogout() {
    soundEngine.stop();
    setSoundPreset('off');
    setIsRunning(false);
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setData(null);
  }

  function handleChangeMode(m: TimerMode) {
    if (isRunning) {
      pushToast('Pause or finish the current block before switching modes.');
      return;
    }
    setMode(m);
    setElapsedSec(0);
    setPurityPct(100);
  }

  function handleChangeSound(preset: SoundPreset) {
    setSoundPreset(preset);
    soundEngine.setPreset(preset);
  }

  function handleBoost5m() {
    const added = 5 * 60;
    const next = elapsedSec + added;
    setElapsedSec(next);
    pushToast('+5m focus boost applied ⚡');
  }

  function handleOpenFinish() {
    if (elapsedSec < 5) return;
    setIsRunning(false);
    setPendingDurationSec(elapsedSec);
    setShowCompleteModal(true);
  }

  async function handleSaveSession({ note, shareToFeed }: { note: string; shareToFeed: boolean }) {
    const res = await apiFetch('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        subjectName: activeSubject.name,
        subjectColor: activeSubject.color,
        mode,
        durationSec: pendingDurationSec || elapsedSec,
        purityPct,
        note,
        shareToFeed,
        roomId: selectedRoomId,
      }),
    });
    setShowCompleteModal(false);
    setElapsedSec(0);
    setPurityPct(100);
    setFocusTask('');
    await refreshBootstrap();
    pushToast(`+${res.xpEarned} XP & +${res.coinsEarned} Coins earned! Streak: ${res.newStreak}d 🔥`);
    if (shareToFeed) setTab('feed');
  }

  async function handleCreateSubject(name: string, color: string, icon: string) {
    const created: Subject = await apiFetch('/api/subjects', {
      method: 'POST',
      body: JSON.stringify({ name, color, icon }),
    });
    await refreshBootstrap();
    setSelectedSubjectId(created.id);
    pushToast(`Added subject "${created.name}"`);
  }

  async function handleCreateRoom(name: string, topic: string, icon: string, accent: string) {
    const created = await apiFetch('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ name, topic, icon, accent }),
    });
    await refreshBootstrap();
    setSelectedRoomId(created.id);
    pushToast(`Opened room "${created.name}"`);
  }

  function handleSendCheer(emoji: string) {
    if (!data?.user) return;
    spawnEmoji(emoji, data.user.displayName);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'room_reaction',
          roomId: selectedRoomId,
          emoji,
        })
      );
    }
  }

  async function handleToggleFriend(friendId: number) {
    const res = await apiFetch('/api/friends/toggle', {
      method: 'POST',
      body: JSON.stringify({ friendId }),
    });
    await refreshBootstrap();
    pushToast(res.isFriend ? 'Added to your Study Squad 🤝' : 'Removed from friends');
  }

  async function handleNudgeFriend(friendId: number) {
    const res = await apiFetch('/api/friends/nudge', {
      method: 'POST',
      body: JSON.stringify({ friendId }),
    });
    pushToast(`Sent live zap to ${res.targetDisplayName} ⚡`);
  }

  async function handleReactFeed(sessionId: number, emoji: string) {
    await apiFetch(`/api/feed/${sessionId}/react`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    });
    await refreshBootstrap();
  }

  async function handleCommentFeed(sessionId: number, content: string) {
    await apiFetch(`/api/feed/${sessionId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    await refreshBootstrap();
  }

  async function handleUpdateProfile(payload: { displayName?: string; bio?: string; dailyGoalMins?: number }) {
    await apiFetch('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    await refreshBootstrap();
    pushToast('Profile updated ✨');
  }

  if (!token) {
    return <AuthScreen onSuccess={handleAuthSuccess} />;
  }

  if (loading || !data) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-3 text-slate-300">
        <div className="w-12 h-12 rounded-2xl border-2 border-emerald-400 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">
          Syncing StudyPulse...
        </p>
      </div>
    );
  }

  const navItems: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'focus', label: 'Focus', icon: Timer },
    { key: 'rooms', label: 'Rooms', icon: Users },
    { key: 'compete', label: 'Compete', icon: Trophy },
    { key: 'feed', label: 'Feed', icon: Flame },
    { key: 'me', label: 'Me', icon: UserIcon },
  ];

  const user = data.user;

  return (
    <div className="min-h-[100dvh] w-full relative">
      {/* Hidden SVG Displacement Filter for Liquid Glass Refraction */}
      <svg aria-hidden="true" className="hidden" width="0" height="0">
        <defs>
          <filter id="liquid-refraction" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.018"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Living Aurora Backdrop */}
      <div className="aurora-bg">
        <div className="aurora-orb-a" />
        <div className="aurora-orb-b" />
      </div>

      {/* Live Toast Notifications (Mobile Snackbar above fixed dock) */}
      <div className="fixed bottom-24 left-1/2 lg:left-[calc(50%-192px)] -translate-x-1/2 z-[110] w-[calc(100vw-24px)] max-w-[440px] flex flex-col items-center gap-2 pointer-events-none px-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.94 }}
              className="px-4 py-2 rounded-full liquid-dock border border-emerald-400/50 text-xs font-bold text-white"
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Responsive Container (Mobile Single Column -> Desktop App + Companion Panel) */}
      <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-[minmax(0,480px)_minmax(0,360px)] lg:justify-center lg:gap-6 lg:px-6">
        {/* Primary Mobile-First Column */}
        <div className="w-full max-w-[480px] mx-auto min-h-[100dvh] flex flex-col relative z-10">
          {/* Floating Liquid Glass Header */}
          <header className="sticky top-2 z-30 mx-3 sm:mx-4 mt-2 pt-safe px-3.5 py-2.5 rounded-[26px] liquid-dock">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setTab('me')}
                  className="w-9 h-9 rounded-xl bg-slate-900 border flex items-center justify-center text-lg shrink-0 cursor-pointer"
                  style={{ borderColor: user.themeColor }}
                >
                  {user.avatar}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-white truncate">{user.displayName}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-violet-500/20 text-[10px] font-extrabold text-violet-200">
                      Lv.{user.level}
                    </span>
                  </div>
                  <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                      style={{ width: `${user.levelProgressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className="px-2 py-1 rounded-full bg-orange-500/15 border border-orange-400/30 text-[11px] font-extrabold text-orange-300 flex items-center gap-1"
                  title="Study streak"
                >
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span className="font-mono-num">{user.streakDays}</span>
                </span>
                <span
                  className="px-2 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-[11px] font-extrabold text-amber-300 flex items-center gap-1"
                  title="Focus coins"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono-num">{user.coins}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setTab('rooms')}
                  className="px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[11px] font-bold text-emerald-300 flex items-center gap-1 cursor-pointer"
                  title="Live online studiers"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono-num">{data.onlineCount}</span>
                </button>
              </div>
            </div>
          </header>

          {/* Scrollable Active Tab Content */}
          <main className="flex-1 px-3.5 sm:px-4 pt-3 pb-32">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16 }}
              >
                {tab === 'focus' && (
                  <FocusView
                    mode={mode}
                    onChangeMode={handleChangeMode}
                    isRunning={isRunning}
                    onToggleRun={() => setIsRunning((r) => !r)}
                    elapsedSec={elapsedSec}
                    targetSec={TARGETS[mode]}
                    onBoost5m={handleBoost5m}
                    onFinishSession={handleOpenFinish}
                    subjects={data.subjects}
                    activeSubject={activeSubject}
                    onSelectSubject={(s) => setSelectedSubjectId(s.id)}
                    onCreateSubject={handleCreateSubject}
                    purityPct={purityPct}
                    wakeLocked={wakeLocked}
                    soundPreset={soundPreset}
                    onChangeSound={handleChangeSound}
                    currentRoom={currentRoom}
                    onGoToRooms={() => setTab('rooms')}
                    todayMins={user.todayMins}
                    dailyGoalMins={user.dailyGoalMins}
                    focusTask={focusTask}
                    onChangeFocusTask={setFocusTask}
                  />
                )}

                {tab === 'rooms' && (
                  <RoomsView
                    rooms={data.rooms}
                    selectedRoomId={selectedRoomId}
                    onSelectRoom={(id) => {
                      setSelectedRoomId(id);
                      pushToast('Switched desk seat! 🪑');
                    }}
                    onCreateRoom={handleCreateRoom}
                    floatingEmojis={floatingEmojis}
                    onSendCheer={handleSendCheer}
                    currentUserId={user.id}
                    isRunning={isRunning}
                    onJumpToFocus={() => setTab('focus')}
                  />
                )}

                {tab === 'compete' && (
                  <CompeteView
                    user={user}
                    leaderboards={data.leaderboards}
                    directory={data.directory}
                    onToggleFriend={handleToggleFriend}
                    onNudgeFriend={handleNudgeFriend}
                  />
                )}

                {tab === 'feed' && (
                  <FeedView
                    feed={data.feed}
                    onReact={handleReactFeed}
                    onComment={handleCommentFeed}
                    onJumpToFocus={() => setTab('focus')}
                  />
                )}

                {tab === 'me' && (
                  <ProfileView
                    user={user}
                    heatmap={data.heatmap}
                    weekTrend={data.weekTrend}
                    subjectBreakdown={data.subjectBreakdown}
                    achievements={data.achievements}
                    onUpdateProfile={handleUpdateProfile}
                    onLogout={handleLogout}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Desktop Companion Sidebar (>= 1024px) */}
        <aside className="hidden lg:flex flex-col gap-4 py-6 sticky top-0 h-[100dvh] overflow-y-auto no-scrollbar z-10">
          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Study Pulse
              </span>
              <span className="font-mono-num text-xs font-bold text-slate-300">
                {data.onlineCount} studying now
              </span>
            </div>
            <div className="space-y-2">
              {data.rooms.slice(0, 3).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setSelectedRoomId(r.id);
                    setTab('rooms');
                  }}
                  className="w-full p-2.5 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-emerald-400/30 flex items-center justify-between text-left cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg">{r.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{r.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{r.topic}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono-num text-[11px] font-bold shrink-0">
                    {r.activeCount} live
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Weekly Top 5
              </span>
              <button
                type="button"
                onClick={() => setTab('compete')}
                className="text-[11px] font-bold text-cyan-300 hover:underline cursor-pointer"
              >
                Full Standings
              </button>
            </div>
            <div className="space-y-2">
              {data.leaderboards.week.slice(0, 5).map((e) => (
                <div
                  key={e.id}
                  className={`flex items-center justify-between p-2 rounded-xl ${
                    e.isSelf ? 'bg-emerald-500/15 border border-emerald-400/30' : 'bg-slate-950/45'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 text-[11px] font-mono-num font-bold text-slate-400">#{e.rank}</span>
                    <span className="text-base">{e.avatar}</span>
                    <span className="text-xs font-bold text-white truncate">{e.displayName}</span>
                  </div>
                  <span className="font-mono-num text-xs font-bold text-emerald-300">
                    {(e.minutes / 60).toFixed(1)}h
                  </span>
                </div>
              ))}
            </div>
          </div>

          {isRunning && (
            <div className="glass-card rounded-3xl p-4 border border-emerald-400/40 bg-emerald-950/20">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Active Focus Session
              </div>
              <div className="font-mono-num text-2xl font-extrabold text-white mt-1">
                {formatClock(elapsedSec)} • {activeSubject.name}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Soft Bottom Vignette Scrim behind Fixed Dock */}
      <div
        aria-hidden="true"
        className="fixed bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#050811]/90 via-[#050811]/40 to-transparent pointer-events-none z-[90]"
      />

      {/* True Viewport-Locked Fixed Liquid Glass Bottom Dock */}
      <nav
        aria-label="Primary Navigation"
        className="fixed bottom-3 left-1/2 lg:left-[calc(50%-192px)] -translate-x-1/2 z-[100] w-[calc(100vw-24px)] max-w-[440px]"
      >
        <div className="liquid-dock liquid-dock-lens rounded-[30px] p-1.5 grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            const hasLiveRooms = item.key === 'rooms' && data.onlineCount > 0;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`relative py-2 rounded-[22px] flex flex-col items-center justify-center gap-0.5 cursor-pointer transition ${
                  active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="navActivePill"
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    className="absolute inset-0 rounded-[22px] bg-gradient-to-b from-white/22 via-emerald-400/20 to-cyan-400/15 border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_4px_16px_rgba(16,185,129,0.2)]"
                  />
                )}
                <div className="relative z-10">
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-300' : ''}`} />
                  {hasLiveRooms && (
                    <span className="absolute -top-0.5 -right-1.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  )}
                </div>
                <span className="text-[10px] font-bold relative z-10">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Session Completion Celebration Modal */}
      <AnimatePresence>
        {showCompleteModal && (
          <SessionCompleteModal
            user={user}
            subject={activeSubject}
            mode={mode}
            durationSec={pendingDurationSec || elapsedSec}
            purityPct={purityPct}
            initialNote={focusTask}
            onSave={handleSaveSession}
            onDiscard={() => {
              setShowCompleteModal(false);
              setElapsedSec(0);
              setPurityPct(100);
              setFocusTask('');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
