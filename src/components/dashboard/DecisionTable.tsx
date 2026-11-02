import React, { useState } from 'react';
import { Decision } from '../../types/decision';
import { Badge } from '../ui/Badge';
import { 
  formatCurrency, 
  formatDate, 
  isPastDate, 
  getDaysOverdue, 
  cn 
} from '../../lib/utils';
import { 
  Search, 
  SlidersHorizontal 
} from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { AdvancedFilterDrawer } from '../drawer/AdvancedFilterDrawer';

interface DecisionTableProps {
  decisions: Decision[];
  onSelectDecision?: (decision: Decision) => void;
  selectedDecisionId?: string | null;
}

export function DecisionTable({ 
  decisions, 
  onSelectDecision, 
  selectedDecisionId 
}: DecisionTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [capitalFilter, setCapitalFilter] = useState<string>('ALL');
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [resourceView, setResourceView] = useState<'both' | 'capital' | 'time'>('both');

  const resetAllFilters = () => {
    setStatusFilter('ALL');
    setDepartmentFilter('ALL');
    setCategoryFilter('ALL');
    setCapitalFilter('ALL');
    setSearchQuery('');
  };

  const activeAdvancedCount = 
    (departmentFilter !== 'ALL' ? 1 : 0) +
    (categoryFilter !== 'ALL' ? 1 : 0) +
    (capitalFilter !== 'ALL' ? 1 : 0);

  const filteredDecisions = decisions.filter(decision => {
    const matchesSearch = 
      decision.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      decision.owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      decision.hypothesis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      decision.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      decision.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (decision.version && decision.version.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'OVERDUE' ? (decision.status === 'Review Due' && isPastDate(decision.targetReviewDate)) :
      decision.status === statusFilter;

    const matchesDepartment = () => {
      if (departmentFilter === 'ALL') return true;
      const r = decision.owner.role.toLowerCase();
      const c = decision.category.toLowerCase();
      if (departmentFilter === 'engineering') {
        return r.includes('infrastructure') || r.includes('engineer') || r.includes('devops') || c.includes('infrastructure');
      }
      if (departmentFilter === 'product') {
        return r.includes('product') || r.includes('architect') || c.includes('product');
      }
      if (departmentFilter === 'leadership') {
        return !(r.includes('infrastructure') || r.includes('engineer') || r.includes('devops') || c.includes('infrastructure') || r.includes('product') || r.includes('architect') || c.includes('product'));
      }
      return true;
    };

    const matchesCategory = categoryFilter === 'ALL' || decision.category === categoryFilter;

    const matchesCapital = () => {
      if (capitalFilter === 'ALL') return true;
      const val = decision.originalEstimates.capitalAtRisk;
      if (capitalFilter === '<250k') return val < 250000;
      if (capitalFilter === '250k-500k') return val >= 250000 && val <= 500000;
      if (capitalFilter === '500k+') return val > 500000;
      return true;
    };

    return matchesSearch && matchesStatus && matchesDepartment() && matchesCategory && matchesCapital();
  });

  const overdueCount = decisions.filter(
    d => d.status === 'Review Due' && isPastDate(d.targetReviewDate)
  ).length;
  const inProgressCount = decisions.filter(d => d.status === 'In Progress').length;

  const showCapital = resourceView === 'capital' || resourceView === 'both';
  const showTime = resourceView === 'time' || resourceView === 'both';
  const colCount = 3 + (showCapital ? 1 : 0) + (showTime ? 1 : 0);

  // Quick tabs matching target design: All (6), Overdue (2), In Progress (1) + active selection
  const quickTabs = [
    { id: 'ALL', label: `All (${decisions.length})` },
    { id: 'OVERDUE', label: `Overdue (${overdueCount})` },
    { id: 'In Progress', label: `In Progress (${inProgressCount})` },
    ...(statusFilter !== 'ALL' && statusFilter !== 'OVERDUE' && statusFilter !== 'In Progress' 
      ? [{ id: statusFilter, label: `${statusFilter} (${decisions.filter(d => d.status === statusFilter).length})` }] 
      : [])
  ];

  return (
    <div className="w-full">
      {/* Unified Block: Merged Toolbar & Table into a single continuous container */}
      <div className="w-full rounded-md border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#171717] overflow-hidden transition-colors shadow-2xs">
        
        {/* Flush Top Search & Filter Toolbar */}
        <div className="p-3 sm:p-3.5 border-b border-slate-200 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto bg-white dark:bg-[#171717]">
          {/* Search Input */}
          <div className="relative flex items-center shrink-0 w-44 sm:w-56 md:w-64">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search decisions, owners, hypc"
              className="w-full h-8 pl-8 pr-2.5 rounded-md border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors font-sans"
            />
          </div>

          {/* Segmented Control Toggle: [ View: Capital Time Both ] */}
          <div className="h-8 inline-flex items-center gap-1 px-2 rounded-md bg-slate-100/70 dark:bg-neutral-800/60 border border-slate-200/60 dark:border-neutral-700/60 text-xs shrink-0 select-none">
            <span className="text-slate-400 dark:text-slate-400 font-mono text-[11px] mr-1">
              View:
            </span>
            <button
              type="button"
              onClick={() => setResourceView('capital')}
              className={cn(
                "px-2 py-0.5 rounded text-xs transition-colors font-medium",
                resourceView === 'capital'
                  ? "bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-2xs border border-slate-200/80 dark:border-neutral-700 font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              Capital
            </button>
            <button
              type="button"
              onClick={() => setResourceView('time')}
              className={cn(
                "px-2 py-0.5 rounded text-xs transition-colors font-medium",
                resourceView === 'time'
                  ? "bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-2xs border border-slate-200/80 dark:border-neutral-700 font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              Time
            </button>
            <button
              type="button"
              onClick={() => setResourceView('both')}
              className={cn(
                "px-2.5 py-0.5 rounded text-xs transition-colors font-medium",
                resourceView === 'both'
                  ? "bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-2xs border border-slate-200/80 dark:border-neutral-700 font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              Both
            </button>
          </div>

          {/* Right Section: Segmented Filter Tabs + Filters Button */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {/* Segmented Filter Control */}
            <div className="h-8 inline-flex items-center p-0.5 rounded-md bg-slate-100/70 dark:bg-neutral-800/60 border border-slate-200/60 dark:border-neutral-700/60 gap-0.5">
              {quickTabs.map(tab => {
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-md transition-all whitespace-nowrap",
                      isActive
                        ? "bg-white dark:bg-neutral-900 text-slate-800 dark:text-slate-100 shadow-2xs border border-slate-200/80 dark:border-neutral-700 font-semibold"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Advanced Filters Button */}
            <button
              type="button"
              onClick={() => setIsAdvancedFilterOpen(true)}
              className={cn(
                "h-8 inline-flex items-center gap-1.5 px-3 rounded-md border text-xs font-medium transition-colors whitespace-nowrap shrink-0 shadow-2xs",
                activeAdvancedCount > 0
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 font-semibold"
                  : "bg-white dark:bg-neutral-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-800 border-slate-200 dark:border-neutral-700"
              )}
            >
              <SlidersHorizontal className={cn("h-3.5 w-3.5", activeAdvancedCount > 0 ? "text-blue-600" : "text-slate-500")} />
              <span>Filters</span>
              {activeAdvancedCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white dark:bg-white dark:text-slate-900">
                  {activeAdvancedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Flush Table: Fluid width with edge-to-edge layout */}
        <div className="w-full overflow-x-hidden">
          <table className="w-full text-left text-xs border-collapse table-fixed">
            <thead>
              <tr className="border-b border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#171717]">
                <th className="py-3 px-4 font-mono text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-neutral-500 w-[36%] text-left">
                  DECISION & HYPOTHESIS
                </th>
                <th className="py-3 px-4 font-mono text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-neutral-500 w-[18%] text-left">
                  OWNER & STAKEHOLDERS
                </th>
                {showCapital && (
                  <th className={cn(
                    "py-3 px-4 font-mono text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-neutral-500 text-left whitespace-nowrap",
                    resourceView === 'both' ? "w-[16%]" : "w-[24%]"
                  )}>
                    CAPITAL INVESTMENT
                  </th>
                )}
                {showTime && (
                  <th className={cn(
                    "py-3 px-4 font-mono text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-neutral-500 text-left whitespace-nowrap",
                    resourceView === 'both' ? "w-[16%]" : "w-[24%]"
                  )}>
                    TIME INVESTMENT
                  </th>
                )}
                <th className={cn(
                  "py-3 px-4 font-mono text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-neutral-500 text-right",
                  resourceView === 'both' ? "w-[14%]" : "w-[22%]"
                )}>
                  STATUS
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/80">
              {filteredDecisions.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <p className="text-sm font-medium tracking-tight font-sans">No decisions match the selected filter.</p>
                    <button
                      onClick={resetAllFilters}
                      className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredDecisions.map((decision) => {
                  const isOverdue = decision.status === 'Review Due' && isPastDate(decision.targetReviewDate);
                  const daysOverdue = isOverdue ? getDaysOverdue(decision.targetReviewDate) : 0;
                  const isSelected = selectedDecisionId === decision.id;
                  const hasDrift = (decision.status === 'Reviewed' || decision.status === 'Review Due' || decision.version?.toLowerCase().includes('amended')) && decision.actuals;

                  return (
                    <tr
                      key={decision.id}
                      onClick={() => {
                        onSelectDecision?.(decision);
                      }}
                      className={cn(
                        "group cursor-pointer transition-colors border-b border-slate-100 dark:border-neutral-800/80 last:border-b-0",
                        isSelected
                          ? "bg-blue-50/50 dark:bg-blue-950/20"
                          : "bg-white dark:bg-[#171717] hover:bg-slate-50/70 dark:hover:bg-white/[0.02]"
                      )}
                    >
                      {/* Column 1: Title, Hypothesis & Versioning Badges */}
                      <td className={cn(
                        "py-3.5 px-4 w-[36%] align-middle border-l-4 transition-all",
                        isSelected ? "border-l-4 border-blue-600" : "border-l-4 border-l-transparent"
                      )}>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono font-medium tracking-normal text-slate-400 dark:text-slate-500 text-xs tabular-nums">
                            {decision.id}
                          </span>
                          
                          {/* Versioning Badge */}
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-500 dark:text-slate-400 font-mono text-[10px] font-medium uppercase tracking-wide">
                            {(decision.version || 'v1.0 Frozen').toUpperCase()}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-white text-sm tracking-tight mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 font-sans">
                          {decision.title}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-1 mt-0.5 font-normal leading-normal font-sans">
                          {decision.hypothesis}
                        </p>
                      </td>

                      {/* Column 2: Owner & Stakeholders */}
                      <td className="py-3.5 px-4 w-[18%] align-middle">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white text-sm tracking-tight truncate font-sans">
                            {decision.owner.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate font-sans mt-0.5">
                            {decision.owner.role}
                          </div>

                          {/* Stakeholders mini-avatars cluster (16px / h-4 w-4) with consensus status dot */}
                          <div className="flex items-center -space-x-1 mt-1.5">
                            {decision.stakeholders?.map((stk) => {
                              const dotColor = 
                                stk.stance === 'dissent' ? 'bg-red-500' :
                                stk.stance === 'conditions' ? 'bg-amber-400' :
                                '';

                              return (
                                <Tooltip 
                                  key={stk.id} 
                                  content={`${stk.name} (${stk.role}) • ${stk.stance.toUpperCase()}: "${stk.rationale}"`}
                                >
                                  <div className="relative inline-block">
                                    <div className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-slate-300 ring-1 ring-white dark:ring-[#171717] font-mono select-none">
                                      {stk.initials}
                                    </div>
                                    {dotColor && (
                                      <span className={cn(
                                        "absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ring-1 ring-white dark:ring-[#171717]",
                                        dotColor
                                      )} />
                                    )}
                                  </div>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Capital Investment */}
                      {showCapital && (
                        <td className={cn(
                          "py-3.5 px-4 text-left whitespace-nowrap align-middle",
                          resourceView === 'both' ? "w-[16%]" : "w-[24%]"
                        )}>
                          {hasDrift && decision.actuals ? (
                            <div className="flex flex-col text-left font-sans">
                              {/* Strikethrough Original Baseline */}
                              <span className="line-through text-slate-400 dark:text-slate-500 text-xs tabular-nums font-mono">
                                {formatCurrency(decision.originalEstimates.capitalAtRisk)} (Orig)
                              </span>
                              {/* Actual or Amended Value */}
                              <div className="flex items-baseline gap-1 mt-0.5">
                                <span className={cn(
                                  "font-bold text-sm tabular-nums font-mono",
                                  decision.actuals.capitalVariancePercent > 10 
                                    ? "text-red-600 dark:text-red-400" 
                                    : "text-slate-900 dark:text-white"
                                )}>
                                  {formatCurrency(decision.actuals.actualCapital)}
                                </span>
                                <span className={cn(
                                  "text-[10px] font-semibold font-sans tracking-wider uppercase",
                                  decision.actuals.capitalVariancePercent > 10 
                                    ? "text-red-500 dark:text-red-400" 
                                    : "text-slate-400 dark:text-slate-500"
                                )}>
                                  ({decision.version?.toLowerCase().includes('amended') && !isOverdue ? 'AMENDED' : 'ACTUAL'})
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                                {decision.actuals.actualPaybackMonths}mo payback
                              </div>
                            </div>
                          ) : (
                            <div className="font-sans">
                              <div className="font-bold text-slate-900 dark:text-white text-sm tabular-nums font-mono">
                                {formatCurrency(decision.originalEstimates.capitalAtRisk)}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                                {decision.originalEstimates.expectedPaybackMonths}mo payback
                              </div>
                            </div>
                          )}
                        </td>
                      )}

                      {/* Column 4: Time Investment */}
                      {showTime && (
                        <td className={cn(
                          "py-3.5 px-4 text-left whitespace-nowrap align-middle",
                          resourceView === 'both' ? "w-[16%]" : "w-[24%]"
                        )}>
                          {hasDrift && decision.actuals && isOverdue ? (
                            <div className="flex flex-col text-left font-sans">
                              {/* Strikethrough Original Horizon */}
                              <span className="line-through text-slate-400 dark:text-slate-500 text-xs tabular-nums font-mono">
                                {decision.originalEstimates.expectedPaybackMonths}mo Horizon (Orig)
                              </span>
                              {/* Actual Time with Tag */}
                              <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="font-bold text-red-600 dark:text-red-400 text-sm tabular-nums font-mono">
                                  {decision.actuals.actualPaybackMonths}mo Horizon
                                </span>
                                <span className="text-[10px] font-semibold text-red-500 dark:text-red-400 font-sans tracking-wider uppercase">
                                  (ACTUAL)
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums truncate">
                                Target: {formatDate(decision.targetReviewDate)}
                              </div>
                            </div>
                          ) : (
                            <div className="font-sans">
                              <div className="font-bold text-slate-900 dark:text-white text-sm tabular-nums font-mono">
                                {decision.originalEstimates.expectedPaybackMonths}mo Horizon
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums truncate">
                                Target: {formatDate(decision.targetReviewDate)}
                              </div>
                            </div>
                          )}
                        </td>
                      )}

                      {/* Column 5: Status (Right-Aligned with matching pill styles) */}
                      <td className={cn(
                        "py-3.5 px-4 text-right whitespace-nowrap align-middle",
                        resourceView === 'both' ? "w-[14%]" : "w-[22%]"
                      )}>
                        <div className="flex flex-col items-end gap-1.5">
                          <Badge status={decision.status}>
                            {decision.status}
                          </Badge>
                          {isOverdue && (
                            <Tooltip content={`Breached 6-month retrospective SLA by ${daysOverdue} days`}>
                              <span className="inline-flex items-center justify-center w-[104px] h-6 px-2.5 py-0.5 rounded-md text-xs font-medium tabular-nums bg-rose-50 text-rose-600 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60 shrink-0 font-sans shadow-2xs">
                                +{daysOverdue}d Delay
                              </span>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      <AdvancedFilterDrawer
        isOpen={isAdvancedFilterOpen}
        onClose={() => setIsAdvancedFilterOpen(false)}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        capitalFilter={capitalFilter}
        setCapitalFilter={setCapitalFilter}
        onResetAll={resetAllFilters}
        matchCount={filteredDecisions.length}
        totalCount={decisions.length}
      />
    </div>
  );
}
