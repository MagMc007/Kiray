import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800 shadow-sm focus-visible:ring-orange-500',
  secondary:
    'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-sm focus-visible:ring-slate-900',
  outline:
    'border border-stone-300 bg-white text-slate-800 hover:bg-stone-50 active:bg-stone-100 shadow-sm focus-visible:ring-orange-500',
  ghost:
    'bg-transparent text-slate-700 hover:bg-stone-100 active:bg-stone-200 focus-visible:ring-orange-500',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm focus-visible:ring-rose-500',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs font-semibold px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm font-semibold px-4 py-2.5 rounded-xl gap-2',
  lg: 'text-base font-bold px-5 py-3 rounded-xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
