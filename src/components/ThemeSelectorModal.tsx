import { motion } from 'framer-motion';
import { Check, Palette, X } from 'lucide-react';
import { ThemeId, UI_THEMES } from '../themes';

interface ThemeSelectorModalProps {
  themeId: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
  onClose: () => void;
}

export function ThemeSelectorModal({ themeId, onSelectTheme, onClose }: ThemeSelectorModalProps) {
  return (
    <div
      className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Select UI Theme"
        className="w-full max-w-md liquid-dock rounded-3xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl liquid-pill flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">Select UI Theme</h2>
              <p className="text-[11px] opacity-70">Switch glass surface, ink contrast & design system</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close theme picker"
            className="w-8 h-8 rounded-full liquid-pill flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[65dvh] overflow-y-auto glass-scroll pr-0.5">
          {UI_THEMES.map((t) => {
            const active = t.id === themeId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTheme(t.id)}
                className={`text-left rounded-2xl p-3 border transition cursor-pointer relative overflow-hidden ${
                  active ? 'sp-tab-active ring-1 ring-current' : 'liquid-pill hover:opacity-95'
                }`}
              >
                {/* Mini Component UI Specimen Swatch */}
                <div
                  className="rounded-xl p-2.5 mb-2.5 border flex flex-col gap-2"
                  style={{
                    backgroundColor: t.preview.bg,
                    borderColor: t.preview.border,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border"
                      style={{
                        backgroundColor: t.preview.card,
                        borderColor: t.preview.border,
                        color: t.preview.text,
                      }}
                    >
                      {t.system}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: t.preview.accent }}
                    />
                  </div>
                  <div
                    className="rounded-lg p-1.5 border flex items-center justify-between gap-2"
                    style={{
                      backgroundColor: t.preview.card,
                      borderColor: t.preview.border,
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-4 h-4 rounded-md inline-block"
                        style={{ backgroundColor: t.preview.accent, opacity: 0.25 }}
                      />
                      <span
                        className="h-1.5 w-10 rounded-full inline-block"
                        style={{ backgroundColor: t.preview.text, opacity: 0.45 }}
                      />
                    </div>
                    <span
                      className="text-[8px] font-extrabold px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: t.preview.primary,
                        color: t.preview.primaryText,
                      }}
                    >
                      Button
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-extrabold">{t.name}</span>
                  {active && (
                    <span className="w-5 h-5 rounded-full sp-btn-primary flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-[10px] opacity-70 leading-snug mt-0.5">{t.description}</p>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
