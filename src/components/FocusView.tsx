import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  CheckCircle2,
  Plus,
  Volume2,
  ShieldCheck,
  Sparkles,
  Users,
  Sun,
  X,
  Target,
  Lock,
  Unlock,
  PictureInPicture2,
  ListTodo,
  Trash2,
  Check,
  Clock,
  Sliders,
  Coins,
} from 'lucide-react';
import { FocusSpirit, getSpiritStage } from './FocusSpirit';
import { UniversityVaultPanel } from './UniversityVaultPanel';
import { Room, StudyTask, Subject, SubjectStat, TimerMode, UniversityData } from '../types';
import { ThemeId, getThemeMeta, resolveAccent } from '../themes';
import { SAVED_MIX_PRESETS, SoundPreset, TrackKey } from '../utils/soundEngine';

interface FocusViewProps {
  themeId?: ThemeId;
  mode: TimerMode;
  onChangeMode: (m: TimerMode) => void;
  customMins: number;
  onChangeCustomMins: (mins: number) => void;
  pomoCycleCount: number;
  isRunning: boolean;
  onToggleRun: () => void;
  elapsedSec: number;
  targetSec: number;
  onBoost5m: () => void;
  onFinishSession: () => void;
  subjects: Subject[];
  activeSubject: Subject;
  onSelectSubject: (s: Subject) => void;
  onCreateSubject: (name: string, color: string, icon: string) => Promise<void>;
  purityPct: number;
  strictMode: boolean;
  onToggleStrictMode: () => void;
  wakeLocked: boolean;
  pipActive: boolean;
  pipSupported: boolean;
  onTogglePip: () => void;
  soundPreset: SoundPreset;
  soundVolume: number;
  onChangeSound: (p: SoundPreset) => void;
  onChangeSoundVolume: (v: number) => void;
  trackMix?: Record<TrackKey, number>;
  onChangeTrackMix?: (mix: Partial<Record<TrackKey, number>>) => void;
  onApplyMixPreset?: (key: string) => void;
  wagerCoins?: number;
  onChangeWagerCoins?: (coins: number) => void;
  userCoins?: number;
  university?: UniversityData;
  subjectBreakdown?: SubjectStat[];
  onSyncUniversitySubjects?: () => Promise<void>;
  onReviewFlashcard?: (cardId: number, grade?: number, selectedIndex?: number) => Promise<{ isCorrect?: boolean } | void>;
  onCreateFlashcards?: (payload: {
    subjectName: string;
    courseKey: string;
    front?: string;
    back?: string;
    markdownText?: string;
  }) => Promise<void>;
  onSaveStudyNote?: (payload: {
    id?: number;
    subjectName: string;
    title: string;
    contentMd: string;
  }) => Promise<void>;
  onDeleteStudyNote?: (id: number) => Promise<void>;
  onSaveExamGoal?: (payload: {
    courseKey: string;
    subjectName: string;
    examTitle: string;
    examDate: string;
    targetHours: number;
  }) => Promise<void>;
  currentRoom: Room | undefined;
  onGoToRooms: () => void;
  todayMins: number;
  dailyGoalMins: number;
  focusTask: string;
  onChangeFocusTask: (v: string) => void;
  spiritSkin?: string;
  tasks: StudyTask[];
  activeTaskId: number | null;
  onSelectTask: (task: StudyTask | null) => void;
  onCreateTask: (title: string, subjectName: string, targetPomos: number) => Promise<void>;
  onToggleTaskDone: (task: StudyTask) => Promise<void>;
  onDeleteTask: (taskId: number) => Promise<void>;
  onLogManual: (mins: number, note: string) => Promise<void>;
}

const MODES: { key: TimerMode; label: string; sub: string }[] = [
  { key: 'pomodoro', label: 'Pomodoro', sub: '25m' },
  { key: 'deep', label: 'Deep Work', sub: '50m' },
  { key: 'custom', label: 'Custom', sub: 'mins' },
  { key: 'break', label: 'Break', sub: '5m' },
  { key: 'stopwatch', label: 'Flow', sub: '∞' },
  { key: 'sprint', label: 'Sprint', sub: '1m' },
];

const SOUNDS: { key: SoundPreset; label: string; icon: string }[] = [
  { key: 'off', label: 'Silent', icon: '🔇' },
  { key: 'rain', label: 'Rain', icon: '🌧️' },
  { key: 'brown', label: 'Brown', icon: '🌊' },
  { key: 'binaural', label: '40Hz', icon: '🧠' },
  { key: 'cafe', label: 'Café', icon: '☕' },
  { key: 'fire', label: 'Fire', icon: '🔥' },
  { key: 'library', label: 'Library', icon: '📖' },
];

const SUBJECT_EMOJIS = ['📚', '💻', '🧠', '📐', '🦀', '⚡', '🎨', '🔬'];
const SUBJECT_COLORS = ['#FAFAFA', '#E4E4E7', '#D4D4D8', '#A1A1AA', '#71717A', '#52525B'];

export function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function FocusView({
  themeId = 'shadcn-dark',
  mode,
  onChangeMode,
  customMins,
  onChangeCustomMins,
  pomoCycleCount,
  isRunning,
  onToggleRun,
  elapsedSec,
  targetSec,
  onBoost5m,
  onFinishSession,
  subjects,
  activeSubject,
  onSelectSubject,
  onCreateSubject,
  purityPct,
  strictMode,
  onToggleStrictMode,
  wakeLocked,
  pipActive,
  pipSupported,
  onTogglePip,
  soundPreset,
  soundVolume,
  onChangeSound,
  onChangeSoundVolume,
  trackMix,
  onChangeTrackMix,
  onApplyMixPreset,
  wagerCoins = 0,
  onChangeWagerCoins,
  userCoins = 0,
  university,
  subjectBreakdown = [],
  onSyncUniversitySubjects,
  onReviewFlashcard,
  onCreateFlashcards,
  onSaveStudyNote,
  onDeleteStudyNote,
  onSaveExamGoal,
  currentRoom,
  onGoToRooms,
  todayMins,
  dailyGoalMins,
  focusTask,
  onChangeFocusTask,
  spiritSkin = 'default',
  tasks,
  activeTaskId,
  onSelectTask,
  onCreateTask,
  onToggleTaskDone,
  onDeleteTask,
  onLogManual,
}: FocusViewProps) {
  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubIcon, setNewSubIcon] = useState('📚');
  const [newSubColor, setNewSubColor] = useState('#FAFAFA');
  const [savingSub, setSavingSub] = useState(false);

  const [loggingManual, setLoggingManual] = useState(false);
  const [manualMins, setManualMins] = useState(30);
  const [manualNote, setManualNote] = useState('');
  const [savingManual, setSavingManual] = useState(false);

  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPomos, setNewTaskPomos] = useState(2);
  const [savingTask, setSavingTask] = useState(false);
  const [showMixer, setShowMixer] = useState(false);

  const themeMeta = getThemeMeta(themeId);
  const resolvedSubAccent = resolveAccent(activeSubject?.color, themeId);

  const isStopwatch = mode === 'stopwatch';
  const displayedSeconds = isStopwatch ? elapsedSec : Math.max(0, targetSec - elapsedSec);
  const progress = isStopwatch
    ? Math.min(1, (elapsedSec % 3600) / 3600)
    : targetSec > 0
      ? Math.min(1, elapsedSec / targetSec)
      : 0;

  const radius = 114;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);
  const angleRad = progress * 2 * Math.PI - Math.PI / 2;
  const dotX = 132 + radius * Math.cos(angleRad);
  const dotY = 132 + radius * Math.sin(angleRad);

  const stage = getSpiritStage(elapsedSec, spiritSkin, themeId);

  async function submitSubject(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubName.trim() || savingSub) return;
    setSavingSub(true);
    try {
      await onCreateSubject(newSubName.trim(), newSubColor, newSubIcon);
      setNewSubName('');
      setAddingSubject(false);
    } finally {
      setSavingSub(false);
    }
  }

  async function submitTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim() || savingTask) return;
    setSavingTask(true);
    try {
      await onCreateTask(newTaskTitle.trim(), activeSubject.name, newTaskPomos);
      setNewTaskTitle('');
      setAddingTask(false);
    } finally {
      setSavingTask(false);
    }
  }

  async function submitManual(e: React.FormEvent) {
    e.preventDefault();
    if (savingManual) return;
    setSavingManual(true);
    try {
      await onLogManual(manualMins, manualNote);
      setManualNote('');
      setLoggingManual(false);
    } finally {
      setSavingManual(false);
    }
  }

  const goalPct = Math.min(100, Math.round((todayMins / Math.max(1, dailyGoalMins)) * 100));

  return (
    <div className="space-y-4">
      {/* Daily Goal, Manual Log & Focus Intention Strip */}
      <div className="liquid-card rounded-3xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-200">
            <Target className="w-3.5 h-3.5 opacity-80" />
            Today&apos;s Focus Goal
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono-num text-[11px] font-extrabold text-white">
              {todayMins}m
            </span>
            <span className="text-[11px] text-slate-400 font-mono-num">/ {dailyGoalMins}m</span>
            <span className="sp-badge px-2 py-0.5 rounded-full font-mono-num text-[10px] font-bold">
              {goalPct}%
            </span>
            <button
              type="button"
              onClick={() => setLoggingManual((v) => !v)}
              className="sp-badge px-2 py-0.5 rounded-full text-[10px] font-bold hover:opacity-90 flex items-center gap-1 cursor-pointer"
              title="Log offline study session"
            >
              <Clock className="w-2.5 h-2.5" /> +Log
            </button>
          </div>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${goalPct}%`, backgroundColor: themeMeta.colors.accent }}
          />
        </div>
        <input
          type="text"
          maxLength={100}
          placeholder="🎯 What are you focusing on?"
          value={focusTask}
          onChange={(e) => onChangeFocusTask(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-2xl sp-input text-xs font-medium transition"
        />

        <AnimatePresence>
          {loggingManual && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={submitManual}
              className="pt-2 border-t border-white/10 space-y-2 overflow-hidden"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Log Offline {activeSubject.name} Block</span>
                <span className="font-mono-num font-bold text-white">{manualMins} mins</span>
              </div>
              <input
                type="range"
                min={5}
                max={180}
                step={5}
                value={manualMins}
                onChange={(e) => setManualMins(Number(e.target.value))}
                className="w-full accent-current"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={120}
                  placeholder="Optional note (e.g. textbook reading)"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl sp-input text-xs"
                />
                <button
                  type="submit"
                  disabled={savingManual}
                  className="px-3 py-1.5 rounded-xl sp-btn-primary text-xs font-extrabold cursor-pointer"
                >
                  {savingManual ? '...' : 'Save'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Mode Switcher Segmented Control */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1 rounded-2xl glass-card">
        {MODES.map((m) => {
          const active = mode === m.key;
          const subLabel = m.key === 'custom' ? `${customMins}m` : m.sub;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => onChangeMode(m.key)}
              className={`relative py-2 px-1 rounded-xl text-center transition cursor-pointer ${
                active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="focusModePill"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-xl sp-tab-active"
                />
              )}
              <div className="relative z-10 text-xs font-bold leading-tight">{m.label}</div>
              <div className="relative z-10 text-[10px] text-slate-400 font-mono-num">{subLabel}</div>
            </button>
          );
        })}
      </div>

      {/* Custom Timer Duration Selector */}
      {mode === 'custom' && !isRunning && (
        <div className="glass-card rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">Custom Timer Length</span>
            <span className="font-mono-num font-extrabold text-white">{customMins} mins</span>
          </div>
          <input
            type="range"
            min={5}
            max={180}
            step={5}
            value={customMins}
            onChange={(e) => onChangeCustomMins(Number(e.target.value))}
            className="w-full accent-current"
          />
          <div className="flex items-center gap-1.5">
            {[15, 35, 45, 60, 90].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onChangeCustomMins(m)}
                className={`flex-1 py-1 rounded-lg font-mono-num text-[11px] font-bold cursor-pointer transition ${
                  customMins === m ? 'sp-tab-active' : 'sp-badge text-slate-300'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Wrapping Subject Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
        {subjects.map((sub) => {
          const selected = activeSubject?.id === sub.id;
          return (
            <motion.button
              key={sub.id}
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={() => onSelectSubject(sub)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                selected ? 'sp-tab-active font-bold' : 'sp-inset text-slate-300 hover:border-white/25'
              }`}
            >
              <span>{sub.icon}</span>
              <span>{sub.name}</span>
            </motion.button>
          );
        })}
        <button
          type="button"
          onClick={() => setAddingSubject((v) => !v)}
          className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold sp-badge text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          {addingSubject ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{addingSubject ? 'Cancel' : 'Subject'}</span>
        </button>
      </div>

      {/* Quick Inline Subject Creator */}
      <AnimatePresence>
        {addingSubject && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={submitSubject}
            className="glass-card rounded-2xl p-3.5 space-y-2.5 overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                maxLength={28}
                placeholder="New subject (e.g. Organic Chem)"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl sp-input text-xs"
              />
              <button
                type="submit"
                disabled={savingSub}
                className="px-3.5 py-2 rounded-xl sp-btn-primary text-xs font-bold cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {SUBJECT_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setNewSubIcon(em)}
                    className={`w-7 h-7 rounded-lg text-sm cursor-pointer ${
                      newSubIcon === em ? 'sp-tab-active' : 'opacity-65'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                {SUBJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewSubColor(c)}
                    className={`w-5 h-5 rounded-full border border-white/25 cursor-pointer ${
                      newSubColor === c ? 'ring-2 ring-white scale-110' : 'opacity-70'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Main Circular Timer & Focus Spirit Dial */}
      <div className="glass-card rounded-3xl p-5 flex flex-col items-center relative overflow-hidden">
        {/* Top micro telemetry & smart purity badges */}
        <div className="w-full flex flex-wrap items-center justify-between gap-1.5 text-[11px] mb-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full sp-badge font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 opacity-80" />
              Purity {purityPct}%
            </span>
            <button
              type="button"
              onClick={onToggleStrictMode}
              title={
                strictMode
                  ? 'Strict Lock: 1.25x XP boost, penalizes app-switching even with PiP'
                  : 'Multi-App PiP: Use external apps freely with PiP without Purity penalty'
              }
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-bold cursor-pointer border transition ${
                strictMode ? 'sp-btn-primary' : 'sp-badge hover:opacity-90'
              }`}
            >
              {strictMode ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              <span>{strictMode ? 'Strict 1.25x' : 'Multi-App'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="sp-badge px-2 py-1 rounded-full text-[10px] font-mono-num font-bold">
              🍅 {(pomoCycleCount % 4) + 1}/4
            </span>
            {mode === 'stopwatch' && (
              <span className="sp-badge px-2 py-1 rounded-full text-[10px] font-mono-num font-bold">
                ☕ Earned +{Math.max(1, Math.floor(elapsedSec / 300))}m
              </span>
            )}
            {onChangeWagerCoins && (
              <button
                type="button"
                disabled={isRunning || elapsedSec > 0}
                onClick={() => {
                  const next = wagerCoins === 0 ? 15 : wagerCoins === 15 ? 30 : 0;
                  if (next <= userCoins || next === 0) onChangeWagerCoins(next);
                  else onChangeWagerCoins(0);
                }}
                title="High-Stakes Focus Wager: earn 2x Coins + 15 Shards at >=90% Purity"
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold cursor-pointer border transition disabled:opacity-50 ${
                  wagerCoins > 0 ? 'sp-btn-primary' : 'sp-badge hover:opacity-90'
                }`}
              >
                <Coins className="w-3 h-3" />
                <span>{wagerCoins > 0 ? `Wager ${wagerCoins}` : 'Wager'}</span>
              </button>
            )}
            {pipSupported && (
              <button
                type="button"
                onClick={onTogglePip}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold cursor-pointer border transition ${
                  pipActive ? 'sp-tab-active' : 'sp-badge hover:opacity-90'
                }`}
              >
                <PictureInPicture2 className="w-3 h-3" />
                <span>{pipActive ? 'Floating' : 'Float'}</span>
              </button>
            )}
            {wakeLocked ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full sp-badge font-medium">
                <Sun className="w-3 h-3" /> Awake
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full sp-badge text-slate-400">
                <Sparkles className="w-3 h-3" /> {stage.label}
              </span>
            )}
          </div>
        </div>

        {/* Precision Chronometer SVG Timer Ring */}
        <div className="relative w-[264px] h-[264px] flex items-center justify-center my-1">
          <svg width="264" height="264" viewBox="0 0 264 264" className="transform">
            <defs>
              <linearGradient id={`ringGrad-${themeId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={themeMeta.colors.accent} />
                <stop offset="55%" stopColor={themeMeta.colors.accent2} />
                <stop offset="100%" stopColor={themeMeta.colors.accent} />
              </linearGradient>
              <filter id="glowRing" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Outer bezel hairline */}
            <circle cx="132" cy="132" r="125" stroke={themeMeta.colors.track} strokeWidth="1" fill="none" />

            {/* Background recessed track */}
            <circle cx="132" cy="132" r={radius} stroke={themeMeta.colors.track} strokeWidth="10" fill="none" />

            {/* 60 Precision Chronometer Dial Ticks */}
            {Array.from({ length: 60 }).map((_, idx) => {
              const major = idx % 5 === 0;
              const deg = idx * 6;
              return (
                <line
                  key={idx}
                  x1="132"
                  y1={major ? 16 : 19}
                  x2="132"
                  y2={23}
                  stroke={major ? themeMeta.colors.accent2 : themeMeta.colors.track}
                  strokeOpacity={major ? 0.55 : 0.8}
                  strokeWidth={major ? 1.5 : 1}
                  transform={`rotate(${deg} 132 132)`}
                />
              );
            })}

            {/* Active precision progress arc */}
            <circle
              cx="132"
              cy="132"
              r={radius}
              stroke={`url(#ringGrad-${themeId})`}
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
              filter="url(#glowRing)"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 132 132)"
              style={{ transition: 'stroke-dashoffset 0.35s linear' }}
            />

            {/* Orbiting precision index beacon */}
            {progress > 0.005 && (
              <circle
                cx={dotX}
                cy={dotY}
                r="6"
                fill={themeMeta.light ? '#ffffff' : '#09090b'}
                stroke={themeMeta.colors.accent}
                strokeWidth="3"
                filter="url(#glowRing)"
              />
            )}
          </svg>

          {/* Center Content: Machined Recessed Chronometer Core */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[186px] h-[186px] sp-dial-core flex flex-col items-center justify-center p-2">
              <FocusSpirit
                elapsedSec={elapsedSec}
                isRunning={isRunning}
                accentColor={resolvedSubAccent}
                spiritSkin={spiritSkin}
                themeId={themeId}
              />
              <div className="font-mono-num text-[36px] leading-none font-extrabold tracking-tighter text-white mt-1.5">
                {formatClock(displayedSeconds)}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 mt-1.5 flex items-center gap-1.5 max-w-[140px] truncate">
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: resolvedSubAccent }}
                />
                <span className="truncate">{activeSubject?.name || 'Focus'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="w-full flex items-center justify-center gap-3 mt-2">
          <motion.button
            whileTap={{ scale: 0.93 }}
            type="button"
            onClick={onBoost5m}
            title="Add +5m focus boost"
            className="whitespace-nowrap shrink-0 px-3 py-3 rounded-2xl sp-badge text-xs font-bold hover:opacity-90 cursor-pointer"
          >
            +5m
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.02 }}
            type="button"
            onClick={onToggleRun}
            className={`px-7 py-3.5 rounded-2xl font-extrabold text-sm flex items-center gap-2 cursor-pointer transition ${
              isRunning ? 'sp-tab-active ring-1 ring-current' : 'sp-btn-primary'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isRunning ? 'Pause' : elapsedSec > 0 ? 'Resume' : 'Start Focus'}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.93 }}
            type="button"
            disabled={elapsedSec < 5}
            onClick={onFinishSession}
            className={`px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
              elapsedSec >= 5
                ? 'sp-btn-primary'
                : 'sp-badge text-slate-500 opacity-50 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finish</span>
          </motion.button>
        </div>
      </div>

      {/* Live Study Room Presence Pill */}
      {currentRoom && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onGoToRooms}
          className="w-full glass-card rounded-2xl p-3.5 flex items-center justify-between text-left cursor-pointer hover:border-white/25 transition"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl sp-inset flex items-center justify-center text-lg shrink-0">
              {currentRoom.icon}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{currentRoom.name}</div>
              <div className="text-[11px] text-slate-400 truncate">
                {isRunning ? 'Your desk is pulsing live here' : 'Seated & ready — tap to view live room'}
              </div>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full sp-badge text-xs font-bold">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: themeMeta.colors.accent }}
            />
            <Users className="w-3.5 h-3.5" />
            <span>{currentRoom.activeCount}</span>
          </div>
        </motion.button>
      )}

      {/* Study Task Queue & Planner */}
      <div className="glass-card rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <ListTodo className="w-3.5 h-3.5 opacity-80" />
            Study Task Queue
          </span>
          <button
            type="button"
            onClick={() => setAddingTask((v) => !v)}
            className="px-2.5 py-1 rounded-full sp-badge text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            {addingTask ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            <span>{addingTask ? 'Close' : 'Add Task'}</span>
          </button>
        </div>

        <AnimatePresence>
          {addingTask && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={submitTask}
              className="space-y-2 pb-1 overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  maxLength={90}
                  placeholder="New task (e.g. Ch. 5 Practice Set)"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl sp-input text-xs"
                />
                <select
                  value={newTaskPomos}
                  onChange={(e) => setNewTaskPomos(Number(e.target.value))}
                  className="px-2 py-2 rounded-xl sp-input text-xs font-mono-num"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}🍅
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={savingTask}
                  className="px-3 py-2 rounded-xl sp-btn-primary text-xs font-extrabold cursor-pointer"
                >
                  {savingTask ? '...' : 'Add'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="space-y-1.5">
          {tasks.slice(0, 6).map((task) => {
            const pinned = activeTaskId === task.id;
            return (
              <div
                key={task.id}
                className={`flex items-center justify-between gap-2 p-2.5 rounded-2xl border transition ${
                  pinned ? 'sp-tab-active' : 'sp-inset border-white/8'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onToggleTaskDone(task)}
                  aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer transition ${
                    task.done ? 'sp-btn-primary' : 'border-white/25 hover:border-white/50'
                  }`}
                >
                  {task.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTask(pinned ? null : task)}
                  className="flex-1 text-left min-w-0 cursor-pointer"
                >
                  <div
                    className={`text-xs font-semibold truncate ${
                      task.done ? 'line-through text-slate-500' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono-num">
                    {task.subjectName} • {task.completedPomos}/{task.targetPomos} 🍅
                    {pinned ? ' • Pinned to Timer' : ''}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  aria-label="Delete task"
                  className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ambient Soundscape Bar + Volume Slider */}
      <div className="glass-card rounded-2xl p-3 space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5" />
            Focus Soundscape
          </span>
          <div className="flex items-center gap-2">
            {soundPreset !== 'off' && (
              <div className="flex items-end gap-0.5 h-3">
                {[0, 1, 2, 3].map((bar) => (
                  <motion.span
                    key={bar}
                    animate={{ height: ['35%', '100%', '45%'] }}
                    transition={{ duration: 0.7 + bar * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-1 rounded-full"
                    style={{ backgroundColor: themeMeta.colors.accent }}
                  />
                ))}
              </div>
            )}
            <span className="font-mono-num text-[10px] text-slate-400">
              {Math.round(soundVolume * 100)}%
            </span>
            {onChangeTrackMix && (
              <button
                type="button"
                onClick={() => setShowMixer((v) => !v)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer border ${
                  showMixer || soundPreset === 'mix' ? 'sp-tab-active' : 'sp-badge'
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span>Mixer</span>
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
          {SOUNDS.map((s) => {
            const active = soundPreset === s.key;
            return (
              <motion.button
                key={s.key}
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => onChangeSound(s.key)}
                className={`py-2 px-1 rounded-xl text-center transition cursor-pointer border ${
                  active ? 'sp-tab-active font-bold' : 'sp-inset text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-sm">{s.icon}</div>
                <div className="text-[10px] font-semibold mt-0.5">{s.label}</div>
              </motion.button>
            );
          })}
        </div>
        <input
          type="range"
          min={0.05}
          max={1}
          step={0.05}
          value={soundVolume}
          onChange={(e) => onChangeSoundVolume(Number(e.target.value))}
          aria-label="Soundscape volume"
          className="w-full h-1.5 accent-current cursor-pointer"
        />

        {showMixer && onChangeTrackMix && trackMix && (
          <div className="pt-2 border-t border-white/10 space-y-2">
            {onApplyMixPreset && (
              <div className="flex flex-wrap gap-1.5">
                {SAVED_MIX_PRESETS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => onApplyMixPreset(p.key)}
                    className="px-2.5 py-1 rounded-full sp-badge text-[10px] font-bold cursor-pointer hover:opacity-90"
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {SOUNDS.filter((s) => s.key !== 'off').map((s) => {
                const tk = s.key as TrackKey;
                const val = trackMix[tk] || 0;
                return (
                  <div key={tk} className="p-2 rounded-xl sp-inset space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-200">{s.icon} {s.label}</span>
                      <span className="font-mono-num text-slate-400">{Math.round(val * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={val}
                      aria-label={`Mix ${s.label}`}
                      onChange={(e) => onChangeTrackMix({ [tk]: Number(e.target.value) })}
                      className="w-full h-1 accent-current cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* University Vault & Active Learning Hub */}
      {university && onSyncUniversitySubjects && onReviewFlashcard && onCreateFlashcards && onSaveStudyNote && onDeleteStudyNote && onSaveExamGoal && (
        <UniversityVaultPanel
          university={university}
          subjectBreakdown={subjectBreakdown}
          coins={userCoins}
          onSyncSubjects={onSyncUniversitySubjects}
          onReviewCard={onReviewFlashcard}
          onCreateFlashcards={onCreateFlashcards}
          onSaveNote={onSaveStudyNote}
          onDeleteNote={onDeleteStudyNote}
          onSaveExamGoal={onSaveExamGoal}
        />
      )}
    </div>
  );
}
