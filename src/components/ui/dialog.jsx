import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export function Dialog({ open, onOpenChange, children }) {
  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onOpenChange?.(false); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40" onClick={() => onOpenChange?.(false)} />
      <div className="relative z-10 w-full max-w-lg">{children}</div>
    </div>
  );
}

export function DialogContent({ className, children, ...props }) {
  return (
    <div className={cn('bg-card rounded-2xl border border-border shadow-xl', className)} {...props}>
      {children}
    </div>
  );
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn('p-6 pb-4 border-b border-border', className)} {...props} />;
}

export function DialogFooter({ className, ...props }) {
  return <div className={cn('p-6 pt-4 border-t border-border flex justify-end gap-3', className)} {...props} />;
}

export function DialogTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-heading font-bold text-foreground', className)} {...props} />;
}

export function DialogClose({ onClose }) {
  return (
    <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
      <X className="w-5 h-5" />
    </button>
  );
}

export function DialogTrigger({ children, onClick }) {
  return React.cloneElement(children, { onClick });
}
