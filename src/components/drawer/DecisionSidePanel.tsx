import React, { useEffect } from 'react';
import { Decision } from '../../types/decision';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { 
  formatCurrency, 
  formatDate, 
  isPastDate, 
  getDaysOverdue, 
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
  ShieldCheck, 
  Lock, 
  ArrowRight,
  Sparkles,
  GitFork,
  CheckCircle2,
  FileText
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
  const daysUntil = getDaysUntil(decision.targetReviewDate);
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
            className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-black/60 backdrop-blur-2xs"
            aria-hidden="true"
          />

          {/* Compact Right-Hand Preview Pane (Lightweight Inspector) */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] md:w-[450px] max-w-[480px] bg-surface-elevated border-l border-subtle shadow-elevated flex flex-col h-full overflow-hidden text-content-primary"
            role="dialog"
            aria-label={`${decision.id} Quick Preview`}
          >
            {/* Header Bar */}
            <div className="shrink-0 px-5 py-3.5 border-b border-subtle bg-surface-muted/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-content-primary bg-surface px-2 py-0.5 rounded border border-subtle">
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

                <span className="text-xs text-content-faint">•</span>
                <span className="text-xs font-medium text-content-muted font-sans">
                  {decision.category}
                </span>
              </div>

              <Tooltip content="Close preview (Esc)">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-md text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors cursor-pointer"
                  aria-label="Close preview"
                >
                  <X className="h-4 w-4 stroke-[2.5]" />
                </button>
              </Tooltip>
            </div>

            {/* Scrollable Compact Content */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
              
              {/* Title & Status Header */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge status={decision.status}>
                    {decision.status}
                  </Badge>
                  {isOverdue && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60 font-sans">
                      <AlertTriangle className="h-3 w-3 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>+{daysOverdue}d Delay</span>
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-content-primary leading-snug font-cal">
                  {decision.title}
                </h2>
              </div>

              {/* The "Why" Hypothesis Callout */}
              <div className="p-4 rounded-lg bg-surface-subtle border border-subtle space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-[10px] font-mono font-semibold uppercase tracking-wider text-content-muted">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-content-faint" />
                    <span>ORIGINAL EXECUTIVE HYPOTHESIS</span>
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono">
                    {decision.originalEstimates.expectedAnnualImpact}
                  </span>
                </div>
                <p className="italic text-xs sm:text-sm text-content-secondary leading-relaxed font-sans">
                  "{decision.hypothesis}"
                </p>
              </div>

              {/* Quick-Hit 3-Column Metric Tiles */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-md border border-subtle bg-surface-subtle space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] text-content-muted font-medium">
                    <span>Capital</span>
                    <DollarSign className="h-3.5 w-3.5 text-content-faint" />
                  </div>
                  <div className="text-base font-bold text-content-primary font-cal tabular-nums">
                    {formatCurrency(actuals ? actuals.actualCapital : decision.originalEstimates.capitalAtRisk)}
                  </div>
                  <div className="text-[10px] text-content-muted truncate font-sans">
                    {actuals && actuals.capitalVariancePercent > 0 ? `+${actuals.capitalVariancePercent}% over` : `${decision.originalEstimates.expectedPaybackMonths}mo payback`}
                  </div>
                </div>

                <div className="p-3 rounded-md border border-subtle bg-surface-subtle space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] text-content-muted font-medium">
                    <span>Horizon</span>
                    <Clock className="h-3.5 w-3.5 text-content-faint" />
                  </div>
                  <div className="text-base font-bold text-content-primary font-cal tabular-nums">
                    {decision.originalEstimates.expectedPaybackMonths}mo
                  </div>
                  <div className="text-[10px] text-content-muted truncate font-sans">
                    {isOverdue ? `+${daysOverdue}d overdue` : `Target: ${formatDate(decision.targetReviewDate)}`}
                  </div>
                </div>

                <div className="p-3 rounded-md border border-subtle bg-surface-subtle space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] text-content-muted font-medium">
                    <span>Target</span>
                    <Sparkles className="h-3.5 w-3.5 text-content-faint" />
                  </div>
                  <div className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-cal truncate tabular-nums">
                    {actuals ? actuals.actualMetricValue : decision.originalEstimates.targetMetricValue}
                  </div>
                  <div className="text-[10px] text-content-muted truncate font-sans">
                    {decision.originalEstimates.primaryMetric}
                  </div>
                </div>
              </div>

              {/* Strategic Lineage & Branching Signal (If Part of Tree) */}
              {decision.parentDecisionId && (
                <div className="p-3 rounded-md bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    <GitFork className="h-3.5 w-3.5" />
                    <span>BRANCHED FROM {decision.parentDecisionId}</span>
                  </div>
                  {decision.branchedReason && (
                    <p className="text-xs text-blue-950 dark:text-blue-200 leading-relaxed font-sans">
                      {decision.branchedReason}
                    </p>
                  )}
                </div>
              )}

              {/* Sponsor & Stakeholder Consensus Preview */}
              <div className="space-y-2 pt-2 border-t border-subtle">
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-content-muted flex items-center justify-between">
                  <span>GOVERNANCE & SPONSOR</span>
                  <span className="text-[10px] text-content-faint font-mono">
                    {decision.stakeholders?.length || 0} Recorded Stances
                  </span>
                </div>

                {/* Primary Sponsor Card */}
                <div className="p-2.5 rounded-md border border-subtle bg-surface-subtle flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shrink-0 font-sans shadow-2xs",
                      getDepartmentAvatarStyle(decision.owner.role, decision.category)
                    )}>
                      {decision.owner.initials || getInitials(decision.owner.name)}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-content-primary font-sans">
                        {decision.owner.name}
                      </div>
                      <div className="text-[11px] text-content-muted font-sans">
                        {decision.owner.role} • Sponsor
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Lead</span>
                  </span>
                </div>

                {/* Stakeholders Stance Pills */}
                {decision.stakeholders && decision.stakeholders.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {decision.stakeholders.map((stk) => {
                      const dotBg = stk.stance === 'dissent' ? 'bg-red-500' : stk.stance === 'conditions' ? 'bg-amber-500' : 'bg-emerald-500';
                      return (
                        <div
                          key={stk.id}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface border border-subtle text-[11px] text-content-secondary shadow-2xs"
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotBg)} />
                          <span className="font-medium">{stk.name}</span>
                          <span className="text-content-faint uppercase font-mono text-[9px]">({stk.stance})</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* HERO CALL TO ACTION: Open Dedicated Full Rationale Page */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => onOpenDeepDive(decision)}
                  className="w-full py-3 px-4 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs sm:text-sm shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 flex items-center justify-center gap-2 transition-all cursor-pointer group"
                >
                  <span>View Full Rationale & Audit Dossier</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <p className="text-[11px] text-center text-content-muted mt-2 font-sans">
                  Opens complete compliance audit pack, variance breakdown & immutable records.
                </p>
              </div>

            </div>

            {/* Footer Bar */}
            <div className="shrink-0 p-3.5 border-t border-subtle bg-surface-muted/50 flex items-center justify-between text-xs text-content-muted">
              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                <Lock className="h-3 w-3 text-content-faint" />
                <span>Immutable Record • {decision.version?.split(' ')[0] || 'v1.0'}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-content-secondary hover:text-content-primary hover:underline cursor-pointer"
              >
                Close (Esc)
              </button>
            </div>

          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
