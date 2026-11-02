import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  wrapperClassName?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  className,
  wrapperClassName,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  if (!content) return children;

  return (
    <div
      className={cn("relative inline-flex items-center", wrapperClassName)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 px-2.5 py-1 text-[11px] font-medium text-white bg-slate-900/95 dark:bg-neutral-800 dark:text-slate-100 dark:border dark:border-neutral-700/80 rounded-md shadow-elevated whitespace-nowrap pointer-events-none transition-opacity font-sans select-none",
            position === 'top' && "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
            position === 'bottom' && "top-full left-1/2 -translate-x-1/2 mt-1.5",
            position === 'left' && "right-full top-1/2 -translate-y-1/2 mr-1.5",
            position === 'right' && "left-full top-1/2 -translate-y-1/2 ml-1.5",
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
