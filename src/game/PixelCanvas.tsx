import { useEffect, useRef } from 'react';
import { EnemyIntent, GameState, GameTurnEvent } from '../types';
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
  onTileClick?: (tx: number, ty: number) => void;
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

export function PixelCanvas({ game, lastEvents, eventSeq, focusFever, onTileClick }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ game, focusFever });
  stateRef.current = { game, focusFever };

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
    if (!onTileClick || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 320;
    const py = ((e.clientY - rect.top) / rect.height) * 208;

    const g = stateRef.current.game;
    if (g.encounter) return;
    if (g.mode === 'dungeon' && g.dungeon) {
      const tx = Math.floor((px - 17) / 26);
      const ty = Math.floor((py - 24) / 20);
      if (tx >= 0 && tx < 11 && ty >= 0 && ty < 9) onTileClick(tx, ty);
    } else if (g.mode === 'village') {
      const tx = Math.floor((px - 16) / 32);
      const ty = Math.floor((py - 22) / 26);
      if (tx >= 0 && tx < 9 && ty >= 0 && ty < 7) onTileClick(tx, ty);
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

    function render() {
      frameCount++;
      const { game: g, focusFever: fever } = stateRef.current;
      const animFrame = Math.floor(frameCount / 22) % 2;
      ctx!.imageSmoothingEnabled = false;

      if (g.encounter) {
        renderEncounterArena(g, fever, animFrame, frameCount);
      } else if (g.mode === 'dungeon' && g.dungeon) {
        renderDungeon(g, animFrame);
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
        aria-label="Pixel Spire Dungeon Viewport"
        className="w-full aspect-[320/208] pixel-canvas block rounded-xl cursor-pointer"
      />
    </div>
  );
}
