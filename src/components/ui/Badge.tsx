import React from 'react';
import { cn } from '../../lib/utils';
import { DecisionStatus } from '../../types/decision';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'overdue';
  status?: DecisionStatus;
  children: React.ReactNode;
}

export function Badge({
  className,
  variant = 'default',
  status,
  children,
  ...props
}: BadgeProps) {
  if (status) {
    const statusStyles: Record<DecisionStatus, string> = {
      'Draft': 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-300',
      'Approved': 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300',
      'In Progress': 'bg-blue-50 text-blue-800 border border-blue-200/80 dark:bg-blue-950/40 dark:border-blue-800/60 dark:text-blue-300',
      'Review Due': 'bg-amber-50 text-amber-800 border border-amber-200/80 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300',
      'Reviewed': 'bg-purple-50 text-purple-800 border border-purple-200/80 dark:bg-purple-950/40 dark:border-purple-800/60 dark:text-purple-300',
    };

    const dotColors: Record<DecisionStatus, string> = {
      'Draft': 'bg-slate-400',
      'Approved': 'bg-emerald-500',
      'In Progress': 'bg-blue-500',
      'Review Due': 'bg-amber-500',
      'Reviewed': 'bg-purple-500',
    };

    return (
      <span
        className={cn(
          "inline-flex items-center justify-center gap-1.5 w-[104px] h-6 px-2.5 py-0.5 rounded-md text-xs font-medium tracking-normal shrink-0 font-sans shadow-2xs",
          statusStyles[status],
          className
        )}
        {...props}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[status])} />
        {children}
      </span>
    );
  }

  const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'text-foreground border border-slate-200 bg-white dark:bg-neutral-800 dark:border-neutral-700',
    destructive: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60 font-medium',
    overdue: 'bg-rose-50 text-rose-600 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60 font-medium',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium font-sans",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
