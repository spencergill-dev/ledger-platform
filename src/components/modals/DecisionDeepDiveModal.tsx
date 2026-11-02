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
  Lock, 
  FileText, 
  GitFork, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  DollarSign, 
  Calendar,
  Download,
  ChevronLeft,
  TrendingUp,
  UserCheck,
  GitCommit,
  Activity,
  Send,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DecisionDeepDiveModalProps {
  decision: Decision | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ActivityNote {
  id: string;
  author: string;
  role: string;
  date: string;
  text: string;
  tag?: 'milestone' | 'warning' | 'audit' | 'general';
}

type DossierTab = 'all' | 'overview' | 'stakeholders' | 'counterfactuals' | 'amendments' | 'retrospective';

export function DecisionDeepDiveModal({
  decision,
  isOpen,
  onClose,
}: DecisionDeepDiveModalProps) {
  const [activeTab, setActiveTab] = useState<DossierTab>('all');
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<ActivityNote[]>([]);
  const [isActivityExpanded, setIsActivityExpanded] = useState(false);
  const [activeTimelineStep, setActiveTimelineStep] = useState<number | null>(null);

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when modal is open
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

  // Reset tab and initialize activity notes when decision changes
  useEffect(() => {
    if (!decision) return;
    setActiveTab('all');
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
      id: `modal-${Date.now()}`,
      author: 'You (Executive Sign-off)',
      role: 'Portfolio Reviewer',
      date: 'Just now',
      text: newNote.trim(),
      tag: 'general',
    };

    setNotes([noteObj, ...notes]);
    setNewNote('');
  };

  const handleExportDossier = () => {
    const dossierData = {
      exportTimestamp: new Date().toISOString(),
      governanceFramework: 'DecideOS Institutional Memory v2.1',
      decisionId: decision.id,
      title: decision.title,
      category: decision.category,
      status: decision.status,
      version: decision.version || 'v1.0 Frozen',
      owner: decision.owner,
      originalEstimates: decision.originalEstimates,
      actuals: decision.actuals || null,
      stakeholders: decision.stakeholders || [],
      amendments: decision.amendments || [],
      alternativesConsidered: decision.alternativesConsidered || [],
      retrospectiveSnapshot: decision.retrospectiveSnapshot || null,
      auditNotes: notes,
      cryptographicHash: `SHA256:${decision.id.toLowerCase().replace(/[^a-z0-9]/g, '')}7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e`,
    };

    const blob = new Blob([JSON.stringify(dossierData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${decision.id}-audit-dossier.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Dimmed Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Modal Centering Wrapper */}
          <div className="min-h-full flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-5xl bg-surface-elevated rounded-xl border border-subtle shadow-elevated overflow-hidden text-content-primary my-4 sm:my-8 flex flex-col max-h-[92vh]"
              role="dialog"
              aria-modal="true"
              aria-label={`${decision.id} Full Audit Dossier`}
            >
              {/* 1. TOP AUDIT TOOLBAR & NAVIGATION */}
              <div className="shrink-0 px-4 sm:px-6 py-3.5 border-b border-subtle bg-surface-muted/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-content-secondary hover:text-content-primary transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Return to Ledger</span>
                  </button>

                  <span className="text-content-faint hidden sm:inline">|</span>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-content-primary bg-surface-subtle px-2 py-0.5 rounded border border-subtle">
                      {decision.id}
                    </span>

                    <span className={cn(
                      "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border",
                      decision.version?.toLowerCase().includes('amended')
                        ? "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60"
                        : "bg-surface-muted text-content-muted border-border-muted"
                    )}>
                      {decision.version || 'v1.0 Frozen'}
                    </span>

                    <Tooltip content="Cryptographically locked snapshot signed at executive approval">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 select-none">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Immutable Record</span>
                      </span>
                    </Tooltip>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Tooltip content="Download compliance-ready JSON audit verification pack">
                    <button
                      type="button"
                      onClick={handleExportDossier}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-content-secondary hover:text-content-primary bg-surface hover:bg-surface-hover rounded-md border border-subtle shadow-2xs transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 text-content-faint" />
                      <span className="hidden sm:inline">Export Audit Pack</span>
                    </button>
                  </Tooltip>

                  <Tooltip content="Close audit modal (Esc)">
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-1.5 rounded-md text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors cursor-pointer"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4 stroke-[2.5]" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* 2. TABBED DOSSIER NAVIGATION */}
              <div className="shrink-0 px-4 sm:px-6 pt-2 pb-0 border-b border-subtle bg-surface flex items-center gap-1 sm:gap-2 overflow-x-auto select-none">
                {[
                  { id: 'all', label: 'All Dossier', count: null },
                  { id: 'overview', label: 'Overview & Variance', count: null },
                  { id: 'stakeholders', label: 'Stakeholders', count: decision.stakeholders?.length || 0 },
                  { id: 'counterfactuals', label: 'Counterfactuals', count: decision.alternativesConsidered?.length || 0 },
                  { id: 'amendments', label: 'Amendments & Timeline', count: decision.amendments?.length || 0 },
                  { id: 'retrospective', label: 'Retrospective & Notes', count: notes.length },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as DossierTab)}
                      className={cn(
                        "px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer",
                        isActive
                          ? "border-blue-600 text-content-primary font-semibold"
                          : "border-transparent text-content-muted hover:text-content-primary hover:border-border-strong"
                      )}
                    >
                      <span>{tab.label}</span>
                      {tab.count !== null && (
                        <span className={cn(
                          "px-1.5 py-0.2 rounded-full text-[10px] tabular-nums font-mono",
                          isActive ? "bg-surface-muted text-content-primary font-semibold" : "text-content-faint"
                        )}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 3. SCROLLABLE DOSSIER BODY */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 space-y-8">
                
                {/* HERO BANNER: Status, Title, Sponsor, and Hypothesis */}
                <div className="space-y-4 pb-6 border-b border-subtle">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge status={decision.status}>{decision.status}</Badge>

                    {isOverdue && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>SLA Breached: Retrospective Overdue (+{daysOverdue} days)</span>
                      </span>
                    )}

                    <span className="text-xs font-medium text-content-muted bg-surface-muted px-2.5 py-0.5 rounded-md border border-subtle">
                      Category: {decision.category}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-content-primary leading-tight font-cal">
                    {decision.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-content-muted pt-1">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shrink-0 shadow-2xs font-sans",
                        getDepartmentAvatarStyle(decision.owner.role, decision.category)
                      )}>
                        {decision.owner.initials || getInitials(decision.owner.name)}
                      </div>
                      <div>
                        Primary Sponsor: <span className="font-semibold text-content-primary">{decision.owner.name}</span> ({decision.owner.role})
                      </div>
                    </div>
                    <span>•</span>
                    <div>
                      Locked Date: <span className="font-semibold text-content-primary font-mono">{formatDate(decision.createdAt)}</span>
                    </div>
                    <span>•</span>
                    <div>
                      Target Review: <span className="font-semibold text-content-primary font-mono">{formatDate(decision.targetReviewDate)}</span>
                    </div>
                  </div>

                  {/* Original Executive Hypothesis Callout */}
                  <div className="p-4 rounded-lg bg-surface-subtle border border-subtle text-xs text-content-secondary space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-content-primary uppercase font-mono text-[10px] tracking-wider flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-content-faint" />
                        <span>ORIGINAL EXECUTIVE HYPOTHESIS</span>
                      </span>
                      <span className="font-mono text-[10px] text-content-faint">
                        SHA256: 9f8a...4e1d
                      </span>
                    </div>
                    <p className="italic leading-relaxed text-sm text-content-primary font-sans">
                      "{decision.hypothesis}"
                    </p>
                    <div className="pt-2 border-t border-border-muted flex items-center justify-between text-xs text-content-muted">
                      <span>Expected Annual Impact: <strong className="text-content-primary">{decision.originalEstimates.expectedAnnualImpact}</strong></span>
                      <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Target Payback: {decision.originalEstimates.expectedPaybackMonths}mo</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 1: OVERVIEW & PERFORMANCE TRAJECTORY */}
                {(activeTab === 'all' || activeTab === 'overview') && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-content-muted flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-content-faint" />
                        <span>CAPITAL ALLOCATION & PERFORMANCE TRAJECTORY</span>
                      </h2>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded font-semibold">
                        Live Tracking Active
                      </span>
                    </div>

                    {/* Dual-Resource Top KPI Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Capital Allocation Card */}
                      <div className="p-4 sm:p-5 rounded-lg border border-subtle bg-surface-subtle shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium text-content-muted">
                          <span>Capital Committed</span>
                          <DollarSign className="h-4 w-4 text-content-faint" />
                        </div>
                        <div className="text-2xl font-bold text-content-primary font-cal">
                          {formatCurrency(decision.originalEstimates.capitalAtRisk)}
                        </div>
                        <p className="text-xs text-content-muted font-sans">
                          Payback horizon: {decision.originalEstimates.expectedPaybackMonths} months
                        </p>
                      </div>

                      {/* Time Horizon Card */}
                      <div className="p-4 sm:p-5 rounded-lg border border-subtle bg-surface-subtle shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium text-content-muted">
                          <span>Time Horizon</span>
                          <Clock className="h-4 w-4 text-content-faint" />
                        </div>
                        <div className="text-2xl font-bold text-content-primary font-cal">
                          {decision.originalEstimates.expectedPaybackMonths} Months
                        </div>
                        {isOverdue ? (
                          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 font-sans">
                            <AlertTriangle className="h-3 w-3 text-rose-600 dark:text-rose-400 shrink-0" />
                            <span>+{daysOverdue} Days Delay (Breached)</span>
                          </p>
                        ) : (
                          <p className="text-xs text-content-muted font-sans">
                            Target: {formatDate(decision.targetReviewDate)} ({daysUntil}d to target)
                          </p>
                        )}
                      </div>

                      {/* Primary Benchmark Target */}
                      <div className="p-4 sm:p-5 rounded-lg border border-subtle bg-surface-subtle shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium text-content-muted">
                          <span>Primary Target Benchmark</span>
                          <Sparkles className="h-4 w-4 text-content-faint" />
                        </div>
                        <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 font-cal truncate">
                          {actuals ? actuals.actualMetricValue : decision.originalEstimates.targetMetricValue}
                        </div>
                        <p className="text-xs text-content-muted font-sans truncate">
                          Metric: {decision.originalEstimates.primaryMetric}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bars & Live Realization Curve */}
                    <div className="p-5 rounded-lg border border-subtle bg-surface-subtle space-y-4 shadow-2xs">
                      {/* Metric Bar 1: Capital Deployed vs Allocation */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-content-secondary font-medium">Capital Deployed vs Commitment</span>
                          <span className="font-semibold text-content-primary tabular-nums font-mono text-xs">
                            {formatCurrency(actuals ? actuals.actualCapital : decision.originalEstimates.capitalAtRisk * 0.85)} / {formatCurrency(decision.originalEstimates.capitalAtRisk)} ({actuals ? `${Math.round((actuals.actualCapital / decision.originalEstimates.capitalAtRisk) * 100)}%` : '85%'})
                          </span>
                        </div>
                        <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all", actuals && actuals.capitalVariancePercent > 10 ? "bg-red-500" : "bg-emerald-500")} 
                            style={{ width: `${Math.min(100, Math.round(((actuals?.actualCapital || decision.originalEstimates.capitalAtRisk * 0.85) / decision.originalEstimates.capitalAtRisk) * 100))}%` }} 
                          />
                        </div>
                      </div>

                      {/* Metric Bar 2: Timeline Horizon Elapsed */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-content-secondary font-medium">Timeline Horizon Elapsed</span>
                          <span className={cn(
                            "font-semibold tabular-nums font-mono text-xs",
                            isOverdue ? "text-rose-600 dark:text-rose-400" : "text-content-primary"
                          )}>
                            {isOverdue ? `100% (+${daysOverdue}d breached)` : `${Math.min(100, Math.round((getDaysElapsed(decision.createdAt) / (decision.originalEstimates.expectedPaybackMonths * 30)) * 100))}% of review window`}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden flex">
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

                      {/* Realization Trend Sparkline */}
                      <div className="pt-3 border-t border-border-muted">
                        <div className="text-[11px] text-content-muted uppercase tracking-wider mb-1 flex items-center justify-between font-mono">
                          <span>Monthly Realization vs Model Baseline</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">+18.4% Realized Run Rate</span>
                        </div>
                        <svg className="w-full h-14 text-emerald-500/20 dark:text-emerald-400/20" viewBox="0 0 500 40" fill="none">
                          <defs>
                            <linearGradient id="modalChartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0 35 Q 80 32, 160 24 T 340 16 T 500 6 L 500 40 L 0 40 Z"
                            fill="url(#modalChartGradient)"
                          />
                          <path
                            d="M0 35 Q 80 32, 160 24 T 340 16 T 500 6"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            fill="none"
                          />
                          <path
                            d="M0 38 L 500 14"
                            stroke="#94a3b8"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                            fill="none"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Outcome Variance Comparative Grid (Baseline Expected vs Realized Actuals) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-content-muted flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5 text-content-faint" />
                          <span>OUTCOME VARIANCE (EXPECTED VS. REALIZED ACTUALS)</span>
                        </h3>
                        {actuals ? (
                          <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                            Audited Actuals Available
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-content-faint">
                            Pending Milestone Review
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Capital Variance Card */}
                        <div className="p-4 rounded-lg border border-subtle bg-surface-subtle space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between text-xs text-content-muted font-medium">
                            <span>Capital Variance Drift</span>
                            <DollarSign className="h-4 w-4 text-content-faint" />
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex items-baseline justify-between text-xs">
                              <span className="text-content-muted">Expected Baseline:</span>
                              <span className="font-mono font-medium text-content-secondary tabular-nums">
                                {formatCurrency(decision.originalEstimates.capitalAtRisk)}
                              </span>
                            </div>

                            <div className="flex items-baseline justify-between text-xs">
                              <span className="text-content-primary font-semibold">Realized Actual:</span>
                              <span className="font-mono font-bold text-content-primary tabular-nums">
                                {actuals ? formatCurrency(actuals.actualCapital) : 'In Progress'}
                              </span>
                            </div>

                            {actuals && (
                              <div className="flex items-baseline justify-between text-xs pt-1.5 border-t border-border-muted">
                                <span className="text-content-muted">Net Variance (Drift):</span>
                                <span className={cn(
                                  "font-mono font-semibold tabular-nums",
                                  actuals.capitalVariancePercent > 0 ? "text-red-600" : "text-emerald-600"
                                )}>
                                  {actuals.capitalVariancePercent > 0 ? `+${actuals.capitalVariancePercent}% Over Budget` : `${actuals.capitalVariancePercent}% Under Budget`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Time Horizon Variance Card */}
                        <div className="p-4 rounded-lg border border-subtle bg-surface-subtle space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between text-xs text-content-muted font-medium">
                            <span>Timeline Horizon Drift</span>
                            <Clock className="h-4 w-4 text-content-faint" />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-baseline justify-between text-xs">
                              <span className="text-content-muted">Expected Horizon:</span>
                              <span className="font-mono font-medium text-content-secondary tabular-nums">
                                {decision.originalEstimates.expectedPaybackMonths} Months
                              </span>
                            </div>

                            <div className="flex items-baseline justify-between text-xs">
                              <span className="text-content-primary font-semibold">Realized Horizon:</span>
                              <span className="font-mono font-bold text-content-primary tabular-nums">
                                {actuals ? `${actuals.actualPaybackMonths} Months` : 'In Progress'}
                              </span>
                            </div>

                            {actuals && (
                              <div className="flex items-baseline justify-between text-xs pt-1.5 border-t border-border-muted">
                                <span className="text-content-muted">Timeline Drift:</span>
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

                      {/* Primary Benchmark Comparison Card */}
                      <div className="p-4 rounded-lg border border-subtle bg-surface-subtle space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-content-primary">Primary Benchmark Metric:</span>
                          <span className="text-content-secondary font-mono text-xs">{decision.originalEstimates.primaryMetric}</span>
                        </div>
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="text-content-muted">Target Baseline:</span>
                          <span className="font-mono font-semibold text-content-primary">{decision.originalEstimates.targetMetricValue}</span>
                        </div>
                        {actuals && (
                          <div className="flex items-baseline justify-between text-xs pt-1 border-t border-border-muted">
                            <span className="text-content-primary font-semibold">Realized Milestone Outcome:</span>
                            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{actuals.actualMetricValue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 2: POSITIONS & STAKEHOLDER CONSENSUS */}
                {(activeTab === 'all' || activeTab === 'stakeholders') && (
                  <div className="space-y-4 pt-4 border-t border-subtle">
                    <div className="flex items-center justify-between">
                      <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-content-muted flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-content-faint" />
                        <span>STAKEHOLDER GOVERNANCE & POSITIONS</span>
                      </h2>
                      <span className="text-[10px] font-mono text-content-faint">
                        {decision.stakeholders?.length || 0} Recorded Stances
                      </span>
                    </div>

                    {/* Primary Sponsor Card */}
                    <div className="p-3.5 rounded-lg border border-subtle bg-surface-subtle flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shrink-0 font-sans shadow-2xs",
                          getDepartmentAvatarStyle(decision.owner.role, decision.category)
                        )}>
                          {decision.owner.initials || getInitials(decision.owner.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-content-primary font-sans">
                            {decision.owner.name}
                          </div>
                          <div className="text-xs text-content-muted font-sans">
                            {decision.owner.role} • Primary Sponsor & Hypothesis Author
                          </div>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        SPONSOR (LEAD)
                      </span>
                    </div>

                    {/* Detailed Stakeholder List with Stances & Quotes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {decision.stakeholders && decision.stakeholders.length > 0 ? (
                        decision.stakeholders.map((stk) => {
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
                              className="p-3.5 rounded-lg border border-subtle bg-surface-subtle space-y-2.5 shadow-2xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <div className={cn(
                                    "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shrink-0 font-sans shadow-2xs",
                                    getDepartmentAvatarStyle(stk.role)
                                  )}>
                                    {stk.initials}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-xs text-content-primary font-sans">
                                      {stk.name}
                                    </div>
                                    <div className="text-[11px] text-content-muted font-sans">
                                      {stk.role}
                                    </div>
                                  </div>
                                </div>

                                <span className={cn(
                                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium border uppercase tracking-wider",
                                  badgeClass
                                )}>
                                  <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotBg)} />
                                  <span>{stk.stance}</span>
                                </span>
                              </div>

                              <p className="text-xs text-content-secondary bg-surface p-2.5 rounded-md border border-subtle font-sans italic leading-relaxed">
                                "{stk.rationale}"
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-content-muted italic col-span-2">No stakeholder stances registered.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION 3: COUNTERFACTUALS & REJECTED ALTERNATIVES */}
                {(activeTab === 'all' || activeTab === 'counterfactuals') && (
                  <div className="space-y-4 pt-4 border-t border-subtle">
                    <div className="flex items-center justify-between">
                      <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-content-muted flex items-center gap-2">
                        <GitFork className="h-4 w-4 text-content-faint" />
                        <span>COUNTERFACTUALS & REJECTED ALTERNATIVES</span>
                      </h2>
                      <span className="text-[10px] font-mono text-content-faint">
                        {decision.alternativesConsidered?.length || 0} Alternatives Analyzed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {decision.alternativesConsidered && decision.alternativesConsidered.length > 0 ? (
                        decision.alternativesConsidered.map((alt, idx) => (
                          <div key={idx} className="p-4 rounded-lg border border-subtle bg-surface-subtle shadow-2xs space-y-2">
                            <div className="flex items-center justify-between font-semibold text-xs text-content-primary">
                              <span>Alternative {idx + 1}: {alt.title}</span>
                              <span className="text-content-muted font-mono text-[11px]">
                                Est: {formatCurrency(alt.estimatedCost)}
                              </span>
                            </div>
                            <p className="text-xs text-content-secondary leading-relaxed bg-surface p-2.5 rounded-md border border-subtle">
                              <strong className="text-content-primary not-italic">Rationale for Rejection: </strong>
                              {alt.rationale}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-content-muted italic">No alternative paths registered at initial commitment.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION 4: AMENDMENTS & 4-STAGE LIFECYCLE TIMELINE */}
                {(activeTab === 'all' || activeTab === 'amendments') && (
                  <div className="space-y-6 pt-4 border-t border-subtle">
                    
                    {/* Amendment Ledger */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-content-muted flex items-center gap-2">
                          <GitCommit className="h-4 w-4 text-content-faint" />
                          <span>AMENDMENT LEDGER & REVISION TIMELINE</span>
                        </h2>
                        <span className="text-[10px] font-mono text-content-faint">
                          {decision.amendments?.length || 0} Revisions Logged
                        </span>
                      </div>

                      <div className="border-l-2 border-border-strong ml-3 pl-4 space-y-5 py-1">
                        {decision.amendments && decision.amendments.length > 0 ? (
                          decision.amendments.map((amend) => (
                            <div key={amend.id} className="relative space-y-1.5">
                              {/* Timeline dot */}
                              <span className="absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full border-2 border-surface-elevated bg-slate-900 dark:bg-white" />

                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-surface-muted text-content-primary border border-subtle">
                                  {amend.version}
                                </span>
                                <span className="text-xs font-semibold text-content-primary font-sans">
                                  {amend.summary}
                                </span>
                                <span className="text-[11px] text-content-muted font-mono">
                                  {formatDate(amend.date)}
                                </span>
                              </div>

                              <div className="text-[11px] text-content-muted font-sans">
                                Author: <span className="font-medium text-content-secondary">{amend.author}</span>
                              </div>

                              <p className="text-xs text-content-secondary bg-surface-subtle p-2.5 rounded-md border border-subtle font-sans leading-relaxed">
                                {amend.changes}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-content-muted italic">No subsequent amendments logged; initial baseline remains active.</p>
                        )}
                      </div>
                    </div>

                    {/* 4-Stage Lifecycle Cadence Protocol */}
                    <div className="space-y-4 pt-4 border-t border-subtle">
                      <div className="flex items-center justify-between">
                        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-content-muted flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-content-faint" />
                          <span>4-STAGE STATUS CADENCE & PROTOCOL</span>
                        </h3>
                        <span className="text-[10px] font-mono text-content-faint font-sans">
                          6-Month Institutional Protocol
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Milestone 1 */}
                        <div className="p-3.5 rounded-lg border border-subtle bg-surface-subtle space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-[10px] font-mono text-content-muted">{formatDate(decision.createdAt)}</span>
                          </div>
                          <div className="font-semibold text-xs text-content-primary">
                            1. Launch & Hypothesis Locked
                          </div>
                          <p className="text-[11px] text-content-muted leading-relaxed">
                            Assumptions and counterfactuals frozen in governance ledger.
                          </p>
                        </div>

                        {/* Milestone 2 */}
                        <div className="p-3.5 rounded-lg border border-subtle bg-surface-subtle space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-[10px] font-mono text-content-muted">Day 1</span>
                          </div>
                          <div className="font-semibold text-xs text-content-primary">
                            2. Capital Committed
                          </div>
                          <p className="text-[11px] text-content-muted leading-relaxed">
                            {formatCurrency(decision.originalEstimates.capitalAtRisk)} deployed targeting {decision.originalEstimates.expectedPaybackMonths}mo horizon.
                          </p>
                        </div>

                        {/* Milestone 3 */}
                        <div className="p-3.5 rounded-lg border border-subtle bg-surface-subtle space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "h-6 w-6 rounded-full flex items-center justify-center text-xs",
                              isOverdue 
                                ? "bg-rose-600 text-white" 
                                : decision.status === 'Reviewed'
                                ? "bg-purple-600 text-white"
                                : "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            )}>
                              {isOverdue ? <AlertTriangle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                            </span>
                            <span className={cn(
                              "text-[10px] font-mono",
                              isOverdue ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-content-muted"
                            )}>
                              {isOverdue ? `+${daysOverdue}d delay` : 'In progress'}
                            </span>
                          </div>
                          <div className={cn(
                            "font-semibold text-xs",
                            isOverdue ? "text-rose-600 dark:text-rose-400" : "text-content-primary"
                          )}>
                            3. Execution Horizon
                          </div>
                          <p className="text-[11px] text-content-muted leading-relaxed">
                            {isOverdue ? "Operational review overdue; audit reconciliation triggered." : "Metrics tracking active across standard channels."}
                          </p>
                        </div>

                        {/* Milestone 4 */}
                        <div className="p-3.5 rounded-lg border border-subtle bg-surface-subtle space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "h-6 w-6 rounded-full flex items-center justify-center text-xs",
                              decision.status === 'Reviewed'
                                ? "bg-purple-600 text-white"
                                : isOverdue
                                ? "bg-rose-600 text-white"
                                : "bg-surface-muted text-content-muted"
                            )}>
                              <Calendar className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-[10px] font-mono text-content-primary font-semibold">
                              {formatDate(decision.targetReviewDate)}
                            </span>
                          </div>
                          <div className={cn(
                            "font-semibold text-xs",
                            isOverdue ? "text-rose-600 dark:text-rose-400" : "text-content-primary"
                          )}>
                            4. Retrospective Target
                          </div>
                          <p className="text-[11px] text-content-muted leading-relaxed">
                            {decision.status === 'Reviewed'
                              ? "Audit complete. Actuals indexed into organizational memory."
                              : isOverdue
                              ? `Deadline expired ${daysOverdue} days ago.`
                              : `Scheduled review in ${daysUntil} days.`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 5: RETROSPECTIVE PROTOCOL & ACTIVITY LOG */}
                {(activeTab === 'all' || activeTab === 'retrospective') && (
                  <div className="space-y-6 pt-4 border-t border-subtle">
                    
                    {/* Retrospective Audit Protocol Section */}
                    <div className="p-5 rounded-lg border border-subtle bg-surface-subtle space-y-4 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-content-primary">
                          <Clock className="h-4 w-4 text-content-faint" />
                          <span>6-MONTH RETROSPECTIVE PROTOCOL STATUS</span>
                        </div>
                        {isOverdue && (
                          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 inline-flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                            SLA Breach: Audit Overdue
                          </span>
                        )}
                      </div>

                      {decision.retrospectiveSnapshot ? (
                        <div className="space-y-3">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Retrospective Audit Finalized on {formatDate(decision.retrospectiveSnapshot.reviewedDate || decision.targetReviewDate)}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed font-sans">
                            {decision.retrospectiveSnapshot.actualOutcomeSummary}
                          </p>
                          {decision.retrospectiveSnapshot.keyLearnings && (
                            <div className="pt-3 border-t border-border-muted space-y-2">
                              <span className="text-[11px] font-semibold text-content-muted uppercase tracking-wider block">
                                Indexed Institutional Learnings:
                              </span>
                              <ul className="list-disc list-inside space-y-1 text-xs text-content-secondary">
                                {decision.retrospectiveSnapshot.keyLearnings.map((l, i) => (
                                  <li key={i}>{l}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : isOverdue ? (
                        <div className="space-y-3">
                          <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 space-y-1.5">
                            <div className="font-semibold flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                              <AlertTriangle className="h-4 w-4 shrink-0" />
                              <span>Action Required: Automated Retrospective Overdue</span>
                            </div>
                            <p className="leading-relaxed font-sans">
                              The target review milestone ({formatDate(decision.targetReviewDate)}) expired {daysOverdue} days ago. Institutional governance mandates that {decision.owner.name} reconcile initial unit hypotheses against current performance.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => alert(`Initiating Executive Retrospective Audit reconciliation workflow for ${decision.id}...`)}
                            className="py-2 px-3.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-2xs inline-flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Clock className="h-3.5 w-3.5" />
                            <span>Perform Executive Retrospective Audit Now</span>
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-content-muted font-sans">
                          Review milestone scheduled for <strong className="text-content-primary">{formatDate(decision.targetReviewDate)}</strong> ({daysUntil} days remaining). Audit reconciliation workflow will unlock automatically upon deadline.
                        </p>
                      )}
                    </div>

                    {/* Activity & Progress Notes Feed */}
                    <div className="space-y-3 pt-4 border-t border-subtle">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-content-muted">
                          <Activity className="h-4 w-4 text-content-faint" />
                          <span>ACTIVITY & AUDIT TRAIL LOG</span>
                        </div>
                        <span className="text-[11px] font-mono text-content-faint">
                          {notes.length} Logged Entries
                        </span>
                      </div>

                      {/* Add Note Form */}
                      <form onSubmit={handleAddNote} className="space-y-2">
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Add audit note, executive commentary, or track update..."
                            className="w-full h-8 pl-3 pr-16 rounded-md border border-subtle bg-surface text-xs text-content-primary placeholder:text-content-faint focus:outline-none focus:border-border-strong transition-colors font-sans"
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

                      {/* Feed of Notes */}
                      <div className="space-y-2.5">
                        {notes.map((note) => (
                          <div
                            key={note.id}
                            className={cn(
                              "p-3 rounded-lg border text-xs space-y-1 transition-colors shadow-2xs",
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
                    </div>
                  </div>
                )}

              </div>

              {/* 4. MODAL FOOTER */}
              <div className="shrink-0 px-4 sm:px-6 py-3.5 border-t border-subtle bg-surface-muted/60 flex items-center justify-between text-xs text-content-muted">
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <Lock className="h-3.5 w-3.5 text-content-faint" />
                  <span className="hidden sm:inline">DECIDEOS COMPLIANCE AUDIT TRAIL • SHA-256 VERIFIED</span>
                  <span className="sm:hidden">SHA-256 VERIFIED</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportDossier}
                    className="px-3 py-1.5 rounded-md bg-surface border border-subtle hover:bg-surface-hover text-content-secondary font-medium text-xs transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="h-3 w-3 text-content-faint" />
                    <span>Export JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-1.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium text-xs transition-colors shadow-2xs cursor-pointer"
                  >
                    Close Dossier
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
