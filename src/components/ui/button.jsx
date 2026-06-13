import * as React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-primary text-primary-foreground hover:opacity-90',
  destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
  outline: 'border border-border bg-transparent hover:bg-secondary text-foreground',
  secondary: 'bg-secondary text-foreground hover:opacity-80',
  ghost: 'hover:bg-secondary text-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};
const sizes = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-8 px-3 text-xs rounded-md',
  lg: 'h-11 px-6 text-base',
  icon: 'h-9 w-9',
};

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
      variants[variant], sizes[size], className
    )}
    {...props}
  />
));
Button.displayName = 'Button';
export { Button };
