import { useEffect, useRef } from 'react';
import { EnemyIntent, GameState, GameTurnEvent, LoopHandCard } from '../types';
import {
  BIOME_PALETTES,
  COMPANION_SPRITES,
  HERO_SPRITES,
  MINI_ICONS,
  MONSTER_SPRITES,
  NPC_SPRITES,
  PROP_SPRITES,
  drawPixelMatrix,
} from './pixelSprites';

interface PixelCanvasProps {
  game: GameState;
  lastEvents: GameTurnEvent[];
  eventSeq: number;
  focusFever: boolean;
  isStudying?: boolean;
  selectedCard?: LoopHandCard | null;
  onAutoWaveClear?: (opts: { isBossWave: boolean; triggerUltimate: boolean; outcome?: 'clear' | 'wipe' }) => void;
  onTileClick?: (tx: number, ty: number) => void;
  onPlaceLoopTile?: (gx: number, gy: number) => void;
}

interface FloatingText {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  size: number;
}

const RARITY_COLORS: Record<string, string> = {
  common: '#cbd5e1',
  uncommon: '#34d399',
  rare: '#38bdf8',
  epic: '#c084fc',
  legendary: '#fbbf24',
  mythic: '#f43f5e',
};

const INTENT_VISUAL: Record<EnemyIntent, { bg: string; fg: string; label: (v?: number) => string }> = {
  STRIKE: { bg: '#ea580c', fg: '#ffffff', label: (v) => `ATK ${v || ''}` },
  HEAVY: { bg: '#dc2626', fg: '#fef08a', label: (v) => `!! CRUSH ${v || ''}` },
  SHELL: { bg: '#0284c7', fg: '#ffffff', label: () => 'IRON SHELL' },
  RITUAL: { bg: '#7e22ce', fg: '#fde68a', label: () => 'RITUAL +HP' },
  HEX: { bg: '#15803d', fg: '#fef08a', label: (v) => `HEX ${v || ''}` },
  STUNNED: { bg: '#ca8a04', fg: '#09090b', label: () => 'STUNNED!' },
};

export function PixelCanvas({
  game,
  lastEvents,
  eventSeq,
  focusFever,
  isStudying = false,
  selectedCard = null,
  onAutoWaveClear,
  onTileClick,
  onPlaceLoopTile,
}: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoverCellRef = useRef<{ x: number; y: number } | null>(null);
  const stateRef = useRef({ game, focusFever, isStudying, selectedCard, onAutoWaveClear });
  stateRef.current = { game, focusFever, isStudying, selectedCard, onAutoWaveClear };

  const idleSimRef = useRef({
    waveKey: '',
    phase: 'traveling' as 'traveling' | 'clash' | 'wipe_pause',
    roadProgress: 0, // Continuous 0..12 position around Loop Road
    targetStopIdx: 1,
    marchFrames: 45,
    wipePauseFrames: 0,
    phoenixUsedThisLoop: false,
    heroHp: 220,
    heroMaxHp: 220,
    heroShield: 25,
    heroAtb: 30,
    heroLunge: 0,
    heroHurtFlash: 0,
    enemy: { key: 'slime', name: 'Astral Ooze', hp: 110, maxHp: 110, shields: 2, maxShields: 2, atb: 20, lunge: 0, shake: 0, isBoss: false },
    lightningArc: null as null | { x1: number; y1: number; x2: number; y2: number; life: number },
    heroes: [
      { id: 'solarius', hp: 180, maxHp: 180, shield: 0, atb: 20, lunge: 0, hurtFlash: 0, turnCount: 0 },
      { id: 'kaelis', hp: 140, maxHp: 140, shield: 0, atb: 45, lunge: 0, hurtFlash: 0, turnCount: 0 },
      { id: 'aurelia', hp: 130, maxHp: 130, shield: 0, atb: 10, lunge: 0, hurtFlash: 0, turnCount: 0 },
      { id: 'seraphina', hp: 150, maxHp: 150, shield: 0, atb: 30, lunge: 0, hurtFlash: 0, turnCount: 0 },
    ],
    enemy1: { hp: 120, maxHp: 120, shields: 2, maxShields: 2, atb: 15, lunge: 0, shake: 0, vulnerable: 0, intent: 'CLEAVE' },
    enemy2: { hp: 80, maxHp: 80, shields: 1, maxShields: 1, atb: 35, lunge: 0, shake: 0, vulnerable: 0, intent: 'VOLLEY' },
    ultCharge: 30,
    scrollX: 0,
    bossTimerFrames: 1500,
    ultBeamLife: 0,
    pendingClearDispatched: false,
  });

  const fxRef = useRef({
    heroLunge: 0,
    allyLunge: 0,
    heroFlash: 0,
    enemyShake: 0,
    guardPulse: 0,
    finisherLife: 0,
    lootBeamLife: 0,
    lootBeamColor: '#fbbf24',
    floaters: [] as FloatingText[],
    particles: [] as Particle[],
  });

  useEffect(() => {
    if (!eventSeq || !lastEvents.length) return;
    const fx = fxRef.current;
    const isDungeonMap = stateRef.current.game.mode === 'dungeon' && !stateRef.current.game.encounter;
    const dng = stateRef.current.game.dungeon;

    for (const ev of lastEvents) {
      let targetX = ev.target === 'enemy' ? 222 : 84;
      let targetY = 92;

      if (isDungeonMap && dng) {
        targetX = Math.floor(17 + dng.playerX * 26 + 13);
        targetY = Math.floor(24 + dng.playerY * 20);
      }

      if (ev.kind === 'step' && !ev.text) continue;

      if (ev.kind === 'finisher') {
        fx.heroLunge = 26;
        fx.allyLunge = 22;
        fx.enemyShake = 28;
        fx.finisherLife = 36;
        fx.floaters.push({
          x: 150,
          y: 62,
          vy: -0.45,
          text: ev.text || `ULTIMATE -${ev.value}!`,
          color: '#fde047',
          life: 62,
        });
        for (let i = 0; i < 28; i++) {
          fx.particles.push({
            x: 215 + (Math.random() * 24 - 12),
            y: 112 + (Math.random() * 20 - 10),
            vx: (Math.random() - 0.5) * 4.8,
            vy: (Math.random() - 0.7) * 4.2,
            color: i % 3 === 0 ? '#fde047' : i % 3 === 1 ? '#f43f5e' : '#38bdf8',
            life: 32 + Math.random() * 14,
            size: 3,
          });
        }
      } else if (ev.kind === 'hit' || ev.kind === 'crit') {
        fx.heroLunge = 14;
        fx.enemyShake = ev.kind === 'crit' ? 18 : 10;
        fx.floaters.push({
          x: targetX + (Math.random() * 14 - 7),
          y: targetY - 12,
          vy: -0.55,
          text: ev.text || `-${ev.value}`,
          color: ev.kind === 'crit' ? '#fde047' : '#ffffff',
          life: 44,
        });
        for (let i = 0; i < (ev.kind === 'crit' ? 14 : 8); i++) {
          fx.particles.push({
            x: 222,
            y: 112,
            vx: (Math.random() - 0.5) * 3.4,
            vy: (Math.random() - 0.8) * 2.8,
            color: ev.kind === 'crit' ? '#facc15' : '#f87171',
            life: 24 + Math.random() * 10,
            size: ev.kind === 'crit' ? 3 : 2,
          });
        }
      } else if (ev.kind === 'parry') {
        fx.guardPulse = 32;
        fx.allyLunge = 14;
        fx.enemyShake = 14;
        fx.floaters.push({ x: targetX, y: targetY - 16, vy: -0.5, text: ev.text || 'PARRY!', color: '#fde047', life: 52 });
      } else if (ev.kind === 'secret') {
        fx.floaters.push({ x: Math.min(240, targetX), y: Math.max(40, targetY - 8), vy: -0.45, text: ev.text || 'SECRET!', color: '#38bdf8', life: 54 });
      } else if (ev.kind === 'enemy_hit' || ev.kind === 'trap') {
        fx.heroFlash = 14;
        fx.floaters.push({
          x: Math.min(250, Math.max(24, targetX - 16)),
          y: Math.max(36, targetY - 8),
          vy: -0.5,
          text: ev.text || `-${ev.value || ''}`,
          color: '#fb7185',
          life: 44,
        });
      } else if (ev.kind === 'guard') {
        fx.guardPulse = 26;
        fx.floaters.push({ x: 84, y: 78, vy: -0.45, text: ev.text || 'WARD', color: '#38bdf8', life: 44 });
      } else if (ev.kind === 'heal' || ev.kind === 'dodge') {
        if (ev.kind === 'dodge') fx.heroLunge = 10;
        fx.floaters.push({
          x: Math.min(245, Math.max(24, targetX - 12)),
          y: Math.max(38, targetY - 8),
          vy: -0.45,
          text: ev.text || '+HP',
          color: '#4ade80',
          life: 48,
        });
      } else if (ev.kind === 'loot' && ev.text) {
        fx.lootBeamLife = 55;
        const rarMatch = String(ev.text).toLowerCase();
        const foundKey = Object.keys(RARITY_COLORS).find((k) => rarMatch.includes(k));
        fx.lootBeamColor = foundKey ? RARITY_COLORS[foundKey] : '#fbbf24';
        fx.floaters.push({ x: Math.min(235, Math.max(24, targetX - 14)), y: Math.max(36, targetY - 12), vy: -0.42, text: ev.text, color: fx.lootBeamColor, life: 54 });
      }
    }
  }, [eventSeq, lastEvents]);

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 320;
    const py = ((e.clientY - rect.top) / rect.height) * 208;

    const g = stateRef.current.game;
    if (g.encounter) return;
    if (g.mode === 'dungeon' && g.dungeon && onTileClick) {
      const tx = Math.floor((px - 17) / 26);
      const ty = Math.floor((py - 24) / 20);
      if (tx >= 0 && tx < 11 && ty >= 0 && ty < 9) onTileClick(tx, ty);
    } else if (g.idle?.loop && onPlaceLoopTile) {
      const gx = Math.floor((px - 10) / 30);
      const gy = Math.floor((py - 24) / 34);
      if (gx >= 0 && gx < 7 && gy >= 0 && gy < 5) {
        fxRef.current.particles.push(
          ...Array.from({ length: 10 }, () => ({
            x: 10 + gx * 30 + 15,
            y: 24 + gy * 34 + 17,
            vx: (Math.random() - 0.5) * 3.2,
            vy: (Math.random() - 0.6) * 3.0,
            color: '#fde047',
            life: 24,
            size: 2,
          }))
        );
        onPlaceLoopTile(gx, gy);
      }
    } else if (g.mode === 'village' && onTileClick) {
      const tx = Math.floor((px - 16) / 32);
      const ty = Math.floor((py - 22) / 26);
      if (tx >= 0 && tx < 9 && ty >= 0 && ty < 7) onTileClick(tx, ty);
    }
  }

  function handleCanvasMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 320;
    const py = ((e.clientY - rect.top) / rect.height) * 208;
    const gx = Math.floor((px - 10) / 30);
    const gy = Math.floor((py - 24) / 34);
    if (gx >= 0 && gx < 7 && gy >= 0 && gy < 5) {
      hoverCellRef.current = { x: gx, y: gy };
    } else {
      hoverCellRef.current = null;
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let frameCount = 0;

    function drawTorch(tx: number, ty: number, frame: number, glowColor: string) {
      ctx!.fillStyle = '#78350f';
      ctx!.fillRect(tx, ty + 4, 4, 12);
      ctx!.fillStyle = frame === 0 ? '#f97316' : '#fbbf24';
      ctx!.fillRect(tx - 1, ty, 6, 5);
      ctx!.fillStyle = '#fef08a';
      ctx!.fillRect(tx + 1, ty + (frame === 0 ? -2 : 0), 2, 3);
      ctx!.fillStyle = `${glowColor}26`;
      ctx!.fillRect(tx - 9, ty - 8, 22, 22);
    }

    function drawFloatersAndParticles() {
      const fx = fxRef.current;
      for (let i = fx.particles.length - 1; i >= 0; i--) {
        const p = fx.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.14;
        p.life--;
        ctx!.fillStyle = p.color;
        ctx!.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        if (p.life <= 0) fx.particles.splice(i, 1);
      }

      ctx!.font = 'bold 9px monospace';
      for (let i = fx.floaters.length - 1; i >= 0; i--) {
        const f = fx.floaters[i];
        f.y += f.vy;
        f.life--;
        ctx!.fillStyle = '#09090b';
        ctx!.fillText(f.text, Math.floor(f.x) + 1, Math.floor(f.y) + 1);
        ctx!.fillStyle = f.color;
        ctx!.fillText(f.text, Math.floor(f.x), Math.floor(f.y));
        if (f.life <= 0) fx.floaters.splice(i, 1);
      }
    }

    function renderVillage(g: GameState, animFrame: number, frameCountNum: number) {
      const v = g.village;
      const upgrades = new Set(v.upgrades || []);
      const lanternsLit = upgrades.has('lanterns');
      const hasBelltower = upgrades.has('library_roof');
      const hasBeacon = upgrades.has('astral_beacon');
      const hasGoldGate = upgrades.has('golden_gate');
      const hasDawn = upgrades.has('spire_crown');

      ctx!.fillStyle = hasDawn ? '#15241e' : '#0f1a15';
      ctx!.fillRect(0, 0, 320, 208);

      // Top Village Header Bar
      ctx!.fillStyle = '#09090b';
      ctx!.fillRect(0, 0, 320, 20);
      ctx!.fillStyle = '#fafafa';
      ctx!.font = 'bold 8px monospace';
      ctx!.fillText(`OAKHAVEN HUB • CHAPTER ${g.story.chapter}`, 10, 13);
      ctx!.fillStyle = lanternsLit ? '#fbbf24' : '#94a3b8';
      ctx!.fillText(hasDawn ? 'DAWN RESTORED' : lanternsLit ? 'LANTERNS LIT' : 'MISTY DUSK', 236, 13);

      const offX = 16;
      const offY = 22;
      const tw = 32;
      const th = 26;

      for (let y = 0; y < v.height; y++) {
        for (let x = 0; x < v.width; x++) {
          const ch = v.map[y][x];
          const px = offX + x * tw;
          const py = offY + y * th;

          // Base ground
          if (ch === '.') {
            ctx!.fillStyle = (x + y) % 2 === 0 ? '#2b3340' : '#242b36';
            ctx!.fillRect(px, py, tw, th);
            ctx!.fillStyle = '#1b2029';
            ctx!.fillRect(px, py + th - 2, tw, 2);
          } else if (ch === '#') {
            ctx!.fillStyle = '#163022';
            ctx!.fillRect(px, py, tw, th);
            // Crisp Pine Tree
            ctx!.fillStyle = '#064e3b';
            ctx!.fillRect(px + 8, py + 4, 16, 14);
            ctx!.fillStyle = '#059669';
            ctx!.fillRect(px + 11, py + 2, 10, 8);
            ctx!.fillStyle = '#78350f';
            ctx!.fillRect(px + 14, py + 18, 4, 6);
          } else if (ch === 'B') {
            ctx!.fillStyle = '#3f2e26';
            ctx!.fillRect(px, py, tw, th);
            ctx!.fillStyle = hasBelltower ? '#b91c1c' : '#574238';
            ctx!.fillRect(px + 1, py + 1, tw - 2, 10);
            ctx!.fillStyle = '#fbbf24';
            ctx!.fillRect(px + 12, py + 14, 8, 7);
          } else if (ch === 'G') {
            // North Spire Gate
            ctx!.fillStyle = '#18181b';
            ctx!.fillRect(px, py, tw, th);
            ctx!.fillStyle = hasGoldGate ? '#f59e0b' : '#475569';
            ctx!.fillRect(px + 3, py + 2, tw - 6, th - 4);
            ctx!.fillStyle = '#0f172a';
            ctx!.fillRect(px + 7, py + 6, tw - 14, th - 8);
            ctx!.fillStyle = '#38bdf8';
            ctx!.fillRect(px + 10, py + 8 + animFrame, tw - 20, 4);
          } else if (ch === 'N') {
            ctx!.fillStyle = '#2b3340';
            ctx!.fillRect(px, py, tw, th);
            ctx!.fillStyle = '#92400e';
            ctx!.fillRect(px + 7, py + 5, 18, 12);
            ctx!.fillStyle = '#fde68a';
            ctx!.fillRect(px + 9, py + 7, 14, 7);
            ctx!.fillStyle = '#78350f';
            ctx!.fillRect(px + 14, py + 17, 4, 6);
          } else if (ch === 'F') {
            // Bram Forge Anvil + Glowing Furnace
            ctx!.fillStyle = '#242b36';
            ctx!.fillRect(px, py, tw, th);
            ctx!.fillStyle = '#475569';
            ctx!.fillRect(px + 8, py + 12, 16, 8);
            ctx!.fillStyle = animFrame === 0 ? '#f97316' : '#fde047';
            ctx!.fillRect(px + 10, py + 3, 10, 6);
          } else if (ch === 'A') {
            // Lyra Alchemy Cauldron
            ctx!.fillStyle = '#242b36';
            ctx!.fillRect(px, py, tw, th);
            ctx!.fillStyle = '#1e293b';
            ctx!.fillRect(px + 8, py + 10, 16, 12);
            ctx!.fillStyle = animFrame === 0 ? '#10b981' : '#34d399';
            ctx!.fillRect(px + 10, py + 7, 12, 5);
          }
        }
      }

      // Evolving Lanterns & Astral Beacon in Center Plaza
      if (lanternsLit) {
        drawTorch(offX + 3 * tw + 4, offY + 2 * th + 2, animFrame, '#fbbf24');
        drawTorch(offX + 5 * tw + 22, offY + 2 * th + 2, 1 - animFrame, '#fbbf24');
      }
      if (hasBeacon) {
        const bx = offX + 4 * tw + 11;
        const by = offY + 3 * th + 3;
        ctx!.fillStyle = animFrame === 0 ? '#38bdf8' : '#818cf8';
        ctx!.fillRect(bx, by, 10, 10);
        ctx!.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx!.fillRect(bx - 5, by - 5, 20, 20);
      }

      // Draw All 4 NPC Side Characters
      for (const npc of v.npcs) {
        const sp = NPC_SPRITES[npc.spriteKey];
        if (!sp) continue;
        const nx = offX + npc.x * tw + 6;
        const ny = offY + npc.y * th + 2;
        ctx!.fillStyle = 'rgba(0,0,0,0.35)';
        ctx!.fillRect(nx + 2, ny + 18, 16, 4);
        drawPixelMatrix(ctx!, sp.frames[animFrame], sp.palette, nx, ny, 2);
        if (npc.hasAction) {
          ctx!.fillStyle = '#facc15';
          ctx!.fillRect(nx + 8, ny - 6 + animFrame, 4, 6);
        }
      }

      // Draw Hero in Village
      const heroSp = HERO_SPRITES[g.profile.heroClass] || HERO_SPRITES.hero_scholar;
      const hx = offX + v.x * tw + 4;
      const hy = offY + v.y * th + 1;
      ctx!.fillStyle = 'rgba(0,0,0,0.4)';
      ctx!.fillRect(hx + 3, hy + 21, 18, 4);
      drawPixelMatrix(ctx!, heroSp.frames[animFrame], heroSp.palette, hx, hy, 2);

      const pet = g.equippedBySlot?.companion;
      if (pet && COMPANION_SPRITES[pet.spriteKey]) {
        const ps = COMPANION_SPRITES[pet.spriteKey];
        const pyFloat = Math.floor(hy - 3 + Math.sin(frameCountNum * 0.1) * 2);
        drawPixelMatrix(ctx!, ps.frames[animFrame], ps.palette, hx - 10, pyFloat, 1);
      }
    }

    function renderDungeon(g: GameState, animFrame: number) {
      const d = g.dungeon!;
      const biome = BIOME_PALETTES[g.biome.key] || BIOME_PALETTES.moss_library;

      ctx!.fillStyle = '#05070c';
      ctx!.fillRect(0, 0, 320, 208);

      // Top Pixel Dungeon Telemetry Bar
      ctx!.fillStyle = '#09090b';
      ctx!.fillRect(0, 0, 320, 22);
      ctx!.font = 'bold 8px monospace';
      ctx!.fillStyle = '#fafafa';
      ctx!.fillText(`FL ${d.floor}`, 8, 14);
      ctx!.fillStyle = d.torch < 25 ? '#ef4444' : '#fbbf24';
      ctx!.fillText(`TORCH ${d.torch}%`, 54, 14);
      ctx!.fillStyle = d.keys > 0 ? '#fbbf24' : '#94a3b8';
      ctx!.fillText(`KEY ${d.keys}`, 136, 14);
      ctx!.fillStyle = '#38bdf8';
      ctx!.fillText(`SATCHEL:${d.satchel.shards}✦ ${d.satchel.items.length}📦`, 188, 14);

      const offX = 17;
      const offY = 24;
      const tw = 26;
      const th = 20;

      const isWall = (tx: number, ty: number) => {
        const cell = d.tiles[ty]?.[tx];
        return cell === 'W' || cell === 'S' || cell === undefined;
      };

      for (let y = 0; y < d.tiles.length; y++) {
        for (let x = 0; x < d.tiles[0].length; x++) {
          const vis = d.fov[y]?.[x] ?? 0;
          const px = offX + x * tw;
          const py = offY + y * th;
          if (vis === 0) {
            ctx!.fillStyle = '#04060b';
            ctx!.fillRect(px, py, tw, th);
            continue;
          }

          const ch = d.tiles[y][x];
          if (ch === 'W' || ch === 'S') {
            // Solid recessed 3D stone masonry wall block
            ctx!.fillStyle = biome.brickDark;
            ctx!.fillRect(px, py, tw, th);

            // Staggered 2-course stone bricks + top highlights
            ctx!.fillStyle = biome.brickLight;
            ctx!.fillRect(px + 1, py + 1, 11, 5);
            ctx!.fillRect(px + 14, py + 1, 11, 5);
            ctx!.fillRect(px + 1, py + 8, 5, 5);
            ctx!.fillRect(px + 8, py + 8, 11, 5);
            ctx!.fillRect(px + 21, py + 8, 4, 5);
            ctx!.fillRect(px + 1, py + 15, 11, 4);
            ctx!.fillRect(px + 14, py + 15, 11, 4);

            // Dark mortar seams
            ctx!.fillStyle = biome.mortar;
            ctx!.fillRect(px, py + 6, tw, 1);
            ctx!.fillRect(px, py + 13, tw, 1);
            ctx!.fillRect(px, py + th - 1, tw, 1);
            ctx!.fillRect(px + 12, py, 2, 6);
            ctx!.fillRect(px + 6, py + 7, 2, 6);
            ctx!.fillRect(px + 19, py + 7, 2, 6);
            ctx!.fillRect(px + 12, py + 14, 2, 6);

            // Crisp corridor rim edge wherever a wall meets an open path
            const rimColor = vis === 2 ? '#94a3b8' : '#475569';
            ctx!.fillStyle = rimColor;
            if (!isWall(x, y - 1)) ctx!.fillRect(px, py, tw, 2);
            if (!isWall(x, y + 1)) ctx!.fillRect(px, py + th - 2, tw, 2);
            if (!isWall(x - 1, y)) ctx!.fillRect(px, py, 2, th);
            if (!isWall(x + 1, y)) ctx!.fillRect(px + tw - 2, py, 2, th);

            if (ch === 'S') {
              // High-visibility cracked fissure hint on Secret Wall
              ctx!.fillStyle = g.heroStats.intuition >= 14 ? '#38bdf8' : '#cbd5e1';
              ctx!.fillRect(px + 9, py + 4, 2, 5);
              ctx!.fillRect(px + 11, py + 8, 4, 2);
              ctx!.fillRect(px + 14, py + 10, 2, 6);
            }
          } else if (ch === 'L') {
            ctx!.fillStyle = biome.floorA;
            ctx!.fillRect(px, py, tw, th);
            ctx!.fillStyle = '#fbbf24';
            ctx!.fillRect(px + 4, py + 2, 3, th - 4);
            ctx!.fillRect(px + 11, py + 2, 3, th - 4);
            ctx!.fillRect(px + 18, py + 2, 3, th - 4);
            ctx!.fillRect(px + 2, py + 8, tw - 4, 3);
          } else {
            // Open bright flagstone walkway
            ctx!.fillStyle = (x + y) % 2 === 0 ? biome.floorA : biome.floorB;
            ctx!.fillRect(px, py, tw, th);

            // Subtle flagstone bevel + paving speck so open path reads as ground
            ctx!.strokeStyle = 'rgba(255, 255, 255, 0.10)';
            ctx!.lineWidth = 1;
            ctx!.strokeRect(px + 0.5, py + 0.5, tw - 1, th - 1);
            ctx!.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx!.fillRect(px + 12, py + 9, 2, 2);

            // Drop shadow below adjacent northern wall for 3D corridor depth
            if (isWall(x, y - 1)) {
              ctx!.fillStyle = 'rgba(0, 0, 0, 0.42)';
              ctx!.fillRect(px, py, tw, 3);
            }

            if (ch === 'E') {
              const st = MINI_ICONS.icon_stairs;
              drawPixelMatrix(ctx!, st.rows, st.palette, px + 5, py + 4, 2);
            }

            // Adjacent walkable step indicator around the hero
            const manhattan = Math.abs(x - d.playerX) + Math.abs(y - d.playerY);
            if (vis === 2 && manhattan === 1) {
              ctx!.strokeStyle = 'rgba(74, 222, 128, 0.60)';
              ctx!.lineWidth = 1;
              ctx!.strokeRect(px + 2, py + 2, tw - 4, th - 4);
              ctx!.fillStyle = 'rgba(250, 250, 250, 0.55)';
              ctx!.fillRect(px + 12, py + 9, 2, 2);
            }
          }

          // Explored memory fog shading
          if (vis === 1) {
            ctx!.fillStyle = 'rgba(4, 6, 12, 0.56)';
            ctx!.fillRect(px, py, tw, th);
          }
        }
      }

      // Draw Visible Entities inside Lit/Memory FOV
      for (const ent of d.entities) {
        if (ent.done) continue;
        const vis = d.fov[ent.y]?.[ent.x] ?? 0;
        if (vis === 0) continue;
        const px = offX + ent.x * tw;
        const py = offY + ent.y * th;

        if (ent.type === 'trap') {
          if (ent.detected) {
            ctx!.fillStyle = '#f59e0b';
            ctx!.font = 'bold 10px monospace';
            ctx!.fillText('!', px + 10, py + 14);
          }
          continue;
        }

        if (vis === 1 && (ent.type === 'monster' || ent.type === 'boss')) continue; // Hide roaming threats in memory fog!

        if (ent.type === 'key') {
          drawPixelMatrix(ctx!, MINI_ICONS.icon_key.rows, MINI_ICONS.icon_key.palette, px + 5, py + 4, 2);
        } else if (ent.type === 'herb') {
          drawPixelMatrix(ctx!, MINI_ICONS.icon_herb.rows, MINI_ICONS.icon_herb.palette, px + 5, py + 4, 2);
        } else if (ent.type === 'brazier') {
          drawPixelMatrix(ctx!, MINI_ICONS.icon_brazier.rows, MINI_ICONS.icon_brazier.palette, px + 6, py + 4, 2);
        } else if (ent.type === 'riddle') {
          drawPixelMatrix(ctx!, MINI_ICONS.icon_riddle.rows, MINI_ICONS.icon_riddle.palette, px + 5, py + 4, 2);
        } else if (ent.type === 'lore') {
          drawPixelMatrix(ctx!, MINI_ICONS.icon_lore.rows, MINI_ICONS.icon_lore.palette, px + 5, py + 4, 2);
        } else if (ent.type === 'chest') {
          drawPixelMatrix(ctx!, MINI_ICONS.icon_chest_mini.rows, MINI_ICONS.icon_chest_mini.palette, px + 5, py + 4, 2);
        } else if (ent.type === 'shrine') {
          ctx!.fillStyle = '#22d3ee';
          ctx!.fillRect(px + 9, py + 3, 8, 12);
          ctx!.fillStyle = '#facc15';
          ctx!.fillRect(px + 11, py + 5, 4, 4);
        } else if (ent.type === 'monster' || ent.type === 'boss') {
          const sp = MONSTER_SPRITES[ent.key || 'slime'] || MONSTER_SPRITES.slime;
          drawPixelMatrix(ctx!, sp.frames[animFrame], sp.palette, px + 5, py + 1, ent.type === 'boss' ? 2 : 1.5);
          if (ent.type === 'boss') {
            ctx!.fillStyle = '#fbbf24';
            ctx!.fillRect(px + 11, py - 2, 4, 3);
          }
        }
      }

      // Draw Hero Token in Dungeon
      const heroSp = HERO_SPRITES[g.profile.heroClass] || HERO_SPRITES.hero_scholar;
      const hx = offX + d.playerX * tw + 5;
      const hy = offY + d.playerY * th + 1;
      ctx!.fillStyle = g.heroStats.studyBonuses.focusFever ? 'rgba(250, 204, 21, 0.32)' : 'rgba(251, 191, 36, 0.16)';
      ctx!.fillRect(hx - 4, hy - 2, 26, 22);
      drawPixelMatrix(ctx!, heroSp.frames[animFrame], heroSp.palette, hx, hy, 1.5);
    }

    function renderEncounterArena(g: GameState, fever: boolean, animFrame: number, frameCountNum: number) {
      const fx = fxRef.current;
      const biome = BIOME_PALETTES[g.biome.key] || BIOME_PALETTES.moss_library;
      ctx!.fillStyle = biome.bg;
      ctx!.fillRect(0, 0, 320, 208);

      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 10; col++) {
          const bx = col * 34 + (row % 2 === 1 ? -16 : 0);
          const by = row * 19;
          ctx!.fillStyle = (row + col) % 3 === 0 ? biome.brickLight : biome.brickDark;
          ctx!.fillRect(bx, by, 32, 17);
          ctx!.fillStyle = biome.mortar;
          ctx!.fillRect(bx, by + 17, 34, 2);
          ctx!.fillRect(bx + 32, by, 2, 19);
        }
      }

      drawTorch(36, 56, animFrame, biome.torchGlow);
      drawTorch(280, 56, 1 - animFrame, biome.torchGlow);

      ctx!.fillStyle = biome.floorA;
      ctx!.fillRect(0, 130, 320, 78);
      for (let fy = 130; fy < 208; fy += 16) {
        for (let fxTile = 0; fxTile < 320; fxTile += 32) {
          const checker = ((fy / 16 + fxTile / 32) & 1) === 0;
          ctx!.fillStyle = checker ? biome.floorA : biome.floorB;
          ctx!.fillRect(fxTile, fy, 32, 16);
        }
      }

      if (fx.heroLunge > 0) fx.heroLunge = Math.max(0, fx.heroLunge - 1.2);
      if (fx.allyLunge > 0) fx.allyLunge = Math.max(0, fx.allyLunge - 1.2);
      if (fx.heroFlash > 0) fx.heroFlash--;
      if (fx.enemyShake > 0) fx.enemyShake--;
      if (fx.guardPulse > 0) fx.guardPulse--;
      if (fx.finisherLife > 0) fx.finisherLife--;
      if (fx.lootBeamLife > 0) fx.lootBeamLife--;

      const enc = g.encounter!;
      const heroSprite = HERO_SPRITES[g.profile.heroClass] || HERO_SPRITES.hero_scholar;
      const heroX = Math.floor(68 + fx.heroLunge);
      const heroY = Math.floor(108 + (animFrame === 1 ? -1 : 0));

      ctx!.fillStyle = 'rgba(0,0,0,0.45)';
      ctx!.fillRect(heroX + 3, 144, 30, 5);
      ctx!.fillRect(208, 144, 34, 5);

      // Draw Active Recruited Party Ally standing in Vanguard Formation beside Hero
      const activeAlly = g.party?.activeAlly;
      if (activeAlly) {
        const allySp = HERO_SPRITES[activeAlly.spriteKey] || NPC_SPRITES[activeAlly.spriteKey] || HERO_SPRITES.hero_knight;
        const ax = Math.floor(24 + fx.allyLunge);
        const ay = Math.floor(114 + (animFrame === 0 ? -1 : 0));
        ctx!.fillStyle = 'rgba(0,0,0,0.38)';
        ctx!.fillRect(ax + 2, 145, 24, 4);
        drawPixelMatrix(ctx!, allySp.frames[animFrame], allySp.palette, ax, ay, 2.5);
        ctx!.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx!.fillRect(ax - 2, ay - 11, 34, 9);
        ctx!.fillStyle = '#38bdf8';
        ctx!.font = 'bold 6px monospace';
        ctx!.fillText(activeAlly.name.slice(0, 7).toUpperCase(), ax, ay - 4);
      }

      if (fever) {
        ctx!.fillStyle = 'rgba(250, 204, 21, 0.22)';
        ctx!.fillRect(heroX - 4, heroY - 3, 44, 42);
      }

      // Draw Hero Flanking Stance Cyan Afterimage & Badge
      const flankingTurns = enc.heroStatuses?.flankingTurns || 0;
      if (flankingTurns > 0) {
        ctx!.fillStyle = 'rgba(34, 211, 238, 0.24)';
        ctx!.fillRect(heroX - 10, heroY + 2, 32, 34);
        ctx!.fillStyle = '#0891b2';
        ctx!.fillRect(heroX - 4, heroY - 14, 46, 10);
        ctx!.fillStyle = '#ecfeff';
        ctx!.font = 'bold 7px monospace';
        ctx!.fillText('FLANKING!', heroX - 1, heroY - 7);
      }

      const pet = g.equippedBySlot?.companion;
      if (pet && COMPANION_SPRITES[pet.spriteKey]) {
        const petSprite = COMPANION_SPRITES[pet.spriteKey];
        const py = Math.floor(86 + Math.sin(frameCountNum * 0.08) * 3);
        drawPixelMatrix(ctx!, petSprite.frames[animFrame], petSprite.palette, heroX - 18, py, 2);
      }

      drawPixelMatrix(ctx!, heroSprite.frames[animFrame], heroSprite.palette, heroX, heroY, 3);
      if (fx.heroFlash > 0 && fx.heroFlash % 4 < 2) {
        ctx!.fillStyle = 'rgba(244, 63, 94, 0.45)';
        ctx!.fillRect(heroX, heroY, 36, 36);
      }
      if (fx.guardPulse > 0) {
        ctx!.strokeStyle = '#38bdf8';
        ctx!.lineWidth = 2;
        ctx!.strokeRect(heroX - 3, heroY - 2, 42, 40);
      }

      // Cinematic Dual-Tech / Ultimate Finisher Cross-Slash Beam
      if (fx.finisherLife > 0) {
        ctx!.save();
        ctx!.strokeStyle = fx.finisherLife % 4 < 2 ? '#fde047' : '#f43f5e';
        ctx!.lineWidth = 4;
        ctx!.beginPath();
        ctx!.moveTo(heroX + 24, heroY + 14);
        ctx!.lineTo(232, 118);
        ctx!.moveTo(195, 92);
        ctx!.lineTo(245, 142);
        ctx!.moveTo(245, 92);
        ctx!.lineTo(195, 142);
        ctx!.stroke();
        ctx!.restore();
      }

      const shakeOffset = fx.enemyShake > 0 ? (fx.enemyShake % 4 < 2 ? -3 : 3) : 0;
      if (enc.type === 'combat' && enc.enemy) {
        const mSprite = MONSTER_SPRITES[enc.enemy.key] || MONSTER_SPRITES.slime;
        const scale = enc.isBoss ? 3.5 : 3;
        const mx = Math.floor(208 + shakeOffset);
        const my = Math.floor((enc.isBoss ? 104 : 110) + (animFrame === 1 ? -1 : 0));
        drawPixelMatrix(ctx!, mSprite.frames[animFrame], mSprite.palette, mx, my, Math.round(scale));

        // Enemy HP Mini-Bar
        const barW = 48;
        const hpRatio = Math.max(0, Math.min(1, enc.enemy.hp / Math.max(1, enc.enemy.maxHp)));
        ctx!.fillStyle = '#09090b';
        ctx!.fillRect(200, my - 10, barW + 2, 6);
        ctx!.fillStyle = enc.isBoss ? '#f59e0b' : '#ef4444';
        ctx!.fillRect(201, my - 9, Math.floor(barW * hpRatio), 4);

        // Enemy Break Shields Pips or BROKEN Badge
        const shields = enc.enemy.shields ?? 0;
        const maxShields = enc.enemy.maxShields ?? (enc.isBoss ? 3 : 2);
        if (shields <= 0) {
          ctx!.fillStyle = '#dc2626';
          ctx!.fillRect(198, my - 39, 54, 11);
          ctx!.fillStyle = '#fef08a';
          ctx!.font = 'bold 7px monospace';
          ctx!.fillText('BROKEN!', 206, my - 31);
        } else {
          for (let s = 0; s < maxShields; s++) {
            const sx = 202 + s * 13;
            const sy = my - 38;
            ctx!.fillStyle = s < shields ? '#38bdf8' : '#1e293b';
            ctx!.fillRect(sx, sy, 10, 10);
            ctx!.strokeStyle = '#09090b';
            ctx!.lineWidth = 1;
            ctx!.strokeRect(sx, sy, 10, 10);
          }
        }

        // EXPLICIT INTENT TELEGRAPH BADGE ABOVE ENEMY
        const intent = (enc.enemy.intent || 'STRIKE') as EnemyIntent;
        const iv = INTENT_VISUAL[intent] || INTENT_VISUAL.STRIKE;
        const label = iv.label(enc.enemy.intentValue);
        ctx!.fillStyle = iv.bg;
        ctx!.fillRect(192, my - 26, 68, 13);
        ctx!.fillStyle = iv.fg;
        ctx!.font = 'bold 8px monospace';
        ctx!.fillText(label, 196, my - 17);
      } else if (enc.type === 'chest') {
        drawPixelMatrix(ctx!, PROP_SPRITES.chest.frames[animFrame], PROP_SPRITES.chest.palette, 212, 118, 3);
      } else if (enc.type === 'shrine' || enc.type === 'riddle') {
        drawPixelMatrix(ctx!, PROP_SPRITES.shrine.frames[animFrame], PROP_SPRITES.shrine.palette, 212, 114, 3);
      } else {
        drawPixelMatrix(ctx!, PROP_SPRITES.merchant.frames[animFrame], PROP_SPRITES.merchant.palette, 212, 114, 3);
      }

      ctx!.fillStyle = 'rgba(9, 9, 11, 0.78)';
      ctx!.fillRect(6, 6, 108, 16);
      ctx!.fillStyle = '#fafafa';
      ctx!.font = 'bold 8px monospace';
      ctx!.fillText(`FLOOR ${g.dungeon?.floor || g.profile.floor} • TURN ${enc.turn || 1}`, 11, 17);
    }

    function renderIdleAutoBattler(g: GameState, fever: boolean, animFrame: number, frameCountNum: number) {
      const idle = g.idle!;
      const loop = idle.loop;
      const sim = idleSimRef.current;
      const fx = fxRef.current;
      const { isStudying: studying, onAutoWaveClear: onClear, selectedCard: cardSel } = stateRef.current;
      const overdrive = idle.overdriveActive || studying;
      const battlePace = idle.gambits?.battlePace || '1x';
      const paceBase = battlePace === 'overdrive' ? 2.4 : battlePace === '2x' ? 1.75 : 1.0;
      const paceFactor = overdrive ? (battlePace === 'overdrive' ? 3.2 : battlePace === '2x' ? 2.4 : 1.65) : paceBase;

      const roadPath = loop?.roadPath || [
        { x: 1, y: 2 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
        { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 },
        { x: 4, y: 3 }, { x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 3 },
      ];
      const boardTiles = loop?.board || [];
      const bonuses = loop?.bonuses || {
        atkPct: 0, maxHpFlat: 0, maxHpPct: 0, defFlat: 0, defPct: 0,
        lifestealPct: 0, executePct: 0, chainLightningPct: 0, barrierBonusPct: 0,
        speedPct: 0, lootMult: 1, campfireHealPct: 18, bonusGearRolls: 0,
      };
      const activeRelicIds = new Set((loop?.activeRelics || []).map((r) => r.id));

      const effectiveHeroMaxHp = Math.max(
        140,
        Math.round(
          ((g.heroStats.maxHp || 120) * 1.45 + (bonuses.maxHpFlat || 0) + (activeRelicIds.has('titan_heartstone') ? 120 : 0)) *
            (1 + (bonuses.maxHpPct || 0) / 100) *
            (idle.ascensionMult || 1)
        )
      );

      // Sync simulation state when backend state advances or starts fresh
      const nextKey = `${idle.stage}-${idle.wave}-${loop?.loopCount || 1}`;
      if (sim.waveKey !== nextKey) {
        const isFirstInit = !sim.waveKey;
        sim.waveKey = nextKey;
        sim.heroMaxHp = effectiveHeroMaxHp;
        if (isFirstInit || sim.heroHp <= 0) {
          sim.heroHp = effectiveHeroMaxHp;
          sim.heroShield = activeRelicIds.has('titan_heartstone') ? Math.round(effectiveHeroMaxHp * 0.2) : 0;
          sim.roadProgress = loop?.tileIndex || 0;
          sim.targetStopIdx = ((loop?.tileIndex || 0) + 1) % roadPath.length;
        }
        sim.pendingClearDispatched = false;
        sim.bossTimerFrames = 1500;
      }

      const biome = BIOME_PALETTES[idle.realm.key] || BIOME_PALETTES.moss_library;
      ctx!.fillStyle = '#09090b';
      ctx!.fillRect(0, 0, 320, 208);

      // Subtle atmospheric backdrop behind grid
      ctx!.fillStyle = biome.bg;
      ctx!.fillRect(6, 20, 218, 178);
      ctx!.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx!.lineWidth = 1;
      ctx!.strokeRect(6.5, 20.5, 217, 177);

      // Helper: Predict whether placing `cardSel` at empty cell (gx, gy) triggers a secret adjacency evolution!
      const willTriggerEvolution = (gx: number, gy: number, key: string) => {
        const neighbors = boardTiles.filter(
          (t) => !(t.x === gx && t.y === gy) && Math.abs(t.x - gx) <= 1 && Math.abs(t.y - gy) <= 1
        );
        if (key === 'starlight_meadow' && neighbors.some((n) => n.baseKey !== 'starlight_meadow')) return true;
        if (key === 'ruined_village' && neighbors.some((n) => n.baseKey === 'vampire_manor')) return true;
        if (key === 'vampire_manor' && neighbors.some((n) => n.baseKey === 'ruined_village')) return true;
        if (key === 'titan_mountain' && neighbors.filter((n) => n.baseKey === 'titan_mountain').length >= 2) return true;
        if (key === 'storm_conduit' && neighbors.some((n) => n.baseKey === 'chrono_obelisk' || n.baseKey === 'storm_conduit')) return true;
        if (key === 'chrono_obelisk' && neighbors.some((n) => n.baseKey === 'storm_conduit')) return true;
        if (key === 'alchemist_vault' && neighbors.length >= 3) return true;
        if (neighbors.some((n) => n.baseKey === 'starlight_meadow' && !n.evolved && key !== 'starlight_meadow')) return true;
        return false;
      };

      const roadMap = new Map<string, number>();
      roadPath.forEach((pt, idx) => roadMap.set(`${pt.x},${pt.y}`, idx));
      const tileMap = new Map<string, (typeof boardTiles)[0]>();
      boardTiles.forEach((t) => tileMap.set(`${t.x},${t.y}`, t));

      const cellW = 30;
      const cellH = 34;
      const ox = 10;
      const oy = 24;
      const hover = hoverCellRef.current;

      // Render 7x5 Tactical Loop Grid
      for (let gy = 0; gy < 5; gy++) {
        for (let gx = 0; gx < 7; gx++) {
          const cx = ox + gx * cellW;
          const cy = oy + gy * cellH;
          const roadIdx = roadMap.get(`${gx},${gy}`);
          const isRoad = roadIdx !== undefined;
          const isCamp = roadIdx === 0;
          const placed = tileMap.get(`${gx},${gy}`);
          const isHover = hover && hover.x === gx && hover.y === gy;

          // Base cell background
          if (isCamp) {
            ctx!.fillStyle = '#451a03';
          } else if (isRoad) {
            ctx!.fillStyle = roadIdx % 2 === 0 ? '#1e293b' : '#263244';
          } else if (gx >= 2 && gx <= 4 && gy === 2) {
            // Inner Sanctum Courtyard
            ctx!.fillStyle = '#13211c';
          } else {
            ctx!.fillStyle = (gx + gy) % 2 === 0 ? '#0f172a' : '#131d31';
          }
          ctx!.fillRect(cx + 1, cy + 1, cellW - 2, cellH - 2);

          // Road directional track dashes
          if (isRoad && !isCamp) {
            ctx!.strokeStyle = 'rgba(251, 191, 36, 0.25)';
            ctx!.lineWidth = 1;
            ctx!.strokeRect(cx + 1.5, cy + 1.5, cellW - 3, cellH - 3);
            const nextPt = roadPath[(roadIdx + 1) % roadPath.length];
            const dx = nextPt.x - gx;
            const dy = nextPt.y - gy;
            ctx!.fillStyle = 'rgba(251, 191, 36, 0.45)';
            ctx!.fillRect(cx + 14 + dx * 6, cy + 16 + dy * 6, 3, 3);
          } else if (!isRoad) {
            ctx!.strokeStyle = 'rgba(148, 163, 184, 0.14)';
            ctx!.lineWidth = 1;
            ctx!.strokeRect(cx + 1.5, cy + 1.5, cellW - 3, cellH - 3);
          }

          // Render Campfire at (1, 2)
          if (isCamp) {
            ctx!.strokeStyle = '#f59e0b';
            ctx!.lineWidth = 1.5;
            ctx!.strokeRect(cx + 1.5, cy + 1.5, cellW - 3, cellH - 3);
            const pulse = animFrame === 0 ? 0 : 1;
            ctx!.fillStyle = '#ea580c';
            ctx!.fillRect(cx + 10, cy + 14 - pulse, 10, 8 + pulse);
            ctx!.fillStyle = '#fde047';
            ctx!.fillRect(cx + 12, cy + 12 - pulse, 6, 6);
            ctx!.fillStyle = '#78350f';
            ctx!.fillRect(cx + 8, cy + 21, 14, 3);
            ctx!.fillStyle = '#fef08a';
            ctx!.font = 'bold 6px monospace';
            ctx!.fillText('CAMP', cx + 6, cy + 9);
          }

          // Render Placed Tactical Tile Structure
          if (placed) {
            ctx!.fillStyle = placed.evolved ? 'rgba(126, 34, 206, 0.36)' : 'rgba(15, 23, 42, 0.78)';
            ctx!.fillRect(cx + 2, cy + 2, cellW - 4, cellH - 4);
            ctx!.strokeStyle = placed.evolved
              ? frameCountNum % 30 < 15
                ? '#fde047'
                : '#c084fc'
              : placed.color || '#38bdf8';
            ctx!.lineWidth = placed.evolved ? 2 : 1.5;
            ctx!.strokeRect(cx + 2, cy + 2, cellW - 4, cellH - 4);

            // Tile Icon
            ctx!.font = '13px sans-serif';
            ctx!.fillText(placed.icon || '🏛️', cx + 6, cy + 21);

            // Star Pips (★1..★3)
            for (let s = 0; s < placed.stars; s++) {
              ctx!.fillStyle = placed.stars >= 3 ? '#f43f5e' : placed.stars === 2 ? '#fde047' : '#e2e8f0';
              ctx!.fillRect(cx + 4 + s * 6, cy + 4, 4, 3);
            }
            if (placed.evolved) {
              ctx!.fillStyle = '#fde047';
              ctx!.font = 'bold 5px monospace';
              ctx!.fillText('EVO', cx + 4, cy + 31);
            }
          }

          // Interactive Placement Highlights when a Tactical Card is selected
          if (cardSel && !isCamp) {
            const validTerrain = (cardSel.placement === 'road') === isRoad;
            const canMergeHere = placed && placed.baseKey === cardSel.cardKey && placed.stars < 3;
            const canPlaceEmpty = !placed && validTerrain;
            if (canMergeHere) {
              ctx!.strokeStyle = frameCountNum % 24 < 12 ? '#fde047' : '#f59e0b';
              ctx!.lineWidth = 2;
              ctx!.strokeRect(cx + 2, cy + 2, cellW - 4, cellH - 4);
              ctx!.fillStyle = '#fde047';
              ctx!.font = 'bold 6px monospace';
              ctx!.fillText('★MRG', cx + 3, cy + 31);
            } else if (canPlaceEmpty) {
              const evolves = willTriggerEvolution(gx, gy, cardSel.cardKey);
              ctx!.strokeStyle = evolves
                ? '#22d3ee'
                : isHover
                  ? '#4ade80'
                  : 'rgba(74, 222, 128, 0.72)';
              ctx!.lineWidth = evolves || isHover ? 2 : 1.25;
              ctx!.strokeRect(cx + 2, cy + 2, cellW - 4, cellH - 4);
              if (evolves) {
                ctx!.fillStyle = '#22d3ee';
                ctx!.font = 'bold 6px monospace';
                ctx!.fillText('⚡EVO', cx + 4, cy + 10);
              } else if (isHover) {
                ctx!.fillStyle = '#4ade80';
                ctx!.font = 'bold 6px monospace';
                ctx!.fillText('+SET', cx + 4, cy + 10);
              }
            }
          } else if (isHover && !isCamp) {
            ctx!.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx!.lineWidth = 1;
            ctx!.strokeRect(cx + 1.5, cy + 1.5, cellW - 3, cellH - 3);
          }
        }
      }

      // Advance Hero Expedition Loop Simulation
      if (sim.heroLunge > 0) sim.heroLunge = Math.max(0, sim.heroLunge - 1.2);
      if (sim.heroHurtFlash > 0) sim.heroHurtFlash--;
      if (sim.enemy.lunge < 0) sim.enemy.lunge = Math.min(0, sim.enemy.lunge + 1.2);
      if (sim.enemy.shake > 0) sim.enemy.shake--;
      if (sim.lightningArc && sim.lightningArc.life > 0) sim.lightningArc.life--;
      if (sim.ultBeamLife > 0) sim.ultBeamLife--;

      if (sim.phase === 'wipe_pause') {
        sim.wipePauseFrames--;
        if (sim.wipePauseFrames <= 0) {
          sim.phase = 'traveling';
          sim.heroHp = effectiveHeroMaxHp;
          sim.roadProgress = 0;
          sim.targetStopIdx = 1;
          sim.pendingClearDispatched = false;
        }
      } else if (sim.phase === 'traveling') {
        const moveStep = 0.032 * paceFactor;
        const prevFloor = Math.floor(sim.roadProgress) % roadPath.length;
        sim.roadProgress = (sim.roadProgress + moveStep) % roadPath.length;
        const curFloor = Math.floor(sim.roadProgress) % roadPath.length;

        if (curFloor !== prevFloor) {
          const stoppedPt = roadPath[curFloor];
          const steppedTile = tileMap.get(`${stoppedPt.x},${stoppedPt.y}`);
          const adjacentVampire = boardTiles.some(
            (t) =>
              t.baseKey === 'vampire_manor' &&
              Math.abs(t.x - stoppedPt.x) <= 1 &&
              Math.abs(t.y - stoppedPt.y) <= 1
          );
          const cellScreenX = ox + stoppedPt.x * cellW + 15;
          const cellScreenY = oy + stoppedPt.y * cellH + 10;

          if (curFloor === 0) {
            // Campfire Pass Heal + Boss Check
            sim.phoenixUsedThisLoop = false;
            const healPct = (bonuses.campfireHealPct + (activeRelicIds.has('starlight_aegis') ? 35 : 0)) / 100;
            const healAmt = Math.round(sim.heroMaxHp * healPct);
            sim.heroHp = Math.min(sim.heroMaxHp, sim.heroHp + healAmt);
            if (activeRelicIds.has('starlight_aegis')) {
              sim.heroShield = Math.round(sim.heroMaxHp * 0.25);
            }
            fx.floaters.push({ x: cellScreenX, y: cellScreenY, vy: -0.45, text: `+${healAmt} HP`, color: '#4ade80', life: 36 });
          } else if (steppedTile && (steppedTile.cardKey === 'ruined_village' || steppedTile.cardKey === 'counts_estate')) {
            const hPct = steppedTile.cardKey === 'counts_estate' ? 0.35 : 0.22;
            const hAmt = Math.round(sim.heroMaxHp * hPct);
            sim.heroHp = Math.min(sim.heroMaxHp, sim.heroHp + hAmt);
            fx.floaters.push({ x: cellScreenX, y: cellScreenY, vy: -0.45, text: `+${hAmt}HP +🪙`, color: '#34d399', life: 34 });
          }

          // Trigger Encounter Clash if Campfire Boss Ready OR Encounter Road Tile OR every 3rd road step
          const isBossFight = Boolean(loop?.bossActive && curFloor === 0);
          const hasCombatTile =
            steppedTile && ['spider_cocoon', 'blood_grove', 'vanguard_outpost'].includes(steppedTile.baseKey);
          const hasMonsterSpawn = isBossFight || hasCombatTile || adjacentVampire || curFloor % 3 === 1;

          if (hasMonsterSpawn) {
            sim.phase = 'clash';
            sim.pendingClearDispatched = false;
            sim.bossTimerFrames = 1500;
            const baseHp = isBossFight
              ? idle.currentEnemy.maxHp
              : Math.round(idle.currentEnemy.maxHp * (0.58 + (loop?.loopCount || 1) * 0.08));
            sim.enemy = {
              key: isBossFight
                ? 'dragon'
                : adjacentVampire
                  ? 'wraith'
                  : steppedTile?.baseKey === 'spider_cocoon'
                    ? 'bat'
                    : idle.currentEnemy.key,
              name: isBossFight
                ? idle.currentEnemy.name
                : adjacentVampire
                  ? 'Crimson Count'
                  : idle.currentEnemy.name,
              hp: baseHp,
              maxHp: baseHp,
              shields: isBossFight ? 3 : adjacentVampire ? 2 : 1,
              maxShields: isBossFight ? 3 : adjacentVampire ? 2 : 1,
              atb: 25,
              lunge: 0,
              shake: 0,
              isBoss: isBossFight,
            };
          }
        }
      } else if (sim.phase === 'clash') {
        // Two-way ATB clash powered by Loop Synergies!
        const speedMult = 1 + (bonuses.speedPct || 0) / 100 + (activeRelicIds.has('chrono_pendulum') ? 0.25 : 0);
        sim.heroAtb += 1.45 * speedMult * paceFactor;
        sim.enemy.atb += 1.05 * paceFactor;
        if (sim.enemy.isBoss) {
          sim.bossTimerFrames = Math.max(0, sim.bossTimerFrames - paceFactor);
        }

        const heroPos = roadPath[Math.floor(sim.roadProgress) % roadPath.length];
        const hxScreen = ox + heroPos.x * cellW + 14;
        const hyScreen = oy + heroPos.y * cellH + 14;

        if (sim.heroAtb >= 100) {
          sim.heroAtb = 0;
          sim.heroLunge = 8;
          sim.ultCharge = Math.min(100, sim.ultCharge + 24);
          if (sim.enemy.shields > 0) {
            sim.enemy.shields = Math.max(0, sim.enemy.shields - 1);
            if (sim.enemy.shields === 0) {
              fx.floaters.push({ x: 266, y: 100, vy: -0.45, text: '💥 BROKEN!', color: '#facc15', life: 30 });
            }
          }

          const prismMult = activeRelicIds.has('scholar_prism')
            ? 1 + 0.2 * boardTiles.filter((t) => t.evolved).length
            : 1;
          const baseAtk = Math.round((idle.squadDps || 35) * 0.85 * (1 + bonuses.atkPct / 100) * prismMult);
          let dmg = Math.round(baseAtk * (sim.enemy.shields === 0 ? 1.45 : 0.95));

          // Chain Lightning Synergy
          const lightningChance = (bonuses.chainLightningPct || 0) + (activeRelicIds.has('tesla_capacitor') ? 35 : 0);
          if (lightningChance > 0 && Math.random() * 100 < lightningChance) {
            const boltDmg = Math.round(dmg * 0.6);
            dmg += boltDmg;
            sim.lightningArc = { x1: hxScreen, y1: hyScreen, x2: 268, y2: 118, life: 12 };
            fx.floaters.push({ x: 256, y: 92, vy: -0.5, text: `⚡+${boltDmg}`, color: '#38bdf8', life: 28 });
          }

          sim.enemy.hp = Math.max(0, sim.enemy.hp - dmg);
          sim.enemy.shake = 10;
          fx.floaters.push({ x: hxScreen, y: hyScreen - 8, vy: -0.5, text: `-${dmg}`, color: '#fde047', life: 26 });

          // Crimson Lifesteal Synergy
          const lifesteal = (bonuses.lifestealPct || 0) + (activeRelicIds.has('vampiric_fang') ? 15 : 0);
          if (lifesteal > 0) {
            const leech = Math.max(3, Math.round((dmg * lifesteal) / 100));
            const prevHp = sim.heroHp;
            sim.heroHp = Math.min(sim.heroMaxHp, sim.heroHp + leech);
            if (activeRelicIds.has('vampiric_fang') && prevHp + leech > sim.heroMaxHp) {
              sim.heroShield = Math.min(Math.round(sim.heroMaxHp * 0.5), sim.heroShield + (prevHp + leech - sim.heroMaxHp));
            }
          }

          // Blood Grove / Guillotine Execute Check!
          const execThresh = Math.max(
            bonuses.executePct || 0,
            activeRelicIds.has('guillotine_edge') ? (sim.enemy.isBoss ? 12 : 25) : 0
          );
          if (sim.enemy.hp > 0 && execThresh > 0 && (sim.enemy.hp / sim.enemy.maxHp) * 100 <= execThresh) {
            sim.enemy.hp = 0;
            fx.floaters.push({ x: hxScreen, y: hyScreen - 14, vy: -0.55, text: '🪓 EXECUTE!', color: '#f43f5e', life: 36 });
          }

          // Squad Ultimate Auto-Discharge at 100%
          if (sim.ultCharge >= 100 && sim.enemy.hp > 0) {
            sim.ultCharge = 0;
            sim.ultBeamLife = 20;
            const burst = Math.round(baseAtk * 1.9);
            sim.enemy.shields = 0;
            sim.enemy.hp = Math.max(0, sim.enemy.hp - burst);
            fx.floaters.push({ x: hxScreen, y: hyScreen - 16, vy: -0.55, text: `🌟 -${burst}!`, color: '#fde047', life: 34 });
          }

          if (sim.enemy.hp <= 0 && !sim.pendingClearDispatched) {
            sim.pendingClearDispatched = true;
            sim.phase = 'traveling';
            fx.floaters.push({
              x: hxScreen,
              y: hyScreen - 14,
              vy: -0.5,
              text: sim.enemy.isBoss ? '👑 BOSS SLAIN!' : '+✦ +🃏',
              color: '#4ade80',
              life: 36,
            });
            if (onClear) {
              onClear({ isBossWave: sim.enemy.isBoss, triggerUltimate: sim.ultBeamLife > 0, outcome: 'clear' });
            }
          }
        }

        if (sim.enemy.hp > 0 && sim.enemy.atb >= 100) {
          sim.enemy.atb = 0;
          sim.enemy.lunge = -6;
          const enrage = sim.enemy.isBoss && sim.bossTimerFrames <= 0 ? 2.2 : 1.0;
          const bastionMit = Math.max(0.5, 1 - (bonuses.barrierBonusPct || 0) * 0.004);
          const hit = Math.max(6, Math.round((idle.enemyDps || 12) * 0.72 * enrage * bastionMit));
          const absorbed = Math.min(sim.heroShield, hit);
          sim.heroShield -= absorbed;
          const net = hit - absorbed;
          sim.heroHp = Math.max(0, sim.heroHp - net);
          sim.heroHurtFlash = 10;

          fx.floaters.push({
            x: hxScreen,
            y: hyScreen - 10,
            vy: -0.45,
            text: net === 0 ? '🛡️' : `-${net}`,
            color: net === 0 ? '#38bdf8' : '#fb7185',
            life: 24,
          });

          if (sim.heroHp <= 0) {
            if (activeRelicIds.has('phoenix_plume') && !sim.phoenixUsedThisLoop) {
              sim.phoenixUsedThisLoop = true;
              sim.heroHp = Math.round(sim.heroMaxHp * 0.35);
              fx.floaters.push({ x: hxScreen, y: hyScreen - 14, vy: -0.5, text: '🔥 PHOENIX REBIRTH!', color: '#fb923c', life: 42 });
            } else if (!sim.pendingClearDispatched) {
              sim.pendingClearDispatched = true;
              sim.phase = 'wipe_pause';
              sim.wipePauseFrames = 55;
              fx.floaters.push({ x: 96, y: 98, vy: -0.4, text: '🌀 60% PORTAL EXTRACT!', color: '#fb7185', life: 52 });
              if (onClear) onClear({ isBossWave: sim.enemy.isBoss, triggerUltimate: false, outcome: 'wipe' });
            }
          }
        }
      }

      // Draw Traveling Hero + Familiar Sprite on exact interpolated loop coordinates
      const rIdx0 = Math.floor(sim.roadProgress) % roadPath.length;
      const rIdx1 = (rIdx0 + 1) % roadPath.length;
      const frac = sim.roadProgress - Math.floor(sim.roadProgress);
      const pt0 = roadPath[rIdx0];
      const pt1 = roadPath[rIdx1];
      const hxGrid = pt0.x + (pt1.x - pt0.x) * frac;
      const hyGrid = pt0.y + (pt1.y - pt0.y) * frac;
      const heroDrawX = Math.floor(ox + hxGrid * cellW + 5 + sim.heroLunge * 0.5);
      const heroDrawY = Math.floor(oy + hyGrid * cellH + 5 + (sim.phase === 'traveling' && animFrame === 1 ? -2 : 0));

      const heroSprite = HERO_SPRITES[g.profile.heroClass] || HERO_SPRITES.hero_knight;
      if (overdrive || fever) {
        ctx!.fillStyle = overdrive ? 'rgba(56, 189, 248, 0.28)' : 'rgba(250, 204, 21, 0.25)';
        ctx!.fillRect(heroDrawX - 2, heroDrawY - 2, 24, 24);
      }
      drawPixelMatrix(ctx!, heroSprite.frames[animFrame], heroSprite.palette, heroDrawX, heroDrawY, 1.8);
      if (sim.heroHurtFlash > 0) {
        ctx!.fillStyle = 'rgba(244, 63, 94, 0.45)';
        ctx!.fillRect(heroDrawX, heroDrawY, 20, 20);
      }

      const pet = g.equippedBySlot?.companion;
      if (pet && COMPANION_SPRITES[pet.spriteKey]) {
        const petSp = COMPANION_SPRITES[pet.spriteKey];
        drawPixelMatrix(ctx!, petSp.frames[animFrame], petSp.palette, heroDrawX + 12, heroDrawY - 6, 1.1);
      }

      // Chain Lightning Canvas Bolt FX
      if (sim.lightningArc && sim.lightningArc.life > 0) {
        ctx!.save();
        ctx!.strokeStyle = sim.lightningArc.life % 2 === 0 ? '#38bdf8' : '#fef08a';
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.moveTo(sim.lightningArc.x1, sim.lightningArc.y1);
        ctx!.lineTo((sim.lightningArc.x1 + sim.lightningArc.x2) / 2, sim.lightningArc.y1 - 18);
        ctx!.lineTo(sim.lightningArc.x2, sim.lightningArc.y2);
        ctx!.stroke();
        ctx!.restore();
      }

      // ==========================================
      // RIGHT TACTICAL TELEMETRY HUD (x: 228..314, y: 20..198)
      // ==========================================
      ctx!.fillStyle = '#0f172a';
      ctx!.fillRect(228, 20, 86, 178);
      ctx!.strokeStyle = 'rgba(148, 163, 184, 0.28)';
      ctx!.lineWidth = 1;
      ctx!.strokeRect(228.5, 20.5, 85, 177);

      // Loop & Greed Multiplier Box
      ctx!.fillStyle = '#1e293b';
      ctx!.fillRect(232, 24, 78, 28);
      ctx!.fillStyle = '#fef08a';
      ctx!.font = 'bold 8px monospace';
      ctx!.fillText(`LOOP #${loop?.loopCount || 1}`, 236, 35);
      ctx!.fillStyle = '#4ade80';
      ctx!.font = 'bold 7px monospace';
      ctx!.fillText(`GREED ×${(loop?.greedMultiplier || 1).toFixed(2)}`, 236, 46);

      // Boss Emergence Threat Meter
      const threat = Math.max(0, Math.min(100, loop?.threatPct || 0));
      ctx!.fillStyle = '#e2e8f0';
      ctx!.font = 'bold 6.5px monospace';
      ctx!.fillText(loop?.bossActive ? '👑 BOSS READY!' : `BOSS ${threat}%`, 234, 63);
      ctx!.fillStyle = '#09090b';
      ctx!.fillRect(233, 66, 76, 6);
      ctx!.fillStyle = loop?.bossActive ? '#ef4444' : '#f59e0b';
      ctx!.fillRect(234, 67, Math.floor(74 * (threat / 100)), 4);

      // Live Clash / Hero HP vs Enemy Preview Box
      ctx!.fillStyle = '#09090b';
      ctx!.fillRect(232, 77, 78, 72);
      ctx!.strokeStyle = sim.phase === 'clash' ? '#fb7185' : '#334155';
      ctx!.strokeRect(232.5, 77.5, 77, 71);

      ctx!.fillStyle = '#cbd5e1';
      ctx!.font = 'bold 6.5px monospace';
      ctx!.fillText(sim.phase === 'clash' ? '⚔️ CLASHING' : '🚶 MARCHING', 236, 87);

      // Hero HP & Shield in Right Panel
      const hpPct = Math.max(0, Math.min(1, sim.heroHp / Math.max(1, sim.heroMaxHp)));
      ctx!.fillStyle = '#1e293b';
      ctx!.fillRect(236, 91, 70, 6);
      ctx!.fillStyle = hpPct > 0.45 ? '#22c55e' : '#ef4444';
      ctx!.fillRect(237, 92, Math.floor(68 * hpPct), 4);
      if (sim.heroShield > 0) {
        ctx!.fillStyle = '#38bdf8';
        ctx!.fillRect(237, 92, Math.floor(68 * Math.min(1, sim.heroShield / Math.max(1, sim.heroMaxHp * 0.5))), 2);
      }

      if (sim.phase === 'clash') {
        const mSp = MONSTER_SPRITES[sim.enemy.key] || MONSTER_SPRITES.slime;
        drawPixelMatrix(ctx!, mSp.frames[animFrame], mSp.palette, 256, 102, 2.2);
        const eRatio = Math.max(0, Math.min(1, sim.enemy.hp / Math.max(1, sim.enemy.maxHp)));
        ctx!.fillStyle = '#1e293b';
        ctx!.fillRect(236, 134, 70, 5);
        ctx!.fillStyle = sim.enemy.isBoss ? '#f59e0b' : '#ef4444';
        ctx!.fillRect(237, 135, Math.floor(68 * eRatio), 3);
      } else {
        ctx!.fillStyle = '#94a3b8';
        ctx!.font = 'bold 6.5px monospace';
        ctx!.fillText(`HP ${sim.heroHp}/${sim.heroMaxHp}`, 236, 112);
        ctx!.fillStyle = '#38bdf8';
        ctx!.fillText(`ULT ${Math.round(sim.ultCharge)}%`, 236, 124);
        ctx!.fillStyle = '#fbbf24';
        ctx!.fillText(`TILES ${boardTiles.length}`, 236, 136);
      }

      // Active Trait Synergies summary at bottom of Right Panel
      const litTraits = (loop?.activeTraits || []).filter((t) => t.count > 0).slice(0, 4);
      ctx!.fillStyle = '#94a3b8';
      ctx!.font = 'bold 6px monospace';
      ctx!.fillText('SYNERGIES:', 233, 160);
      litTraits.forEach((tr, idx) => {
        const tx = 233 + (idx % 2) * 39;
        const ty = 171 + Math.floor(idx / 2) * 12;
        ctx!.fillStyle = tr.tier > 0 ? '#fde047' : '#cbd5e1';
        ctx!.font = 'bold 7px monospace';
        ctx!.fillText(`${tr.icon}${tr.count}`, tx, ty);
      });

      // Top HUD Banner across 320px
      ctx!.fillStyle = 'rgba(9, 9, 11, 0.90)';
      ctx!.fillRect(6, 3, 186, 14);
      ctx!.fillStyle = '#fafafa';
      ctx!.font = 'bold 7.5px monospace';
      ctx!.fillText(`STAGE ${idle.stage} • ${idle.realm.name.slice(0, 14).toUpperCase()}`, 10, 12.5);

      ctx!.fillStyle = overdrive ? 'rgba(14, 165, 233, 0.92)' : cardSel ? 'rgba(16, 185, 129, 0.92)' : 'rgba(15, 23, 42, 0.92)';
      ctx!.fillRect(195, 3, 119, 14);
      ctx!.fillStyle = '#fef08a';
      ctx!.font = 'bold 7px monospace';
      ctx!.fillText(
        cardSel
          ? `TAP GRID: ${cardSel.name.slice(0, 11)}`
          : overdrive
            ? `🔥 ${paceFactor.toFixed(1)}x OVERDRIVE`
            : `⚔️ ${paceFactor.toFixed(1)}x LOOP PACE`,
        199,
        12.5
      );
    }

    function render() {
      frameCount++;
      const { game: g, focusFever: fever } = stateRef.current;
      const animFrame = Math.floor(frameCount / 22) % 2;
      ctx!.imageSmoothingEnabled = false;

      if (g.encounter) {
        renderEncounterArena(g, fever, animFrame, frameCount);
      } else if (g.mode === 'dungeon' && g.dungeon) {
        renderDungeon(g, animFrame);
      } else if (g.idle) {
        renderIdleAutoBattler(g, fever, animFrame, frameCount);
      } else {
        renderVillage(g, animFrame, frameCount);
      }

      drawFloatersAndParticles();
      rafId = window.requestAnimationFrame(render);
    }

    rafId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="pixel-stage rounded-2xl overflow-hidden relative p-1.5">
      <canvas
        ref={canvasRef}
        width={320}
        height={208}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => {
          hoverCellRef.current = null;
        }}
        aria-label="Aethelgard Loop Architect Interactive Grid"
        className="w-full aspect-[320/208] pixel-canvas block rounded-xl cursor-pointer"
      />
    </div>
  );
}
