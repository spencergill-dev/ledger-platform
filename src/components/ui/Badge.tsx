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
      'Draft': 'bg-[#F1F5F9] text-[#475569] dark:bg-neutral-800/60 dark:text-neutral-300',
      'Approved': 'bg-[#D1FAE5] text-[#065F46] dark:bg-emerald-950/40 dark:text-emerald-300',
      'In Progress': 'bg-[#DBEAFE] text-[#1E40AF] dark:bg-blue-950/40 dark:text-blue-300',
      'Review Due': 'bg-[#FEF3C7] text-[#92400E] dark:bg-amber-950/40 dark:text-amber-300',
      'Reviewed': 'bg-[#F3E8FF] text-[#6B21A8] dark:bg-purple-950/40 dark:text-purple-300',
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
          "inline-flex items-center justify-center gap-1.5 w-[108px] h-6 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-normal shrink-0",
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
    outline: 'text-foreground border border-gray-200 bg-white dark:bg-neutral-800 dark:border-neutral-700',
    destructive: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60 font-medium',
    overdue: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60 font-medium',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
