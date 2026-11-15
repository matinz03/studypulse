import { motion } from 'framer-motion';

interface FocusSpiritProps {
  elapsedSec: number;
  isRunning: boolean;
  accentColor: string;
}

export function getSpiritStage(elapsedSec: number) {
  const mins = elapsedSec / 60;
  if (mins >= 50) return { key: 'cosmic', label: 'Cosmic Flame', tier: 4, primary: '#8B5CF6', secondary: '#06B6D4' };
  if (mins >= 30) return { key: 'nova', label: 'Nova Spirit', tier: 3, primary: '#F97316', secondary: '#EC4899' };
  if (mins >= 15) return { key: 'ember', label: 'Ember Fox', tier: 2, primary: '#10B981', secondary: '#34D399' };
  return { key: 'spark', label: 'Focus Spark', tier: 1, primary: '#06B6D4', secondary: '#10B981' };
}

export function FocusSpirit({ elapsedSec, isRunning, accentColor }: FocusSpiritProps) {
  const stage = getSpiritStage(elapsedSec);
  const scaleBoost = Math.min(1.16, 0.92 + (stage.tier - 1) * 0.08);

  return (
    <div className="relative flex flex-col items-center justify-center select-none pointer-events-none">
      {/* Ambient aura behind spirit */}
      <motion.div
        animate={
          isRunning
            ? { scale: [0.95, 1.12, 0.95], opacity: [0.35, 0.65, 0.35] }
            : { scale: [0.96, 1.02, 0.96], opacity: [0.18, 0.28, 0.18] }
        }
        transition={{ duration: isRunning ? 2.6 : 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-24 h-24 rounded-full blur-xl"
        style={{ background: `radial-gradient(circle, ${accentColor || stage.primary}66, transparent 70%)` }}
      />

      {/* Orbital rings unlocked at tier 2+ */}
      {stage.tier >= 2 && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: isRunning ? 6 : 16, repeat: Infinity, ease: 'linear' }}
          className="absolute w-24 h-24 rounded-full border border-dashed"
          style={{ borderColor: `${stage.primary}55` }}
        >
          <span
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full shadow-lg"
            style={{ backgroundColor: stage.secondary, boxShadow: `0 0 8px ${stage.secondary}` }}
          />
        </motion.div>
      )}

      {stage.tier >= 4 && (
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
          className="absolute w-28 h-28 rounded-full border border-dotted border-violet-400/40"
        >
          <span className="absolute bottom-0 right-2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]" />
        </motion.div>
      )}

      {/* Main animated SVG mascot */}
      <motion.svg
        width="74"
        height="74"
        viewBox="0 0 96 96"
        animate={
          isRunning
            ? { y: [0, -4, 0], scale: [scaleBoost, scaleBoost * 1.04, scaleBoost] }
            : { y: [0, -1.5, 0], scale: scaleBoost }
        }
        transition={{ duration: isRunning ? 2.2 : 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 drop-shadow-[0_6px_18px_rgba(16,185,129,0.35)]"
      >
        <defs>
          <linearGradient id="spiritBody" x1="48" y1="10" x2="48" y2="86" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={stage.secondary} />
            <stop offset="55%" stopColor={stage.primary} />
            <stop offset="100%" stopColor={accentColor || '#0F766E'} />
          </linearGradient>
        </defs>

        {/* Crown crystal at Tier 3+ */}
        {stage.tier >= 3 && (
          <path d="M48 4 L54 15 L48 19 L42 15 Z" fill="#FBBF24" stroke="#FEF3C7" strokeWidth="1.2" />
        )}

        {/* Flame Spirit Body */}
        <path
          d="M48 14 C37 28 24 41 24 58 C24 72 34.7 83 48 83 C61.3 83 72 72 72 58 C72 41 59 28 48 14 Z"
          fill="url(#spiritBody)"
        />
        {/* Inner glow core */}
        <path
          d="M48 34 C41 44 35 51 35 61 C35 69.5 40.8 76 48 76 C55.2 76 61 69.5 61 61 C61 51 55 44 48 34 Z"
          fill="#FFFFFF"
          fillOpacity="0.22"
        />

        {/* Expressive Eyes */}
        {isRunning ? (
          <>
            <ellipse cx="40.5" cy="56" rx="3.2" ry="4" fill="#080B12" />
            <ellipse cx="55.5" cy="56" rx="3.2" ry="4" fill="#080B12" />
            <circle cx="41.6" cy="54.6" r="1.2" fill="#FFFFFF" />
            <circle cx="56.6" cy="54.6" r="1.2" fill="#FFFFFF" />
            <path d="M43.5 63.5 Q48 67 52.5 63.5" stroke="#080B12" strokeWidth="2.3" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <path d="M37 56 Q40.5 53.5 44 56" stroke="#080B12" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <path d="M52 56 Q55.5 53.5 59 56" stroke="#080B12" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <circle cx="48" cy="64" r="1.8" fill="#080B12" />
          </>
        )}
      </motion.svg>

      <span className="mt-0.5 text-[10px] font-semibold tracking-wider uppercase text-slate-300/80">
        {stage.label}
      </span>
    </div>
  );
}
