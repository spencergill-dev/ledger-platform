import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  SlidersHorizontal, 
  Building2, 
  Tag, 
  DollarSign, 
  Clock, 
  Check, 
  RotateCcw 
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AdvancedFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (dept: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  capitalFilter: string;
  setCapitalFilter: (range: string) => void;
  onResetAll: () => void;
  matchCount: number;
  totalCount: number;
}

export function AdvancedFilterDrawer({
  isOpen,
  onClose,
  statusFilter,
  setStatusFilter,
  departmentFilter,
  setDepartmentFilter,
  categoryFilter,
  setCategoryFilter,
  capitalFilter,
  setCapitalFilter,
  onResetAll,
  matchCount,
  totalCount,
}: AdvancedFilterDrawerProps) {
  const activeCount = 
    (statusFilter !== 'ALL' ? 1 : 0) +
    (departmentFilter !== 'ALL' ? 1 : 0) +
    (categoryFilter !== 'ALL' ? 1 : 0) +
    (capitalFilter !== 'ALL' ? 1 : 0);

  const departments = [
    { id: 'ALL', label: 'All Departments' },
    { id: 'leadership', label: 'Executive & Strategy' },
    { id: 'engineering', label: 'Engineering & Infra' },
    { id: 'product', label: 'Product & Systems' },
  ];

  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'Infrastructure', label: 'Infrastructure' },
    { id: 'Market Entry', label: 'Market Entry' },
    { id: 'Vendor Migration', label: 'Vendor Migration' },
    { id: 'Product Core', label: 'Product Core' },
    { id: 'Capital Allocation', label: 'Capital Allocation' },
  ];

  const statuses = [
    { id: 'ALL', label: 'All Decisions' },
    { id: 'OVERDUE', label: 'Overdue (SLA Breached)' },
    { id: 'In Progress', label: 'In Progress' },
    { id: 'Approved', label: 'Approved' },
    { id: 'Review Due', label: 'Review Due' },
    { id: 'Reviewed', label: 'Reviewed' },
    { id: 'Draft', label: 'Draft' },
  ];

  const capitalRanges = [
    { id: 'ALL', label: 'Any Capital Committed' },
    { id: '<250k', label: 'Under $250,000' },
    { id: '250k-500k', label: '$250,000 – $500,000' },
    { id: '500k+', label: '$500,000 and Above' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white dark:bg-[#171717] border-l border-slate-200 dark:border-neutral-800 shadow-2xl flex flex-col"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Advanced Filters
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Showing {matchCount} of {totalCount} commitments
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={onResetAll}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
              
              {/* Department / Function */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold">
                  <Building2 className="h-3.5 w-3.5 text-slate-500" />
                  <span>Department & Executive Function</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {departments.map((dept) => {
                    const isSelected = departmentFilter === dept.id;
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => setDepartmentFilter(dept.id)}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-lg text-left border transition-all text-xs font-medium",
                          isSelected
                            ? "border-[#2563EB] bg-blue-50/70 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-300 font-semibold"
                            : "border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900 text-slate-700 dark:text-slate-300"
                        )}
                      >
                        <span className="truncate">{dept.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-[#2563EB] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Strategic Category */}
              <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-neutral-800">
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold">
                  <Tag className="h-3.5 w-3.5 text-slate-500" />
                  <span>Strategic Category</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => {
                    const isSelected = categoryFilter === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryFilter(cat.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                          isSelected
                            ? "border-[#2563EB] bg-[#2563EB] text-white font-semibold shadow-xs"
                            : "border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900 text-slate-700 dark:text-slate-300"
                        )}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status / Lifecycle */}
              <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-neutral-800">
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Review Milestone & Lifecycle</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {statuses.map((st) => {
                    const isSelected = statusFilter === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStatusFilter(st.id)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                          isSelected
                            ? "border-[#2563EB] bg-blue-50/70 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-300 font-semibold"
                            : "border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900 text-slate-700 dark:text-slate-300"
                        )}
                      >
                        <span>{st.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-[#2563EB] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Capital Committed Range */}
              <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-neutral-800">
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold">
                  <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                  <span>Committed Capital at Risk</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {capitalRanges.map((range) => {
                    const isSelected = capitalFilter === range.id;
                    return (
                      <button
                        key={range.id}
                        type="button"
                        onClick={() => setCapitalFilter(range.id)}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-lg border text-left text-xs font-medium transition-all",
                          isSelected
                            ? "border-[#2563EB] bg-blue-50/70 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-300 font-semibold"
                            : "border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900 text-slate-700 dark:text-slate-300"
                        )}
                      >
                        <span>{range.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-[#2563EB] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Drawer Footer with Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-neutral-800 bg-slate-50/80 dark:bg-neutral-900/60 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onResetAll}
                className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all text-center"
              >
                Show {matchCount} Commitment{matchCount === 1 ? '' : 's'}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
