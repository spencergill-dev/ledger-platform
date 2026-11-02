import React, { useEffect } from 'react';
import { Decision } from '../../types/decision';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { 
  formatCurrency, 
  formatDate, 
  isPastDate, 
  getDaysOverdue, 
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
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  GitCommit,
  UserCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DecisionSidePanelProps {
  decision: Decision | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDeepDive: (decision: Decision) => void;
}

export function DecisionSidePanel({
  decision,
  isOpen,
  onClose,
  onOpenDeepDive,
}: DecisionSidePanelProps) {
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

  if (!decision) return null;

  const isOverdue = decision.status === 'Review Due' && isPastDate(decision.targetReviewDate);
  const daysOverdue = isOverdue ? getDaysOverdue(decision.targetReviewDate) : 0;
  const actuals = decision.actuals;

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
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[500px] md:w-[580px] lg:w-[44%] min-w-[390px] max-w-[720px] bg-white dark:bg-[#141414] border-l border-slate-200 dark:border-neutral-700 shadow-none rounded-none flex flex-col h-full overflow-hidden text-slate-900 dark:text-slate-100"
            role="dialog"
            aria-label={`${decision.id} Ledger Details`}
          >
            {/* Header Toolbar */}
            <div className="shrink-0 px-5 sm:px-6 py-3.5 border-b border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#141414] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded border border-slate-200 dark:border-neutral-700">
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
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                      <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
                      +{daysOverdue}d Overdue
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

              {/* SECTION 1: POSITIONS & STAKEHOLDER CONSENSUS */}
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
                <div className="p-3 rounded-md border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0",
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
                        className="p-3 rounded-md border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0",
                              stk.avatarColor || getDepartmentAvatarStyle(stk.role, 'Infrastructure')
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

              {/* SECTION 2: AMENDMENT LEDGER */}
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
                  {decision.amendments?.map((amend, idx) => (
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

              {/* SECTION 3: OUTCOME VARIANCE (EXPECTED VS. ACTUALS) */}
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
                  <div className="p-3.5 rounded-md border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] space-y-1.5">
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
                  <div className="p-3.5 rounded-md border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] space-y-1.5">
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
                <div className="p-3.5 rounded-md border border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/60 space-y-1">
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

            </div>

            {/* Flat Footer Action Bar */}
            <div className="shrink-0 p-4 border-t border-slate-200 dark:border-neutral-800 bg-slate-50/90 dark:bg-neutral-900/90 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span>Immutable Record • v{decision.version?.split(' ')[0] || '1.0'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  Close (Esc)
                </button>
                <button
                  type="button"
                  onClick={() => onOpenDeepDive(decision)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  <span>Open Audit Modal</span>
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
