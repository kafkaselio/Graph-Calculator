/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';

interface HistoryState<T> {
  stack: T[];
  index: number;
}

export function useHistory<T>(initialState: T) {
  const [state, setStateInternal] = useState<HistoryState<T>>({
    stack: [initialState],
    index: 0
  });

  const setPresent = useCallback((action: T | ((prev: T) => T)) => {
    setStateInternal(prev => {
      const current = prev.stack[prev.index];
      const next = typeof action === 'function' ? (action as any)(current) : action;

      // Avoid adding duplicate states to history
      if (JSON.stringify(next) === JSON.stringify(current)) {
        return prev;
      }

      const newStack = prev.stack.slice(0, prev.index + 1);
      newStack.push(next);

      // Limit history size to 50
      const finalStack = newStack.length > 50 ? newStack.slice(newStack.length - 50) : newStack;

      return {
        stack: finalStack,
        index: finalStack.length - 1
      };
    });
  }, []);

  const undo = useCallback(() => {
    setStateInternal(prev => ({
      ...prev,
      index: Math.max(0, prev.index - 1)
    }));
  }, []);

  const redo = useCallback(() => {
    setStateInternal(prev => ({
      ...prev,
      index: Math.min(prev.stack.length - 1, prev.index + 1)
    }));
  }, []);

  const reset = useCallback((newState: T) => {
    setStateInternal({
      stack: [newState],
      index: 0
    });
  }, []);

  return {
    state: state.stack[state.index],
    setState: setPresent,
    undo,
    redo,
    reset,
    canUndo: state.index > 0,
    canRedo: state.index < state.stack.length - 1
  };
}
