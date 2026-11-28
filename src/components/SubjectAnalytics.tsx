import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { resolveAccent, type ThemeId } from '../themes';
import type { SubjectStat } from '../types';

export type SubjectAnalyticsPeriod = 'all' | 'week';

interface SubjectAnalyticsProps {
  breakdown?: SubjectStat[];
  themeId: ThemeId;
  period: SubjectAnalyticsPeriod;
  onChangePeriod: (period: SubjectAnalyticsPeriod) => void;
  onManageSubjects: () => void;
  hasWeeklyBreakdown: boolean;
  weekLabel?: string;
  loading: boolean;
}

function studyDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return [minutes ? `${minutes}m` : '', remainder ? `${remainder}s` : ''].filter(Boolean).join(' ') || '0m';
}

function timeShare(percent: number, seconds: number, total?: number) {
  if (percent === 0 && seconds > 0) return '<1%';
  if (percent === 100 && total !== undefined && seconds < total) return '>99%';
  return `${percent}%`;
}

function sessionCount(count: number) {
  return `${count} ${count === 1 ? 'session' : 'sessions'}`;
}

export function SubjectAnalytics({
  breakdown, themeId, period, onChangePeriod, onManageSubjects, hasWeeklyBreakdown, weekLabel, loading,
}: SubjectAnalyticsProps) {
  return (
    <section className="pt-4 border-t border-white/10 space-y-3" aria-label="Subject breakdown">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-extrabold text-white">Subject breakdown</h3>
        <button type="button" onClick={onManageSubjects} className="studio-text-button">
          <SlidersHorizontal size={14} aria-hidden="true" /> Manage subjects
        </button>
      </div>
      {hasWeeklyBreakdown && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Breakdown period">
          <button
            type="button"
            className={`px-3 py-2 text-xs font-bold cursor-pointer ${period === 'all' ? 'sp-tab-active' : 'sp-badge'}`}
            aria-pressed={period === 'all'}
            onClick={() => onChangePeriod('all')}
          >
            All time
          </button>
          <button
            type="button"
            className={`px-3 py-2 text-xs font-bold cursor-pointer ${period === 'week' ? 'sp-tab-active' : 'sp-badge'}`}
            aria-pressed={period === 'week'}
            onClick={() => onChangePeriod('week')}
          >
            Selected week
          </button>
          {period === 'week' && weekLabel && <span className="text-xs text-slate-400">{weekLabel}</span>}
        </div>
      )}
      {loading ? (
        <p role="status" className="text-xs text-slate-400">Loading subject totals…</p>
      ) : !breakdown ? (
        <p role="status" className="text-xs text-slate-400">Weekly subject totals are unavailable.</p>
      ) : breakdown.length === 0 ? (
        <p className="text-xs text-slate-400">No sessions in this period.</p>
      ) : (
        <div className={`grid grid-cols-1 items-start gap-2 ${breakdown.length > 1 ? 'sm:grid-cols-2' : ''}`}>
          {breakdown.map((subject) => {
            const categories = subject.subcategories;
            const expandable = categories?.some((category) => category.name !== null);
            const tint = resolveAccent(subject.color, themeId);
            const seconds = subject.seconds ?? subject.minutes * 60;
            const total = (
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="font-bold text-white wrap-anywhere">{subject.name}</span>
                  <span className="font-mono-num text-xs text-slate-300">
                    {studyDuration(seconds)} · {timeShare(subject.pct, seconds)} of total
                  </span>
                </div>
                {subject.sessions !== undefined && <div className="text-xs text-slate-400">{sessionCount(subject.sessions)}</div>}
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                  <div className="h-full rounded-full" style={{ width: `${subject.pct}%`, backgroundColor: tint }} />
                </div>
              </div>
            );

            if (!expandable) return <div key={subject.name} className="sp-inset p-3">{total}</div>;

            return (
              <details key={subject.name} className="group sp-inset">
                <summary className="flex min-h-11 cursor-pointer items-center gap-3 p-3 list-none [&::-webkit-details-marker]:hidden">
                  {total}
                  <ChevronDown size={16} className="shrink-0 text-slate-400 group-open:rotate-180" aria-hidden="true" />
                </summary>
                <ul className="mx-3 mb-2 divide-y divide-white/10 border-t border-white/10">
                  {categories?.map((category) => (
                    <li key={category.name ?? ''} className="flex flex-wrap justify-between gap-x-3 gap-y-1 py-2 text-xs">
                      <span className="font-semibold text-white wrap-anywhere">{category.name ?? 'Uncategorized'}</span>
                      <span className="text-slate-400">
                        {studyDuration(category.seconds)} · {sessionCount(category.sessions)} · {timeShare(category.pct, category.seconds, seconds)} of subject
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}
