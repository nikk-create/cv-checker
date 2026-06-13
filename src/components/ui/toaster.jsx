import * as React from 'react';
import { cn } from '@/lib/utils';

const ToastContext = React.createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const toast = React.useCallback(({ title, description, variant = 'default' }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, variant }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <div key={t.id}
            className={cn(
              'bg-card border rounded-xl shadow-lg p-4 flex gap-3 items-start animate-in slide-in-from-right',
              t.variant === 'destructive' ? 'border-destructive/30 bg-destructive/5' : 'border-border'
            )}
          >
            <div className="flex-1">
              {t.title && <p className={cn('text-sm font-semibold', t.variant === 'destructive' ? 'text-destructive' : 'text-foreground')}>{t.title}</p>}
              {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
            </div>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function Toaster() { return null; } // placeholder — ToastProvider handles rendering

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) return { toast: () => {} };
  return ctx;
}
