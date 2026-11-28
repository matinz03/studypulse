import { useId } from 'react';
import type { SubjectStat } from '../types';

export function subjectSubcategories(subject: string, breakdown: SubjectStat[]) {
  const normalized = subject.trim().toLowerCase();
  const stats = breakdown.find((item) => item.name.toLowerCase() === normalized);
  return (stats?.subcategories ?? []).flatMap(({ name }) => name ? [name] : []);
}

interface SubcategoryInputProps {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
  disabled?: boolean;
}

export function SubcategoryInput({ value, onChange, options = [], disabled }: SubcategoryInputProps) {
  const listId = useId();

  return (
    <label className="grid min-w-0 gap-1 text-xs font-bold text-slate-300">
      <span>Subcategory <span className="font-normal text-slate-400">(optional)</span></span>
      <input
        className="min-w-0 w-full min-h-10 px-3 py-2 sp-input text-sm font-medium disabled:opacity-70"
        type="text"
        maxLength={40}
        list={options.length ? listId : undefined}
        autoComplete="off"
        placeholder="e.g. Video or Exercise"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
      {options.length > 0 && (
        <datalist id={listId}>
          {options.map((option) => <option value={option} key={option} />)}
        </datalist>
      )}
    </label>
  );
}
