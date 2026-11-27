import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Users,
  Sparkles,
  Flame,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Trash2,
  Swords,
  Send,
  Timer,
  Lock,
  Globe,
  BellOff,
  Bell,
  Link2,
  Check,
  Eye,
  EyeOff,
  MessageSquare,
} from 'lucide-react';
import { FloatingEmoji, Room, RoomOccupant } from '../types';
import { ThemeId, getThemeMeta, resolveAccent } from '../themes';
import { formatClock } from './FocusView';
import { RoomTavernCanvas } from './RoomTavernCanvas';
import { SUBJECT_PALETTE_12 } from './SubjectManagerModal';

interface RoomsViewProps {
  themeId?: ThemeId;
  rooms: Room[];
  selectedRoomId: number;
  onSelectRoom: (roomId: number) => void;
  onCreateRoom: (
    name: string,
    topic: string,
    icon: string,
    accent: string,
    opts?: { isPrivate?: boolean; passcode?: string; quietMode?: boolean }
  ) => Promise<void>;
  onDeleteRoom?: (roomId: number) => Promise<void>;
  onUnlockRoom?: (roomId: number, payload: { passcode?: string; inviteCode?: string }) => Promise<void>;
  onToggleQuietMode?: (roomId: number, quietMode: boolean) => Promise<void>;
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
const ROOM_ACCENTS = SUBJECT_PALETTE_12.slice(0, 6);

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
  onUnlockRoom,
  onToggleQuietMode,
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
  const [accent, setAccent] = useState('#38BDF8');
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showCreatePass, setShowCreatePass] = useState(false);
  const [quietModeCreate, setQuietModeCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [chatText, setChatText] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [strikingRaid, setStrikingRaid] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [unlockModalRoom, setUnlockModalRoom] = useState<Room | null>(null);
  const [unlockPasscode, setUnlockPasscode] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockBusy, setUnlockBusy] = useState(false);
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
    if (isPrivateRoom && passcode.trim().length < 3) {
      setCreateError('Passcode must be at least 3 characters.');
      return;
    }
    setBusy(true);
    setCreateError(null);
    try {
      await onCreateRoom(name.trim(), topic.trim() || 'Open focus desk', icon, accent, {
        isPrivate: isPrivateRoom,
        passcode: isPrivateRoom ? passcode.trim() : undefined,
        quietMode: quietModeCreate,
      });
      setName('');
      setTopic('');
      setPasscode('');
      setIsPrivateRoom(false);
      setQuietModeCreate(false);
      setCreating(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Unable to create room');
    } finally {
      setBusy(false);
    }
  }

  function handleRoomCardSelect(room: Room) {
    if (room.locked) {
      setUnlockModalRoom(room);
      setUnlockPasscode('');
      setUnlockError(null);
      return;
    }
    onSelectRoom(room.id);
  }

  async function submitUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!unlockModalRoom || !onUnlockRoom || !unlockPasscode.trim() || unlockBusy) return;
    setUnlockBusy(true);
    setUnlockError(null);
    try {
      await onUnlockRoom(unlockModalRoom.id, { passcode: unlockPasscode.trim() });
      setUnlockModalRoom(null);
      setUnlockPasscode('');
    } catch (err) {
      setUnlockError(err instanceof Error ? err.message : 'Incorrect passcode');
    } finally {
      setUnlockBusy(false);
    }
  }

  async function handleCopyInvite() {
    if (!currentRoom?.inviteCode) return;
    const url = `${window.location.origin}/?invite=${currentRoom.inviteCode}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // fallback ignore
    }
    setCopiedInvite(true);
    window.setTimeout(() => setCopiedInvite(false), 2000);
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
    setChatError(null);
    try {
      await onSendRoomChat(currentRoom.id, chatText.trim());
      setChatText('');
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Could not send message');
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
          <h2 className="text-base font-extrabold text-white tracking-tight">Dream Realm Citadels</h2>
          <p className="text-xs text-slate-400">Anchor a Gateway & defend the Sanctuary together in real time</p>
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
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl sp-inset">
              <button
                type="button"
                onClick={() => {
                  setIsPrivateRoom(false);
                  setCreateError(null);
                }}
                className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition ${
                  !isPrivateRoom ? 'sp-tab-active text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> Public
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPrivateRoom(true);
                  setCreateError(null);
                }}
                className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition ${
                  isPrivateRoom ? 'sp-tab-active text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" /> Private
              </button>
            </div>

            {isPrivateRoom && (
              <div className="relative">
                <input
                  type={showCreatePass ? 'text' : 'password'}
                  required
                  minLength={3}
                  maxLength={32}
                  placeholder="Room passcode (3+ chars)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 rounded-xl sp-input text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePass((v) => !v)}
                  aria-label={showCreatePass ? 'Hide passcode' : 'Show passcode'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showCreatePass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            <label className="flex items-center justify-between p-2.5 rounded-xl sp-inset text-xs cursor-pointer">
              <span className="flex items-center gap-2 font-semibold text-slate-200">
                <BellOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Quiet Mode (pause chat during 25m focus)</span>
              </span>
              <input
                type="checkbox"
                checked={quietModeCreate}
                onChange={(e) => setQuietModeCreate(e.target.checked)}
                className="w-4 h-4 accent-current"
              />
            </label>

            {createError && (
              <p className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl sp-danger-pill">{createError}</p>
            )}

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
                handleRoomCardSelect(room);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRoomCardSelect(room);
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
                  {room.isPrivate && (
                    <span
                      title={room.locked ? 'Locked private room' : 'Unlocked private room'}
                      className="w-7 h-7 rounded-full sp-badge flex items-center justify-center text-slate-300"
                    >
                      <Lock className="w-3 h-3" />
                    </span>
                  )}
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
                      className="w-8 h-8 rounded-full sp-badge hover:border-rose-400/60 hover:text-rose-400 flex items-center justify-center cursor-pointer transition disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                <span className="truncate">{room.name}</span>
                {room.quietMode && <BellOff className="w-3 h-3 text-slate-400 shrink-0" />}
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                {room.locked ? 'Passcode protected' : room.topic}
              </div>
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

            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
              {currentRoom.inviteCode && (
                <button
                  type="button"
                  onClick={handleCopyInvite}
                  title="Copy shareable room invite link"
                  className="h-9 px-2.5 rounded-xl sp-badge text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:text-white transition"
                >
                  {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Link2 className="w-3.5 h-3.5" />}
                  <span>{copiedInvite ? 'Copied' : 'Invite'}</span>
                </button>
              )}
              {onToggleQuietMode && (!currentRoom.createdBy || currentRoom.createdBy === currentUserId) && (
                <button
                  type="button"
                  onClick={() => onToggleQuietMode(currentRoom.id, !currentRoom.quietMode)}
                  title="Toggle Quiet Mode during 25m focus blocks"
                  className={`h-9 px-2.5 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer border transition ${
                    currentRoom.quietMode ? 'sp-tab-active text-white' : 'sp-badge text-slate-300 hover:text-white'
                  }`}
                >
                  {currentRoom.quietMode ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{currentRoom.quietMode ? 'Quiet' : 'Open'}</span>
                </button>
              )}
              {rooms.length > 1 && onDeleteRoom && (
                <button
                  type="button"
                  aria-label="Delete current room"
                  title="Delete this room"
                  disabled={deletingId === currentRoom.id}
                  onClick={() => handleDelete(currentRoom.id)}
                  className="w-9 h-9 rounded-xl sp-badge hover:border-rose-400/60 hover:text-rose-400 flex items-center justify-center cursor-pointer transition disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              {!isRunning && (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={onJumpToFocus}
                  className="shrink-0 h-9 px-3 rounded-xl sp-btn-primary text-xs font-extrabold flex items-center gap-1 cursor-pointer"
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
              <div className="rounded-2xl p-3 sp-inset border border-rose-500/35 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-300 truncate">
                    🌑 Active Nightmare Gate Siege
                  </div>
                  {onRaidStrike && (
                    <button
                      type="button"
                      disabled={strikingRaid || heroEnergy < 1 || currentRoom.raid.bossHp <= 0}
                      onClick={triggerRaidStrike}
                      className="px-2.5 py-1 rounded-xl sp-btn-primary text-[10px] font-extrabold shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-45 whitespace-nowrap"
                    >
                      <Swords className="w-3 h-3" />
                      <span>{currentRoom.raid.bossHp <= 0 ? 'Sealed!' : 'Strike (1⚡)'}</span>
                    </button>
                  )}
                </div>
                <div className="text-xs font-extrabold text-white truncate">
                  {currentRoom.raid.bossIcon} {currentRoom.raid.bossName}
                </div>
                <div className="h-2 rounded-full bg-black/40 overflow-hidden border border-white/10">
                  <div
                    className="h-full rounded-full transition-all bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400"
                    style={{
                      width: `${Math.max(0, Math.round((currentRoom.raid.bossHp / Math.max(1, currentRoom.raid.bossMaxHp)) * 100))}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono-num text-slate-400">
                  <span>{currentRoom.raid.bossHp}/{currentRoom.raid.bossMaxHp} HP</span>
                  <span>
                    {currentRoom.raid.contributors[0]
                      ? `Vanguard: ${currentRoom.raid.contributors[0].avatar} ${currentRoom.raid.contributors[0].damage} DMG`
                      : 'Deep focus weakens the Nightmare Gate'}
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
                  No Sleepers anchored in this Citadel yet. Start a focus session to claim the first sanctuary desk!
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

          {/* Floating Emoji Cheer Dock & Room Break Lounge Chat (Quiet Mode aware) */}
          {currentRoom.quietMode && syncPhase === 'focus' ? (
            <div className="mt-4 p-4 rounded-2xl sp-inset border border-white/15 text-center space-y-1.5 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full sp-badge text-[11px] font-bold text-slate-200">
                <BellOff className="w-3.5 h-3.5" />
                <span>Silent Sanctuary Active</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Chat &amp; emoji cheers are paused during the 25m focus phase and reopen automatically on the 5m break.
              </p>
            </div>
          ) : (
            <>
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

              {onSendRoomChat && (
                <div className="mt-4 pt-3 border-t border-white/10 relative z-10 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 opacity-80" /> Room Lounge Chat
                    </span>
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
                  {chatError && (
                    <p className="text-[10px] font-bold px-2.5 py-1 rounded-xl sp-warning-pill">{chatError}</p>
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
            </>
          )}
        </div>
      )}

      {/* Private Room Passcode Gate Modal */}
      {createPortal(
        <AnimatePresence>
          {unlockModalRoom && (
            <div
              className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-label="Unlock Private Room"
            >
              <motion.form
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                onSubmit={submitUnlock}
                className="glass-card w-full max-w-sm rounded-3xl p-5 space-y-3"
              >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-9 h-9 rounded-xl sp-badge flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">{unlockModalRoom.name}</h3>
                    <p className="text-[11px] text-slate-400">Private Study Sanctuary</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUnlockModalRoom(null)}
                  className="w-8 h-8 rounded-xl sp-badge flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter room passcode..."
                value={unlockPasscode}
                onChange={(e) => setUnlockPasscode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl sp-input text-xs"
              />
              {unlockError && (
                <p className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl sp-danger-pill">{unlockError}</p>
              )}
              <button
                type="submit"
                disabled={unlockBusy || !unlockPasscode.trim()}
                className="w-full py-2.5 rounded-xl sp-btn-primary text-xs font-extrabold cursor-pointer disabled:opacity-45"
              >
                {unlockBusy ? 'Verifying...' : 'Unlock Room'}
              </button>
            </motion.form>
          </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
