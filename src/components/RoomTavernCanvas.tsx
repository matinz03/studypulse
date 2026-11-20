import React, { useEffect, useRef, useState } from 'react';
import { COMPANION_SPRITES, HERO_SPRITES, PROP_SPRITES, drawPixelMatrix } from '../game/pixelSprites';
import { RoomOccupant } from '../types';
import { ThemeId, getThemeMeta } from '../themes';

interface RoomTavernCanvasProps {
  occupants: RoomOccupant[];
  currentUserId: number;
  themeId: ThemeId;
}

export function RoomTavernCanvas({ occupants, currentUserId, themeId }: RoomTavernCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => (t + 1) % 60), 420);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const meta = getThemeMeta(themeId);
    const isLight = meta.light;

    ctx.fillStyle = meta.preview.bg;
    ctx.fillRect(0, 0, w, h);

    // Subtle tile floor
    const floorY = 90;
    ctx.fillStyle = isLight ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.03)';
    ctx.fillRect(0, floorY, w, h - floorY);
    for (let x = 0; x < w; x += 24) {
      ctx.fillStyle = isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.03)';
      ctx.fillRect(x, floorY, 12, 16);
      ctx.fillRect(x + 12, floorY + 16, 12, h - floorY - 16);
    }
    ctx.fillStyle = meta.preview.border;
    ctx.fillRect(0, floorY, w, 2);

    // Hearth campfire in center-left
    const camp = PROP_SPRITES.campfire;
    const campFrame = camp.frames[tick % 2];
    const campX = 24;
    const campY = floorY - campFrame.length * 3;
    const glow = ctx.createRadialGradient(campX + 18, campY + 14, 2, campX + 18, campY + 14, 34 + (tick % 3) * 3);
    glow.addColorStop(0, 'rgba(251, 146, 60, 0.35)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 20, 96, 86);
    drawPixelMatrix(ctx, campFrame, camp.palette, campX, campY, 3);

    // Study desks + pixel avatars
    const maxSlots = Math.min(5, Math.max(3, occupants.length));
    const startX = 96;
    const stepX = Math.floor((w - startX - 18) / maxSlots);

    for (let i = 0; i < maxSlots; i++) {
      const deskX = startX + i * stepX;
      const occ = occupants[i];

      // Wooden study desk
      ctx.fillStyle = isLight ? 'rgba(120,53,15,0.22)' : 'rgba(120,53,15,0.55)';
      ctx.fillRect(deskX, floorY - 12, 42, 6);
      ctx.fillRect(deskX + 4, floorY - 6, 4, 8);
      ctx.fillRect(deskX + 34, floorY - 6, 4, 8);

      if (!occ) {
        ctx.fillStyle = meta.preview.border;
        ctx.font = '600 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Open Desk', deskX + 21, floorY - 22);
        continue;
      }

      const heroSprite = HERO_SPRITES[occ.heroClass || 'hero_scholar'] || HERO_SPRITES.hero_scholar;
      const frame = heroSprite.frames[occ.status === 'studying' ? tick % 2 : 0];
      const spriteW = (frame[0]?.length || 12) * 3;
      const spriteH = frame.length * 3;
      const hx = deskX + Math.round((42 - spriteW) / 2);
      const hy = floorY - spriteH - 12;

      if (occ.status === 'studying') {
        const aura = ctx.createRadialGradient(deskX + 21, hy + 14, 2, deskX + 21, hy + 14, 28);
        aura.addColorStop(0, `${meta.colors.accent}55`);
        aura.addColorStop(1, 'transparent');
        ctx.fillStyle = aura;
        ctx.fillRect(deskX - 10, hy - 14, 62, 56);
      }

      drawPixelMatrix(ctx, frame, heroSprite.palette, hx, hy, 3);

      if (occ.companionSpriteKey && COMPANION_SPRITES[occ.companionSpriteKey]) {
        const pet = COMPANION_SPRITES[occ.companionSpriteKey];
        const pf = pet.frames[(tick + 1) % 2];
        drawPixelMatrix(ctx, pf, pet.palette, deskX + 34, floorY - 24 + (tick % 2 === 0 ? 0 : -1), 2);
      }

      // Desk candle
      ctx.fillStyle = occ.status === 'studying' ? meta.colors.accent : '#94a3b8';
      ctx.fillRect(deskX + 6, floorY - 16, 4, 4);

      // Name label
      ctx.textAlign = 'center';
      ctx.fillStyle = occ.userId === currentUserId ? meta.colors.accent : meta.preview.text;
      ctx.font = '700 10px sans-serif';
      const label = occ.displayName.slice(0, 10);
      ctx.fillText(label, deskX + 21, floorY + 14);
      ctx.fillStyle = isLight ? 'rgba(15,23,42,0.55)' : 'rgba(226,232,240,0.65)';
      ctx.font = '600 9px monospace';
      ctx.fillText(occ.status === 'studying' ? 'FOCUS' : occ.status.toUpperCase(), deskX + 21, floorY + 26);
    }
    ctx.textAlign = 'left';
  }, [occupants, currentUserId, themeId, tick]);

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 sp-inset relative z-10 mb-3">
      <canvas
        ref={canvasRef}
        width={460}
        height={132}
        aria-label="Live Pixel Study Tavern"
        className="w-full h-auto block"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
