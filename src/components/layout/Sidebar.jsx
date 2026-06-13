import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { LayoutDashboard, FileUp, FileCheck, LogOut, ChevronLeft, ChevronRight, FileText, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['admin', 'user'] },
    { path: '/templates', label: 'Canevas de CV', icon: FileText, roles: ['admin'] },
    { path: '/submit', label: 'Soumettre un CV', icon: FileUp, roles: ['user'] },
    { path: '/submissions', label: 'Mes soumissions', icon: FileCheck, roles: ['user'] },
    { path: '/all-submissions', label: 'Toutes les soumissions', icon: FileCheck, roles: ['admin'] },
  ];

  const filtered = navItems.filter(i => i.roles.includes(user?.role || 'user'));

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-300 flex flex-col',
      collapsed ? 'w-[72px]' : 'w-64'
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center gap-3 min-h-[64px]">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-heading font-bold text-base truncate">CV Analyzer</h1>
            <p className="text-[11px] text-muted-foreground">Vérification intelligente</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filtered.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-1">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-semibold text-foreground truncate">{user.full_name}</p>
            <p className="text-[11px] text-muted-foreground">{user.role === 'admin' ? 'Enseignant' : 'Étudiant'}</p>
          </div>
        )}
        <button
          onClick={logout}
          title={collapsed ? 'Déconnexion' : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
        <Button variant="ghost" size="sm" onClick={onToggle} className="w-full justify-center">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </aside>
  );
}
