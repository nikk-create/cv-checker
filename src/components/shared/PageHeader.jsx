import React from 'react';
import { motion } from 'framer-motion';

export default function PageHeader({ title, subtitle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </motion.div>
  );
}
