import React, { useState } from 'react';
import { Decision } from '../../types/decision';
import { Badge } from '../ui/Badge';
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
  Search, 
  Clock, 
  AlertTriangle,
  ShieldCheck,
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

  const showCapital = resourceView === 'capital' || resourceView === 'both';
  const showTime = resourceView === 'time' || resourceView === 'both';
  const colCount = 4 + (showCapital ? 1 : 0) + (showTime ? 1 : 0);

  return (
    <div className="w-full">
      {/* Unified Block: Merged Toolbar & Table into a single continuous container */}
      <div className="w-full rounded-md border border-slate-300 dark:border-neutral-800 bg-white dark:bg-[#171717] overflow-hidden transition-colors">
        
        {/* Flush Top Search & Filter Toolbar */}
        <div className="p-3 sm:p-3.5 border-b border-slate-200 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto bg-white dark:bg-[#171717]">
          {/* Search Input */}
          <div className="relative flex items-center shrink-0 w-32 sm:w-40 md:w-48">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search decisions..."
              className="w-full h-8 sm:h-9 pl-8 pr-2.5 rounded-md border border-slate-300 dark:border-neutral-700 bg-slate-50/70 dark:bg-neutral-800/50 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-card focus:border-slate-400 focus:ring-0 transition-all font-sans"
            />
          </div>

          {/* Segmented Control Toggle: [ View: Capital Time Both ] */}
          <div className="h-8 sm:h-9 inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 rounded-md bg-slate-100 dark:bg-neutral-800/80 text-xs text-slate-700 dark:text-slate-300 shrink-0 select-none border border-slate-200 dark:border-neutral-700">
            <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px] sm:text-xs">
              View:
            </span>
            <Tooltip content="Show Capital Investment and payback period">
              <button
                type="button"
                onClick={() => setResourceView('capital')}
                className={cn(
                  "px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs transition-all font-medium",
                  resourceView === 'capital'
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Capital
              </button>
            </Tooltip>
            <Tooltip content="Show Time Investment horizon and review targets">
              <button
                type="button"
                onClick={() => setResourceView('time')}
                className={cn(
                  "px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs transition-all font-medium",
                  resourceView === 'time'
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Time
              </button>
            </Tooltip>
            <Tooltip content="Show both Capital and Time investment metrics">
              <button
                type="button"
                onClick={() => setResourceView('both')}
                className={cn(
                  "px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs transition-all font-medium",
                  resourceView === 'both'
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Both
              </button>
            </Tooltip>
          </div>

          {/* Filter Pills with natural width */}
          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { id: 'ALL', label: 'All Decisions', tooltip: `Show all recorded strategic decisions (${decisions.length})` },
              { id: 'OVERDUE', label: 'Overdue', tooltip: `Filter to decisions that have breached their 6-month retrospective SLA (${overdueCount})` },
              { id: 'In Progress', label: 'In Progress', tooltip: `Filter to decisions currently in execution (${decisions.filter(d => d.status === 'In Progress').length})` },
              { id: 'Approved', label: 'Approved', tooltip: `Filter to approved decisions ready for execution (${decisions.filter(d => d.status === 'Approved').length})` },
              { id: 'Review Due', label: 'Review Due', tooltip: `Filter to decisions at their retrospective milestone (${decisions.filter(d => d.status === 'Review Due').length})` },
              { id: 'Reviewed', label: 'Reviewed', tooltip: `Filter to decisions with audited retrospective learnings (${decisions.filter(d => d.status === 'Reviewed').length})` },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <Tooltip key={tab.id} content={tab.tooltip}>
                  <button
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={cn(
                      "h-8 sm:h-9 inline-flex items-center justify-center px-2.5 sm:px-3 rounded-md text-xs font-medium transition-all whitespace-nowrap",
                      isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-transparent font-semibold"
                        : "bg-white dark:bg-[#171717] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03] border border-slate-300 dark:border-neutral-700"
                    )}
                  >
                    {tab.label}
                  </button>
                </Tooltip>
              );
            })}
          </div>

          {/* Advanced Filters Button */}
          <div className="ml-auto flex items-center shrink-0">
            <Tooltip content="Open advanced filters (Department, Category, Capital)">
              <button
                type="button"
                onClick={() => setIsAdvancedFilterOpen(true)}
                className={cn(
                  "h-8 sm:h-9 inline-flex items-center gap-1.5 px-3 rounded-md text-xs font-medium transition-all whitespace-nowrap shrink-0 border",
                  activeAdvancedCount > 0
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 font-semibold"
                    : "bg-white dark:bg-[#171717] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 border-slate-300 dark:border-neutral-700"
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
            </Tooltip>
          </div>
        </div>

        {/* Flush Table: Fluid width with edge-to-edge layout */}
        <div className="w-full overflow-x-hidden">
          <table className="w-full text-left text-xs border-collapse table-fixed">
            <thead>
              <tr className="border-b border-slate-200 dark:border-neutral-800 bg-slate-50/75 dark:bg-neutral-900/50">
                <th className="py-2.5 px-4 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-[33%] text-left">
                  <Tooltip content="Locked hypothesis and expected payoffs for each strategic initiative">
                    <span className="cursor-help">DECISION & HYPOTHESIS</span>
                  </Tooltip>
                </th>
                <th className="py-2.5 px-4 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-[16%] text-left">
                  <Tooltip content="Primary sponsor and authenticated governance stakeholders">
                    <span className="cursor-help">OWNER & STAKEHOLDERS</span>
                  </Tooltip>
                </th>
                {showCapital && (
                  <th className={cn(
                    "py-2.5 px-4 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-left whitespace-nowrap",
                    resourceView === 'both' ? "w-[13%]" : "w-[18%]"
                  )}>
                    <Tooltip content="Committed financial capital at risk vs realized actuals drift">
                      <span className="cursor-help">CAPITAL INVESTMENT</span>
                    </Tooltip>
                  </th>
                )}
                {showTime && (
                  <th className={cn(
                    "py-2.5 px-4 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-left whitespace-nowrap",
                    resourceView === 'both' ? "w-[14%]" : "w-[19%]"
                  )}>
                    <Tooltip content="Execution horizon vs realized actual milestone drift">
                      <span className="cursor-help">TIME INVESTMENT</span>
                    </Tooltip>
                  </th>
                )}
                <th className={cn(
                  "py-2.5 px-4 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-left",
                  resourceView === 'both' ? "w-[11%]" : "w-[15%]"
                )}>
                  <Tooltip content="Current lifecycle state of the decision commitment">
                    <span className="cursor-help">STATUS</span>
                  </Tooltip>
                </th>
                <th className="py-2.5 px-4 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-left w-[13%]">
                  <Tooltip content="Verification status of the mandatory 6-month retrospective cadence">
                    <span className="cursor-help">STATUS DETAIL</span>
                  </Tooltip>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-neutral-800/80">
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
                  const daysElapsed = getDaysElapsed(decision.createdAt);
                  const isSelected = selectedDecisionId === decision.id;
                  const hasDrift = (decision.status === 'Reviewed' || decision.status === 'Review Due') && decision.actuals;

                  return (
                    <tr
                      key={decision.id}
                      onClick={() => {
                        onSelectDecision?.(decision);
                      }}
                      className={cn(
                        "group cursor-pointer transition-colors border-b border-slate-200 dark:border-neutral-800/80 last:border-b-0",
                        isSelected
                          ? "bg-blue-50/70 dark:bg-blue-950/30"
                          : "bg-white dark:bg-[#171717] hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
                      )}
                    >
                      {/* Column 1: Title, Hypothesis & Versioning Badges */}
                      <td className={cn(
                        "py-3.5 px-4 w-[33%] align-middle border-l-4 transition-all",
                        isSelected ? "border-l-4 border-blue-600" : "border-l-4 border-l-transparent"
                      )}>
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <span className="font-mono font-medium tracking-wider text-slate-500 dark:text-slate-400 text-[11px] tabular-nums">
                            {decision.id}
                          </span>
                          
                          {/* Versioning Badge */}
                          <span className={cn(
                            "inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-medium tracking-normal",
                            decision.version?.includes('Frozen')
                              ? "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-slate-300 border border-slate-200 dark:border-neutral-700"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40"
                          )}>
                            {decision.version || 'v1.0 Frozen'}
                          </span>

                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 font-sans">
                            {decision.category}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 font-sans">
                          {decision.title}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-1 mt-0.5 font-normal leading-normal font-sans">
                          {decision.hypothesis}
                        </p>
                      </td>

                      {/* Column 2: Owner & Stakeholders (Overlapping cluster with consensus dot) */}
                      <td className="py-3.5 px-4 w-[16%] align-middle">
                        <div className="space-y-1.5">
                          {/* Primary Owner */}
                          <div className="flex items-center gap-2">
                            <Tooltip content={`Primary Sponsor: ${decision.owner.name} • ${decision.owner.role}`}>
                              <div className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0 cursor-help",
                                getDepartmentAvatarStyle(decision.owner.role, decision.category)
                              )}>
                                {decision.owner.initials || getInitials(decision.owner.name)}
                              </div>
                            </Tooltip>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-slate-900 dark:text-white text-xs tracking-tight truncate font-sans">
                                {decision.owner.name}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-sans">
                                {decision.owner.role}
                              </div>
                            </div>
                          </div>

                          {/* Stakeholders mini-avatars cluster (16px / h-4 w-4) with consensus status dot */}
                          <div className="flex items-center -space-x-1 pl-1">
                            {decision.stakeholders?.slice(0, 3).map((stk) => {
                              const dotColor = 
                                stk.stance === 'dissent' ? 'bg-red-500' :
                                stk.stance === 'conditions' ? 'bg-amber-500' :
                                'bg-emerald-500';

                              return (
                                <Tooltip 
                                  key={stk.id} 
                                  content={`${stk.name} (${stk.role}) • ${stk.stance.toUpperCase()}: "${stk.rationale}"`}
                                >
                                  <div className="relative inline-block cursor-help">
                                    <div className={cn(
                                      "flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white ring-1 ring-white dark:ring-[#171717] select-none",
                                      stk.avatarColor || getDepartmentAvatarStyle(stk.role, 'Infrastructure')
                                    )}>
                                      {stk.initials}
                                    </div>
                                    {/* Indicator dot */}
                                    <span className={cn(
                                      "absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ring-1 ring-white dark:ring-[#171717]",
                                      dotColor
                                    )} />
                                  </div>
                                </Tooltip>
                              );
                            })}
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono pl-2">
                              {decision.stakeholders?.length || 3} sign-offs
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Capital Investment (Expected vs Actual Drift) */}
                      {showCapital && (
                        <td className={cn(
                          "py-3.5 px-4 text-left whitespace-nowrap align-middle",
                          resourceView === 'both' ? "w-[13%]" : "w-[18%]"
                        )}>
                          {hasDrift && decision.actuals ? (
                            <div className="flex flex-col text-left font-sans">
                              {/* Strikethrough Original Baseline */}
                              <span className="line-through text-slate-400 dark:text-slate-500 text-[11px] tabular-nums font-mono">
                                {formatCurrency(decision.originalEstimates.capitalAtRisk)} (Orig)
                              </span>
                              {/* Bold Actual with Drift Delta */}
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-semibold text-slate-900 dark:text-white text-xs tabular-nums font-mono">
                                  {formatCurrency(decision.actuals.actualCapital)} (Actual)
                                </span>
                                <span className={cn(
                                  "text-[10px] font-mono font-medium px-1 py-0.2 rounded",
                                  decision.actuals.capitalVariancePercent > 0 
                                    ? "text-red-700 bg-red-50 dark:bg-red-950/60 dark:text-red-300" 
                                    : "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300"
                                )}>
                                  {decision.actuals.capitalVariancePercent > 0 
                                    ? `+${decision.actuals.capitalVariancePercent}%` 
                                    : `${decision.actuals.capitalVariancePercent}%`}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="font-sans">
                              <div className="font-semibold text-slate-900 dark:text-white text-xs tabular-nums tracking-tight font-mono">
                                {formatCurrency(decision.originalEstimates.capitalAtRisk)} /
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5 tabular-nums">
                                {decision.originalEstimates.expectedPaybackMonths}mo payback
                              </div>
                            </div>
                          )}
                        </td>
                      )}

                      {/* Column 4: Time Investment (Expected vs Actual Drift) */}
                      {showTime && (
                        <td className={cn(
                          "py-3.5 px-4 text-left whitespace-nowrap align-middle",
                          resourceView === 'both' ? "w-[14%]" : "w-[19%]"
                        )}>
                          {hasDrift && decision.actuals ? (
                            <div className="flex flex-col text-left font-sans">
                              {/* Strikethrough Original Horizon */}
                              <span className="line-through text-slate-400 dark:text-slate-500 text-[11px] tabular-nums font-mono">
                                {decision.originalEstimates.expectedPaybackMonths}mo Horizon (Orig)
                              </span>
                              {/* Bold Actual Time with Delay Tag */}
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-semibold text-slate-900 dark:text-white text-xs tabular-nums font-mono">
                                  {decision.actuals.actualPaybackMonths}mo (Actual)
                                </span>
                                {decision.actuals.timeVarianceMonths !== 0 && (
                                  <span className={cn(
                                    "text-[10px] font-mono font-medium px-1 py-0.2 rounded",
                                    decision.actuals.timeVarianceMonths > 0 
                                      ? "text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300" 
                                      : "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  )}>
                                    {decision.actuals.timeVarianceMonths > 0 
                                      ? `+${decision.actuals.timeVarianceMonths}mo` 
                                      : `${decision.actuals.timeVarianceMonths}mo`}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="font-sans">
                              <div className="font-semibold text-slate-900 dark:text-white text-xs tabular-nums flex items-center gap-1 tracking-tight font-mono">
                                <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                <span>{decision.originalEstimates.expectedPaybackMonths}mo Horizon /</span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5 tabular-nums truncate">
                                Target: {formatDate(decision.targetReviewDate)}
                              </div>
                            </div>
                          )}
                        </td>
                      )}

                      {/* Column 5: Status */}
                      <td className={cn(
                        "py-3.5 px-4 text-left whitespace-nowrap align-middle",
                        resourceView === 'both' ? "w-[11%]" : "w-[15%]"
                      )}>
                        <div className="flex flex-col items-start gap-1">
                          <Badge status={decision.status}>
                            {decision.status}
                          </Badge>
                          {isOverdue && (
                            <Tooltip content={`Breached 6-month retrospective SLA by ${daysOverdue} days`}>
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-mono font-medium tabular-nums bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 shrink-0 cursor-help">
                                +{daysOverdue}d Delay
                              </span>
                            </Tooltip>
                          )}
                        </div>
                      </td>

                      {/* Column 6: Status Detail */}
                      <td className="py-3.5 px-4 text-left whitespace-nowrap align-middle w-[13%]">
                        {isOverdue ? (
                          <Tooltip content="Automated 6-month SLA breached. Executive retrospective audit required.">
                            <span className="inline-flex items-center justify-center gap-1.5 w-[124px] h-6 px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60 shrink-0 cursor-help font-sans">
                              <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" strokeWidth={1.8} />
                              <span>Retro Overdue</span>
                            </span>
                          </Tooltip>
                        ) : decision.status === 'Reviewed' ? (
                          <Tooltip content="Hypothesis variance audited and permanent institutional learning logged">
                            <span className="inline-flex items-center justify-center gap-1.5 w-[124px] h-6 px-2.5 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60 shrink-0 cursor-help font-sans">
                              <ShieldCheck className="h-3.5 w-3.5 text-purple-600 shrink-0" strokeWidth={1.8} />
                              <span>Retro Logged</span>
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip content={`Decision active for ${daysElapsed} days within standard 6-month evaluation window`}>
                            <div className="text-xs cursor-help font-sans">
                              <div className="font-medium text-slate-800 dark:text-slate-200">SLA Healthy</div>
                              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 tabular-nums">({daysElapsed}d in)</div>
                            </div>
                          </Tooltip>
                        )}
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
