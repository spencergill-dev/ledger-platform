import React, { useState, useEffect, useRef } from 'react';
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
  ExternalLink, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  ArrowUpRight, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  Lock, 
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  Info
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
  decision: propDecision,
  isOpen,
  onClose,
  onOpenDeepDive,
}: DecisionSidePanelProps) {
  const lastDecisionRef = useRef<Decision | null>(propDecision);
  if (propDecision) {
    lastDecisionRef.current = propDecision;
  }
  const decision = propDecision || lastDecisionRef.current;

  const [newNote, setNewNote] = useState('');
  const [activeTimelineStep, setActiveTimelineStep] = useState<number | null>(null);
  const [notes, setNotes] = useState<ActivityNote[]>([]);

  // Initialize or reset activity notes based on the selected decision
  useEffect(() => {
    if (!decision) return;

    const isOverdue = decision.status === 'Review Due' && isPastDate(decision.targetReviewDate);
    const daysOverdue = isOverdue ? getDaysOverdue(decision.targetReviewDate) : 0;

    const initialNotes: ActivityNote[] = [
      {
        id: 'n1',
        author: 'Executive Governance Committee',
        role: 'Audit Sign-off',
        date: formatDate(decision.createdAt),
        text: `Hypothesis and initial ${formatCurrency(decision.originalEstimates.capitalAtRisk)} capital allocation approved. Automated 6-month retrospective scheduled for ${formatDate(decision.targetReviewDate)}.`,
        tag: 'audit',
      },
      {
        id: 'n2',
        author: decision.owner.name,
        role: decision.owner.role,
        date: formatDate(decision.createdAt),
        text: `Primary success metric locked: "${decision.originalEstimates.primaryMetric}" with target benchmark of "${decision.originalEstimates.targetMetricValue}".`,
        tag: 'milestone',
      },
    ];

    if (isOverdue) {
      initialNotes.unshift({
        id: 'n0',
        author: 'Praxus Sentinel Bot',
        role: 'Automated SLA Monitor',
        date: `${daysOverdue} days ago`,
        text: `SLA Breached: Decision reached 6-month review horizon without closed retrospective audit. Requires immediate executive reconciliation.`,
        tag: 'warning',
      });
    }

    setNotes(initialNotes);
  }, [decision?.id]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!decision) return null;

  const isOverdue = decision.status === 'Review Due' && isPastDate(decision.targetReviewDate);
  const daysOverdue = isOverdue ? getDaysOverdue(decision.targetReviewDate) : 0;
  const daysElapsed = getDaysElapsed(decision.createdAt);
  const daysUntil = getDaysUntil(decision.targetReviewDate);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const noteItem: ActivityNote = {
      id: `user-${Date.now()}`,
      author: 'Spencer Vance',
      role: 'Portfolio Overseer',
      date: 'Just now',
      text: newNote.trim(),
      tag: 'general',
    };

    setNotes([noteItem, ...notes]);
    setNewNote('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dimmed Scrim / Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-[1.5px] transition-opacity"
            aria-hidden="true"
          />

          {/* Slide-over Side Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[480px] md:w-[540px] lg:w-[38%] min-w-[390px] max-w-[640px] bg-white dark:bg-[#141414] border-l border-gray-200 dark:border-neutral-800 shadow-2xl flex flex-col h-full overflow-hidden text-gray-900 dark:text-gray-100"
            role="dialog"
            aria-label={`${decision.id} Details`}
          >
            {/* Top Navigation & Deep Dive Escapes Bar */}
            <div className="shrink-0 px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#141414] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded border border-gray-200 dark:border-neutral-700">
                  {decision.id}
                </span>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {decision.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Deep Dive Action Button (Escapes Sidebar) - Locked */}
                <Tooltip content="Dedicated page currently in development (Locked)">
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 dark:text-neutral-500 bg-slate-100/80 dark:bg-neutral-800/60 rounded-lg border border-slate-200 dark:border-neutral-700 cursor-not-allowed transition-all"
                  >
                    <Lock className="h-3 w-3 text-slate-400 dark:text-neutral-500" />
                    <span>Open Dedicated Page</span>
                  </button>
                </Tooltip>

                {/* Close Button */}
                <Tooltip content="Close drawer (Esc)">
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                    aria-label="Close side panel"
                  >
                    <X className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Scrollable Panel Body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
              
              {/* Header Title Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge status={decision.status}>
                    {decision.status}
                  </Badge>
                  {isOverdue && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-900 border border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/60">
                      <AlertTriangle className="h-3 w-3 text-red-700 dark:text-red-400" />
                      +{daysOverdue}d Overdue
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-snug font-cal">
                  {decision.id}: {decision.title}
                </h2>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-normal bg-gray-50 dark:bg-neutral-900/70 p-3 rounded-lg border border-gray-200 dark:border-neutral-800">
                  <span className="font-semibold text-gray-900 dark:text-white block mb-0.5">Original Executive Hypothesis:</span>
                  "{decision.hypothesis}"
                </p>
              </div>

              {/* Dual-Resource Model: Capital Allocation & Time Allocation */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* Resource Pillar 1: Capital Allocation */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                    <span>Capital Allocation</span>
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tight font-cal">
                    {formatCurrency(decision.originalEstimates.capitalAtRisk)}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {decision.originalEstimates.expectedPaybackMonths}mo expected payback
                  </div>
                </div>

                {/* Resource Pillar 2: Time Allocation */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                    <span>Time Allocation</span>
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tight font-cal">
                    {decision.originalEstimates.expectedPaybackMonths} Months
                  </div>
                  {isOverdue ? (
                    <div className="text-[11px] font-semibold text-red-900 dark:text-red-400 flex items-center gap-1 truncate">
                      <AlertTriangle className="h-3 w-3 text-red-700 dark:text-red-400 shrink-0" />
                      <span>+{daysOverdue} Days Overdue (Bleeding)</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      Target: {formatDate(decision.targetReviewDate)} ({daysUntil}d to target)
                    </div>
                  )}
                </div>
              </div>

              {/* Status & SLA Pill Banner */}
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0 shadow-2xs",
                    getDepartmentAvatarStyle(decision.owner.role, decision.category)
                  )}>
                    {decision.owner.initials || getInitials(decision.owner.name)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-900 dark:text-white">{decision.owner.name}</span>
                    <span className="text-gray-400">({decision.owner.role})</span>
                  </div>
                </div>
                <div>
                  {isOverdue ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold text-red-900 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-900/60">
                      <AlertTriangle className="h-3 w-3 text-red-700 dark:text-red-400" />
                      SLA Breached
                    </span>
                  ) : decision.status === 'Reviewed' ? (
                    <span className="font-semibold text-purple-700 dark:text-purple-300">Audited</span>
                  ) : (
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">SLA Healthy</span>
                  )}
                </div>
              </div>

              {/* Interactive Visual Vertical Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status Timeline & Milestones
                  </h3>
                  <span className="text-[11px] text-gray-400 font-sans">
                    6-Month Retrospective Protocol
                  </span>
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200 dark:before:bg-neutral-800">
                  {/* Milestone 1: Project Launch */}
                  <div 
                    onClick={() => setActiveTimelineStep(1)}
                    className="relative cursor-pointer group"
                  >
                    <span className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow-sm">
                      <CheckCircle2 className="h-3 w-3" />
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                          Project Launch & Hypothesis Locked
                        </span>
                        <span className="text-[11px] text-gray-400 font-sans">{formatDate(decision.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-normal">
                        Original assumptions, benchmark payoff, and alternatives frozen in governance ledger.
                      </p>
                    </div>
                  </div>

                  {/* Milestone 2: Capital Deployment */}
                  <div 
                    onClick={() => setActiveTimelineStep(2)}
                    className="relative cursor-pointer group"
                  >
                    <span className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow-sm">
                      <CheckCircle2 className="h-3 w-3" />
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                          Capital Committed ({formatCurrency(decision.originalEstimates.capitalAtRisk)})
                        </span>
                        <span className="text-[11px] text-gray-400 font-sans">Day 1</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-normal">
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
                      "absolute -left-6 top-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] shadow-sm",
                      isOverdue 
                        ? "bg-red-700 text-white" 
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
                          "font-semibold group-hover:underline transition-colors",
                          isOverdue ? "text-red-900 dark:text-red-400" : "text-gray-900 dark:text-white"
                        )}>
                          {isOverdue ? "Execution Delayed / Audit Pending" : "Mid-flight Operations"}
                        </span>
                        <span className={cn(
                          "text-[11px] font-sans",
                          isOverdue ? "text-red-700 dark:text-red-400 font-semibold" : "text-gray-400"
                        )}>
                          {isOverdue ? `+${daysOverdue}d delay` : 'In progress'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-normal">
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
                      "absolute -left-6 top-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] shadow-sm ring-4 ring-white dark:ring-[#141414]",
                      decision.status === 'Reviewed'
                        ? "bg-purple-600 text-white"
                        : isOverdue
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-gray-300 dark:bg-neutral-700 text-gray-700 dark:text-gray-300"
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
                          "font-semibold",
                          isOverdue ? "text-red-900 dark:text-red-400" : "text-gray-900 dark:text-white"
                        )}>
                          6-Month Retrospective Target
                        </span>
                        <span className="text-[11px] font-semibold text-gray-900 dark:text-white tabular-nums">
                          {formatDate(decision.targetReviewDate)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-normal">
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

              {/* Activity & Additional Tracking Section */}
              <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <Activity className="h-3.5 w-3.5 text-gray-400" />
                    <span>Activity & Additional Tracking</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-sans">
                    {notes.length} logged entries
                  </span>
                </div>

                {/* Input Field: Add Progress Note / Update Track */}
                <form onSubmit={handleAddNote} className="space-y-2">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add Progress Note / Update Track..."
                      className="w-full h-9 pl-3.5 pr-20 rounded-lg border border-slate-200 dark:border-neutral-700/80 bg-slate-50/60 dark:bg-neutral-800/50 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-card focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!newNote.trim()}
                      className="absolute right-1 top-1 h-7 px-2.5 rounded-md bg-[#2563EB] hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-[#2563EB] text-white text-xs font-medium inline-flex items-center gap-1 transition-all shadow-xs"
                    >
                      <span>Post</span>
                      <Send className="h-3 w-3" />
                    </button>
                  </div>
                </form>

                {/* Feed of Notes */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className={cn(
                        "p-3 rounded-lg border text-xs space-y-1 transition-colors",
                        note.tag === 'warning'
                          ? "bg-red-50/80 dark:bg-red-950/40 border-red-200 dark:border-red-900/60"
                          : note.tag === 'audit'
                          ? "bg-gray-50 dark:bg-neutral-900/60 border-gray-200 dark:border-neutral-800"
                          : "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "font-semibold tracking-tight",
                            note.tag === 'warning' ? "text-red-900 dark:text-red-300" : "text-gray-900 dark:text-white"
                          )}>
                            {note.author}
                          </span>
                          <span className="text-[10px] text-gray-400">• {note.role}</span>
                        </div>
                        <span className="text-[11px] text-gray-400 tabular-nums">{note.date}</span>
                      </div>
                      <p className={cn(
                        "leading-relaxed",
                        note.tag === 'warning' ? "text-red-950/90 dark:text-red-200/90 font-medium" : "text-gray-600 dark:text-gray-300"
                      )}>
                        {note.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Faint, Elegant Data Charts / Progress Metrics */}
              <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-neutral-800">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
                    <span>Decision Trajectory & Unit Metrics</span>
                  </div>
                  <span className="text-[11px] text-gray-400">Live Telemetry</span>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50 space-y-3.5">
                  {/* Metric Bar 1: Capital Deployed */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Capital Deployed vs Allocation</span>
                      <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                        {formatCurrency(decision.originalEstimates.capitalAtRisk * 0.82)} / {formatCurrency(decision.originalEstimates.capitalAtRisk)} (82%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }} />
                    </div>
                  </div>

                  {/* Metric Bar 2: Timeline Horizon / Elapsed */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Timeline Horizon Elapsed</span>
                      <span className={cn(
                        "font-semibold tabular-nums",
                        isOverdue ? "text-red-900 dark:text-red-400" : "text-gray-900 dark:text-white"
                      )}>
                        {isOverdue ? `100% (+${daysOverdue}d breached)` : '68% of review window'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-neutral-800 rounded-full overflow-hidden flex">
                      {isOverdue ? (
                        <>
                          <div className="h-full bg-[#2563EB] rounded-l-full" style={{ width: '80%' }} />
                          <div className="h-full bg-red-600 rounded-r-full" style={{ width: '20%' }} />
                        </>
                      ) : (
                        <div className="h-full bg-[#2563EB] rounded-full" style={{ width: '68%' }} />
                      )}
                    </div>
                  </div>

                  {/* Primary Target Benchmark */}
                  <div className="pt-2 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-500 block text-[11px]">Primary Benchmark Target:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {decision.originalEstimates.primaryMetric}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold block tabular-nums">
                        {decision.originalEstimates.targetMetricValue}
                      </span>
                      <span className="text-[10px] text-gray-400">Target Benchmark</span>
                    </div>
                  </div>

                  {/* Faint Elegant Mini Sparkline Chart */}
                  <div className="pt-2">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Monthly Realization vs Model</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">+18.4% ARR Run Rate</span>
                    </div>
                    <svg className="w-full h-10 text-emerald-500/20 dark:text-emerald-400/20" viewBox="0 0 300 40" fill="none">
                      <path
                        d="M0 35 Q 50 32, 100 24 T 200 16 T 300 6 L 300 40 L 0 40 Z"
                        fill="currentColor"
                      />
                      <path
                        d="M0 35 Q 50 32, 100 24 T 200 16 T 300 6"
                        stroke="#10b981"
                        strokeWidth="2"
                        fill="none"
                      />
                      {/* Dotted projected line */}
                      <path
                        d="M0 38 L 300 14"
                        stroke="#9ca3af"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        fill="none"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Anchored Deep Dive Callout */}
              <div className="p-3.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50/75 dark:bg-neutral-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-gray-500" />
                    <span className="font-semibold text-xs text-gray-900 dark:text-white">
                      Full Institutional Audit Dossier
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">SHA-256 Verified</span>
                </div>
                <Tooltip content="Dedicated page currently in development (Locked)" wrapperClassName="w-full">
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 px-3.5 rounded-lg bg-slate-100 dark:bg-neutral-800/80 text-slate-400 dark:text-neutral-500 text-xs font-medium inline-flex items-center justify-center gap-1.5 border border-slate-200 dark:border-neutral-700/80 cursor-not-allowed transition-all"
                  >
                    <Lock className="h-3.5 w-3.5 text-slate-400 dark:text-neutral-500" />
                    <span>Open Dedicated Full Page Dossier</span>
                  </button>
                </Tooltip>
              </div>

            </div>

            {/* Bottom Drawer Footer */}
            <div className="shrink-0 px-5 sm:px-6 py-3 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex items-center justify-between text-xs text-gray-500">
              <span className="font-mono text-[11px]">PRAXUS-GOV-ID: {decision.id}</span>
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Dismiss Panel
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
