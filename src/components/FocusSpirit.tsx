import { motion } from 'framer-motion';
import { ThemeId, getThemeMeta } from '../themes';

interface FocusSpiritProps {
  elapsedSec: number;
  isRunning: boolean;
  accentColor: string;
  spiritSkin?: string;
  themeId?: ThemeId;
}

export function getSpiritStage(elapsedSec: number, spiritSkin = 'default', themeId: ThemeId = 'shadcn-dark') {
  const mins = elapsedSec / 60;
  const meta = getThemeMeta(themeId);

  let stage;
  if (mins >= 50) stage = { key: 'cosmic', label: 'Stage 04 · Apex', tier: 4 };
  else if (mins >= 30) stage = { key: 'nova', label: 'Stage 03 · Flow', tier: 3 };
  else if (mins >= 15) stage = { key: 'ember', label: 'Stage 02 · Locked', tier: 2 };
  else stage = { key: 'spark', label: 'Stage 01 · Spark', tier: 1 };

  if (spiritSkin === 'spirit_phoenix') {
    return { ...stage, primary: '#F97316', secondary: '#FB7185' };
  }
  if (spiritSkin === 'spirit_cyber') {
    return { ...stage, primary: '#22D3EE', secondary: '#A855F7' };
  }
  if (spiritSkin === 'spirit_emerald') {
    return { ...stage, primary: '#10B981', secondary: '#F59E0B' };
  }
  if (spiritSkin === 'spirit_void') {
    return { ...stage, primary: '#818CF8', secondary: '#C084FC' };
  }
  if (spiritSkin === 'monthly_spirit_aurora') {
    return { ...stage, primary: '#2DD4BF', secondary: '#FBBF24' };
  }

  return {
    ...stage,
    primary: meta.colors.accent,
    secondary: meta.colors.accent2,
  };
}

export function FocusSpirit({
  elapsedSec,
  isRunning,
  accentColor,
  spiritSkin = 'default',
  themeId = 'shadcn-dark',
}: FocusSpiritProps) {
  const meta = getThemeMeta(themeId);
  const stage = getSpiritStage(elapsedSec, spiritSkin, themeId);
  const scaleBoost = Math.min(1.12, 0.94 + (stage.tier - 1) * 0.06);
  const auraColor = spiritSkin === 'default' && meta.mono ? meta.colors.accent : accentColor || stage.primary;
  const facetDark = meta.light ? '#52525b' : '#27272a';
  const facetMid = meta.light ? '#a1a1aa' : '#71717a';

  return (
    <div className="relative flex flex-col items-center justify-center select-none pointer-events-none">
      {/* Subtle monochrome / theme radial spotlight behind prism */}
      <motion.div
        animate={
          isRunning
            ? { scale: [0.92, 1.08, 0.92], opacity: [0.22, 0.4, 0.22] }
            : { scale: [0.96, 1.02, 0.96], opacity: [0.1, 0.18, 0.1] }
        }
        transition={{ duration: isRunning ? 2.8 : 4.2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-20 h-20 rounded-full blur-xl"
        style={{ background: `radial-gradient(circle, ${auraColor}44, transparent 70%)` }}
      />

      {/* Precision Gyroscope Orbital Rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: isRunning ? 10 : 28, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[74px] h-[74px] rounded-full border border-dashed"
        style={{ borderColor: `${stage.primary}38` }}
      >
        <span
          className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: stage.primary }}
        />
      </motion.div>

      {stage.tier >= 2 && (
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: isRunning ? 14 : 36, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[88px] h-[88px] rounded-full border"
          style={{ borderColor: `${stage.secondary}28` }}
        />
      )}

      {/* Faceted Architectural Octahedron Prism Core */}
      <motion.svg
        width="56"
        height="56"
        viewBox="0 0 64 64"
        animate={
          isRunning
            ? { y: [0, -2.5, 0], scale: [scaleBoost, scaleBoost * 1.03, scaleBoost] }
            : { y: [0, -1, 0], scale: scaleBoost }
        }
        transition={{ duration: isRunning ? 2.4 : 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)]"
      >
        <defs>
          <linearGradient id={`prismTop-${themeId}`} x1="32" y1="6" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={stage.primary} />
            <stop offset="100%" stopColor={facetMid} />
          </linearGradient>
        </defs>

        {/* Left & Right upper facets */}
        <polygon points="32,7 13,31 32,39" fill={`url(#prismTop-${themeId})`} fillOpacity="0.92" />
        <polygon points="32,7 51,31 32,39" fill={stage.primary} fillOpacity="0.58" />

        {/* Left & Right lower bevel facets */}
        <polygon points="13,31 32,57 32,39" fill={facetDark} fillOpacity="0.95" />
        <polygon points="51,31 32,57 32,39" fill={facetMid} fillOpacity="0.72" />

        {/* Razor specular wireframe edges */}
        <polygon
          points="32,7 51,31 32,57 13,31"
          fill="none"
          stroke={stage.primary}
          strokeOpacity="0.85"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <line x1="32" y1="7" x2="32" y2="57" stroke={stage.primary} strokeOpacity="0.7" strokeWidth="1" />
        <line x1="13" y1="31" x2="32" y2="39" stroke={stage.primary} strokeOpacity="0.6" strokeWidth="1" />
        <line x1="51" y1="31" x2="32" y2="39" stroke={stage.primary} strokeOpacity="0.45" strokeWidth="1" />

        {/* Active inner pulse core */}
        {isRunning && <circle cx="32" cy="34" r="3" fill={stage.primary} />}
      </motion.svg>

      <span className="mt-1 font-mono-num text-[9px] font-bold tracking-[0.16em] uppercase text-slate-400">
        {stage.label}
      </span>
    </div>
  );
}
