import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Check, GitMerge, Pencil, Trash2, X } from 'lucide-react';
import { Subject, SubjectStat } from '../types';
import { ThemeId, resolveAccent } from '../themes';

export const SUBJECT_PALETTE_12 = [
  '#38BDF8',
  '#818CF8',
  '#A855F7',
  '#F43F5E',
  '#FB923C',
  '#FBBF24',
  '#10B981',
  '#14B8A6',
  '#06B6D4',
  '#EC4899',
  '#FAFAFA',
  '#94A3B8',
];

const SUBJECT_ICONS = ['📚', '💻', '⚡', '🧠', '🎯', '📐', '✨', '🌐', '🧪', '🎨', '📖', '🏛️'];

interface SubjectManagerModalProps {
  themeId: ThemeId;
  subjects: Subject[];
  subjectBreakdown?: SubjectStat[];
  onClose: () => void;
  onUpdateSubject?: (
    subjectId: number,
    payload: { name?: string; color?: string; icon?: string; cascadeSessions?: boolean }
  ) => Promise<void>;
  onReorderSubjects?: (orderedIds: number[]) => Promise<void>;
  onMergeSubjects?: (sourceId: number, targetId: number) => Promise<void>;
  onDeleteSubject: (subjectId: number) => Promise<void>;
}

export function SubjectManagerModal({
  themeId,
  subjects,
  subjectBreakdown = [],
  onClose,
  onUpdateSubject,
  onReorderSubjects,
  onMergeSubjects,
  onDeleteSubject,
}: SubjectManagerModalProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#38BDF8');
  const [editIcon, setEditIcon] = useState('📚');
  const [cascadeSessions, setCascadeSessions] = useState(true);
  const [mergingId, setMergingId] = useState<number | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const minsByName = new Map(subjectBreakdown.map((s) => [s.name.toLowerCase(), s.minutes]));

  async function moveSubject(index: number, dir: -1 | 1) {
    if (!onReorderSubjects) return;
    const nextIdx = index + dir;
    if (nextIdx < 0 || nextIdx >= subjects.length) return;
    const copy = [...subjects];
    const [moved] = copy.splice(index, 1);
    copy.splice(nextIdx, 0, moved);
    await onReorderSubjects(copy.map((s) => s.id));
  }

  async function saveEdit(subjectId: number) {
    if (!onUpdateSubject || !editName.trim()) return;
    setBusyId(subjectId);
    try {
      await onUpdateSubject(subjectId, {
        name: editName.trim(),
        color: editColor,
        icon: editIcon,
        cascadeSessions,
      });
      setEditingId(null);
    } finally {
      setBusyId(null);
    }
  }

  async function confirmMerge(sourceId: number) {
    if (!onMergeSubjects || !mergeTargetId || mergeTargetId === sourceId) return;
    setBusyId(sourceId);
    try {
      await onMergeSubjects(sourceId, mergeTargetId);
      setMergingId(null);
      setMergeTargetId(null);
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete(subjectId: number) {
    setBusyId(subjectId);
    try {
      await onDeleteSubject(subjectId);
      setConfirmDeleteId(null);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Manage Subjects"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="glass-card w-full max-w-lg rounded-3xl p-4 sm:p-5 space-y-3.5 max-h-[85dvh] flex flex-col"
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-extrabold text-white">Manage Subjects</h2>
            <p className="text-[11px] text-slate-400">
              Rename, recolor, reorder, or merge duplicate topics safely
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Manage Subjects"
            className="w-9 h-9 rounded-xl sp-badge flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto glass-scroll space-y-2 pr-1">
          {subjects.map((sub, idx) => {
            const isEditing = editingId === sub.id;
            const isMerging = mergingId === sub.id;
            const isConfirmDel = confirmDeleteId === sub.id;
            const loggedMins = minsByName.get(sub.name.toLowerCase()) || 0;
            const targets = subjects.filter((t) => t.id !== sub.id);

            return (
              <div key={sub.id} className="p-3 rounded-2xl sp-inset border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {onReorderSubjects && (
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveSubject(idx, -1)}
                          aria-label={`Move ${sub.name} up`}
                          className="w-6 h-5 rounded sp-badge flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === subjects.length - 1}
                          onClick={() => moveSubject(idx, 1)}
                          aria-label={`Move ${sub.name} down`}
                          className="w-6 h-5 rounded sp-badge flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <span
                      className="w-9 h-9 rounded-xl sp-badge flex items-center justify-center text-base shrink-0 border"
                      style={{ borderColor: `${resolveAccent(sub.color, themeId)}66` }}
                    >
                      {sub.icon}
                    </span>

                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-white truncate flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: resolveAccent(sub.color, themeId) }}
                        />
                        <span className="truncate">{sub.name}</span>
                      </div>
                      <div className="text-[10px] font-mono-num text-slate-400">
                        {(loggedMins / 60).toFixed(1)}h logged
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {onUpdateSubject && (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDeleteId(null);
                          setMergingId(null);
                          if (isEditing) {
                            setEditingId(null);
                          } else {
                            setEditingId(sub.id);
                            setEditName(sub.name);
                            setEditColor(sub.color);
                            setEditIcon(sub.icon);
                          }
                        }}
                        aria-label={`Edit ${sub.name}`}
                        className="w-9 h-9 rounded-xl sp-badge flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onMergeSubjects && targets.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setConfirmDeleteId(null);
                          if (isMerging) {
                            setMergingId(null);
                          } else {
                            setMergingId(sub.id);
                            setMergeTargetId(targets[0]?.id || null);
                          }
                        }}
                        aria-label={`Merge ${sub.name}`}
                        title="Merge into another subject"
                        className="w-9 h-9 rounded-xl sp-badge flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                      >
                        <GitMerge className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setMergingId(null);
                          setConfirmDeleteId(isConfirmDel ? null : sub.id);
                        }}
                        aria-label={`Delete ${sub.name}`}
                        className="w-9 h-9 rounded-xl sp-badge flex items-center justify-center text-slate-400 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <input
                      type="text"
                      maxLength={32}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl sp-input text-xs font-semibold"
                      placeholder="Subject name"
                    />
                    <div className="flex flex-wrap gap-1">
                      {SUBJECT_ICONS.map((ic) => (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => setEditIcon(ic)}
                          className={`w-8 h-8 rounded-lg text-sm cursor-pointer ${
                            editIcon === ic ? 'sp-tab-active' : 'sp-badge opacity-70'
                          }`}
                        >
                          {ic}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {SUBJECT_PALETTE_12.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setEditColor(c)}
                          className={`w-6 h-6 rounded-full border border-white/25 cursor-pointer ${
                            editColor.toUpperCase() === c.toUpperCase() ? 'ring-2 ring-white scale-110' : 'opacity-75'
                          }`}
                          style={{ backgroundColor: c }}
                          aria-label={`Color ${c}`}
                        />
                      ))}
                    </div>
                    <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cascadeSessions}
                        onChange={(e) => setCascadeSessions(e.target.checked)}
                        className="accent-current"
                      />
                      <span>Update matching past study logs</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={busyId === sub.id || !editName.trim()}
                        onClick={() => saveEdit(sub.id)}
                        className="px-3 py-1.5 rounded-xl sp-btn-primary text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer disabled:opacity-45"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{busyId === sub.id ? 'Saving...' : 'Save Subject'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-xl sp-badge text-[11px] font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {isMerging && targets.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <div className="text-[11px] text-slate-300">
                      Move all study logs and tasks from <strong>{sub.name}</strong> into:
                    </div>
                    <select
                      value={mergeTargetId ?? targets[0].id}
                      onChange={(e) => setMergeTargetId(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl sp-input text-xs font-semibold"
                    >
                      {targets.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.icon} {t.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={busyId === sub.id}
                        onClick={() => confirmMerge(sub.id)}
                        className="px-3 py-1.5 rounded-xl sp-btn-primary text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <GitMerge className="w-3.5 h-3.5" />
                        <span>{busyId === sub.id ? 'Merging...' : 'Confirm Merge'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMergingId(null)}
                        className="px-3 py-1.5 rounded-xl sp-badge text-[11px] font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {isConfirmDel && (
                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-300">
                      Remove &ldquo;{sub.name}&rdquo;? Existing history logs remain untouched.
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={busyId === sub.id}
                        onClick={() => confirmDelete(sub.id)}
                        className="px-3 py-1.5 rounded-xl sp-danger-pill text-[11px] font-extrabold cursor-pointer"
                      >
                        {busyId === sub.id ? 'Deleting...' : 'Confirm Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1.5 rounded-xl sp-badge text-[11px] font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
