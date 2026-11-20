import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Calculator,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  ClipboardCheck,
  Code2,
  Download,
  ExternalLink,
  FileText,
  Layers,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Shuffle,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react';
import { FlashcardItem, SubjectStat, UniversityData } from '../types';

interface UniversityVaultPanelProps {
  university: UniversityData;
  subjectBreakdown: SubjectStat[];
  coins: number;
  onSyncSubjects: () => Promise<void>;
  onReviewCard: (cardId: number, grade?: number, selectedIndex?: number) => Promise<{ isCorrect?: boolean } | void>;
  onCreateFlashcards: (payload: {
    subjectName: string;
    courseKey: string;
    front?: string;
    back?: string;
    markdownText?: string;
  }) => Promise<void>;
  onCompleteMockExam?: (results: Array<{ cardId: number; isCorrect: boolean }>) => Promise<{
    xpEarned: number;
    coinsEarned: number;
    shardsEarned: number;
  } | void>;
  onSaveNote: (payload: {
    id?: number;
    subjectName: string;
    title: string;
    contentMd: string;
  }) => Promise<void>;
  onDeleteNote: (id: number) => Promise<void>;
  onSaveExamGoal: (payload: {
    courseKey: string;
    subjectName: string;
    examTitle: string;
    examDate: string;
    targetHours: number;
  }) => Promise<void>;
}

type CategoryFilter = 'all' | 'theory' | 'trace' | 'numeric';

interface ExamResultSummary {
  correctCount: number;
  totalCount: number;
  scorePct: number;
  italianGrade: string;
  rewards: { xpEarned: number; coinsEarned: number; shardsEarned: number } | null;
  byCategory: Record<'theory' | 'trace' | 'numeric', { right: number; total: number }>;
  items: Array<{
    card: FlashcardItem;
    chosenIndex: number | null;
    isCorrect: boolean;
  }>;
}

function computeIpv4Plan(hostsRaw: number) {
  const hosts = Math.max(1, Math.min(16777214, Math.floor(hostsRaw || 1)));
  const needed = hosts + 2;
  let h = 0;
  while (2 ** h < needed && h < 31) h++;
  const total = 2 ** h;
  const usable = Math.max(0, total - 2);
  const prefix = Math.max(1, 32 - h);
  const bits = '1'.repeat(prefix) + '0'.repeat(32 - prefix);
  const binaryMask = [0, 8, 16, 24].map((i) => bits.slice(i, i + 8)).join('.');
  const decimalMask = [0, 8, 16, 24].map((i) => parseInt(bits.slice(i, i + 8), 2)).join('.');
  return { hosts, needed, h, total, usable, prefix, binaryMask, decimalMask };
}

function formatExamClock(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

function formatItalianGrade(pct: number): string {
  if (pct >= 98) return '30L / 30 (Cum Laude)';
  if (pct < 55) return `${Math.max(0, Math.round((pct / 100) * 30))}/30 · Review Needed`;
  const grade = Math.min(30, Math.max(18, Math.round(18 + ((pct - 55) / 43) * 12)));
  return `${grade}/30`;
}

function categoryMeta(cat?: string) {
  if (cat === 'trace') return { label: '💻 Code & Trace', short: 'Trace' };
  if (cat === 'numeric') return { label: '🧮 Numeric & Math', short: 'Numeric' };
  return { label: '📖 Theory', short: 'Theory' };
}

export function UniversityVaultPanel({
  university,
  subjectBreakdown,
  onSyncSubjects,
  onReviewCard,
  onCreateFlashcards,
  onCompleteMockExam,
  onSaveNote,
  onDeleteNote,
  onSaveExamGoal,
}: UniversityVaultPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [subTab, setSubTab] = useState<'cards' | 'exam' | 'labs' | 'notes'>('cards');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [pickedOption, setPickedOption] = useState<number | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [syncingCourses, setSyncingCourses] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  // Add/Import flashcards
  const [showAddCard, setShowAddCard] = useState(false);
  const [importMode, setImportMode] = useState<'single' | 'markdown'>('single');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [markdownBulk, setMarkdownBulk] = useState('');

  // Mock Exam Simulator State
  const [examLength, setExamLength] = useState<10 | 20 | 40>(10);
  const [examCourse, setExamCourse] = useState<string>('all');
  const [examCategory, setExamCategory] = useState<CategoryFilter>('all');
  const [examPoolMode, setExamPoolMode] = useState<'all' | 'due'>('all');
  const [examQuestions, setExamQuestions] = useState<FlashcardItem[]>([]);
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examQIdx, setExamQIdx] = useState(0);
  const [examRemainingSec, setExamRemainingSec] = useState(0);
  const [examRunning, setExamRunning] = useState(false);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [examResult, setExamResult] = useState<ExamResultSummary | null>(null);

  // University Interactive Lab Calculators
  const [cidrHosts, setCidrHosts] = useState(300);
  const [cpuCycles, setCpuCycles] = useState(126);
  const [cpuFreqHz, setCpuFreqHz] = useState(1750);
  const [amdahlP, setAmdahlP] = useState(0.6);
  const [amdahlS, setAmdahlS] = useState(4);

  // Obsidian Scratchpad & Exam Planner
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState('Computer Architectures');
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examSubject, setExamSubject] = useState('Computer Architectures');
  const [examDate, setExamDate] = useState('2027-01-25');
  const [examHours, setExamHours] = useState(40);

  const selectedCourse = useMemo(
    () => university.courses.find((c) => c.key === courseFilter) || null,
    [university.courses, courseFilter]
  );

  const courseCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const card of university.flashcards) {
      map[card.courseKey] = (map[card.courseKey] || 0) + 1;
    }
    return map;
  }, [university.flashcards]);

  const filteredCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = university.flashcards.filter((c) => {
      if (courseFilter !== 'all' && c.courseKey !== courseFilter) return false;
      if (categoryFilter !== 'all' && (c.category || 'theory') !== categoryFilter) return false;
      if (q) {
        const hay = `${c.conceptTitle} ${c.front} ${c.subjectName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return [...list].sort((a, b) => Number(b.isDue) - Number(a.isDue) || a.nextReviewAt - b.nextReviewAt);
  }, [university.flashcards, courseFilter, categoryFilter, searchQuery]);

  const activeCard = filteredCards.length > 0 ? filteredCards[cardIndex % filteredCards.length] : null;
  const cidrPlan = useMemo(() => computeIpv4Plan(cidrHosts), [cidrHosts]);
  const weightedSec = cpuCycles / Math.max(1, cpuFreqHz);
  const amdahlSpeedup = 1 / ((1 - amdahlP) + amdahlP / Math.max(1, amdahlS));
  const amdahlMax = 1 / Math.max(0.01, 1 - amdahlP);

  // Mock Exam countdown timer
  useEffect(() => {
    if (!examRunning) return;
    const id = window.setInterval(() => {
      setExamRemainingSec((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [examRunning]);

  useEffect(() => {
    if (examRunning && examRemainingSec === 0 && examQuestions.length > 0 && !submittingExam) {
      finishMockExam();
    }
  }, [examRunning, examRemainingSec]);

  function shuffleDeck() {
    if (filteredCards.length <= 1) return;
    const nextIdx = Math.floor(Math.random() * filteredCards.length);
    setCardIndex(nextIdx);
    setFlipped(false);
    setPickedOption(null);
  }

  function startMockExam(customList?: FlashcardItem[]) {
    let pool: FlashcardItem[];
    if (customList && customList.length > 0) {
      pool = [...customList];
    } else {
      pool = university.flashcards.filter((c) => {
        if (!c.options || c.options.length < 2) return false;
        if (examCourse !== 'all' && c.courseKey !== examCourse) return false;
        if (examCategory !== 'all' && (c.category || 'theory') !== examCategory) return false;
        if (examPoolMode === 'due' && !c.isDue && c.reviewCount > 0) return false;
        return true;
      });
      if (pool.length === 0) {
        pool = university.flashcards.filter(
          (c) =>
            c.options?.length >= 2 &&
            (examCourse === 'all' || c.courseKey === examCourse) &&
            (examCategory === 'all' || (c.category || 'theory') === examCategory)
        );
      }
      // Shuffle pool using Fisher-Yates
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = pool[i];
        pool[i] = pool[j];
        pool[j] = tmp;
      }
      pool = pool.slice(0, Math.min(examLength, pool.length));
    }

    if (pool.length === 0) return;
    setExamQuestions(pool);
    setExamAnswers({});
    setExamQIdx(0);
    setExamResult(null);
    setExamRemainingSec(pool.length * 60);
    setExamRunning(true);
  }

  async function finishMockExam() {
    if (submittingExam || examQuestions.length === 0) return;
    setSubmittingExam(true);
    setExamRunning(false);
    try {
      const items = examQuestions.map((card, idx) => {
        const chosen = examAnswers[idx] ?? null;
        const isCorrect = chosen !== null && chosen === card.correctIndex;
        return { card, chosenIndex: chosen, isCorrect };
      });
      const correctCount = items.filter((it) => it.isCorrect).length;
      const totalCount = items.length;
      const scorePct = Math.round((correctCount / Math.max(1, totalCount)) * 100);
      const byCategory: ExamResultSummary['byCategory'] = {
        theory: { right: 0, total: 0 },
        trace: { right: 0, total: 0 },
        numeric: { right: 0, total: 0 },
      };
      for (const it of items) {
        const cat = (it.card.category || 'theory') as 'theory' | 'trace' | 'numeric';
        if (byCategory[cat]) {
          byCategory[cat].total += 1;
          if (it.isCorrect) byCategory[cat].right += 1;
        }
      }

      let rewards: { xpEarned: number; coinsEarned: number; shardsEarned: number } | null = null;
      if (onCompleteMockExam) {
        const res = await onCompleteMockExam(items.map((it) => ({ cardId: it.card.id, isCorrect: it.isCorrect })));
        if (res) rewards = res;
      }

      setExamResult({
        correctCount,
        totalCount,
        scorePct,
        italianGrade: formatItalianGrade(scorePct),
        rewards,
        byCategory,
        items,
      });
    } finally {
      setSubmittingExam(false);
    }
  }

  async function handleSync() {
    if (syncingCourses) return;
    setSyncingCourses(true);
    try {
      await onSyncSubjects();
      setSyncMsg('4 Courses Synced');
      setTimeout(() => setSyncMsg(null), 2200);
    } finally {
      setSyncingCourses(false);
    }
  }

  async function handleGrade(grade: number) {
    if (!activeCard || reviewing) return;
    setReviewing(true);
    try {
      await onReviewCard(activeCard.id, grade, pickedOption ?? undefined);
      setFlipped(false);
      setPickedOption(null);
      setCardIndex((prev) => (prev + 1) % Math.max(1, filteredCards.length));
    } finally {
      setReviewing(false);
    }
  }

  async function submitCards(e: React.FormEvent) {
    e.preventDefault();
    const course = university.courses.find((c) => c.key === (courseFilter === 'all' ? 'comp_arch' : courseFilter));
    await onCreateFlashcards({
      courseKey: course?.key || 'custom',
      subjectName: course?.name || 'University Study',
      front: importMode === 'single' ? newFront : undefined,
      back: importMode === 'single' ? newBack : undefined,
      markdownText: importMode === 'markdown' ? markdownBulk : undefined,
    });
    setNewFront('');
    setNewBack('');
    setMarkdownBulk('');
    setShowAddCard(false);
  }

  async function submitNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim() || savingNote) return;
    setSavingNote(true);
    try {
      await onSaveNote({
        subjectName: noteSubject,
        title: noteTitle.trim(),
        contentMd: noteContent.trim(),
      });
      setNoteTitle('');
      setNoteContent('');
    } finally {
      setSavingNote(false);
    }
  }

  function downloadObsidianMd(title: string, subject: string, content: string) {
    const today = new Date().toISOString().slice(0, 10);
    const slug = subject.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const md = `---\ntype: learning-progress\ncourse: ${subject}\ndate: ${today}\ntags: [learning-progress, ${slug}]\n---\n\n# ${title}\n\n${content}\n`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9_-]+/g, '_')}_${today}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function submitExam(e: React.FormEvent) {
    e.preventDefault();
    if (!examTitle.trim()) return;
    const matchCourse = university.courses.find((c) => c.name === examSubject);
    await onSaveExamGoal({
      courseKey: matchCourse?.key || 'custom',
      subjectName: examSubject,
      examTitle: examTitle.trim(),
      examDate,
      targetHours: examHours,
    });
    setExamTitle('');
    setShowAddExam(false);
  }

  const activeExamQuestion = examQuestions[examQIdx] || null;
  const answeredExamCount = Object.keys(examAnswers).length;

  return (
    <div className="glass-card rounded-3xl p-4 space-y-3">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-left cursor-pointer"
        >
          <span className="w-7 h-7 rounded-xl sp-inset flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-white" />
          </span>
          <div>
            <div className="text-xs font-extrabold text-white flex items-center gap-1.5 flex-wrap">
              <span>University Vault &amp; Active Learning</span>
              <span className="px-2 py-0.5 rounded-full sp-badge text-[10px] font-mono-num">
                {university.dueCount} due · {university.flashcards.length} bank
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              {university.flashcards.length}-Q Test Bank, Timed Mock Exams &amp; Lab Calculators
            </div>
          </div>
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSync}
            disabled={syncingCourses}
            className="px-2.5 py-1.5 rounded-xl sp-badge text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:opacity-90"
            title="Sync all 4 Politecnico di Torino courses into your Subjects"
          >
            <RefreshCw className={`w-3 h-3 ${syncingCourses ? 'animate-spin' : ''}`} />
            <span>{syncMsg || 'Sync Courses'}</span>
          </button>
          <a
            href={university.portalUrl}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1.5 rounded-xl sp-badge text-[11px] font-bold flex items-center gap-1 hover:opacity-90"
            title="Open Obsidian University Vault"
          >
            <span>Vault</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {expanded && (
        <div className="space-y-3 pt-1">
          {/* 4-Tab Switcher (Flashcards | Mock Exam | Calculators | Notes & Exams) */}
          <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl sp-inset">
            {(
              [
                ['cards', 'Flashcards', Layers],
                ['exam', 'Mock Exam', ClipboardCheck],
                ['labs', 'Calculators', Calculator],
                ['notes', 'Notes & Exams', FileText],
              ] as const
            ).map(([k, label, Icon]) => (
              <button
                key={k}
                type="button"
                onClick={() => setSubTab(k)}
                className={`py-1.5 px-1.5 rounded-xl text-[10.5px] sm:text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition min-w-0 ${
                  subTab === k ? 'sp-tab-active' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>

          {/* 1. FSRS FLASHCARD REVIEWER (320-Question Bank with Course & Style Filters) */}
          {subTab === 'cards' && (
            <div className="space-y-2.5">
              {/* Course Filter Pills with Total Counts */}
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCourseFilter('all');
                      setCardIndex(0);
                      setFlipped(false);
                      setPickedOption(null);
                    }}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                      courseFilter === 'all' ? 'sp-btn-primary' : 'sp-badge'
                    }`}
                  >
                    All ({university.flashcards.length})
                  </button>
                  {university.courses.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => {
                        setCourseFilter(c.key);
                        setCardIndex(0);
                        setFlipped(false);
                        setPickedOption(null);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer flex items-center gap-1 ${
                        courseFilter === c.key ? 'sp-btn-primary' : 'sp-badge'
                      }`}
                    >
                      <span>{c.icon}</span>
                      <span>
                        {c.shortName} ({courseCounts[c.key] || 0})
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={shuffleDeck}
                    title="Jump to a random question"
                    className="px-2 py-1 rounded-full sp-badge text-[10px] font-bold flex items-center gap-1 cursor-pointer hover:opacity-90"
                  >
                    <Shuffle className="w-3 h-3" /> Random
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCard((v) => !v)}
                    className="px-2.5 py-1 rounded-full sp-badge text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
              </div>

              {/* Question Style Filter + Topic Search Row */}
              <div className="flex flex-wrap items-center gap-1.5">
                <div className="flex flex-wrap gap-1">
                  {(
                    [
                      ['all', 'All Styles'],
                      ['theory', '📖 Theory'],
                      ['trace', '💻 Code & Trace'],
                      ['numeric', '🧮 Numeric'],
                    ] as const
                  ).map(([catKey, catLabel]) => (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => {
                        setCategoryFilter(catKey);
                        setCardIndex(0);
                        setFlipped(false);
                        setPickedOption(null);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer border transition ${
                        categoryFilter === catKey ? 'sp-tab-active text-white' : 'sp-inset text-slate-400 hover:text-white'
                      }`}
                    >
                      {catLabel}
                    </button>
                  ))}
                </div>
                <div className="relative flex-1 min-w-[130px]">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Filter topic (e.g. ARM, OSPF, Gini)"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCardIndex(0);
                    }}
                    className="w-full pl-7 pr-2.5 py-1 rounded-lg sp-input text-[10.5px]"
                  />
                </div>
              </div>

              {selectedCourse && (
                <div className="p-2.5 rounded-2xl sp-inset space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                    <span>
                      {selectedCourse.icon} {selectedCourse.name} — Reading Trail
                    </span>
                    <a
                      href={selectedCourse.portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline flex items-center gap-0.5 text-slate-300"
                    >
                      Open Course <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedCourse.readingTrail.map((step, i) => (
                      <span key={step} className="px-2 py-0.5 rounded-md sp-badge text-[9px] text-slate-300">
                        {i + 1}. {step}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {showAddCard && (
                <form onSubmit={submitCards} className="p-3 rounded-2xl sp-inset space-y-2 border border-white/15">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex gap-1.5 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setImportMode('single')}
                        className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                          importMode === 'single' ? 'sp-btn-primary' : 'sp-badge'
                        }`}
                      >
                        Single Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setImportMode('markdown')}
                        className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                          importMode === 'markdown' ? 'sp-btn-primary' : 'sp-badge'
                        }`}
                      >
                        Bulk Obsidian Import (::)
                      </button>
                    </div>
                    <span className="text-[9.5px] text-emerald-300 font-semibold">Auto-generates 4 MCQ choices</span>
                  </div>
                  {importMode === 'single' ? (
                    <>
                      <input
                        type="text"
                        required
                        placeholder="Question / Front"
                        value={newFront}
                        onChange={(e) => setNewFront(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl sp-input text-xs"
                      />
                      <textarea
                        rows={2}
                        required
                        placeholder="Explanation / Answer"
                        value={newBack}
                        onChange={(e) => setNewBack(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl sp-input text-xs"
                      />
                    </>
                  ) : (
                    <textarea
                      rows={3}
                      required
                      placeholder="- What does EPT translate? :: Guest physical to host physical in hardware"
                      value={markdownBulk}
                      onChange={(e) => setMarkdownBulk(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl sp-input text-xs font-mono"
                    />
                  )}
                  <button type="submit" className="w-full py-2 rounded-xl sp-btn-primary text-xs font-extrabold cursor-pointer">
                    Save to FSRS Deck
                  </button>
                </form>
              )}

              {activeCard ? (
                <div className="p-3.5 rounded-2xl sp-inset border border-white/10 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[10px]">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="px-2 py-0.5 rounded-full sp-badge font-bold">
                        {activeCard.subjectName} · {activeCard.conceptTitle}
                      </span>
                      <span className="px-2 py-0.5 rounded-full sp-badge font-semibold">
                        {categoryMeta(activeCard.category).label}
                      </span>
                      {activeCard.difficulty && (
                        <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-slate-300 uppercase text-[9px] font-bold">
                          {activeCard.difficulty}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 font-mono-num text-slate-400">
                      <button
                        type="button"
                        onClick={() => {
                          setCardIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
                          setFlipped(false);
                          setPickedOption(null);
                        }}
                        aria-label="Previous card"
                        className="p-0.5 hover:text-white cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span>
                        {(cardIndex % filteredCards.length) + 1}/{filteredCards.length} · {activeCard.intervalDays}d
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCardIndex((prev) => (prev + 1) % filteredCards.length);
                          setFlipped(false);
                          setPickedOption(null);
                        }}
                        aria-label="Next card"
                        className="p-0.5 hover:text-white cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-white leading-relaxed whitespace-pre-line">
                    {activeCard.front}
                  </div>

                  {activeCard.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {activeCard.options.map((opt, idx) => {
                        const answered = pickedOption !== null;
                        const isRight = idx === activeCard.correctIndex;
                        const isPicked = idx === pickedOption;
                        let styleCls = 'sp-badge hover:opacity-90';
                        if (answered) {
                          if (isRight) styleCls = 'border-emerald-400/70 bg-emerald-500/15 text-emerald-200';
                          else if (isPicked) styleCls = 'border-rose-400/70 bg-rose-500/15 text-rose-200';
                        }
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setPickedOption(idx);
                              setFlipped(true);
                            }}
                            className={`text-left px-2.5 py-2 rounded-xl border text-[11px] font-semibold cursor-pointer transition ${styleCls}`}
                          >
                            {String.fromCharCode(65 + idx)}. {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {flipped ? (
                    <div className="p-2.5 rounded-xl bg-black/25 border border-white/10 space-y-2">
                      <div className="text-[11px] text-slate-200 leading-relaxed whitespace-pre-line">
                        {activeCard.back}
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          [1, 'Again', '5m'],
                          [2, 'Hard', '1d'],
                          [3, 'Good', `${Math.max(1, activeCard.intervalDays || 1)}d`],
                          [4, 'Easy', '+30%'],
                        ].map(([g, label, hint]) => (
                          <button
                            key={String(g)}
                            type="button"
                            disabled={reviewing}
                            onClick={() => handleGrade(Number(g))}
                            className="py-1.5 px-1 rounded-xl sp-btn-primary text-[10px] font-extrabold cursor-pointer flex flex-col items-center"
                          >
                            <span>{label}</span>
                            <span className="opacity-75 font-mono-num text-[9px]">{hint}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setFlipped(true)}
                      className="w-full py-2 rounded-xl sp-badge text-xs font-bold cursor-pointer hover:opacity-90 flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Reveal Answer &amp; Grade FSRS (+10 XP)
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl sp-inset text-center text-xs text-slate-400">
                  No matching questions for this filter. Clear search or switch style filter.
                </div>
              )}
            </div>
          )}

          {/* 2. TIMED MOCK EXAM SIMULATOR */}
          {subTab === 'exam' && (
            <div className="space-y-3">
              {/* SETUP VIEW */}
              {!examRunning && !examResult && (
                <div className="p-3.5 rounded-2xl sp-inset border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <ClipboardCheck className="w-4 h-4" />
                        <span>Timed Mock Exam Simulator</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Graded on the 30-point Politecnico scale · updates FSRS + awards bonus XP &amp; Coins
                      </div>
                    </div>
                    <span className="sp-badge px-2 py-0.5 rounded-full text-[10px] font-mono-num font-bold">
                      {university.flashcards.length} Qs ready
                    </span>
                  </div>

                  {/* Exam Length */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Exam Length</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          [10, '10 Qs · 10m', 'Quick Drill'],
                          [20, '20 Qs · 20m', 'Midterm'],
                          [40, '40 Qs · 40m', 'Full Exam'],
                        ] as const
                      ).map(([len, title, sub]) => (
                        <button
                          key={len}
                          type="button"
                          onClick={() => setExamLength(len)}
                          className={`p-2 rounded-xl border text-center cursor-pointer transition ${
                            examLength === len ? 'sp-tab-active text-white' : 'sp-badge text-slate-300'
                          }`}
                        >
                          <div className="text-[11px] font-extrabold">{title}</div>
                          <div className="text-[9.5px] opacity-75">{sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Course & Style Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="space-y-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Course Scope
                      <select
                        value={examCourse}
                        onChange={(e) => setExamCourse(e.target.value)}
                        className="mt-1 w-full px-2.5 py-2 rounded-xl sp-input text-xs font-semibold"
                      >
                        <option value="all">All 4 Courses ({university.flashcards.length} Qs)</option>
                        {university.courses.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.icon} {c.name} ({courseCounts[c.key] || 0})
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Question Style
                      <select
                        value={examCategory}
                        onChange={(e) => setExamCategory(e.target.value as CategoryFilter)}
                        className="mt-1 w-full px-2.5 py-2 rounded-xl sp-input text-xs font-semibold"
                      >
                        <option value="all">Mixed (Theory + Trace + Numeric)</option>
                        <option value="theory">📖 Theory &amp; Concepts Only</option>
                        <option value="trace">💻 Code &amp; Assembly Traces Only</option>
                        <option value="numeric">🧮 Numeric &amp; Math Drills Only</option>
                      </select>
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setExamPoolMode('all')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                          examPoolMode === 'all' ? 'sp-tab-active' : 'sp-badge'
                        }`}
                      >
                        All Questions
                      </button>
                      <button
                        type="button"
                        onClick={() => setExamPoolMode('due')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                          examPoolMode === 'due' ? 'sp-tab-active' : 'sp-badge'
                        }`}
                      >
                        Due / Weak First
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => startMockExam()}
                      className="px-4 py-2 rounded-xl sp-btn-primary text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Start Mock Exam</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ACTIVE EXAM VIEW */}
              {examRunning && activeExamQuestion && (
                <div className="p-3.5 rounded-2xl sp-inset border border-white/15 space-y-3">
                  {/* Top Bar: Progress & Countdown */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-full sp-btn-primary font-mono-num font-extrabold">
                        Q {examQIdx + 1}/{examQuestions.length}
                      </span>
                      <span className="px-2 py-0.5 rounded-full sp-badge font-bold">
                        {activeExamQuestion.subjectName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full sp-badge font-semibold">
                        {categoryMeta(activeExamQuestion.category).short}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono-num text-xs font-extrabold text-amber-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatExamClock(examRemainingSec)}
                      </span>
                      <span className="text-[10px] font-mono-num text-slate-400">
                        {answeredExamCount}/{examQuestions.length} answered
                      </span>
                    </div>
                  </div>

                  {/* Clickable Question Pills */}
                  <div className="flex flex-wrap gap-1">
                    {examQuestions.map((_, i) => {
                      const answered = examAnswers[i] !== undefined;
                      const current = i === examQIdx;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setExamQIdx(i)}
                          className={`w-6 h-6 rounded-md font-mono-num text-[10px] font-bold cursor-pointer border transition ${
                            current
                              ? 'sp-btn-primary'
                              : answered
                                ? 'sp-tab-active text-white'
                                : 'sp-badge text-slate-400'
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* Question Prompt */}
                  <div className="text-xs font-bold text-white leading-relaxed whitespace-pre-line">
                    {activeExamQuestion.front}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {activeExamQuestion.options.map((opt, idx) => {
                      const picked = examAnswers[examQIdx] === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setExamAnswers((prev) => ({ ...prev, [examQIdx]: idx }))}
                          className={`text-left px-2.5 py-2 rounded-xl border text-[11px] font-semibold cursor-pointer transition ${
                            picked ? 'sp-tab-active text-white ring-1 ring-current' : 'sp-badge hover:opacity-90'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}. {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation & Submit */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        disabled={examQIdx === 0}
                        onClick={() => setExamQIdx((i) => Math.max(0, i - 1))}
                        className="px-3 py-1.5 rounded-xl sp-badge text-[11px] font-bold cursor-pointer disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        disabled={examQIdx >= examQuestions.length - 1}
                        onClick={() => setExamQIdx((i) => Math.min(examQuestions.length - 1, i + 1))}
                        className="px-3 py-1.5 rounded-xl sp-badge text-[11px] font-bold cursor-pointer disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={submittingExam}
                      onClick={finishMockExam}
                      className="px-4 py-1.5 rounded-xl sp-btn-primary text-xs font-extrabold cursor-pointer"
                    >
                      {submittingExam ? 'Grading...' : 'Submit Exam'}
                    </button>
                  </div>
                </div>
              )}

              {/* EXAM RESULTS & FULL SOLUTIONS */}
              {!examRunning && examResult && (
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl sp-tab-active border border-white/15 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                          Mock Exam Grade Report
                        </div>
                        <div className="text-lg font-extrabold text-white font-mono-num">
                          {examResult.correctCount}/{examResult.totalCount} ({examResult.scorePct}%) ·{' '}
                          <span className="text-emerald-300">{examResult.italianGrade}</span>
                        </div>
                      </div>
                      {examResult.rewards && (
                        <div className="flex flex-wrap gap-1.5 text-[10px] font-mono-num font-bold">
                          <span className="px-2 py-1 rounded-full sp-badge">+{examResult.rewards.xpEarned} XP</span>
                          <span className="px-2 py-1 rounded-full sp-badge">+{examResult.rewards.coinsEarned}🪙</span>
                          <span className="px-2 py-1 rounded-full sp-badge">+{examResult.rewards.shardsEarned}✦</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                      {(['theory', 'trace', 'numeric'] as const).map((cat) => {
                        const stat = examResult.byCategory[cat];
                        const pct = stat.total > 0 ? Math.round((stat.right / stat.total) * 100) : null;
                        return (
                          <div key={cat} className="p-2 rounded-xl sp-inset text-center">
                            <div className="text-slate-400 font-semibold">{categoryMeta(cat).label}</div>
                            <div className="font-mono-num font-extrabold text-white mt-0.5">
                              {stat.total > 0 ? `${stat.right}/${stat.total} (${pct}%)` : '—'}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {examResult.items.some((it) => !it.isCorrect) && (
                        <button
                          type="button"
                          onClick={() => startMockExam(examResult.items.filter((it) => !it.isCorrect).map((it) => it.card))}
                          className="px-3 py-1.5 rounded-xl sp-btn-primary text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" /> Retry Missed (
                          {examResult.items.filter((it) => !it.isCorrect).length})
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setExamResult(null)}
                        className="px-3 py-1.5 rounded-xl sp-badge text-[11px] font-bold cursor-pointer hover:opacity-90"
                      >
                        New Mock Exam
                      </button>
                    </div>
                  </div>

                  {/* Detailed Solution Breakdown */}
                  <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                    {examResult.items.map((it, idx) => (
                      <div key={it.card.id} className="p-2.5 rounded-2xl sp-inset border border-white/10 space-y-1">
                        <div className="flex items-start justify-between gap-2 text-[11px]">
                          <div className="font-bold text-white whitespace-pre-line">
                            Q{idx + 1}. {it.card.front}
                          </div>
                          {it.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </div>
                        <div className="text-[10px] font-mono-num text-emerald-300">
                          Correct: {String.fromCharCode(65 + it.card.correctIndex)}. {it.card.options[it.card.correctIndex]}
                          {!it.isCorrect && it.chosenIndex !== null && (
                            <span className="text-rose-300 ml-2">
                              (Picked {String.fromCharCode(65 + it.chosenIndex)})
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-300 leading-snug">{it.card.back}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. INTERACTIVE UNIVERSITY LAB CALCULATORS */}
          {subTab === 'labs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* IPv4 Host-Sizing Tutor */}
              <div className="p-3 rounded-2xl sp-inset space-y-2 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-white">🌐 IPv4 CIDR Host-Sizing Tutor</span>
                  <span className="text-[10px] font-mono-num sp-badge px-2 py-0.5 rounded-full">/{cidrPlan.prefix}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-400">Required Hosts:</span>
                  <input
                    type="number"
                    min={1}
                    max={65534}
                    value={cidrHosts}
                    onChange={(e) => setCidrHosts(Number(e.target.value))}
                    aria-label="Required IPv4 hosts"
                    className="w-24 px-2 py-1 rounded-lg sp-input text-xs font-mono-num"
                  />
                </div>
                <div className="text-[10px] space-y-1 font-mono-num text-slate-300">
                  <div>
                    1. Hosts + 2 reserved = <b className="text-white">{cidrPlan.needed}</b>
                  </div>
                  <div>
                    2. Smallest 2^h &gt;= {cidrPlan.needed}: h = <b className="text-white">{cidrPlan.h}</b> (total{' '}
                    {cidrPlan.total})
                  </div>
                  <div>
                    3. Prefix: 32 - {cidrPlan.h} = <b className="text-white">/{cidrPlan.prefix}</b> · Usable:{' '}
                    <b className="text-white">{cidrPlan.usable}</b>
                  </div>
                  <div>
                    4. Decimal Mask: <b className="text-white">{cidrPlan.decimalMask}</b>
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">Binary: {cidrPlan.binaryMask}</div>
                </div>
              </div>

              {/* Computer Architectures Lab 01 & 02 Calculator */}
              <div className="p-3 rounded-2xl sp-inset space-y-2 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-white">🦀 ASE Studio &amp; Amdahl Lab</span>
                  <span className="text-[10px] font-mono-num sp-badge px-2 py-0.5 rounded-full">
                    {amdahlSpeedup.toFixed(2)}x
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <label className="text-slate-400">
                    Cycles
                    <input
                      type="number"
                      min={1}
                      value={cpuCycles}
                      onChange={(e) => setCpuCycles(Number(e.target.value))}
                      className="mt-0.5 w-full px-2 py-1 rounded-lg sp-input text-xs font-mono-num"
                    />
                  </label>
                  <label className="text-slate-400">
                    Freq (Hz)
                    <input
                      type="number"
                      min={1}
                      value={cpuFreqHz}
                      onChange={(e) => setCpuFreqHz(Number(e.target.value))}
                      className="mt-0.5 w-full px-2 py-1 rounded-lg sp-input text-xs font-mono-num"
                    />
                  </label>
                  <label className="text-slate-400">
                    Parallel frac p
                    <input
                      type="number"
                      min={0}
                      max={0.99}
                      step={0.05}
                      value={amdahlP}
                      onChange={(e) => setAmdahlP(Number(e.target.value))}
                      className="mt-0.5 w-full px-2 py-1 rounded-lg sp-input text-xs font-mono-num"
                    />
                  </label>
                  <label className="text-slate-400">
                    Speedup factor s
                    <input
                      type="number"
                      min={1}
                      max={64}
                      value={amdahlS}
                      onChange={(e) => setAmdahlS(Number(e.target.value))}
                      className="mt-0.5 w-full px-2 py-1 rounded-lg sp-input text-xs font-mono-num"
                    />
                  </label>
                </div>
                <div className="text-[10px] font-mono-num text-slate-300 space-y-0.5">
                  <div>
                    Exec Time T_i = <b className="text-white">{weightedSec.toFixed(4)} s</b>
                  </div>
                  <div>
                    Amdahl S = <b className="text-white">{amdahlSpeedup.toFixed(2)}x</b> (Max bound{' '}
                    {amdahlMax.toFixed(2)}x)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. OBSIDIAN SESSION NOTES & EXAM COUNTDOWN */}
          {subTab === 'notes' && (
            <div className="space-y-3">
              {/* Exam Countdown Cards */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span className="flex items-center gap-1">
                    <CalendarClock className="w-3.5 h-3.5" /> Exam Countdown &amp; Pacing
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddExam((v) => !v)}
                    className="px-2 py-0.5 rounded-full sp-badge text-[10px] cursor-pointer"
                  >
                    + Goal
                  </button>
                </div>
                {showAddExam && (
                  <form onSubmit={submitExam} className="p-2.5 rounded-2xl sp-inset grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      required
                      placeholder="Exam title"
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                      className="col-span-2 px-2.5 py-1.5 rounded-xl sp-input text-xs"
                    />
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="px-2 py-1.5 rounded-xl sp-input text-xs"
                    />
                    <input
                      type="number"
                      min={5}
                      max={200}
                      value={examHours}
                      onChange={(e) => setExamHours(Number(e.target.value))}
                      className="px-2 py-1.5 rounded-xl sp-input text-xs"
                    />
                    <button
                      type="submit"
                      className="col-span-2 py-1.5 rounded-xl sp-btn-primary text-xs font-extrabold cursor-pointer"
                    >
                      Save Exam Countdown
                    </button>
                  </form>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {university.examGoals.slice(0, 4).map((g) => {
                    const daysLeft = Math.max(1, Math.ceil((new Date(g.examDate).getTime() - Date.now()) / 86400_000));
                    const loggedMins = subjectBreakdown.find((s) => s.name === g.subjectName)?.minutes || 0;
                    const remMins = Math.max(0, g.targetHours * 60 - loggedMins);
                    const paceMinsPerDay = Math.ceil(remMins / daysLeft);
                    return (
                      <div key={g.id} className="p-2.5 rounded-2xl sp-inset border border-white/10">
                        <div className="text-[11px] font-bold text-white truncate">{g.examTitle}</div>
                        <div className="text-[10px] font-mono-num text-slate-400">
                          {daysLeft}d left · {(loggedMins / 60).toFixed(1)}h / {g.targetHours}h
                        </div>
                        <div className="text-[10px] font-bold text-emerald-300 mt-0.5">
                          Pace: {paceMinsPerDay}m/day
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Obsidian Scratchpad Composer */}
              <form onSubmit={submitNote} className="p-2.5 rounded-2xl sp-inset space-y-2 border border-white/10">
                <div className="text-[11px] font-bold text-white">📝 Obsidian 00 Inbox Session Note</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    placeholder="Note title (e.g. OSPF LSAs)"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl sp-input text-xs"
                  />
                  <select
                    value={noteSubject}
                    onChange={(e) => setNoteSubject(e.target.value)}
                    className="px-2 py-1.5 rounded-xl sp-input text-xs"
                  >
                    {university.courses.map((c) => (
                      <option key={c.key} value={c.name}>
                        {c.shortName}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  rows={2}
                  placeholder="Key formulas, recall questions, or takeaways in Markdown..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl sp-input text-xs"
                />
                <button
                  type="submit"
                  disabled={savingNote}
                  className="w-full py-1.5 rounded-xl sp-btn-primary text-xs font-extrabold cursor-pointer"
                >
                  {savingNote ? 'Saving...' : 'Save Note'}
                </button>
              </form>

              {university.notes.slice(0, 3).map((n) => (
                <div key={n.id} className="p-2.5 rounded-2xl sp-inset border border-white/10 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-white truncate">{n.title}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => downloadObsidianMd(n.title, n.subjectName, n.contentMd)}
                        className="px-2 py-0.5 rounded-lg sp-badge text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Download Obsidian Markdown with YAML frontmatter"
                      >
                        <Download className="w-2.5 h-2.5" /> .md
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteNote(n.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 whitespace-pre-line">{n.contentMd}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
