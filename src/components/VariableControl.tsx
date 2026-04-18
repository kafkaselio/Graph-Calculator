/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Unlock, RotateCcw, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Variable } from '../types';

interface VariableControlProps {
  variable: Variable;
  onChange: (id: string, value: number) => void;
  onUpdateMetadata?: (id: string, updates: Partial<Variable>) => void;
  onToggleLock?: (id: string) => void;
  onRandomize?: (id: string) => void;
}

export function VariableControl({ variable, onChange, onUpdateMetadata, onToggleLock, onRandomize }: VariableControlProps) {
  const { id, label, value, min, max, step, unit, isLocked, randomMin, randomMax } = variable;
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {onRandomize && (
            <button
              onClick={() => onRandomize(id)}
              className="p-1 text-zinc-400 hover:text-accent transition-colors"
              title="Randomize"
            >
              <RotateCcw size={14} />
            </button>
          )}
          {onUpdateMetadata && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1 transition-colors ${showSettings ? 'text-accent' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
              title="Randomization Settings"
            >
              <Settings2 size={14} />
            </button>
          )}
          {onToggleLock && (
            <button
              onClick={() => onToggleLock(id)}
              className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              title={isLocked ? "Unlock" : "Lock"}
            >
              {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSettings && onUpdateMetadata && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Rand Min</label>
                <input
                  type="number"
                  placeholder={min.toString()}
                  value={randomMin ?? ''}
                  onChange={(e) => onUpdateMetadata(id, { randomMin: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-2 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded focus:ring-1 focus:ring-accent outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Rand Max</label>
                <input
                  type="number"
                  placeholder={max.toString()}
                  value={randomMax ?? ''}
                  onChange={(e) => onUpdateMetadata(id, { randomMax: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-2 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded focus:ring-1 focus:ring-accent outline-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={isLocked}
          onChange={(e) => onChange(id, parseFloat(e.target.value))}
          className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-accent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex items-center gap-1 min-w-[80px] justify-end">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            disabled={isLocked}
            onChange={(e) => onChange(id, parseFloat(e.target.value))}
            className="w-16 px-2 py-1 text-right text-sm font-medium bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:ring-2 focus:ring-accent focus:outline-none disabled:opacity-50"
          />
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}
