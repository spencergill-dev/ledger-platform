import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'pill-cta';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-sans font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.99] border";

    const variantStyles = {
      // Primary button: structured rounded-md
      primary: "bg-primary text-primary-foreground border-transparent hover:opacity-90 shadow-xs rounded-md",
      // Pill CTA exclusively for primary call-to-action like Record Decision
      'pill-cta': "bg-foreground text-background border-transparent hover:opacity-90 shadow-xs rounded-full",
      secondary: "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80 rounded-md",
      outline: "border-border bg-card hover:bg-accent text-foreground rounded-md",
      ghost: "border-transparent hover:bg-accent text-muted-foreground hover:text-foreground rounded-md",
      danger: "bg-red-700 text-white hover:bg-red-800 border-red-800 rounded-md",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-xs gap-2",
      lg: "h-10 px-5 text-sm gap-2.5",
      icon: "h-8 w-8 p-0 rounded-md",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
