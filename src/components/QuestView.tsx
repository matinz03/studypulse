import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Swords,
  Shield,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Hammer,
  Trash2,
  BookOpen,
  Backpack,
  TrendingUp,
  ShoppingBag,
  ScrollText,
  Compass,
  Flame,
  KeyRound,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  LogOut,
  X,
  Heart,
} from 'lucide-react';
import {
  EnemyIntent,
  FlashcardItem,
  GameActionResponse,
  GameItem,
  GameState,
  GameTurnEvent,
  GearSlot,
  ItemRarity,
  ShopBuyResponse,
  ShopState,
  User,
} from '../types';
import { PixelCanvas } from '../game/PixelCanvas';
import { StorePanel } from './StorePanel';
import { soundEngine } from '../utils/soundEngine';

interface QuestViewProps {
  user: User;
  game: GameState;
  shop: ShopState;
  onVillageMove: (dx: number, dy: number) => Promise<GameActionResponse>;
  onNpcTalk: (npcId: string, choiceId?: string) => Promise<GameActionResponse>;
  onNpcCraft: (craftKey: string, targetItemId?: number) => Promise<GameActionResponse>;
  onDungeonEnter: (floor?: number) => Promise<GameActionResponse>;
  onDungeonMove: (dx: number, dy: number) => Promise<GameActionResponse>;
  onDungeonSearch: () => Promise<GameActionResponse>;
  onDungeonTorch: () => Promise<GameActionResponse>;
  onDungeonExtract: () => Promise<GameActionResponse>;
  onDungeonPuzzle: (optionIndex: number) => Promise<GameActionResponse>;
  onCombatAction: (
    action: 'attack' | 'dash' | 'skill' | 'ally_skill' | 'finisher' | 'guard' | 'potion' | 'flee'
  ) => Promise<GameActionResponse>;
  onEventChoice: (choice: string) => Promise<GameActionResponse>;
  onEquipItem: (itemId: number) => Promise<GameActionResponse>;
  onUpgradeItem: (itemId: number) => Promise<GameActionResponse>;
  onSalvageItem: (payload: { itemId?: number; maxRarity?: string }) => Promise<GameActionResponse>;
  onUpgradeStat: (stat: 'atk' | 'vit' | 'luck' | 'crit') => Promise<GameActionResponse>;
  onSelectFloor: (floor: number) => Promise<GameActionResponse>;
  onSelectSpecialization?: (specKey: string) => Promise<GameActionResponse>;
  onManagePartyAlly?: (allyId: string) => Promise<GameActionResponse>;
  onAdvanceMythicStory?: (storyId: string, choiceId: string) => Promise<GameActionResponse>;
  onClaimHeroicDeed?: (deedId: string) => Promise<GameActionResponse>;
  onStartVanguardTrial?: () => Promise<GameActionResponse>;
  onStudyCast?: (payload: { cardId: number; selectedIndex?: number; grade?: number }) => Promise<GameActionResponse>;
  flashcards?: FlashcardItem[];
  onBuyShopItem: (itemKey: string) => Promise<ShopBuyResponse | void>;
  onRerollDailyShop: () => Promise<void>;
  onGoToFocus: () => void;
}

type QuestSubTab = 'party' | 'story' | 'gear' | 'upgrades' | 'store';

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
  { slot: 'companion', label: 'Pet', emptyIcon: '🦉' },
];

const INTENT_GUIDE: Record<EnemyIntent, { title: (v?: number) => string; advice: string; tone: string }> = {
  STRIKE: {
    title: (v) => `⚔️ Enemy Intent: Strike (${v || '?'} DMG)`,
    advice: 'Balanced turn — attack boldly or Ward to charge Focus.',
    tone: 'border-amber-500/40 bg-amber-500/10',
  },
  HEAVY: {
    title: (v) => `💥 CRUSHING BLOW (${v || '?'} DMG)!`,
    advice: 'Use 🛡️ Parry & Ward to negate 85%, STUN foe & Riposte!',
    tone: 'border-rose-500/60 bg-rose-500/15',
  },
  SHELL: {
    title: () => '🛡️ IRON SHELL + THORNS!',
    advice: 'Melee Strike reflects damage! Use ⚡ Focus Break (40%) to SHATTER!',
    tone: 'border-sky-500/60 bg-sky-500/15',
  },
  RITUAL: {
    title: () => '🩸 DARK RITUAL (+25% HP & +4 ATK)!',
    advice: 'Interrupt immediately with ⚡ Focus Break or lose momentum!',
    tone: 'border-purple-500/60 bg-purple-500/15',
  },
  HEX: {
    title: (v) => `☠️ VENOM HEX (${v || '?'} DMG + Poison)!`,
    advice: 'Use 🛡️ Parry & Ward to block Venom, or 🧪 Potion to cleanse.',
    tone: 'border-emerald-500/55 bg-emerald-500/12',
  },
  STUNNED: {
    title: () => '💫 ENEMY STUNNED!',
    advice: 'Open punish window — deal heavy damage safely!',
    tone: 'border-yellow-400/60 bg-yellow-400/15',
  },
};

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

export function QuestView({
  user,
  game,
  shop,
  onVillageMove,
  onNpcTalk,
  onNpcCraft,
  onDungeonEnter,
  onDungeonMove,
  onDungeonSearch,
  onDungeonTorch,
  onDungeonExtract,
  onDungeonPuzzle,
  onCombatAction,
  onEventChoice,
  onEquipItem,
  onUpgradeItem,
  onSalvageItem,
  onUpgradeStat,
  onSelectFloor,
  onSelectSpecialization,
  onManagePartyAlly,
  onAdvanceMythicStory,
  onClaimHeroicDeed,
  onStartVanguardTrial,
  onStudyCast,
  flashcards = [],
  onBuyShopItem,
  onRerollDailyShop,
  onGoToFocus,
}: QuestViewProps) {
  const [subTab, setSubTab] = useState<QuestSubTab>('party');
  const [busy, setBusy] = useState(false);
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null);
  const [showVillagePad, setShowVillagePad] = useState(false);
  const [lastEvents, setLastEvents] = useState<GameTurnEvent[]>([]);
  const [eventSeq, setEventSeq] = useState(0);
  const [recentDrop, setRecentDrop] = useState<GameItem | null>(null);
  const [sfxMuted, setSfxMuted] = useState(() => soundEngine.isSfxMuted());
  const [showStudyCast, setShowStudyCast] = useState(false);
  const [quizCardIdx, setQuizCardIdx] = useState(0);

  const quizCards = flashcards.filter((c) => c.options && c.options.length > 0);
  const activeQuizCard = quizCards.length > 0 ? quizCards[quizCardIdx % quizCards.length] : null;

  const { mode, profile, heroStats, biome, village, dungeon, story, encounter, items, equippedBySlot, recentLogs } = game;
  const hpPct = Math.round((heroStats.hp / Math.max(1, heroStats.maxHp)) * 100);
  const unequippedItems = items.filter((i) => !i.equipped);
  const greatForgeChance = Math.min(35, Math.round(6 + heroStats.luck * 0.45));
  const activeNpc = activeNpcId ? village.npcs.find((n) => n.id === activeNpcId) || null : null;
  const currentChap = story.chapters.find((c) => c.chapter === story.chapter) || story.chapters[story.chapters.length - 1];

  function playSfxForEvents(events: GameTurnEvent[] = [], dropped?: GameItem | null) {
    if (dropped) {
      soundEngine.playPixelLoot(dropped.rarity === 'mythic' ? 'legendary' : dropped.rarity);
      return;
    }
    for (const ev of events) {
      if (ev.kind === 'finisher') {
        soundEngine.playPixelCrit();
        return;
      }
      if (ev.kind === 'parry') {
        soundEngine.playPixelParry();
        return;
      }
      if (ev.kind === 'secret') {
        soundEngine.playPixelSecret();
        return;
      }
      if (ev.kind === 'trap' || ev.kind === 'defeat') {
        soundEngine.playPixelTrap();
        return;
      }
      if (ev.kind === 'crit') {
        soundEngine.playPixelCrit();
        return;
      }
      if (ev.kind === 'hit') {
        soundEngine.playPixelHit();
        return;
      }
      if (ev.kind === 'guard' || ev.kind === 'heal') {
        soundEngine.playPixelGuard();
        return;
      }
      if (ev.kind === 'step' && ev.text) {
        soundEngine.playPixelStep();
        return;
      }
    }
  }

  async function runAction(fn: () => Promise<GameActionResponse>) {
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
      }
      if (res.interactedNpcId) {
        setActiveNpcId(res.interactedNpcId);
      }
      if (res.atGate) {
        onDungeonEnter(profile.floor);
      }
      playSfxForEvents(res.events || [], res.droppedItem);
      return res;
    } finally {
      setBusy(false);
    }
  }

  // Keyboard Navigation (WASD / Arrows / E Search)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) {
        return;
      }
      if (busy || encounter) return;
      let dx = 0;
      let dy = 0;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dy = -1;
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dy = 1;
      else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dx = -1;
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dx = 1;
      else if ((e.key === 'e' || e.key === 'E') && mode === 'dungeon') {
        e.preventDefault();
        runAction(onDungeonSearch);
        return;
      } else {
        return;
      }
      e.preventDefault();
      if (mode === 'dungeon') runAction(() => onDungeonMove(dx, dy));
      else runAction(() => onVillageMove(dx, dy));
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  function handleCanvasTileClick(tx: number, ty: number) {
    if (busy || encounter) return;
    if (mode === 'dungeon' && dungeon) {
      const dx = tx - dungeon.playerX;
      const dy = ty - dungeon.playerY;
      if (dx === 0 && dy === 0) {
        if (dungeon.tiles[ty]?.[tx] === 'E' && (dungeon.satchel.shards > 0 || dungeon.bossDefeated)) {
          runAction(onDungeonExtract);
        } else {
          runAction(onDungeonSearch);
        }
        return;
      }
      const stepX = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) : 0;
      const stepY = Math.abs(dy) > Math.abs(dx) ? Math.sign(dy) : 0;
      runAction(() => onDungeonMove(stepX, stepY));
    } else {
      const npc = village.npcs.find((n) => n.x === tx && n.y === ty);
      if (npc) {
        setActiveNpcId(npc.id);
        return;
      }
      if (tx === 4 && ty === 0) {
        runAction(() => onDungeonEnter(profile.floor));
        return;
      }
      const dx = tx - village.x;
      const dy = ty - village.y;
      if (dx === 0 && dy === 0) return;
      const stepX = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) : 0;
      const stepY = Math.abs(dy) > Math.abs(dx) ? Math.sign(dy) : 0;
      runAction(() => onVillageMove(stepX, stepY));
    }
  }

  function toggleMute() {
    const next = !sfxMuted;
    soundEngine.setSfxMuted(next);
    setSfxMuted(next);
  }

  const canExtractNow =
    Boolean(dungeon) &&
    ((dungeon!.playerX === dungeon!.entranceX && dungeon!.playerY === dungeon!.entranceY) || dungeon!.bossDefeated);

  return (
    <div className="space-y-3.5">
      {/* Main Interactive Game Stage Card */}
      <div className="glass-card rounded-3xl p-3.5 space-y-3">
        {/* Top World / Biome Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-pixel text-[10px] text-white tracking-tight truncate">
                {mode === 'dungeon' ? `SPIRE F${dungeon?.floor || profile.floor}` : 'OAKHAVEN'}
              </span>
              <span className="px-2 py-0.5 rounded-full sp-badge text-[10px] font-bold shrink-0">
                Ch.{story.chapter}
              </span>
              <span className="px-2 py-0.5 rounded-full sp-badge text-[10px] font-bold shrink-0">
                Lv.{heroStats.heroLevel}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              {mode === 'dungeon' ? `${biome.name} • Fog of War` : `Town Hub • ${currentChap.title}`}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {mode === 'village' && (
              <div className="flex items-center rounded-xl sp-inset px-1 py-0.5 gap-0.5">
                <button
                  type="button"
                  disabled={busy || profile.floor <= 1}
                  onClick={() => runAction(() => onSelectFloor(profile.floor - 1))}
                  className="p-1 rounded-lg hover:opacity-80 disabled:opacity-35 cursor-pointer"
                  aria-label="Previous floor"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono-num text-[11px] font-extrabold px-1 text-white">
                  F{profile.floor}/{profile.bestFloor}
                </span>
                <button
                  type="button"
                  disabled={busy || profile.floor >= profile.bestFloor}
                  onClick={() => runAction(() => onSelectFloor(profile.floor + 1))}
                  className="p-1 rounded-lg hover:opacity-80 disabled:opacity-35 cursor-pointer"
                  aria-label="Next floor"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={toggleMute}
              aria-label={sfxMuted ? 'Unmute 8-bit SFX' : 'Mute 8-bit SFX'}
              className="p-1.5 rounded-xl sp-badge cursor-pointer"
            >
              {sfxMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Resource Strip */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-mono-num font-bold">
          <div className="flex flex-wrap items-center gap-1">
            <span className="px-2 py-0.5 rounded-full sp-badge" title="Study Energy (2 to enter Spire)">
              ⚡ {profile.energy}
            </span>
            <span className="px-2 py-0.5 rounded-full sp-badge" title="Dungeon Torches">
              🔥 {profile.torches}
            </span>
            <span className="px-2 py-0.5 rounded-full sp-badge" title="Moonpetal Herbs">
              🌿 {profile.herbs}
            </span>
            <span className="px-2 py-0.5 rounded-full sp-badge" title="Arcane Shards">
              ✦ {profile.shards}
            </span>
            <span className="px-2 py-0.5 rounded-full sp-badge" title="Healing Potions">
              🧪 {profile.potions}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full sp-badge" title="Focus Purity increases Intuition to sense traps and secret walls">
            👁️ Int {heroStats.intuition}
          </span>
        </div>

        {/* Interactive HTML5 Pixel Canvas (Village / Dungeon Fog / Tactical Combat) */}
        <PixelCanvas
          game={game}
          lastEvents={lastEvents}
          eventSeq={eventSeq}
          focusFever={heroStats.studyBonuses.focusFever}
          onTileClick={handleCanvasTileClick}
        />

        {/* Hero HP & Focus Bars */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-xl sp-inset space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-slate-300">HERO HP</span>
              <span className="font-mono-num text-white">
                {heroStats.hp}/{heroStats.maxHp}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${hpPct}%`, backgroundColor: hpPct > 35 ? '#22c55e' : '#ef4444' }}
              />
            </div>
          </div>

          <div className="p-2 rounded-xl sp-inset space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-slate-300">FOCUS BREAK</span>
              <span className="font-mono-num text-white">{profile.focusCharge}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${profile.focusCharge}%`, backgroundColor: '#38bdf8' }}
              />
            </div>
          </div>
        </div>

        {/* Core Hero Stats */}
        <div className="grid grid-cols-4 gap-1.5 text-center">
          <div className="p-1.5 rounded-xl sp-inset">
            <div className="font-mono-num text-xs font-extrabold text-white">{heroStats.atk}</div>
            <div className="text-[9px] text-slate-400">ATK</div>
          </div>
          <div className="p-1.5 rounded-xl sp-inset">
            <div className="font-mono-num text-xs font-extrabold text-white">{heroStats.def}</div>
            <div className="text-[9px] text-slate-400">DEF</div>
          </div>
          <div className="p-1.5 rounded-xl sp-inset">
            <div className="font-mono-num text-xs font-extrabold text-white">🍀 {heroStats.luck}</div>
            <div className="text-[9px] text-slate-400">LUCK</div>
          </div>
          <div className="p-1.5 rounded-xl sp-inset">
            <div className="font-mono-num text-xs font-extrabold text-white">{heroStats.critPct}%</div>
            <div className="text-[9px] text-slate-400">CRIT</div>
          </div>
        </div>

        {/* CONTEXT CONTROLS: Combat / Riddle / Chest / Shrine / Dungeon Nav / Village Hub */}
        {encounter?.type === 'combat' && encounter.enemy ? (
          <div className="space-y-2">
            {/* Explicit Enemy Intent Banner + Guard Shields & Tactical Stance Bar */}
            {(() => {
              const intentKey = (encounter.enemy.intent || 'STRIKE') as EnemyIntent;
              const guide = INTENT_GUIDE[intentKey] || INTENT_GUIDE.STRIKE;
              const shields = encounter.enemy.shields ?? 0;
              const maxShields = encounter.enemy.maxShields ?? (encounter.isBoss ? 3 : 2);
              const flankingTurns = encounter.heroStatuses?.flankingTurns || 0;
              const allyWardTurns = encounter.heroStatuses?.allyWardTurns || 0;
              const allyCooldown = encounter.heroStatuses?.allyCooldown || 0;
              const comboChain = encounter.heroStatuses?.comboChain || 0;
              const activeAlly = game.party?.activeAlly || null;
              const canExecuteFinisher =
                profile.focusCharge >= 75 ||
                shields === 0 ||
                encounter.enemy.hp <= Math.ceil(encounter.enemy.maxHp * 0.35);

              return (
                <>
                  <div className={`p-2.5 rounded-2xl border ${guide.tone}`}>
                    <div className="flex items-center justify-between gap-2 text-xs font-extrabold text-white">
                      <span>{guide.title(encounter.enemy.intentValue)}</span>
                      <span className="font-mono-num text-[10px]">
                        HP {encounter.enemy.hp}/{encounter.enemy.maxHp}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-200 mt-0.5">{guide.advice}</div>
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      {shields > 0 ? (
                        <span className="px-2 py-0.5 rounded-md bg-sky-500/20 border border-sky-400/50 text-sky-200 text-[10px] font-extrabold font-mono-num">
                          🛡️ Guard Shields: {'🛡️'.repeat(shields)} ({shields}/{maxShields})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/25 border border-rose-400/70 text-amber-200 text-[10px] font-extrabold animate-pulse">
                          💥 GUARD BROKEN! (+50% DMG & Finisher Ready!)
                        </span>
                      )}
                      {encounter.enemy.stunned && (
                        <span className="px-1.5 py-0.5 rounded sp-badge text-[9px] font-bold">💫 Stunned</span>
                      )}
                      {(encounter.enemy.vulnerableTurns || 0) > 0 && (
                        <span className="px-1.5 py-0.5 rounded sp-badge text-[9px] font-bold">🎯 Vulnerable (+50% DMG)</span>
                      )}
                      {(encounter.enemy.armorBrokenTurns || 0) > 0 && (
                        <span className="px-1.5 py-0.5 rounded sp-badge text-[9px] font-bold">💔 Armor Broken</span>
                      )}
                      {flankingTurns > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 text-[9px] font-extrabold">
                          ⚡ Flanking ({flankingTurns}t: Next Strike Guaranteed Crit + -1🛡️)
                        </span>
                      )}
                      {allyWardTurns > 0 && (
                        <span className="px-1.5 py-0.5 rounded sp-badge text-[9px] font-bold text-sky-300">
                          🛡️ Vanguard Ward (+35% DEF)
                        </span>
                      )}
                      {comboChain > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-200 text-[9px] font-extrabold font-mono-num">
                          🔥 Combo ×{comboChain}
                        </span>
                      )}
                      {(encounter.heroStatuses?.poisonTurns || 0) > 0 && (
                        <span className="px-1.5 py-0.5 rounded sp-badge text-[9px] font-bold text-emerald-400">
                          ☠️ Venom ({encounter.heroStatuses!.poisonTurns}t)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Primary Tactical Movements & Strikes Grid */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(() => onCombatAction('attack'))}
                      className="py-2.5 px-3 rounded-xl sp-btn-primary text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>{flankingTurns > 0 ? '⚡ Flank Backstab!' : 'Strike'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(() => onCombatAction('dash'))}
                      title="Tactical Sidestep: +45% Evasion, Feint Cut & enters Flanking Stance (next strike Guaranteed Crit & breaks 1 Shield)"
                      className="py-2.5 px-3 rounded-xl sp-tab-active border border-cyan-400/45 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>💨 Dash Flank (+45% Dodge)</span>
                    </button>
                    <button
                      type="button"
                      disabled={busy || profile.focusCharge < 40}
                      onClick={() => runAction(() => onCombatAction('skill'))}
                      className="py-2.5 px-3 rounded-xl sp-tab-active border text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-45"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Focus Break (40% · -2🛡️)
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(() => onCombatAction('guard'))}
                      className="py-2.5 px-3 rounded-xl sp-badge text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5" /> Parry & Ward
                    </button>
                  </div>

                  {/* Party Ally Assist & Ultimate Dual-Tech Finisher Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {activeAlly ? (
                      <button
                        type="button"
                        disabled={busy || allyCooldown > 0}
                        onClick={() => runAction(() => onCombatAction('ally_skill'))}
                        title={activeAlly.skillDesc}
                        className="py-2.5 px-3 rounded-xl sp-tab-active border border-sky-400/50 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-45"
                      >
                        <span>
                          {activeAlly.skillIcon} {activeAlly.name}: {activeAlly.skillName}
                          {allyCooldown > 0 ? ` (${allyCooldown}t)` : ''}
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setSubTab('party');
                          if (onManagePartyAlly) {
                            runAction(() => onManagePartyAlly('ally_kaelen'));
                          }
                        }}
                        className="py-2.5 px-3 rounded-xl sp-badge border border-dashed border-sky-400/50 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>🤝 Call Sir Kaelen (Free Party Recruit!)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={busy || !canExecuteFinisher}
                      onClick={() => runAction(() => onCombatAction('finisher'))}
                      title={
                        activeAlly
                          ? `${activeAlly.finisherName}: ${activeAlly.finisherDesc}`
                          : 'Unleash Ultimate Finisher (unlocked at 75% Focus Charge, when Enemy is BROKEN, or below 35% HP!)'
                      }
                      className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                        canExecuteFinisher
                          ? 'bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 text-white border border-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.35)]'
                          : 'sp-inset text-slate-400 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <span>
                        🌟 {activeAlly ? activeAlly.finisherName : 'Ultimate Finisher'}{' '}
                        {canExecuteFinisher ? '(READY!)' : '(75%⚡ / Break)'}
                      </span>
                    </button>
                  </div>
                </>
              );
            })()}

            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={busy || profile.potions < 1}
                onClick={() => runAction(() => onCombatAction('potion'))}
                className="px-3 py-2 rounded-xl sp-badge text-xs font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-45"
              >
                🧪 Potion ({profile.potions})
              </button>
              {onStudyCast && activeQuizCard && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setShowStudyCast((v) => !v)}
                  className="flex-1 py-2 rounded-xl sp-tab-active border text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1"
                >
                  📖 Study Cast (1.65x + -1🛡️)
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => runAction(() => onCombatAction('flee'))}
                className="px-3 py-2 rounded-xl sp-inset text-[11px] font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                🏃 Disengage
              </button>
            </div>
            {showStudyCast && activeQuizCard && onStudyCast && (
              <div className="p-3 rounded-2xl sp-inset border border-white/15 space-y-2">
                <div className="text-[10px] font-bold text-slate-300">
                  🎓 {activeQuizCard.subjectName} · {activeQuizCard.conceptTitle} (Answer correctly for 1.65x Arcane DMG!)
                </div>
                <div className="text-xs font-bold text-white">{activeQuizCard.front}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {activeQuizCard.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        setShowStudyCast(false);
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
          </div>
        ) : encounter?.type === 'riddle' && encounter.options ? (
          <div className="p-3 rounded-2xl sp-tab-active border space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-extrabold text-white">🗿 {encounter.title}</div>
              {onStudyCast && activeQuizCard && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setShowStudyCast((v) => !v)}
                  className="px-2 py-1 rounded-lg sp-btn-primary text-[10px] font-extrabold cursor-pointer"
                >
                  📖 Vault Quiz
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed">{encounter.prompt}</p>
            {encounter.hint && (
              <div className="text-[10px] font-bold text-sky-300">👁️ {encounter.hint}</div>
            )}
            {showStudyCast && activeQuizCard && onStudyCast && (
              <div className="p-2.5 rounded-xl sp-inset space-y-1.5 border border-white/15">
                <div className="text-[11px] font-bold text-white">{activeQuizCard.front}</div>
                <div className="grid grid-cols-1 gap-1">
                  {activeQuizCard.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        setShowStudyCast(false);
                        setQuizCardIdx((i) => i + 1);
                        await runAction(() => onStudyCast({ cardId: activeQuizCard.id, selectedIndex: idx }));
                      }}
                      className="text-left px-2.5 py-1.5 rounded-lg sp-badge text-[10px] font-bold cursor-pointer hover:opacity-90"
                    >
                      {String.fromCharCode(65 + idx)}. {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {encounter.options.map((opt, idx) => (
                <button
                  key={opt}
                  type="button"
                  disabled={busy}
                  onClick={() => runAction(() => onDungeonPuzzle(idx))}
                  className="py-2 px-2 rounded-xl sp-btn-primary text-[11px] font-extrabold cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : encounter?.type === 'chest' ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => runAction(() => onEventChoice('open_safe'))}
              className="py-2.5 px-3 rounded-xl sp-btn-primary text-xs font-extrabold cursor-pointer"
            >
              🧰 Open Safely
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => runAction(() => onEventChoice('lockpick'))}
              className="py-2.5 px-3 rounded-xl sp-tab-active border text-xs font-extrabold cursor-pointer"
            >
              🗝️ Lockpick ({encounter.lockpickChance || 50}% 🍀)
            </button>
          </div>
        ) : encounter?.type === 'shrine' ? (
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => runAction(() => onEventChoice('shrine_bless'))}
              className="py-2.5 px-2 rounded-xl sp-btn-primary text-[11px] font-extrabold cursor-pointer"
            >
              ✨ Pray (+Luck)
            </button>
            <button
              type="button"
              disabled={busy || user.coins < 20}
              onClick={() => runAction(() => onEventChoice('shrine_gamble'))}
              className="py-2.5 px-2 rounded-xl sp-tab-active border text-[11px] font-extrabold cursor-pointer disabled:opacity-45"
            >
              🎲 Gamble 20🪙
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => runAction(() => onEventChoice('camp_rest'))}
              className="py-2.5 px-2 rounded-xl sp-badge text-[11px] font-bold cursor-pointer"
            >
              🔥 Heal 55%
            </button>
          </div>
        ) : mode === 'dungeon' && dungeon ? (
          <div className="space-y-2.5">
            {/* Torch + Satchel Status Bar */}
            <div className="p-2.5 rounded-2xl sp-inset space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <span className={`font-bold flex items-center gap-1 ${dungeon.torch < 25 ? 'text-rose-400' : 'text-amber-400'}`}>
                  <Flame className="w-3.5 h-3.5" />
                  Torchlight: {dungeon.torch}% {dungeon.torch < 25 ? '(DIM: +25% Enemy DMG!)' : ''}
                </span>
                <span className="font-mono-num font-bold text-slate-300 flex items-center gap-1">
                  <KeyRound className="w-3 h-3" /> Key {dungeon.keys}/1
                </span>
              </div>
              <div className="text-[10px] font-mono-num text-slate-300 flex flex-wrap items-center justify-between gap-2">
                <span>
                  🎒 Satchel (Unbanked): +{dungeon.satchel.shards}✦ • +{dungeon.satchel.coins}🪙 • +{dungeon.satchel.herbs}🌿 •{' '}
                  {dungeon.satchel.items.length} Gear
                </span>
              </div>
              {dungeon.sensedHint && (
                <div className="text-[10px] font-bold text-sky-400">👁️ {dungeon.sensedHint}</div>
              )}
            </div>

            {/* Tactile D-Pad + Search / Torch / Extract */}
            {(() => {
              const isDirOpen = (dx: number, dy: number) => {
                const ch = dungeon.tiles[dungeon.playerY + dy]?.[dungeon.playerX + dx];
                return Boolean(ch && ch !== 'W' && ch !== 'S');
              };
              const dirCls = (dx: number, dy: number) =>
                isDirOpen(dx, dy)
                  ? 'sp-tab-active border border-emerald-400/50 text-white'
                  : 'sp-inset border border-white/10 opacity-35 text-slate-500';

              return (
                <div className="flex items-center justify-between gap-3">
                  <div className="grid grid-cols-3 gap-1 w-32 shrink-0">
                    <div />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(() => onDungeonMove(0, -1))}
                      aria-label="Move North"
                      className={`h-9 rounded-xl flex items-center justify-center cursor-pointer active:scale-95 transition ${dirCls(0, -1)}`}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <div />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(() => onDungeonMove(-1, 0))}
                      aria-label="Move West"
                      className={`h-9 rounded-xl flex items-center justify-center cursor-pointer active:scale-95 transition ${dirCls(-1, 0)}`}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(onDungeonSearch)}
                      aria-label="Search area"
                      title="Search for hidden traps & cracked secret walls (E)"
                      className="h-9 rounded-xl sp-tab-active border flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(() => onDungeonMove(1, 0))}
                      aria-label="Move East"
                      className={`h-9 rounded-xl flex items-center justify-center cursor-pointer active:scale-95 transition ${dirCls(1, 0)}`}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <div />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(() => onDungeonMove(0, 1))}
                      aria-label="Move South"
                      className={`h-9 rounded-xl flex items-center justify-center cursor-pointer active:scale-95 transition ${dirCls(0, 1)}`}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <div />
                  </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => runAction(onDungeonSearch)}
                  className="py-2 px-2.5 rounded-xl sp-tab-active border text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" /> Search Secret / Disarm (E)
                </button>
                <button
                  type="button"
                  disabled={busy || profile.torches < 1}
                  onClick={() => runAction(onDungeonTorch)}
                  className="py-2 px-2.5 rounded-xl sp-badge text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-45"
                >
                  <Flame className="w-3.5 h-3.5" /> Light Torch ({profile.torches})
                </button>
                <button
                  type="button"
                  disabled={busy || !canExtractNow}
                  onClick={() => runAction(onDungeonExtract)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer ${
                    canExtractNow ? 'sp-btn-primary' : 'sp-inset text-slate-500 opacity-55 cursor-not-allowed'
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{canExtractNow ? 'Extract Loot Safely' : 'Walk to Stairs 🚪 to Extract'}</span>
                </button>
              </div>
            </div>
              );
            })()}
          </div>
        ) : (
          /* Oakhaven Village Hub Controls */
          <div className="space-y-2.5">
            <div className="grid grid-cols-4 gap-1.5">
              {village.npcs.map((npc) => (
                <button
                  key={npc.id}
                  type="button"
                  onClick={() => setActiveNpcId((prev) => (prev === npc.id ? null : npc.id))}
                  className={`p-2 rounded-xl border text-center cursor-pointer transition relative ${
                    activeNpcId === npc.id ? 'sp-tab-active' : 'sp-badge hover:opacity-90'
                  }`}
                >
                  {npc.hasAction && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black flex items-center justify-center">
                      !
                    </span>
                  )}
                  <div className="text-[11px] font-extrabold truncate">{npc.name.split(' ')[0]}</div>
                  <div className="text-[9px] text-slate-400 truncate">{npc.rankLabel}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={busy || profile.energy < 2}
                type="button"
                onClick={() => runAction(() => onDungeonEnter(profile.floor))}
                className="flex-1 py-2.5 px-3 rounded-xl sp-btn-primary text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Compass className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {profile.energy < 2
                    ? 'Need 2 ⚡ Energy'
                    : `Spire Floor ${profile.floor} (-2 ⚡)`}
                </span>
              </motion.button>
              {onStartVanguardTrial && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => runAction(onStartVanguardTrial)}
                  title="Enter a 0-Energy tactical arena battle to test your Party Allies, Dash Flank, Shield Break & Dual-Tech Finishers!"
                  className="py-2.5 px-3 rounded-xl sp-tab-active border border-amber-400/50 text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer shrink-0"
                >
                  <Swords className="w-3.5 h-3.5 text-amber-300" />
                  <span>Trial Battle (0⚡)</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowVillagePad((v) => !v)}
                className="px-2.5 py-2.5 rounded-xl sp-badge text-xs font-bold cursor-pointer shrink-0"
                title="Toggle town walking D-Pad (or tap map / WASD)"
              >
                {showVillagePad ? 'Hide' : '🕹️'}
              </button>
            </div>

            {showVillagePad && (
              <div className="flex items-center justify-center gap-2 pt-1">
                <button type="button" onClick={() => runAction(() => onVillageMove(-1, 0))} className="px-3 py-1.5 rounded-lg sp-badge cursor-pointer">
                  ←
                </button>
                <button type="button" onClick={() => runAction(() => onVillageMove(0, -1))} className="px-3 py-1.5 rounded-lg sp-badge cursor-pointer">
                  ↑
                </button>
                <button type="button" onClick={() => runAction(() => onVillageMove(0, 1))} className="px-3 py-1.5 rounded-lg sp-badge cursor-pointer">
                  ↓
                </button>
                <button type="button" onClick={() => runAction(() => onVillageMove(1, 0))} className="px-3 py-1.5 rounded-lg sp-badge cursor-pointer">
                  →
                </button>
              </div>
            )}

            {/* NPC Dialogue & Service Panel */}
            <AnimatePresence>
              {activeNpc && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-2xl sp-tab-active border space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-white">{activeNpc.name}</span>
                        <span className="px-1.5 py-0.5 rounded sp-badge text-[9px] font-bold flex items-center gap-0.5">
                          <Heart className="w-2.5 h-2.5" /> {activeNpc.rankLabel} ({activeNpc.affinity})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {activeNpc.role} • {activeNpc.trustedPerk}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveNpcId(null)}
                      aria-label="Close NPC dialog"
                      className="p-1 rounded-lg sp-badge cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-200 leading-relaxed italic">“{activeNpc.dialogue.greeting}”</p>

                  <div className="space-y-1.5">
                    {activeNpc.dialogue.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={busy || opt.disabled}
                        onClick={() =>
                          runAction(() =>
                            opt.craftKey ? onNpcCraft(opt.craftKey, opt.targetItemId) : onNpcTalk(activeNpc.id, opt.id)
                          )
                        }
                        className={`w-full text-left p-2 rounded-xl border transition cursor-pointer disabled:opacity-45 ${
                          opt.style === 'primary'
                            ? 'sp-btn-primary'
                            : opt.style === 'tab'
                              ? 'sp-inset hover:border-white/30'
                              : 'sp-badge'
                        }`}
                      >
                        <div className="text-[11px] font-extrabold">{opt.label}</div>
                        <div className="text-[10px] opacity-80">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Latest Loot Drop Card */}
        <AnimatePresence>
          {recentDrop && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-2.5 rounded-2xl sp-tab-active border flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl">{recentDrop.icon}</span>
                <div className="min-w-0">
                  <div className="text-[10px] font-extrabold uppercase">
                    Loot Drop • {recentDrop.rarity} {recentDrop.id < 0 ? '(In Satchel — Extract to Bank)' : ''}
                  </div>
                  <div className="text-xs font-extrabold text-white truncate">{recentDrop.name}</div>
                  <div className="text-[10px] font-mono-num text-slate-300">{formatItemStats(recentDrop)}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {recentDrop.id > 0 && (
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

      {/* 5 RPG Command Sub-Tabs: Party & Mythic | Story & Deeds | Gear | Upgrades | Store */}
      <div className="p-1 rounded-2xl sp-inset grid grid-cols-5 gap-1">
        {(
          [
            { key: 'party', label: 'Party & Mythic', icon: Swords },
            { key: 'story', label: 'Story & Deeds', icon: ScrollText },
            { key: 'gear', label: 'Gear', icon: Backpack },
            { key: 'upgrades', label: 'Upgrades', icon: TrendingUp },
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

      {/* Sub-Tab 0: Vanguard Party Recruitment & 3-Act Mythic Side Stories */}
      {subTab === 'party' && (
        <div className="space-y-3">
          {/* Vanguard Party Squad Recruitment & Active Ally Selector */}
          <div className="glass-card rounded-3xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  🤝 Vanguard Party Squad & Dual-Tech Allies
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Recruited allies fight beside you on the canvas, grant passive auras, and unlock Ally Assists & Dual-Tech Ultimate Finishers!
                </p>
              </div>
              {onStartVanguardTrial && !encounter && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => runAction(onStartVanguardTrial)}
                  className="px-3 py-1.5 rounded-xl sp-btn-primary text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>⚔️ Vanguard Trial Arena (0⚡)</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(game.party?.allies || []).map((ally) => {
                const canAfford = ally.canRecruitFree || profile.shards >= ally.effectiveShardCost;
                return (
                  <div
                    key={ally.id}
                    className={`p-3 rounded-2xl border space-y-2 transition ${
                      ally.active
                        ? 'sp-tab-active border-sky-400/60 shadow-[0_0_16px_rgba(56,189,248,0.18)]'
                        : 'sp-inset border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-9 h-9 rounded-xl sp-badge flex items-center justify-center text-lg shrink-0">
                          {ally.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-white truncate">{ally.name}</span>
                            {ally.active && (
                              <span className="px-1.5 py-0.5 rounded bg-sky-500/25 border border-sky-400/50 text-sky-200 text-[9px] font-extrabold">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-sky-300 font-bold truncate">{ally.role}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={busy || ally.active || (!ally.recruited && !canAfford)}
                        onClick={() => onManagePartyAlly && runAction(() => onManagePartyAlly(ally.id))}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer shrink-0 ${
                          ally.active
                            ? 'sp-badge text-emerald-300 cursor-default'
                            : ally.recruited
                              ? 'sp-btn-primary'
                              : canAfford
                                ? 'sp-btn-primary'
                                : 'sp-inset text-slate-500 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {ally.active
                          ? '✓ In Vanguard'
                          : ally.recruited
                            ? 'Deploy Ally'
                            : ally.effectiveShardCost === 0
                              ? 'Recruit (Free)'
                              : `Recruit (${ally.effectiveShardCost}✦)`}
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-300 leading-relaxed">{ally.lore}</p>

                    <div className="p-2 rounded-xl sp-inset space-y-1 text-[10px]">
                      <div className="text-emerald-300 font-bold">✨ Aura: {ally.passiveLabel}</div>
                      <div className="text-slate-200">
                        <span className="font-extrabold text-sky-300">
                          {ally.skillIcon} Assist [{ally.skillName}]:
                        </span>{' '}
                        {ally.skillDesc}
                      </div>
                      <div className="text-amber-200">
                        <span className="font-extrabold text-amber-300">
                          🌟 Dual-Tech [{ally.finisherName}]:
                        </span>{' '}
                        {ally.finisherDesc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3-Act Branching Mythic Side Stories & Mythic Relics */}
          <div className="glass-card rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-300">
                  👑 Mythic Side Stories & Relics ({(story.mythicSideStories || []).filter((s) => s.completed).length}/
                  {(story.mythicSideStories || []).length} Forged)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Follow 3-Act heroic side stories and make narrative choices to forge guaranteed [MYTHIC] Relics with unique combat passives!
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {(story.mythicSideStories || []).map((ms) => (
                <div
                  key={ms.id}
                  className={`p-3.5 rounded-2xl border space-y-2.5 ${
                    ms.completed
                      ? 'border-rose-500/60 bg-rose-500/10'
                      : 'sp-inset border-white/15'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-9 h-9 rounded-xl sp-badge flex items-center justify-center text-lg shrink-0">
                        {ms.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-white">{ms.title}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-rose-500/20 border border-rose-400/50 text-rose-200">
                            {ms.completed ? '✓ Mythic Forged' : `Act ${ms.actIndex + 1} of ${ms.totalActs}`}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {ms.subtitle} • With {ms.npcName}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mythic Relic Reward Preview Banner */}
                  <div className="p-2.5 rounded-xl border border-rose-500/50 bg-rose-950/35 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg shrink-0">{ms.mythicReward.icon}</span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-extrabold text-rose-200 truncate">
                          [MYTHIC {ms.mythicReward.slot.toUpperCase()}] {ms.mythicReward.name}
                        </div>
                        <div className="text-[10px] font-mono-num text-amber-200">
                          +{ms.mythicReward.atk} ATK • +{ms.mythicReward.def} DEF • +{ms.mythicReward.hp} HP • +
                          {ms.mythicReward.luck} LUCK • +{ms.mythicReward.crit}% CRIT
                        </div>
                        <div className="text-[10px] text-slate-300 italic">{ms.mythicReward.passiveDesc}</div>
                      </div>
                    </div>
                  </div>

                  {/* Current Act Narrative & Interactive Choices */}
                  {ms.currentAct && !ms.completed ? (
                    <div className="p-2.5 rounded-xl sp-inset space-y-2 border border-white/10">
                      <div className="text-[11px] font-extrabold text-amber-300">{ms.currentAct.title}</div>
                      <p className="text-[11px] text-slate-200 leading-relaxed">{ms.currentAct.narrative}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {ms.currentAct.choices.map((ch) => (
                          <button
                            key={ch.id}
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              onAdvanceMythicStory && runAction(() => onAdvanceMythicStory(ms.id, ch.id))
                            }
                            className="text-left p-2.5 rounded-xl sp-btn-primary text-[11px] font-extrabold cursor-pointer transition hover:opacity-95"
                          >
                            <div>⚔️ {ch.label}</div>
                            <div className="text-[9px] opacity-80 font-mono-num mt-0.5">
                              Reward: +{ch.shards}✦ Shards • +{ch.xp} Hero XP
                              {ms.actIndex + 1 === ms.totalActs ? ' • 👑 Forges Mythic Relic!' : ''}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] font-bold text-emerald-300">
                      ✓ All 3 Acts completed — {ms.mythicReward.name} has been forged into your armory!
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 1: Story Chronicle, Heroic Deeds, Quests, NPCs & Lore */}
      {subTab === 'story' && (
        <div className="space-y-3">
          <div className="glass-card rounded-3xl p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                📖 Chronicle: Chapter {currentChap.chapter} — {currentChap.title}
              </h3>
              <span className="sp-badge px-2 py-0.5 rounded-full text-[10px] font-bold">
                {currentChap.bossDefeated ? 'Boss Defeated!' : `Floor ${currentChap.floorReq}`}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{currentChap.synopsis}</p>
            <div className="p-2.5 rounded-xl sp-inset text-[11px] font-bold text-white flex items-center justify-between gap-2">
              <span>🎯 {currentChap.objective}</span>
              <span className="font-mono-num text-[10px] text-slate-400">
                +{currentChap.rewards.coins}🪙 +{currentChap.rewards.shards}✦
              </span>
            </div>
          </div>

          {/* Heroic Deeds & Permanent Combat Feats Ledger */}
          {story.heroicDeeds && story.heroicDeeds.length > 0 && (
            <div className="glass-card rounded-3xl p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                  🏅 Heroic Deeds & Titles ({story.heroicDeeds.filter((d) => d.claimed).length}/{story.heroicDeeds.length})
                </h3>
                <span className="text-[10px] text-slate-400">Permanent Stat Perks + Heroic Titles</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {story.heroicDeeds.map((deed) => (
                  <div
                    key={deed.id}
                    className={`p-2.5 rounded-2xl border space-y-1.5 ${
                      deed.claimed
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : deed.completed
                          ? 'border-amber-400/70 bg-amber-500/15'
                          : 'sp-inset border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-base">{deed.icon}</span>
                        <span className="text-xs font-extrabold text-white truncate">{deed.title}</span>
                      </div>
                      <span className="font-mono-num text-[10px] font-extrabold sp-badge px-2 py-0.5 rounded-full shrink-0">
                        {deed.progress}/{deed.target}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-300 leading-snug">{deed.desc}</div>
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="text-[9px] font-bold text-amber-200">{deed.perkLabel}</span>
                      {deed.claimed ? (
                        <span className="text-[10px] font-extrabold text-emerald-300 shrink-0">✓ Claimed</span>
                      ) : (
                        <button
                          type="button"
                          disabled={busy || !deed.completed}
                          onClick={() => onClaimHeroicDeed && runAction(() => onClaimHeroicDeed(deed.id))}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer shrink-0 ${
                            deed.completed
                              ? 'sp-btn-primary'
                              : 'sp-badge opacity-45 cursor-not-allowed'
                          }`}
                        >
                          {deed.completed ? `Claim +${deed.reward.shards}✦` : 'In Progress'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card rounded-3xl p-4 space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              📌 Active Quests & Bounties ({story.quests.filter((q) => !q.claimed).length})
            </h3>
            {story.quests.filter((q) => !q.claimed).length === 0 ? (
              <div className="p-3 rounded-2xl sp-inset text-xs text-slate-400">
                Talk to Bram, Lyra, or Pip in Oakhaven to pick up Side Quests and Notice Board Bounties!
              </div>
            ) : (
              <div className="space-y-1.5">
                {story.quests
                  .filter((q) => !q.claimed)
                  .map((q) => (
                    <div key={q.id} className="p-2.5 rounded-2xl sp-inset flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{q.title}</div>
                        <div className="text-[10px] text-slate-400">{q.desc}</div>
                      </div>
                      <span className="font-mono-num text-[11px] font-extrabold sp-badge px-2 py-0.5 rounded-full shrink-0">
                        {q.progress}/{q.target}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="glass-card rounded-3xl p-4 space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              📜 Lore Codex ({story.loreCodex.filter((l) => l.unlocked).length}/{story.loreCodex.length})
            </h3>
            <div className="space-y-1.5 max-h-56 overflow-y-auto glass-scroll pr-1">
              {story.loreCodex.map((l) => (
                <div key={l.id} className={`p-2.5 rounded-2xl sp-inset ${l.unlocked ? '' : 'opacity-45'}`}>
                  <div className="text-xs font-extrabold text-white">{l.unlocked ? l.title : '🔒 Undiscovered Tablet'}</div>
                  <div className="text-[10px] text-slate-300 mt-0.5 leading-relaxed">
                    {l.unlocked ? l.text : 'Explore the Pixel Spire and solve Runic Riddles to uncover this chronicle.'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Gear & Bag */}
      {subTab === 'gear' && (
        <div className="glass-card rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              Equipped Gear (Forge Great-Success {greatForgeChance}% 🍀)
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
                          {label} • {eq.rarity}
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
                Delve into the Pixel Spire or study 20m+ blocks to extract new gear!
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
                          {item.slot.toUpperCase()} • {formatItemStats(item)}
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
      )}

      {/* Sub-Tab 3: Study Coupling, Intuition, Luck Odds & Sanctuary Upgrades */}
      {subTab === 'upgrades' && (
        <div className="space-y-3">
          <div className="glass-card rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Powered by Your Studying
              </h3>
              <button
                type="button"
                onClick={onGoToFocus}
                className="px-2.5 py-1 rounded-full sp-btn-primary text-[10px] font-extrabold cursor-pointer"
              >
                Study to Recharge ⚡
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-2xl sp-inset">
                <div className="text-slate-400">Scholar Lv.{heroStats.studyBonuses.scholarLevel}</div>
                <div className="font-mono-num font-extrabold text-white mt-0.5">
                  +{heroStats.studyBonuses.studyAtk} ATK • +{heroStats.studyBonuses.studyHp} HP
                </div>
              </div>
              <div className="p-2.5 rounded-2xl sp-inset">
                <div className="text-slate-400">Streak ({heroStats.studyBonuses.streakDays}d)</div>
                <div className="font-mono-num font-extrabold text-white mt-0.5">
                  +{heroStats.studyBonuses.streakLuck} LUCK Fortune
                </div>
              </div>
              <div className="p-2.5 rounded-2xl sp-inset">
                <div className="text-slate-400">Purity ({heroStats.studyBonuses.avgPurity}%) Intuition</div>
                <div className="font-mono-num font-extrabold text-white mt-0.5">
                  👁️ {heroStats.intuition} Sense • +{heroStats.studyBonuses.purityCrit}% Crit
                </div>
              </div>
              <div className="p-2.5 rounded-2xl sp-inset">
                <div className="text-slate-400">Daily Goal Lantern</div>
                <div className="font-mono-num font-extrabold text-white mt-0.5">
                  {heroStats.studyBonuses.focusFever
                    ? '🔥 Fever (+20% ATK, +1 Vision)'
                    : `${heroStats.studyBonuses.todayMins}/${heroStats.studyBonuses.dailyGoalMins}m to Fever`}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl sp-inset space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-extrabold text-white">🍀 Live Drop Odds ({heroStats.luck} Total Luck)</span>
                <span className="font-mono-num text-[10px] text-slate-400">
                  Vision: {heroStats.visionRadius} tiles
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 text-center font-mono-num text-[10px]">
                {(
                  [
                    ['common', 'Common'],
                    ['uncommon', 'Uncom'],
                    ['rare', 'Rare'],
                    ['epic', 'Epic'],
                    ['legendary', 'Legend'],
                  ] as const
                ).map(([k, lbl]) => (
                  <div key={k} className={`p-1.5 rounded-lg border ${RARITY_CLASS[k]}`}>
                    <div className="font-extrabold">{heroStats.dropOdds[k]}%</div>
                    <div className="text-[9px] opacity-80">{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Class Specialization & Companion Evolution */}
            {(heroStats.specializations || heroStats.companionEvolution) && (
              <div className="p-3 rounded-2xl sp-inset space-y-2.5 border border-white/10">
                {heroStats.companionEvolution && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-300">🦉 Companion Evolution</span>
                    <span className="px-2 py-0.5 rounded-full sp-badge font-bold text-white">
                      {heroStats.companionEvolution.label}
                    </span>
                  </div>
                )}
                {heroStats.specializations && heroStats.specializations.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-extrabold text-white">🌟 Class Mastery Specialization</div>
                    <div className="grid grid-cols-2 gap-2">
                      {heroStats.specializations.map((sp) => {
                        const active = heroStats.specialization === sp.key;
                        return (
                          <button
                            key={sp.key}
                            type="button"
                            disabled={busy || !onSelectSpecialization}
                            onClick={() => onSelectSpecialization && runAction(() => onSelectSpecialization(sp.key))}
                            className={`text-left p-2.5 rounded-xl border transition cursor-pointer ${
                              active ? 'sp-tab-active' : 'sp-badge hover:opacity-90'
                            }`}
                          >
                            <div className="text-[11px] font-extrabold text-white">
                              {active ? '✓ ' : ''}{sp.name}
                            </div>
                            <div className="text-[9px] text-slate-300 leading-snug mt-0.5">{sp.perk}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="glass-card rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Sanctuary Permanent Upgrades
              </h3>
              <span className="sp-badge px-2.5 py-0.5 rounded-full text-[11px] font-mono-num font-bold">
                ✦ {profile.shards} Shards
              </span>
            </div>

            <div className="space-y-2">
              {(
                [
                  { key: 'atk', name: 'Might Mastery', effect: '+3 Hero ATK per rank', icon: '⚔️' },
                  { key: 'vit', name: 'Iron Vitality', effect: '+20 Max HP & +2 DEF per rank', icon: '❤️' },
                  { key: 'luck', name: 'Fortune Shrine (Luck)', effect: '+4 LUCK per rank (boosts loot & Intuition)', icon: '🍀' },
                  { key: 'crit', name: 'Focus Precision', effect: '+2% Critical Strike Chance per rank', icon: '🎯' },
                ] as const
              ).map((u) => {
                const rank = profile.upgrades[u.key];
                const cost = profile.upgradeCosts[u.key];
                const maxed = rank >= 20;
                const canUpgrade = !maxed && profile.shards >= cost;
                return (
                  <div key={u.key} className="flex items-center justify-between gap-2.5 p-3 rounded-2xl sp-inset">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-9 h-9 rounded-xl sp-badge flex items-center justify-center text-lg shrink-0">
                        {u.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-white">
                          {u.name} <span className="font-mono-num text-[10px] opacity-75">Rank {rank}/20</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{u.effect}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={busy || !canUpgrade}
                      onClick={() => runAction(() => onUpgradeStat(u.key))}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-extrabold font-mono-num cursor-pointer ${
                        canUpgrade ? 'sp-btn-primary' : 'sp-inset text-slate-500 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {maxed ? 'MAX' : `✦ ${cost}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: In-Quest Store */}
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
