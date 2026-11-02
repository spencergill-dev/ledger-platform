import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
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
  const [coords, setCoords] = useState<{ top: number; left: number; placement: 'top' | 'bottom' | 'left' | 'right' }>({
    top: 0,
    left: 0,
    placement: position,
  });
  const triggerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    
    let placement = position;
    // Auto-flip if not enough room on top
    if (position === 'top' && rect.top < 45) {
      placement = 'bottom';
    } else if (position === 'bottom' && window.innerHeight - rect.bottom < 45) {
      placement = 'top';
    }

    let top = 0;
    let left = 0;

    if (placement === 'top') {
      top = rect.top - 8;
      left = rect.left + rect.width / 2;
    } else if (placement === 'bottom') {
      top = rect.bottom + 8;
      left = rect.left + rect.width / 2;
    } else if (placement === 'left') {
      top = rect.top + rect.height / 2;
      left = rect.left - 8;
    } else if (placement === 'right') {
      top = rect.top + rect.height / 2;
      left = rect.right + 8;
    }

    // Keep left within viewport margins
    left = Math.max(16, Math.min(window.innerWidth - 16, left));

    setCoords({ top, left, placement });
  }, [position]);

  const handleMouseEnter = () => {
    updatePosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    if (!isVisible) return;
    const handleDismiss = () => setIsVisible(false);
    window.addEventListener('scroll', handleDismiss, true);
    window.addEventListener('resize', handleDismiss);
    return () => {
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('resize', handleDismiss);
    };
  }, [isVisible]);

  if (!content) return children;

  return (
    <div
      ref={triggerRef}
      className={cn("relative inline-flex items-center", wrapperClassName)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      {isVisible && typeof document !== 'undefined' && createPortal(
        <div
          role="tooltip"
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transform: 
              coords.placement === 'top' ? 'translate(-50%, -100%)' :
              coords.placement === 'bottom' ? 'translate(-50%, 0)' :
              coords.placement === 'left' ? 'translate(-100%, -50%)' :
              'translate(0, -50%)',
          }}
          className={cn(
            "z-[99999] px-2.5 py-1 text-[11px] font-medium text-white bg-slate-900/95 dark:bg-neutral-800 dark:text-slate-100 dark:border dark:border-neutral-700/80 rounded-md shadow-elevated whitespace-nowrap pointer-events-none font-sans select-none animate-in fade-in-0 duration-75",
            className
          )}
        >
          {content}
        </div>,
        document.body
      )}
    </div>
  );
}
