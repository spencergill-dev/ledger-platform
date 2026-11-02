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
  Check,
  Building2,
  Tag,
  DollarSign,
  RotateCcw
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
  const [openDropdown, setOpenDropdown] = useState<'status' | 'department' | 'category' | 'capital' | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenDropdown(null);
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
        return (
          r.includes('infrastructure') || 
          r.includes('engineer') || 
          r.includes('devops') || 
          r.includes('security') || 
          r.includes('research') || 
          c.includes('infrastructure') || 
          c.includes('ai') || 
          c.includes('security')
        );
      }
      if (departmentFilter === 'product') {
        return r.includes('product') || r.includes('architect') || c.includes('product');
      }
      if (departmentFilter === 'leadership') {
        return !(
          r.includes('infrastructure') || 
          r.includes('engineer') || 
          r.includes('devops') || 
          r.includes('security') || 
          r.includes('research') || 
          c.includes('infrastructure') || 
          c.includes('ai') || 
          c.includes('security') || 
          r.includes('product') || 
          r.includes('architect') || 
          c.includes('product')
        );
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

  const getDeptCount = (deptId: string) => {
    if (deptId === 'ALL') return decisions.length;
    return decisions.filter(d => {
      const r = d.owner.role.toLowerCase();
      const c = d.category.toLowerCase();
      if (deptId === 'engineering') {
        return (
          r.includes('infrastructure') || 
          r.includes('engineer') || 
          r.includes('devops') || 
          r.includes('security') || 
          r.includes('research') || 
          c.includes('infrastructure') || 
          c.includes('ai') || 
          c.includes('security')
        );
      }
      if (deptId === 'product') {
        return r.includes('product') || r.includes('architect') || c.includes('product');
      }
      if (deptId === 'leadership') {
        return !(
          r.includes('infrastructure') || 
          r.includes('engineer') || 
          r.includes('devops') || 
          r.includes('security') || 
          r.includes('research') || 
          c.includes('infrastructure') || 
          c.includes('ai') || 
          c.includes('security') || 
          r.includes('product') || 
          r.includes('architect') || 
          c.includes('product')
        );
      }
      return true;
    }).length;
  };

  const departmentOptions = [
    { id: 'ALL', label: 'All Departments', shortLabel: 'All', count: decisions.length },
    { id: 'leadership', label: 'Executive & Strategy', shortLabel: 'Executive', count: getDeptCount('leadership') },
    { id: 'engineering', label: 'Engineering & Infra', shortLabel: 'Engineering', count: getDeptCount('engineering') },
    { id: 'product', label: 'Product & Systems', shortLabel: 'Product', count: getDeptCount('product') },
  ];

  const uniqueCategories = Array.from(new Set(decisions.map(d => d.category))).filter(Boolean).sort();
  const categoryOptions = [
    { id: 'ALL', label: 'All Categories', shortLabel: 'All', count: decisions.length },
    ...uniqueCategories.map(cat => ({
      id: cat,
      label: cat,
      shortLabel: cat.length > 16 ? cat.slice(0, 14) + '...' : cat,
      count: decisions.filter(d => d.category === cat).length
    }))
  ];

  const capitalOptions = [
    { 
      id: 'ALL', 
      label: 'Any Capital', 
      shortLabel: 'All', 
      count: decisions.length 
    },
    { 
      id: '<250k', 
      label: 'Under $250k', 
      shortLabel: '<$250k', 
      count: decisions.filter(d => d.originalEstimates.capitalAtRisk < 250000).length 
    },
    { 
      id: '250k-500k', 
      label: '$250k – $500k', 
      shortLabel: '$250k-$500k', 
      count: decisions.filter(d => d.originalEstimates.capitalAtRisk >= 250000 && d.originalEstimates.capitalAtRisk <= 500000).length 
    },
    { 
      id: '500k+', 
      label: '$500k and Above', 
      shortLabel: '$500k+', 
      count: decisions.filter(d => d.originalEstimates.capitalAtRisk > 500000).length 
    },
  ];

  const currentStatusOption = statusOptions.find(opt => opt.id === statusFilter) || statusOptions[0];
  const currentDeptOption = departmentOptions.find(opt => opt.id === departmentFilter) || departmentOptions[0];
  const currentCategoryOption = categoryOptions.find(opt => opt.id === categoryFilter) || categoryOptions[0];
  const currentCapitalOption = capitalOptions.find(opt => opt.id === capitalFilter) || capitalOptions[0];
  const totalActiveFilterCount = activeAdvancedCount + (statusFilter !== 'ALL' ? 1 : 0);
  const hasActiveFilters = totalActiveFilterCount > 0 || searchQuery.trim().length > 0;

  return (
    <div className="w-full">
      {/* Unified Block: Merged Toolbar & Table into a single continuous container */}
      <div className="w-full rounded-md border border-subtle bg-surface transition-colors shadow-2xs">
        
        {/* Flush Top Search & Filter Toolbar - relative z-30 ensures dropdown overlays table */}
        <div 
          ref={toolbarRef}
          className="relative z-30 p-2.5 sm:p-3 border-b border-subtle flex flex-wrap items-center gap-2 bg-surface rounded-t-md"
        >
          {/* Search Input */}
          <div className="relative flex items-center flex-1 sm:flex-initial min-w-[140px] sm:w-44 md:w-52">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-content-faint pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search decisions..."
              className="w-full h-8 pl-8 pr-2.5 rounded-md border border-subtle bg-surface-subtle text-xs text-content-primary placeholder:text-content-faint focus:outline-none focus:border-border-strong transition-colors font-sans"
            />
          </div>

          {/* Segmented Control Toggle: [ View: Capital Time Both ] */}
          <div className="h-8 inline-flex items-center gap-1 px-1.5 sm:px-2 rounded-md bg-surface-muted/60 border border-border-muted text-xs shrink-0 select-none">
            <span className="text-content-faint font-mono text-[11px] mr-1 hidden sm:inline">
              View:
            </span>
            <button
              type="button"
              onClick={() => setResourceView('capital')}
              className={cn(
                "px-2 py-0.5 rounded text-xs transition-colors font-medium",
                resourceView === 'capital'
                  ? "bg-surface text-content-primary shadow-2xs border border-subtle font-semibold"
                  : "text-content-muted hover:text-content-primary"
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
                  ? "bg-surface text-content-primary shadow-2xs border border-subtle font-semibold"
                  : "text-content-muted hover:text-content-primary"
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
                  ? "bg-surface text-content-primary shadow-2xs border border-subtle font-semibold"
                  : "text-content-muted hover:text-content-primary"
              )}
            >
              Both
            </button>
          </div>

          <div className="h-4 w-px bg-border-muted mx-0.5 hidden xl:block shrink-0" />

          {/* Dedicated Filter Dropdowns */}
          {/* 1. Status Dropdown */}
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
              className={cn(
                "h-8 inline-flex items-center gap-1.5 px-2.5 rounded-md border text-xs font-medium transition-colors whitespace-nowrap shadow-2xs select-none",
                statusFilter !== 'ALL'
                  ? "bg-surface-subtle text-content-primary border-border-strong font-semibold"
                  : "bg-surface text-content-secondary hover:bg-surface-hover border-subtle"
              )}
            >
              <span className="text-content-faint font-normal">Status:</span>
              <div className="flex items-center gap-1.5 font-semibold text-content-primary">
                {statusFilter !== 'ALL' && currentStatusOption.dotColor && (
                  <span className={cn("h-2 w-2 rounded-full shrink-0", currentStatusOption.dotColor)} />
                )}
                <span>{currentStatusOption.shortLabel}</span>
              </div>
              <ChevronDown className={cn("h-3.5 w-3.5 text-content-faint transition-transform duration-150", openDropdown === 'status' && "rotate-180")} />
            </button>

            {openDropdown === 'status' && (
              <div className="absolute left-0 mt-1.5 w-56 rounded-md border border-subtle bg-surface-elevated shadow-elevated py-1 z-50">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-content-faint uppercase tracking-wider border-b border-border-muted flex items-center justify-between">
                  <span>Lifecycle Status</span>
                  {statusFilter !== 'ALL' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStatusFilter('ALL');
                        setOpenDropdown(null);
                      }}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline normal-case font-normal"
                    >
                      Clear
                    </button>
                  )}
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
                          setOpenDropdown(null);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors",
                          isSelected
                            ? "bg-surface-subtle font-semibold text-content-primary"
                            : "text-content-secondary hover:bg-surface-hover font-normal"
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
                              ? "bg-surface-muted text-content-primary font-semibold"
                              : "text-content-faint"
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

          {/* 2. Department Dropdown */}
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'department' ? null : 'department')}
              className={cn(
                "h-8 inline-flex items-center gap-1.5 px-2.5 rounded-md border text-xs font-medium transition-colors whitespace-nowrap shadow-2xs select-none",
                departmentFilter !== 'ALL'
                  ? "bg-surface-subtle text-content-primary border-border-strong font-semibold"
                  : "bg-surface text-content-secondary hover:bg-surface-hover border-subtle"
              )}
            >
              <Building2 className="h-3.5 w-3.5 text-content-faint shrink-0" />
              <span className="text-content-faint font-normal">Dept:</span>
              <span className="font-semibold text-content-primary max-w-[100px] truncate">
                {currentDeptOption.shortLabel}
              </span>
              <ChevronDown className={cn("h-3.5 w-3.5 text-content-faint transition-transform duration-150", openDropdown === 'department' && "rotate-180")} />
            </button>

            {openDropdown === 'department' && (
              <div className="absolute left-0 mt-1.5 w-56 rounded-md border border-subtle bg-surface-elevated shadow-elevated py-1 z-50">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-content-faint uppercase tracking-wider border-b border-border-muted flex items-center justify-between">
                  <span>Department / Function</span>
                  {departmentFilter !== 'ALL' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDepartmentFilter('ALL');
                        setOpenDropdown(null);
                      }}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline normal-case font-normal"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="py-1">
                  {departmentOptions.map((opt) => {
                    const isSelected = departmentFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setDepartmentFilter(opt.id);
                          setOpenDropdown(null);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors",
                          isSelected
                            ? "bg-surface-subtle font-semibold text-content-primary"
                            : "text-content-secondary hover:bg-surface-hover font-normal"
                        )}
                      >
                        <span>{opt.label}</span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[11px] tabular-nums px-1.5 py-0.2 rounded font-sans",
                            isSelected
                              ? "bg-surface-muted text-content-primary font-semibold"
                              : "text-content-faint"
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

          {/* 3. Category Dropdown */}
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
              className={cn(
                "h-8 inline-flex items-center gap-1.5 px-2.5 rounded-md border text-xs font-medium transition-colors whitespace-nowrap shadow-2xs select-none",
                categoryFilter !== 'ALL'
                  ? "bg-surface-subtle text-content-primary border-border-strong font-semibold"
                  : "bg-surface text-content-secondary hover:bg-surface-hover border-subtle"
              )}
            >
              <Tag className="h-3.5 w-3.5 text-content-faint shrink-0" />
              <span className="text-content-faint font-normal">Category:</span>
              <span className="font-semibold text-content-primary max-w-[110px] truncate">
                {currentCategoryOption.shortLabel}
              </span>
              <ChevronDown className={cn("h-3.5 w-3.5 text-content-faint transition-transform duration-150", openDropdown === 'category' && "rotate-180")} />
            </button>

            {openDropdown === 'category' && (
              <div className="absolute left-0 mt-1.5 w-60 rounded-md border border-subtle bg-surface-elevated shadow-elevated py-1 z-50">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-content-faint uppercase tracking-wider border-b border-border-muted flex items-center justify-between">
                  <span>Strategic Category</span>
                  {categoryFilter !== 'ALL' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategoryFilter('ALL');
                        setOpenDropdown(null);
                      }}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline normal-case font-normal"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {categoryOptions.map((opt) => {
                    const isSelected = categoryFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setCategoryFilter(opt.id);
                          setOpenDropdown(null);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors",
                          isSelected
                            ? "bg-surface-subtle font-semibold text-content-primary"
                            : "text-content-secondary hover:bg-surface-hover font-normal"
                        )}
                      >
                        <span className="truncate pr-2">{opt.label}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn(
                            "text-[11px] tabular-nums px-1.5 py-0.2 rounded font-sans",
                            isSelected
                              ? "bg-surface-muted text-content-primary font-semibold"
                              : "text-content-faint"
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

          {/* 4. Capital Dropdown */}
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'capital' ? null : 'capital')}
              className={cn(
                "h-8 inline-flex items-center gap-1.5 px-2.5 rounded-md border text-xs font-medium transition-colors whitespace-nowrap shadow-2xs select-none",
                capitalFilter !== 'ALL'
                  ? "bg-surface-subtle text-content-primary border-border-strong font-semibold"
                  : "bg-surface text-content-secondary hover:bg-surface-hover border-subtle"
              )}
            >
              <DollarSign className="h-3.5 w-3.5 text-content-faint shrink-0" />
              <span className="text-content-faint font-normal">Capital:</span>
              <span className="font-semibold text-content-primary max-w-[90px] truncate">
                {currentCapitalOption.shortLabel}
              </span>
              <ChevronDown className={cn("h-3.5 w-3.5 text-content-faint transition-transform duration-150", openDropdown === 'capital' && "rotate-180")} />
            </button>

            {openDropdown === 'capital' && (
              <div className="absolute right-0 sm:left-0 sm:right-auto mt-1.5 w-56 rounded-md border border-subtle bg-surface-elevated shadow-elevated py-1 z-50">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-content-faint uppercase tracking-wider border-b border-border-muted flex items-center justify-between">
                  <span>Committed Capital</span>
                  {capitalFilter !== 'ALL' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCapitalFilter('ALL');
                        setOpenDropdown(null);
                      }}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline normal-case font-normal"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="py-1">
                  {capitalOptions.map((opt) => {
                    const isSelected = capitalFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setCapitalFilter(opt.id);
                          setOpenDropdown(null);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors",
                          isSelected
                            ? "bg-surface-subtle font-semibold text-content-primary"
                            : "text-content-secondary hover:bg-surface-hover font-normal"
                        )}
                      >
                        <span>{opt.label}</span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[11px] tabular-nums px-1.5 py-0.2 rounded font-sans",
                            isSelected
                              ? "bg-surface-muted text-content-primary font-semibold"
                              : "text-content-faint"
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

          {/* Right Section: Reset + Filters Button */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="h-8 inline-flex items-center gap-1.5 px-2.5 rounded-md text-xs font-medium text-content-muted hover:text-content-primary hover:bg-surface-hover border border-subtle transition-colors shadow-2xs"
                title="Reset all filters"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            {/* Advanced Filters Button */}
            <button
              type="button"
              onClick={() => setIsAdvancedFilterOpen(true)}
              className={cn(
                "h-8 inline-flex items-center gap-1.5 px-3 rounded-md border text-xs font-medium transition-colors whitespace-nowrap shrink-0 shadow-2xs",
                totalActiveFilterCount > 0
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 font-semibold"
                  : "bg-surface text-content-secondary hover:bg-surface-hover border-subtle"
              )}
            >
              <SlidersHorizontal className={cn("h-3.5 w-3.5", totalActiveFilterCount > 0 ? "text-blue-600 dark:text-blue-400" : "text-content-muted")} />
              <span>Filters</span>
              {totalActiveFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white dark:bg-white dark:text-slate-900">
                  {totalActiveFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Flush Table: Fluid width with edge-to-edge layout and horizontal scroll protection */}
        <div className="w-full overflow-x-auto rounded-b-md">
          <table className={cn(
            "w-full text-left text-xs border-collapse table-fixed",
            resourceView === 'both' ? "min-w-[940px]" : "min-w-[780px]"
          )}>
            <thead>
              <tr className="border-b border-subtle bg-surface-muted/50">
                <th className={cn(
                  "py-3 px-4 font-sans text-[11px] font-semibold uppercase tracking-wider text-content-primary text-left",
                  resourceView === 'both' ? "w-[34%] min-w-[280px]" : "w-[40%] min-w-[300px]"
                )}>
                  DECISION & HYPOTHESIS
                </th>
                <th className={cn(
                  "py-3 px-4 font-sans text-[11px] font-semibold uppercase tracking-wider text-content-primary text-left",
                  resourceView === 'both' ? "w-[20%] min-w-[180px]" : "w-[24%] min-w-[190px]"
                )}>
                  OWNER & STAKEHOLDERS
                </th>
                {showCapital && (
                  <th className={cn(
                    "py-3 px-4 font-sans text-[11px] font-semibold uppercase tracking-wider text-content-primary text-left whitespace-nowrap",
                    resourceView === 'both' ? "w-[16%] min-w-[150px]" : "w-[20%] min-w-[150px]"
                  )}>
                    CAPITAL INVESTMENT
                  </th>
                )}
                {showTime && (
                  <th className={cn(
                    "py-3 px-4 font-sans text-[11px] font-semibold uppercase tracking-wider text-content-primary text-left whitespace-nowrap",
                    resourceView === 'both' ? "w-[16%] min-w-[150px]" : "w-[20%] min-w-[150px]"
                  )}>
                    TIME INVESTMENT
                  </th>
                )}
                <th className={cn(
                  "py-3 px-4 font-sans text-[11px] font-semibold uppercase tracking-wider text-content-primary text-right whitespace-nowrap",
                  resourceView === 'both' ? "w-[14%] min-w-[140px]" : "w-[16%] min-w-[140px]"
                )}>
                  STATUS
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border-muted">
              {filteredDecisions.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="py-12 text-center text-content-muted">
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
                        "group cursor-pointer transition-colors border-b border-border-muted last:border-b-0",
                        isSelected
                          ? "bg-blue-50/50 dark:bg-blue-950/20"
                          : "bg-surface hover:bg-surface-hover"
                      )}
                    >
                      {/* Column 1: Title, Hypothesis & Versioning Badges */}
                      <td className={cn(
                        "py-3.5 px-4 align-middle border-l-4 transition-all",
                        isSelected ? "border-l-blue-600" : "border-l-transparent"
                      )}>
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <span className="font-mono font-medium tracking-normal text-content-faint text-xs tabular-nums">
                            {decision.id}
                          </span>
                          
                          {/* Versioning Badge with subtle lifecycle color */}
                          <span className={cn(
                            "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-sans font-medium uppercase tracking-wide border",
                            decision.version?.toLowerCase().includes('amended')
                              ? "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60"
                              : "bg-surface-muted text-content-muted border-border-muted"
                          )}>
                            {decision.version || 'v1.0 Frozen'}
                          </span>

                          {/* Subtle Category Tag with Department Color Indicator */}
                          <span className="text-slate-300 dark:text-neutral-700">•</span>
                          <span className={cn(
                            "inline-flex items-center gap-1.5 text-[11px] font-medium font-sans",
                            decision.category.toLowerCase().includes('infra') ? "text-emerald-700 dark:text-emerald-300" :
                            decision.category.toLowerCase().includes('product') ? "text-blue-700 dark:text-blue-300" :
                            decision.category.toLowerCase().includes('capital') ? "text-purple-700 dark:text-purple-300" :
                            decision.category.toLowerCase().includes('market') ? "text-amber-700 dark:text-amber-300" :
                            decision.category.toLowerCase().includes('ai') ? "text-violet-700 dark:text-violet-300" :
                            decision.category.toLowerCase().includes('security') ? "text-rose-700 dark:text-rose-300" :
                            "text-content-secondary"
                          )}>
                            <span className={cn(
                              "h-1.5 w-1.5 rounded-full shrink-0",
                              decision.category.toLowerCase().includes('infra') ? "bg-emerald-500" :
                              decision.category.toLowerCase().includes('product') ? "bg-blue-500" :
                              decision.category.toLowerCase().includes('capital') ? "bg-purple-500" :
                              decision.category.toLowerCase().includes('market') ? "bg-amber-500" :
                              decision.category.toLowerCase().includes('ai') ? "bg-violet-500" :
                              decision.category.toLowerCase().includes('security') ? "bg-rose-500" :
                              "bg-content-faint"
                            )} />
                            <span>{decision.category}</span>
                          </span>
                        </div>
                        <div className="font-semibold text-content-primary text-sm tracking-tight mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 font-sans">
                          {decision.title}
                        </div>
                        <p className="text-content-secondary text-xs line-clamp-1 mt-0.5 font-normal leading-normal font-sans">
                          {decision.hypothesis}
                        </p>
                      </td>

                      {/* Column 2: Owner & Stakeholders */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-start gap-2.5">
                          {/* Main Owner Profile Avatar */}
                          <div className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shrink-0 font-sans mt-0.5",
                            getDepartmentAvatarStyle(decision.owner.role, decision.category)
                          )}>
                            {decision.owner.initials || getInitials(decision.owner.name)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-content-primary text-sm tracking-tight truncate font-sans">
                              {decision.owner.name}
                            </div>
                            <div className="text-xs text-content-muted truncate font-sans mt-0.5">
                              {decision.owner.role}
                            </div>

                            {/* Stakeholders mini-avatars cluster (spread out, borderless, with tooltips) */}
                            {decision.stakeholders && decision.stakeholders.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                {decision.stakeholders.map((stk) => {
                                  const dotColor = 
                                    stk.stance === 'dissent' ? 'bg-red-500' :
                                    stk.stance === 'conditions' ? 'bg-amber-500' :
                                    '';

                                  const tooltipLabel = stk.stance === 'support'
                                    ? `${stk.name} (${stk.role})`
                                    : `${stk.name} (${stk.role}) • ${stk.stance.toUpperCase()}: "${stk.rationale}"`;

                                  return (
                                    <Tooltip 
                                      key={stk.id} 
                                      content={tooltipLabel}
                                    >
                                      <div 
                                        className="relative inline-flex items-center justify-center cursor-pointer"
                                        title={`${stk.name} (${stk.role})`}
                                      >
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold bg-surface-muted text-content-secondary font-sans select-none hover:bg-surface-hover hover:text-content-primary transition-colors shadow-2xs">
                                          {stk.initials}
                                        </div>
                                        {dotColor && (
                                          <span className={cn(
                                            "absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ring-1 ring-surface",
                                            dotColor
                                          )} />
                                        )}
                                      </div>
                                    </Tooltip>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Capital Investment */}
                      {showCapital && (
                        <td className="py-3.5 px-4 text-left whitespace-nowrap align-middle">
                          {hasDrift && decision.actuals ? (
                            <div className="flex flex-col text-left font-sans">
                              {/* Strikethrough Original Baseline */}
                              <span className="line-through text-content-faint text-xs tabular-nums">
                                {formatCurrency(decision.originalEstimates.capitalAtRisk)} (Orig)
                              </span>
                              {/* Actual or Amended Value */}
                              <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="font-semibold text-content-primary text-sm tabular-nums">
                                  {formatCurrency(decision.actuals.actualCapital)}
                                </span>
                                <span className="text-[10px] font-medium text-content-muted tracking-wider uppercase">
                                  ({decision.version?.toLowerCase().includes('amended') && !isOverdue ? 'Amended' : 'Actual'})
                                </span>
                              </div>
                              <div className="text-xs text-content-muted mt-0.5 tabular-nums">
                                {decision.actuals.actualPaybackMonths}mo payback
                              </div>
                            </div>
                          ) : (
                            <div className="font-sans">
                              <div className="font-semibold text-content-primary text-sm tabular-nums">
                                {formatCurrency(decision.originalEstimates.capitalAtRisk)}
                              </div>
                              <div className="text-xs text-content-muted mt-0.5 tabular-nums">
                                {decision.originalEstimates.expectedPaybackMonths}mo payback
                              </div>
                            </div>
                          )}
                        </td>
                      )}

                      {/* Column 4: Time Investment */}
                      {showTime && (
                        <td className="py-3.5 px-4 text-left whitespace-nowrap align-middle">
                          {hasDrift && decision.actuals && isOverdue ? (
                            <div className="flex flex-col text-left font-sans">
                              {/* Strikethrough Original Horizon */}
                              <span className="line-through text-content-faint text-xs tabular-nums">
                                {decision.originalEstimates.expectedPaybackMonths}mo Horizon (Orig)
                              </span>
                              {/* Actual Time with Tag */}
                              <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="font-semibold text-content-primary text-sm tabular-nums">
                                  {decision.actuals.actualPaybackMonths}mo Horizon
                                </span>
                                <span className="text-[10px] font-medium text-content-muted tracking-wider uppercase">
                                  (Actual)
                                </span>
                              </div>
                              <div className="text-xs text-content-muted mt-0.5 tabular-nums truncate">
                                Target: {formatDate(decision.targetReviewDate)}
                              </div>
                            </div>
                          ) : (
                            <div className="font-sans">
                              <div className="font-semibold text-content-primary text-sm tabular-nums">
                                {decision.originalEstimates.expectedPaybackMonths}mo Horizon
                              </div>
                              <div className="text-xs text-content-muted mt-0.5 tabular-nums truncate">
                                Target: {formatDate(decision.targetReviewDate)}
                              </div>
                            </div>
                          )}
                        </td>
                      )}

                      {/* Column 5: Status (Right-Aligned with single status pill and clean secondary delay subtext) */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap align-middle">
                        <div className="inline-flex flex-col items-center">
                          <Badge status={decision.status}>
                            {decision.status}
                          </Badge>
                          {isOverdue && (
                            <Tooltip content={`Breached 6-month retrospective SLA by ${daysOverdue} days`}>
                              <span className="text-xs font-medium text-status-overdue-text dark:text-rose-400 tabular-nums font-sans mt-1 block select-none cursor-default">
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
