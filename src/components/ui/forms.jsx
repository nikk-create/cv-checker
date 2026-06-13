import * as React from 'react';
import { cn } from '@/lib/utils';

// Badge
export function Badge({ className, variant = 'default', ...props }) {
  const v = {
    default: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary text-foreground border-border',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    outline: 'border border-border text-foreground',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', v[variant] || v.default, className)} {...props} />
  );
}

// Input
export const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';

// Label
export const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label ref={ref} className={cn('text-xs font-semibold text-muted-foreground uppercase tracking-wider', className)} {...props} />
));
Label.displayName = 'Label';

// Textarea
export const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[80px] w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 resize-none',
      className
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

// Select (native)
export const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

// Switch
export function Switch({ checked, onCheckedChange, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none',
        checked ? 'bg-primary' : 'bg-muted',
        className
      )}
    >
      <span className={cn('pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg transition-transform', checked ? 'translate-x-5' : 'translate-x-0')} />
    </button>
  );
}
