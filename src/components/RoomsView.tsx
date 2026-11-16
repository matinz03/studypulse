import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Sparkles, Flame, X, ChevronLeft, ChevronRight, LayoutGrid, Trash2 } from 'lucide-react';
import { FloatingEmoji, Room, RoomOccupant } from '../types';
import { formatClock } from './FocusView';

interface RoomsViewProps {
  rooms: Room[];
  selectedRoomId: number;
  onSelectRoom: (roomId: number) => void;
  onCreateRoom: (name: string, topic: string, icon: string, accent: string) => Promise<void>;
  onDeleteRoom?: (roomId: number) => Promise<void>;
  floatingEmojis: FloatingEmoji[];
  onSendCheer: (emoji: string) => void;
  currentUserId: number;
  isRunning: boolean;
  onJumpToFocus: () => void;
  onMatchSubject?: (subjectName: string) => void;
}

const CHEERS = ['🔥', '⚡', '👏', '☕', '🚀', '💜'];
const ROOM_ICONS = ['💻', '🏛️', '⚡', '🔥', '🚀', '🧠'];
const ROOM_ACCENTS = ['#10B981', '#06B6D4', '#8B5CF6', '#F97316', '#EC4899'];

function computeLiveSec(occ: RoomOccupant, nowMs: number) {
  if (occ.status !== 'studying') return occ.baseElapsedSec;
  return occ.baseElapsedSec + Math.max(0, Math.floor((nowMs - occ.startedAtMs) / 1000));
}

export function RoomsView({
  rooms,
  selectedRoomId,
  onSelectRoom,
  onCreateRoom,
  onDeleteRoom,
  floatingEmojis,
  onSendCheer,
  currentUserId,
  isRunning,
  onJumpToFocus,
  onMatchSubject,
}: RoomsViewProps) {
  const [nowMs, setNowMs] = useState(Date.now());
  const [creating, setCreating] = useState(false);
  const [showAllGrid, setShowAllGrid] = useState(false);
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [icon, setIcon] = useState('🚀');
  const [accent, setAccent] = useState('#10B981');
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ down: boolean; startX: number; scrollLeft: number; dragged: boolean }>({
    down: false,
    startX: 0,
    scrollLeft: 0,
    dragged: false,
  });

  useEffect(() => {
    const t = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  // Scroll vertical mouse wheel horizontally when hovering the room rail on desktop/laptop
  useEffect(() => {
    const el = railRef.current;
    if (!el || showAllGrid) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [showAllGrid, rooms.length]);

  // Keep selected/newly-created room card scrolled into view
  useEffect(() => {
    if (showAllGrid || !railRef.current) return;
    const target = railRef.current.querySelector<HTMLElement>(`[data-room-id="${selectedRoomId}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedRoomId, rooms.length, showAllGrid]);

  function scrollRail(dir: -1 | 1) {
    railRef.current?.scrollBy({ left: dir * 240, behavior: 'smooth' });
  }

  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  async function submitRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      await onCreateRoom(name.trim(), topic.trim() || 'Open focus desk', icon, accent);
      setName('');
      setTopic('');
      setCreating(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(roomId: number) {
    if (!onDeleteRoom || deletingId !== null || rooms.length <= 1) return;
    setDeletingId(roomId);
    try {
      await onDeleteRoom(roomId);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Room Selector Rail Header & Desktop Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
        <div>
          <h2 className="text-base font-extrabold text-white">Live Study Rooms</h2>
          <p className="text-xs text-slate-400">Sit at a desk & focus together in real time</p>
        </div>
        <div className="flex items-center gap-1.5">
          {!showAllGrid && (
            <>
              <button
                type="button"
                aria-label="Scroll rooms left"
                onClick={() => scrollRail(-1)}
                className="w-7 h-7 rounded-full glass-pill text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Scroll rooms right"
                onClick={() => scrollRail(1)}
                className="w-7 h-7 rounded-full glass-pill text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setShowAllGrid((v) => !v)}
            className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer border transition ${
              showAllGrid
                ? 'bg-cyan-400/20 border-cyan-300/60 text-cyan-100'
                : 'glass-pill border-white/10 text-slate-200 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3 h-3" />
            <span>{showAllGrid ? 'Rail' : `All (${rooms.length})`}</span>
          </button>
          <button
            type="button"
            onClick={() => setCreating((v) => !v)}
            className="px-3 py-1.5 rounded-full glass-pill text-xs font-bold text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            {creating ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{creating ? 'Close' : 'New Room'}</span>
          </button>
        </div>
      </div>

      {/* Room Creator Drawer */}
      <AnimatePresence>
        {creating && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={submitRoom}
            className="glass-card rounded-2xl p-4 space-y-3 overflow-hidden"
          >
            <input
              type="text"
              required
              maxLength={40}
              placeholder="Room name (e.g. Midnight LeetCode)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400/60"
            />
            <input
              type="text"
              maxLength={55}
              placeholder="Focus topic (optional)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400/60"
            />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {ROOM_ICONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setIcon(em)}
                    className={`w-8 h-8 rounded-lg text-base cursor-pointer ${icon === em ? 'bg-white/15 ring-1 ring-emerald-400' : 'opacity-65'}`}
                  >
                    {em}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                {ROOM_ACCENTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAccent(c)}
                    className={`w-5 h-5 rounded-full cursor-pointer ${accent === c ? 'ring-2 ring-white scale-110' : 'opacity-70'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 text-xs font-extrabold cursor-pointer"
            >
              {busy ? 'Opening Room...' : 'Launch Room'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Scrollable / Draggable Room Cards Rail OR Full Wrap Grid */}
      <div
        ref={railRef}
        onMouseDown={(e) => {
          if (showAllGrid || !railRef.current) return;
          dragRef.current = {
            down: true,
            startX: e.pageX - railRef.current.offsetLeft,
            scrollLeft: railRef.current.scrollLeft,
            dragged: false,
          };
        }}
        onMouseMove={(e) => {
          if (showAllGrid || !dragRef.current.down || !railRef.current) return;
          const x = e.pageX - railRef.current.offsetLeft;
          const dx = x - dragRef.current.startX;
          if (Math.abs(dx) > 5) dragRef.current.dragged = true;
          railRef.current.scrollLeft = dragRef.current.scrollLeft - dx;
        }}
        onMouseUp={() => {
          dragRef.current.down = false;
        }}
        onMouseLeave={() => {
          dragRef.current.down = false;
        }}
        className={
          showAllGrid
            ? 'grid grid-cols-2 gap-2.5'
            : 'flex gap-2.5 overflow-x-auto glass-scroll pb-2 cursor-grab active:cursor-grabbing select-none'
        }
      >
        {rooms.map((room) => {
          const active = room.id === currentRoom?.id;
          return (
            <motion.div
              key={room.id}
              data-room-id={room.id}
              role="button"
              tabIndex={0}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                if (dragRef.current.dragged) {
                  dragRef.current.dragged = false;
                  return;
                }
                onSelectRoom(room.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectRoom(room.id);
                }
              }}
              className={`${showAllGrid ? 'w-full' : 'shrink-0 w-48'} text-left rounded-2xl p-3.5 transition cursor-pointer border relative group ${
                active
                  ? 'glass-card border-emerald-400/50 shadow-[0_0_24px_rgba(16,185,129,0.18)]'
                  : 'bg-slate-900/50 border-white/8 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
                  style={{ backgroundColor: `${room.accent}22`, border: `1px solid ${room.accent}55` }}
                >
                  {room.icon}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {room.activeCount} live
                  </span>
                  {rooms.length > 1 && onDeleteRoom && (
                    <button
                      type="button"
                      aria-label={`Delete room ${room.name}`}
                      title="Delete room"
                      disabled={deletingId === room.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(room.id);
                      }}
                      className="w-6 h-6 rounded-full bg-white/5 hover:bg-rose-500/25 border border-white/10 hover:border-rose-400/50 text-slate-400 hover:text-rose-300 flex items-center justify-center cursor-pointer transition disabled:opacity-40"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="text-xs font-bold text-white truncate">{room.name}</div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">{room.topic}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Live Room Arena */}
      {currentRoom && (
        <div className="glass-card rounded-3xl p-4 relative overflow-hidden">
          {/* Floating Emoji Cheer Overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-16 top-4 overflow-hidden z-20">
            <AnimatePresence>
              {floatingEmojis
                .filter((fe) => fe.id)
                .map((fe) => (
                  <motion.div
                    key={fe.id}
                    initial={{ opacity: 0, y: 80, scale: 0.6 }}
                    animate={{ opacity: [0, 1, 1, 0], y: -180, scale: [0.8, 1.35, 1.1] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.3, ease: 'easeOut' }}
                    style={{ left: `${fe.xOffset}%` }}
                    className="absolute bottom-0 flex flex-col items-center"
                  >
                    <span className="text-3xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">{fe.emoji}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-900/80 text-slate-200 border border-white/10">
                      {fe.sender}
                    </span>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl">{currentRoom.icon}</span>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-white truncate">{currentRoom.name}</h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-emerald-400" />
                  <span>{currentRoom.totalCount} seated</span>
                  <span>•</span>
                  <span className="text-emerald-300 font-semibold">{currentRoom.activeCount} studying</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {rooms.length > 1 && onDeleteRoom && (
                <button
                  type="button"
                  aria-label="Delete current room"
                  title="Delete this room"
                  disabled={deletingId === currentRoom.id}
                  onClick={() => handleDelete(currentRoom.id)}
                  className="w-8 h-8 rounded-xl glass-pill hover:bg-rose-500/20 border border-white/10 hover:border-rose-400/50 text-slate-300 hover:text-rose-300 flex items-center justify-center cursor-pointer transition disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              {!isRunning && (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={onJumpToFocus}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" /> Lock In
                </motion.button>
              )}
            </div>
          </div>

          {/* Desk Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 relative z-10">
            {currentRoom.occupants.length === 0 ? (
              <div className="col-span-full rounded-2xl p-6 bg-slate-950/50 border border-white/8 text-center">
                <p className="text-xs font-bold text-slate-300">
                  No one is seated in this room right now. Start a focus session to take the first desk!
                </p>
              </div>
            ) : (
              currentRoom.occupants.map((occ) => {
              const liveSec = computeLiveSec(occ, nowMs);
              const isMe = occ.userId === currentUserId;
              const ringClass =
                occ.status === 'studying'
                  ? 'border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.28)]'
                  : occ.status === 'break'
                    ? 'border-amber-400'
                    : 'border-slate-600';

              return (
                <motion.div
                  key={`${occ.userId}-${occ.username}`}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl p-3 bg-slate-950/60 border flex flex-col items-center text-center relative ${
                    isMe ? 'border-emerald-400/50 bg-emerald-950/20' : 'border-white/8'
                  }`}
                >
                  {isMe && (
                    <span className="absolute top-2 right-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      You
                    </span>
                  )}

                  <div className="relative my-1">
                    {occ.status === 'studying' && (
                      <span className="absolute -inset-1 rounded-full border-2 border-emerald-400/50 animate-pulse-ring" />
                    )}
                    <div className={`w-12 h-12 rounded-full bg-slate-900 border-2 flex items-center justify-center text-2xl relative z-10 ${ringClass}`}>
                      {occ.avatar}
                    </div>
                  </div>

                  <div className="text-xs font-bold text-white truncate max-w-full mt-1">
                    {occ.displayName}
                  </div>

                  {!isMe && onMatchSubject ? (
                    <button
                      type="button"
                      onClick={() => onMatchSubject(occ.subjectName)}
                      title="Study same subject"
                      className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold truncate max-w-full cursor-pointer hover:brightness-125 transition"
                      style={{ backgroundColor: `${occ.subjectColor}22`, color: occ.subjectColor }}
                    >
                      {occ.subjectName}
                    </button>
                  ) : (
                    <div
                      className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold truncate max-w-full"
                      style={{ backgroundColor: `${occ.subjectColor}22`, color: occ.subjectColor }}
                    >
                      {occ.subjectName}
                    </div>
                  )}

                  {occ.taskTitle && (
                    <div className="mt-1 text-[10px] text-slate-300/90 truncate max-w-full px-1">
                      🎯 {occ.taskTitle}
                    </div>
                  )}

                  <div className="mt-2 font-mono-num text-xs font-bold flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        occ.status === 'studying'
                          ? 'bg-emerald-400 animate-pulse'
                          : occ.status === 'break'
                            ? 'bg-amber-400'
                            : 'bg-slate-500'
                      }`}
                    />
                    <span className={occ.status === 'studying' ? 'text-emerald-300' : occ.status === 'break' ? 'text-amber-300' : 'text-slate-400'}>
                      {occ.status === 'break' ? `Break ${formatClock(liveSec)}` : occ.status === 'idle' ? 'Ready' : formatClock(liveSec)}
                    </span>
                  </div>
                </motion.div>
              );
            })
            )}
          </div>

          {/* Floating Emoji Cheer Dock */}
          <div className="mt-4 pt-3 border-t border-white/8 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Send Silent Room Cheer
              </span>
              <span className="text-[10px] text-slate-500">Live WebSocket</span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {CHEERS.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileTap={{ scale: 0.82 }}
                  whileHover={{ scale: 1.08 }}
                  type="button"
                  onClick={() => onSendCheer(emoji)}
                  className="py-2 rounded-xl glass-pill hover:bg-white/10 text-lg cursor-pointer"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
