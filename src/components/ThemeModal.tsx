/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Check, Palette, Type, Maximize2, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeConfig } from '../types';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ThemeConfig;
  onChange: (updates: Partial<ThemeConfig>) => void;
}

const ACCENT_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Zinc', value: '#71717a' },
];

const FONTS = {
  sans: ['Inter', 'Outfit', 'Montserrat', 'System'],
  serif: ['Playfair Display', 'Lora', 'Merriweather'],
  mono: ['JetBrains Mono', 'Fira Code', 'Space Mono'],
};

export function ThemeModal({ isOpen, onClose, config, onChange }: ThemeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
          >
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <Palette size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Theme Customizer</h3>
                  <p className="text-xs text-zinc-500 font-medium tracking-wide">GRANULAR UI CONTROLS</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 overflow-y-auto max-h-[70vh] scrollbar-thin">
              {/* Left Column: Visuals & Layout */}
              <div className="space-y-8">
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    <Layers size={14} />
                    <span>Base Aesthetic</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['scientific', 'academic', 'presentation'] as const).map((b) => (
                      <button
                        key={b}
                        onClick={() => onChange({ base: b })}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          config.base === b
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-indigo-300'
                        }`}
                      >
                        {b.charAt(0).toUpperCase() + b.slice(1)}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    <div className="w-3 h-3 rounded-full border border-zinc-300" />
                    <span>Accent Color</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {ACCENT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => onChange({ accentColor: color.value })}
                        className={`relative w-full aspect-square rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center border-2 ${
                           config.accentColor === color.value ? 'border-zinc-900 dark:border-zinc-100' : 'border-transparent shadow-sm'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {config.accentColor === color.value && (
                          <Check size={16} className="text-white drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    <Maximize2 size={14} />
                    <span>Layout & Spacing</span>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-bold text-zinc-500">
                        <span>Density</span>
                        <span className="capitalize text-indigo-600">{config.spacing}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(['compact', 'comfortable', 'spacious'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => onChange({ spacing: s })}
                            className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                              config.spacing === s
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                                : 'border-zinc-200 dark:border-zinc-800'
                            }`}
                          >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-bold text-zinc-500">
                        <span>Border Radius</span>
                        <span className="uppercase text-indigo-600 font-mono">{config.borderRadius}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(['none', 'sm', 'md', 'lg', 'xl', 'full'] as const).map((r) => (
                          <button
                            key={r}
                            onClick={() => onChange({ borderRadius: r })}
                            className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                              config.borderRadius === r
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                                : 'border-zinc-200 dark:border-zinc-800'
                            }`}
                          >
                            {r.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">Apply Glassmorphism</span>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={config.glassmorphism}
                          onChange={(e) => onChange({ glassmorphism: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </div>
                    </label>
                  </div>
                </section>
              </div>

              {/* Right Column: Typography */}
              <div className="space-y-8">
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    <Type size={14} />
                    <span>Typography</span>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Primary Sans-Serif</label>
                      <select 
                        value={config.fontSans}
                        onChange={(e) => onChange({ fontSans: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        {FONTS.sans.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Monospace (Code/Data)</label>
                      <select 
                        value={config.fontMono}
                        onChange={(e) => onChange({ fontMono: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        {FONTS.mono.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Serif (Academic/Labels)</label>
                      <select 
                        value={config.fontSerif}
                        onChange={(e) => onChange({ fontSerif: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        {FONTS.serif.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    {/* Preview Area */}
                    <div className="mt-8 p-6 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Live Font Preview</p>
                      <h4 className="text-xl font-bold" style={{ fontFamily: config.fontSans }}>Scientific Analysis</h4>
                      <p className="text-sm opacity-70" style={{ fontFamily: config.fontSerif }}>The quick brown fox jumps over the lazy dog in cursive.</p>
                      <p className="text-xs font-mono opacity-60" style={{ fontFamily: config.fontMono }}>F = m * a (Data Point: 42.069)</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="p-6 bg-zinc-50/50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-xl shadow-lg hover:opacity-90 transition-all transition-all active:scale-95"
              >
                Apply Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
