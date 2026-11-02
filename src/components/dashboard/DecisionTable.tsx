import React, { useState, useEffect, useRef } from 'react';
import { Decision } from '../../types/decision';
import { Badge } from '../ui/Badge';
import { 
  formatCurrency, 
  formatDate, 
  isPastDate, 
  getDaysOverdue, 
  cn,
  getDepartmentAvatarStyle,
  getStakeholderAvatarStyle,
  getInitials
} from '../../lib/utils';
import { 
  Search, 
  SlidersHorizontal,
  ChevronDown,
  Check
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
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsStatusDropdownOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
  const reviewDueCount = decisions.filter(d => d.status === 'Review Due').length;
  const approvedCount = decisions.filter(d => d.status === 'Approved').length;
  const reviewedCount = decisions.filter(d => d.status === 'Reviewed').length;

  const showCapital = resourceView === 'capital' || resourceView === 'both';
  const showTime = resourceView === 'time' || resourceView === 'both';
  const colCount = 3 + (showCapital ? 1 : 0) + (showTime ? 1 : 0);

  // Status Filter Options accounting for 100% of decisions in the dataset
  const statusOptions = [
    { id: 'ALL', label: 'All Decisions', shortLabel: 'All', count: decisions.length, dotColor: 'bg-slate-400' },
    { id: 'OVERDUE', label: 'Overdue', shortLabel: 'Overdue', count: overdueCount, dotColor: 'bg-rose-500' },
    { id: 'In Progress', label: 'In Progress', shortLabel: 'In Progress', count: inProgressCount, dotColor: 'bg-blue-500' },
    { id: 'Review Due', label: 'Review Due', shortLabel: 'Review Due', count: reviewDueCount, dotColor: 'bg-amber-500' },
    { id: 'Approved', label: 'Approved', shortLabel: 'Approved', count: approvedCount, dotColor: 'bg-emerald-500' },
    { id: 'Reviewed', label: 'Reviewed', shortLabel: 'Reviewed', count: reviewedCount, dotColor: 'bg-purple-500' },
  ];

  const currentStatusOption = statusOptions.find(opt => opt.id === statusFilter) || statusOptions[0];

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

          {/* Right Section: Status Dropdown Menu + Filters Button */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {/* Consolidated "Status: All" Dropdown Menu */}
            <div className="relative inline-block text-left" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className={cn(
                  "h-8 inline-flex items-center gap-2 px-3 rounded-md border text-xs font-medium transition-colors whitespace-nowrap shadow-2xs select-none",
                  statusFilter !== 'ALL'
                    ? "bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-white border-slate-300 dark:border-neutral-700 font-semibold"
                    : "bg-white dark:bg-neutral-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-800 border-slate-200 dark:border-neutral-700"
                )}
              >
                <span className="text-slate-400 dark:text-slate-500 font-normal">Status:</span>
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                  {statusFilter !== 'ALL' && currentStatusOption.dotColor && (
                    <span className={cn("h-2 w-2 rounded-full shrink-0", currentStatusOption.dotColor)} />
                  )}
                  <span>{currentStatusOption.shortLabel} ({currentStatusOption.count})</span>
                </div>
                <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 transition-transform duration-150", isStatusDropdownOpen && "rotate-180")} />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-56 rounded-md border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-lg py-1 z-40">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider border-b border-slate-100 dark:border-neutral-800">
                    Filter by Lifecycle Status
                  </div>
                  <div className="py-1">
                    {statusOptions.map((opt) => {
                      const isSelected = statusFilter === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setStatusFilter(opt.id);
                            setIsStatusDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 text-xs transition-colors",
                            isSelected
                              ? "bg-slate-50 dark:bg-neutral-800/80 font-semibold text-slate-900 dark:text-white"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50/80 dark:hover:bg-neutral-800/50 font-normal"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full shrink-0", opt.dotColor)} />
                            <span>{opt.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[11px] tabular-nums px-1.5 py-0.2 rounded font-sans",
                              isSelected
                                ? "bg-slate-200/80 text-slate-800 dark:bg-neutral-700 dark:text-slate-200 font-semibold"
                                : "text-slate-400 dark:text-slate-500"
                            )}>
                              {opt.count}
                            </span>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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
              <tr className="border-b border-slate-200 dark:border-neutral-800 bg-slate-50/80 dark:bg-neutral-900/60">
                <th className="py-3 px-4 font-sans text-[11px] font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-100 w-[36%] text-left">
                  DECISION & HYPOTHESIS
                </th>
                <th className="py-3 px-4 font-sans text-[11px] font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-100 w-[18%] text-left">
                  OWNER & STAKEHOLDERS
                </th>
                {showCapital && (
                  <th className={cn(
                    "py-3 px-4 font-sans text-[11px] font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-100 text-left whitespace-nowrap",
                    resourceView === 'both' ? "w-[16%]" : "w-[24%]"
                  )}>
                    CAPITAL INVESTMENT
                  </th>
                )}
                {showTime && (
                  <th className={cn(
                    "py-3 px-4 font-sans text-[11px] font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-100 text-left whitespace-nowrap",
                    resourceView === 'both' ? "w-[16%]" : "w-[24%]"
                  )}>
                    TIME INVESTMENT
                  </th>
                )}
                <th className={cn(
                  "py-3 px-4 font-sans text-[11px] font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-100 text-right",
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
                        <div className="flex items-start gap-2.5">
                          {/* Main Owner Profile Avatar */}
                          <div className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white shrink-0 font-sans mt-0.5 shadow-2xs",
                            decision.owner.avatarColor && !decision.owner.avatarColor.includes('slate-200')
                              ? decision.owner.avatarColor
                              : getDepartmentAvatarStyle(decision.owner.role, decision.category)
                          )}>
                            {decision.owner.initials || getInitials(decision.owner.name)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-900 dark:text-white text-sm tracking-tight truncate font-sans">
                              {decision.owner.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate font-sans mt-0.5">
                              {decision.owner.role}
                            </div>

                            {/* Stakeholders mini-avatars cluster (16px / h-4 w-4) with consensus status dot */}
                            {decision.stakeholders && decision.stakeholders.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <div className="flex items-center -space-x-1">
                                  {decision.stakeholders.map((stk) => {
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
                                          <div className={cn(
                                            "flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white ring-1 ring-white dark:ring-[#171717] font-sans select-none shadow-2xs",
                                            getStakeholderAvatarStyle(stk)
                                          )}>
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
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans tabular-nums truncate">
                                  {decision.stakeholders.length} sign-offs
                                </span>
                              </div>
                            )}
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
                              <span className="line-through text-slate-400 dark:text-slate-500 text-xs tabular-nums">
                                {formatCurrency(decision.originalEstimates.capitalAtRisk)} (Orig)
                              </span>
                              {/* Actual or Amended Value */}
                              <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="font-semibold text-slate-900 dark:text-white text-sm tabular-nums">
                                  {formatCurrency(decision.actuals.actualCapital)}
                                </span>
                                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                                  ({decision.version?.toLowerCase().includes('amended') && !isOverdue ? 'Amended' : 'Actual'})
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                                {decision.actuals.actualPaybackMonths}mo payback
                              </div>
                            </div>
                          ) : (
                            <div className="font-sans">
                              <div className="font-semibold text-slate-900 dark:text-white text-sm tabular-nums">
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
                              <span className="line-through text-slate-400 dark:text-slate-500 text-xs tabular-nums">
                                {decision.originalEstimates.expectedPaybackMonths}mo Horizon (Orig)
                              </span>
                              {/* Actual Time with Tag */}
                              <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="font-semibold text-slate-900 dark:text-white text-sm tabular-nums">
                                  {decision.actuals.actualPaybackMonths}mo Horizon
                                </span>
                                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                                  (Actual)
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums truncate">
                                Target: {formatDate(decision.targetReviewDate)}
                              </div>
                            </div>
                          ) : (
                            <div className="font-sans">
                              <div className="font-semibold text-slate-900 dark:text-white text-sm tabular-nums">
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
