import React from 'react';
import { cn } from '@/lib/utils';

export default function ScoreBadge({ score, size = 'md' }) {
  const getColor = (s) => {
    if (s >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (s >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };
  const sizeMap = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-20 h-20 text-lg',
  };
  return (
    <div className={cn(
      'rounded-full border-2 flex items-center justify-center font-bold font-heading',
      getColor(score ?? 0), sizeMap[size]
    )}>
      {score ?? '–'}%
    </div>
  );
}
