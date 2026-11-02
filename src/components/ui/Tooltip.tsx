import React from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  wrapperClassName?: string;
}

/**
 * Tooltip wrapper component.
 * Disabled for now per design direction. Directly renders children without popups.
 */
export function Tooltip({
  children,
  wrapperClassName,
}: TooltipProps) {
  if (wrapperClassName) {
    return <div className={wrapperClassName}>{children}</div>;
  }
  return <>{children}</>;
}
