import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Timer,
  Users,
  Trophy,
  Flame,
  User as UserIcon,
  Coins,
  ArrowRight,
  AudioLines,
  ChevronRight,
  Bell,
  BellRing,
  PictureInPicture2,
  Play,
  Pause,
  Download,
  Palette,
  Swords,
  Lock,
} from 'lucide-react';
import { AuthScreen } from './components/AuthScreen';
import { FocusView, formatClock } from './components/FocusView';
import { SessionCompleteModal } from './components/SessionCompleteModal';
import { subjectSubcategories } from './components/SubcategoryInput';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';

const QuestView = lazy(() => import('./components/QuestView').then((m) => ({ default: m.QuestView })));
const RoomsView = lazy(() => import('./components/RoomsView').then((m) => ({ default: m.RoomsView })));
const CompeteView = lazy(() => import('./components/CompeteView').then((m) => ({ default: m.CompeteView })));
const FeedView = lazy(() => import('./components/FeedView').then((m) => ({ default: m.FeedView })));
const ProfileView = lazy(() => import('./components/ProfileView').then((m) => ({ default: m.ProfileView })));

function TabSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading view">
      <div className="glass-card rounded-3xl p-4 space-y-3">
        <div className="h-5 w-44 rounded-lg sp-skeleton" />
        <div className="h-24 w-full rounded-2xl sp-skeleton" />
      </div>
      <div className="glass-card rounded-3xl p-4 space-y-2.5">
        <div className="h-4 w-32 rounded-lg sp-skeleton" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-20 rounded-2xl sp-skeleton" />
          <div className="h-20 rounded-2xl sp-skeleton" />
        </div>
      </div>
    </div>
  );
}
import {
  ActiveTimerState,
  BootstrapData,
  FeedFilters,
  FeedItem,
  FloatingEmoji,
  GameActionResponse,
  IdleAutomationConfig,
  IdleGambitsConfig,
  SessionEditPayload,
  SessionGameRewards,
  ShadowActionPayload,
  ShopBuyResponse,
  StudyTask,
  Subject,
  TabKey,
  TimerMode,
  User,
  WeeklyAnalyticsResponse,
} from './types';
import { ThemeId, THEME_STORAGE_KEY, getThemeMeta, isValidThemeId, resolveAccent } from './themes';
import { soundEngine, SoundPreset, TrackKey } from './utils/soundEngine';
import { pipEngine } from './utils/pipEngine';

const TOKEN_KEY = 'studypulse_token';
const TIMER_STATE_KEY = 'studypulse_timer_state';
const DEVICE_ID_KEY = 'studypulse_device_id';

function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return 'dev_default';
  }
}

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
  subcategorySelection?: { subjectId: number; name: string };
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
  actionLabel?: string;
  onAction?: () => void;
}

export function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [data, setData] = useState<BootstrapData | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [tab, setTab] = useState<TabKey>('focus');
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return isValidThemeId(saved) ? saved : 'sage-dark';
  });
  const [showThemeModal, setShowThemeModal] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [tab]);


  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId);
    const theme = getThemeMeta(themeId);
    document.documentElement.setAttribute('data-light', String(theme.light));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.preview.bg);
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
  const [subcategorySelection, setSubcategorySelection] = useState(restored.subcategorySelection);
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
  const [deviceId] = useState<string>(() => getOrCreateDeviceId());
  const [timerSyncStatus, setTimerSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [remoteTimer, setRemoteTimer] = useState<ActiveTimerState | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const startedAtMsRef = useRef<number>(restored.isRunning && restored.startedAtMs ? restored.startedAtMs : Date.now());
  const baseElapsedRef = useRef<number>(restored.isRunning ? restored.baseElapsedSec || 0 : restored.initialElapsed || 0);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);
  const lastAlertKeyRef = useRef<string>('');

  const pushToast = useCallback((text: string, opts?: { actionLabel?: string; onAction?: () => void; durationMs?: number }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, text, actionLabel: opts?.actionLabel, onAction: opts?.onAction }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, opts?.durationMs ?? (opts?.actionLabel ? 5500 : 3200));
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
      const activeToken = localStorage.getItem(TOKEN_KEY) || token;
      const headers = new Headers(init?.headers || {});
      if (activeToken) headers.set('Authorization', `Bearer ${activeToken}`);
      if (init?.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
      const res = await fetch(url, { ...init, headers });
      if (res.status === 401) {
        const currentStored = localStorage.getItem(TOKEN_KEY);
        if (currentStored && currentStored !== activeToken) {
          headers.set('Authorization', `Bearer ${currentStored}`);
          const retryRes = await fetch(url, { ...init, headers });
          if (retryRes.ok) return retryRes.json();
        }
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

  const fetchFilteredFeed = useCallback(async (filters: FeedFilters): Promise<FeedItem[]> => {
    const params = new URLSearchParams({ ...filters });
    const response = await apiFetch(`/api/feed?${params}`);
    return response.feed;
  }, [apiFetch]);

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
      if (boot.activeTimer && boot.activeTimer.deviceId !== deviceId) {
        setRemoteTimer(boot.activeTimer);
      } else if (!boot.activeTimer) {
        setRemoteTimer(null);
      }
    } catch {
      // handled cleanly in apiFetch
    } finally {
      setLoading(false);
    }
  }, [token, apiFetch, deviceId]);

  useEffect(() => {
    if (token) {
      refreshBootstrap();
    } else {
      setLoading(false);
    }
  }, [token, refreshBootstrap]);

  const activeSubject: Subject = useMemo(() => {
    const subs = data?.subjects || [];
    return subs.find((s) => s.id === selectedSubjectId) || subs[0] || { id: 0, name: 'Deep Focus', color: '#10B981', icon: '⚡' };
  }, [data?.subjects, selectedSubjectId]);

  const subcategory = subcategorySelection?.subjectId === activeSubject.id
    ? subcategorySelection.name
    : '';
  const subcategoryOptions = subjectSubcategories(activeSubject.name, data?.subjectBreakdown ?? []);

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
        subcategorySelection,
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
    subcategorySelection,
  ]);

  const syncServerSchedule = useCallback(
    async (
      running: boolean,
      curMode: TimerMode,
      curElapsed: number,
      targetSecVal: number,
      subName: string,
      task: string,
      source?: ActiveTimerState
    ) => {
      if (!token) return;
      setTimerSyncStatus('syncing');
      try {
        if (running || curElapsed > 0) {
          await apiFetch('/api/timer/active', {
            method: 'PUT',
            body: JSON.stringify({
              mode: curMode,
              subjectId: source ? source.subjectId : activeSubject.id || null,
              subjectName: subName,
              subjectColor: source?.subjectColor ?? activeSubject.color,
              subcategory: source ? source.subcategory ?? null : subcategory,
              taskId: source ? source.taskId : activeTaskId,
              taskTitle: task,
              targetSec: targetSecVal,
              startedAtMs: startedAtMsRef.current,
              accumulatedSec: curElapsed,
              isRunning: running,
              strictMode: source?.strictMode ?? strictMode,
              deviceId,
            }),
          });
        } else {
          await apiFetch('/api/timer/active', { method: 'DELETE' });
        }

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
        setTimerSyncStatus('synced');
      } catch {
        setTimerSyncStatus('offline');
      }
    },
    [token, apiFetch, activeSubject.id, activeSubject.color, subcategory, activeTaskId, strictMode, deviceId]
  );

  // Auto-join room from ?invite=<code> deep-link once authenticated
  useEffect(() => {
    if (!token || !data?.user) return;
    const params = new URLSearchParams(window.location.search);
    const inviteCode = params.get('invite');
    if (!inviteCode) return;
    apiFetch('/api/rooms/join-invite', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    })
      .then(async (res) => {
        window.history.replaceState({}, '', window.location.pathname);
        await refreshBootstrap();
        if (res.roomId) setSelectedRoomId(res.roomId);
        setTab('rooms');
        pushToast(`Joined Sanctuary "${res.roomName || 'Study Room'}" via invite`);
      })
      .catch((err) => {
        window.history.replaceState({}, '', window.location.pathname);
        pushToast(err instanceof Error ? err.message : 'Invalid invite link');
      });
  }, [token, data?.user?.id, apiFetch, refreshBootstrap, pushToast]);

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
          } else if (msg.type === 'timer_state_sync') {
            const incoming: ActiveTimerState | null = msg.activeTimer || null;
            if (!incoming) {
              setRemoteTimer(null);
            } else if (incoming.deviceId !== deviceId) {
              setRemoteTimer(incoming);
              if (incoming.isRunning && isRunning) {
                setIsRunning(false);
                pushToast('Timer continued on another device — paused locally');
              }
            }
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
    setSubcategorySelection(undefined);
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
    subcategory: savedSubcategory,
    shareToFeed,
    startBreakAfter,
  }: {
    note: string;
    subcategory: string;
    shareToFeed: boolean;
    startBreakAfter?: boolean;
  }) {
    const res = await apiFetch('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        subjectName: activeSubject.name,
        subjectColor: activeSubject.color,
        subcategory: savedSubcategory,
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

  async function handleLogManual(mins: number, note: string, manualSubcategory: string) {
    const res = await apiFetch('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        subjectName: activeSubject.name,
        subjectColor: activeSubject.color,
        subcategory: manualSubcategory,
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

  async function handleResumeRemoteTimer() {
    if (!remoteTimer) return;
    const elapsedNow = remoteTimer.isRunning
      ? remoteTimer.accumulatedSec + Math.max(0, Math.floor((Date.now() - remoteTimer.startedAtMs) / 1000))
      : remoteTimer.accumulatedSec;
    setMode(remoteTimer.mode || 'pomodoro');
    setBonusSec(0);
    if (remoteTimer.subjectId && data?.subjects.some((s) => s.id === remoteTimer.subjectId)) {
      setSelectedSubjectId(remoteTimer.subjectId);
      setSubcategorySelection({ subjectId: remoteTimer.subjectId, name: remoteTimer.subcategory ?? '' });
    } else {
      setSubcategorySelection(undefined);
    }
    setActiveTaskId(remoteTimer.taskId ?? null);
    setFocusTask(remoteTimer.taskTitle || '');
    baseElapsedRef.current = elapsedNow;
    startedAtMsRef.current = Date.now();
    setElapsedSec(elapsedNow);
    setStrictMode(Boolean(remoteTimer.strictMode));
    setIsRunning(remoteTimer.isRunning);
    setRemoteTimer(null);
    await syncServerSchedule(
      remoteTimer.isRunning,
      remoteTimer.mode,
      elapsedNow,
      remoteTimer.targetSec || getTargetSec(remoteTimer.mode, customMins),
      remoteTimer.subjectName,
      remoteTimer.taskTitle,
      remoteTimer
    );
    pushToast('Resumed synced session on this device');
  }

  async function handleDiscardRemoteTimer() {
    setRemoteTimer(null);
    try {
      await apiFetch('/api/timer/active', { method: 'DELETE' });
      await apiFetch('/api/timer/cancel', { method: 'POST' });
    } catch {
      // ignore
    }
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

  async function handleUpdateSubject(
    subjectId: number,
    payload: { name?: string; color?: string; icon?: string; cascadeSessions?: boolean }
  ) {
    await apiFetch(`/api/subjects/${subjectId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    await refreshBootstrap();
    pushToast('Subject updated');
  }

  async function handleReorderSubjects(orderedIds: number[]) {
    setData((prev) => {
      if (!prev) return prev;
      const byId = new Map(prev.subjects.map((s) => [s.id, s]));
      const nextSubs = orderedIds.map((id) => byId.get(id)).filter((s): s is Subject => Boolean(s));
      const extras = prev.subjects.filter((s) => !orderedIds.includes(s.id));
      return { ...prev, subjects: [...nextSubs, ...extras] };
    });
    await apiFetch('/api/subjects/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds }),
    });
  }

  async function handleMergeSubjects(sourceId: number, targetId: number) {
    const res = await apiFetch('/api/subjects/merge', {
      method: 'POST',
      body: JSON.stringify({ sourceId, targetId }),
    });
    if (selectedSubjectId === sourceId) {
      setSelectedSubjectId(targetId);
    }
    await refreshBootstrap();
    pushToast(`Merged ${res.movedSessions || 0} session(s) into ${res.target?.name || 'target'}`);
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

  async function handleCreateRoom(
    name: string,
    topic: string,
    icon: string,
    accent: string,
    opts?: { isPrivate?: boolean; passcode?: string; quietMode?: boolean }
  ) {
    const created = await apiFetch('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ name, topic, icon, accent, ...(opts || {}) }),
    });
    await refreshBootstrap();
    setSelectedRoomId(created.id);
    pushToast(`Opened room "${created.name}"`);
  }

  async function handleUnlockRoom(roomId: number, payload: { passcode?: string; inviteCode?: string }) {
    await apiFetch(`/api/rooms/${roomId}/unlock`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await refreshBootstrap();
    setSelectedRoomId(roomId);
    pushToast('Room unlocked');
  }

  async function handleToggleQuietMode(roomId: number, quietMode: boolean) {
    await apiFetch(`/api/rooms/${roomId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quietMode }),
    });
    await refreshBootstrap();
    pushToast(quietMode ? 'Quiet Mode enabled during focus blocks' : 'Quiet Mode turned off');
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
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        feed: prev.feed.map((post) => {
          if (post.id !== sessionId) return post;
          return {
            ...post,
            reactions: post.reactions.map((r) =>
              r.emoji === emoji
                ? { ...r, reacted: !r.reacted, count: Math.max(0, r.count + (r.reacted ? -1 : 1)) }
                : r
            ),
          };
        }),
      };
    });
    await apiFetch(`/api/feed/${sessionId}/react`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    });
  }

  async function handleCommentFeed(sessionId: number, content: string) {
    await apiFetch(`/api/feed/${sessionId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    await refreshBootstrap();
  }

  async function handleUpdateSession(
    sessionId: number,
    payload: SessionEditPayload
  ) {
    await apiFetch(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    await refreshBootstrap();
    pushToast('Study log updated');
  }

  async function handleDeleteSession(sessionId: number) {
    const prevSnapshot = data;
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        todayTimeline: (prev.todayTimeline || []).filter((s) => s.id !== sessionId),
        studyLogs: (prev.studyLogs || []).filter((s) => s.id !== sessionId),
        feed: prev.feed.filter((f) => f.id !== sessionId),
      };
    });
    try {
      const res = await apiFetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      await refreshBootstrap();
      if (res.deletedSession) {
        pushToast('Session deleted', {
          actionLabel: 'Undo',
          durationMs: 5500,
          onAction: async () => {
            await apiFetch('/api/sessions/restore', {
              method: 'POST',
              body: JSON.stringify({ session: res.deletedSession }),
            });
            await refreshBootstrap();
            pushToast('Session restored');
          },
        });
      }
    } catch (err) {
      if (prevSnapshot) setData(prevSnapshot);
      pushToast(err instanceof Error ? err.message : 'Failed to delete session');
    }
  }

  async function handleChangePassword(currentPassword: string, newPassword: string) {
    const res = await apiFetch('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (res.token) {
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
    }
    pushToast('Password updated and other sessions signed out');
  }

  async function handleLogoutAllDevices() {
    const res = await apiFetch('/api/auth/logout-all', { method: 'POST' });
    if (res.token) {
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
    }
    pushToast('Signed out all other devices');
  }

  async function handleFetchWeeklyAnalytics(offset: number): Promise<WeeklyAnalyticsResponse> {
    return apiFetch(`/api/analytics/week?offset=${offset}`);
  }

  async function handleUpdateProfile(payload: { displayName?: string; bio?: string; dailyGoalMins?: number }) {
    await apiFetch('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    await refreshBootstrap();
    pushToast('Profile updated');
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

  const navItems: {
    key: TabKey;
    label: string;
    title: string;
    icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  }[] = [
    { key: 'focus', label: 'Focus', title: 'Focus studio', icon: Timer },
    { key: 'quest', label: 'Quest', title: 'Quest', icon: Swords },
    { key: 'rooms', label: 'Rooms', title: 'Study rooms', icon: Users },
    { key: 'compete', label: 'Compete', title: 'Competition', icon: Trophy },
    { key: 'feed', label: 'Feed', title: 'Activity feed', icon: AudioLines },
    { key: 'me', label: 'Profile', title: 'Your profile', icon: UserIcon },
  ];

  const { user } = data;
  const currentPage = navItems.find((item) => item.key === tab)!;
  const showMiniTimer = tab !== 'focus' && (isRunning || elapsedSec > 0);
  const miniTimer = formatClock(
    mode === 'stopwatch' ? elapsedSec : Math.max(0, getTargetSec(mode, customMins, bonusSec) - elapsedSec)
  );

  return (
    <div className="studio-shell">
      <a className="studio-skip" href="#workspace">Skip to content</a>
      <div className="studio-toasts" aria-live="polite">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="studio-toast"
            >
              <span>{toast.text}</span>
              {toast.actionLabel && toast.onAction && (
                <button
                  type="button"
                  onClick={() => {
                    setToasts((prev) => prev.filter((item) => item.id !== toast.id));
                    toast.onAction?.();
                  }}
                  className="sp-btn-primary px-3 py-2 cursor-pointer"
                >
                  {toast.actionLabel}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <aside className="studio-sidebar">
        <button type="button" className="studio-brand studio-desktop-brand" onClick={() => setTab('focus')}>
          <span className="studio-mark"><AudioLines aria-hidden="true" /></span>
          <span>StudyPulse</span>
        </button>
        <nav className="studio-nav" aria-label="Primary navigation">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              aria-current={tab === key ? 'page' : undefined}
              onClick={() => setTab(key)}
              className="studio-nav-item"
            >
              <Icon aria-hidden={true} />
              <span>{label}</span>
              {key === 'rooms' && data.onlineCount > 0 && <i className="studio-online-dot" aria-hidden="true" />}
            </button>
          ))}
        </nav>
        <button type="button" className="studio-account" onClick={() => setTab('me')} aria-label="Open your profile">
          <span className="studio-avatar" style={{ borderColor: resolveAccent(user.themeColor, themeId) }}>
            {user.avatar}
          </span>
          <span className="studio-account-text">
            <strong>{user.displayName}</strong>
            <small>Level {user.level}</small>
          </span>
          <ChevronRight size={15} aria-hidden="true" />
        </button>
      </aside>

      <div className="studio-workspace">
        <header className="studio-topbar">
          <button type="button" className="studio-brand studio-mobile-brand" onClick={() => setTab('focus')}>
            <span className="studio-mark"><AudioLines aria-hidden="true" /></span>
            <span>StudyPulse</span>
          </button>
          <div className="studio-location">
            <span>Workspace</span>
            <ChevronRight size={13} aria-hidden="true" />
            <span>{currentPage.label}</span>
          </div>
          <div className="studio-toolbar">
            {showMiniTimer && (
              <div className="studio-mini-timer">
                <button type="button" onClick={() => setTab('focus')} aria-label={`Back to timer, ${miniTimer}`}>
                  <Timer size={15} aria-hidden="true" />
                  <span className="font-mono-num">{miniTimer}</span>
                </button>
                <button type="button" onClick={handleToggleRun} aria-label={isRunning ? 'Pause timer' : 'Resume timer'}>
                  {isRunning ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
                </button>
              </div>
            )}
            <button
              type="button"
              className="studio-icon-button"
              onClick={handleTogglePip}
              aria-label="Floating timer"
              aria-pressed={pipActive}
              title="Floating timer"
            >
              <PictureInPicture2 size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="studio-icon-button"
              onClick={handleEnableAlerts}
              aria-label={pushEnabled ? 'Timer notifications enabled' : 'Enable timer notifications'}
              title={pushEnabled ? 'Notifications enabled' : 'Enable notifications'}
            >
              {pushEnabled ? <BellRing size={17} aria-hidden="true" /> : <Bell size={17} aria-hidden="true" />}
            </button>
            <button
              type="button"
              className="studio-icon-button"
              onClick={() => setShowThemeModal(true)}
              aria-label="Select theme"
              title="Select theme"
            >
              <Palette size={17} aria-hidden="true" />
            </button>
            {installPrompt && (
              <button type="button" className="studio-icon-button" onClick={handleInstallApp} aria-label="Install StudyPulse" title="Install StudyPulse">
                <Download size={17} aria-hidden="true" />
              </button>
            )}
          </div>
        </header>

        <main className="studio-main" id="workspace" tabIndex={-1} data-page={tab}>
          <div className="studio-page-heading">
            <h1>{currentPage.title}</h1>
            {tab === 'focus' && (
              <button type="button" className="studio-live-link" onClick={() => setTab('rooms')}>
                <i className="studio-online-dot" aria-hidden="true" />
                {data.onlineCount} studying now
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="studio-content">
            <div className="studio-primary">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.14 }}
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
                    subcategory={subcategory}
                    subcategoryOptions={subcategoryOptions}
                    onChangeSubcategory={(name) => setSubcategorySelection({ subjectId: activeSubject.id, name })}
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
                    timerSyncStatus={timerSyncStatus}
                    remoteTimer={remoteTimer}
                    onResumeRemoteTimer={handleResumeRemoteTimer}
                    onDiscardRemoteTimer={handleDiscardRemoteTimer}
                    onUpdateSubject={handleUpdateSubject}
                    onReorderSubjects={handleReorderSubjects}
                    onMergeSubjects={handleMergeSubjects}
                    onDeleteSubject={handleDeleteSubject}
                  />
                )}

                {tab === 'quest' && (
                  <Suspense fallback={<TabSkeleton />}>
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
                  </Suspense>
                )}

                {tab === 'rooms' && (
                  <Suspense fallback={<TabSkeleton />}>
                    <RoomsView
                      themeId={themeId}
                      rooms={data.rooms}
                      selectedRoomId={selectedRoomId}
                      onSelectRoom={(id) => {
                        setSelectedRoomId(id);
                        pushToast('Switched desk seat');
                      }}
                      onCreateRoom={handleCreateRoom}
                      onDeleteRoom={handleDeleteRoom}
                      onUnlockRoom={handleUnlockRoom}
                      onToggleQuietMode={handleToggleQuietMode}
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
                        pushToast(`Matched "${subName}" — hit Start Focus!`);
                      }}
                    />
                  </Suspense>
                )}

                {tab === 'compete' && (
                  <Suspense fallback={<TabSkeleton />}>
                    <CompeteView
                      user={user}
                      leaderboards={data.leaderboards}
                      subjectBreakdown={data.subjectBreakdown}
                      recentSubjectBreakdown={data.recentSubjectBreakdown}
                      directory={data.directory}
                      league={data.league}
                      activeDuel={data.activeDuel}
                      onStartDuel={handleStartDuel}
                      onClaimDuel={handleClaimDuel}
                      onToggleFriend={handleToggleFriend}
                      onNudgeFriend={handleNudgeFriend}
                    />
                  </Suspense>
                )}

                {tab === 'feed' && (
                  <Suspense fallback={<TabSkeleton />}>
                    <FeedView
                      themeId={themeId}
                      feed={data.feed}
                      publicLeaderboard={data.leaderboards.all}
                      onFetchFeed={fetchFilteredFeed}
                      currentUserId={user.id}
                      subjects={data.subjects}
                      subjectBreakdown={data.subjectBreakdown}
                      onUpdateSession={(id, payload) => handleUpdateSession(id, payload)}
                      onReact={handleReactFeed}
                      onComment={handleCommentFeed}
                      onJumpToFocus={() => setTab('focus')}
                    />
                  </Suspense>
                )}

                {tab === 'me' && (
                  <Suspense fallback={<TabSkeleton />}>
                    <ProfileView
                      themeId={themeId}
                      user={user}
                      heatmap={data.heatmap}
                      heatmap365={data.heatmap365}
                      prevWeekMins={data.prevWeekMins}
                      todayTimeline={data.todayTimeline}
                      studyLogs={data.studyLogs}
                      onUpdateSession={handleUpdateSession}
                      onDeleteSession={handleDeleteSession}
                      onFetchWeeklyAnalytics={handleFetchWeeklyAnalytics}
                      weekTrend={data.weekTrend}
                      subjectBreakdown={data.subjectBreakdown}
                      hourlyDistribution={data.hourlyDistribution}
                      peakWindowLabel={data.peakWindowLabel}
                      achievements={data.achievements}
                      subjects={data.subjects}
                      onUpdateSubject={handleUpdateSubject}
                      onReorderSubjects={handleReorderSubjects}
                      onMergeSubjects={handleMergeSubjects}
                      onDeleteSubject={handleDeleteSubject}
                      onChangePassword={handleChangePassword}
                      onLogoutAllDevices={handleLogoutAllDevices}
                      shop={data.shop}
                      game={data.game}
                      onBuyShopItem={handleBuyShopItem}
                      onRerollDailyShop={handleRerollDailyShop}
                      onEquipGameItem={(id) => handleGameEquip(id).then(() => undefined)}
                      onUpdateProfile={handleUpdateProfile}
                      onLogout={handleLogout}
                    />
                  </Suspense>
                )}
                </motion.div>
              </AnimatePresence>
            </div>

            {tab === 'focus' && (
              <aside className="studio-companion" aria-label="Study overview">
                <section className="studio-panel studio-overview">
                  <h2>Your progress</h2>
                  <dl>
                    <div>
                      <dt><Flame size={15} aria-hidden="true" /> Streak</dt>
                      <dd>{user.streakDays} <span>{user.streakDays === 1 ? 'day' : 'days'}</span></dd>
                    </div>
                    <div>
                      <dt><Coins size={15} aria-hidden="true" /> Focus coins</dt>
                      <dd>{user.coins.toLocaleString()}</dd>
                    </div>
                  </dl>
                </section>

                <section className="studio-panel studio-rooms">
                  <div className="studio-panel-heading">
                    <h2>Study rooms</h2>
                    <button type="button" onClick={() => setTab('rooms')} className="studio-text-button">View all <ArrowRight size={13} aria-hidden="true" /></button>
                  </div>
                  <div className="studio-room-list">
                    {data.rooms.slice(0, 3).map((room) => (
                      <button
                        key={room.id}
                        type="button"
                        className="studio-room"
                        onClick={() => {
                          if (!room.locked) setSelectedRoomId(room.id);
                          setTab('rooms');
                        }}
                      >
                        <span className="studio-room-icon" aria-hidden="true">{room.icon}</span>
                        <span className="studio-room-name">
                          <strong>{room.isPrivate && <Lock size={12} aria-hidden="true" />}{room.name}</strong>
                          <small>{room.topic}</small>
                        </span>
                        <span className="studio-room-count">{room.activeCount} live</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="studio-quest">
                  <Swords size={19} aria-hidden="true" />
                  <h2>Quest</h2>
                  <p>{data.game.shadowSlave?.currentAct.title ?? `Act ${data.game.story.chapter}`}</p>
                  <button type="button" onClick={() => setTab('quest')}>
                    Enter quest <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </section>

                <section className="studio-panel studio-standings">
                  <div className="studio-panel-heading">
                    <h2>Weekly standings</h2>
                    <button type="button" onClick={() => setTab('compete')} className="studio-text-button">View all <ArrowRight size={13} aria-hidden="true" /></button>
                  </div>
                  {data.leaderboards.week.length === 0 ? (
                    <p className="studio-empty">No study time logged this week.</p>
                  ) : (
                    <ol>
                      {data.leaderboards.week.slice(0, 5).map((entry) => (
                        <li key={entry.id}>
                          <span>{entry.rank}</span>
                          <span aria-hidden="true">{entry.avatar}</span>
                          <strong>{entry.displayName}</strong>
                          <span>{(entry.minutes / 60).toFixed(1)}h</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </aside>
            )}
          </div>
        </main>
      </div>

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
            initialSubcategory={subcategory}
            subcategoryOptions={subcategoryOptions}
            onSave={handleSaveSession}
            onDiscard={() => {
              setShowCompleteModal(false);
              baseElapsedRef.current = 0;
              startedAtMsRef.current = Date.now();
              setElapsedSec(0);
              setBonusSec(0);
              setPurityPct(100);
              setFocusTask('');
              syncServerSchedule(false, mode, 0, 0, activeSubject.name, '');
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
