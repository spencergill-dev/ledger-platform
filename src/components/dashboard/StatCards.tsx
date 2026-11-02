import { Decision } from '../../types/decision';
import { isPastDate, formatCurrency, getDaysOverdue } from '../../lib/utils';
import { DollarSign, Clock, Layers, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

interface StatCardsProps {
  decisions: Decision[];
}

export function StatCards({ decisions }: StatCardsProps) {
  const totalCapital = decisions.reduce(
    (sum, d) => sum + d.originalEstimates.capitalAtRisk, 
    0
  );

  const overdueDecisions = decisions.filter(
    (d) => d.status === 'Review Due' && isPastDate(d.targetReviewDate)
  );
  const overdueCount = overdueDecisions.length;
  const maxDaysOverdue = overdueDecisions.reduce(
    (max, d) => Math.max(max, getDaysOverdue(d.targetReviewDate)),
    0
  );

  const activeBets = decisions.filter(
    (d) => d.status === 'In Progress' || d.status === 'Approved'
  ).length;

  const reviewedCount = decisions.filter((d) => d.status === 'Reviewed').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {/* Total Capital at Risk */}
      <div className="rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#171717] p-5 shadow-sm transition-colors">
        <Tooltip content="Total capital at risk deployed across active strategic commitments">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-help">
            <DollarSign className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span>Capital Committed</span>
          </div>
        </Tooltip>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(totalCapital)}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Across {decisions.length} strategic decisions
        </p>
      </div>

      {/* Time at Risk & Overdue Retrospectives Card */}
      <div className="rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#171717] p-5 shadow-sm transition-colors">
        <Tooltip content="Maximum days elapsed beyond the mandatory 6-month retrospective deadline">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-help">
            <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0" />
            <span>Time at Risk (Overdue)</span>
          </div>
        </Tooltip>
        <div className="mt-2 flex items-baseline gap-2">
          <Tooltip content={`${overdueCount} decisions breached their review date by up to ${maxDaysOverdue} days`}>
            <span className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400 tabular-nums cursor-help">
              {overdueCount > 0 ? `+${maxDaysOverdue}d` : '0d'}
            </span>
          </Tooltip>
          {overdueCount > 0 && (
            <Tooltip content="Sponsor retrospective review overdue; executive action required">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200/60 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/60 px-2 py-0.5 rounded-md cursor-help">
                <AlertTriangle className="h-3 w-3 text-red-500 dark:text-red-400 shrink-0" />
                Action Required
              </span>
            </Tooltip>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {overdueCount > 0 
            ? `${overdueCount} decisions breached 6mo SLA horizon` 
            : "All decision reviews in good standing"}
        </p>
      </div>

      {/* Active Strategic Bets */}
      <div className="rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#171717] p-5 shadow-sm transition-colors">
        <Tooltip content="Decisions currently in execution phase awaiting retrospective review">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-help">
            <Layers className="h-4 w-4 text-blue-500 dark:text-blue-400 shrink-0" />
            <span>Active Decisions</span>
          </div>
        </Tooltip>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {activeBets}
          </span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">in flight</span>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Approved & In Progress executions
        </p>
      </div>

      {/* Completed Retrospectives */}
      <div className="rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#171717] p-5 shadow-sm transition-colors">
        <Tooltip content="Decisions that have completed full retrospective analysis and archived their learnings">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-help">
            <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span>Completed Learnings</span>
          </div>
        </Tooltip>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {reviewedCount}
          </span>
          <Tooltip content="All archived decisions completed rigorous hypothesis vs outcome variance audits">
            <span className="text-xs text-purple-700 dark:text-purple-300 font-semibold bg-purple-50 border border-purple-200/60 dark:bg-purple-950/60 px-2 py-0.5 rounded-md cursor-help">
              100% Audited
            </span>
          </Tooltip>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Compounding organizational memory
        </p>
      </div>
    </div>
  );
}
