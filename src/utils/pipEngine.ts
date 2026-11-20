import { ThemeId, UiThemeMeta, getThemeMeta } from '../themes';
import { TimerMode } from '../types';
import {
  BIOME_PALETTES,
  COMPANION_SPRITES,
  HERO_SPRITES,
  PROP_SPRITES,
  drawPixelMatrix,
} from '../game/pixelSprites';

export type PipFocusStateKey =
  | 'resting'
  | 'break'
  | 'paused'
  | 'distracted'
  | 'spark'
  | 'locked'
  | 'flow'
  | 'apex';

export interface PipFocusStateInfo {
  key: PipFocusStateKey;
  label: string;
  shortLabel: string;
  tier: number;
  glowColor: string;
}

export interface PipTimerState {
  clockText: string;
  subjectName: string;
  subjectColor: string;
  taskTitle: string;
  modeLabel: string;
  isRunning: boolean;
  progress: number;
  purityPct: number;
  timerMode: TimerMode;
  elapsedSec: number;
  themeId: ThemeId;
  heroClass: string;
  companionSpriteKey: string | null;
  heroLevel: number;
  focusFever: boolean;
  biomeKey: string;
  activeTaskId?: number | null;
  pendingTasksCount?: number;
  roomPeersCount?: number;
  roomName?: string;
  toastText?: string | null;
}

export interface PipActions {
  onToggleRun: () => void;
  onBoost5m: () => void;
  onFinish: () => void;
  onCompleteTask?: () => void;
}

interface DocumentPictureInPictureApi {
  requestWindow: (opts?: { width?: number; height?: number }) => Promise<Window>;
}

const DEFAULT_STATE: PipTimerState = {
  clockText: '25:00',
  subjectName: 'Deep Focus',
  subjectColor: '#10B981',
  taskTitle: '',
  modeLabel: 'Pomodoro',
  isRunning: false,
  progress: 0,
  purityPct: 100,
  timerMode: 'pomodoro',
  elapsedSec: 0,
  themeId: 'shadcn-dark',
  heroClass: 'hero_scholar',
  companionSpriteKey: null,
  heroLevel: 1,
  focusFever: false,
  biomeKey: 'moss_library',
  activeTaskId: null,
  pendingTasksCount: 0,
  roomPeersCount: 0,
  roomName: '',
  toastText: null,
};

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.trim();
  if (!clean.startsWith('#')) {
    return hex;
  }
  const body = clean.slice(1);
  const full =
    body.length === 3
      ? body
          .split('')
          .map((c) => c + c)
          .join('')
      : body.slice(0, 6);
  const num = Number.parseInt(full, 16);
  if (Number.isNaN(num)) {
    return `rgba(255,255,255,${alpha})`;
  }
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getPipFocusState(s: PipTimerState, meta?: UiThemeMeta): PipFocusStateInfo {
  const theme = meta || getThemeMeta(s.themeId);
  const accent = theme.colors.accent || s.subjectColor || '#38bdf8';
  const accent2 = theme.colors.accent2 || '#34d399';

  if (s.timerMode === 'break') {
    return {
      key: 'break',
      label: 'Break Recharge',
      shortLabel: 'BREAK',
      tier: 0,
      glowColor: '#22d3ee',
    };
  }
  if (!s.isRunning) {
    if (s.elapsedSec > 0) {
      return {
        key: 'paused',
        label: 'Session Paused',
        shortLabel: 'PAUSED',
        tier: 0,
        glowColor: '#94a3b8',
      };
    }
    return {
      key: 'resting',
      label: 'Campfire Idle',
      shortLabel: 'CAMPFIRE',
      tier: 0,
      glowColor: '#fb923c',
    };
  }
  if (s.purityPct < 80) {
    return {
      key: 'distracted',
      label: 'Focus Shaken!',
      shortLabel: 'SHAKEN',
      tier: 1,
      glowColor: '#f43f5e',
    };
  }
  if (s.focusFever || s.elapsedSec >= 2700) {
    return {
      key: 'apex',
      label: s.focusFever ? 'Focus Fever Apex' : 'Lv.4 Apex Flow',
      shortLabel: s.focusFever ? 'FEVER APEX' : 'LV.4 APEX',
      tier: 4,
      glowColor: '#fbbf24',
    };
  }
  if (s.elapsedSec >= 1500) {
    return {
      key: 'flow',
      label: 'Lv.3 Deep Flow',
      shortLabel: 'LV.3 FLOW',
      tier: 3,
      glowColor: accent2,
    };
  }
  if (s.elapsedSec >= 600) {
    return {
      key: 'locked',
      label: 'Lv.2 Locked In',
      shortLabel: 'LV.2 LOCKED',
      tier: 2,
      glowColor: accent,
    };
  }
  return {
    key: 'spark',
    label: 'Lv.1 Spark',
    shortLabel: 'LV.1 SPARK',
    tier: 1,
    glowColor: accent,
  };
}

function resolveHeroSprite(heroClass: string) {
  return HERO_SPRITES[heroClass] || HERO_SPRITES.hero_scholar;
}

function renderPipCharacterBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: PipTimerState,
  tick: number,
  meta: UiThemeMeta,
  focus: PipFocusStateInfo
) {
  const isLight = meta.light;
  const biome = BIOME_PALETTES[s.biomeKey] || BIOME_PALETTES.moss_library;

  // Base theme canvas fill
  ctx.fillStyle = meta.preview.bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle architectural grid
  const gridStep = Math.max(14, Math.round(h / 10));
  ctx.strokeStyle = isLight ? hexToRgba(meta.preview.text, 0.045) : hexToRgba('#ffffff', 0.04);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = gridStep; gx < w; gx += gridStep) {
    ctx.moveTo(gx + 0.5, 0);
    ctx.lineTo(gx + 0.5, h);
  }
  for (let gy = gridStep; gy < h; gy += gridStep) {
    ctx.moveTo(0, gy + 0.5);
    ctx.lineTo(w, gy + 0.5);
  }
  ctx.stroke();

  // Character stage center-right
  const heroScale = Math.max(4, Math.round(h / 34));
  const heroSprite = resolveHeroSprite(s.heroClass);
  const frameIdx = focus.key === 'paused' ? 0 : Math.floor(tick / 3) % 2;
  const heroMatrix = heroSprite.frames[frameIdx];
  const heroCols = heroMatrix[0]?.length || 12;
  const heroRows = heroMatrix.length || 12;
  const heroW = heroCols * heroScale;
  const heroH = heroRows * heroScale;

  const floorY = Math.round(h * 0.78);
  const stageCenterX = Math.round(w * 0.78);
  const shakeX = focus.key === 'distracted' ? ((tick % 2) * 2 - 1) * 2 : 0;
  let floatY = 0;
  if (focus.key === 'flow') {
    floatY = Math.round(Math.sin(tick * 0.45) * 3) - 2;
  } else if (focus.key === 'apex') {
    floatY = Math.round(Math.sin(tick * 0.55) * 3) - 5;
  } else if (focus.key === 'spark' || focus.key === 'locked') {
    floatY = frameIdx === 1 ? -2 : 0;
  }

  const heroX = Math.round(stageCenterX - heroW / 2) + shakeX;
  const heroY = floorY - heroH + floatY;

  // Stage spotlight radial behind character
  const glowRadius = Math.round(h * (focus.key === 'apex' ? 0.85 : focus.key === 'flow' ? 0.72 : 0.6));
  const stageGlow = ctx.createRadialGradient(
    stageCenterX,
    floorY - heroH * 0.5,
    4,
    stageCenterX,
    floorY - heroH * 0.5,
    glowRadius
  );
  const baseGlowAlpha = isLight ? 0.24 : 0.32;
  stageGlow.addColorStop(
    0,
    hexToRgba(focus.glowColor, focus.key === 'paused' ? 0.08 : baseGlowAlpha + focus.tier * 0.04)
  );
  stageGlow.addColorStop(0.55, hexToRgba(meta.colors.accent, isLight ? 0.08 : 0.12));
  stageGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = stageGlow;
  ctx.fillRect(0, 0, w, h);

  // Energy pillar beam behind hero during Flow / Apex
  if (focus.key === 'flow' || focus.key === 'apex') {
    const beamW = heroW * (focus.key === 'apex' ? 1.55 : 1.15);
    const beamGrad = ctx.createLinearGradient(stageCenterX, 0, stageCenterX, floorY);
    beamGrad.addColorStop(0, 'transparent');
    beamGrad.addColorStop(0.45, hexToRgba(focus.glowColor, focus.key === 'apex' ? 0.24 : 0.14));
    beamGrad.addColorStop(1, hexToRgba(meta.colors.accent, 0.22));
    ctx.fillStyle = beamGrad;
    ctx.fillRect(Math.round(stageCenterX - beamW / 2), 0, Math.round(beamW), floorY);
  }

  // Pixel floor strip with subtle biome flavor blended into active UI theme
  const floorHeight = h - floorY;
  ctx.fillStyle = isLight ? hexToRgba(meta.preview.text, 0.055) : hexToRgba(biome.floorA, 0.7);
  ctx.fillRect(0, floorY, w, floorHeight);

  const tileW = heroScale * 4;
  ctx.fillStyle = isLight ? hexToRgba(meta.colors.accent, 0.07) : hexToRgba(biome.floorB, 0.55);
  for (let tx = 0; tx < w; tx += tileW * 2) {
    ctx.fillRect(tx, floorY, tileW, Math.min(8, floorHeight));
    ctx.fillRect(tx + tileW, floorY + 8, tileW, Math.max(0, floorHeight - 8));
  }

  // Crisp horizon hairline illuminated around character
  const lineGrad = ctx.createLinearGradient(0, floorY, w, floorY);
  lineGrad.addColorStop(0, meta.preview.border);
  lineGrad.addColorStop(0.65, hexToRgba(focus.glowColor, 0.45));
  lineGrad.addColorStop(0.85, hexToRgba(focus.glowColor, 0.85));
  lineGrad.addColorStop(1, meta.preview.border);
  ctx.fillStyle = lineGrad;
  ctx.fillRect(0, floorY, w, 2);

  // Rune rings / aura floor plate under hero during active focus tiers
  if (focus.tier >= 2) {
    ctx.save();
    ctx.strokeStyle = hexToRgba(focus.glowColor, focus.key === 'apex' ? 0.85 : 0.58);
    ctx.lineWidth = focus.key === 'apex' ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.ellipse(stageCenterX, floorY + 2, heroW * 0.72, Math.max(4, heroScale * 1.4), 0, 0, Math.PI * 2);
    ctx.stroke();
    if (focus.tier >= 3) {
      ctx.strokeStyle = hexToRgba(meta.colors.accent2, 0.5);
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(stageCenterX, floorY + 2, heroW * 0.96, Math.max(6, heroScale * 2.1), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Campfire beside hero during resting / break states
  if (focus.key === 'resting' || focus.key === 'break') {
    const campScale = Math.max(3, heroScale - 1);
    const campSprite = PROP_SPRITES.campfire;
    const campFrame = campSprite.frames[Math.floor(tick / 3) % 2];
    const campW = (campFrame[0]?.length || 12) * campScale;
    const campH = campFrame.length * campScale;
    const campX = Math.max(Math.round(w * 0.56), heroX - campW - heroScale * 2);
    const campY = floorY - campH + 1;

    const firePulse = 24 + (tick % 4) * 3;
    const fireGlow = ctx.createRadialGradient(
      campX + campW / 2,
      campY + campH * 0.45,
      2,
      campX + campW / 2,
      campY + campH * 0.45,
      firePulse
    );
    fireGlow.addColorStop(0, hexToRgba(focus.key === 'break' ? '#22d3ee' : '#fb923c', 0.42));
    fireGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = fireGlow;
    ctx.fillRect(campX - firePulse, campY - firePulse, campW + firePulse * 2, campH + firePulse * 2);

    drawPixelMatrix(ctx, campFrame, campSprite.palette, campX, campY, campScale);
  }

  // Soft elliptical shadow beneath hero
  const shadowShrink = Math.max(0.55, 1 - Math.abs(floatY) * 0.05);
  ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.16)' : 'rgba(0, 0, 0, 0.44)';
  ctx.beginPath();
  ctx.ellipse(
    stageCenterX + shakeX,
    floorY + 2,
    (heroW * 0.44) * shadowShrink,
    Math.max(3, heroScale * 0.85 * shadowShrink),
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Hero character sprite
  if (focus.key === 'paused') {
    ctx.save();
    ctx.globalAlpha = 0.72;
    drawPixelMatrix(ctx, heroMatrix, heroSprite.palette, heroX, heroY, heroScale);
    ctx.restore();
  } else {
    drawPixelMatrix(ctx, heroMatrix, heroSprite.palette, heroX, heroY, heroScale);
  }

  // Equipped Companion sprite next to hero
  if (s.companionSpriteKey && COMPANION_SPRITES[s.companionSpriteKey]) {
    const compSprite = COMPANION_SPRITES[s.companionSpriteKey];
    const compScale = Math.max(2, Math.round(heroScale * 0.68));
    const compMatrix = compSprite.frames[Math.floor((tick + 1) / 3) % 2];
    const compCols = compMatrix[0]?.length || 8;
    const compRows = compMatrix.length || 8;
    const compW = compCols * compScale;
    const compH = compRows * compScale;
    const compBob = focus.key === 'paused' ? 0 : Math.round(Math.sin(tick * 0.55 + 1.2) * 2);
    const compX = Math.min(w - compW - 8, heroX + heroW + Math.max(4, Math.round(heroScale * 0.8)));
    const compY = floorY - compH - Math.max(2, Math.round(heroScale * 1.4)) + compBob;

    ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.12)' : 'rgba(0, 0, 0, 0.34)';
    ctx.beginPath();
    ctx.ellipse(compX + compW / 2, floorY + 2, compW * 0.36, Math.max(2, compScale * 0.6), 0, 0, Math.PI * 2);
    ctx.fill();

    drawPixelMatrix(ctx, compMatrix, compSprite.palette, compX, compY, compScale);
  }

  // State-specific pixel VFX overlay (sparks, crown, Zzz, or ! warning)
  const px = Math.max(2, Math.round(heroScale * 0.7));
  if (focus.key === 'paused') {
    const drift = tick % 10;
    ctx.fillStyle = hexToRgba(meta.preview.text, 0.7);
    ctx.font = `800 ${Math.max(10, heroScale * 2)}px monospace`;
    ctx.fillText('z', heroX + heroW - 4, heroY - 4 - drift);
    ctx.fillText('Z', heroX + heroW + 6, heroY - 12 - ((drift + 5) % 10));
  } else if (focus.key === 'distracted') {
    const bounce = tick % 2 === 0 ? -3 : 0;
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(stageCenterX - px, heroY - heroScale * 3 + bounce, px * 2, px * 3);
    ctx.fillRect(stageCenterX - px, heroY - heroScale + bounce, px * 2, px);
  } else {
    const count =
      focus.key === 'apex' ? 10 : focus.key === 'flow' ? 7 : focus.key === 'locked' ? 5 : 3;
    for (let i = 0; i < count; i++) {
      const phase = (tick * 0.45 + i * 2.1) % 12;
      const offsetX = Math.sin(i * 2.3 + tick * 0.25) * (heroW * 0.68);
      const particleX = Math.round(stageCenterX + offsetX);
      const particleY = Math.round(floorY - 6 - (phase / 12) * (heroH + heroScale * 4));
      ctx.fillStyle =
        focus.key === 'apex'
          ? i % 2 === 0
            ? '#fbbf24'
            : meta.colors.accent
          : focus.key === 'resting'
            ? i % 2 === 0
              ? '#fb923c'
              : '#fde047'
            : focus.key === 'break'
              ? '#22d3ee'
              : i % 2 === 0
                ? focus.glowColor
                : meta.colors.accent2;
      ctx.globalAlpha = Math.max(0.18, 1 - phase / 12);
      ctx.fillRect(particleX, particleY, px, px);
    }
    ctx.globalAlpha = 1;

    // Apex golden crown pixel glint above hero
    if (focus.key === 'apex') {
      const crownY = heroY - px * 3;
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(stageCenterX - px * 2, crownY, px, px);
      ctx.fillRect(stageCenterX, crownY - px, px, px * 2);
      ctx.fillRect(stageCenterX + px * 2, crownY, px, px);
      ctx.fillRect(stageCenterX - px * 2, crownY + px, px * 5, px);
    }
  }

  // Left-to-right readability scrim so foreground clock/task/buttons stay razor sharp
  const scrim = ctx.createLinearGradient(0, 0, w, 0);
  scrim.addColorStop(0, hexToRgba(meta.preview.bg, isLight ? 0.96 : 0.94));
  scrim.addColorStop(0.46, hexToRgba(meta.preview.bg, isLight ? 0.88 : 0.84));
  scrim.addColorStop(0.66, hexToRgba(meta.preview.bg, isLight ? 0.44 : 0.42));
  scrim.addColorStop(0.86, hexToRgba(meta.preview.bg, 0.04));
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, w, h);
}

export function renderCanvasHudToContext(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: PipTimerState,
  tick: number
) {
  const meta = getThemeMeta(s.themeId);
  const focus = getPipFocusState(s, meta);
  const isLight = meta.light;
  const mutedInk = hexToRgba(meta.preview.text, isLight ? 0.65 : 0.68);
  const pillBg = isLight ? hexToRgba(meta.preview.text, 0.06) : hexToRgba('#ffffff', 0.08);
  const pillBorder = meta.preview.border;

  ctx.save();
  ctx.fillStyle = meta.preview.bg;
  ctx.fillRect(0, 0, w, h);

  // Rounded outer themed HUD frame with animated pixel hero stage inside
  const pad = Math.max(8, Math.round(h * 0.045));
  const radius = Math.max(12, Math.round(h * 0.08));
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, radius);
  ctx.clip();
  renderPipCharacterBackdrop(ctx, w, h, s, tick, meta, focus);
  ctx.restore();

  // Outer hairline border + subtle top gloss
  ctx.strokeStyle = meta.preview.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, radius);
  ctx.stroke();

  const innerLeft = pad + 18;
  const topY = pad + 14;
  const headerH = 26;

  // Subject badge pill (top-left)
  const subLabel = `${s.modeLabel} • ${s.subjectName}`.slice(0, 24);
  ctx.font = '700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const subTextW = Math.min(Math.round(w * 0.44), ctx.measureText(subLabel).width);
  const subPillW = subTextW + 30;
  ctx.fillStyle = pillBg;
  ctx.strokeStyle = pillBorder;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(innerLeft, topY, subPillW, headerH, 999);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = s.subjectColor || meta.colors.accent;
  ctx.beginPath();
  ctx.arc(innerLeft + 13, topY + headerH / 2, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = meta.preview.text;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(subLabel, innerLeft + 24, topY + headerH / 2 + 0.5, subTextW + 2);

  // Focus state & purity pill (top-right)
  const statusLabel = `${focus.shortLabel} · ${s.purityPct}%`;
  ctx.font = '700 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const statusW = Math.ceil(ctx.measureText(statusLabel).width) + 34;
  const statusX = w - pad - 16 - statusW;
  ctx.fillStyle = isLight ? hexToRgba(meta.preview.card, 0.9) : hexToRgba(meta.preview.bg, 0.8);
  ctx.strokeStyle = hexToRgba(focus.glowColor, 0.55);
  ctx.beginPath();
  ctx.roundRect(statusX, topY, statusW, headerH, 999);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = focus.glowColor;
  ctx.beginPath();
  ctx.arc(statusX + 12, topY + headerH / 2, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = meta.preview.text;
  ctx.textAlign = 'right';
  ctx.fillText(statusLabel, w - pad - 27, topY + headerH / 2 + 0.5);

  // Large left-aligned clock so pixel character stands unobscured on the right
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = meta.preview.text;
  const clockSize = Math.max(36, Math.round(h * 0.25));
  ctx.font = `800 ${clockSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillText(s.clockText, innerLeft, Math.round(h * 0.56));

  // Focus State subtitle + Task line
  ctx.fillStyle = focus.glowColor;
  ctx.font = '700 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(`Hero Lv.${Math.max(1, s.heroLevel)} · ${focus.label}`, innerLeft, Math.round(h * 0.67));

  ctx.fillStyle = mutedInk;
  ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const taskLine = (s.taskTitle || (s.isRunning ? 'Stay locked in' : 'Ready to focus')).slice(0, 32);
  ctx.fillText(taskLine, innerLeft, Math.round(h * 0.77), Math.round(w * 0.54));

  // Optional Room Peers indicator or Floating Loot/Milestone Toast on right corner
  if (s.toastText) {
    const toastStr = s.toastText.slice(0, 26);
    ctx.font = '800 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const tw = Math.ceil(ctx.measureText(toastStr).width) + 20;
    const tx = w - pad - 16 - tw;
    const ty = Math.round(h * 0.23);
    ctx.fillStyle = isLight ? hexToRgba(meta.preview.card, 0.94) : hexToRgba(meta.preview.bg, 0.88);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(tx, ty, tw, 22, 999);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(toastStr, tx + tw / 2, ty + 11.5);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  } else if ((s.roomPeersCount || 0) > 0) {
    const peerStr = `👥 ${s.roomPeersCount} live`;
    ctx.font = '700 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const pw = Math.ceil(ctx.measureText(peerStr).width) + 16;
    const px = w - pad - 16 - pw;
    const py = Math.round(h * 0.23);
    ctx.fillStyle = pillBg;
    ctx.strokeStyle = pillBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(px, py, pw, 20, 999);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = mutedInk;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(peerStr, px + pw / 2, py + 10.5);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  // Bottom progress track
  const barY = h - pad - 20;
  const barW = w - (pad + 18) * 2;
  ctx.fillStyle = meta.colors.track;
  ctx.beginPath();
  ctx.roundRect(innerLeft, barY, barW, 8, 4);
  ctx.fill();

  const pct = Math.min(1, Math.max(0.03, s.progress));
  const barGrad = ctx.createLinearGradient(innerLeft, barY, innerLeft + barW, barY);
  barGrad.addColorStop(0, meta.preview.primary);
  barGrad.addColorStop(1, focus.glowColor);
  ctx.fillStyle = barGrad;
  ctx.beginPath();
  ctx.roundRect(innerLeft, barY, Math.max(12, barW * pct), 8, 4);
  ctx.fill();

  ctx.restore();
}

class FloatingPipEngine {
  private docPipWin: Window | null = null;
  private docPipRaf: number | null = null;
  private docPipLastDraw = 0;
  private videoEl: HTMLVideoElement | null = null;
  private canvasEl: HTMLCanvasElement | null = null;
  private videoTimerId: number | null = null;
  private stream: MediaStream | null = null;
  private activeKind: 'none' | 'doc' | 'video' = 'none';
  private animTick = 0;
  private latestState: PipTimerState = { ...DEFAULT_STATE };
  private actions: PipActions = {
    onToggleRun: () => {},
    onBoost5m: () => {},
    onFinish: () => {},
  };
  private listeners = new Set<(active: boolean) => void>();

  isSupported() {
    if (typeof window === 'undefined') return false;
    const hasDocPip = 'documentPictureInPicture' in window;
    const hasVideoPip =
      typeof document !== 'undefined' &&
      'pictureInPictureEnabled' in document &&
      Boolean((document as Document).pictureInPictureEnabled);
    return hasDocPip || hasVideoPip;
  }

  isActive() {
    return this.activeKind !== 'none';
  }

  getLatestState(): PipTimerState {
    return { ...this.latestState };
  }

  getFocusState(): PipFocusStateInfo {
    return getPipFocusState(this.latestState);
  }

  renderCompositePreview(
    canvas: HTMLCanvasElement,
    overrideState?: Partial<PipTimerState>,
    tick = 4
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const merged: PipTimerState = { ...this.latestState, ...overrideState };
    renderCanvasHudToContext(ctx, canvas.width, canvas.height, merged, tick);
  }

  onChange(cb: (active: boolean) => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private emit() {
    const active = this.isActive();
    for (const cb of this.listeners) cb(active);
  }

  setActions(actions: PipActions) {
    this.actions = actions;
    this.bindMediaSessionHandlers();
  }

  updateState(next: Partial<PipTimerState>) {
    this.latestState = { ...this.latestState, ...next };
    if (this.activeKind === 'doc') {
      this.renderDocPip(true);
    } else if (this.activeKind === 'video') {
      this.renderCanvasHud();
    }
    this.updateMediaSessionMetadata();
  }

  async toggle(actions: PipActions): Promise<boolean> {
    this.setActions(actions);
    if (this.isActive()) {
      await this.close();
      return false;
    }
    return this.open();
  }

  async open(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const docPip = (window as unknown as { documentPictureInPicture?: DocumentPictureInPictureApi })
      .documentPictureInPicture;

    if (docPip?.requestWindow) {
      try {
        const win = await docPip.requestWindow({ width: 384, height: 176 });
        this.docPipWin = win;
        this.activeKind = 'doc';
        this.setupDocPipDom(win);
        this.renderDocPip(true);
        this.startDocPipLoop(win);
        win.addEventListener('pagehide', () => {
          this.stopDocPipLoop();
          this.docPipWin = null;
          this.activeKind = 'none';
          this.emit();
        });
        this.emit();
        return true;
      } catch {
        // Fallback to Canvas -> Video PiP below
      }
    }

    try {
      if (!this.canvasEl) {
        this.canvasEl = document.createElement('canvas');
        this.canvasEl.width = 480;
        this.canvasEl.height = 240;
      }
      this.renderCanvasHud();
      if (!this.videoEl) {
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.style.position = 'fixed';
        video.style.width = '1px';
        video.style.height = '1px';
        video.style.opacity = '0.001';
        video.style.pointerEvents = 'none';
        video.addEventListener('leavepictureinpicture', () => {
          this.stopVideoLoop();
          this.activeKind = 'none';
          this.emit();
        });
        document.body.appendChild(video);
        this.videoEl = video;
      }
      if (!this.stream && 'captureStream' in this.canvasEl) {
        this.stream = this.canvasEl.captureStream(5);
        this.videoEl.srcObject = this.stream;
      }
      await this.videoEl.play();
      if ('requestPictureInPicture' in this.videoEl) {
        await this.videoEl.requestPictureInPicture();
        this.activeKind = 'video';
        this.startVideoLoop();
        this.emit();
        return true;
      }
    } catch {
      this.stopVideoLoop();
      this.activeKind = 'none';
      this.emit();
    }
    return false;
  }

  async close() {
    this.stopDocPipLoop();
    this.stopVideoLoop();
    if (this.docPipWin) {
      try {
        this.docPipWin.close();
      } catch {
        // ignore
      }
      this.docPipWin = null;
    }
    if (typeof document !== 'undefined' && document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
      } catch {
        // ignore
      }
    }
    this.activeKind = 'none';
    this.emit();
  }

  private startDocPipLoop(win: Window) {
    this.stopDocPipLoop();
    this.docPipLastDraw = 0;
    const step = (now: number) => {
      if (!this.docPipWin || this.activeKind !== 'doc') return;
      if (now - this.docPipLastDraw >= 140) {
        this.docPipLastDraw = now;
        this.animTick += 1;
        this.drawDocPipBackdrop();
      }
      this.docPipRaf = win.requestAnimationFrame(step);
    };
    this.docPipRaf = win.requestAnimationFrame(step);
  }

  private stopDocPipLoop() {
    if (this.docPipRaf !== null && this.docPipWin) {
      try {
        this.docPipWin.cancelAnimationFrame(this.docPipRaf);
      } catch {
        // ignore
      }
    }
    this.docPipRaf = null;
  }

  private startVideoLoop() {
    this.stopVideoLoop();
    this.videoTimerId = window.setInterval(() => {
      if (this.activeKind !== 'video') {
        this.stopVideoLoop();
        return;
      }
      this.animTick += 1;
      this.renderCanvasHud();
    }, 220);
  }

  private stopVideoLoop() {
    if (this.videoTimerId !== null) {
      window.clearInterval(this.videoTimerId);
      this.videoTimerId = null;
    }
  }

  private setupDocPipDom(win: Window) {
    const doc = win.document;
    doc.title = 'StudyPulse — Mini Focus HUD';
    doc.body.innerHTML = `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Segoe UI", sans-serif; }
        :root {
          --sp-bg: #09090b;
          --sp-card: rgba(24,24,27,0.86);
          --sp-border: rgba(255,255,255,0.14);
          --sp-primary: #fafafa;
          --sp-primary-text: #09090b;
          --sp-accent: #38bdf8;
          --sp-text: #fafafa;
          --sp-muted: #a1a1aa;
          --sp-track: rgba(255,255,255,0.12);
          --sp-pill-bg: rgba(255,255,255,0.08);
          --sp-glow: #fb923c;
        }
        html, body { width: 100%; height: 100%; overflow: hidden; background: var(--sp-bg); color: var(--sp-text); }
        #sp-bg {
          position: fixed; inset: 0; width: 100%; height: 100%; z-index: 0;
          pointer-events: none; image-rendering: pixelated;
        }
        .hud {
          position: relative; z-index: 1; height: 100%;
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 11px 13px; border: 1px solid var(--sp-border);
        }
        .top { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
        .badge {
          display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700;
          padding: 4px 9px; border-radius: 999px; background: var(--sp-pill-bg);
          border: 1px solid var(--sp-border); color: var(--sp-text);
          max-width: 196px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          backdrop-filter: blur(8px);
        }
        .dot { width: 7px; height: 7px; border-radius: 999px; flex-shrink: 0; }
        .right-pills { display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .stage {
          display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 800;
          padding: 3px 8px; border-radius: 999px; background: var(--sp-card);
          border: 1px solid var(--sp-glow); color: var(--sp-text); letter-spacing: 0.02em;
        }
        .stage-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--sp-glow); flex-shrink: 0; }
        .purity {
          font-size: 10px; font-weight: 800; color: var(--sp-text);
          background: var(--sp-pill-bg); border: 1px solid var(--sp-border);
          padding: 3px 7px; border-radius: 999px;
        }
        .mid { display: flex; flex-direction: column; justify-content: center; gap: 2px; max-width: 62%; margin: 2px 0; }
        .clock {
          font-family: ui-monospace, SFMono-Regular, monospace; font-size: 33px; font-weight: 800;
          letter-spacing: -0.02em; line-height: 1.05; font-variant-numeric: tabular-nums;
          color: var(--sp-text);
        }
        .task {
          font-size: 11px; font-weight: 600; color: var(--sp-muted);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .bottom { display: flex; flex-direction: column; gap: 7px; }
        .track { width: 100%; height: 5px; border-radius: 999px; background: var(--sp-track); overflow: hidden; }
        .bar {
          height: 100%; border-radius: 999px;
          background: linear-gradient(90deg, var(--sp-primary), var(--sp-glow));
          transition: width 0.3s linear;
        }
        .actions { display: flex; gap: 6px; max-width: 72%; }
        button {
          border: 1px solid var(--sp-border); border-radius: 9px; padding: 5px 9px;
          font-size: 11px; font-weight: 800; cursor: pointer;
          background: var(--sp-card); color: var(--sp-text); backdrop-filter: blur(8px);
        }
        button.primary { flex: 1; background: var(--sp-primary); color: var(--sp-primary-text); border: 1px solid transparent; }
        button.paused { flex: 1; background: var(--sp-pill-bg); color: var(--sp-text); border: 1px solid var(--sp-border); }
        .subline { display: flex; align-items: center; gap: 6px; }
        .peers {
          font-size: 10px; font-weight: 700; color: var(--sp-muted);
          background: var(--sp-pill-bg); border: 1px solid var(--sp-border);
          padding: 2px 7px; border-radius: 999px; display: none;
        }
        .toast {
          font-size: 10px; font-weight: 800; color: #fbbf24;
          background: var(--sp-card); border: 1px solid #fbbf24;
          padding: 2px 8px; border-radius: 999px; display: none;
        }
      </style>
      <canvas id="sp-bg"></canvas>
      <div class="hud">
        <div class="top">
          <span class="badge"><span id="sp-dot" class="dot"></span><span id="sp-sub"></span></span>
          <span class="right-pills">
            <span class="stage"><span class="stage-dot"></span><span id="sp-stage"></span></span>
            <span id="sp-purity" class="purity"></span>
          </span>
        </div>
        <div class="mid">
          <div id="sp-clock" class="clock">25:00</div>
          <div class="subline">
            <div id="sp-task" class="task"></div>
            <span id="sp-peers" class="peers"></span>
            <span id="sp-toast" class="toast"></span>
          </div>
        </div>
        <div class="bottom">
          <div class="track"><div id="sp-bar" class="bar"></div></div>
          <div class="actions">
            <button id="sp-boost">+5m</button>
            <button id="sp-toggle" class="primary">Pause</button>
            <button id="sp-task-done" style="display:none" title="Complete current study task">✓ Done</button>
            <button id="sp-finish">Finish</button>
          </div>
        </div>
      </div>
    `;
    doc.getElementById('sp-toggle')?.addEventListener('click', () => this.actions.onToggleRun());
    doc.getElementById('sp-boost')?.addEventListener('click', () => this.actions.onBoost5m());
    doc.getElementById('sp-task-done')?.addEventListener('click', () => this.actions.onCompleteTask?.());
    doc.getElementById('sp-finish')?.addEventListener('click', () => this.actions.onFinish());
  }

  private applyDocPipTheme(doc: Document, meta: UiThemeMeta, focus: PipFocusStateInfo) {
    const root = doc.documentElement.style;
    const isLight = meta.light;
    root.setProperty('--sp-bg', meta.preview.bg);
    root.setProperty(
      '--sp-card',
      meta.preview.card.startsWith('#') ? hexToRgba(meta.preview.card, isLight ? 0.88 : 0.84) : meta.preview.card
    );
    root.setProperty('--sp-border', meta.preview.border);
    root.setProperty('--sp-primary', meta.preview.primary);
    root.setProperty('--sp-primary-text', meta.preview.primaryText);
    root.setProperty('--sp-accent', meta.colors.accent);
    root.setProperty('--sp-text', meta.preview.text);
    root.setProperty('--sp-muted', hexToRgba(meta.preview.text, isLight ? 0.65 : 0.68));
    root.setProperty('--sp-track', meta.colors.track);
    root.setProperty(
      '--sp-pill-bg',
      isLight ? hexToRgba(meta.preview.text, 0.06) : hexToRgba('#ffffff', 0.08)
    );
    root.setProperty('--sp-glow', focus.glowColor);
  }

  private drawDocPipBackdrop() {
    const win = this.docPipWin;
    if (!win) return;
    const canvas = win.document.getElementById('sp-bg') as HTMLCanvasElement | null;
    if (!canvas) return;

    const w = Math.max(240, win.innerWidth || 384);
    const h = Math.max(120, win.innerHeight || 176);
    const dpr = Math.min(2, win.devicePixelRatio || 1);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const meta = getThemeMeta(this.latestState.themeId);
    const focus = getPipFocusState(this.latestState, meta);
    renderPipCharacterBackdrop(ctx, w, h, this.latestState, this.animTick, meta, focus);
    ctx.restore();
  }

  private renderDocPip(redrawBackdrop = false) {
    const doc = this.docPipWin?.document;
    if (!doc) return;
    const s = this.latestState;
    const meta = getThemeMeta(s.themeId);
    const focus = getPipFocusState(s, meta);
    this.applyDocPipTheme(doc, meta, focus);

    const dot = doc.getElementById('sp-dot');
    const sub = doc.getElementById('sp-sub');
    const stage = doc.getElementById('sp-stage');
    const purity = doc.getElementById('sp-purity');
    const clock = doc.getElementById('sp-clock');
    const task = doc.getElementById('sp-task');
    const bar = doc.getElementById('sp-bar');
    const toggleBtn = doc.getElementById('sp-toggle');
    const taskDoneBtn = doc.getElementById('sp-task-done') as HTMLButtonElement | null;
    const peersEl = doc.getElementById('sp-peers');
    const toastEl = doc.getElementById('sp-toast');

    if (dot) dot.style.backgroundColor = s.subjectColor || meta.colors.accent;
    if (sub) sub.textContent = `${s.modeLabel} • ${s.subjectName}`;
    if (stage) stage.textContent = focus.label;
    if (purity) purity.textContent = `🛡 ${s.purityPct}%`;
    if (clock) clock.textContent = s.clockText;
    if (task) task.textContent = s.taskTitle || focus.label;
    if (bar) bar.style.width = `${Math.round(Math.min(1, Math.max(0, s.progress)) * 100)}%`;
    if (toggleBtn) {
      toggleBtn.textContent = s.isRunning ? 'Pause' : 'Resume';
      toggleBtn.className = s.isRunning ? 'paused' : 'primary';
    }
    if (taskDoneBtn) {
      taskDoneBtn.style.display = s.activeTaskId ? 'inline-block' : 'none';
    }
    if (peersEl) {
      if ((s.roomPeersCount || 0) > 0) {
        peersEl.style.display = 'inline-block';
        peersEl.textContent = `👥 ${s.roomPeersCount} live`;
      } else {
        peersEl.style.display = 'none';
      }
    }
    if (toastEl) {
      if (s.toastText) {
        toastEl.style.display = 'inline-block';
        toastEl.textContent = s.toastText;
      } else {
        toastEl.style.display = 'none';
      }
    }
    if (redrawBackdrop) {
      this.drawDocPipBackdrop();
    }
  }

  private renderCanvasHud() {
    const canvas = this.canvasEl;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderCanvasHudToContext(ctx, canvas.width, canvas.height, this.latestState, this.animTick);
  }

  private updateMediaSessionMetadata() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      const s = this.latestState;
      const focus = getPipFocusState(s);
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${s.clockText} • ${s.subjectName}`,
        artist: s.taskTitle || `${focus.label} (${s.modeLabel})`,
        album: `Purity ${s.purityPct}% · Lv.${Math.max(1, s.heroLevel)}`,
      });
      navigator.mediaSession.playbackState = s.isRunning ? 'playing' : 'paused';
    } catch {
      // ignore unsupported MediaMetadata environments
    }
  }

  private bindMediaSessionHandlers() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler('play', () => {
        if (!this.latestState.isRunning) this.actions.onToggleRun();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (this.latestState.isRunning) this.actions.onToggleRun();
      });
      navigator.mediaSession.setActionHandler('seekforward', () => {
        this.actions.onBoost5m();
      });
    } catch {
      // ignore unsupported actions
    }
  }
}

export const pipEngine = new FloatingPipEngine();
if (typeof window !== 'undefined') {
  (window as unknown as { __spPipEngine?: FloatingPipEngine }).__spPipEngine = pipEngine;
}
