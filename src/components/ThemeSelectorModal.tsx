import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Moon, Palette, Sparkles, Sun, X } from 'lucide-react';
import { ThemeId, UI_THEMES, getThemeMeta } from '../themes';

interface ThemeSelectorModalProps {
  themeId: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
  onClose: () => void;
}

type ThemeFilter = 'all' | 'light' | 'dark' | 'study';

export function ThemeSelectorModal({ themeId, onSelectTheme, onClose }: ThemeSelectorModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement;
    if (!dialog) return;

    dialog.showModal();
    return () => {
      dialog.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) {
        trigger.focus({ preventScroll: true });
      }
    };
  }, []);

  const [filter, setFilter] = useState<ThemeFilter>('all');
  const currentMeta = getThemeMeta(themeId);

  const visibleThemes = useMemo(() => {
    switch (filter) {
      case 'light':
        return UI_THEMES.filter((t) => t.light);
      case 'dark':
        return UI_THEMES.filter((t) => !t.light);
      case 'study':
        return UI_THEMES.filter((t) => t.category === 'study');
      default:
        return UI_THEMES;
    }
  }, [filter]);

  return (
    <dialog
      ref={dialogRef}
      className="studio-theme-dialog"
      aria-label="Select UI Theme"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        className="studio-panel studio-theme-content space-y-3.5"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg sp-badge flex items-center justify-center shrink-0">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2>Choose a theme</h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onSelectTheme(currentMeta.pairId)}
              title={currentMeta.light ? 'Switch to matching Dark theme' : 'Switch to matching Light theme'}
              className="px-2.5 py-1.5 sp-badge text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:opacity-90"
            >
              {currentMeta.light ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span>{currentMeta.light ? 'Dark' : 'Light'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close theme picker"
              className="studio-icon-button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category / Mode Filter Tabs */}
        <div className="studio-segments studio-profile-segments" role="group" aria-label="Theme category">
          {(
            [
              ['all', `All (${UI_THEMES.length})`],
              ['light', 'Light (8)'],
              ['dark', 'Dark (8)'],
              ['study', 'Study'],
            ] as const
          ).map(([k, label]) => {
            const active = filter === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                aria-pressed={active}
                className="focus-mode"
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60dvh] overflow-y-auto glass-scroll pr-0.5">
          {visibleThemes.map((t) => {
            const active = t.id === themeId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTheme(t.id)}
                aria-pressed={active}
                className={`text-left p-3 border transition cursor-pointer relative overflow-hidden ${
                  active ? 'sp-tab-active ring-1 ring-current' : 'sp-inset hover:opacity-95'
                }`}
              >
                {/* Mini Component UI Specimen Swatch */}
                <div
                  className="rounded-lg p-2.5 mb-2 border flex flex-col gap-2"
                  style={{
                    backgroundColor: t.preview.bg,
                    borderColor: t.preview.border,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center gap-1"
                      style={{
                        backgroundColor: t.preview.card,
                        borderColor: t.preview.border,
                        color: t.preview.text,
                      }}
                    >
                      {t.category === 'study' && <Sparkles className="w-2.5 h-2.5" />}
                      {t.system}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: t.preview.accent }}
                    />
                  </div>
                  <div
                    className="rounded-md p-1.5 border flex items-center justify-between gap-2"
                    style={{
                      backgroundColor: t.preview.card,
                      borderColor: t.preview.border,
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-4 h-4 rounded-sm inline-block"
                        style={{ backgroundColor: t.preview.accent, opacity: 0.3 }}
                      />
                      <span
                        className="h-1.5 w-10 rounded-sm inline-block"
                        style={{ backgroundColor: t.preview.text, opacity: 0.45 }}
                      />
                    </div>
                    <span
                      className="text-[8px] font-extrabold px-2 py-0.5 rounded-sm"
                      style={{
                        backgroundColor: t.preview.primary,
                        color: t.preview.primaryText,
                      }}
                    >
                      Focus
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-extrabold">{t.name}</span>
                  {active && (
                    <span className="w-5 h-5 sp-btn-primary flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-[10px] opacity-75 leading-snug mt-0.5">{t.description}</p>
              </button>
            );
          })}
        </div>
      </motion.div>
    </dialog>
  );
}
