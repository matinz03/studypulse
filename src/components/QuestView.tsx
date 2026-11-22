import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Volume2,
  VolumeX,
  Hammer,
  Trash2,
  Backpack,
  ShoppingBag,
  Flame,
  Gift,
  Building2,
  Waves,
  Dna,
} from 'lucide-react';
import {
  FlashcardItem,
  GameActionResponse,
  GameItem,
  GameState,
  GearSlot,
  IdleAutomationConfig,
  IdleGambitsConfig,
  ItemRarity,
  ShadowActionPayload,
  ShopBuyResponse,
  ShopState,
  User,
} from '../types';
import { ShadowSlave3DCanvas } from '../game/ShadowSlave3DCanvas';
import { StorePanel } from './StorePanel';
import { soundEngine } from '../utils/soundEngine';

export interface QuestViewProps {
  user: User;
  game: GameState;
  shop: ShopState;
  isStudying?: boolean;
  onIdleTick?: (payload?: {
    wavesCleared?: number;
    timerRunning?: boolean;
    triggerUltimate?: boolean;
    outcome?: 'clear' | 'wipe';
  }) => Promise<GameActionResponse>;
  onIdleClaimAfk?: () => Promise<GameActionResponse>;
  onIdleConfig?: (payload: {
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
  }) => Promise<GameActionResponse>;
  onIdleUpgradeProf?: (professionId: string) => Promise<GameActionResponse>;
  onIdleAscend?: () => Promise<GameActionResponse>;
  onIdleUpgradeRelic?: (relicId: string) => Promise<GameActionResponse>;
  onIdleForgeMythic?: (milestoneId: string) => Promise<GameActionResponse>;
  onEquipItem: (itemId: number) => Promise<GameActionResponse>;
  onUpgradeItem: (itemId: number) => Promise<GameActionResponse>;
  onSalvageItem: (payload: { itemId?: number; maxRarity?: string }) => Promise<GameActionResponse>;
  onUpgradeStat: (stat: 'atk' | 'vit' | 'luck' | 'crit') => Promise<GameActionResponse>;
  onSelectSpecialization?: (specKey: string) => Promise<GameActionResponse>;
  onStudyCast?: (payload: { cardId: number; selectedIndex?: number; grade?: number }) => Promise<GameActionResponse>;
  flashcards?: FlashcardItem[];
  onBuyShopItem: (itemKey: string) => Promise<ShopBuyResponse | void>;
  onRerollDailyShop: () => Promise<void>;
  onGoToFocus: () => void;
}

type ShadowSubTab = 'expedition' | 'soul_sea' | 'runes' | 'citadel' | 'exchange';

const RARITY_CLASS: Record<ItemRarity, string> = {
  common: 'rarity-common',
  uncommon: 'rarity-uncommon',
  rare: 'rarity-rare',
  epic: 'rarity-epic',
  legendary: 'rarity-legendary',
  mythic: 'border-rose-500/80 bg-rose-500/15 text-rose-200 shadow-[0_0_16px_rgba(244,63,94,0.22)]',
};

const SLOT_LABELS: { slot: GearSlot; label: string; emptyIcon: string }[] = [
  { slot: 'weapon', label: 'Weapon Memory', emptyIcon: '🗡️' },
  { slot: 'armor', label: 'Armor Memory', emptyIcon: '🛡️' },
  { slot: 'charm', label: 'Relic Charm', emptyIcon: '🧵' },
  { slot: 'companion', label: 'Bound Echo', emptyIcon: '🗿' },
];

function formatItemStats(item: GameItem) {
  return [
    item.atk ? `+${item.atk} ATK` : '',
    item.def ? `+${item.def} DEF` : '',
    item.hp ? `+${item.hp} HP` : '',
    item.luck ? `+${item.luck} FATE` : '',
    item.crit ? `+${item.crit}% CRIT` : '',
  ]
    .filter(Boolean)
    .join(' • ');
}

function formatDurationCompact(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rem = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${rem}s`;
  return `${rem}s`;
}

export function QuestView({
  user,
  game,
  shop,
  isStudying = false,
  onIdleTick,
  onIdleClaimAfk,
  onIdleConfig,
  onIdleUpgradeProf,
  onIdleAscend,
  onIdleUpgradeRelic,
  onIdleForgeMythic,
  onEquipItem,
  onUpgradeItem,
  onSalvageItem,
  onUpgradeStat,
  onSelectSpecialization,
  onStudyCast,
  flashcards = [],
  onBuyShopItem,
  onRerollDailyShop,
  onGoToFocus,
}: QuestViewProps) {
  const [subTab, setSubTab] = useState<ShadowSubTab>('expedition');
  const [busy, setBusy] = useState(false);
  const [eventSeq, setEventSeq] = useState(0);
  const [recentDrop, setRecentDrop] = useState<GameItem | null>(null);
  const [sfxMuted, setSfxMuted] = useState(() => soundEngine.isSfxMuted());
  const [showStudyQuiz, setShowStudyQuiz] = useState(false);
  const [quizCardIdx, setQuizCardIdx] = useState(0);
  const [view3dMode, setView3dMode] = useState<'dream_realm' | 'soul_sea'>('dream_realm');
  const [actionError, setActionError] = useState<string | null>(null);

  const quizCards = flashcards.filter((c) => c.options && c.options.length > 0);
  const activeQuizCard = quizCards.length > 0 ? quizCards[quizCardIdx % quizCards.length] : null;

  const { profile, heroStats, items, equippedBySlot, recentLogs, idle } = game;
  const ss = game.shadowSlave || idle?.shadowSlave;
  const unequippedItems = items.filter((i) => !i.equipped);
  const greatForgeChance = Math.min(35, Math.round(6 + heroStats.luck * 0.45));

  const runAction = useCallback(
    async (fn: () => Promise<GameActionResponse>) => {
      if (busy) return;
      setBusy(true);
      setActionError(null);
      try {
        const res = await fn();
        if (res.events?.length) {
          setEventSeq((s) => s + 1);
        }
        if (res.droppedItem) {
          setRecentDrop(res.droppedItem);
          soundEngine.playPixelLoot(res.droppedItem.rarity === 'mythic' ? 'legendary' : res.droppedItem.rarity);
        }
        return res;
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Action failed');
        return undefined;
      } finally {
        setBusy(false);
      }
    },
    [busy]
  );

  // Periodic background tick while Focus Timer runs
  useEffect(() => {
    if (!isStudying || !onIdleTick) return;
    const id = window.setInterval(() => {
      onIdleTick({ wavesCleared: 1, timerRunning: true }).catch(() => {});
    }, 15_000);
    return () => window.clearInterval(id);
  }, [isStudying, onIdleTick]);

  const overdriveActive = Boolean(idle?.overdriveActive || isStudying);
  const afkSeconds = idle?.afkChest?.accumulatedSec || 0;

  return (
    <div className="space-y-3.5 pb-6">
      {/* Main Shadow Slave 3D Nightmare Realm & Soul Sea Cockpit */}
      <div className="glass-card rounded-3xl p-4 space-y-3">
        {/* Nightmare Spell Runes & Mode Toggle Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1">
                <span>{ss?.aspect.icon || '🌑'}</span>
                <span>Shadow Slave: The Forgotten Shore</span>
              </span>
              {overdriveActive && (
                <span className="px-2 py-0.5 rounded-full bg-sky-500/25 border border-sky-400/60 text-sky-200 text-[10px] font-extrabold flex items-center gap-1 animate-pulse">
                  <Flame className="w-3 h-3 text-amber-300" />
                  MEDITATION FOCUS SYNC
                </span>
              )}
            </div>
            {ss && (
              <div className="text-xs font-extrabold text-white mt-0.5 flex flex-wrap items-center gap-1.5">
                <span style={{ color: ss.aspect.primaryColor }}>[{ss.aspect.name}]</span>
                <span className="text-slate-400">•</span>
                <span>{ss.rank} {ss.coreClass.name} ({ss.coreCount} Core{ss.coreCount > 1 ? 's' : ''})</span>
                <span className="text-slate-400">•</span>
                <span className="text-amber-200">[{ss.trueName}]</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="p-0.5 rounded-xl sp-inset flex items-center gap-1">
              <button
                type="button"
                onClick={() => setView3dMode('dream_realm')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer transition ${
                  view3dMode === 'dream_realm' ? 'sp-btn-primary text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                🌍 3D Dream Realm
              </button>
              <button
                type="button"
                onClick={() => setView3dMode('soul_sea')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer transition ${
                  view3dMode === 'soul_sea' ? 'sp-btn-primary text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                🌊 Dive into Soul Sea
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !sfxMuted;
                soundEngine.setSfxMuted(next);
                setSfxMuted(next);
              }}
              className="p-1.5 rounded-lg sp-badge cursor-pointer"
              title={sfxMuted ? 'Unmute RPG SFX' : 'Mute RPG SFX'}
            >
              {sfxMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={onGoToFocus}
              className="px-2.5 py-1 rounded-full sp-btn-primary text-[10px] font-extrabold cursor-pointer"
            >
              ⚡ Study for Essence
            </button>
          </div>
        </div>

        {/* 4-Metric Soul Saturation Telemetry Strip */}
        {ss && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
            <div className="p-2 rounded-xl sp-inset">
              <div className="font-mono-num text-xs font-extrabold text-white">
                {ss.soulFragments} <span className="text-[10px] text-slate-400 font-normal">/ 1,000</span>
              </div>
              <div className="text-[9px] text-slate-400">Soul Core Saturation</div>
            </div>
            <div className="p-2 rounded-xl sp-inset">
              <div className="font-mono-num text-xs font-extrabold text-sky-300">
                ⚡ {ss.soulEssence}/{ss.maxSoulEssence}
              </div>
              <div className="text-[9px] text-slate-400">❤️ {ss.heroHp}/{ss.heroMaxHp} HP</div>
            </div>
            <div className="p-2 rounded-xl sp-inset">
              <div className="font-mono-num text-xs font-extrabold text-amber-300">✦ {profile.shards}</div>
              <div className="text-[9px] text-slate-400">🪙 {user.coins} Coins</div>
            </div>
            <div className="p-2 rounded-xl sp-inset">
              <div
                className={`font-mono-num text-xs font-extrabold ${
                  ss.sunPhase === 'night'
                    ? 'text-rose-400'
                    : ss.sunPhase === 'dusk'
                      ? 'text-amber-300'
                      : 'text-emerald-300'
                }`}
              >
                {ss.sunPhase === 'night' ? '🌑 NIGHT TIDE' : ss.sunPhase === 'dusk' ? '🌅 DUSK' : '☀️ DAYLIGHT'}
              </div>
              <div className="text-[9px] text-slate-400">
                Black Sea ({ss.sunProgress}%) • {ss.slainShades.count} Shades
              </div>
            </div>
          </div>
        )}

        {/* Progressive Arc 1 Acts Navigation Bar */}
        {ss && onIdleConfig && (
          <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 rounded-2xl sp-inset">
            <div className="text-[10px] font-extrabold text-white px-1 truncate">
              {ss.currentAct.title}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {ss.allActs.map((a) => (
                <button
                  key={a.act}
                  type="button"
                  disabled={busy || !a.unlocked}
                  onClick={() => runAction(() => onIdleConfig({ shadowAction: { type: 'select_act', act: a.act } }))}
                  className={`px-2 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer transition disabled:opacity-40 ${
                    ss.arcAct === a.act ? 'sp-btn-primary text-white' : 'sp-badge text-slate-300 hover:text-white'
                  }`}
                >
                  {a.unlocked ? `Act ${a.act}` : `🔒 Act ${a.act}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nightmare Spell Whisper & Error Feedback */}
        {actionError && (
          <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-400/60 text-[11px] font-bold text-rose-200 flex items-center justify-between gap-2">
            <span>{actionError}</span>
            <button type="button" onClick={() => setActionError(null)} className="px-1.5 py-0.5 rounded sp-badge text-[9px] cursor-pointer">
              Dismiss
            </button>
          </div>
        )}
        {ss?.lastWhisper && (
          <div className="px-3 py-1.5 rounded-xl bg-black/45 border border-white/10 text-[11px] italic text-slate-200">
            {ss.lastWhisper}
          </div>
        )}

        {/* Interactive Non-Pixel Three.js 3D WebGL Engine */}
        {ss && (
          <ShadowSlave3DCanvas
            shadowSlave={ss}
            viewMode={view3dMode}
            eventSeq={eventSeq}
            onSelectNode={(nodeId) => {
              if (onIdleConfig) {
                runAction(() => onIdleConfig({ shadowAction: { type: 'move_node', nodeId } }));
              }
            }}
          />
        )}

        {/* Real-Time Shadow Ribbon Wrapping & Tactical 3D Combat Controls */}
        {ss && onIdleConfig && (
          <div className="p-3 rounded-2xl sp-inset space-y-2.5">
            {/* Active Creature HUD + Intent */}
            {ss.activeCombat && (
              <div className="p-2.5 rounded-xl bg-black/45 border border-white/10 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="text-xs font-extrabold text-white">
                    {ss.activeCombat.isBoss ? '👑 ' : '⚔️ '}
                    {ss.activeCombat.name}
                    <span className="ml-1.5 text-[10px] font-bold text-slate-400">
                      ({ss.activeCombat.rank} {ss.activeCombat.enemyClass})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {ss.activeCombat.staggered ? (
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-extrabold animate-pulse">
                        💥 STAGGERED (2.1× DMG!)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-rose-500/25 border border-rose-400/50 text-rose-200 text-[10px] font-extrabold">
                        Intent: {ss.activeCombat.intent} ({ss.activeCombat.atk} ATK)
                      </span>
                    )}
                    <span className="font-mono-num text-[11px] font-extrabold text-white">
                      {ss.activeCombat.hp}/{ss.activeCombat.maxHp}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all bg-gradient-to-r from-rose-500 to-amber-400"
                    style={{ width: `${Math.max(0, Math.min(100, (ss.activeCombat.hp / Math.max(1, ss.activeCombat.maxHp)) * 100))}%` }}
                  />
                </div>
              </div>
            )}

            {/* Shadow Wrapping Selector */}
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                🌑 Shadow Wrap Control:
              </span>
              <div className="grid grid-cols-3 gap-1.5 flex-1 max-w-md">
                {(
                  [
                    { target: 'weapon', label: '🗡️ Wrap Weapon' },
                    { target: 'body', label: '🛡️ Wrap Body' },
                    { target: 'echo', label: '🗿 Wrap Echo' },
                  ] as const
                ).map((w) => (
                  <button
                    key={w.target}
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      runAction(() => onIdleConfig({ shadowAction: { type: 'wrap_shadow', target: w.target } }))
                    }
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-extrabold cursor-pointer transition ${
                      ss.shadowWrap === w.target ? 'sp-btn-primary text-white' : 'sp-badge text-slate-300 hover:text-white'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Tactical Combat & Survival Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                disabled={busy}
                onClick={() => runAction(() => onIdleConfig({ shadowAction: { type: 'combat_move', move: 'slash' } }))}
                className="py-2 px-2.5 rounded-xl bg-rose-600/85 hover:bg-rose-500 text-white text-[11px] font-extrabold cursor-pointer"
              >
                ⚔️ Soul Slash (6⚡)
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => runAction(() => onIdleConfig({ shadowAction: { type: 'combat_move', move: 'deflect' } }))}
                className="py-2 px-2.5 rounded-xl bg-sky-600/85 hover:bg-sky-500 text-white text-[11px] font-extrabold cursor-pointer"
              >
                🛡️ Deflect & Stagger (+12⚡)
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  runAction(() => onIdleConfig({ shadowAction: { type: 'combat_move', move: 'aspect_art' } }))
                }
                className="py-2 px-2.5 rounded-xl sp-btn-primary text-[11px] font-extrabold cursor-pointer truncate"
                title={ss.aspect.abilityDesc}
              >
                {ss.aspect.icon} Aspect Art (18⚡)
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => runAction(() => onIdleConfig({ shadowAction: { type: 'camp_statue' } }))}
                className="py-2 px-2.5 rounded-xl bg-emerald-600/85 hover:bg-emerald-500 text-white text-[11px] font-extrabold cursor-pointer"
              >
                🏕️ Camp High Statue
              </button>
            </div>
          </div>
        )}

        {/* 3D Waypoint Nodes List for Current Act */}
        {ss && onIdleConfig && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {ss.currentAct.nodes.map((node) => {
              const active = node.id === ss.currentNode.id;
              const cleared = ss.clearedNodeIds.includes(node.id);
              const floodedRisk = ss.sunProgress >= 75 && node.altitude === 'low';
              return (
                <button
                  key={node.id}
                  type="button"
                  disabled={busy}
                  onClick={() => runAction(() => onIdleConfig({ shadowAction: { type: 'move_node', nodeId: node.id } }))}
                  className={`p-2 rounded-xl border text-left space-y-0.5 cursor-pointer transition ${
                    active
                      ? 'sp-tab-active border-sky-400'
                      : floodedRisk
                        ? 'bg-rose-950/40 border-rose-500/45 text-rose-200'
                        : 'sp-inset border-white/15 hover:border-white/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-[9px] font-extrabold uppercase">
                    <span className={node.altitude === 'high' ? 'text-sky-300' : 'text-amber-300'}>
                      {node.altitude === 'high' ? '⛰️ High' : '🪸 Low'}
                    </span>
                    <span>{node.isBoss ? '👑 BOSS' : cleared ? '✓' : `+${node.fragments}✦`}</span>
                  </div>
                  <div className="text-[10px] font-extrabold text-white truncate">{node.name}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* Cockpit Quick Action Strip: Citadel Tribute + Nightmare Study Quiz */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {onIdleClaimAfk && (
            <button
              type="button"
              disabled={busy}
              onClick={() => runAction(onIdleClaimAfk)}
              className="py-2.5 px-3 rounded-xl sp-btn-primary text-[11px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                Claim Citadel Tribute ({idle?.afkChest?.shards || 0}✦ · {formatDurationCompact(afkSeconds)})
              </span>
            </button>
          )}
          {onStudyCast && activeQuizCard && (
            <button
              type="button"
              disabled={busy}
              onClick={() => setShowStudyQuiz((v) => !v)}
              className="py-2.5 px-3 rounded-xl sp-tab-active border border-sky-400/50 text-[11px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🎓 Nightmare Quiz (+Essence & Frags)</span>
            </button>
          )}
        </div>

        {/* Inline University Quiz Overdrive Card */}
        {showStudyQuiz && activeQuizCard && onStudyCast && (
          <div className="p-3 rounded-2xl sp-inset border border-sky-400/40 space-y-2">
            <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-sky-300">
              <span>
                🎓 {activeQuizCard.subjectName} · {activeQuizCard.conceptTitle} — Answer correctly for +28 Soul Essence, +2 Core Fragments & Memory Drop!
              </span>
              <button
                type="button"
                onClick={() => setQuizCardIdx((i) => i + 1)}
                className="px-2 py-0.5 rounded sp-badge text-[10px] cursor-pointer shrink-0"
              >
                Skip Card
              </button>
            </div>
            <div className="text-xs font-bold text-white">{activeQuizCard.front}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {activeQuizCard.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setShowStudyQuiz(false);
                    setQuizCardIdx((i) => i + 1);
                    await runAction(() => onStudyCast({ cardId: activeQuizCard.id, selectedIndex: idx }));
                  }}
                  className="text-left px-2.5 py-2 rounded-xl sp-btn-primary text-[11px] font-bold cursor-pointer"
                >
                  {String.fromCharCode(65 + idx)}. {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Latest Memory Drop Card */}
        <AnimatePresence>
          {recentDrop && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 ${RARITY_CLASS[recentDrop.rarity]}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl">{recentDrop.icon}</span>
                <div className="min-w-0">
                  <div className="text-[10px] font-extrabold uppercase">
                    Memory Woven • {recentDrop.rarity} {recentDrop.autoEquipped ? '• ⚡ Bound!' : ''}
                  </div>
                  <div className="text-xs font-extrabold text-white truncate">{recentDrop.name}</div>
                  <div className="text-[10px] font-mono-num text-slate-200">{formatItemStats(recentDrop)}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {recentDrop.id > 0 && !recentDrop.equipped && (
                  <button
                    type="button"
                    onClick={() => {
                      runAction(() => onEquipItem(recentDrop.id));
                      setRecentDrop(null);
                    }}
                    className="px-2.5 py-1.5 rounded-lg sp-btn-primary text-[10px] font-extrabold cursor-pointer"
                  >
                    Bind
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setRecentDrop(null)}
                  className="px-2 py-1.5 rounded-lg sp-badge text-[10px] font-bold cursor-pointer"
                >
                  OK
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compact Nightmare Spell Chronicle Whispers */}
        {recentLogs.length > 0 && (
          <div className="p-2.5 rounded-2xl sp-inset space-y-1 text-[11px] text-slate-300 border border-white/10">
            {recentLogs.slice(0, 3).map((line, idx) => (
              <div key={idx} className={idx === 0 ? 'font-bold text-white' : 'text-slate-400'}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5 Cohesive Shadow Slave Domain Tabs */}
      <div className="p-1 rounded-2xl sp-inset grid grid-cols-5 gap-1 border border-white/10">
        {(
          [
            { key: 'expedition', label: 'Expedition', icon: Swords },
            { key: 'soul_sea', label: 'Soul Sea', icon: Waves },
            { key: 'runes', label: 'Runes', icon: Dna },
            { key: 'citadel', label: 'Citadel', icon: Building2 },
            { key: 'exchange', label: 'Exchange', icon: ShoppingBag },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          const active = subTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setSubTab(t.key);
                if (t.key === 'soul_sea') setView3dMode('soul_sea');
                else if (t.key === 'expedition') setView3dMode('dream_realm');
              }}
              className={`py-2 px-1 rounded-xl text-[10px] sm:text-[11px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition ${
                active ? 'sp-tab-active' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Nightmare Expedition — Arc I Chronicles, Tide Guide & Cohort */}
      {subTab === 'expedition' && ss && (
        <div className="space-y-3">
          {/* Arc I Act Progression & Tactical Tide Guide */}
          <div className="glass-card rounded-3xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  ⚔️ Arc I: The Forgotten Shore & Crimson Spire
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Conquer each Act&apos;s Boss Statue to advance into deeper regions of the Dream Realm.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full sp-badge text-[10px] font-mono-num font-bold shrink-0">
                Act {ss.arcAct}/{ss.allActs.length} · Appraisal: {ss.appraisal}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ss.allActs.map((act) => {
                const isCurrent = act.act === ss.arcAct;
                return (
                  <button
                    key={act.act}
                    type="button"
                    disabled={busy || !act.unlocked || !onIdleConfig}
                    onClick={() => onIdleConfig && runAction(() => onIdleConfig({ shadowAction: { type: 'select_act', act: act.act } }))}
                    className={`text-left p-3 rounded-2xl border transition cursor-pointer disabled:opacity-45 ${
                      isCurrent ? 'sp-tab-active border-amber-400/55' : 'sp-inset border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-white truncate">{act.title}</span>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full sp-badge shrink-0">
                        {act.unlocked ? (isCurrent ? 'Active' : 'Unlocked') : '🔒 Locked'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">{act.subtitle}</p>
                  </button>
                );
              })}
            </div>

            {/* Rising Black Sea Tactical Cycle Guide */}
            <div className="p-3 rounded-2xl sp-inset border border-white/10 space-y-1.5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                🌑 Rising Black Sea Survival Doctrine
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                <div className="p-2 rounded-xl bg-black/35 border border-sky-400/25">
                  <div className="font-extrabold text-sky-300">☀️ Daylight (0–49%)</div>
                  <div className="text-slate-300 mt-0.5">Low coral plains exposed. Safest window to farm Soul Fragments & hunt lesser abominations.</div>
                </div>
                <div className="p-2 rounded-xl bg-black/35 border border-amber-400/25">
                  <div className="font-extrabold text-amber-300">🌅 Dusk Tide (50–74%)</div>
                  <div className="text-slate-300 mt-0.5">Dark waters surge upward. Ascend to a High Statue node or finish your current encounter.</div>
                </div>
                <div className="p-2 rounded-xl bg-black/35 border border-rose-500/35">
                  <div className="font-extrabold text-rose-300">🌑 Flooded Night (75–100%)</div>
                  <div className="text-slate-300 mt-0.5">All Low Coral tiles submerge! Rest at High Statues (⛰️) to avoid abyssal attrition.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Forgotten Shore Cohort Allies */}
          <div className="glass-card rounded-3xl p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                🛡️ Forgotten Shore Cohort Allies
              </h3>
              <span className="text-[10px] text-slate-400">
                {ss.cohort.filter((c) => c.unlocked).length}/{ss.cohort.length} Joined
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {ss.cohort.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-2xl border space-y-1 ${
                    c.unlocked ? 'sp-tab-active border-amber-400/40' : 'sp-inset border-white/10 opacity-55'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-white flex items-center gap-1.5 truncate">
                      <span className="text-base">{c.icon}</span>
                      <span>{c.name}</span>
                    </span>
                    <span className="text-[9px] font-bold text-amber-200 px-1.5 py-0.5 rounded sp-badge truncate">
                      [{c.trueName}]
                    </span>
                  </div>
                  <div className="text-[10px] text-sky-300 font-bold">
                    {c.unlocked ? c.role : `Unlocks in Act ${Math.min(3, Math.max(2, ss.arcAct + 1))}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Soul Sea, Golden Spellweave Loom & Echoes */}
      {subTab === 'soul_sea' && ss && (
        <div className="space-y-3">
          {/* Soul Core Saturation & Camera Action */}
          <div className="glass-card rounded-3xl p-4 space-y-3 border border-indigo-400/35">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                  <Waves className="w-4 h-4 text-sky-300" />
                  Soul Sea • {ss.coreCount} Eclipsed Core{ss.coreCount > 1 ? 's' : ''} ({ss.coreClass.name})
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Every 1,000 absorbed Soul Fragments saturates a new Eclipsed Sun in your Soul Sea ({ss.slainShades.count} Silent Shades standing guard).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setView3dMode(view3dMode === 'soul_sea' ? 'dream_realm' : 'soul_sea')}
                className="px-3 py-1.5 rounded-xl sp-btn-primary text-[11px] font-extrabold cursor-pointer shrink-0"
              >
                {view3dMode === 'soul_sea' ? '🌍 Return to 3D Dream Realm' : '🌊 Inspect 3D Soul Sea'}
              </button>
            </div>

            <div className="p-3 rounded-2xl sp-inset space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-300">Core Fragment Saturation</span>
                <span className="font-mono-num text-white">{ss.soulFragments} / 1,000 Fragments</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (ss.soulFragments / 1000) * 100)}%`,
                    backgroundColor: ss.aspect.primaryColor,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Woven Memories */}
          <div className="glass-card rounded-3xl p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-200">
                🧵 Spellweave Memories ({ss.memories.length})
              </h3>
              <span className="font-mono-num text-[11px] font-bold text-amber-300">
                {ss.spellweaveStrings} Golden Strings • ✦ {profile.shards} Shards
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ss.memories.map((mem) => (
                <div key={mem.id} className="p-3 rounded-2xl sp-inset border border-amber-400/30 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-extrabold text-white truncate">
                      {mem.icon} {mem.name} <span className="text-amber-300">Weave Lv.{mem.weaveLevel}</span>
                    </div>
                    {onIdleConfig && (
                      <button
                        type="button"
                        disabled={busy || profile.shards < mem.weaveCost}
                        onClick={() =>
                          runAction(() => onIdleConfig({ shadowAction: { type: 'weave_memory', memoryId: mem.id } }))
                        }
                        className="px-2.5 py-1 rounded-lg sp-btn-primary text-[10px] font-extrabold disabled:opacity-40 cursor-pointer shrink-0"
                      >
                        🧵 Weave ({mem.weaveCost}✦)
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-300 leading-snug">{mem.enchantment}</div>
                  <div className="text-[10px] font-mono-num text-sky-300 font-bold">
                    ⚔️ +{mem.effectiveAtk} ATK • 🛡️ +{mem.effectiveDef} DEF • Durability {mem.durability}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Echoes & Stone Saint Awakening */}
          <div className="glass-card rounded-3xl p-4 space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-200">
              🗿 Living Echoes & Shadows ({ss.echoes.filter((e) => e.unlocked).length}/{ss.echoes.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ss.echoes.map((echo) => (
                <div key={echo.id} className="p-3 rounded-2xl sp-inset border border-purple-400/30 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-white truncate">
                      {echo.icon} {echo.name} {echo.unlocked ? `(Tier ${echo.level})` : '🔒 Act II+ Blueprint'}
                    </div>
                    <div className="text-[10px] text-slate-300 mt-0.5">{echo.desc}</div>
                  </div>
                  {onIdleConfig && (
                    <button
                      type="button"
                      disabled={busy || profile.shards < echo.upgradeCost}
                      onClick={() =>
                        runAction(() => onIdleConfig({ shadowAction: { type: 'awaken_echo', echoId: echo.id } }))
                      }
                      className="px-2.5 py-1.5 rounded-xl sp-badge text-[10px] font-extrabold text-purple-200 disabled:opacity-40 cursor-pointer shrink-0"
                    >
                      🗿 Infuse ({echo.upgradeCost}✦)
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Awakened Runes, 126 Innate Attributes, Tempering & Altar of Weaver */}
      {subTab === 'runes' && ss && (
        <div className="space-y-3">
          <div className="glass-card rounded-3xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-11 h-11 rounded-2xl sp-inset flex items-center justify-center text-2xl border shrink-0"
                  style={{ borderColor: `${ss.aspect.primaryColor}66`, boxShadow: `0 0 18px ${ss.aspect.primaryColor}28` }}
                >
                  {ss.aspect.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-white">
                    Aspect: <span style={{ color: ss.aspect.primaryColor }}>[{ss.aspect.name}]</span>{' '}
                    <span className="text-[10px] font-bold text-slate-400">({ss.aspect.rank} Rank)</span>
                  </div>
                  <div className="text-[11px] text-amber-200 font-bold">
                    True Name: [{ss.trueName}] • {ss.aspect.title}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full sp-badge text-[10px] font-bold">
                Focus Ring: {ss.aspect.ringStyle.replace('_', ' ')}
              </span>
            </div>

            <div className="p-3 rounded-2xl sp-inset space-y-1 text-[11px]">
              <div className="font-extrabold text-white">⚡ Aspect Ability: {ss.aspect.abilityName}</div>
              <div className="text-slate-300">{ss.aspect.abilityDesc}</div>
              <div className="text-sky-300 font-bold pt-0.5">Passive Resonance: {ss.aspect.passiveBonus}</div>
            </div>

            {/* 3 Rolled Innate Attributes */}
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                🧬 Rolled Innate Attributes (from 126-Attribute Arsenal)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {ss.attributes.map((a) => (
                  <div key={a.id} className="p-3 rounded-2xl sp-inset border border-white/10 space-y-1">
                    <div className="font-extrabold text-amber-200 text-xs">[{a.name}]</div>
                    <div className="text-[10px] font-bold text-sky-300">
                      {a.category} • ×{a.studyFragmentMult} Study Frags
                    </div>
                    <div className="text-[10px] text-slate-300 leading-snug">{a.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flaw Decree */}
            <div className="p-3 rounded-2xl bg-rose-500/12 border border-rose-400/45 space-y-1">
              <div className="font-extrabold text-rose-200 text-xs">
                ⚠️ Flaw: [{ss.flaw.name}] — {ss.flaw.desc}
              </div>
              <div className="text-[10px] text-rose-100/85">
                <strong>Combat Covenant:</strong> {ss.flaw.combatRule} • <strong>Study Covenant:</strong> {ss.flaw.studyRule}
              </div>
            </div>

            {/* High-Cost Altar of Weaver */}
            {onIdleConfig && (
              <div className="p-3.5 rounded-2xl bg-purple-950/35 border border-purple-400/45 flex flex-wrap items-center justify-between gap-2.5">
                <div>
                  <div className="text-xs font-extrabold text-purple-200">
                    🕸️ Altar of Weaver — Tear & Re-Weave Fate
                  </div>
                  <div className="text-[10px] text-slate-300 mt-0.5">
                    Re-rolling your Aspect, 3 Innate Attributes & Flaw demands intense study effort ({ss.reweaveCost.shards}✦ + {ss.reweaveCost.coins}🪙).
                  </div>
                </div>
                <button
                  type="button"
                  disabled={busy || profile.shards < ss.reweaveCost.shards || user.coins < ss.reweaveCost.coins}
                  onClick={() => runAction(() => onIdleConfig({ shadowAction: { type: 'reweave_fate' } }))}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 text-white text-[11px] font-extrabold disabled:opacity-40 cursor-pointer shrink-0"
                >
                  🕸️ Re-Weave Fate ({ss.reweaveCost.shards}✦ · {ss.reweaveCost.coins}🪙)
                </button>
              </div>
            )}
          </div>

          {/* Soul Core Tempering (Permanent Base Stat Upgrades) */}
          <div className="glass-card rounded-3xl p-4 space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              🔥 Soul Core Tempering (✦ {profile.shards} Shards)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(
                [
                  { key: 'atk', name: 'Aspect Strike Tempering', effect: '+3 Base Nightmare ATK', icon: '⚔️' },
                  { key: 'vit', name: 'Carapace Vitality', effect: '+20 Max HP & +2 DEF', icon: '❤️' },
                  { key: 'luck', name: 'Strings of Fate', effect: '+4 Fate Affinity (Rarity Odds)', icon: '🧵' },
                  { key: 'crit', name: 'Critical Shadow Step', effect: '+2% Critical Strike Chance', icon: '🎯' },
                ] as const
              ).map((u) => {
                const rank = profile.upgrades[u.key];
                const cost = profile.upgradeCosts[u.key];
                const canUpgrade = rank < 20 && profile.shards >= cost;
                return (
                  <div key={u.key} className="p-2.5 rounded-2xl sp-inset flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-white">
                        {u.icon} {u.name} <span className="font-mono-num text-[10px] opacity-75">R{rank}/20</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{u.effect}</div>
                    </div>
                    <button
                      type="button"
                      disabled={busy || !canUpgrade}
                      onClick={() => runAction(() => onUpgradeStat(u.key))}
                      className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold font-mono-num cursor-pointer shrink-0 ${
                        canUpgrade ? 'sp-btn-primary' : 'sp-badge opacity-45 cursor-not-allowed'
                      }`}
                    >
                      ✦{cost}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Citadel Sanctuaries, 12h Tribute & Weaver's Lineage */}
      {subTab === 'citadel' && idle && (
        <div className="space-y-3">
          {/* 12h Offline Citadel Tribute */}
          <div className="glass-card rounded-3xl p-4 space-y-2.5 border border-amber-400/40">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Gift className="w-4 h-4" /> 12-Hour Offline Citadel Tribute
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Gathers Soul Shards, Citadel Coins, Soul XP & scaled Memories 24/7 while you study or rest in the Waking World.
                </p>
              </div>
              {onIdleClaimAfk && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => runAction(onIdleClaimAfk)}
                  className="px-3.5 py-2 rounded-xl sp-btn-primary text-xs font-extrabold cursor-pointer shrink-0"
                >
                  🏰 Collect Tribute
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 text-center font-mono-num text-xs">
              <div className="p-2 rounded-xl sp-inset">
                <div className="font-extrabold text-white">{formatDurationCompact(idle.afkChest.accumulatedSec)}</div>
                <div className="text-[9px] text-slate-400">Stored / 12h</div>
              </div>
              <div className="p-2 rounded-xl sp-inset">
                <div className="font-extrabold text-sky-300">+{idle.afkChest.shards}✦</div>
                <div className="text-[9px] text-slate-400">Soul Shards</div>
              </div>
              <div className="p-2 rounded-xl sp-inset">
                <div className="font-extrabold text-amber-300">+{idle.afkChest.coins}🪙</div>
                <div className="text-[9px] text-slate-400">Coins</div>
              </div>
              <div className="p-2 rounded-xl sp-inset">
                <div className="font-extrabold text-emerald-300">+{idle.afkChest.xp} XP</div>
                <div className="text-[9px] text-slate-400">{Math.max(1, idle.afkChest.itemsRolled)} Memor{idle.afkChest.itemsRolled > 1 ? 'ies' : 'y'}</div>
              </div>
            </div>
          </div>

          {/* Dream Realm Citadel Sanctuaries */}
          <div className="glass-card rounded-3xl p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                🏛️ Dream Realm Citadel Sanctuaries
              </h3>
              <span className="font-mono-num text-xs font-extrabold text-sky-300">✦ {profile.shards} Shards</span>
            </div>

            <div className="space-y-2">
              {idle.professions.map((p) => {
                const canAfford = profile.shards >= p.upgradeCost;
                return (
                  <div key={p.id} className="p-3 rounded-2xl sp-inset flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-10 h-10 rounded-xl sp-badge flex items-center justify-center text-xl shrink-0">
                        {p.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-white">
                          {p.name}{' '}
                          <span className="font-mono-num text-[10px] text-sky-300">Lv.{p.level}</span>
                        </div>
                        <div className="text-[10px] font-mono-num text-emerald-300 font-bold">
                          +{p.ratePerHr} {p.resourceLabel} • {p.squadPerk}
                        </div>
                      </div>
                    </div>
                    {onIdleUpgradeProf && (
                      <button
                        type="button"
                        disabled={busy || !canAfford}
                        onClick={() => runAction(() => onIdleUpgradeProf(p.id))}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold font-mono-num cursor-pointer shrink-0 ${
                          canAfford ? 'sp-btn-primary' : 'sp-badge opacity-45 cursor-not-allowed'
                        }`}
                      >
                        Fortify ✦{p.upgradeCost}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Soul Lineage Awakening & Weaver's Forbidden Lineage Weaves */}
          <div className="glass-card rounded-3xl p-4 space-y-3 border border-rose-500/45">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" /> Weaver&apos;s Lineage Awakening (#{idle.ascensions})
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Extract <strong className="text-amber-300">Weaver Sparks (🩸)</strong> for +35% Multiplicative Nightmare Power while keeping all Memories & Citadel levels.
                </p>
              </div>
              {onIdleAscend && (
                <button
                  type="button"
                  disabled={busy || !idle.canAscend}
                  onClick={() => runAction(onIdleAscend)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer shrink-0 ${
                    idle.canAscend
                      ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white border border-amber-300'
                      : 'sp-inset text-slate-500 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {idle.canAscend ? `🩸 Awaken (+${idle.pendingEmbers} Sparks)` : 'Need Act II or 4 Victories'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {idle.ascensionRelics.map((rel) => {
                const canAfford = idle.celestialEmbers >= rel.nextCost;
                return (
                  <div key={rel.id} className="p-3 rounded-2xl sp-inset border border-white/10 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-white">
                        {rel.icon} {rel.name}{' '}
                        <span className="font-mono-num text-[10px] text-amber-300">Rank {rel.rank}</span>
                      </div>
                      <div className="text-[10px] text-slate-300 mt-0.5">{rel.effectLabel}</div>
                    </div>
                    {onIdleUpgradeRelic && (
                      <button
                        type="button"
                        disabled={busy || !canAfford}
                        onClick={() => runAction(() => onIdleUpgradeRelic(rel.id))}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold font-mono-num cursor-pointer shrink-0 ${
                          canAfford ? 'sp-btn-primary' : 'sp-badge opacity-45 cursor-not-allowed'
                        }`}
                      >
                        🩸 {rel.nextCost}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divine & Sacred Memory Milestones */}
          <div className="glass-card rounded-3xl p-4 space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-300">
              🕸️ Divine &amp; Sacred Memory Milestones ({idle.mythicMilestones.filter((m) => m.claimed).length}/
              {idle.mythicMilestones.length})
            </h3>
            <div className="space-y-2">
              {idle.mythicMilestones.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-2xl border space-y-2 ${
                    m.claimed
                      ? 'border-emerald-500/45 bg-emerald-500/10'
                      : m.unlocked
                        ? 'border-rose-400/70 bg-rose-500/15'
                        : 'sp-inset border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{m.icon}</span>
                        <span className="text-xs font-extrabold text-white">{m.title}</span>
                        <span className="px-2 py-0.5 rounded-full sp-badge text-[9px] font-mono-num font-bold">
                          {m.progress}/{m.target}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-300 mt-0.5">{m.desc}</div>
                    </div>

                    {m.claimed ? (
                      <span className="text-[10px] font-extrabold text-emerald-300 shrink-0">✓ Woven</span>
                    ) : (
                      onIdleForgeMythic && (
                        <button
                          type="button"
                          disabled={busy || !m.unlocked}
                          onClick={() => runAction(() => onIdleForgeMythic(m.id))}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer shrink-0 ${
                            m.unlocked ? 'sp-btn-primary' : 'sp-badge opacity-45 cursor-not-allowed'
                          }`}
                        >
                          {m.unlocked ? '🕸️ Weave Memory' : 'In Progress'}
                        </button>
                      )
                    )}
                  </div>
                  <div className="p-2 rounded-xl sp-inset text-[10px] text-rose-200">
                    <strong>[{m.mythicReward.rarity.toUpperCase()} {m.mythicReward.slot.toUpperCase()}] {m.mythicReward.name}:</strong>{' '}
                    +{m.mythicReward.atk} ATK • +{m.mythicReward.def} DEF • +{m.mythicReward.hp} HP • {m.mythicReward.passiveDesc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Bound Relics, Backpack & Citadel Coin Exchange */}
      {subTab === 'exchange' && (
        <div className="space-y-3">
          {/* Auto-Bind Preferences */}
          {idle && onIdleConfig && (
            <div className="glass-card rounded-3xl p-3 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  runAction(() =>
                    onIdleConfig({ automation: { autoEquipBest: !idle.automation.autoEquipBest } })
                  )
                }
                className={`px-3 py-1.5 rounded-xl border font-extrabold cursor-pointer transition ${
                  idle.automation.autoEquipBest
                    ? 'sp-tab-active border-emerald-400/60 text-emerald-200'
                    : 'sp-badge text-slate-400'
                }`}
              >
                ⚡ Auto-Bind Strongest: {idle.automation.autoEquipBest ? 'ON' : 'OFF'}
              </button>

              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 mr-1">♻️ Auto-Extract Weaker:</span>
                {(['off', 'common', 'uncommon', 'rare'] as const).map((cap) => {
                  const active = idle.automation.autoSalvageMaxRarity === cap;
                  return (
                    <button
                      key={cap}
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(() => onIdleConfig({ automation: { autoSalvageMaxRarity: cap } }))}
                      className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase cursor-pointer ${
                        active ? 'sp-tab-active border border-amber-400/50 text-white' : 'sp-badge text-slate-400'
                      }`}
                    >
                      {cap}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bound Memory Slots */}
          <div className="glass-card rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Backpack className="w-3.5 h-3.5" /> Bound Soul Relics (Thread Surge {greatForgeChance}% 🍀)
              </h3>
              <span className="font-mono-num text-[11px] font-bold text-slate-400">
                ✦ {profile.shards} • 🪙 {user.coins}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SLOT_LABELS.map(({ slot, label, emptyIcon }) => {
                const eq = equippedBySlot[slot];
                if (!eq) {
                  return (
                    <div key={slot} className="p-3 rounded-2xl sp-inset flex items-center gap-2.5 opacity-60">
                      <span className="w-9 h-9 rounded-xl sp-badge flex items-center justify-center text-lg">{emptyIcon}</span>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">{label}</div>
                        <div className="text-xs text-slate-400">Unbound slot</div>
                      </div>
                    </div>
                  );
                }
                const shardCost = 15 + eq.upgradeLevel * 12;
                const coinCost = 10 + eq.upgradeLevel * 8;
                const maxed = eq.upgradeLevel >= 10;
                const canForge = !maxed && profile.shards >= shardCost && user.coins >= coinCost;
                return (
                  <div key={slot} className={`p-3 rounded-2xl sp-inset border ${RARITY_CLASS[eq.rarity]} space-y-2`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{eq.icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-white truncate">
                            {eq.name} {eq.upgradeLevel > 0 ? `+${eq.upgradeLevel}` : ''}
                          </div>
                          <div className="text-[10px] uppercase font-bold">
                            {label} • {eq.rarity} • ⚡{eq.power ?? 0} PWR
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={busy || !canForge}
                        onClick={() => runAction(() => onUpgradeItem(eq.id))}
                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 cursor-pointer shrink-0 ${
                          canForge ? 'sp-btn-primary' : 'sp-badge opacity-45 cursor-not-allowed'
                        }`}
                      >
                        <Hammer className="w-3 h-3" />
                        <span>{maxed ? 'MAX' : `✦${shardCost} 🪙${coinCost}`}</span>
                      </button>
                    </div>
                    <div className="text-[10px] font-mono-num text-slate-300">{formatItemStats(eq)}</div>
                  </div>
                );
              })}
            </div>

            {heroStats.specializations && heroStats.specializations.length > 0 && onSelectSpecialization && (
              <div className="p-3 rounded-2xl sp-inset space-y-2 border border-white/10">
                <div className="text-[11px] font-extrabold text-white">🌟 Sleeper Combat Discipline</div>
                <div className="grid grid-cols-2 gap-2">
                  {heroStats.specializations.map((sp) => {
                    const active = heroStats.specialization === sp.key;
                    return (
                      <button
                        key={sp.key}
                        type="button"
                        disabled={busy}
                        onClick={() => runAction(() => onSelectSpecialization(sp.key))}
                        className={`text-left p-2.5 rounded-xl border transition cursor-pointer ${
                          active ? 'sp-tab-active' : 'sp-badge hover:opacity-90'
                        }`}
                      >
                        <div className="text-[11px] font-extrabold text-white">
                          {active ? '✓ ' : ''}
                          {sp.name}
                        </div>
                        <div className="text-[9px] text-slate-300 leading-snug mt-0.5">{sp.perk}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-slate-300">Stored Relics ({unequippedItems.length}/40)</span>
                {unequippedItems.some((i) => i.rarity === 'common') && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => runAction(() => onSalvageItem({ maxRarity: 'common' }))}
                    className="px-2.5 py-1 rounded-lg sp-badge text-[10px] font-bold hover:opacity-90 cursor-pointer"
                  >
                    ♻️ Dissolve Commons
                  </button>
                )}
              </div>

              {unequippedItems.length === 0 ? (
                <div className="p-3 rounded-2xl sp-inset text-center text-xs text-slate-400">
                  Study sessions and Nightmare skirmishes weave new Soul Relics into your storage.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto glass-scroll pr-1">
                  {unequippedItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 p-2.5 rounded-2xl sp-inset">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-xl sp-badge flex items-center justify-center text-base shrink-0">
                          {item.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate">{item.name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${RARITY_CLASS[item.rarity]}`}>
                              {item.rarity}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono-num text-slate-400 truncate">
                            {item.slot.toUpperCase()} • ⚡{item.power ?? 0} PWR • {formatItemStats(item)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => runAction(() => onEquipItem(item.id))}
                          className="px-2.5 py-1 rounded-lg sp-tab-active border text-[10px] font-extrabold cursor-pointer"
                        >
                          Bind
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => runAction(() => onSalvageItem({ itemId: item.id }))}
                          className="px-2 py-1 rounded-lg sp-badge text-[10px] font-bold cursor-pointer hover:text-rose-400"
                        >
                          <span className="flex items-center gap-0.5 font-mono-num">
                            <Trash2 className="w-3 h-3" /> +{item.salvageValue}✦
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <StorePanel
            user={user}
            shop={shop}
            game={game}
            onBuyShopItem={onBuyShopItem}
            onRerollDailyShop={onRerollDailyShop}
            onEquipLoot={(id) => onEquipItem(id).then(() => undefined)}
            compact
          />
        </div>
      )}
    </div>
  );
}
