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
      'Draft': 'bg-surface-muted text-content-secondary border border-subtle',
      'Approved': 'bg-status-approved-bg text-status-approved-text border border-status-approved-border',
      'In Progress': 'bg-status-inprogress-bg text-status-inprogress-text border border-status-inprogress-border',
      'Review Due': 'bg-status-overdue-bg text-status-overdue-text border border-status-overdue-border',
      'Reviewed': 'bg-status-reviewed-bg text-status-reviewed-text border border-status-reviewed-border',
    };

    const dotColors: Record<DecisionStatus, string> = {
      'Draft': 'bg-content-faint',
      'Approved': 'bg-status-approved-dot',
      'In Progress': 'bg-status-inprogress-dot',
      'Review Due': 'bg-status-overdue-dot',
      'Reviewed': 'bg-status-reviewed-dot',
    };

    return (
      <span
        className={cn(
          "inline-flex items-center justify-center gap-1.5 w-[104px] h-6 px-2.5 py-0.5 rounded-badge text-xs font-medium tracking-normal shrink-0 font-sans shadow-2xs",
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
    outline: 'text-content-primary border border-subtle bg-surface',
    destructive: 'bg-status-overdue-bg text-status-overdue-text border border-status-overdue-border font-medium',
    overdue: 'bg-status-overdue-bg text-status-overdue-text border border-status-overdue-border font-medium',
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
