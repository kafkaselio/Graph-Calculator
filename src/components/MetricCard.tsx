/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MetricCardProps {
  name: string;
  value: number;
  unit: string;
  color: string;
  error?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ name, value, unit, color, error, className }) => {
  const formatValue = (val: number) => {
    if (val === 0) return '0';
    const absVal = Math.abs(val);
    
    // Use scientific notation for very small or very large values
    if (absVal < 0.0001 || absVal > 1000000) {
      return val.toExponential(4);
    }
    
    // Otherwise use up to 6 decimal places but remove trailing zeros
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    }).format(val);
  };

  const formattedValue = typeof value === 'number' ? formatValue(value) : '0';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm",
        "p-metric rounded-xl transition-all duration-300",
        "theme-glass",
        error && "border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          "[[data-theme=presentation]_&]:w-3 [[data-theme=presentation]_&]:h-3"
        )} style={{ backgroundColor: error ? '#ef4444' : color }} />
        <span className={cn(
          "text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider",
          "[[data-theme=academic]_&]:italic [[data-theme=academic]_&]:normal-case [[data-theme=academic]_&]:text-zinc-600",
          "[[data-theme=presentation]_&]:text-base [[data-theme=presentation]_&]:font-extrabold"
        )}>
          {name}
        </span>
      </div>
      {error ? (
        <div className="text-xs text-red-500 font-medium leading-tight mt-1">
          {error}
        </div>
      ) : (
        <div className="flex items-baseline gap-1">
          <span className={cn(
            "text-3xl font-bold text-zinc-900 dark:text-zinc-100",
            "[[data-theme=academic]_&]:font-serif [[data-theme=academic]_&]:text-zinc-800",
            "[[data-theme=presentation]_&]:text-5xl [[data-theme=presentation]_&]:font-black"
          )}>
            {formattedValue}
          </span>
          <span className={cn(
            "text-lg font-medium text-zinc-400 dark:text-zinc-500",
            "[[data-theme=academic]_&]:text-zinc-400 [[data-theme=academic]_&]:italic",
            "[[data-theme=presentation]_&]:text-2xl [[data-theme=presentation]_&]:font-bold"
          )}>
            {unit}
          </span>
        </div>
      )}
    </motion.div>
  );
}
