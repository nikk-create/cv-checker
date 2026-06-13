import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div className={cn('md:block', mobileOpen ? 'block' : 'hidden')}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Main */}
      <main className={cn(
        'transition-all duration-300 min-h-screen',
        'md:' + (collapsed ? 'ml-[72px]' : 'ml-64'),
        'ml-0'
      )}>
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 bg-card border-b border-border sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="text-muted-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-heading font-bold text-base">CV Analyzer</span>
        </div>

        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
