import React, { useState, useEffect } from 'react';
import { Decision } from '../../types/decision';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { 
  formatCurrency, 
  formatDate, 
  isPastDate, 
  getDaysOverdue, 
  getDaysElapsed,
  getDaysUntil,
  cn, 
  getDepartmentAvatarStyle, 
  getInitials 
} from '../../lib/utils';
import { 
  X, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Calendar, 
  ArrowRight,
  GitCommit,
  UserCheck,
  TrendingUp,
  Activity,
  Send,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DecisionSidePanelProps {
  decision: Decision | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDeepDive: (decision: Decision) => void;
}

interface ActivityNote {
  id: string;
  author: string;
  role: string;
  date: string;
  text: string;
  tag?: 'milestone' | 'warning' | 'audit' | 'general';
}

export function DecisionSidePanel({
  decision,
  isOpen,
  onClose,
  onOpenDeepDive,
}: DecisionSidePanelProps) {
  const [newNote, setNewNote] = useState('');
  const [activeTimelineStep, setActiveTimelineStep] = useState<number | null>(null);
  const [notes, setNotes] = useState<ActivityNote[]>([]);
  const [isActivityExpanded, setIsActivityExpanded] = useState(false);

  // ESC key listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Initialize or reset activity notes based on the selected decision
  useEffect(() => {
    if (!decision) return;
    setIsActivityExpanded(false);

    const isOverdue = decision.status === 'Review Due' && isPastDate(decision.targetReviewDate);
    const daysOverdue = isOverdue ? getDaysOverdue(decision.targetReviewDate) : 0;

    const initialNotes: ActivityNote[] = [
      {
        id: 'n1',
        author: 'Executive Governance Committee',
        role: 'Audit Sign-off',
        date: formatDate(decision.createdAt),
        text: `Baseline commitment locked at ${formatCurrency(decision.originalEstimates.capitalAtRisk)} with ${decision.originalEstimates.expectedPaybackMonths}mo payback horizon.`,
        tag: 'milestone',
      },
      {
        id: 'n2',
        author: decision.owner.name,
        role: decision.owner.role,
        date: formatDate(decision.createdAt),
        text: `Primary benchmark designated: ${decision.originalEstimates.primaryMetric} (Target: ${decision.originalEstimates.targetMetricValue}).`,
        tag: 'general',
      },
    ];

    if (decision.version && decision.version.includes('Amended')) {
      initialNotes.push({
        id: 'n-amend',
        author: 'Governance Ledger',
        role: 'Scope Amendment',
        date: 'Recent',
        text: `Logged ${decision.version}: Baseline updated with amended scope and capital allocations.`,
        tag: 'audit',
      });
    }

    if (isOverdue) {
      initialNotes.push({
        id: 'n3',
        author: 'Automated Governance Bot',
        role: 'SLA Sentinel',
        date: 'Triggered',
        text: `6-month retrospective SLA breached by +${daysOverdue} days. Immediate executive variance audit required.`,
        tag: 'warning',
      });
    } else if (decision.status === 'Reviewed') {
      initialNotes.push({
        id: 'n4',
        author: 'Institutional Memory Engine',
        role: 'Retrospective Logged',
        date: formatDate(decision.targetReviewDate),
        text: 'Post-mortem evaluation finalized. Metric variance reconciled and institutional learnings indexed.',
        tag: 'audit',
      });
    }

    setNotes(initialNotes);
  }, [decision]);

  if (!decision) return null;

  const isOverdue = decision.status === 'Review Due' && isPastDate(decision.targetReviewDate);
  const daysOverdue = isOverdue ? getDaysOverdue(decision.targetReviewDate) : 0;
  const daysUntil = getDaysUntil(decision.targetReviewDate);
  const actuals = decision.actuals;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const noteObj: ActivityNote = {
      id: `custom-${Date.now()}`,
      author: 'You (Executive Sign-off)',
      role: 'Portfolio Reviewer',
      date: 'Just now',
      text: newNote.trim(),
      tag: 'general',
    };

    setNotes([noteObj, ...notes]);
    setNewNote('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle Dim Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-black/60 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Slide-out Right-Hand Command Center Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[520px] md:w-[600px] lg:w-[46%] min-w-[390px] max-w-[760px] bg-surface-elevated border-l border-subtle shadow-none rounded-none flex flex-col h-full overflow-hidden text-content-primary"
            role="dialog"
            aria-label={`${decision.id} Ledger Details`}
          >
            {/* Header Toolbar */}
            <div className="shrink-0 px-5 sm:px-6 py-3.5 border-b border-subtle bg-surface-elevated flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-semibold text-content-secondary bg-surface-muted px-2 py-0.5 rounded border border-subtle">
                  {decision.id}
                </span>
                <span className={cn(
                  "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium",
                  decision.version?.includes('Frozen')
                    ? "bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300 border border-slate-200 dark:border-neutral-700"
                    : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40"
                )}>
                  {decision.version || 'v1.0 Frozen'}
                </span>
                <span className="text-xs text-slate-400 dark:text-neutral-600">•</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-sans">
                  {decision.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip content="Close drawer (Esc)">
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                    aria-label="Close panel"
                  >
                    <X className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Scrollable Drawer Content */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
              
              {/* Title & Hypothesis Banner */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Badge status={decision.status}>
                    {decision.status}
                  </Badge>
                  {isOverdue && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60 font-sans">
                      <AlertTriangle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                      +{daysOverdue}d Delay
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug font-cal">
                  {decision.title}
                </h2>

                <div className="p-3 rounded-md bg-slate-50 dark:bg-neutral-900/70 border border-slate-200 dark:border-neutral-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <span className="font-semibold text-slate-900 dark:text-white uppercase font-mono text-[10px] tracking-wider block">
                    ORIGINAL EXECUTIVE HYPOTHESIS:
                  </span>
                  <p className="italic leading-relaxed font-sans">
                    "{decision.hypothesis}"
                  </p>
                </div>
              </div>

              {/* Dual-Resource Allocation Metric Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Pillar 1: Capital Allocation */}
                <div className="p-3.5 rounded-md border border-subtle bg-surface-subtle shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">
                    <span>Capital Allocation</span>
                    <DollarSign className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-cal">
                    {formatCurrency(decision.originalEstimates.capitalAtRisk)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-sans">
                    {decision.originalEstimates.expectedPaybackMonths}mo expected payback
                  </div>
                </div>

                {/* Pillar 2: Time Allocation */}
                <div className="p-3.5 rounded-md border border-subtle bg-surface-subtle shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 font-sans">
                    <span>Time Horizon</span>
                    <Clock className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-cal">
                    {decision.originalEstimates.expectedPaybackMonths} Months
                  </div>
                  {isOverdue ? (
                    <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 truncate font-sans">
                      <AlertTriangle className="h-3 w-3 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>+{daysOverdue} Days Delay</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-sans">
                      Target: {formatDate(decision.targetReviewDate)} ({daysUntil}d to target)
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: DECISION TRAJECTORY & LIVE PROGRESS */}
              <div className="pt-4 border-t border-slate-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                    <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                    <span>PERFORMANCE & TRAJECTORY TRACKING</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded font-semibold">
                    Live Tracking Active
                  </span>
                </div>

                <div className="p-4 rounded-md border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 space-y-3.5 shadow-2xs">
                  {/* Metric Bar 1: Capital Deployed */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-sans">Capital Deployed vs Allocation</span>
                      <span className="font-semibold text-slate-900 dark:text-white tabular-nums font-mono text-[11px]">
                        {formatCurrency(actuals ? actuals.actualCapital : decision.originalEstimates.capitalAtRisk * 0.85)} / {formatCurrency(decision.originalEstimates.capitalAtRisk)} ({actuals ? `${Math.round((actuals.actualCapital / decision.originalEstimates.capitalAtRisk) * 100)}%` : '85%'})
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all", actuals && actuals.capitalVariancePercent > 10 ? "bg-red-500" : "bg-emerald-500")} 
                        style={{ width: `${Math.min(100, Math.round(((actuals?.actualCapital || decision.originalEstimates.capitalAtRisk * 0.85) / decision.originalEstimates.capitalAtRisk) * 100))}%` }} 
                      />
                    </div>
                  </div>

                  {/* Metric Bar 2: Timeline Horizon / Elapsed */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-sans">Timeline Horizon Elapsed</span>
                      <span className={cn(
                        "font-semibold tabular-nums font-mono text-[11px]",
                        isOverdue ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"
                      )}>
                        {isOverdue ? `100% (+${daysOverdue}d breached)` : `${Math.min(100, Math.round((getDaysElapsed(decision.createdAt) / (decision.originalEstimates.expectedPaybackMonths * 30)) * 100))}% of review window`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-full overflow-hidden flex">
                      {isOverdue ? (
                        <>
                          <div className="h-full bg-blue-600 rounded-l-full" style={{ width: '80%' }} />
                          <div className="h-full bg-rose-600 rounded-r-full" style={{ width: '20%' }} />
                        </>
                      ) : (
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: '68%' }} />
                      )}
                    </div>
                  </div>

                  {/* Primary Target Benchmark */}
                  <div className="pt-2 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px] font-sans">Primary Benchmark Target:</span>
                      <span className="font-semibold text-slate-900 dark:text-white font-sans">
                        {decision.originalEstimates.primaryMetric}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold block tabular-nums font-mono">
                        {actuals ? actuals.actualMetricValue : decision.originalEstimates.targetMetricValue}
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans">Target Benchmark</span>
                    </div>
                  </div>

                  {/* Faint Elegant Mini Sparkline Chart */}
                  <div className="pt-2">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between font-mono">
                      <span>Monthly Realization vs Model</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">+18.4% ARR Run Rate</span>
                    </div>
                    <svg className="w-full h-12 text-emerald-500/20 dark:text-emerald-400/20" viewBox="0 0 300 40" fill="none">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 35 Q 50 32, 100 24 T 200 16 T 300 6 L 300 40 L 0 40 Z"
                        fill="url(#chartGradient)"
                      />
                      <path
                        d="M0 35 Q 50 32, 100 24 T 200 16 T 300 6"
                        stroke="#10b981"
                        strokeWidth="2"
                        fill="none"
                      />
                      {/* Dotted projected baseline */}
                      <path
                        d="M0 38 L 300 14"
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        fill="none"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* SECTION: OUTCOME VARIANCE (EXPECTED VS. ACTUALS) */}
              <div className="pt-4 border-t border-slate-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                    <span>OUTCOME VARIANCE (EXPECTED VS. ACTUALS)</span>
                  </h3>
                  {actuals ? (
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded">
                      Audited Actuals Available
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">
                      Pending Milestone Review
                    </span>
                  )}
                </div>

                {/* Explicit Comparative Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Capital Variance Card */}
                  <div className="p-3.5 rounded-md border border-subtle bg-surface-subtle space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>Capital Investment</span>
                      <DollarSign className="h-4 w-4 text-slate-400" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-slate-500 font-sans">Expected (Baseline):</span>
                        <span className="font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                          {formatCurrency(decision.originalEstimates.capitalAtRisk)}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-slate-900 dark:text-white font-semibold font-sans">Realized Actual:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                          {actuals ? formatCurrency(actuals.actualCapital) : 'In Progress'}
                        </span>
                      </div>

                      {actuals && (
                        <div className="flex items-baseline justify-between text-xs pt-1 border-t border-slate-100 dark:border-neutral-800">
                          <span className="text-slate-500 font-sans">Variance (Drift):</span>
                          <span className={cn(
                            "font-mono font-semibold tabular-nums",
                            actuals.capitalVariancePercent > 0 ? "text-red-600" : "text-emerald-600"
                          )}>
                            {actuals.capitalVariancePercent > 0 ? `+${actuals.capitalVariancePercent}% Over` : `${actuals.capitalVariancePercent}% Under`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Time Horizon Variance Card */}
                  <div className="p-3.5 rounded-md border border-subtle bg-surface-subtle space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>Time Horizon</span>
                      <Clock className="h-4 w-4 text-slate-400" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-slate-500 font-sans">Expected (Horizon):</span>
                        <span className="font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                          {decision.originalEstimates.expectedPaybackMonths} Months
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-slate-900 dark:text-white font-semibold font-sans">Realized Time:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                          {actuals ? `${actuals.actualPaybackMonths} Months` : 'In Progress'}
                        </span>
                      </div>

                      {actuals && (
                        <div className="flex items-baseline justify-between text-xs pt-1 border-t border-slate-100 dark:border-neutral-800">
                          <span className="text-slate-500 font-sans">Timeline Drift:</span>
                          <span className={cn(
                            "font-mono font-semibold tabular-nums",
                            actuals.timeVarianceMonths > 0 ? "text-amber-600" : "text-emerald-600"
                          )}>
                            {actuals.timeVarianceMonths > 0 ? `+${actuals.timeVarianceMonths}mo Delay` : `${actuals.timeVarianceMonths}mo Early`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Metric Comparison */}
                <div className="p-3.5 rounded-md border border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/60 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 font-sans">Primary Benchmark:</span>
                    <span className="text-slate-500 font-sans">{decision.originalEstimates.primaryMetric}</span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-500 font-sans">Target Baseline:</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">{decision.originalEstimates.targetMetricValue}</span>
                  </div>
                  {actuals && (
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-900 dark:text-white font-semibold font-sans">Realized Outcome:</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{actuals.actualMetricValue}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: POSITIONS & STAKEHOLDER CONSENSUS */}
              <div className="pt-4 border-t border-slate-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                    <span>POSITIONS & STAKEHOLDER CONSENSUS</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {decision.stakeholders?.length ? `${decision.stakeholders.length} recorded stances` : '3 recorded stances'}
                  </span>
                </div>

                {/* Primary Sponsor Card */}
                <div className="p-3 rounded-md border border-subtle bg-surface-subtle flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0",
                      getDepartmentAvatarStyle(decision.owner.role, decision.category)
                    )}>
                      {decision.owner.initials || getInitials(decision.owner.name)}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white font-sans">
                        {decision.owner.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                        {decision.owner.role} • Primary Sponsor
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    SPONSOR (LEAD)
                  </span>
                </div>

                {/* Stakeholder Positions List */}
                <div className="space-y-2">
                  {decision.stakeholders?.map((stk) => {
                    const isSupport = stk.stance === 'support';
                    const isConditions = stk.stance === 'conditions';
                    const isDissent = stk.stance === 'dissent';

                    const dotBg = isDissent ? 'bg-red-500' : isConditions ? 'bg-amber-500' : 'bg-emerald-500';
                    const badgeClass = isDissent
                      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/60'
                      : isConditions
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/60';

                    return (
                      <div
                        key={stk.id}
                        className="p-3 rounded-md border border-subtle bg-surface-subtle space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shrink-0",
                              getDepartmentAvatarStyle(stk.role)
                            )}>
                              {stk.initials}
                            </div>
                            <div>
                              <span className="font-semibold text-xs text-slate-900 dark:text-white font-sans">
                                {stk.name}
                              </span>
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1.5 font-sans">
                                ({stk.role})
                              </span>
                            </div>
                          </div>

                          {/* Stance Badge with colored dot */}
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium border uppercase tracking-wider",
                            badgeClass
                          )}>
                            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotBg)} />
                            <span>{stk.stance}</span>
                          </span>
                        </div>

                        {/* Stance Rationale Quote String */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-neutral-900/60 p-2 rounded border border-slate-100 dark:border-neutral-800 font-sans italic leading-relaxed">
                          "{stk.rationale}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: AMENDMENT LEDGER */}
              <div className="pt-4 border-t border-slate-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <GitCommit className="h-3.5 w-3.5 text-slate-400" />
                    <span>AMENDMENT LEDGER & REVISION TIMELINE</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Immutable Log
                  </span>
                </div>

                {/* Timeline Container */}
                <div className="border-l-2 border-slate-200 dark:border-neutral-800 ml-2.5 pl-4 space-y-4 py-1">
                  {decision.amendments?.map((amend) => (
                    <div key={amend.id} className="relative space-y-1">
                      {/* Timeline dot */}
                      <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-white dark:border-[#141414] bg-slate-900 dark:bg-white" />

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-800 dark:bg-neutral-800 dark:text-slate-200 border border-slate-200 dark:border-neutral-700">
                          {amend.version}
                        </span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white font-sans">
                          {amend.summary}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {formatDate(amend.date)}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                        Author: <span className="font-medium text-slate-700 dark:text-slate-300">{amend.author}</span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-neutral-900/60 p-2 rounded border border-slate-200/80 dark:border-neutral-800 font-sans">
                        {amend.changes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: STATUS TIMELINE & MILESTONES */}
              <div className="pt-4 border-t border-slate-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>STATUS TIMELINE & MILESTONES</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 font-sans">
                    6-Month Cadence Protocol
                  </span>
                </div>

                <div className="relative pl-6 space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-neutral-800">
                  {/* Milestone 1: Project Launch */}
                  <div 
                    onClick={() => setActiveTimelineStep(1)}
                    className="relative cursor-pointer group"
                  >
                    <span className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow-2xs">
                      <CheckCircle2 className="h-3 w-3" />
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors font-sans">
                          Project Launch & Hypothesis Locked
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{formatDate(decision.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-sans leading-normal">
                        Original assumptions, benchmark payoff, and alternatives frozen in governance ledger.
                      </p>
                    </div>
                  </div>

                  {/* Milestone 2: Capital Deployment */}
                  <div 
                    onClick={() => setActiveTimelineStep(2)}
                    className="relative cursor-pointer group"
                  >
                    <span className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow-2xs">
                      <CheckCircle2 className="h-3 w-3" />
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors font-sans">
                          Capital Committed ({formatCurrency(decision.originalEstimates.capitalAtRisk)})
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">Day 1</span>
                      </div>
                      <p className="text-xs text-slate-500 font-sans leading-normal">
                        Targeting {decision.originalEstimates.expectedAnnualImpact} with {decision.originalEstimates.expectedPaybackMonths}mo payback horizon.
                      </p>
                    </div>
                  </div>

                  {/* Milestone 3: Execution Horizon */}
                  <div 
                    onClick={() => setActiveTimelineStep(3)}
                    className="relative cursor-pointer group"
                  >
                    <span className={cn(
                      "absolute -left-6 top-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] shadow-2xs",
                      isOverdue 
                        ? "bg-rose-600 text-white" 
                        : decision.status === 'Reviewed'
                        ? "bg-purple-600 text-white"
                        : "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    )}>
                      {isOverdue ? (
                        <AlertTriangle className="h-3 w-3" />
                      ) : decision.status === 'Reviewed' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={cn(
                          "font-semibold group-hover:underline transition-colors font-sans",
                          isOverdue ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"
                        )}>
                          {isOverdue ? "Execution Delayed / Audit Pending" : "Mid-flight Operations"}
                        </span>
                        <span className={cn(
                          "text-[11px] font-mono",
                          isOverdue ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-slate-400"
                        )}>
                          {isOverdue ? `+${daysOverdue}d delay` : 'In progress'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-sans leading-normal">
                        {isOverdue 
                          ? "Operational review overdue. Executive audit must reconcile initial assumptions with real unit economics." 
                          : "Metrics tracking active across standard governance channels."}
                      </p>
                    </div>
                  </div>

                  {/* Milestone 4: 6-Month Retrospective Review Target */}
                  <div 
                    onClick={() => setActiveTimelineStep(4)}
                    className="relative cursor-pointer group"
                  >
                    <span className={cn(
                      "absolute -left-6 top-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] shadow-2xs ring-4 ring-white dark:ring-[#141414]",
                      decision.status === 'Reviewed'
                        ? "bg-purple-600 text-white"
                        : isOverdue
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-slate-300 dark:bg-neutral-700 text-slate-700 dark:text-slate-300"
                    )}>
                      {decision.status === 'Reviewed' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Calendar className="h-3 w-3" />
                      )}
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={cn(
                          "font-semibold font-sans",
                          isOverdue ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"
                        )}>
                          6-Month Retrospective Target
                        </span>
                        <span className="text-[11px] font-semibold text-slate-900 dark:text-white tabular-nums font-mono">
                          {formatDate(decision.targetReviewDate)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-sans leading-normal">
                        {decision.status === 'Reviewed'
                          ? "Audit complete. Actuals reconciled into organizational memory."
                          : isOverdue
                          ? `Deadline passed ${daysOverdue} days ago. Immediate action required.`
                          : `Scheduled review in ${daysUntil} days.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: ACTIVITY & LIVE NOTES */}
              <div className="pt-4 border-t border-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-content-muted font-mono text-[10px]">
                    <Activity className="h-3.5 w-3.5 text-content-faint" />
                    <span>ACTIVITY & PROGRESS TRACKING</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-content-faint font-sans">
                      {notes.length} logged {notes.length === 1 ? 'entry' : 'entries'}
                    </span>
                    {notes.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setIsActivityExpanded(!isActivityExpanded)}
                        className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        {isActivityExpanded ? 'Collapse' : 'View all'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Input Field: Add Progress Note */}
                <form onSubmit={handleAddNote} className="space-y-2">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add Progress Note / Update Track..."
                      className="w-full h-8 pl-3 pr-16 rounded-md border border-subtle bg-surface-subtle text-xs text-content-primary placeholder:text-content-faint focus:outline-none focus:border-border-strong transition-colors font-sans"
                    />
                    <button
                      type="submit"
                      disabled={!newNote.trim()}
                      className="absolute right-1 top-1 h-6 px-2.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-40 text-xs font-medium inline-flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>Post</span>
                      <Send className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </form>

                {/* Feed of Notes (No nested scroll trap: renders complete cards with natural expansion) */}
                <div className="space-y-2">
                  {(isActivityExpanded ? notes : notes.slice(0, 3)).map((note) => (
                    <div
                      key={note.id}
                      className={cn(
                        "p-2.5 rounded-md border text-xs space-y-1 transition-colors shadow-2xs",
                        note.tag === 'warning'
                          ? "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60"
                          : note.tag === 'audit'
                          ? "bg-purple-50/50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/60"
                          : "bg-surface-subtle border-subtle"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "font-semibold tracking-tight font-sans",
                            note.tag === 'warning' ? "text-rose-700 dark:text-rose-300" : "text-content-primary"
                          )}>
                            {note.author}
                          </span>
                          <span className="text-[10px] text-content-muted font-sans">• {note.role}</span>
                        </div>
                        <span className="text-[10px] text-content-faint font-mono">{note.date}</span>
                      </div>
                      <p className={cn(
                        "leading-relaxed font-sans text-xs",
                        note.tag === 'warning' ? "text-rose-900 dark:text-rose-200 font-medium" : "text-content-secondary"
                      )}>
                        {note.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* View More / Show Less Toggle Button */}
                {notes.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setIsActivityExpanded(!isActivityExpanded)}
                    className="w-full py-2 px-3 rounded-md border border-subtle bg-surface-subtle hover:bg-surface-hover text-xs font-medium text-content-secondary hover:text-content-primary flex items-center justify-center gap-1.5 transition-colors shadow-2xs select-none cursor-pointer"
                  >
                    {isActivityExpanded ? (
                      <>
                        <span>Show fewer updates</span>
                        <ChevronUp className="h-3.5 w-3.5 text-content-faint" />
                      </>
                    ) : (
                      <>
                        <span>View all {notes.length} updates</span>
                        <span className="text-[10px] text-content-faint font-mono">({notes.length - 3} older)</span>
                        <ChevronDown className="h-3.5 w-3.5 text-content-faint" />
                      </>
                    )}
                  </button>
                )}

                {/* Dossier Audit Link */}
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => onOpenDeepDive(decision)}
                    className="text-[11px] font-medium text-content-muted hover:text-content-primary hover:underline transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View full history & audit dossier</span>
                    <ArrowRight className="h-3 w-3 text-content-faint" />
                  </button>
                </div>
              </div>

            </div>

            {/* Flat Footer Action Bar */}
            <div className="shrink-0 p-4 border-t border-subtle bg-surface-subtle flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-content-muted font-mono">
                <Lock className="h-3.5 w-3.5 text-content-faint" />
                <span>Immutable Record • {decision.version ? (decision.version.startsWith('v') ? decision.version.split(' ')[0] : `v${decision.version.split(' ')[0]}`) : 'v1.0'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-content-secondary bg-surface border border-subtle hover:bg-surface-hover transition-colors shadow-2xs cursor-pointer"
                >
                  Close (Esc)
                </button>
                <button
                  type="button"
                  onClick={() => onOpenDeepDive(decision)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
                >
                  <span>Open Audit Dossier</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
