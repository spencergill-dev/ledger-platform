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
    <div className="w-full rounded-md border border-subtle bg-surface overflow-hidden shadow-2xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border-subtle">
        {/* Total Capital at Risk */}
        <div className="p-4 sm:p-5 transition-colors">
          <Tooltip content="Total capital at risk deployed across active strategic commitments">
            <div className="flex items-center gap-1.5 text-content-secondary text-xs font-medium">
              <DollarSign className="h-4 w-4 text-content-muted" />
              <span>Capital Committed</span>
            </div>
          </Tooltip>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-content-primary font-cal">
              {formatCurrency(totalCapital)}
            </span>
          </div>
          <p className="mt-1 text-xs text-content-muted font-sans">
            Across {decisions.length} strategic decisions
          </p>
        </div>

        {/* Overdue Retrospectives Card */}
        <div className="p-4 sm:p-5 transition-colors">
          <Tooltip content="Maximum days elapsed beyond the mandatory 6-month retrospective deadline">
            <div className="flex items-center gap-1.5 text-content-secondary text-xs font-medium">
              <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>Overdue Retrospectives</span>
            </div>
          </Tooltip>
          <div className="mt-2 flex items-baseline gap-2">
            <Tooltip content={`${overdueCount} decisions breached their review date by up to ${maxDaysOverdue} days`}>
              <span className="text-2xl font-bold text-status-overdue-text font-cal">
                {overdueCount > 0 ? `+${maxDaysOverdue}d` : '0d'}
              </span>
            </Tooltip>
            {overdueCount > 0 && (
              <Tooltip content="Sponsor retrospective review overdue; executive action required">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-status-overdue-text bg-status-overdue-bg border border-status-overdue-border px-1.5 py-0.5 rounded font-sans">
                  <AlertTriangle className="h-3 w-3 text-status-overdue-dot shrink-0" />
                  Action Required
                </span>
              </Tooltip>
            )}
          </div>
          <p className="mt-1 text-xs text-content-muted font-sans">
            {overdueCount > 0 
              ? `${overdueCount} decisions past 6-month review deadline` 
              : "All decision reviews in good standing"}
          </p>
        </div>

        {/* Active Strategic Bets */}
        <div className="p-4 sm:p-5 transition-colors">
          <Tooltip content="Decisions currently in execution phase awaiting retrospective review">
            <div className="flex items-center gap-1.5 text-content-secondary text-xs font-medium">
              <Layers className="h-4 w-4 text-blue-500 dark:text-blue-400 shrink-0" />
              <span>Active Decisions</span>
            </div>
          </Tooltip>
          <div className="mt-2 flex items-baseline gap-[0.4rem]">
            <span className="text-2xl font-bold text-content-primary font-cal">
              {activeBets}
            </span>
            <span className="text-2xl font-bold text-content-primary font-cal">in progress</span>
          </div>
          <p className="mt-1 text-xs text-content-muted font-sans">
            Approved commitments currently underway
          </p>
        </div>

        {/* Completed Retrospectives */}
        <div className="p-4 sm:p-5 transition-colors">
          <Tooltip content="Decisions that have completed full retrospective analysis and archived their learnings">
            <div className="flex items-center gap-1.5 text-content-secondary text-xs font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span>Reviewed Decisions</span>
            </div>
          </Tooltip>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-content-primary font-cal">
              {reviewedCount}
            </span>
            <Tooltip content="All archived decisions completed rigorous hypothesis vs outcome variance audits">
              <span className="text-[11px] text-status-reviewed-text font-semibold bg-status-reviewed-bg border border-status-reviewed-border px-1.5 py-0.5 rounded font-sans">
                100% Audited
              </span>
            </Tooltip>
          </div>
          <p className="mt-1 text-xs text-content-muted font-sans">
            Outcomes audited & lessons archived
          </p>
        </div>
      </div>
    </div>
  );
}
