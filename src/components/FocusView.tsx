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
} from 'lucide-react';
import { FocusSpirit, getSpiritStage } from './FocusSpirit';
import { Room, Subject, TimerMode } from '../types';
import { SoundPreset } from '../utils/soundEngine';

interface FocusViewProps {
  mode: TimerMode;
  onChangeMode: (m: TimerMode) => void;
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
  wakeLocked: boolean;
  soundPreset: SoundPreset;
  onChangeSound: (p: SoundPreset) => void;
  currentRoom: Room | undefined;
  onGoToRooms: () => void;
  todayMins: number;
  dailyGoalMins: number;
  focusTask: string;
  onChangeFocusTask: (v: string) => void;
}

const MODES: { key: TimerMode; label: string; sub: string }[] = [
  { key: 'pomodoro', label: 'Pomodoro', sub: '25m' },
  { key: 'deep', label: 'Deep Work', sub: '50m' },
  { key: 'stopwatch', label: 'Flow', sub: '∞' },
  { key: 'sprint', label: 'Sprint', sub: '1m' },
];

const SOUNDS: { key: SoundPreset; label: string; icon: string }[] = [
  { key: 'off', label: 'Silent', icon: '🔇' },
  { key: 'rain', label: 'Rain', icon: '🌧️' },
  { key: 'brown', label: 'Brown', icon: '🌊' },
  { key: 'binaural', label: '40Hz', icon: '🧠' },
  { key: 'cafe', label: 'Café', icon: '☕' },
];

const SUBJECT_EMOJIS = ['📚', '💻', '🧠', '📐', '🦀', '⚡', '🎨', '🔬'];
const SUBJECT_COLORS = ['#10B981', '#06B6D4', '#8B5CF6', '#F97316', '#EC4899', '#3B82F6'];

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
  mode,
  onChangeMode,
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
  wakeLocked,
  soundPreset,
  onChangeSound,
  currentRoom,
  onGoToRooms,
  todayMins,
  dailyGoalMins,
  focusTask,
  onChangeFocusTask,
}: FocusViewProps) {
  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubIcon, setNewSubIcon] = useState('📚');
  const [newSubColor, setNewSubColor] = useState('#10B981');
  const [savingSub, setSavingSub] = useState(false);

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
  const angleRad = (progress * 2 * Math.PI) - Math.PI / 2;
  const dotX = 132 + radius * Math.cos(angleRad);
  const dotY = 132 + radius * Math.sin(angleRad);

  const stage = getSpiritStage(elapsedSec);

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

  const goalPct = Math.min(100, Math.round((todayMins / Math.max(1, dailyGoalMins)) * 100));

  return (
    <div className="space-y-4">
      {/* Daily Goal & Focus Intention Strip */}
      <div className="liquid-card rounded-3xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-200">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            Today&apos;s Focus Goal
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono-num text-[11px] font-extrabold text-emerald-300">
              {todayMins}m
            </span>
            <span className="text-[11px] text-slate-400 font-mono-num">/ {dailyGoalMins}m</span>
            <span className="liquid-pill px-2 py-0.5 rounded-full font-mono-num text-[10px] font-bold text-cyan-200">
              {goalPct}%
            </span>
          </div>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 transition-all duration-500"
            style={{ width: `${goalPct}%` }}
          />
        </div>
        <input
          type="text"
          maxLength={100}
          placeholder="🎯 What are you focusing on?"
          value={focusTask}
          onChange={(e) => onChangeFocusTask(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950/55 border border-white/10 text-xs font-medium text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400/55 transition"
        />
      </div>

      {/* Mode Switcher Pills */}
      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl glass-card">
        {MODES.map((m) => {
          const active = mode === m.key;
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
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/25 to-cyan-500/20 border border-emerald-400/35"
                />
              )}
              <div className="relative z-10 text-xs font-bold leading-tight">{m.label}</div>
              <div className="relative z-10 text-[10px] text-slate-400 font-mono-num">{m.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Horizontal Subject Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {subjects.map((sub) => {
          const selected = activeSubject?.id === sub.id;
          return (
            <motion.button
              key={sub.id}
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={() => onSelectSubject(sub)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                selected ? 'text-white shadow-md' : 'text-slate-300 bg-slate-900/60 border-white/10 hover:border-white/25'
              }`}
              style={
                selected
                  ? {
                      backgroundColor: `${sub.color}28`,
                      borderColor: `${sub.color}88`,
                      boxShadow: `0 0 16px ${sub.color}26`,
                    }
                  : undefined
              }
            >
              <span>{sub.icon}</span>
              <span>{sub.name}</span>
            </motion.button>
          );
        })}
        <button
          type="button"
          onClick={() => setAddingSubject((v) => !v)}
          className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold glass-pill text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
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
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400/60"
              />
              <button
                type="submit"
                disabled={savingSub}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold cursor-pointer"
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
                    className={`w-7 h-7 rounded-lg text-sm cursor-pointer ${newSubIcon === em ? 'bg-white/15 ring-1 ring-emerald-400' : 'opacity-65'}`}
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
                    className={`w-5 h-5 rounded-full cursor-pointer ${newSubColor === c ? 'ring-2 ring-white scale-110' : 'opacity-70'}`}
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
        {/* Top micro telemetry pills */}
        <div className="w-full flex items-center justify-between text-[11px] mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/25 text-emerald-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Purity {purityPct}%
          </span>
          {wakeLocked ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/25 text-amber-300 font-medium">
              <Sun className="w-3 h-3" /> Screen Awake
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
              <Sparkles className="w-3 h-3 text-cyan-400" /> {stage.label}
            </span>
          )}
        </div>

        {/* SVG Timer Ring */}
        <div className="relative w-[264px] h-[264px] flex items-center justify-center my-1">
          <svg width="264" height="264" viewBox="0 0 264 264" className="transform">
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={activeSubject?.color || '#10B981'} />
                <stop offset="55%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <filter id="glowRing" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background track */}
            <circle cx="132" cy="132" r={radius} stroke="rgba(255,255,255,0.07)" strokeWidth="11" fill="none" />

            {/* Subtle tick marks */}
            <circle
              cx="132"
              cy="132"
              r={radius - 13}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1.5"
              strokeDasharray="2 9"
              fill="none"
            />

            {/* Active glowing arc */}
            <circle
              cx="132"
              cy="132"
              r={radius}
              stroke="url(#ringGrad)"
              strokeWidth="11"
              strokeLinecap="round"
              fill="none"
              filter="url(#glowRing)"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 132 132)"
              style={{ transition: 'stroke-dashoffset 0.35s linear' }}
            />

            {/* Orbiting beacon dot */}
            {progress > 0.005 && (
              <circle
                cx={dotX}
                cy={dotY}
                r="6.5"
                fill="#FFFFFF"
                stroke={activeSubject?.color || '#10B981'}
                strokeWidth="3"
                filter="url(#glowRing)"
              />
            )}
          </svg>

          {/* Center Content: Concentric Refractive Glass Orb + Focus Spirit + Live Clock */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[190px] h-[190px] rounded-full liquid-pill flex flex-col items-center justify-center p-2 shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
              <FocusSpirit
                elapsedSec={elapsedSec}
                isRunning={isRunning}
                accentColor={activeSubject?.color || '#10B981'}
              />
              <div className="font-mono-num text-[34px] leading-none font-extrabold tracking-tight text-white mt-1">
                {formatClock(displayedSeconds)}
              </div>
              <div className="text-[11px] font-medium text-slate-300 mt-1 flex items-center gap-1.5 max-w-[140px] truncate">
                <span
                  className="w-2 h-2 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: activeSubject?.color || '#10B981' }}
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
            className="whitespace-nowrap shrink-0 px-3 py-3 rounded-2xl glass-pill text-xs font-bold text-cyan-300 hover:text-cyan-200 cursor-pointer"
          >
            +5m
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.03 }}
            type="button"
            onClick={onToggleRun}
            className={`px-7 py-3.5 rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-lg cursor-pointer transition ${
              isRunning
                ? 'bg-amber-400 text-slate-950 shadow-amber-500/25'
                : 'liquid-btn-primary'
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
                ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 hover:bg-emerald-500/30'
                : 'glass-pill text-slate-500 opacity-50 cursor-not-allowed'
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
          className="w-full glass-card rounded-2xl p-3.5 flex items-center justify-between text-left cursor-pointer hover:border-emerald-400/30 transition"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ backgroundColor: `${currentRoom.accent}22`, border: `1px solid ${currentRoom.accent}55` }}
            >
              {currentRoom.icon}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{currentRoom.name}</div>
              <div className="text-[11px] text-slate-400 truncate">
                {isRunning ? 'Your desk is pulsing live here' : 'Seated & ready — tap to view live room'}
              </div>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Users className="w-3.5 h-3.5" />
            <span>{currentRoom.activeCount}</span>
          </div>
        </motion.button>
      )}

      {/* Ambient Soundscape Bar */}
      <div className="glass-card rounded-2xl p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            Focus Soundscape
          </span>
          {soundPreset !== 'off' && (
            <div className="flex items-end gap-0.5 h-3">
              {[0, 1, 2, 3].map((bar) => (
                <motion.span
                  key={bar}
                  animate={{ height: ['35%', '100%', '45%'] }}
                  transition={{ duration: 0.7 + bar * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-1 rounded-full bg-cyan-400"
                />
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {SOUNDS.map((s) => {
            const active = soundPreset === s.key;
            return (
              <motion.button
                key={s.key}
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => onChangeSound(s.key)}
                className={`py-2 px-1 rounded-xl text-center transition cursor-pointer border ${
                  active
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-white'
                    : 'bg-slate-900/50 border-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-sm">{s.icon}</div>
                <div className="text-[10px] font-semibold mt-0.5">{s.label}</div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
