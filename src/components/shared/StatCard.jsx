import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, icon: Icon, color, delay = 0 }) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    destructive: 'bg-destructive/10 text-destructive',
    amber: 'bg-amber-100 text-amber-600',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-heading font-bold text-foreground mt-2">{value}</p>
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', colorMap[color] || colorMap.primary)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
