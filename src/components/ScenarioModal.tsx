/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Bookmark, BookmarkPlus, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Scenario, Variable, VariablePreset } from '../types';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario | null;
  variables: Variable[];
  presets: VariablePreset[];
  onSave: (id: string, updates: Partial<Scenario>) => void;
  onSavePreset: (preset: Omit<VariablePreset, 'id'>) => void;
}

export function ScenarioModal({ isOpen, onClose, scenario, variables, presets, onSave, onSavePreset }: ScenarioModalProps) {
  const [name, setName] = useState('');
  const [values, setValues] = useState<Record<string, number>>({});
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    if (scenario) {
      setName(scenario.name);
      setValues({ ...scenario.variableValues });
    }
  }, [scenario]);

  if (!scenario) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(scenario.id, {
      name: name.trim(),
      variableValues: values
    });
    onClose();
  };

  const handleValueChange = (varId: string, val: number) => {
    setValues(prev => ({ ...prev, [varId]: val }));
  };

  const applyPreset = (preset: VariablePreset) => {
    setValues({ ...preset.variableValues });
    setShowPresets(false);
  };

  const handleSavePreset = () => {
    const presetName = prompt("Enter a name for this variable preset:");
    if (presetName) {
      onSavePreset({
        name: presetName,
        variableValues: { ...values }
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
          >
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-bold">Edit Scenario</h3>
              <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-thin">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Scenario Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  placeholder="e.g. High Pressure Case"
                />
                {!name.trim() && (
                  <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-bold">
                    <AlertCircle size={12} />
                    <span>Name is required</span>
                  </div>
                )}
              </div>

              {/* Presets Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Saved Presets</label>
                  <button 
                    onClick={handleSavePreset}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <BookmarkPlus size={12} />
                    <span>Save Current as Preset</span>
                  </button>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowPresets(!showPresets)}
                    className="w-full flex items-center justify-between px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-left text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Bookmark size={14} className="text-zinc-400" />
                      <span>{presets.length > 0 ? 'Select a preset...' : 'No presets saved'}</span>
                    </div>
                    <ChevronDown size={14} className={`text-zinc-400 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showPresets && presets.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden"
                      >
                        <div className="max-h-48 overflow-y-auto scrollbar-thin">
                          {presets.map((preset) => (
                            <button
                              key={preset.id}
                              onClick={() => applyPreset(preset)}
                              className="w-full px-4 py-3 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors"
                            >
                              <div className="font-bold text-zinc-700 dark:text-zinc-200">{preset.name}</div>
                              <div className="text-[10px] text-zinc-400 mt-0.5">
                                {Object.keys(preset.variableValues).length} variables defined
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Variable Values</label>
                <div className="grid grid-cols-1 gap-3">
                  {variables.map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{v.label}</span>
                        <span className="text-[10px] text-zinc-400">{v.unit}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={values[v.id] ?? v.value}
                          onChange={(e) => handleValueChange(v.id, parseFloat(e.target.value))}
                          step={v.step}
                          className="w-24 px-3 py-1.5 text-right text-sm font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
              >
                <Save size={18} />
                <span>Save Changes</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
