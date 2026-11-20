import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Clock, RefreshCw, ShoppingBag, Sparkles, Flame, Zap, Check } from 'lucide-react';
import { GameItem, GameState, ItemRarity, ShopBuyResponse, ShopItem, ShopState, ShopTier, User } from '../types';

interface StorePanelProps {
  user: User;
  shop: ShopState;
  game?: GameState;
  onBuyShopItem: (itemKey: string) => Promise<ShopBuyResponse | void>;
  onRerollDailyShop: () => Promise<void>;
  onEquipLoot?: (itemId: number) => Promise<void>;
  compact?: boolean;
}

const RARITY_STYLES: Record<ItemRarity, { badge: string; bar: string; label: string }> = {
  common: { badge: 'rarity-common', bar: '#94a3b8', label: 'Common' },
  uncommon: { badge: 'rarity-uncommon', bar: '#10b981', label: 'Uncommon' },
  rare: { badge: 'rarity-rare', bar: '#0ea5e9', label: 'Rare' },
  epic: { badge: 'rarity-epic', bar: '#a855f7', label: 'Epic' },
  legendary: { badge: 'rarity-legendary', bar: '#f59e0b', label: 'Legendary' },
};

function formatResetCountdown(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function StorePanel({
  user,
  shop,
  game,
  onBuyShopItem,
  onRerollDailyShop,
  onEquipLoot,
  compact = false,
}: StorePanelProps) {
  const [tier, setTier] = useState<ShopTier>('daily');
  const [buyingKey, setBuyingKey] = useState<string | null>(null);
  const [rerolling, setRerolling] = useState(false);
  const [lastDrop, setLastDrop] = useState<GameItem | null>(null);
  const [equippingDrop, setEquippingDrop] = useState(false);
  const [elapsedSinceFetch, setElapsedSinceFetch] = useState(0);

  useEffect(() => {
    setElapsedSinceFetch(0);
    const id = window.setInterval(() => {
      setElapsedSinceFetch((t) => t + 30);
    }, 30_000);
    return () => window.clearInterval(id);
  }, [shop.periodKeys.daily, shop.periodKeys.weekly, shop.periodKeys.monthly]);

  const tiers: { key: ShopTier; label: string; count: number }[] = [
    { key: 'daily', label: 'Daily', count: shop.sections.daily.length },
    { key: 'weekly', label: 'Weekly', count: shop.sections.weekly.length },
    { key: 'monthly', label: 'Monthly', count: shop.sections.monthly.length },
    { key: 'permanent', label: 'Permanent', count: shop.sections.permanent.length },
  ];

  const items: ShopItem[] = shop.sections[tier] || [];
  const resetSeconds =
    tier === 'daily'
      ? shop.resetsInSec.daily - elapsedSinceFetch
      : tier === 'weekly'
        ? shop.resetsInSec.weekly - elapsedSinceFetch
        : tier === 'monthly'
          ? shop.resetsInSec.monthly - elapsedSinceFetch
          : 0;

  async function handleBuy(item: ShopItem) {
    setBuyingKey(item.key);
    try {
      const res = await onBuyShopItem(item.key);
      if (res && res.droppedItem) {
        setLastDrop(res.droppedItem);
      }
    } finally {
      setBuyingKey(null);
    }
  }

  async function handleReroll() {
    setRerolling(true);
    try {
      await onRerollDailyShop();
    } finally {
      setRerolling(false);
    }
  }

  async function handleEquipDropped(itemId: number) {
    if (!onEquipLoot) return;
    setEquippingDrop(true);
    try {
      await onEquipLoot(itemId);
      setLastDrop(null);
    } finally {
      setEquippingDrop(false);
    }
  }

  return (
    <div className={compact ? 'glass-card rounded-3xl p-3.5 space-y-3' : 'glass-card rounded-3xl p-4 space-y-3'}>
      {/* Header + Currency Balances */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <ShoppingBag className="w-3.5 h-3.5" />
          Focus Coin Shop
        </h3>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="sp-badge px-2 py-0.5 rounded-full text-[10px] font-bold">
            🧊 {user.streakFreezes}
          </span>
          {game && (
            <>
              <span className="sp-badge px-2 py-0.5 rounded-full text-[10px] font-mono-num font-bold flex items-center gap-0.5">
                <Zap className="w-3 h-3" /> {game.profile.energy}
              </span>
              <span className="sp-badge px-2 py-0.5 rounded-full text-[10px] font-mono-num font-bold">
                ✦ {game.profile.shards}
              </span>
            </>
          )}
          <span className="sp-badge px-2 py-0.5 rounded-full text-[10px] font-mono-num font-extrabold flex items-center gap-1">
            <Coins className="w-3 h-3" /> {user.coins}
          </span>
        </div>
      </div>

      {/* 4-Section Segmented Toggle (Daily / Weekly / Monthly / Permanent) */}
      <div
        role="tablist"
        aria-label="Shop Rotation Tiers"
        className="p-1 rounded-xl sp-inset grid grid-cols-4 gap-1"
      >
        {tiers.map((t) => {
          const active = tier === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTier(t.key)}
              className={`py-1.5 px-0.5 rounded-lg text-[10.5px] font-extrabold cursor-pointer transition flex items-center justify-center gap-0.5 min-w-0 ${
                active ? 'sp-tab-active' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="truncate">{t.label}</span>
              <span className="hidden sm:inline font-mono-num text-[9px] opacity-70">({t.count})</span>
            </button>
          );
        })}
      </div>

      {/* Period Reset Timer + Daily Reroll Button */}
      {tier !== 'permanent' ? (
        <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl sp-inset text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Clock className="w-3.5 h-3.5 opacity-80" />
            <span>
              Resets in <strong className="font-mono-num text-white">{formatResetCountdown(resetSeconds)}</strong>
            </span>
          </div>
          {tier === 'daily' && (
            <button
              type="button"
              disabled={rerolling || (shop.nextRerollCost > 0 && user.coins < shop.nextRerollCost)}
              onClick={handleReroll}
              className="px-2.5 py-1 rounded-lg sp-badge hover:opacity-90 text-[10px] font-extrabold flex items-center gap-1 cursor-pointer disabled:opacity-45"
            >
              <RefreshCw className={`w-3 h-3 ${rerolling ? 'animate-spin' : ''}`} />
              <span>
                {shop.nextRerollCost === 0
                  ? 'Reroll Stock (Free)'
                  : `Reroll (${shop.nextRerollCost} 🪙)`}
              </span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl sp-inset text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 opacity-80" />
            Permanent Heroes, Spirits, Titles & Adventure Supplies
          </span>
        </div>
      )}

      {/* Loot Drop Reveal Banner inside Store */}
      <AnimatePresence>
        {lastDrop && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="p-3 rounded-2xl sp-tab-active border flex items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-10 h-10 rounded-xl sp-inset flex items-center justify-center text-xl shrink-0">
                {lastDrop.icon}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">
                    Unboxed {lastDrop.rarity}
                  </span>
                </div>
                <div className="text-xs font-extrabold text-white truncate">{lastDrop.name}</div>
                <div className="text-[10px] font-mono-num text-slate-300">
                  {[
                    lastDrop.atk ? `+${lastDrop.atk} ATK` : '',
                    lastDrop.def ? `+${lastDrop.def} DEF` : '',
                    lastDrop.hp ? `+${lastDrop.hp} HP` : '',
                    lastDrop.luck ? `+${lastDrop.luck} LUCK` : '',
                    lastDrop.crit ? `+${lastDrop.crit}% CRIT` : '',
                  ]
                    .filter(Boolean)
                    .join(' • ')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {onEquipLoot && (
                <button
                  type="button"
                  disabled={equippingDrop}
                  onClick={() => handleEquipDropped(lastDrop.id)}
                  className="px-2.5 py-1.5 rounded-lg sp-btn-primary text-[10px] font-extrabold cursor-pointer"
                >
                  Equip
                </button>
              )}
              <button
                type="button"
                onClick={() => setLastDrop(null)}
                className="px-2 py-1.5 rounded-lg sp-badge text-[10px] font-bold cursor-pointer"
              >
                OK
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Cards */}
      <div className={compact ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : 'space-y-2'}>
        {items.map((item) => {
          const rar = RARITY_STYLES[item.rarity] || RARITY_STYLES.common;
          const soldOut = item.remaining !== null && item.remaining <= 0;
          const canAfford = user.coins >= item.price;
          const actionDisabled =
            buyingKey === item.key || item.equipped || soldOut || (!item.unlocked && !canAfford);

          return (
            <div
              key={item.key}
              className="flex items-center justify-between gap-2 p-2.5 rounded-2xl sp-inset relative overflow-hidden"
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full"
                style={{ backgroundColor: rar.bar }}
              />
              <div className="flex items-center gap-2 min-w-0 pl-1.5">
                <span className="w-8 h-8 rounded-xl sp-badge flex items-center justify-center text-base shrink-0">
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-xs font-bold text-white truncate">{item.name}</span>
                    <span className={`px-1.5 py-0.5 rounded-md border text-[8.5px] font-bold uppercase ${rar.badge}`}>
                      {rar.label}
                    </span>
                    {item.effectBadge && !compact && (
                      <span className="px-1.5 py-0.5 rounded-md sp-badge text-[9px] font-bold">
                        {item.effectBadge}
                      </span>
                    )}
                  </div>
                  <div className={`text-[10px] text-slate-400 ${compact ? 'line-clamp-1' : 'line-clamp-2'} mt-0.5`}>
                    {item.desc}
                  </div>
                  {item.maxPerPeriod !== null && (
                    <div className="text-[9px] font-mono-num text-slate-500 mt-0.5">
                      Stock: {item.remaining}/{item.maxPerPeriod} remaining
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                disabled={actionDisabled}
                onClick={() => handleBuy(item)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-extrabold cursor-pointer transition border ${
                  item.equipped
                    ? 'sp-badge opacity-75 cursor-default'
                    : soldOut
                      ? 'sp-inset text-slate-500 opacity-50 cursor-not-allowed'
                      : item.unlocked
                        ? 'sp-tab-active'
                        : canAfford
                          ? 'sp-btn-primary'
                          : 'sp-inset text-slate-500 opacity-50 cursor-not-allowed'
                }`}
              >
                {buyingKey === item.key ? (
                  '...'
                ) : item.equipped ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" /> Equipped
                  </span>
                ) : soldOut ? (
                  'Sold Out'
                ) : item.unlocked ? (
                  'Equip'
                ) : (
                  <span className="flex items-center gap-1 font-mono-num">
                    {item.origPrice && item.origPrice > item.price && (
                      <span className="line-through opacity-55 text-[9px]">{item.origPrice}</span>
                    )}
                    <span>🪙 {item.price}</span>
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
