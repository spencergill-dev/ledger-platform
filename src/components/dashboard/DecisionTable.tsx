import React, { useState } from 'react';
import { Decision } from '../../types/decision';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate, isPastDate, getDaysOverdue, getDaysElapsed, cn, getDepartmentAvatarStyle, getInitials } from '../../lib/utils';
import { 
  ChevronRight, 
  Search, 
  Calendar, 
  Clock, 
  GitFork, 
  CheckCircle2, 
  Lock, 
  FileText, 
  AlertTriangle,
  ShieldCheck,
  SlidersHorizontal 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(prev => (prev === id ? null : id));
  };

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
      decision.id.toLowerCase().includes(searchQuery.toLowerCase());

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
    <div className="space-y-3.5">
      {/* Search, Resource Toggle & Filter Bar Container */}
      <div className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#171717] p-2 sm:p-2.5 shadow-sm flex items-center gap-2 overflow-x-auto">
        {/* Search Input */}
        <div className="relative flex items-center shrink-0 w-32 sm:w-40 md:w-44">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decisions..."
            className="w-full h-8 sm:h-9 pl-8 pr-2.5 rounded-lg border border-slate-200 dark:border-neutral-700/80 bg-slate-50/60 dark:bg-neutral-800/50 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-card focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
          />
        </div>

        {/* Segmented Control Toggle: [ View: Capital Time Both ] */}
        <div className="h-8 sm:h-9 inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 rounded-lg bg-slate-100/80 dark:bg-neutral-800/60 text-xs text-slate-700 dark:text-slate-300 shrink-0 select-none">
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
                  ? "bg-[#2563EB] text-white font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Capital
            </button>
          </Tooltip>
          <Tooltip content="Show Time Horizon and retrospective target date">
            <button
              type="button"
              onClick={() => setResourceView('time')}
              className={cn(
                "px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs transition-all font-medium",
                resourceView === 'time'
                  ? "bg-[#2563EB] text-white font-semibold shadow-xs"
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
                  ? "bg-[#2563EB] text-white font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Both
            </button>
          </Tooltip>
        </div>

        {/* Filter Pills with natural width - without number counts */}
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
                    "h-8 sm:h-9 inline-flex items-center justify-center px-2.5 sm:px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap shadow-xs",
                    isActive
                      ? "bg-[#2563EB] text-white border border-transparent shadow-xs font-semibold"
                      : "bg-white dark:bg-[#171717] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03] border border-slate-200 dark:border-neutral-800"
                  )}
                >
                  {tab.label}
                </button>
              </Tooltip>
            );
          })}
        </div>

        {/* Advanced Filters Drawer Button */}
        <div className="ml-auto flex items-center shrink-0">
          <Tooltip content="Open advanced filters (Department, Category, Capital)">
            <button
              type="button"
              onClick={() => setIsAdvancedFilterOpen(true)}
              className={cn(
                "h-8 sm:h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap shadow-xs shrink-0 border",
                activeAdvancedCount > 0
                  ? "bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-300 border-[#2563EB]/40 font-semibold"
                  : "bg-white dark:bg-[#171717] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 border-slate-200 dark:border-neutral-800"
              )}
            >
              <SlidersHorizontal className={cn("h-3.5 w-3.5", activeAdvancedCount > 0 ? "text-[#2563EB]" : "text-slate-500")} />
              <span>Filters</span>
              {activeAdvancedCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-[10px] font-bold text-white">
                  {activeAdvancedCount}
                </span>
              )}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Main Table: Fluid width with overflow-x-hidden (no horizontal scrolling) */}
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#171717] shadow-sm transition-colors">
        <div className="w-full overflow-x-hidden">
          <table className="w-full text-left text-xs border-collapse table-fixed">
            <thead>
              <tr className="border-b border-gray-200 dark:border-neutral-800 bg-gray-50/75 dark:bg-neutral-900/50">
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[33%] text-left">
                  <Tooltip content="Locked hypothesis and expected payoffs for each strategic initiative">
                    <span className="cursor-help">DECISION & HYPOTHESIS</span>
                  </Tooltip>
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[14%] text-left">
                  <Tooltip content="Executive sponsor and departmental accountability">
                    <span className="cursor-help">OWNER</span>
                  </Tooltip>
                </th>
                {showCapital && (
                  <th className={cn(
                    "py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-left whitespace-nowrap",
                    resourceView === 'both' ? "w-[13%]" : "w-[19%]"
                  )}>
                    <Tooltip content="Committed financial capital at risk and ROI payback horizon">
                      <span className="cursor-help">CAPITAL INVESTMENT</span>
                    </Tooltip>
                  </th>
                )}
                {showTime && (
                  <th className={cn(
                    "py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-left whitespace-nowrap",
                    resourceView === 'both' ? "w-[15%]" : "w-[21%]"
                  )}>
                    <Tooltip content="Execution horizon and target retrospective audit deadline">
                      <span className="cursor-help">TIME INVESTMENT</span>
                    </Tooltip>
                  </th>
                )}
                <th className={cn(
                  "py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-left",
                  resourceView === 'both' ? "w-[12%]" : "w-[16%]"
                )}>
                  <Tooltip content="Current lifecycle state of the decision commitment">
                    <span className="cursor-help">STATUS</span>
                  </Tooltip>
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-left w-[13%]">
                  <Tooltip content="6-month SLA milestone compliance and retrospective status">
                    <span className="cursor-help">STATUS DETAIL</span>
                  </Tooltip>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/80">
              {filteredDecisions.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="py-14 text-center text-gray-500">
                    <p className="text-sm font-medium tracking-tight">No decisions match the selected filter.</p>
                    <p className="text-xs text-gray-400 mt-1">Reset filters or record a new strategic commitment.</p>
                  </td>
                </tr>
              ) : (
                filteredDecisions.map((decision) => {
                  const isOverdue = decision.status === 'Review Due' && isPastDate(decision.targetReviewDate);
                  const isExpanded = expandedId === decision.id;
                  const isSelected = selectedDecisionId === decision.id;
                  const daysOverdue = isOverdue ? getDaysOverdue(decision.targetReviewDate) : 0;
                  const daysElapsed = getDaysElapsed(decision.createdAt);

                  return (
                    <React.Fragment key={decision.id}>
                      <tr
                        onClick={() => {
                          onSelectDecision?.(decision);
                        }}
                        className={cn(
                          "group cursor-pointer transition-colors",
                          isSelected
                            ? "bg-[#EEF4FF] dark:bg-blue-950/30"
                            : "bg-white dark:bg-[#171717] hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                        )}
                      >
                        {/* Title & Hypothesis preview */}
                        <td className={cn(
                          "py-3.5 px-4 w-[33%] align-middle border-l-4 transition-all",
                          isSelected ? "border-l-4 border-blue-600" : "border-l-4 border-l-transparent"
                        )}>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-mono font-medium text-slate-500 dark:text-slate-400 text-[11px]">
                              {decision.id}
                            </span>
                            <span className="text-slate-400 dark:text-slate-500">•</span>
                            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                              {decision.category}
                            </span>
                          </div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight mt-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                            {decision.title}
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-1 mt-0.5 font-normal leading-normal">
                            {decision.hypothesis}
                          </p>
                        </td>

                        {/* Owner / Sponsor */}
                        <td className="py-3.5 px-4 w-[14%] align-middle">
                          <div className="flex items-center gap-2.5">
                            <Tooltip content={`${decision.owner.name} • ${decision.owner.role}`}>
                              <div className={cn(
                                "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white shrink-0 shadow-2xs cursor-help",
                                getDepartmentAvatarStyle(decision.owner.role, decision.category)
                              )}>
                                {decision.owner.initials || getInitials(decision.owner.name)}
                              </div>
                            </Tooltip>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-slate-900 dark:text-white text-xs tracking-tight truncate">
                                {decision.owner.name}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {decision.owner.role}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Capital Investment */}
                        {showCapital && (
                          <td className={cn(
                            "py-3.5 px-4 text-left whitespace-nowrap align-middle",
                            resourceView === 'both' ? "w-[13%]" : "w-[19%]"
                          )}>
                            <div className="font-bold text-slate-900 dark:text-white text-xs tabular-nums">
                              {formatCurrency(decision.originalEstimates.capitalAtRisk)} /
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5 tabular-nums">
                              {decision.originalEstimates.expectedPaybackMonths}mo payback
                            </div>
                          </td>
                        )}

                        {/* Time Investment */}
                        {showTime && (
                          <td className={cn(
                            "py-3.5 px-4 text-left whitespace-nowrap align-middle",
                            resourceView === 'both' ? "w-[15%]" : "w-[21%]"
                          )}>
                            <div className="font-bold text-slate-900 dark:text-white text-xs tabular-nums flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                              <span>{decision.originalEstimates.expectedPaybackMonths}mo Horizon /</span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5 tabular-nums truncate">
                              Target: {formatDate(decision.targetReviewDate)}
                            </div>
                          </td>
                        )}

                        {/* Status & Delay */}
                        <td className={cn(
                          "py-3.5 px-4 text-left whitespace-nowrap align-middle",
                          resourceView === 'both' ? "w-[12%]" : "w-[16%]"
                        )}>
                          <div className="flex flex-col items-start gap-1">
                            <Badge status={decision.status}>
                              {decision.status}
                            </Badge>
                            {isOverdue && (
                              <Tooltip content={`Breached 6-month retrospective SLA by ${daysOverdue} days`}>
                                <span className="inline-flex items-center justify-center w-[108px] h-6 px-2 py-0.5 rounded-full text-xs font-medium bg-[#FEE2E2] text-[#DC2626] dark:bg-red-950/40 dark:text-red-300 shrink-0 cursor-help">
                                  +{daysOverdue}d Delay
                                </span>
                              </Tooltip>
                            )}
                          </div>
                        </td>

                        {/* Status Detail */}
                        <td className="py-3.5 px-4 text-left whitespace-nowrap align-middle w-[13%]">
                          {isOverdue ? (
                            <Tooltip content="Automated 6-month SLA breached. Executive retrospective audit required.">
                              <span className="inline-flex items-center justify-center gap-1.5 w-[124px] h-6 px-2.5 py-1 rounded-md text-xs font-medium bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60 shrink-0 cursor-help">
                                <AlertTriangle className="h-3.5 w-3.5 text-[#DC2626] shrink-0" strokeWidth={1.8} />
                                <span>Retro Overdue</span>
                              </span>
                            </Tooltip>
                          ) : decision.status === 'Reviewed' ? (
                            <Tooltip content="Hypothesis variance audited and permanent institutional learning logged">
                              <span className="inline-flex items-center justify-center gap-1.5 w-[124px] h-6 px-2.5 py-1 rounded-md text-xs font-medium bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF] dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60 shrink-0 cursor-help">
                                <ShieldCheck className="h-3.5 w-3.5 text-[#7E22CE] shrink-0" strokeWidth={1.8} />
                                <span>Retro Logged</span>
                              </span>
                            </Tooltip>
                          ) : (
                            <Tooltip content={`Decision active for ${daysElapsed} days within standard 6-month evaluation window`}>
                              <div className="text-xs cursor-help">
                                <div className="font-semibold text-slate-800 dark:text-slate-200">SLA Healthy</div>
                                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">({daysElapsed}d in)</div>
                              </div>
                            </Tooltip>
                          )}
                        </td>
                      </tr>

                      {/* Detail Drawer with Generous Padding (p-6) & Spacing */}
                      <AnimatePresence>
                        {isExpanded && (
                          <tr>
                            <td colSpan={colCount} className="p-0 border-b border-black/[0.06] dark:border-white/[0.08] bg-black/[0.015] dark:bg-white/[0.015]">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.16, ease: 'easeOut' }}
                                className="overflow-hidden p-6 sm:p-7"
                              >
                                {/* Drawer Meta Strip */}
                                <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-black/[0.06] dark:border-white/[0.08] text-xs text-gray-500">
                                  <div className="flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                    <span className="font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                                      Immutable Decision Snapshot
                                    </span>
                                    <span>•</span>
                                    <span>Locked at executive approval on {formatDate(decision.createdAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="text-gray-400 font-sans">RECORD ID:</span>
                                    <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">{decision.id}</span>
                                  </div>
                                </div>

                                {/* Content Grid: Generous p-6 Vault and space-y-5 */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                  
                                  {/* Left Container (Immutable Snapshot): Generous p-6 & space-y-5 */}
                                  <div className="lg:col-span-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] p-6 border border-black/[0.06] dark:border-white/[0.08] space-y-5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                                    
                                    {/* Section 1: Hypothesis & Metrics */}
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                                        <FileText className="h-4 w-4 text-gray-400" />
                                        <span>Locked Hypothesis & Benchmark Payoff</span>
                                      </div>
                                      
                                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-normal">
                                        "{decision.hypothesis}"
                                      </p>
                                      
                                      <div className="pt-3.5 border-t border-black/[0.05] dark:border-white/[0.06] space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-gray-500">Target Metric:</span>
                                          <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {decision.originalEstimates.primaryMetric} ({decision.originalEstimates.targetMetricValue})
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-gray-500">Expected Annual Impact:</span>
                                          <span className="font-medium text-emerald-700 dark:text-emerald-400 tabular-nums">
                                            {decision.originalEstimates.expectedAnnualImpact}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-gray-500">Capital at Risk Committed:</span>
                                          <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">
                                            {formatCurrency(decision.originalEstimates.capitalAtRisk)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Section 2: Counterfactuals */}
                                    <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] space-y-3">
                                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                                        <GitFork className="h-4 w-4 text-gray-400" />
                                        <span>Counterfactuals & Alternatives Evaluated</span>
                                      </div>
                                      
                                      <div className="space-y-2.5">
                                        {decision.alternativesConsidered && decision.alternativesConsidered.length > 0 ? (
                                          decision.alternativesConsidered.map((alt, idx) => (
                                            <div key={idx} className="rounded-lg bg-white dark:bg-card p-4 text-xs border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-1.5">
                                              <div className="flex items-center justify-between font-medium text-gray-900 dark:text-gray-100 tracking-tight">
                                                <span>{alt.title}</span>
                                                <span className="text-gray-500 text-[11px] tabular-nums">
                                                  Est. {formatCurrency(alt.estimatedCost)}
                                                </span>
                                              </div>
                                              <p className="text-gray-600 dark:text-gray-300 text-xs leading-normal">
                                                {alt.rationale}
                                              </p>
                                            </div>
                                          ))
                                        ) : (
                                          <p className="text-xs text-gray-400 italic">No alternative branches recorded.</p>
                                        )}
                                      </div>
                                    </div>

                                  </div>

                                  {/* Right Container: Retrospective Status Column with generous p-6 & space-y-4 */}
                                  <div className="rounded-xl bg-white dark:bg-card p-6 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-5">
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span>Retrospective Status</span>
                                      </div>

                                      {decision.retrospectiveSnapshot ? (
                                        <div className="space-y-3.5">
                                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            <span>Retrospective Completed</span>
                                          </div>
                                          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {decision.retrospectiveSnapshot.actualOutcomeSummary}
                                          </p>

                                          {decision.retrospectiveSnapshot.keyLearnings && (
                                            <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.06]">
                                              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                                                Documented Learnings:
                                              </span>
                                              <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                {decision.retrospectiveSnapshot.keyLearnings.map((learning, lIdx) => (
                                                  <li key={lIdx}>{learning}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                        </div>
                                      ) : isOverdue ? (
                                        <div className="space-y-4">
                                          <div className="rounded-lg bg-red-50 dark:bg-red-950/40 p-4 border border-red-300 dark:border-red-900/60 space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-red-900 dark:text-red-300 font-semibold text-xs">
                                              <AlertTriangle className="h-4 w-4 shrink-0 text-red-700 dark:text-red-400" />
                                              <span>Automated 6-Month Review Overdue</span>
                                            </div>
                                            <p className="text-xs text-red-950/80 dark:text-red-200/80 leading-relaxed font-normal">
                                              Target review was scheduled for <strong>{formatDate(decision.targetReviewDate)}</strong> ({daysOverdue} days overdue). Compare original expectations against real metrics now.
                                            </p>
                                          </div>

                                          {/* Perfectly centered red pulsing dot inside sleek button */}
                                          <button
                                            type="button"
                                            className="w-full inline-flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-md text-xs font-medium bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all active:scale-[0.99]"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              alert(`Initiating Retrospective Review for "${decision.title}". Original sponsor: ${decision.owner.name}`);
                                            }}
                                          >
                                            <span className="relative flex h-2 w-2 items-center justify-center shrink-0">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
                                            </span>
                                            <span>Conduct Retrospective Audit</span>
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="space-y-2 text-xs text-gray-500 leading-relaxed">
                                          <p>
                                            Scheduled for <strong>{formatDate(decision.targetReviewDate)}</strong>.
                                          </p>
                                          <p className="text-gray-400 leading-normal">
                                            When the review milestone arrives, leadership is prompted to conduct a side-by-side reconciliation between original estimates and actual unit economics.
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    <div className="pt-4 border-t border-black/[0.05] dark:border-white/[0.06] text-[11px] text-gray-500 flex items-center gap-2">
                                      <span>Decision Sponsor:</span>
                                      <div className={cn(
                                        "flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white shrink-0 shadow-2xs",
                                        getDepartmentAvatarStyle(decision.owner.role, decision.category)
                                      )}>
                                        {decision.owner.initials || getInitials(decision.owner.name)}
                                      </div>
                                      <span className="font-medium text-gray-900 dark:text-gray-100 tracking-tight">{decision.owner.name}</span>
                                      <span className="text-gray-400">({decision.owner.role})</span>
                                    </div>
                                  </div>

                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with comfortable py-3.5 px-5 */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/40 text-xs text-gray-500">
          <div>
            Showing {filteredDecisions.length} of {decisions.length} strategic decisions
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-600" /> Overdue
            </span>
          </div>
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
