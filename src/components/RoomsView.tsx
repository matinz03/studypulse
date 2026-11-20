import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Sparkles, Flame, X, ChevronLeft, ChevronRight, LayoutGrid, Trash2, Swords, Send, Timer } from 'lucide-react';
import { FloatingEmoji, Room, RoomOccupant } from '../types';
import { ThemeId, getThemeMeta, resolveAccent } from '../themes';
import { formatClock } from './FocusView';
import { RoomTavernCanvas } from './RoomTavernCanvas';

interface RoomsViewProps {
  themeId?: ThemeId;
  rooms: Room[];
  selectedRoomId: number;
  onSelectRoom: (roomId: number) => void;
  onCreateRoom: (name: string, topic: string, icon: string, accent: string) => Promise<void>;
  onDeleteRoom?: (roomId: number) => Promise<void>;
  floatingEmojis: FloatingEmoji[];
  onSendCheer: (emoji: string) => void;
  currentUserId: number;
  isRunning: boolean;
  heroEnergy?: number;
  onJumpToFocus: () => void;
  onMatchSubject?: (subjectName: string) => void;
  onRaidStrike?: (roomId: number) => Promise<void>;
  onSendRoomChat?: (roomId: number, content: string) => Promise<void>;
  onSyncRoomTimer?: (phase: 'focus' | 'break') => void;
}

const CHEERS = ['🔥', '⚡', '👏', '☕', '🚀', '🤍'];
const ROOM_ICONS = ['💻', '🏛️', '⚡', '🔥', '🚀', '🧠'];
const ROOM_ACCENTS = ['#FAFAFA', '#E4E4E7', '#D4D4D8', '#A1A1AA', '#71717A'];

function computeLiveSec(occ: RoomOccupant, nowMs: number) {
  if (occ.status !== 'studying') return occ.baseElapsedSec;
  return occ.baseElapsedSec + Math.max(0, Math.floor((nowMs - occ.startedAtMs) / 1000));
}

export function RoomsView({
  themeId = 'shadcn-dark',
  rooms,
  selectedRoomId,
  onSelectRoom,
  onCreateRoom,
  onDeleteRoom,
  floatingEmojis,
  onSendCheer,
  currentUserId,
  isRunning,
  heroEnergy = 0,
  onJumpToFocus,
  onMatchSubject,
  onRaidStrike,
  onSendRoomChat,
  onSyncRoomTimer,
}: RoomsViewProps) {
  const [nowMs, setNowMs] = useState(Date.now());
  const [creating, setCreating] = useState(false);
  const [showAllGrid, setShowAllGrid] = useState(false);
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [icon, setIcon] = useState('🚀');
  const [accent, setAccent] = useState('#FAFAFA');
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [chatText, setChatText] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [strikingRaid, setStrikingRaid] = useState(false);
  const railRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ down: boolean; startX: number; scrollLeft: number; dragged: boolean }>({
    down: false,
    startX: 0,
    scrollLeft: 0,
    dragged: false,
  });

  const themeMeta = getThemeMeta(themeId);

  useEffect(() => {
    const t = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

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

  async function submitChat(e: React.FormEvent) {
    e.preventDefault();
    if (!currentRoom || !onSendRoomChat || !chatText.trim() || sendingChat) return;
    setSendingChat(true);
    try {
      await onSendRoomChat(currentRoom.id, chatText.trim());
      setChatText('');
    } finally {
      setSendingChat(false);
    }
  }

  async function triggerRaidStrike() {
    if (!currentRoom || !onRaidStrike || strikingRaid) return;
    setStrikingRaid(true);
    try {
      await onRaidStrike(currentRoom.id);
    } finally {
      setStrikingRaid(false);
    }
  }

  const cycleSec = Math.floor(nowMs / 1000) % 1800;
  const syncPhase: 'focus' | 'break' = cycleSec < 1500 ? 'focus' : 'break';
  const syncRemaining = syncPhase === 'focus' ? 1500 - cycleSec : 1800 - cycleSec;

  return (
    <div className="space-y-4">
      {/* Room Selector Rail Header & Desktop Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
        <div>
          <h2 className="text-base font-extrabold text-white tracking-tight">Live Study Rooms</h2>
          <p className="text-xs text-slate-400">Sit at a desk & focus together in real time</p>
        </div>
        <div className="flex items-center gap-1.5">
          {!showAllGrid && (
            <>
              <button
                type="button"
                aria-label="Scroll rooms left"
                onClick={() => scrollRail(-1)}
                className="w-7 h-7 rounded-full sp-badge text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Scroll rooms right"
                onClick={() => scrollRail(1)}
                className="w-7 h-7 rounded-full sp-badge text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setShowAllGrid((v) => !v)}
            className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer border transition ${
              showAllGrid ? 'sp-tab-active' : 'sp-badge hover:opacity-90'
            }`}
          >
            <LayoutGrid className="w-3 h-3" />
            <span>{showAllGrid ? 'Rail' : `All (${rooms.length})`}</span>
          </button>
          <button
            type="button"
            onClick={() => setCreating((v) => !v)}
            className="px-3 py-1.5 rounded-full sp-btn-primary text-xs font-bold flex items-center gap-1 cursor-pointer"
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
              className="w-full px-3 py-2.5 rounded-xl sp-input text-xs"
            />
            <input
              type="text"
              maxLength={55}
              placeholder="Focus topic (optional)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl sp-input text-xs"
            />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {ROOM_ICONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setIcon(em)}
                    className={`w-8 h-8 rounded-lg text-base cursor-pointer ${
                      icon === em ? 'sp-tab-active' : 'opacity-65'
                    }`}
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
                    className={`w-5 h-5 rounded-full border border-white/25 cursor-pointer ${
                      accent === c ? 'ring-2 ring-white scale-110' : 'opacity-70'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 rounded-xl sp-btn-primary text-xs font-extrabold cursor-pointer"
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
                active ? 'sp-tab-active' : 'glass-card hover:border-white/25'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <span className="w-8 h-8 rounded-xl sp-inset flex items-center justify-center text-base shrink-0">
                  {room.icon}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="px-2 py-0.5 rounded-full sp-badge text-[11px] font-bold flex items-center gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: themeMeta.colors.accent }}
                    />
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
                      className="w-6 h-6 rounded-full sp-badge hover:border-rose-400/60 hover:text-rose-400 flex items-center justify-center cursor-pointer transition disabled:opacity-40"
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
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full sp-badge">
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
                  <Users className="w-3 h-3" />
                  <span>{currentRoom.totalCount} seated</span>
                  <span>•</span>
                  <span className="font-semibold text-white">{currentRoom.activeCount} studying</span>
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
                  className="w-8 h-8 rounded-xl sp-badge hover:border-rose-400/60 hover:text-rose-400 flex items-center justify-center cursor-pointer transition disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              {!isRunning && (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={onJumpToFocus}
                  className="shrink-0 px-3 py-1.5 rounded-xl sp-btn-primary text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" /> Lock In
                </motion.button>
              )}
            </div>
          </div>

          {/* Live Pixel Study Tavern Canvas */}
          <RoomTavernCanvas
            occupants={currentRoom.occupants}
            currentUserId={currentUserId}
            themeId={themeId}
          />

          {/* Synchronized Group Pomodoro Clock + Co-Op Weekly Raid Boss */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3 relative z-10">
            <div className="rounded-2xl p-3 sp-inset border border-white/10 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Timer className="w-3 h-3" /> Synced Room Clock
                </div>
                <div className="text-xs font-extrabold text-white mt-0.5 flex items-center gap-1.5">
                  <span>{syncPhase === 'focus' ? '🔥 25m Focus' : '☕ 5m Break'}</span>
                  <span className="font-mono-num text-sm">{formatClock(syncRemaining)}</span>
                </div>
              </div>
              {onSyncRoomTimer && (
                <button
                  type="button"
                  onClick={() => onSyncRoomTimer(syncPhase)}
                  className="px-2.5 py-1.5 rounded-xl sp-btn-primary text-[10px] font-extrabold shrink-0 cursor-pointer"
                >
                  Join Sync
                </button>
              )}
            </div>

            {currentRoom.raid && (
              <div className="rounded-2xl p-3 sp-inset border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Co-Op Weekly Raid Boss
                    </div>
                    <div className="text-xs font-extrabold text-white truncate">
                      {currentRoom.raid.bossIcon} {currentRoom.raid.bossName}
                    </div>
                  </div>
                  {onRaidStrike && (
                    <button
                      type="button"
                      disabled={strikingRaid || heroEnergy < 1 || currentRoom.raid.bossHp <= 0}
                      onClick={triggerRaidStrike}
                      className="px-2.5 py-1.5 rounded-xl sp-btn-primary text-[10px] font-extrabold shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-45"
                    >
                      <Swords className="w-3 h-3" />
                      <span>{currentRoom.raid.bossHp <= 0 ? 'Slain!' : 'Strike (1⚡)'}</span>
                    </button>
                  )}
                </div>
                <div className="h-2 rounded-full bg-black/30 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(0, Math.round((currentRoom.raid.bossHp / Math.max(1, currentRoom.raid.bossMaxHp)) * 100))}%`,
                      backgroundColor: themeMeta.colors.accent,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono-num text-slate-400">
                  <span>{currentRoom.raid.bossHp}/{currentRoom.raid.bossMaxHp} HP</span>
                  <span>
                    {currentRoom.raid.contributors[0]
                      ? `Top: ${currentRoom.raid.contributors[0].avatar} ${currentRoom.raid.contributors[0].damage} DMG`
                      : 'Focus sessions deal boss DMG'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Desk Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 relative z-10">
            {currentRoom.occupants.length === 0 ? (
              <div className="col-span-full rounded-2xl p-6 sp-inset text-center">
                <p className="text-xs font-bold text-slate-300">
                  No one is seated in this room right now. Start a focus session to take the first desk!
                </p>
              </div>
            ) : (
              currentRoom.occupants.map((occ) => {
                const liveSec = computeLiveSec(occ, nowMs);
                const isMe = occ.userId === currentUserId;
                const occAccent = resolveAccent(occ.subjectColor, themeId);

                return (
                  <motion.div
                    key={`${occ.userId}-${occ.username}`}
                    layout
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-2xl p-3 border flex flex-col items-center text-center relative ${
                      isMe ? 'sp-tab-active' : 'sp-inset'
                    }`}
                  >
                    {isMe && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full sp-badge">
                        You
                      </span>
                    )}

                    <div className="relative my-1">
                      {occ.status === 'studying' && (
                        <span
                          className="absolute -inset-1 rounded-full border-2 animate-pulse-ring"
                          style={{ borderColor: themeMeta.colors.accent }}
                        />
                      )}
                      <div
                        className="w-12 h-12 rounded-full sp-inset border-2 flex items-center justify-center text-2xl relative z-10"
                        style={{
                          borderColor:
                            occ.status === 'studying'
                              ? themeMeta.colors.accent
                              : occ.status === 'break'
                                ? themeMeta.colors.accent2
                                : undefined,
                        }}
                      >
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
                        className="mt-1 px-2 py-0.5 rounded-full sp-badge text-[10px] font-semibold truncate max-w-full cursor-pointer hover:opacity-90 transition"
                      >
                        {occ.subjectName}
                      </button>
                    ) : (
                      <div className="mt-1 px-2 py-0.5 rounded-full sp-badge text-[10px] font-semibold truncate max-w-full">
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
                        className={`w-1.5 h-1.5 rounded-full ${occ.status === 'studying' ? 'animate-pulse' : 'opacity-50'}`}
                        style={{ backgroundColor: occAccent }}
                      />
                      <span className={occ.status === 'studying' ? 'text-white' : 'text-slate-400'}>
                        {occ.status === 'break' ? `Break ${formatClock(liveSec)}` : occ.status === 'idle' ? 'Ready' : formatClock(liveSec)}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Floating Emoji Cheer Dock */}
          <div className="mt-4 pt-3 border-t border-white/10 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
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
                  className="py-2 rounded-xl sp-badge hover:opacity-90 text-lg cursor-pointer"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Room Break Lounge Chat */}
          {onSendRoomChat && (
            <div className="mt-4 pt-3 border-t border-white/10 relative z-10 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-300">💬 Room Lounge Chat</span>
                <span className="text-[10px] text-slate-400">
                  {syncPhase === 'focus' ? 'Focus phase — keep notes brief' : 'Break phase — chat open!'}
                </span>
              </div>
              {(currentRoom.messages || []).length > 0 && (
                <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                  {(currentRoom.messages || []).slice(-6).map((m) => (
                    <div key={m.id} className="text-[11px] flex items-baseline gap-1.5">
                      <span className="font-bold text-white shrink-0">
                        {m.avatar} {m.displayName}:
                      </span>
                      <span className="text-slate-300 break-words">{m.content}</span>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={submitChat} className="flex gap-1.5">
                <input
                  type="text"
                  maxLength={220}
                  placeholder="Share a goal or break check-in..."
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl sp-input text-xs"
                />
                <button
                  type="submit"
                  disabled={sendingChat || !chatText.trim()}
                  className="px-3 py-1.5 rounded-xl sp-btn-primary text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-45"
                >
                  <Send className="w-3 h-3" /> Send
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
