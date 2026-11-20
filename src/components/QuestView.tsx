import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Swords,
  Shield,
  Zap,
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
  Crown,
} from 'lucide-react';
import {
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
  onExplore: () => Promise<GameActionResponse>;
  onCombatAction: (action: 'attack' | 'skill' | 'guard' | 'potion' | 'flee') => Promise<GameActionResponse>;
  onEventChoice: (choice: string) => Promise<GameActionResponse>;
  onEquipItem: (itemId: number) => Promise<GameActionResponse>;
  onUpgradeItem: (itemId: number) => Promise<GameActionResponse>;
  onSalvageItem: (payload: { itemId?: number; maxRarity?: string }) => Promise<GameActionResponse>;
  onUpgradeStat: (stat: 'atk' | 'vit' | 'luck' | 'crit') => Promise<GameActionResponse>;
  onCampRest: () => Promise<GameActionResponse>;
  onSelectFloor: (floor: number) => Promise<GameActionResponse>;
  onBuyShopItem: (itemKey: string) => Promise<ShopBuyResponse | void>;
  onRerollDailyShop: () => Promise<void>;
  onGoToFocus: () => void;
}

type QuestSubTab = 'gear' | 'upgrades' | 'store';

const RARITY_CLASS: Record<ItemRarity, string> = {
  common: 'rarity-common',
  uncommon: 'rarity-uncommon',
  rare: 'rarity-rare',
  epic: 'rarity-epic',
  legendary: 'rarity-legendary',
};

const SLOT_LABELS: { slot: GearSlot; label: string; emptyIcon: string }[] = [
  { slot: 'weapon', label: 'Weapon', emptyIcon: '🗡️' },
  { slot: 'armor', label: 'Armor', emptyIcon: '🛡️' },
  { slot: 'charm', label: 'Charm', emptyIcon: '🍀' },
  { slot: 'companion', label: 'Pet', emptyIcon: '🦉' },
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

export function QuestView({
  user,
  game,
  shop,
  onExplore,
  onCombatAction,
  onEventChoice,
  onEquipItem,
  onUpgradeItem,
  onSalvageItem,
  onUpgradeStat,
  onCampRest,
  onSelectFloor,
  onBuyShopItem,
  onRerollDailyShop,
  onGoToFocus,
}: QuestViewProps) {
  const [subTab, setSubTab] = useState<QuestSubTab>('gear');
  const [busy, setBusy] = useState(false);
  const [lastEvents, setLastEvents] = useState<GameTurnEvent[]>([]);
  const [eventSeq, setEventSeq] = useState(0);
  const [recentDrop, setRecentDrop] = useState<GameItem | null>(null);
  const [sfxMuted, setSfxMuted] = useState(() => soundEngine.isSfxMuted());

  const { profile, heroStats, biome, encounter, items, equippedBySlot, recentLogs } = game;
  const hpPct = Math.round((heroStats.hp / Math.max(1, heroStats.maxHp)) * 100);
  const unequippedItems = items.filter((i) => !i.equipped);
  const greatForgeChance = Math.min(35, Math.round(6 + heroStats.luck * 0.45));

  function playSfxForEvents(events: GameTurnEvent[] = [], dropped?: GameItem | null) {
    if (dropped) {
      soundEngine.playPixelLoot(dropped.rarity);
      return;
    }
    for (const ev of events) {
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
      if (ev.kind === 'defeat') {
        soundEngine.playPixelDefeat();
        return;
      }
      if (ev.kind === 'explore') {
        soundEngine.playPixelStep();
        return;
      }
    }
  }

  async function runTurnAction(fn: () => Promise<GameActionResponse>) {
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
      playSfxForEvents(res.events || [], res.droppedItem);
    } finally {
      setBusy(false);
    }
  }

  function toggleMute() {
    const next = !sfxMuted;
    soundEngine.setSfxMuted(next);
    setSfxMuted(next);
  }

  return (
    <div className="space-y-3.5">
      {/* Main Pixel Spire Dungeon Card */}
      <div className="glass-card rounded-3xl p-3.5 space-y-3">
        {/* Floor Selector, Biome & SFX Toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-pixel text-[10px] text-white tracking-tight">PIXEL SPIRE</span>
              <span className="px-2 py-0.5 rounded-full sp-badge text-[10px] font-bold">
                Hero Lv.{heroStats.heroLevel}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              {biome.name} • {heroStats.className}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center rounded-xl sp-inset px-1 py-0.5 gap-0.5">
              <button
                type="button"
                disabled={busy || Boolean(encounter) || profile.floor <= 1}
                onClick={() => runTurnAction(() => onSelectFloor(profile.floor - 1))}
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
                disabled={busy || Boolean(encounter) || profile.floor >= profile.bestFloor}
                onClick={() => runTurnAction(() => onSelectFloor(profile.floor + 1))}
                className="p-1 rounded-lg hover:opacity-80 disabled:opacity-35 cursor-pointer"
                aria-label="Next floor"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
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

        {/* Room Pips (1..5) + Resource Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((r) => {
              const current = r === profile.roomIndex;
              const cleared = r < profile.roomIndex;
              return (
                <div
                  key={r}
                  className={`w-6 h-5 rounded-md text-[10px] font-mono-num font-bold flex items-center justify-center border ${
                    current
                      ? 'sp-tab-active'
                      : cleared
                        ? 'sp-badge opacity-70'
                        : 'sp-inset text-slate-500 opacity-60'
                  }`}
                  title={r === 5 ? 'Floor Boss Room' : `Room ${r}`}
                >
                  {r === 5 ? <Crown className="w-3 h-3" /> : r}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono-num font-bold">
            <span className="px-2 py-0.5 rounded-full sp-badge flex items-center gap-1" title="Adventure Energy (earned by studying)">
              <Zap className="w-3 h-3" /> {profile.energy}
            </span>
            <span className="px-2 py-0.5 rounded-full sp-badge" title="Arcane Shards">
              ✦ {profile.shards}
            </span>
            <span className="px-2 py-0.5 rounded-full sp-badge" title="Healing Potions">
              🧪 {profile.potions}
            </span>
          </div>
        </div>

        {/* HTML5 Retro Pixel Canvas */}
        <PixelCanvas
          game={game}
          lastEvents={lastEvents}
          eventSeq={eventSeq}
          focusFever={heroStats.studyBonuses.focusFever}
        />

        {/* Hero HP + Focus Charge Bars */}
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
              <span className="text-slate-300">FOCUS BURST</span>
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

        {/* Core Hero Stat Strip */}
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
            <div className="font-mono-num text-xs font-extrabold text-white flex items-center justify-center gap-0.5">
              🍀 {heroStats.luck}
            </div>
            <div className="text-[9px] text-slate-400">LUCK</div>
          </div>
          <div className="p-1.5 rounded-xl sp-inset">
            <div className="font-mono-num text-xs font-extrabold text-white">{heroStats.critPct}%</div>
            <div className="text-[9px] text-slate-400">CRIT</div>
          </div>
        </div>

        {profile.luckBuffCharges > 0 && (
          <div className="px-2.5 py-1.5 rounded-xl sp-tab-active text-[11px] font-bold flex items-center justify-between gap-2">
            <span className="truncate">🍀 Luck Blessing (+{profile.luckBuffAmount} LUCK)</span>
            <span className="font-mono-num shrink-0">{profile.luckBuffCharges}x left</span>
          </div>
        )}

        {/* Interactive Encounter Controls */}
        {!encounter ? (
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={busy || profile.energy < 1}
              type="button"
              onClick={() => runTurnAction(onExplore)}
              className="flex-1 py-3 px-3 rounded-xl sp-btn-primary text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Swords className="w-4 h-4" />
              <span>
                {profile.energy < 1
                  ? 'Need Energy (Study to Recharge!)'
                  : profile.roomIndex >= 5
                    ? `Challenge Floor ${profile.floor} Boss (-1 ⚡)`
                    : `Explore Room ${profile.roomIndex}/5 (-1 ⚡)`}
              </span>
            </motion.button>
            {heroStats.hp < heroStats.maxHp && (
              <button
                type="button"
                disabled={busy}
                onClick={() => runTurnAction(onCampRest)}
                className="px-3 py-3 rounded-xl sp-badge text-xs font-bold cursor-pointer hover:opacity-90"
                title="Heal hero to full at camp"
              >
                ⛺ Rest
              </button>
            )}
          </div>
        ) : encounter.type === 'combat' && encounter.enemy ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl sp-inset text-xs">
              <span className="font-extrabold text-white truncate">{encounter.enemy.name}</span>
              <span className="font-mono-num text-[11px] font-bold text-slate-300 shrink-0">
                HP {encounter.enemy.hp}/{encounter.enemy.maxHp} • ATK {encounter.enemy.atk}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => runTurnAction(() => onCombatAction('attack'))}
                className="py-2.5 px-3 rounded-xl sp-btn-primary text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Swords className="w-3.5 h-3.5" /> Strike
              </button>
              <button
                type="button"
                disabled={busy || profile.focusCharge < 50}
                onClick={() => runTurnAction(() => onCombatAction('skill'))}
                className="py-2.5 px-3 rounded-xl sp-tab-active border text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-45"
              >
                <Sparkles className="w-3.5 h-3.5" /> Focus Burst (50%)
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => runTurnAction(() => onCombatAction('guard'))}
                className="py-2.5 px-3 rounded-xl sp-badge text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" /> Guard & Counter
              </button>
              <button
                type="button"
                disabled={busy || profile.potions < 1}
                onClick={() => runTurnAction(() => onCombatAction('potion'))}
                className="py-2.5 px-3 rounded-xl sp-badge text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-45"
              >
                🧪 Potion ({profile.potions})
              </button>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => runTurnAction(() => onCombatAction('flee'))}
              className="w-full py-1.5 rounded-xl sp-inset text-[11px] font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              🏃 Retreat to Camp
            </button>
          </div>
        ) : encounter.type === 'chest' ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => runTurnAction(() => onEventChoice('open_safe'))}
              className="py-2.5 px-3 rounded-xl sp-btn-primary text-xs font-extrabold cursor-pointer"
            >
              🧰 Open Safely
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => runTurnAction(() => onEventChoice('lockpick'))}
              className="py-2.5 px-3 rounded-xl sp-tab-active border text-xs font-extrabold cursor-pointer"
            >
              🗝️ Lockpick ({encounter.lockpickChance || 50}% 🍀)
            </button>
          </div>
        ) : encounter.type === 'shrine' ? (
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => runTurnAction(() => onEventChoice('shrine_bless'))}
              className="py-2.5 px-2 rounded-xl sp-btn-primary text-[11px] font-extrabold cursor-pointer"
            >
              ✨ Pray (+Luck)
            </button>
            <button
              type="button"
              disabled={busy || user.coins < 20}
              onClick={() => runTurnAction(() => onEventChoice('shrine_gamble'))}
              className="py-2.5 px-2 rounded-xl sp-tab-active border text-[11px] font-extrabold cursor-pointer disabled:opacity-45"
            >
              🎲 Gamble 20🪙 ({encounter.gambleChance || 45}%)
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => runTurnAction(() => onEventChoice('camp_rest'))}
              className="py-2.5 px-2 rounded-xl sp-badge text-[11px] font-bold cursor-pointer"
            >
              🔥 Heal 55%
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              disabled={busy || user.coins < 20}
              onClick={() => runTurnAction(() => onEventChoice('merchant_buy_potion'))}
              className="py-2.5 px-2 rounded-xl sp-badge text-[11px] font-bold cursor-pointer disabled:opacity-45"
            >
              🧪 2 Potions (20🪙)
            </button>
            <button
              type="button"
              disabled={busy || user.coins < 55}
              onClick={() => runTurnAction(() => onEventChoice('merchant_mystery_roll'))}
              className="py-2.5 px-2 rounded-xl sp-tab-active border text-[11px] font-extrabold cursor-pointer disabled:opacity-45"
            >
              📦 Relic (55🪙)
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => runTurnAction(() => onEventChoice('merchant_leave'))}
              className="py-2.5 px-2 rounded-xl sp-btn-primary text-[11px] font-extrabold cursor-pointer"
            >
              👋 Continue
            </button>
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
                    Loot Drop • {recentDrop.rarity}
                  </div>
                  <div className="text-xs font-extrabold text-white truncate">{recentDrop.name}</div>
                  <div className="text-[10px] font-mono-num text-slate-300">{formatItemStats(recentDrop)}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    runTurnAction(() => onEquipItem(recentDrop.id));
                    setRecentDrop(null);
                  }}
                  className="px-2.5 py-1.5 rounded-lg sp-btn-primary text-[10px] font-extrabold cursor-pointer"
                >
                  Equip
                </button>
                <button
                  type="button"
                  onClick={() => setRecentDrop(null)}
                  className="px-2 py-1.5 rounded-lg sp-badge text-[10px] font-bold cursor-pointer"
                >
                  Bag
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compact Combat & Adventure Log */}
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

      {/* Study Power Link Card + Live Luck & Drop Odds */}
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
            <div className="text-slate-400">Avg Purity ({heroStats.studyBonuses.avgPurity}%)</div>
            <div className="font-mono-num font-extrabold text-white mt-0.5">
              +{heroStats.studyBonuses.purityCrit}% Crit • +{heroStats.studyBonuses.purityDodge}% Dodge
            </div>
          </div>
          <div className="p-2.5 rounded-2xl sp-inset">
            <div className="text-slate-400">Daily Goal Aura</div>
            <div className="font-mono-num font-extrabold text-white mt-0.5">
              {heroStats.studyBonuses.focusFever
                ? '🔥 Focus Fever (+20% ATK, +10 LUCK)'
                : `${heroStats.studyBonuses.todayMins}/${heroStats.studyBonuses.dailyGoalMins}m to Fever`}
            </div>
          </div>
        </div>

        {/* Live Luck Odds Breakdown */}
        <div className="p-2.5 rounded-2xl sp-inset space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-extrabold text-white">🍀 Live Drop Odds ({heroStats.luck} Total Luck)</span>
            <span className="font-mono-num text-[10px] text-slate-400">
              {heroStats.luckBreakdown.base} base + {heroStats.luckBreakdown.gear} gear +{' '}
              {heroStats.luckBreakdown.upgrades + heroStats.luckBreakdown.streak + heroStats.luckBreakdown.fever + heroStats.luckBreakdown.buff} bonus
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
      </div>

      {/* Sub-Tabs for Gear & Bag / Upgrades / Store */}
      <div className="p-1 rounded-2xl sp-inset grid grid-cols-3 gap-1">
        {(
          [
            { key: 'gear', label: 'Gear & Bag', icon: Backpack },
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
              className={`py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                active ? 'sp-tab-active' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Tab 1: Gear & Bag */}
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
                      onClick={() => runTurnAction(() => onUpgradeItem(eq.id))}
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

          {/* Backpack */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-slate-300">
                Backpack ({unequippedItems.length}/40)
              </span>
              {unequippedItems.some((i) => i.rarity === 'common') && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => runTurnAction(() => onSalvageItem({ maxRarity: 'common' }))}
                  className="px-2.5 py-1 rounded-lg sp-badge text-[10px] font-bold hover:opacity-90 cursor-pointer"
                >
                  ♻️ Salvage All Commons
                </button>
              )}
            </div>

            {unequippedItems.length === 0 ? (
              <div className="p-3 rounded-2xl sp-inset text-center text-xs text-slate-400">
                Explore dungeon rooms or complete 20m+ study blocks to loot new gear!
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
                        onClick={() => runTurnAction(() => onEquipItem(item.id))}
                        className="px-2.5 py-1 rounded-lg sp-tab-active border text-[10px] font-extrabold cursor-pointer"
                      >
                        Equip
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => runTurnAction(() => onSalvageItem({ itemId: item.id }))}
                        className="px-2 py-1 rounded-lg sp-badge text-[10px] font-bold cursor-pointer hover:text-rose-400"
                        title={`Salvage for +${item.salvageValue} Arcane Shards`}
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

      {/* Sub-Tab 2: Sanctuary Permanent Stat Upgrades */}
      {subTab === 'upgrades' && (
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
                {
                  key: 'atk',
                  name: 'Might Mastery',
                  effect: '+3 Hero ATK per rank',
                  icon: '⚔️',
                },
                {
                  key: 'vit',
                  name: 'Iron Vitality',
                  effect: '+20 Max HP & +2 DEF per rank',
                  icon: '❤️',
                },
                {
                  key: 'luck',
                  name: 'Fortune Shrine (Luck)',
                  effect: '+4 LUCK per rank (boosts drop rarity & chest rolls!)',
                  icon: '🍀',
                },
                {
                  key: 'crit',
                  name: 'Focus Precision',
                  effect: '+2% Critical Strike Chance per rank',
                  icon: '🎯',
                },
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
                    onClick={() => runTurnAction(() => onUpgradeStat(u.key))}
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
      )}

      {/* Sub-Tab 3: In-Dungeon Store */}
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
