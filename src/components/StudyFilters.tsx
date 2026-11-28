import { Filter } from 'lucide-react';
import type { StudyActivity } from '../types';

export function subjectKey(name: string) {
  return name.trim().normalize('NFC').toLowerCase();
}

export function subcategoryKey(name: string | null | undefined) {
  return name ? `tag:${subjectKey(name)}` : 'uncategorized';
}

interface FilterOption {
  value: string;
  label: string;
}

function uniqueOptions(options: FilterOption[]) {
  const firstByValue = new Map<string, FilterOption>();
  for (const option of options) {
    if (!firstByValue.has(option.value)) firstByValue.set(option.value, option);
  }
  return [...firstByValue.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function subjectOptions(names: string[]) {
  return uniqueOptions(
    names.map((name) => ({ value: subjectKey(name), label: name })).filter((option) => option.value)
  );
}

export function subcategoryOptions(names: (string | null | undefined)[]) {
  return uniqueOptions(names.map((name) => ({
    value: subcategoryKey(name),
    label: name || 'Uncategorized',
  })));
}

interface SubjectActivitySource {
  name: string;
  seconds?: number;
  minutes?: number;
  sessions?: number;
  subcategories?: (StudyActivity & { name: string | null })[];
}

export function selectStudyActivity(
  subjects: SubjectActivitySource[],
  subject: string,
  subcategory: string
): StudyActivity {
  const totals = { seconds: 0, sessions: 0 };
  for (const item of subjects) {
    if (subject && subjectKey(item.name) !== subject) continue;

    if (!subcategory) {
      totals.seconds += item.seconds ?? (item.minutes ?? 0) * 60;
      totals.sessions += item.sessions ?? 0;
      continue;
    }

    for (const category of item.subcategories ?? []) {
      if (subcategoryKey(category.name) !== subcategory) continue;
      totals.seconds += category.seconds;
      totals.sessions += category.sessions;
    }
  }
  return totals;
}

export function formatStudyActivity(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return [hours && `${hours}h`, minutes && `${minutes}m`, remainingSeconds && `${remainingSeconds}s`]
    .filter(Boolean)
    .join(' ') || '0m';
}

export function studyFilterLabel(
  subjects: FilterOption[],
  subcategories: FilterOption[],
  subject: string,
  subcategory: string
) {
  const subjectLabel = subjects.find((option) => option.value === subject)?.label;
  const subcategoryLabel = subcategories.find((option) => option.value === subcategory)?.label;
  return [subjectLabel, subcategoryLabel].filter(Boolean).join(' · ') || 'All subjects';
}

interface StudyFiltersProps {
  subjects: FilterOption[];
  subcategories: FilterOption[];
  subject: string;
  subcategory: string;
  onSubjectChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
}

export function StudyFilters({
  subjects, subcategories, subject, subcategory, onSubjectChange, onSubcategoryChange,
}: StudyFiltersProps) {
  const hasSelection = Boolean(subject || subcategory);
  return (
    <section className="studio-panel grid gap-3 p-3 sm:p-4" aria-label="Study filters">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2"><Filter size={15} aria-hidden="true" /> Study filters</h2>
        {hasSelection && (
          <button type="button" className="studio-text-button" onClick={() => onSubjectChange('')}>
            Clear filters
          </button>
        )}
      </div>
      <div className="grid gap-2 min-[400px]:grid-cols-2">
        <label className="grid min-w-0 gap-1 text-xs font-semibold text-slate-300">
          <span>Subject</span>
          <select
            className="w-full min-w-0 min-h-11 px-2.5 sp-input text-sm"
            value={subject}
            onChange={(event) => onSubjectChange(event.target.value)}
          >
            <option value="">All subjects</option>
            {subjects.map(({ value, label }) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
        <label className="grid min-w-0 gap-1 text-xs font-semibold text-slate-300">
          <span>Subcategory</span>
          <select
            className="w-full min-w-0 min-h-11 px-2.5 sp-input text-sm disabled:opacity-65"
            value={subcategory}
            onChange={(event) => onSubcategoryChange(event.target.value)}
            disabled={!subject || subcategories.length === 0}
          >
            <option value="">{subject ? 'All subcategories' : 'Select a subject'}</option>
            {subcategories.map(({ value, label }) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
      </div>
    </section>
  );
}

export function StudyMetrics({ activity }: { activity: StudyActivity }) {
  return (
    <dl className="flex flex-wrap items-baseline gap-4 text-xs sm:gap-6" aria-live="polite" aria-atomic="true">
      <div>
        <dt className="text-slate-400">Focus time</dt>
        <dd className="font-mono-num text-base leading-tight font-bold text-white">{formatStudyActivity(activity.seconds)}</dd>
      </div>
      <div>
        <dt className="text-slate-400">Sessions</dt>
        <dd className="font-mono-num text-base leading-tight font-bold text-white">{activity.sessions}</dd>
      </div>
    </dl>
  );
}
