import React from 'react';
import { cn } from '../../lib/utils';
import { DecisionStatus } from '../../types/decision';
import { 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  CheckCheck, 
  Clock 
} from 'lucide-react';

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
    // 1. Uniform neutral gray background with subtle border
    const wrapperStyle = "bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-neutral-700";

    // 2. Semantic Lucide icons with subtle state-colored stroke
    const getStatusIcon = (st: DecisionStatus) => {
      switch (st) {
        case 'Review Due':
          return <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />;
        case 'Approved':
          return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
        case 'In Progress':
          return <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />;
        case 'Reviewed':
          return <CheckCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />;
        case 'Draft':
        default:
          return <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />;
      }
    };

    return (
      <span
        className={cn(
          "inline-flex items-center justify-center gap-1.5 w-[108px] h-6 px-2 py-0.5 rounded-badge text-xs font-medium tracking-normal shrink-0 font-sans shadow-2xs select-none",
          wrapperStyle,
          className
        )}
        {...props}
      >
        {getStatusIcon(status)}
        <span className="truncate">{children}</span>
      </span>
    );
  }

  const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'text-content-primary border border-subtle bg-surface',
    destructive: 'bg-slate-100 dark:bg-neutral-800 text-red-600 dark:text-red-400 border border-slate-200/80 dark:border-neutral-700 font-medium',
    overdue: 'bg-slate-100 dark:bg-neutral-800 text-red-600 dark:text-red-400 border border-slate-200/80 dark:border-neutral-700 font-medium',
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
