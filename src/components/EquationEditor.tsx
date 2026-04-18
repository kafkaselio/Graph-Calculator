/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { validateEquation } from '../lib/simulationEngine';
import { Equation } from '../types';

interface EquationEditorProps {
  equation: Equation;
  variables: string[];
  onUpdate: (id: string, updates: Partial<Equation>) => void;
}

export function EquationEditor({ equation, variables, onUpdate }: EquationEditorProps) {
  const [expression, setExpression] = useState(equation.expression);
  const [validation, setValidation] = useState<{ valid: boolean; error?: string }>({ valid: true });

  // Sync local state with prop when it changes from outside (e.g. model switch)
  useEffect(() => {
    setExpression(equation.expression);
  }, [equation.expression]);

  useEffect(() => {
    const result = validateEquation(expression, variables);
    setValidation(result);
    
    // Only update parent if valid and different from current prop
    const isDifferent = expression !== equation.expression;
    if (result.valid && isDifferent) {
      const timeoutId = setTimeout(() => {
        onUpdate(equation.id, { expression });
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [expression, variables, equation.id, equation.expression, onUpdate]);

  return (
    <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: equation.color }} />
          <input
            type="text"
            value={equation.outputName}
            onChange={(e) => onUpdate(equation.id, { outputName: e.target.value })}
            className="text-sm font-semibold bg-transparent border-none focus:ring-0 p-0 text-zinc-700 dark:text-zinc-300 w-32"
          />
        </div>
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={equation.unit}
            placeholder="Unit"
            onChange={(e) => onUpdate(equation.id, { unit: e.target.value })}
            className="w-12 px-1 py-0.5 text-xs text-right bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="relative">
        <textarea
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          className={`w-full p-3 font-mono text-sm bg-zinc-50 dark:bg-zinc-800 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
            validation.valid
              ? 'border-zinc-200 dark:border-zinc-700 focus:ring-indigo-500'
              : 'border-red-300 dark:border-red-900 focus:ring-red-500'
          }`}
          rows={2}
          spellCheck={false}
        />
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          {validation.valid ? (
            <CheckCircle2 size={14} className="text-emerald-500" />
          ) : (
            <AlertCircle size={14} className="text-red-500" />
          )}
        </div>
      </div>

      {!validation.valid && validation.error && (
        <div className="flex items-start gap-1.5 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
          <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
          <span className="whitespace-pre font-mono">{validation.error}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 px-1">
        <Info size={10} />
        <span>Use: +, -, *, /, ^, sin, cos, tan, pi, e</span>
      </div>
    </div>
  );
}
