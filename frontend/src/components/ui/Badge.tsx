import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2',
          {
            'border-transparent bg-zinc-800 text-zinc-100': variant === 'default',
            'border-transparent bg-emerald-500/10 text-emerald-400': variant === 'success',
            'border-transparent bg-amber-500/10 text-amber-400': variant === 'warning',
            'border-transparent bg-red-500/10 text-red-400': variant === 'danger',
            'border-transparent bg-blue-500/10 text-blue-400': variant === 'info',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
