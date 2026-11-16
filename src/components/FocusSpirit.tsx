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
  if (mins >= 50) stage = { key: 'cosmic', label: 'Cosmic Flame', tier: 4 };
  else if (mins >= 30) stage = { key: 'nova', label: 'Nova Spirit', tier: 3 };
  else if (mins >= 15) stage = { key: 'ember', label: 'Ember Spark', tier: 2 };
  else stage = { key: 'spark', label: 'Focus Spark', tier: 1 };

  if (spiritSkin === 'spirit_phoenix') {
    return { ...stage, primary: '#F97316', secondary: '#FB7185' };
  }
  if (spiritSkin === 'spirit_cyber') {
    return { ...stage, primary: '#22D3EE', secondary: '#A855F7' };
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
  const scaleBoost = Math.min(1.16, 0.92 + (stage.tier - 1) * 0.08);
  const eyeInk = meta.light ? '#fafafa' : '#09090b';
  const auraColor = spiritSkin === 'default' && meta.mono ? meta.colors.accent : accentColor || stage.primary;

  return (
    <div className="relative flex flex-col items-center justify-center select-none pointer-events-none">
      {/* Subtle monochrome / theme aura behind spirit */}
      <motion.div
        animate={
          isRunning
            ? { scale: [0.95, 1.1, 0.95], opacity: [0.22, 0.42, 0.22] }
            : { scale: [0.96, 1.02, 0.96], opacity: [0.12, 0.2, 0.12] }
        }
        transition={{ duration: isRunning ? 2.6 : 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-24 h-24 rounded-full blur-xl"
        style={{ background: `radial-gradient(circle, ${auraColor}44, transparent 70%)` }}
      />

      {/* Orbital rings unlocked at tier 2+ */}
      {stage.tier >= 2 && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: isRunning ? 6 : 16, repeat: Infinity, ease: 'linear' }}
          className="absolute w-24 h-24 rounded-full border border-dashed"
          style={{ borderColor: `${stage.primary}45` }}
        >
          <span
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full shadow"
            style={{ backgroundColor: stage.primary }}
          />
        </motion.div>
      )}

      {stage.tier >= 4 && (
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
          className="absolute w-28 h-28 rounded-full border border-dotted"
          style={{ borderColor: `${stage.secondary}55` }}
        >
          <span
            className="absolute bottom-0 right-2 w-2 h-2 rounded-full"
            style={{ backgroundColor: stage.primary }}
          />
        </motion.div>
      )}

      {/* Main animated SVG mascot */}
      <motion.svg
        width="72"
        height="72"
        viewBox="0 0 96 96"
        animate={
          isRunning
            ? { y: [0, -4, 0], scale: [scaleBoost, scaleBoost * 1.04, scaleBoost] }
            : { y: [0, -1.5, 0], scale: scaleBoost }
        }
        transition={{ duration: isRunning ? 2.2 : 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 drop-shadow-[0_6px_16px_rgba(0,0,0,0.35)]"
      >
        <defs>
          <linearGradient id={`spiritBody-${themeId}`} x1="48" y1="10" x2="48" y2="86" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={stage.primary} />
            <stop offset="60%" stopColor={stage.secondary} />
            <stop offset="100%" stopColor={meta.mono ? (meta.light ? '#3f3f46' : '#52525b') : accentColor || '#3f3f46'} />
          </linearGradient>
        </defs>

        {stage.tier >= 3 && (
          <path d="M48 4 L54 15 L48 19 L42 15 Z" fill={stage.primary} stroke={eyeInk} strokeWidth="1.2" />
        )}

        <path
          d="M48 14 C37 28 24 41 24 58 C24 72 34.7 83 48 83 C61.3 83 72 72 72 58 C72 41 59 28 48 14 Z"
          fill={`url(#spiritBody-${themeId})`}
        />
        <path
          d="M48 34 C41 44 35 51 35 61 C35 69.5 40.8 76 48 76 C55.2 76 61 69.5 61 61 C61 51 55 44 48 34 Z"
          fill={meta.light ? '#FFFFFF' : '#FFFFFF'}
          fillOpacity={meta.light ? 0.16 : 0.25}
        />

        {isRunning ? (
          <>
            <ellipse cx="40.5" cy="56" rx="3.2" ry="4" fill={eyeInk} />
            <ellipse cx="55.5" cy="56" rx="3.2" ry="4" fill={eyeInk} />
            <circle cx="41.6" cy="54.6" r="1.2" fill={stage.primary} />
            <circle cx="56.6" cy="54.6" r="1.2" fill={stage.primary} />
            <path d="M43.5 63.5 Q48 67 52.5 63.5" stroke={eyeInk} strokeWidth="2.3" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <path d="M37 56 Q40.5 53.5 44 56" stroke={eyeInk} strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <path d="M52 56 Q55.5 53.5 59 56" stroke={eyeInk} strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <circle cx="48" cy="64" r="1.8" fill={eyeInk} />
          </>
        )}
      </motion.svg>

      <span className="mt-0.5 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
        {stage.label}
      </span>
    </div>
  );
}
