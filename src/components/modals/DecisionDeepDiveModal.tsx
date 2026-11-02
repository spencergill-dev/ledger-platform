import { Decision } from '../../types/decision';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { 
  formatCurrency, 
  formatDate, 
  isPastDate, 
  getDaysOverdue, 
  getDaysElapsed, 
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
  Share2,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DecisionDeepDiveModalProps {
  decision: Decision | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DecisionDeepDiveModal({
  decision,
  isOpen,
  onClose,
}: DecisionDeepDiveModalProps) {
  if (!decision) return null;

  const isOverdue = decision.status === 'Review Due' && isPastDate(decision.targetReviewDate);
  const daysOverdue = isOverdue ? getDaysOverdue(decision.targetReviewDate) : 0;
  const daysElapsed = getDaysElapsed(decision.createdAt);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="min-h-full flex items-center justify-center p-3 sm:p-6 lg:p-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-5xl bg-surface-elevated rounded-2xl border border-subtle shadow-elevated overflow-hidden text-content-primary my-8"
              role="dialog"
              aria-modal="true"
            >
              {/* Top Bar with Audit Breadcrumb & Actions */}
              <div className="px-6 py-4 border-b border-subtle bg-surface-muted/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Return to Ledger</span>
                  </button>
                  <span className="text-gray-300 dark:text-neutral-700">|</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                      {decision.id}
                    </span>
                    <Tooltip content="Cryptographically locked snapshot signed at executive approval">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                        <ShieldCheck className="h-3 w-3" />
                        Immutable Record
                      </span>
                    </Tooltip>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Tooltip content="Download compliance-ready PDF / JSON verification audit dossier">
                    <button
                      onClick={() => alert(`Exporting compliance audit pack for ${decision.id}...`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-neutral-800 hover:bg-gray-100 rounded-lg border border-gray-300 dark:border-neutral-700 shadow-xs transition-colors"
                    >
                      <Download className="h-3.5 w-3.5 text-gray-500" />
                      <span>Export Audit Pack</span>
                    </button>
                  </Tooltip>

                  <Tooltip content="Close audit modal (Esc)">
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <X className="h-4 w-4 stroke-[2.5]" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Dossier Content */}
              <div className="p-6 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto">
                
                {/* Dossier Header */}
                <div className="space-y-3 pb-6 border-b border-gray-200 dark:border-neutral-800">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Badge status={decision.status}>{decision.status}</Badge>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-800 px-2.5 py-0.5 rounded-md border border-gray-200 dark:border-neutral-700">
                      Category: {decision.category}
                    </span>
                    {isOverdue && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-900 border border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/60">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-700 dark:text-red-400 shrink-0" />
                        Retrospective Overdue (+{daysOverdue} days)
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-cal">
                    {decision.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-1">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold shrink-0 shadow-2xs",
                        getDepartmentAvatarStyle(decision.owner.role, decision.category)
                      )}>
                        {decision.owner.initials || getInitials(decision.owner.name)}
                      </div>
                      <div>
                        Sponsor: <span className="font-semibold text-gray-900 dark:text-white">{decision.owner.name}</span> ({decision.owner.role})
                      </div>
                    </div>
                    <span>•</span>
                    <div>
                      Locked Date: <span className="font-semibold text-gray-900 dark:text-white">{formatDate(decision.createdAt)}</span>
                    </div>
                    <span>•</span>
                    <div>
                      Target Review Date: <span className="font-semibold text-gray-900 dark:text-white">{formatDate(decision.targetReviewDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Top Metrics Cards: Capital & Time at Risk */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-xl border border-subtle bg-surface-subtle shadow-xs space-y-1">
                    <span className="text-xs font-medium text-gray-500">Capital Allocation</span>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white font-cal">
                      {formatCurrency(decision.originalEstimates.capitalAtRisk)}
                    </div>
                    <p className="text-xs text-gray-500">
                      Payback horizon: {decision.originalEstimates.expectedPaybackMonths} months
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-subtle bg-surface-subtle shadow-xs space-y-1">
                    <span className="text-xs font-medium text-gray-500">
                      Time Allocation
                    </span>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white font-cal">
                      {decision.originalEstimates.expectedPaybackMonths} Months
                    </div>
                    {isOverdue ? (
                      <p className="text-xs font-semibold text-red-900 dark:text-red-400 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-red-700 dark:text-red-400 shrink-0" />
                        <span>+{daysOverdue} Days Overdue (Bleeding)</span>
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Target Review: {formatDate(decision.targetReviewDate)}
                      </p>
                    )}
                  </div>

                  <div className="p-5 rounded-xl border border-subtle bg-surface-subtle shadow-xs space-y-1">
                    <span className="text-xs font-medium text-gray-500">Primary Benchmark Target</span>
                    <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 font-cal">
                      {decision.originalEstimates.targetMetricValue}
                    </div>
                    <p className="text-xs text-gray-500">
                      Metric: {decision.originalEstimates.primaryMetric}
                    </p>
                  </div>
                </div>

                {/* Section 1: Frozen Hypothesis & Strategic Justification */}
                <div className="p-6 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50/70 dark:bg-neutral-900/50 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>Locked Executive Hypothesis</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed font-normal">
                    "{decision.hypothesis}"
                  </p>
                  <div className="pt-3 border-t border-gray-200 dark:border-neutral-800 text-xs text-gray-500 flex items-center justify-between">
                    <span>Expected Annual Impact: <strong className="text-gray-900 dark:text-white">{decision.originalEstimates.expectedAnnualImpact}</strong></span>
                    <span className="font-mono text-[11px]">HASH: 9f8a7c2b...4e1d</span>
                  </div>
                </div>

                {/* Section 2: Counterfactual Alternatives Evaluated */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                    <GitFork className="h-4 w-4 text-gray-500" />
                    <span>Counterfactuals & Rejected Alternatives</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {decision.alternativesConsidered && decision.alternativesConsidered.length > 0 ? (
                      decision.alternativesConsidered.map((alt, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-subtle bg-surface-subtle shadow-xs space-y-2">
                          <div className="flex items-center justify-between font-semibold text-xs text-gray-900 dark:text-white">
                            <span>Alternative {idx + 1}: {alt.title}</span>
                            <span className="text-gray-500 font-mono text-[11px]">
                              Est: {formatCurrency(alt.estimatedCost)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                            {alt.rationale}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No alternative paths registered.</p>
                    )}
                  </div>
                </div>

                {/* Section 3: Retrospective Audit Status */}
                <div className="p-6 rounded-xl border border-subtle bg-surface-subtle shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>6-Month Retrospective Protocol Status</span>
                    </div>
                    {isOverdue && (
                      <span className="text-xs font-semibold text-red-900 dark:text-red-300 inline-flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-700 dark:text-red-400 shrink-0" />
                        SLA Breach: Audit Overdue
                      </span>
                    )}
                  </div>

                  {decision.retrospectiveSnapshot ? (
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Retrospective Audit Complete on {formatDate(decision.retrospectiveSnapshot.reviewedDate || decision.targetReviewDate)}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {decision.retrospectiveSnapshot.actualOutcomeSummary}
                      </p>
                      {decision.retrospectiveSnapshot.keyLearnings && (
                        <div className="pt-3 border-t border-gray-200 dark:border-neutral-800 space-y-1.5">
                          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                            Institutional Learnings:
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            {decision.retrospectiveSnapshot.keyLearnings.map((l, i) => (
                              <li key={i}>{l}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : isOverdue ? (
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-900/60 text-xs text-red-950 dark:text-red-200 space-y-1.5">
                        <div className="font-semibold flex items-center gap-1.5 text-red-900 dark:text-red-300">
                          <AlertTriangle className="h-4 w-4 text-red-700 dark:text-red-400 shrink-0" />
                          <span>Action Required: Automated Retrospective Overdue</span>
                        </div>
                        <p className="leading-relaxed">
                          The target review milestone ({formatDate(decision.targetReviewDate)}) expired {daysOverdue} days ago. Institutional protocol mandates that {decision.owner.name} reconcile initial unit hypotheses against current performance.
                        </p>
                      </div>

                      <button
                        onClick={() => alert(`Initiating full Retrospective Audit reconciliation workflow for ${decision.id}...`)}
                        className="py-2.5 px-4 rounded-lg bg-red-700 hover:bg-red-800 text-white font-medium text-xs shadow-sm inline-flex items-center gap-2 transition-colors"
                      >
                        <Clock className="h-4 w-4" />
                        <span>Perform Executive Retrospective Audit Now</span>
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Review milestone scheduled for <strong>{formatDate(decision.targetReviewDate)}</strong>. Audit reconciliation will unlock automatically.
                    </p>
                  )}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex items-center justify-between text-xs text-gray-500">
                <span className="font-mono text-[11px]">
                  PRAXUS AUDIT TRAIL • DECISION HASH SHA-256
                </span>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs transition-colors"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
