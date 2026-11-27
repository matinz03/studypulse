import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Timer,
  Users,
  Trophy,
  Flame,
  User as UserIcon,
  Coins,
  Radio,
  Zap,
  Bell,
  BellRing,
  PictureInPicture2,
  Play,
  Pause,
  Download,
  Palette,
  Swords,
} from 'lucide-react';
import { AuthScreen } from './components/AuthScreen';
import { FocusView, formatClock } from './components/FocusView';
import { QuestView } from './components/QuestView';
import { RoomsView } from './components/RoomsView';
import { CompeteView } from './components/CompeteView';
import { FeedView } from './components/FeedView';
import { ProfileView } from './components/ProfileView';
import { SessionCompleteModal } from './components/SessionCompleteModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import {
  BootstrapData,
  FloatingEmoji,
  GameActionResponse,
  IdleAutomationConfig,
  IdleGambitsConfig,
  SessionGameRewards,
  ShadowActionPayload,
  ShopBuyResponse,
  StudyTask,
  Subject,
  TabKey,
  TimerMode,
  User,
} from './types';
import { ThemeId, THEME_STORAGE_KEY, getThemeMeta, isValidThemeId, resolveAccent } from './themes';
import { soundEngine, SoundPreset, TrackKey } from './utils/soundEngine';
import { pipEngine } from './utils/pipEngine';

const TOKEN_KEY = 'studypulse_token';
const TIMER_STATE_KEY = 'studypulse_timer_state';

function getTargetSec(mode: TimerMode, customMins: number, bonusSec = 0) {
  switch (mode) {
    case 'pomodoro':
      return 25 * 60 + bonusSec;
    case 'deep':
      return 50 * 60 + bonusSec;
    case 'custom':
      return Math.max(5, customMins) * 60 + bonusSec;
    case 'break':
      return 5 * 60 + bonusSec;
    case 'sprint':
      return 60 + bonusSec;
    case 'stopwatch':
      return 0;
  }
}

function getModeLabel(mode: TimerMode) {
  switch (mode) {
    case 'pomodoro':
      return 'Pomodoro';
    case 'deep':
      return 'Deep Work';
    case 'custom':
      return 'Custom';
    case 'break':
      return 'Break';
    case 'sprint':
      return 'Sprint';
    case 'stopwatch':
      return 'Flow';
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PersistedTimerState {
  mode: TimerMode;
  customMins: number;
  bonusSec?: number;
  pomoCycleCount: number;
  isRunning: boolean;
  baseElapsedSec: number;
  startedAtMs: number;
  purityPct: number;
  strictMode: boolean;
  focusTask: string;
  activeTaskId: number | null;
  selectedRoomId?: number;
  selectedSubjectId?: number | null;
}

function loadPersistedTimer(): Partial<PersistedTimerState> & { initialElapsed: number; finishedOffline: boolean; finishedSec: number } {
  try {
    const raw = localStorage.getItem(TIMER_STATE_KEY);
    if (!raw) return { initialElapsed: 0, finishedOffline: false, finishedSec: 0 };
    const p = JSON.parse(raw) as PersistedTimerState;
    const mode: TimerMode = p.mode || 'pomodoro';
    const customMins = Number(p.customMins || 35);
    const bonusSec = Number(p.bonusSec || 0);
    const target = getTargetSec(mode, customMins, bonusSec);
    if (p.isRunning && p.startedAtMs) {
      const elapsedNow = (p.baseElapsedSec || 0) + Math.max(0, Math.floor((Date.now() - p.startedAtMs) / 1000));
      if (mode !== 'stopwatch' && target > 0 && elapsedNow >= target) {
        return { ...p, isRunning: false, initialElapsed: target, finishedOffline: true, finishedSec: target };
      }
      return { ...p, initialElapsed: elapsedNow, finishedOffline: false, finishedSec: 0 };
    }
    return { ...p, initialElapsed: p.baseElapsedSec || 0, finishedOffline: false, finishedSec: 0 };
  } catch {
    return { initialElapsed: 0, finishedOffline: false, finishedSec: 0 };
  }
}

interface ToastMsg {
  id: number;
  text: string;
}

export function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [data, setData] = useState<BootstrapData | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [tab, setTab] = useState<TabKey>('focus');
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return isValidThemeId(saved) ? saved : 'shadcn-dark';
  });
  const [showThemeModal, setShowThemeModal] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId);
    document.documentElement.setAttribute('data-light', String(getThemeMeta(themeId).light));
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  }, [themeId]);

  const restored = useMemo(() => loadPersistedTimer(), []);

  // Timer state
  const [mode, setMode] = useState<TimerMode>(restored.mode || 'pomodoro');
  const [customMins, setCustomMins] = useState<number>(restored.customMins || 35);
  const [bonusSec, setBonusSec] = useState<number>(restored.bonusSec || 0);
  const [pomoCycleCount, setPomoCycleCount] = useState<number>(restored.pomoCycleCount || 0);
  const [isRunning, setIsRunning] = useState<boolean>(Boolean(restored.isRunning));
  const [elapsedSec, setElapsedSec] = useState<number>(restored.initialElapsed || 0);
  const [purityPct, setPurityPct] = useState<number>(restored.purityPct ?? 100);
  const [strictMode, setStrictMode] = useState<boolean>(Boolean(restored.strictMode));
  const [wakeLocked, setWakeLocked] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(restored.selectedSubjectId ?? null);
  const [selectedRoomId, setSelectedRoomId] = useState<number>(restored.selectedRoomId || 1);
  const [soundPreset, setSoundPreset] = useState<SoundPreset>('off');
  const [soundVolume, setSoundVolume] = useState<number>(0.45);
  const [trackMix, setTrackMix] = useState<Record<TrackKey, number>>(() => soundEngine.getTrackMix());
  const [wagerCoins, setWagerCoins] = useState<number>(0);
  const [pipToast, setPipToast] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(Boolean(restored.finishedOffline));
  const [pendingDurationSec, setPendingDurationSec] = useState<number>(restored.finishedSec || 0);
  const [focusTask, setFocusTask] = useState<string>(restored.focusTask || '');
  const [activeTaskId, setActiveTaskId] = useState<number | null>(restored.activeTaskId ?? null);

  // Floating PiP, Notifications & PWA Install State
  const [pipActive, setPipActive] = useState<boolean>(() => pipEngine.isActive());
  const pipSupported = useMemo(() => pipEngine.isSupported(), []);
  const [pushEnabled, setPushEnabled] = useState<boolean>(false);
  const [swReg, setSwReg] = useState<ServiceWorkerRegistration | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Realtime UI state
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const startedAtMsRef = useRef<number>(restored.isRunning && restored.startedAtMs ? restored.startedAtMs : Date.now());
  const baseElapsedRef = useRef<number>(restored.isRunning ? restored.baseElapsedSec || 0 : restored.initialElapsed || 0);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);
  const lastAlertKeyRef = useRef<string>('');

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

  // Register Service Worker + Install Prompt + PiP listener
  useEffect(() => {
    const unsubPip = pipEngine.onChange(setPipActive);

    const onInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onInstallPrompt);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(async (reg) => {
          setSwReg(reg);
          try {
            const sub = await reg.pushManager.getSubscription();
            if (sub || (typeof Notification !== 'undefined' && Notification.permission === 'granted')) {
              setPushEnabled(true);
            }
          } catch {
            // ignore pushManager checks
          }
        })
        .catch(() => {});

      const onSwMessage = (event: MessageEvent) => {
        if (event.data?.type === 'SW_NOTIFICATION_CLICK' && event.data?.action === 'break') {
          setShowCompleteModal(false);
          setMode('break');
          setBonusSec(0);
          baseElapsedRef.current = 0;
          startedAtMsRef.current = Date.now();
          setElapsedSec(0);
          setIsRunning(true);
          setTab('focus');
        }
      };
      navigator.serviceWorker.addEventListener('message', onSwMessage);
      return () => {
        unsubPip();
        window.removeEventListener('beforeinstallprompt', onInstallPrompt);
        navigator.serviceWorker.removeEventListener('message', onSwMessage);
      };
    }

    return () => {
      unsubPip();
      window.removeEventListener('beforeinstallprompt', onInstallPrompt);
    };
  }, []);

  const triggerCompletionAlert = useCallback(
    (finishedMode: TimerMode, durSec: number, subName: string) => {
      const alertKey = `${finishedMode}-${subName}-${Math.floor(Date.now() / 3000)}`;
      if (lastAlertKeyRef.current === alertKey) return;
      lastAlertKeyRef.current = alertKey;

      soundEngine.playCompletionChime();
      const mins = Math.max(1, Math.round(durSec / 60));
      const title =
        finishedMode === 'break'
          ? '☕ Break Over — Time to Lock In!'
          : "⏰ Time's Up! Focus Block Complete";
      const body =
        finishedMode === 'break'
          ? 'Your break is finished. Ready for your next focus sprint!'
          : `${mins}m on ${subName} complete! Claim your XP & Coins 🔥`;

      pushToast(title);
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        if (swReg?.active) {
          swReg.active.postMessage({
            type: 'SHOW_LOCAL_NOTIFICATION',
            payload: { title, body, tag: 'studypulse-timer', data: { url: '/' } },
          });
        } else {
          try {
            new Notification(title, { body, icon: '/icon.svg', tag: 'studypulse-timer' });
          } catch {
            // ignore platforms requiring SW for Notification constructor
          }
        }
      }
    },
    [pushToast, swReg]
  );

  // Persist timer snapshot cleanly to survive lock screen & browser exit
  useEffect(() => {
    try {
      const payload: PersistedTimerState = {
        mode,
        customMins,
        bonusSec,
        pomoCycleCount,
        isRunning,
        baseElapsedSec: baseElapsedRef.current,
        startedAtMs: startedAtMsRef.current,
        purityPct,
        strictMode,
        focusTask,
        activeTaskId,
        selectedRoomId,
        selectedSubjectId,
      };
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage quota
    }
  }, [
    mode,
    customMins,
    bonusSec,
    pomoCycleCount,
    isRunning,
    elapsedSec,
    purityPct,
    strictMode,
    focusTask,
    activeTaskId,
    selectedRoomId,
    selectedSubjectId,
  ]);

  const syncServerSchedule = useCallback(
    async (running: boolean, curMode: TimerMode, curElapsed: number, targetSecVal: number, subName: string, task: string) => {
      if (!token) return;
      try {
        if (running && curMode !== 'stopwatch' && targetSecVal > curElapsed) {
          const targetEndMs = Date.now() + (targetSecVal - curElapsed) * 1000;
          await apiFetch('/api/timer/schedule', {
            method: 'POST',
            body: JSON.stringify({
              targetEndMs,
              mode: curMode,
              subjectName: subName,
              taskTitle: task,
              durationSec: targetSecVal,
            }),
          });
        } else {
          await apiFetch('/api/timer/cancel', { method: 'POST' });
        }
      } catch {
        // offline resilience
      }
    },
    [token, apiFetch]
  );

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
        ws.send(JSON.stringify({ type: 'auth', token, roomId: selectedRoomId }));
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
          } else if (msg.type === 'timer_expired' && msg.userId === data?.user.id) {
            triggerCompletionAlert(msg.mode, msg.durationSec, msg.subjectName);
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
        taskTitle: focusTask,
        mode,
      })
    );
  }, [isRunning, selectedRoomId, activeSubject.name, activeSubject.color, focusTask, mode, data?.user?.id]);

  // Wall-clock accurate Focus Timer Ticker (resists background throttling & sleep)
  useEffect(() => {
    if (!isRunning) return;
    startedAtMsRef.current = Date.now();
    baseElapsedRef.current = elapsedSec;
    const target = getTargetSec(mode, customMins, bonusSec);

    const tick = () => {
      const realElapsed = baseElapsedRef.current + Math.max(0, Math.floor((Date.now() - startedAtMsRef.current) / 1000));
      if (mode !== 'stopwatch' && target > 0 && realElapsed >= target) {
        baseElapsedRef.current = target;
        setElapsedSec(target);
        setIsRunning(false);
        if (mode === 'break') {
          triggerCompletionAlert('break', target, activeSubject.name);
          baseElapsedRef.current = 0;
          setElapsedSec(0);
          setBonusSec(0);
          setMode('pomodoro');
        } else {
          setPendingDurationSec(target);
          setShowCompleteModal(true);
          triggerCompletionAlert(mode, target, activeSubject.name);
        }
        syncServerSchedule(false, mode, target, target, activeSubject.name, focusTask);
        return;
      }
      setElapsedSec(realElapsed);
    };

    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [isRunning, mode, customMins, bonusSec, activeSubject.name, focusTask, triggerCompletionAlert, syncServerSchedule]);

  // Dynamic tab title & Floating PiP live HUD sync
  useEffect(() => {
    const target = getTargetSec(mode, customMins, bonusSec);
    const isStopwatch = mode === 'stopwatch';
    const displayed = isStopwatch ? elapsedSec : Math.max(0, target - elapsedSec);
    const clock = formatClock(displayed);
    const progress = isStopwatch
      ? Math.min(1, (elapsedSec % 3600) / 3600)
      : target > 0
        ? Math.min(1, elapsedSec / target)
        : 0;

    if (isRunning) {
      document.title = `${mode === 'break' ? '☕' : '⏳'} ${clock} • ${activeSubject.name} — StudyPulse`;
    } else if (elapsedSec > 0) {
      document.title = `⏸ ${clock} • StudyPulse`;
    } else {
      document.title = 'StudyPulse — Live Social Study & Focus';
    }

    pipEngine.updateState({
      clockText: clock,
      subjectName: activeSubject.name,
      subjectColor: resolveAccent(activeSubject.color, themeId),
      taskTitle: focusTask,
      modeLabel: getModeLabel(mode),
      isRunning,
      progress,
      purityPct,
      timerMode: mode,
      elapsedSec,
      themeId,
      heroClass: data?.game?.profile?.heroClass || 'hero_scholar',
      companionSpriteKey: data?.game?.equippedBySlot?.companion?.spriteKey || null,
      heroLevel: data?.game?.heroStats?.heroLevel || 1,
      focusFever: Boolean(data?.game?.heroStats?.studyBonuses?.focusFever),
      biomeKey: data?.game?.biome?.key || 'moss_library',
      activeTaskId,
      pendingTasksCount: (data?.tasks || []).filter((t) => !t.done).length,
      roomPeersCount: currentRoom?.activeCount || 0,
      roomName: currentRoom?.name || '',
      toastText: pipToast,
    });
  }, [
    isRunning,
    elapsedSec,
    mode,
    customMins,
    bonusSec,
    activeSubject.name,
    activeSubject.color,
    focusTask,
    purityPct,
    themeId,
    activeTaskId,
    pipToast,
    currentRoom?.activeCount,
    currentRoom?.name,
    data?.tasks,
    data?.game?.profile?.heroClass,
    data?.game?.equippedBySlot?.companion?.spriteKey,
    data?.game?.heroStats?.heroLevel,
    data?.game?.heroStats?.studyBonuses?.focusFever,
    data?.game?.biome?.key,
  ]);

  // Smart Focus Purity Shield (Page Visibility)
  useEffect(() => {
    function handleVisibility() {
      if (!isRunning || mode === 'break') return;
      if (document.hidden) {
        if (!strictMode && pipEngine.isActive()) {
          return; // Multi-App PiP mode skips penalty while studying externally with Floating HUD
        }
        setPurityPct((p) => Math.max(40, p - (strictMode ? 6 : 4)));
      } else if (strictMode || !pipEngine.isActive()) {
        pushToast('Focus Purity dipped slightly while away — stay locked in! 🛡️');
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isRunning, mode, strictMode, pushToast]);

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
    pipEngine.close();
    setSoundPreset('off');
    setIsRunning(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TIMER_STATE_KEY);
    setToken(null);
    setData(null);
  }

  const handleToggleRun = useCallback(() => {
    setIsRunning((prevRunning) => {
      const nextRunning = !prevRunning;
      const target = getTargetSec(mode, customMins, bonusSec);
      if (nextRunning) {
        if (soundPreset !== 'off') {
          soundEngine.setPreset(soundPreset, soundVolume);
        }
        baseElapsedRef.current = elapsedSec;
        startedAtMsRef.current = Date.now();
        syncServerSchedule(true, mode, elapsedSec, target, activeSubject.name, focusTask);
      } else {
        const realElapsed = baseElapsedRef.current + Math.max(0, Math.floor((Date.now() - startedAtMsRef.current) / 1000));
        baseElapsedRef.current = realElapsed;
        startedAtMsRef.current = Date.now();
        setElapsedSec(realElapsed);
        syncServerSchedule(false, mode, realElapsed, target, activeSubject.name, focusTask);
      }
      return nextRunning;
    });
  }, [mode, customMins, bonusSec, elapsedSec, activeSubject.name, focusTask, soundPreset, soundVolume, syncServerSchedule]);

  function handleChangeMode(m: TimerMode) {
    if (isRunning) {
      pushToast('Pause or finish the current block before switching modes.');
      return;
    }
    setMode(m);
    setBonusSec(0);
    baseElapsedRef.current = 0;
    startedAtMsRef.current = Date.now();
    setElapsedSec(0);
    setPurityPct(100);
  }

  function handleChangeCustomMins(mins: number) {
    if (isRunning) return;
    const clamped = Math.max(5, Math.min(180, Math.round(mins)));
    setCustomMins(clamped);
    setBonusSec(0);
    baseElapsedRef.current = 0;
    startedAtMsRef.current = Date.now();
    setElapsedSec(0);
  }

  function handleChangeSound(preset: SoundPreset) {
    setSoundPreset(preset);
    soundEngine.setPreset(preset, soundVolume);
    setTrackMix(soundEngine.getTrackMix());
  }

  function handleChangeTrackMix(mix: Partial<Record<TrackKey, number>>) {
    soundEngine.setTrackMix(mix);
    setTrackMix(soundEngine.getTrackMix());
    setSoundPreset(soundEngine.getPreset());
  }

  function handleApplyMixPreset(key: string) {
    soundEngine.applySavedMixPreset(key);
    setTrackMix(soundEngine.getTrackMix());
    setSoundPreset(soundEngine.getPreset());
  }

  function handleChangeSoundVolume(vol: number) {
    setSoundVolume(vol);
    soundEngine.setVolume(vol);
  }

  const handleBoost5m = useCallback(() => {
    const added = 5 * 60;
    const currentReal = isRunning
      ? baseElapsedRef.current + Math.max(0, Math.floor((Date.now() - startedAtMsRef.current) / 1000))
      : elapsedSec;

    if (mode === 'stopwatch') {
      const next = currentReal + added;
      baseElapsedRef.current = next;
      startedAtMsRef.current = Date.now();
      setElapsedSec(next);
    } else {
      const nextBonus = bonusSec + added;
      setBonusSec(nextBonus);
      const nextTarget = getTargetSec(mode, customMins, nextBonus);
      if (isRunning) {
        syncServerSchedule(true, mode, currentReal, nextTarget, activeSubject.name, focusTask);
      }
    }
    pushToast('+5m added to current timer ⚡');
  }, [mode, customMins, bonusSec, isRunning, elapsedSec, activeSubject.name, focusTask, syncServerSchedule, pushToast]);

  const handleOpenFinish = useCallback(() => {
    const currentReal = isRunning
      ? baseElapsedRef.current + Math.max(0, Math.floor((Date.now() - startedAtMsRef.current) / 1000))
      : elapsedSec;
    if (currentReal < 5) return;
    setIsRunning(false);
    baseElapsedRef.current = currentReal;
    startedAtMsRef.current = Date.now();
    setElapsedSec(currentReal);
    syncServerSchedule(false, mode, currentReal, getTargetSec(mode, customMins, bonusSec), activeSubject.name, focusTask);

    if (mode === 'break') {
      baseElapsedRef.current = 0;
      setElapsedSec(0);
      setBonusSec(0);
      setMode('pomodoro');
      pushToast('Break wrapped up — back to focus! 🍅');
      return;
    }
    setPendingDurationSec(currentReal);
    setShowCompleteModal(true);
  }, [isRunning, elapsedSec, mode, customMins, bonusSec, activeSubject.name, focusTask, syncServerSchedule, pushToast]);

  const flashPipToast = useCallback((msg: string) => {
    setPipToast(msg);
    window.setTimeout(() => setPipToast((cur) => (cur === msg ? null : cur)), 3500);
  }, []);

  const handleCompleteActivePipTask = useCallback(async () => {
    if (!activeTaskId || !data?.tasks) return;
    const task = data.tasks.find((t) => t.id === activeTaskId);
    if (!task) return;
    const res = await apiFetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ done: true }),
    });
    const nextPending = data.tasks.find((t) => !t.done && t.id !== task.id) || null;
    setActiveTaskId(nextPending ? nextPending.id : null);
    if (nextPending) setFocusTask(nextPending.title);
    await refreshBootstrap();
    const xp = res.bonusXp || 15;
    flashPipToast(`Done! +${xp} XP ✅`);
    pushToast(`Completed "${task.title}" (+${xp} XP) ✅`);
  }, [activeTaskId, data?.tasks, apiFetch, refreshBootstrap, flashPipToast, pushToast]);

  useEffect(() => {
    pipEngine.setActions({
      onToggleRun: handleToggleRun,
      onBoost5m: handleBoost5m,
      onFinish: handleOpenFinish,
      onCompleteTask: handleCompleteActivePipTask,
    });
  }, [handleToggleRun, handleBoost5m, handleOpenFinish, handleCompleteActivePipTask]);

  async function handleTogglePip() {
    const active = await pipEngine.toggle({
      onToggleRun: handleToggleRun,
      onBoost5m: handleBoost5m,
      onFinish: handleOpenFinish,
      onCompleteTask: handleCompleteActivePipTask,
    });
    if (active) {
      pushToast('Floating Top Mini-App open — stays visible outside your browser! 🪟');
    } else if (!pipSupported) {
      pushToast('Browser does not support Floating PiP here — install app or enable Time-Up Alerts instead.');
    }
  }

  async function handleEnableAlerts() {
    try {
      if (typeof Notification === 'undefined') {
        pushToast('System notifications are not available on this browser.');
        return;
      }
      const perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
      if (perm !== 'granted') {
        pushToast('Notifications denied — enable notifications in browser settings for Time-Up alarms.');
        return;
      }
      setPushEnabled(true);

      const reg = swReg || (await navigator.serviceWorker?.getRegistration());
      const vapidKey = data?.vapidPublicKey;
      let subscribed = false;
      if (reg?.pushManager && vapidKey) {
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
          });
        }
        await apiFetch('/api/push/subscribe', {
          method: 'POST',
          body: JSON.stringify({ subscription: sub.toJSON() }),
        });
        subscribed = true;
      }

      if (isRunning && mode !== 'stopwatch') {
        const target = getTargetSec(mode, customMins, bonusSec);
        const realElapsed = baseElapsedRef.current + Math.max(0, Math.floor((Date.now() - startedAtMsRef.current) / 1000));
        syncServerSchedule(true, mode, realElapsed, target, activeSubject.name, focusTask);
      }

      soundEngine.playCompletionChime();
      if (subscribed) {
        try {
          await apiFetch('/api/push/test', { method: 'POST' });
        } catch {
          // fallback toast already shown
        }
        pushToast('Lock-screen & closed-browser Web Push armed! 🔔');
      } else {
        pushToast('Browser Time-Up notifications enabled! 🔔');
      }
    } catch {
      pushToast('Browser alert permission updated 🔔');
    }
  }

  async function handleInstallApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
      pushToast('StudyPulse installed to your device! 🚀');
    }
  }

  async function handleSaveSession({
    note,
    shareToFeed,
    startBreakAfter,
  }: {
    note: string;
    shareToFeed: boolean;
    startBreakAfter?: boolean;
  }) {
    const res = await apiFetch('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        subjectName: activeSubject.name,
        subjectColor: activeSubject.color,
        mode,
        durationSec: pendingDurationSec || elapsedSec,
        purityPct,
        strictMode,
        taskId: activeTaskId,
        note,
        shareToFeed,
        roomId: selectedRoomId,
        wagerCoins,
      }),
    });
    setShowCompleteModal(false);
    baseElapsedRef.current = 0;
    startedAtMsRef.current = Date.now();
    setElapsedSec(0);
    setBonusSec(0);
    setPurityPct(100);
    setFocusTask('');
    setWagerCoins(0);
    setPomoCycleCount((c) => c + 1);
    await refreshBootstrap();

    const freezeNote = res.usedFreeze ? ' • Streak Freeze used ❄️' : '';
    const wagerNote = res.wagerOutcome === 'won' ? ' • 🏆 2x Wager Won!' : res.wagerOutcome === 'lost' ? ' • Wager Forfeited' : '';
    const raidNote = res.raidDamageDealt ? ` • ⚔️ ${res.raidDamageDealt} Raid DMG` : '';
    const gr: SessionGameRewards | undefined = res.gameRewards;
    const gameNote = gr
      ? ` • +${gr.energyGained}⚡ +${gr.shardsGained}✦${gr.droppedItem ? ` • 🎁 ${gr.droppedItem.name}` : ''}`
      : '';
    pushToast(`+${res.xpEarned} XP & +${res.coinsEarned}🪙! Streak: ${res.newStreak}d 🔥${freezeNote}${wagerNote}${raidNote}${gameNote}`);

    if (startBreakAfter) {
      setMode('break');
      baseElapsedRef.current = 0;
      startedAtMsRef.current = Date.now();
      setIsRunning(true);
      syncServerSchedule(true, 'break', 0, getTargetSec('break', customMins), activeSubject.name, 'Short recharge break');
      setTab('focus');
    } else if (shareToFeed) {
      setTab('feed');
    }
  }

  async function handleLogManual(mins: number, note: string) {
    const res = await apiFetch('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        subjectName: activeSubject.name,
        subjectColor: activeSubject.color,
        mode: 'manual',
        durationSec: Math.max(60, Math.round(mins * 60)),
        purityPct: 100,
        note: note || `Logged ${mins}m offline study`,
        shareToFeed: true,
        roomId: selectedRoomId,
      }),
    });
    await refreshBootstrap();
    const gr: SessionGameRewards | undefined = res.gameRewards;
    const gameNote = gr ? ` • +${gr.energyGained}⚡ +${gr.shardsGained}✦${gr.droppedItem ? ` • 🎁 ${gr.droppedItem.name}` : ''}` : '';
    pushToast(`Offline study logged: +${res.xpEarned} XP & +${res.coinsEarned}🪙${gameNote}`);
  }

  async function handleCreateTask(title: string, subjectName: string, targetPomos: number) {
    const res = await apiFetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title,
        subjectName: subjectName || activeSubject.name,
        targetPomos,
      }),
    });
    const created: StudyTask | undefined = res.task || res;
    await refreshBootstrap();
    if (created?.id) {
      setActiveTaskId(created.id);
      setFocusTask(created.title);
    }
    pushToast(`Added task "${title}"`);
  }

  async function handleToggleTaskDone(task: StudyTask) {
    const res = await apiFetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ done: !task.done }),
    });
    await refreshBootstrap();
    if (res.bonusXp > 0) {
      pushToast(`Task cleared! +${res.bonusXp} Bonus XP & +${res.bonusCoins} Coins ✅`);
    }
  }

  async function handleDeleteTask(taskId: number) {
    await apiFetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    if (activeTaskId === taskId) setActiveTaskId(null);
    await refreshBootstrap();
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

  async function handleDeleteSubject(subjectId: number) {
    await apiFetch(`/api/subjects/${subjectId}`, { method: 'DELETE' });
    await refreshBootstrap();
    pushToast('Subject removed');
  }

  function applyServerStatePatch(res: { user?: User; shop?: BootstrapData['shop']; game?: BootstrapData['game'] }) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            user: res.user || prev.user,
            shop: res.shop || prev.shop,
            shopItems: res.shop ? res.shop.sections.permanent : prev.shopItems,
            game: res.game || prev.game,
          }
        : prev
    );
  }

  async function handleBuyShopItem(itemKey: string): Promise<ShopBuyResponse | void> {
    try {
      const res: ShopBuyResponse = await apiFetch('/api/shop/buy', {
        method: 'POST',
        body: JSON.stringify({ itemKey }),
      });
      applyServerStatePatch(res);
      pushToast(res.message || 'Purchase complete! ✨');
      return res;
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Purchase failed');
    }
  }

  async function handleRerollDailyShop() {
    try {
      const res = await apiFetch('/api/shop/reroll-daily', { method: 'POST' });
      applyServerStatePatch(res);
      pushToast(res.message || 'Daily stock rerolled! 🔄');
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Reroll failed');
    }
  }

  async function callGameApi(url: string, body?: Record<string, unknown>): Promise<GameActionResponse> {
    try {
      const res: GameActionResponse = await apiFetch(url, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      });
      applyServerStatePatch(res);
      if (res.greatSuccess) {
        pushToast('🍀 Lucky Great Success (+2 Forge Levels)!');
      } else if (res.message) {
        pushToast(res.message);
      } else if (typeof res.shardsGained === 'number' && res.shardsGained > 0) {
        pushToast(`♻️ Salvaged for +${res.shardsGained} Arcane Shards`);
      }
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      pushToast(msg);
      return { game: data!.game, user: data!.user };
    }
  }

  const handleIdleTick = (payload?: {
    wavesCleared?: number;
    timerRunning?: boolean;
    triggerUltimate?: boolean;
    outcome?: 'clear' | 'wipe';
  }) => callGameApi('/api/game/idle/tick', payload || {});
  const handleIdleClaimAfk = () => callGameApi('/api/game/idle/claim-afk');
  const handleIdleConfig = (payload: {
    gambits?: Partial<IdleGambitsConfig>;
    automation?: Partial<IdleAutomationConfig>;
    swapHeroRow?: string;
    stage?: number;
    challengeBoss?: boolean;
    placeCard?: { cardId?: string; cardKey?: string; x?: number; y?: number };
    mergeHand?: boolean;
    pickRelic?: string;
    extractLoop?: boolean;
    toggleAutoArchitect?: boolean;
    shadowAction?: ShadowActionPayload;
  }) => callGameApi('/api/game/idle/config', payload);
  const handleIdleUpgradeProf = (professionId: string) =>
    callGameApi('/api/game/idle/upgrade-profession', { professionId });
  const handleIdleAscend = () => callGameApi('/api/game/idle/ascend');
  const handleIdleUpgradeRelic = (relicId: string) => callGameApi('/api/game/idle/upgrade-relic', { relicId });
  const handleIdleForgeMythic = (milestoneId: string) => callGameApi('/api/game/idle/forge-mythic', { milestoneId });
  const handleGameEquip = (itemId: number) => callGameApi('/api/game/equip', { itemId });
  const handleGameUpgradeItem = (itemId: number) => callGameApi('/api/game/upgrade-item', { itemId });
  const handleGameSalvage = (payload: { itemId?: number; maxRarity?: string }) =>
    callGameApi('/api/game/salvage', payload);
  const handleGameUpgradeStat = (stat: 'atk' | 'vit' | 'luck' | 'crit') =>
    callGameApi('/api/game/upgrade-stat', { stat });
  const handleSelectSpecialization = (specKey: string) => callGameApi('/api/game/specialization', { specKey });
  const handleStudyCast = async (payload: { cardId: number; selectedIndex?: number; grade?: number }) => {
    const res = await callGameApi('/api/game/study-cast', payload);
    await refreshBootstrap();
    return res;
  };

  async function handleSyncUniversitySubjects() {
    await apiFetch('/api/university/sync-subjects', { method: 'POST' });
    await refreshBootstrap();
    pushToast('Synced 4 Politecnico di Torino courses! 🎓');
  }

  async function handleReviewFlashcard(cardId: number, grade?: number, selectedIndex?: number) {
    const res = await apiFetch('/api/university/review', {
      method: 'POST',
      body: JSON.stringify({ cardId, grade, selectedIndex }),
    });
    await refreshBootstrap();
    pushToast(res.isCorrect ? `+${res.xpGain} XP & +5✦ · FSRS scheduled!` : `Reviewed (+${res.xpGain} XP) — scheduled soon!`);
    return res;
  }

  async function handleCreateFlashcards(payload: {
    subjectName: string;
    courseKey: string;
    front?: string;
    back?: string;
    markdownText?: string;
  }) {
    const res = await apiFetch('/api/university/flashcards', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await refreshBootstrap();
    pushToast(`Saved ${res.created?.length || 1} flashcard(s) to FSRS vault! 🗂️`);
  }

  async function handleCompleteMockExam(results: Array<{ cardId: number; isCorrect: boolean }>) {
    const res = await apiFetch('/api/university/exam-complete', {
      method: 'POST',
      body: JSON.stringify({ results }),
    });
    await refreshBootstrap();
    pushToast(
      `Mock Exam ${res.scorePct}% (${res.correctCount}/${res.totalCount}) · +${res.xpEarned} XP, +${res.coinsEarned}🪙!`
    );
    return {
      xpEarned: Number(res.xpEarned || 0),
      coinsEarned: Number(res.coinsEarned || 0),
      shardsEarned: Number(res.shardsEarned || 0),
    };
  }

  async function handleSaveStudyNote(payload: { id?: number; subjectName: string; title: string; contentMd: string }) {
    await apiFetch('/api/university/notes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await refreshBootstrap();
    pushToast('Saved Obsidian session note! 📝');
  }

  async function handleDeleteStudyNote(id: number) {
    await apiFetch(`/api/university/notes/${id}`, { method: 'DELETE' });
    await refreshBootstrap();
    pushToast('Note deleted');
  }

  async function handleSaveExamGoal(payload: {
    courseKey: string;
    subjectName: string;
    examTitle: string;
    examDate: string;
    targetHours: number;
  }) {
    await apiFetch('/api/university/exams', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await refreshBootstrap();
    pushToast('Exam goal saved! 📅');
  }

  async function handleRaidStrike(roomId: number) {
    try {
      const res = await apiFetch(`/api/rooms/${roomId}/raid-strike`, { method: 'POST' });
      await refreshBootstrap();
      pushToast(`⚔️ Dealt ${res.dmg} Raid Boss DMG! (+8✦, +15 XP)`);
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Raid Strike failed');
    }
  }

  async function handleSendRoomChat(roomId: number, content: string) {
    await apiFetch(`/api/rooms/${roomId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    await refreshBootstrap();
  }

  function handleSyncRoomTimer(phase: 'focus' | 'break') {
    setMode(phase === 'break' ? 'break' : 'pomodoro');
    setBonusSec(0);
    baseElapsedRef.current = 0;
    startedAtMsRef.current = Date.now();
    setElapsedSec(0);
    setIsRunning(true);
    pushToast(`Synced with room ${phase === 'break' ? '5m Break ☕' : '25m Focus 🔥'}!`);
  }

  async function handleStartDuel(payload: { opponentId?: number | null; targetMins?: number; wagerCoins?: number }) {
    await apiFetch('/api/compete/duel', {
      method: 'POST',
      body: JSON.stringify({ action: 'create', ...payload }),
    });
    await refreshBootstrap();
    pushToast('7-Day Focus Pact launched! ⚔️');
  }

  async function handleClaimDuel() {
    try {
      const res = await apiFetch('/api/compete/duel', {
        method: 'POST',
        body: JSON.stringify({ action: 'claim' }),
      });
      await refreshBootstrap();
      pushToast(`Claimed Duel Chest (+${res.rewardCoins} 🪙 & +50 XP)! 🏆`);
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Unable to claim yet');
    }
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

  async function handleDeleteRoom(roomId: number) {
    const res = await apiFetch(`/api/rooms/${roomId}`, { method: 'DELETE' });
    await refreshBootstrap();
    if (selectedRoomId === roomId && res.fallbackRoomId) {
      setSelectedRoomId(res.fallbackRoomId);
    }
    pushToast('Room deleted 🗑️');
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

  async function handleUpdateSessionTopic(sessionId: number, subjectName: string, subjectColor?: string) {
    await apiFetch(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ subjectName, subjectColor }),
    });
    await refreshBootstrap();
    pushToast(`Updated topic to "${subjectName}" ✨`);
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
    return (
      <>
        <AuthScreen
          onSuccess={handleAuthSuccess}
          themeId={themeId}
          onOpenThemeModal={() => setShowThemeModal(true)}
        />
        <AnimatePresence>
          {showThemeModal && (
            <ThemeSelectorModal
              themeId={themeId}
              onSelectTheme={setThemeId}
              onClose={() => setShowThemeModal(false)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-3 text-slate-300">
        <div
          className="w-12 h-12 rounded-2xl border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--sp-accent)', borderTopColor: 'transparent' }}
        />
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">
          Syncing StudyPulse...
        </p>
      </div>
    );
  }

  const navItems: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'focus', label: 'Focus', icon: Timer },
    { key: 'quest', label: 'Quest', icon: Swords },
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

      {/* Monochrome Spatial Backdrop */}
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
              className="px-4 py-2 rounded-full liquid-dock text-xs font-bold text-white"
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Responsive Container (Mobile Single Column -> Desktop Wide Bento Workspace + Companion Panel) */}
      <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-[minmax(0,560px)_minmax(0,340px)] lg:justify-center lg:gap-6 lg:px-6">
        {/* Primary Mobile-First & Tablet/Desktop Bento Column */}
        <div className="w-full max-w-[560px] mx-auto min-h-[100dvh] flex flex-col relative z-10">
          {/* Floating Shadcn Glass Header + Out-of-Browser Hover Bar */}
          <header className="sticky top-2 z-30 mx-3 sm:mx-4 mt-2 pt-safe px-3.5 py-2 rounded-xl liquid-dock">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setTab('me')}
                  className="w-9 h-9 rounded-lg sp-inset border flex items-center justify-center text-lg shrink-0 cursor-pointer"
                  style={{ borderColor: resolveAccent(user.themeColor, themeId) }}
                >
                  {user.avatar}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-white truncate">{user.displayName}</span>
                    <span className="px-1.5 py-0.5 rounded-md sp-badge text-[10px] font-bold">
                      Lv.{user.level}
                    </span>
                  </div>
                  <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${user.levelProgressPct}%`, backgroundColor: 'var(--sp-accent)' }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className="px-2 py-1 rounded-full sp-badge text-[11px] font-bold flex items-center gap-1"
                  title="Study streak"
                >
                  <Flame className="w-3.5 h-3.5 opacity-80" />
                  <span className="font-mono-num">{user.streakDays}</span>
                </span>
                <span
                  className="px-2 py-1 rounded-full sp-badge text-[11px] font-bold flex items-center gap-1"
                  title="Focus coins"
                >
                  <Coins className="w-3.5 h-3.5 opacity-80" />
                  <span className="font-mono-num">{user.coins}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setTab('rooms')}
                  className="px-2 py-1 rounded-full sp-badge text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                  title="Live online studiers"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--sp-accent)' }}
                  />
                  <span className="font-mono-num">{data.onlineCount}</span>
                </button>
              </div>
            </div>

            {/* Top Hover Navlink & Utility Strip */}
            <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between gap-1.5">
              {tab !== 'focus' && (isRunning || elapsedSec > 0) ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setTab('focus')}
                    className="px-2.5 py-1 rounded-full sp-badge hover:opacity-90 text-[10px] font-extrabold flex items-center gap-1.5 truncate cursor-pointer"
                    title="Jump back to Focus timer"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${isRunning ? 'animate-pulse' : 'opacity-50'}`}
                      style={{ backgroundColor: 'var(--sp-accent)' }}
                    />
                    <span className="font-mono-num">
                      {formatClock(
                        mode === 'stopwatch'
                          ? elapsedSec
                          : Math.max(0, getTargetSec(mode, customMins, bonusSec) - elapsedSec)
                      )}
                    </span>
                    <span className="truncate text-slate-300">• {activeSubject.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleRun}
                    className="w-6 h-6 rounded-full sp-btn-primary flex items-center justify-center shrink-0 cursor-pointer"
                    title={isRunning ? 'Pause timer' : 'Resume timer'}
                  >
                    {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setTab('focus')}
                  className="text-[10px] font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 min-w-0 truncate cursor-pointer"
                >
                  <Zap className="w-3 h-3 shrink-0 opacity-80" />
                  <span className="truncate">
                    {pipActive ? 'Floating above apps' : isRunning ? `${getModeLabel(mode)} live` : 'Top Hover HUD Ready'}
                  </span>
                </button>
              )}

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleTogglePip}
                  className={`px-2 py-1 rounded-full border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition ${
                    pipActive ? 'sp-tab-active' : 'sp-badge hover:opacity-90'
                  }`}
                  title="Pop out always-on-top mini window (stays visible outside browser)"
                >
                  <PictureInPicture2 className="w-3 h-3" />
                  <span>{pipActive ? 'Floating' : 'Float'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleEnableAlerts}
                  className={`px-2 py-1 rounded-full border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition ${
                    pushEnabled ? 'sp-tab-active' : 'sp-badge hover:opacity-90'
                  }`}
                  title="Enable lock-screen & closed-browser Time-Up notifications"
                >
                  {pushEnabled ? <BellRing className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                  <span>{pushEnabled ? 'Alerts On' : 'Alerts'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowThemeModal(true)}
                  aria-label="Select theme"
                  title="Select UI theme"
                  className="px-2 py-1 rounded-full sp-badge hover:opacity-90 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                >
                  <Palette className="w-3 h-3" />
                  <span>Theme</span>
                </button>

                {installPrompt && (
                  <button
                    type="button"
                    onClick={handleInstallApp}
                    className="px-2 py-1 rounded-full sp-btn-primary text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    title="Install StudyPulse as standalone app"
                  >
                    <Download className="w-3 h-3" />
                    <span>App</span>
                  </button>
                )}
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
                    themeId={themeId}
                    shadowSlave={data.game.shadowSlave}
                    mode={mode}
                    onChangeMode={handleChangeMode}
                    customMins={customMins}
                    onChangeCustomMins={handleChangeCustomMins}
                    pomoCycleCount={pomoCycleCount}
                    isRunning={isRunning}
                    onToggleRun={handleToggleRun}
                    elapsedSec={elapsedSec}
                    targetSec={getTargetSec(mode, customMins, bonusSec)}
                    onBoost5m={handleBoost5m}
                    onFinishSession={handleOpenFinish}
                    subjects={data.subjects}
                    activeSubject={activeSubject}
                    onSelectSubject={(s) => setSelectedSubjectId(s.id)}
                    onCreateSubject={handleCreateSubject}
                    purityPct={purityPct}
                    strictMode={strictMode}
                    onToggleStrictMode={() => setStrictMode((v) => !v)}
                    wakeLocked={wakeLocked}
                    pipActive={pipActive}
                    pipSupported={pipSupported}
                    onTogglePip={handleTogglePip}
                    soundPreset={soundPreset}
                    soundVolume={soundVolume}
                    onChangeSound={handleChangeSound}
                    onChangeSoundVolume={handleChangeSoundVolume}
                    trackMix={trackMix}
                    onChangeTrackMix={handleChangeTrackMix}
                    onApplyMixPreset={handleApplyMixPreset}
                    wagerCoins={wagerCoins}
                    onChangeWagerCoins={setWagerCoins}
                    userCoins={user.coins}
                    university={data.university}
                    subjectBreakdown={data.subjectBreakdown}
                    onSyncUniversitySubjects={handleSyncUniversitySubjects}
                    onReviewFlashcard={handleReviewFlashcard}
                    onCreateFlashcards={handleCreateFlashcards}
                    onCompleteMockExam={handleCompleteMockExam}
                    onSaveStudyNote={handleSaveStudyNote}
                    onDeleteStudyNote={handleDeleteStudyNote}
                    onSaveExamGoal={handleSaveExamGoal}
                    currentRoom={currentRoom}
                    onGoToRooms={() => setTab('rooms')}
                    todayMins={user.todayMins}
                    dailyGoalMins={user.dailyGoalMins}
                    focusTask={focusTask}
                    onChangeFocusTask={setFocusTask}
                    spiritSkin={user.equippedSpirit}
                    tasks={data.tasks}
                    activeTaskId={activeTaskId}
                    onSelectTask={(t) => {
                      setActiveTaskId(t ? t.id : null);
                      if (t) setFocusTask(t.title);
                    }}
                    onCreateTask={handleCreateTask}
                    onToggleTaskDone={handleToggleTaskDone}
                    onDeleteTask={handleDeleteTask}
                    onLogManual={handleLogManual}
                  />
                )}

                {tab === 'quest' && (
                  <QuestView
                    user={user}
                    game={data.game}
                    shop={data.shop}
                    isStudying={isRunning && mode !== 'break'}
                    onIdleTick={handleIdleTick}
                    onIdleClaimAfk={handleIdleClaimAfk}
                    onIdleConfig={handleIdleConfig}
                    onIdleUpgradeProf={handleIdleUpgradeProf}
                    onIdleAscend={handleIdleAscend}
                    onIdleUpgradeRelic={handleIdleUpgradeRelic}
                    onIdleForgeMythic={handleIdleForgeMythic}
                    onEquipItem={handleGameEquip}
                    onUpgradeItem={handleGameUpgradeItem}
                    onSalvageItem={handleGameSalvage}
                    onUpgradeStat={handleGameUpgradeStat}
                    onSelectSpecialization={handleSelectSpecialization}
                    onStudyCast={handleStudyCast}
                    flashcards={data.university?.flashcards}
                    onBuyShopItem={handleBuyShopItem}
                    onRerollDailyShop={handleRerollDailyShop}
                    onGoToFocus={() => setTab('focus')}
                  />
                )}

                {tab === 'rooms' && (
                  <RoomsView
                    themeId={themeId}
                    rooms={data.rooms}
                    selectedRoomId={selectedRoomId}
                    onSelectRoom={(id) => {
                      setSelectedRoomId(id);
                      pushToast('Switched desk seat! 🪑');
                    }}
                    onCreateRoom={handleCreateRoom}
                    onDeleteRoom={handleDeleteRoom}
                    floatingEmojis={floatingEmojis}
                    onSendCheer={handleSendCheer}
                    currentUserId={user.id}
                    isRunning={isRunning}
                    heroEnergy={data.game.profile.energy}
                    onJumpToFocus={() => setTab('focus')}
                    onRaidStrike={handleRaidStrike}
                    onSendRoomChat={handleSendRoomChat}
                    onSyncRoomTimer={handleSyncRoomTimer}
                    onMatchSubject={(subName) => {
                      const match = data.subjects.find(
                        (s) => s.name.toLowerCase() === subName.toLowerCase()
                      );
                      if (match) {
                        setSelectedSubjectId(match.id);
                      }
                      setTab('focus');
                      pushToast(`Matched "${subName}" — hit Start Focus! ⚡`);
                    }}
                  />
                )}

                {tab === 'compete' && (
                  <CompeteView
                    user={user}
                    leaderboards={data.leaderboards}
                    directory={data.directory}
                    league={data.league}
                    activeDuel={data.activeDuel}
                    onStartDuel={handleStartDuel}
                    onClaimDuel={handleClaimDuel}
                    onToggleFriend={handleToggleFriend}
                    onNudgeFriend={handleNudgeFriend}
                  />
                )}

                {tab === 'feed' && (
                  <FeedView
                    themeId={themeId}
                    feed={data.feed}
                    currentUserId={user.id}
                    subjects={data.subjects}
                    onUpdateSessionTopic={handleUpdateSessionTopic}
                    onReact={handleReactFeed}
                    onComment={handleCommentFeed}
                    onJumpToFocus={() => setTab('focus')}
                  />
                )}

                {tab === 'me' && (
                  <ProfileView
                    themeId={themeId}
                    user={user}
                    heatmap={data.heatmap}
                    heatmap365={data.heatmap365}
                    prevWeekMins={data.prevWeekMins}
                    todayTimeline={data.todayTimeline}
                    studyLogs={data.studyLogs}
                    onUpdateSessionTopic={handleUpdateSessionTopic}
                    weekTrend={data.weekTrend}
                    subjectBreakdown={data.subjectBreakdown}
                    hourlyDistribution={data.hourlyDistribution}
                    peakWindowLabel={data.peakWindowLabel}
                    achievements={data.achievements}
                    subjects={data.subjects}
                    shop={data.shop}
                    game={data.game}
                    onBuyShopItem={handleBuyShopItem}
                    onRerollDailyShop={handleRerollDailyShop}
                    onEquipGameItem={(id) => handleGameEquip(id).then(() => undefined)}
                    onDeleteSubject={handleDeleteSubject}
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
              <span className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Study Pulse
              </span>
              <span className="font-mono-num text-xs font-semibold text-slate-400">
                {data.onlineCount} studying now
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto glass-scroll pr-1">
              {data.rooms.map((r) => {
                const selected = r.id === selectedRoomId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedRoomId(r.id);
                      setTab('rooms');
                    }}
                    className={`w-full p-2.5 rounded-2xl border flex items-center justify-between text-left cursor-pointer transition ${
                      selected
                        ? 'sp-tab-active'
                        : 'sp-inset hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg">{r.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{r.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{r.topic}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full sp-badge font-mono-num text-[11px] font-bold shrink-0">
                      {r.activeCount} live
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Weekly Top 5
              </span>
              <button
                type="button"
                onClick={() => setTab('compete')}
                className="text-[11px] font-semibold text-slate-300 hover:text-white hover:underline cursor-pointer"
              >
                Full Standings
              </button>
            </div>
            <div className="space-y-2">
              {data.leaderboards.week.slice(0, 5).map((e) => (
                <div
                  key={e.id}
                  className={`flex items-center justify-between p-2 rounded-xl border ${
                    e.isSelf ? 'sp-tab-active' : 'sp-inset border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 text-[11px] font-mono-num font-bold text-slate-400">#{e.rank}</span>
                    <span className="text-base">{e.avatar}</span>
                    <span className="text-xs font-bold text-white truncate">{e.displayName}</span>
                  </div>
                  <span className="font-mono-num text-xs font-bold text-white">
                    {(e.minutes / 60).toFixed(1)}h
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                <span>{data.game.shadowSlave?.aspect.icon || '🌑'}</span>
                <span>{data.game.shadowSlave ? `[${data.game.shadowSlave.aspect.name}]` : 'Nightmare Vessel'}</span>
              </span>
              <span className="font-mono-num text-[11px] font-bold text-slate-300">
                {data.game.shadowSlave
                  ? `${data.game.shadowSlave.rank} ${data.game.shadowSlave.coreClass.name}`
                  : `Act ${data.game.story.chapter}`}
              </span>
            </div>
            {data.game.shadowSlave && (
              <div className="text-[10px] font-bold text-amber-200 mb-2 truncate">
                [{data.game.shadowSlave.trueName}] • {data.game.shadowSlave.currentAct.title}
              </div>
            )}
            <div className="grid grid-cols-3 gap-1.5 text-center mb-2.5">
              <div className="p-2 rounded-xl sp-inset">
                <div className="font-mono-num text-xs font-extrabold text-white">
                  ✦ {data.game.profile.shards}
                </div>
                <div className="text-[9px] text-slate-400">Shards</div>
              </div>
              <div className="p-2 rounded-xl sp-inset">
                <div className="font-mono-num text-xs font-extrabold text-sky-300">
                  ⚡ {data.game.shadowSlave?.soulEssence ?? 75}
                </div>
                <div className="text-[9px] text-slate-400">Essence</div>
              </div>
              <div className="p-2 rounded-xl sp-inset">
                <div className="font-mono-num text-xs font-extrabold text-purple-300">
                  💎 {data.game.shadowSlave?.soulFragments ?? 0}
                </div>
                <div className="text-[9px] text-slate-400">Fragments</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTab('quest')}
              className="w-full py-2 rounded-xl sp-btn-primary text-xs font-extrabold cursor-pointer"
            >
              Enter 3D Nightmare Realm ⚔️
            </button>
          </div>

          {isRunning && (
            <div className="glass-card rounded-3xl p-4 border sp-tab-active">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
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
        className="fixed bottom-0 inset-x-0 h-24 sp-scrim-bottom pointer-events-none z-[90]"
      />

      {/* True Viewport-Locked Fixed Shadcn Glass Bottom Dock */}
      <nav
        aria-label="Primary Navigation"
        className="fixed bottom-3 left-1/2 lg:left-[calc(50%-182px)] -translate-x-1/2 z-[100] w-[calc(100vw-24px)] max-w-[480px]"
      >
        <div className="liquid-dock liquid-dock-lens rounded-xl p-1 grid grid-cols-6 gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            const hasLiveRooms = item.key === 'rooms' && data.onlineCount > 0;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`relative py-2 px-0.5 rounded-lg flex flex-col items-center justify-center gap-0.5 cursor-pointer transition ${
                  active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="navActivePill"
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    className="absolute inset-0 rounded-lg sp-tab-active"
                  />
                )}
                <div className="relative z-10">
                  <Icon className="w-4 h-4" />
                  {hasLiveRooms && (
                    <span
                      className="absolute -top-0.5 -right-1.5 w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--sp-accent)' }}
                    />
                  )}
                </div>
                <span className="text-[9.5px] font-bold relative z-10 truncate max-w-full">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Session Completion Celebration Modal */}
      <AnimatePresence>
        {showCompleteModal && (
          <SessionCompleteModal
            themeId={themeId}
            user={user}
            subject={activeSubject}
            mode={mode}
            durationSec={pendingDurationSec || elapsedSec}
            purityPct={purityPct}
            strictMode={strictMode}
            initialNote={focusTask}
            onSave={handleSaveSession}
            onDiscard={() => {
              setShowCompleteModal(false);
              baseElapsedRef.current = 0;
              startedAtMsRef.current = Date.now();
              setElapsedSec(0);
              setBonusSec(0);
              setPurityPct(100);
              setFocusTask('');
            }}
          />
        )}
      </AnimatePresence>

      {/* Theme Selector Modal */}
      <AnimatePresence>
        {showThemeModal && (
          <ThemeSelectorModal
            themeId={themeId}
            onSelectTheme={setThemeId}
            onClose={() => setShowThemeModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
