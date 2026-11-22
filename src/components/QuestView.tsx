import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Swords,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Hammer,
  Trash2,
  Backpack,
  ShoppingBag,
  Flame,
  Gift,
  Crown,
  Building2,
  Sliders,
} from 'lucide-react';
import {
  FlashcardItem,
  GameActionResponse,
  GameItem,
  GameState,
  GameTurnEvent,
  GearSlot,
  IdleAutomationConfig,
  IdleGambitsConfig,
  ItemRarity,
  LoopHandCard,
  ShopBuyResponse,
  ShopState,
  User,
} from '../types';
import { PixelCanvas } from '../game/PixelCanvas';
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

type IdleSubTab = 'squad' | 'guild' | 'ascension' | 'armory' | 'store';

const RARITY_CLASS: Record<ItemRarity, string> = {
  common: 'rarity-common',
  uncommon: 'rarity-uncommon',
  rare: 'rarity-rare',
  epic: 'rarity-epic',
  legendary: 'rarity-legendary',
  mythic: 'border-rose-500/80 bg-rose-500/15 text-rose-200 shadow-[0_0_16px_rgba(244,63,94,0.22)]',
};

const SLOT_LABELS: { slot: GearSlot; label: string; emptyIcon: string }[] = [
  { slot: 'weapon', label: 'Weapon', emptyIcon: '🗡️' },
  { slot: 'armor', label: 'Armor', emptyIcon: '🛡️' },
  { slot: 'charm', label: 'Charm', emptyIcon: '🍀' },
  { slot: 'companion', label: 'Pet', emptyIcon: '🦅' },
];

function formatItemStats(item: GameItem) {
  return [
    item.atk ? `+${item.atk} ATK` : '',
    item.def ? `+${item.def} DEF` : '',
    item.hp ? `+${item.hp} HP` : '',
    item.luck ? `+${item.luck} LUCK` : '',
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
  const [subTab, setSubTab] = useState<IdleSubTab>('squad');
  const [busy, setBusy] = useState(false);
  const [lastEvents, setLastEvents] = useState<GameTurnEvent[]>([]);
  const [eventSeq, setEventSeq] = useState(0);
  const [recentDrop, setRecentDrop] = useState<GameItem | null>(null);
  const [sfxMuted, setSfxMuted] = useState(() => soundEngine.isSfxMuted());
  const [showStudyQuiz, setShowStudyQuiz] = useState(false);
  const [quizCardIdx, setQuizCardIdx] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showRecipes, setShowRecipes] = useState(false);

  const quizCards = flashcards.filter((c) => c.options && c.options.length > 0);
  const activeQuizCard = quizCards.length > 0 ? quizCards[quizCardIdx % quizCards.length] : null;

  const { profile, heroStats, items, equippedBySlot, recentLogs, idle } = game;
  const loop = idle?.loop;
  const handCards: LoopHandCard[] = loop?.hand || [];
  const selectedCard = handCards.find((c) => c.id === selectedCardId) || null;
  const unequippedItems = items.filter((i) => !i.equipped);
  const greatForgeChance = Math.min(35, Math.round(6 + heroStats.luck * 0.45));

  const runAction = useCallback(
    async (fn: () => Promise<GameActionResponse>) => {
      if (busy) return;
      setBusy(true);
      try {
        const res = await fn();
        if (res.events?.length) {
          setLastEvents(res.events);
          setEventSeq((s) => s + 1);
        }
        if (res.droppedItem) {
          setRecentDrop(res.droppedItem);
          soundEngine.playPixelLoot(res.droppedItem.rarity === 'mythic' ? 'legendary' : res.droppedItem.rarity);
        }
        return res;
      } finally {
        setBusy(false);
      }
    },
    [busy]
  );

  // Silent wave clear or wipe sync from the 60fps side-scrolling canvas
  const handleAutoWaveClear = useCallback(
    async (opts: { isBossWave: boolean; triggerUltimate: boolean; outcome?: 'clear' | 'wipe' }) => {
      if (!onIdleTick) return;
      try {
        const res = await onIdleTick({
          wavesCleared: 1,
          timerRunning: isStudying,
          triggerUltimate: opts.triggerUltimate,
          outcome: opts.outcome,
        });
        if (res.events?.length) {
          setLastEvents(res.events);
          setEventSeq((s) => s + 1);
        }
        if (res.droppedItem) {
          setRecentDrop(res.droppedItem);
        }
      } catch {
        // Ignore transient network errors during background idle tick
      }
    },
    [onIdleTick, isStudying]
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

  const handlePlaceLoopTile = useCallback(
    async (gx: number, gy: number) => {
      if (!onIdleConfig || !loop) return;
      const roadSet = new Set(loop.roadPath.map((p) => `${p.x},${p.y}`));
      const camp = loop.roadPath[0];
      if (camp && gx === camp.x && gy === camp.y) return;
      const isRoad = roadSet.has(`${gx},${gy}`);
      const cardToPlace =
        selectedCard ||
        handCards.find((c) => (c.placement === 'road') === isRoad) ||
        null;
      if (!cardToPlace) return;
      setSelectedCardId(null);
      try {
        await runAction(() =>
          onIdleConfig({ placeCard: { cardId: cardToPlace.id, x: gx, y: gy } })
        );
      } catch {
        // Invalid placement errors handled silently without crashing loop
      }
    },
    [onIdleConfig, loop, selectedCard, handCards, runAction]
  );

  return (
    <div className="space-y-3.5 pb-6">
      {/* Main Loop Architect Cockpit Card */}
      <div className="glass-card rounded-3xl p-4 space-y-3">
        {/* Realm Stage, Loop Greed & Audio/Focus Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
                🗺️ Aethelgard: Loop Architect
              </span>
              {overdriveActive ? (
                <span className="px-2 py-0.5 rounded-full bg-sky-500/25 border border-sky-400/60 text-sky-200 text-[10px] font-extrabold flex items-center gap-1 animate-pulse">
                  <Flame className="w-3 h-3 text-amber-300" />
                  {(idle?.speedMultiplier || 4.0).toFixed(1)}× STUDY OVERDRIVE
                  {idle?.overdriveRemainingSec ? ` (${formatDurationCompact(idle.overdriveRemainingSec)})` : ''}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full sp-badge text-[10px] font-bold text-slate-300">
                  ⚡ {(idle?.speedMultiplier || 1.0).toFixed(1)}× Base Pace
                </span>
              )}
            </div>
            <div className="text-xs font-extrabold text-white mt-0.5">
              {idle?.realm?.name || 'Verdant Sky-Bastion'} · Stage {idle?.stage || 1} · Loop #{loop?.loopCount || 1} (Greed ×
              {(loop?.greedMultiplier || 1).toFixed(2)}) · Boss Threat {loop?.threatPct ?? 0}%
              {loop?.bossActive ? ' 👑 BOSS READY' : ''}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {idle && idle.maxStage > 1 && onIdleConfig && (
              <div className="flex items-center gap-1 sp-inset rounded-xl p-1">
                <button
                  type="button"
                  disabled={busy || idle.stage <= 1}
                  onClick={() => runAction(() => onIdleConfig({ stage: idle.stage - 1 }))}
                  aria-label="Previous Stage"
                  className="p-1 rounded-lg sp-badge disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono-num font-bold px-1.5 text-white">
                  S{idle.stage}/{idle.maxStage}
                </span>
                <button
                  type="button"
                  disabled={busy || idle.stage >= idle.maxStage}
                  onClick={() => runAction(() => onIdleConfig({ stage: idle.stage + 1 }))}
                  aria-label="Next Stage"
                  className="p-1 rounded-lg sp-badge disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
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
              ⚡ Study for 4× Speed
            </button>
          </div>
        </div>

        {/* 4-Metric Idle Telemetry Strip */}
        {(() => {
          const squadPow = idle?.squadPower ?? heroStats.atk * 10;
          const recPow = idle?.recommendedPower ?? 160;
          const powRatio = recPow > 0 ? squadPow / recPow : 1;
          const powTone =
            powRatio >= 1.05 ? 'text-emerald-300' : powRatio >= 0.8 ? 'text-amber-300' : 'text-rose-300';
          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
              <div className="p-2 rounded-xl sp-inset">
                <div className={`font-mono-num text-xs font-extrabold ${powTone}`}>
                  ⚔️ {squadPow} <span className="text-[10px] text-slate-400 font-normal">/ {recPow}</span>
                </div>
                <div className="text-[9px] text-slate-400">
                  Stage Rec • {idle?.squadDps ?? heroStats.atk * 3} vs {idle?.enemyDps ?? 12} DPS
                </div>
              </div>
              <div className="p-2 rounded-xl sp-inset">
                <div className="font-mono-num text-xs font-extrabold text-sky-300">✦ {profile.shards}</div>
                <div className="text-[9px] text-slate-400">+{idle?.shardsPerHr ?? 45}/hr</div>
              </div>
              <div className="p-2 rounded-xl sp-inset">
                <div className="font-mono-num text-xs font-extrabold text-amber-300">🪙 {user.coins}</div>
                <div className="text-[9px] text-slate-400">+{idle?.coinsPerHr ?? 30}/hr</div>
              </div>
              <div className="p-2 rounded-xl sp-inset">
                <div className="font-mono-num text-xs font-extrabold text-rose-300">
                  🔥 {idle?.celestialEmbers ?? 0}
                </div>
                <div className="text-[9px] text-slate-400">Ascend ×{(idle?.ascensionMult ?? 1).toFixed(2)}</div>
              </div>
            </div>
          );
        })()}

        {/* Campfire 1-of-3 Run Relic Draft Banner */}
        {loop && loop.pendingRelicChoices.length > 0 && onIdleConfig && (
          <div className="p-3 rounded-2xl bg-sky-500/12 border border-sky-400/45 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold text-sky-200">
                🕯️ Campfire Relic Draft — Choose 1 Permanent Run Power
              </span>
              <span className="text-[10px] text-slate-300 font-bold">
                Active: {loop.activeRelics.length} Relic{loop.activeRelics.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {loop.pendingRelicChoices.map((rel) => (
                <button
                  key={rel.id}
                  type="button"
                  disabled={busy}
                  onClick={() => runAction(() => onIdleConfig({ pickRelic: rel.id }))}
                  className="p-2.5 rounded-xl sp-inset border border-sky-400/40 hover:border-amber-300/70 text-left space-y-1 cursor-pointer transition"
                >
                  <div className="text-[11px] font-extrabold text-white flex items-center gap-1.5">
                    <span>{rel.icon}</span>
                    <span className="truncate">{rel.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-300 leading-snug">{rel.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Boss Wall Alert & Re-Challenge Banner */}
        {idle && (idle.bossWallStuck || idle.gambits.stageProgression === 'farm_stage') && onIdleConfig && (
          <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/50 flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[11px] font-extrabold text-amber-200">
                {idle.bossWallStuck
                  ? `🛡️ Emergency Extraction Retreat — Farming Stage ${idle.stage}`
                  : `🔁 Farming Mode Active — Stage ${idle.stage}`}
              </div>
              <div className="text-[10px] text-amber-100/80">
                Stage {idle.stage} Boss Rec Power: {idle.bossRecPower ?? Math.round((idle.recommendedPower ?? 160) * 1.45)} · Stack Loop Synergies or Study Overdrive before retrying.
              </div>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => runAction(() => onIdleConfig({ challengeBoss: true }))}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white border border-amber-300/60 text-[11px] font-extrabold cursor-pointer shrink-0"
            >
              👑 Challenge Stage {idle.stage} Boss
            </button>
          </div>
        )}

        {/* Active Loop Trait Synergies & Campfire Relics Bar */}
        {loop && (
          <div className="flex flex-wrap items-center gap-1.5">
            {loop.activeTraits.map((tr) => {
              const lit = tr.tier > 0;
              const nextBp = tr.breakpoints.find((b) => b > tr.count) ?? tr.breakpoints[tr.breakpoints.length - 1];
              return (
                <span
                  key={tr.id}
                  title={`${tr.name}: ${tr.activeDesc}`}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border ${
                    lit
                      ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                      : tr.count > 0
                        ? 'sp-badge border-white/20 text-slate-200'
                        : 'sp-inset border-white/10 text-slate-500'
                  }`}
                >
                  {tr.icon} {tr.name.split(' ')[0]} {tr.count}/{nextBp}
                </span>
              );
            })}
            {loop.activeRelics.map((r) => (
              <span
                key={r.id}
                title={r.desc}
                className="px-2 py-0.5 rounded-lg bg-sky-500/15 border border-sky-400/45 text-sky-200 text-[10px] font-bold"
              >
                {r.icon} {r.name}
              </span>
            ))}
          </div>
        )}

        {/* Interactive 7x5 Tactical Loop-Builder Pixel Canvas */}
        <PixelCanvas
          game={game}
          lastEvents={lastEvents}
          eventSeq={eventSeq}
          focusFever={heroStats.studyBonuses.focusFever}
          isStudying={isStudying}
          selectedCard={selectedCard}
          onAutoWaveClear={handleAutoWaveClear}
          onPlaceLoopTile={handlePlaceLoopTile}
        />

        {/* Battle Pace Pill Switcher & Auto-Architect Toggle */}
        {idle && onIdleConfig && (
          <div className="p-2 rounded-2xl sp-inset flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 px-1">
                ⏱️ Pace
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(
                  [
                    { key: '1x', label: '1× Tactical' },
                    { key: '2x', label: '2× Brisk' },
                    { key: 'overdrive', label: '⚡ Max' },
                  ] as const
                ).map((opt) => {
                  const active = (idle.gambits.battlePace || '1x') === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(() => onIdleConfig({ gambits: { battlePace: opt.key } }))}
                      className={`py-1 px-2 rounded-xl text-[10px] font-extrabold cursor-pointer transition ${
                        active ? 'sp-btn-primary text-white' : 'sp-badge text-slate-300 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {loop && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  runAction(() => onIdleConfig({ toggleAutoArchitect: !loop.autoArchitect }))
                }
                className={`px-2.5 py-1 rounded-xl border text-[10px] font-extrabold cursor-pointer transition ${
                  loop.autoArchitect
                    ? 'sp-tab-active border-sky-400/60 text-sky-200'
                    : 'sp-badge text-slate-300 hover:text-white'
                }`}
              >
                🤖 Auto-Architect: {loop.autoArchitect ? 'ON' : 'OFF'}
              </button>
            )}
          </div>
        )}

        {/* Tactical Tile Card Hand + Adjacency Evolution Recipes */}
        {loop && onIdleConfig && (
          <div className="p-3 rounded-2xl sp-inset space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] font-extrabold text-white">
                🃏 Tactical Tile Hand ({handCards.length}/7)
                <span className="text-[10px] font-normal text-slate-400 ml-1.5">
                  {selectedCard
                    ? `Selected ${selectedCard.icon} ${selectedCard.name} — tap any highlighted ${selectedCard.placement.toUpperCase()} cell above!`
                    : 'Select a card & tap the 7×5 grid, or click Place / Merge'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setShowRecipes((v) => !v)}
                  className="px-2 py-1 rounded-lg sp-badge text-[10px] font-extrabold text-amber-300 cursor-pointer"
                >
                  🧪 5 Evolutions
                </button>
                <button
                  type="button"
                  disabled={busy || handCards.length === 0}
                  onClick={() => runAction(() => onIdleConfig({ mergeHand: true }))}
                  className="px-2.5 py-1 rounded-lg sp-btn-primary text-[10px] font-extrabold disabled:opacity-40 cursor-pointer"
                >
                  ✨ Merge Duplicates
                </button>
              </div>
            </div>

            {showRecipes && (
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-amber-400/35 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] text-slate-200">
                <div>🌸 Meadow + Non-Meadow → <strong className="text-emerald-300">🌺 Blooming Sanctuary</strong></div>
                <div>🏚️ Village + 🧛 Vampire Manor → <strong className="text-amber-300">🏰 Count&apos;s Estate</strong></div>
                <div>⛰️ Mountain + 2 Mountains → <strong className="text-sky-300">🏔️ Celestial Summit</strong></div>
                <div>🗼 Storm + 🔮 Chrono/Storm → <strong className="text-cyan-300">⚡ Tesla Spire</strong></div>
                <div className="sm:col-span-2">⚗️ Alchemist Vault + 3 Neighbor Tiles → <strong className="text-rose-300">💎 Mythic Treasury (+1 Gear Roll!)</strong></div>
              </div>
            )}

            {handCards.length === 0 ? (
              <div className="text-[11px] text-slate-400 py-2 text-center">
                Hand empty — let your hero battle along the Loop or answer a Study Quiz to draw +2 ★2 Cards!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {handCards.map((c) => {
                  const isSel = selectedCard?.id === c.id;
                  const starsStr = '★'.repeat(c.stars || 1);
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCardId(isSel ? null : c.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSelectedCardId(isSel ? null : c.id);
                      }}
                      className={`p-2 rounded-xl border cursor-pointer transition flex flex-col justify-between gap-1.5 ${
                        isSel
                          ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.28)]'
                          : 'bg-slate-900/70 border-white/15 hover:border-sky-400/60'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-base">{c.icon}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                              c.placement === 'road'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {c.placement === 'road' ? 'ROAD' : 'LAND'}
                          </span>
                        </div>
                        <div className="text-[11px] font-extrabold text-white truncate">
                          <span className="text-amber-300 mr-1">{starsStr}</span>
                          {c.name}
                        </div>
                        <div className="text-[9px] text-slate-300 line-clamp-2 leading-tight">{c.desc}</div>
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCardId(null);
                          runAction(() => onIdleConfig({ placeCard: { cardId: c.id } }));
                        }}
                        className="w-full py-1 px-1.5 rounded-lg sp-badge hover:text-white text-[9px] font-extrabold text-sky-300 cursor-pointer"
                      >
                        ⚡ Place / Merge
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Push-Your-Luck Expedition Loot Sack & Extraction Bar */}
        {loop && onIdleConfig && (
          <div className="p-2.5 rounded-2xl bg-emerald-500/12 border border-emerald-400/40 flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                🎒 Unbanked Expedition Loot Sack (Greed ×{loop.greedMultiplier.toFixed(2)})
              </div>
              <div className="text-xs font-mono-num font-extrabold text-white mt-0.5">
                +{loop.lootSack.shards}✦ Shards · +{loop.lootSack.coins}🪙 · +{loop.lootSack.xp} XP · {loop.lootSack.gearRolls} Gear Roll{loop.lootSack.gearRolls === 1 ? '' : 's'}
              </div>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => runAction(() => onIdleConfig({ extractLoop: true }))}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-[11px] cursor-pointer shrink-0"
            >
              🏕️ Extract at Campfire (Keep 100%)
            </button>
          </div>
        )}

        {/* Quick Action Controls Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {onIdleClaimAfk && (
            <button
              type="button"
              disabled={busy}
              onClick={() => runAction(onIdleClaimAfk)}
              className="py-2.5 px-3 rounded-xl sp-btn-primary text-[11px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                Claim AFK Chest ({idle?.afkChest?.shards || 0}✦ · {formatDurationCompact(afkSeconds)})
              </span>
            </button>
          )}
          {onIdleTick && (
            <button
              type="button"
              disabled={busy}
              onClick={() => runAction(() => onIdleTick({ wavesCleared: 1, timerRunning: isStudying, triggerUltimate: true }))}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600/90 via-amber-500/90 to-rose-600/90 text-white border border-amber-300/60 text-[11px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>🌟 Loop Finisher / Advance</span>
            </button>
          )}
          {onStudyCast && activeQuizCard && (
            <button
              type="button"
              disabled={busy}
              onClick={() => setShowStudyQuiz((v) => !v)}
              className="py-2.5 px-3 rounded-xl sp-tab-active border border-sky-400/50 text-[11px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🎓 Tactical Quiz (+2 Cards & 4×)</span>
            </button>
          )}
        </div>

        {/* Inline University Quiz Overdrive Card */}
        {showStudyQuiz && activeQuizCard && onStudyCast && (
          <div className="p-3 rounded-2xl sp-inset border border-sky-400/40 space-y-2">
            <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-sky-300">
              <span>
                🎓 {activeQuizCard.subjectName} · {activeQuizCard.conceptTitle} — Answer correctly for +30m 4.0× Overdrive, +2 ★2 Cards & Gear!
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

        {/* Zero-Micromanagement Automation Bar */}
        {idle && onIdleConfig && (
          <div className="p-2.5 rounded-2xl sp-inset flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                runAction(() =>
                  onIdleConfig({ automation: { autoEquipBest: !idle.automation.autoEquipBest } })
                )
              }
              className={`px-2.5 py-1.5 rounded-xl border font-extrabold cursor-pointer transition ${
                idle.automation.autoEquipBest
                  ? 'sp-tab-active border-emerald-400/60 text-emerald-200'
                  : 'sp-badge text-slate-400'
              }`}
            >
              🤖 Auto-Equip Best: {idle.automation.autoEquipBest ? 'ON' : 'OFF'}
            </button>

            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 mr-1">♻️ Auto-Salvage:</span>
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

        {/* Latest Loot Drop Card */}
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
                    Loot Drop • {recentDrop.rarity} {recentDrop.autoEquipped ? '• ⚡ Auto-Equipped!' : ''}
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
                    Equip
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

        {/* Compact Adventure Log */}
        {recentLogs.length > 0 && (
          <div className="p-2.5 rounded-2xl sp-inset space-y-1 text-[11px] text-slate-300">
            {recentLogs.slice(0, 3).map((line, idx) => (
              <div key={idx} className={idx === 0 ? 'font-bold text-white' : 'text-slate-400'}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5 Idle RPG Management Tabs */}
      <div className="p-1 rounded-2xl sp-inset grid grid-cols-5 gap-1">
        {(
          [
            { key: 'squad', label: 'Squad & AI', icon: Swords },
            { key: 'guild', label: 'Guild & AFK', icon: Building2 },
            { key: 'ascension', label: 'Ascend', icon: Crown },
            { key: 'armory', label: 'Armory', icon: Backpack },
            { key: 'store', label: 'Store', icon: ShoppingBag },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          const active = subTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setSubTab(t.key)}
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

      {/* Tab 1: 4-Hero Squad Formation & AI Gambits */}
      {subTab === 'squad' && idle && (
        <div className="space-y-3">
          <div className="glass-card rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  ⚔️ 4-Hero Vanguard Squad Formation
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Front Row absorbs hits & shatters shields; Back Row gains +10% Crit Power. Tap Swap Row to reposition any hero.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full sp-badge text-[10px] font-mono-num font-bold shrink-0">
                Hero Lv.{heroStats.heroLevel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {idle.squadHeroes.map((h) => (
                <div
                  key={h.id}
                  className={`p-3 rounded-2xl border space-y-2 ${
                    h.row === 'front' ? 'sp-tab-active border-sky-400/45' : 'sp-inset border-white/15'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-9 h-9 rounded-xl sp-badge flex items-center justify-center text-lg shrink-0">
                        {h.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-white truncate">{h.name}</span>
                          <span className="px-1.5 py-0.5 rounded sp-badge text-[9px] font-extrabold uppercase">
                            {h.row === 'front' ? 'Front Row' : 'Back Row'}
                          </span>
                        </div>
                        <div className="text-[10px] text-sky-300 font-bold truncate">{h.role}</div>
                      </div>
                    </div>
                    {onIdleConfig && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => runAction(() => onIdleConfig({ swapHeroRow: h.id }))}
                        className="px-2 py-1 rounded-lg sp-badge text-[10px] font-bold hover:text-white cursor-pointer shrink-0"
                      >
                        Swap Row
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] font-mono-num text-slate-300">
                    ⚔️ {h.effectiveAtk} ATK • ❤️ {h.effectiveHp} HP
                  </div>
                  <div className="p-2 rounded-xl sp-inset text-[10px] text-slate-200">
                    <span className="font-extrabold text-amber-300">Auto-Skill [{h.skillName}]:</span> {h.skillDesc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Gambit Rules Configurator */}
          <div className="glass-card rounded-3xl p-4 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> Squad Auto-Skill AI Gambits
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
              <div className="p-3 rounded-2xl sp-inset space-y-1.5">
                <div className="font-extrabold text-white">🌟 Squad Finisher Timing</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onIdleConfig && runAction(() => onIdleConfig({ gambits: { ultPolicy: 'auto_ready' } }))}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold cursor-pointer ${
                      idle.gambits.ultPolicy === 'auto_ready' ? 'sp-btn-primary' : 'sp-badge text-slate-400'
                    }`}
                  >
                    Fire When Ready
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onIdleConfig && runAction(() => onIdleConfig({ gambits: { ultPolicy: 'boss_or_broken' } }))}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold cursor-pointer ${
                      idle.gambits.ultPolicy === 'boss_or_broken' ? 'sp-btn-primary' : 'sp-badge text-slate-400'
                    }`}
                  >
                    Boss / Broken Only
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-2xl sp-inset space-y-1.5">
                <div className="font-extrabold text-white">🎯 Auto-Target Priority</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onIdleConfig && runAction(() => onIdleConfig({ gambits: { focusTarget: 'shield_break' } }))}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold cursor-pointer ${
                      idle.gambits.focusTarget === 'shield_break' ? 'sp-btn-primary' : 'sp-badge text-slate-400'
                    }`}
                  >
                    🛡️ Shatter Shields
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onIdleConfig && runAction(() => onIdleConfig({ gambits: { focusTarget: 'highest_dps' } }))}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold cursor-pointer ${
                      idle.gambits.focusTarget === 'highest_dps' ? 'sp-btn-primary' : 'sp-badge text-slate-400'
                    }`}
                  >
                    ⚔️ All-Out DPS
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-2xl sp-inset space-y-1.5">
                <div className="font-extrabold text-white">🗺️ Stage Progression Rule</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onIdleConfig && runAction(() => onIdleConfig({ gambits: { stageProgression: 'auto_push' } }))}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold cursor-pointer ${
                      idle.gambits.stageProgression === 'auto_push' ? 'sp-btn-primary' : 'sp-badge text-slate-400'
                    }`}
                  >
                    Auto-Push Next Stage
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onIdleConfig && runAction(() => onIdleConfig({ gambits: { stageProgression: 'farm_stage' } }))}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold cursor-pointer ${
                      idle.gambits.stageProgression === 'farm_stage' ? 'sp-btn-primary' : 'sp-badge text-slate-400'
                    }`}
                  >
                    Farm Current Stage
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-2xl sp-inset space-y-1.5">
                <div className="font-extrabold text-white">✨ Seraphina Heal Threshold</div>
                <div className="grid grid-cols-3 gap-1">
                  {([25, 45, 70] as const).map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      disabled={busy}
                      onClick={() => onIdleConfig && runAction(() => onIdleConfig({ gambits: { healThreshold: pct } }))}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold font-mono-num cursor-pointer ${
                        idle.gambits.healThreshold === pct ? 'sp-btn-primary' : 'sp-badge text-slate-400'
                      }`}
                    >
                      &lt;{pct}% HP
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Idle Guild Professions & 12h Offline AFK Chest */}
      {subTab === 'guild' && idle && (
        <div className="space-y-3">
          {/* 12h AFK Loot Chest Card */}
          <div className="glass-card rounded-3xl p-4 space-y-2.5 border border-amber-400/40">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Gift className="w-4 h-4" /> 12-Hour Offline AFK Loot Chest
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Accumulates Shards, Focus Coins, Hero XP & scaled Gear Rolls 24/7 while you study, work, or sleep (cap 12h).
                </p>
              </div>
              {onIdleClaimAfk && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => runAction(onIdleClaimAfk)}
                  className="px-3.5 py-2 rounded-xl sp-btn-primary text-xs font-extrabold cursor-pointer shrink-0"
                >
                  🎁 Collect Chest
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
                <div className="text-[9px] text-slate-400">Shards</div>
              </div>
              <div className="p-2 rounded-xl sp-inset">
                <div className="font-extrabold text-amber-300">+{idle.afkChest.coins}🪙</div>
                <div className="text-[9px] text-slate-400">Coins</div>
              </div>
              <div className="p-2 rounded-xl sp-inset">
                <div className="font-extrabold text-emerald-300">+{idle.afkChest.xp} XP</div>
                <div className="text-[9px] text-slate-400">{Math.max(1, idle.afkChest.itemsRolled)} Gear</div>
              </div>
            </div>
          </div>

          {/* Upgradable 24/7 Guild Facilities */}
          <div className="glass-card rounded-3xl p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                🏛️ 24/7 Idle Guild Professions
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
                        Upgrade ✦{p.upgradeCost}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sanctuary Hero Training Upgrades */}
          <div className="glass-card rounded-3xl p-4 space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              🏋️ Squad Sanctuary Mastery Training
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(
                [
                  { key: 'atk', name: 'Might Mastery', effect: '+3 Squad Base ATK', icon: '⚔️' },
                  { key: 'vit', name: 'Iron Vitality', effect: '+20 Max HP & +2 DEF', icon: '❤️' },
                  { key: 'luck', name: 'Fortune Shrine', effect: '+4 LUCK (Mythic Odds)', icon: '🍀' },
                  { key: 'crit', name: 'Focus Precision', effect: '+2% Critical Strike', icon: '🎯' },
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

      {/* Tab 3: Celestial Ascension Rebirth & Mythic Forge Milestones */}
      {subTab === 'ascension' && idle && (
        <div className="space-y-3">
          {/* Ascension Rebirth Portal */}
          <div className="glass-card rounded-3xl p-4 space-y-3 border border-rose-500/50">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" /> Celestial Ascension & Rebirth (Ascension #{idle.ascensions})
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Reset Stage progress back to Stage 1-1 to awaken permanent{' '}
                  <strong className="text-amber-300">Celestial Embers (🔥)</strong> & +35% Multiplicative Squad Power! Keeps all Gear, Relics & Guild Levels.
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
                  {idle.canAscend ? `🔥 Ascend (+${idle.pendingEmbers} Embers)` : 'Need Stage 2 or 4 Waves'}
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
                        🔥 {rel.nextCost}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aethelgard Mythic Forge Milestones */}
          <div className="glass-card rounded-3xl p-4 space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-300">
              👑 Aethelgard Mythic Relic Milestones ({idle.mythicMilestones.filter((m) => m.claimed).length}/
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
                      <span className="text-[10px] font-extrabold text-emerald-300 shrink-0">✓ Forged</span>
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
                          {m.unlocked ? '👑 Forge Mythic' : 'In Progress'}
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

      {/* Tab 4: Armory, Gear Power Score & Class Specialization */}
      {subTab === 'armory' && (
        <div className="space-y-3">
          <div className="glass-card rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Equipped Squad Relics (Great-Success {greatForgeChance}% 🍀)
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
                        <div className="text-xs text-slate-400">Empty slot</div>
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
                <div className="text-[11px] font-extrabold text-white">🌟 Commander Mastery Specialization</div>
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
                <span className="text-xs font-extrabold text-slate-300">Backpack ({unequippedItems.length}/40)</span>
                {unequippedItems.some((i) => i.rarity === 'common') && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => runAction(() => onSalvageItem({ maxRarity: 'common' }))}
                    className="px-2.5 py-1 rounded-lg sp-badge text-[10px] font-bold hover:opacity-90 cursor-pointer"
                  >
                    ♻️ Salvage Commons
                  </button>
                )}
              </div>

              {unequippedItems.length === 0 ? (
                <div className="p-3 rounded-2xl sp-inset text-center text-xs text-slate-400">
                  Auto-Equip & Auto-Salvage keep your armory optimized while your 4-Hero Squad battles 24/7!
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
                          Equip
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
        </div>
      )}

      {/* Tab 5: Focus Coin Store */}
      {subTab === 'store' && (
        <StorePanel
          user={user}
          shop={shop}
          game={game}
          onBuyShopItem={onBuyShopItem}
          onRerollDailyShop={onRerollDailyShop}
          onEquipLoot={(id) => onEquipItem(id).then(() => undefined)}
          compact
        />
      )}
    </div>
  );
}
