import { useEffect, useRef } from 'react';
import { GameState, GameTurnEvent } from '../types';
import {
  BIOME_PALETTES,
  COMPANION_SPRITES,
  HERO_SPRITES,
  MONSTER_SPRITES,
  PROP_SPRITES,
  drawPixelMatrix,
} from './pixelSprites';

interface PixelCanvasProps {
  game: GameState;
  lastEvents: GameTurnEvent[];
  eventSeq: number;
  focusFever: boolean;
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
};

export function PixelCanvas({ game, lastEvents, eventSeq, focusFever }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ game, focusFever });
  stateRef.current = { game, focusFever };

  const fxRef = useRef({
    heroLunge: 0,
    heroFlash: 0,
    enemyShake: 0,
    guardPulse: 0,
    lootBeamLife: 0,
    lootBeamColor: '#fbbf24',
    floaters: [] as FloatingText[],
    particles: [] as Particle[],
  });

  useEffect(() => {
    if (!eventSeq || !lastEvents.length) return;
    const fx = fxRef.current;
    for (const ev of lastEvents) {
      const targetX = ev.target === 'enemy' ? 222 : 84;
      const targetY = 86;

      if (ev.kind === 'hit' || ev.kind === 'crit') {
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
            y: 102,
            vx: (Math.random() - 0.5) * 3.4,
            vy: (Math.random() - 0.8) * 2.8,
            color: ev.kind === 'crit' ? '#facc15' : '#f87171',
            life: 24 + Math.random() * 10,
            size: ev.kind === 'crit' ? 3 : 2,
          });
        }
      } else if (ev.kind === 'enemy_hit') {
        fx.heroFlash = 14;
        fx.floaters.push({
          x: targetX,
          y: targetY - 10,
          vy: -0.5,
          text: ev.text || `-${ev.value}`,
          color: '#fb7185',
          life: 44,
        });
      } else if (ev.kind === 'guard') {
        fx.guardPulse = 26;
        fx.floaters.push({ x: 84, y: 72, vy: -0.45, text: ev.text || 'GUARD', color: '#38bdf8', life: 44 });
      } else if (ev.kind === 'heal') {
        fx.floaters.push({ x: 84, y: 74, vy: -0.45, text: ev.text || '+HP', color: '#4ade80', life: 48 });
      } else if (ev.kind === 'dodge') {
        fx.heroLunge = -10;
        fx.floaters.push({ x: 84, y: 72, vy: -0.5, text: 'DODGE!', color: '#a5f3fc', life: 42 });
      } else if (ev.kind === 'loot') {
        fx.lootBeamLife = 55;
        const rarMatch = String(ev.text || '').toLowerCase();
        const foundKey = Object.keys(RARITY_COLORS).find((k) => rarMatch.includes(k));
        fx.lootBeamColor = foundKey ? RARITY_COLORS[foundKey] : '#fbbf24';
        fx.floaters.push({ x: 220, y: 66, vy: -0.42, text: ev.text || 'LOOT!', color: fx.lootBeamColor, life: 56 });
        for (let i = 0; i < 18; i++) {
          fx.particles.push({
            x: 222,
            y: 108,
            vx: (Math.random() - 0.5) * 3.8,
            vy: -Math.random() * 3.4,
            color: fx.lootBeamColor,
            life: 32,
            size: 3,
          });
        }
      }
    }
  }, [eventSeq, lastEvents]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let frameCount = 0;

    const dust = Array.from({ length: 14 }, (_, i) => ({
      x: (i * 23) % 320,
      y: 25 + ((i * 19) % 105),
      speed: 0.12 + (i % 3) * 0.08,
    }));

    function drawTorch(tx: number, ty: number, frame: number, glowColor: string) {
      ctx!.fillStyle = '#78350f';
      ctx!.fillRect(tx, ty + 4, 4, 12);
      ctx!.fillStyle = frame === 0 ? '#f97316' : '#fbbf24';
      ctx!.fillRect(tx - 1, ty, 6, 5);
      ctx!.fillStyle = '#fef08a';
      ctx!.fillRect(tx + 1, ty + (frame === 0 ? -2 : 0), 2, 3);
      ctx!.fillStyle = `${glowColor}22`;
      ctx!.fillRect(tx - 9, ty - 8, 22, 22);
    }

    function render() {
      frameCount++;
      const { game: g, focusFever: fever } = stateRef.current;
      const fx = fxRef.current;
      const biome = BIOME_PALETTES[g.biome.key] || BIOME_PALETTES.moss_library;
      const animFrame = Math.floor(frameCount / 22) % 2;

      ctx!.imageSmoothingEnabled = false;

      // Sky & Back Brick Wall
      ctx!.fillStyle = biome.bg;
      ctx!.fillRect(0, 0, 320, 180);

      for (let row = 0; row < 6; row++) {
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

      // Arched Dungeon Window Accent in Center-Back
      ctx!.fillStyle = biome.mortar;
      ctx!.fillRect(136, 26, 48, 54);
      ctx!.fillStyle = biome.accent + '22';
      ctx!.fillRect(142, 32, 36, 42);
      ctx!.fillStyle = biome.mortar;
      ctx!.fillRect(158, 32, 4, 42);
      ctx!.fillRect(142, 50, 36, 4);

      // Flickering Wall Torches
      drawTorch(36, 52, animFrame, biome.torchGlow);
      drawTorch(280, 52, 1 - animFrame, biome.torchGlow);

      // Stone Perspective Floor
      ctx!.fillStyle = biome.floorA;
      ctx!.fillRect(0, 114, 320, 66);
      for (let fy = 114; fy < 180; fy += 16) {
        for (let fxTile = 0; fxTile < 320; fxTile += 32) {
          const checker = ((fy / 16 + fxTile / 32) & 1) === 0;
          ctx!.fillStyle = checker ? biome.floorA : biome.floorB;
          ctx!.fillRect(fxTile, fy, 32, 16);
        }
      }
      ctx!.fillStyle = biome.mortar;
      ctx!.fillRect(0, 114, 320, 3);

      // Drifting Dust Motes
      for (const d of dust) {
        d.y -= d.speed;
        if (d.y < 14) d.y = 112;
        ctx!.fillStyle = biome.accent + '55';
        ctx!.fillRect(Math.floor(d.x), Math.floor(d.y), 2, 2);
      }

      // Hero Positioning & Kinetic Offsets
      if (fx.heroLunge > 0) fx.heroLunge = Math.max(0, fx.heroLunge - 1.2);
      if (fx.heroLunge < 0) fx.heroLunge = Math.min(0, fx.heroLunge + 1.2);
      if (fx.heroFlash > 0) fx.heroFlash--;
      if (fx.enemyShake > 0) fx.enemyShake--;
      if (fx.guardPulse > 0) fx.guardPulse--;
      if (fx.lootBeamLife > 0) fx.lootBeamLife--;

      const heroSprite = HERO_SPRITES[g.profile.heroClass] || HERO_SPRITES.hero_scholar;
      const heroX = Math.floor(72 + fx.heroLunge);
      const heroY = Math.floor(92 + (animFrame === 1 ? -1 : 0));

      // Ground Shadows
      ctx!.fillStyle = 'rgba(0,0,0,0.45)';
      ctx!.fillRect(heroX + 3, 128, 30, 5);
      ctx!.fillRect(208, 128, 34, 5);

      // Focus Fever Golden Aura
      if (fever) {
        ctx!.fillStyle = 'rgba(250, 204, 21, 0.22)';
        ctx!.fillRect(heroX - 4, heroY - 3, 44, 42);
      }

      // Companion Sprite Floating Behind Hero
      const pet = g.equippedBySlot?.companion;
      if (pet && COMPANION_SPRITES[pet.spriteKey]) {
        const petSprite = COMPANION_SPRITES[pet.spriteKey];
        const py = Math.floor(76 + Math.sin(frameCount * 0.08) * 3);
        drawPixelMatrix(ctx!, petSprite.frames[animFrame], petSprite.palette, heroX - 24, py, 2);
      }

      // Draw Hero
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

      // Loot Rarity Sky Beam
      if (fx.lootBeamLife > 0) {
        ctx!.fillStyle = fx.lootBeamColor + '38';
        ctx!.fillRect(216, 0, 18, 130);
        ctx!.fillStyle = fx.lootBeamColor + '88';
        ctx!.fillRect(223, 0, 4, 130);
      }

      // Draw Encounter Entity or Campfire
      const enc = g.encounter;
      const shakeOffset = fx.enemyShake > 0 ? ((fx.enemyShake % 4 < 2 ? -3 : 3)) : 0;
      if (enc?.type === 'combat' && enc.enemy) {
        const mSprite = MONSTER_SPRITES[enc.enemy.key] || MONSTER_SPRITES.slime;
        const scale = enc.isBoss ? 3.5 : 3;
        const mx = Math.floor(208 + shakeOffset);
        const my = Math.floor((enc.isBoss ? 88 : 94) + (animFrame === 1 ? -1 : 0));
        drawPixelMatrix(ctx!, mSprite.frames[animFrame], mSprite.palette, mx, my, Math.round(scale));

        // Enemy HP Mini-Bar directly above Monster
        const barW = 46;
        const hpRatio = Math.max(0, Math.min(1, enc.enemy.hp / Math.max(1, enc.enemy.maxHp)));
        ctx!.fillStyle = '#09090b';
        ctx!.fillRect(202, my - 10, barW + 2, 6);
        ctx!.fillStyle = enc.isBoss ? '#f59e0b' : '#ef4444';
        ctx!.fillRect(203, my - 9, Math.floor(barW * hpRatio), 4);

        if (enc.charging && animFrame === 0) {
          ctx!.fillStyle = '#ef4444';
          ctx!.font = 'bold 8px monospace';
          ctx!.fillText('! HEAVY !', 202, my - 14);
        }
      } else if (enc?.type === 'chest') {
        const chest = PROP_SPRITES.chest;
        drawPixelMatrix(ctx!, chest.frames[animFrame], chest.palette, 212, 102, 3);
      } else if (enc?.type === 'shrine') {
        const shrine = PROP_SPRITES.shrine;
        drawPixelMatrix(ctx!, shrine.frames[animFrame], shrine.palette, 212, 98, 3);
      } else if (enc?.type === 'merchant') {
        const merch = PROP_SPRITES.merchant;
        drawPixelMatrix(ctx!, merch.frames[animFrame], merch.palette, 212, 98, 3);
      } else {
        const camp = PROP_SPRITES.campfire;
        drawPixelMatrix(ctx!, camp.frames[animFrame], camp.palette, 212, 102, 3);
      }

      // Top Corner Pixel Room Plate
      ctx!.fillStyle = 'rgba(9, 9, 11, 0.72)';
      ctx!.fillRect(6, 6, 98, 16);
      ctx!.fillStyle = '#fafafa';
      ctx!.font = 'bold 8px monospace';
      ctx!.fillText(`FL ${g.profile.floor} • ROOM ${g.profile.roomIndex}/5`, 11, 17);

      if (fever) {
        ctx!.fillStyle = 'rgba(245, 158, 11, 0.85)';
        ctx!.fillRect(228, 6, 86, 15);
        ctx!.fillStyle = '#09090b';
        ctx!.fillText('FOCUS FEVER!', 234, 16);
      }

      // Particles
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

      // Floating Pixel Damage & Event Labels
      ctx!.font = 'bold 10px monospace';
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
        height={180}
        aria-label="Pixel Spire Dungeon Viewport"
        className="w-full aspect-[16/9] pixel-canvas block rounded-xl"
      />
    </div>
  );
}
