/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, X, Brain, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { SimulationModel } from '../types';

interface AIAssistantProps {
  model: SimulationModel;
}

export function AIAssistant({ model }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const explainModel = async () => {
    setLoading(true);
    setIsOpen(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Explain the following scientific model in simple terms for a student. 
        Model Name: ${model.name}
        Description: ${model.description}
        Variables: ${model.variables.map(v => `${v.label} (${v.name})`).join(', ')}
        Equations: ${model.equations.map(eq => `${eq.outputName}: ${eq.expression}`).join(', ')}
        
        Provide a concise explanation of how the variables interact and what the outputs represent.`,
      });
      setExplanation(response.text || 'No explanation available.');
    } catch (error) {
      console.error('AI Error:', error);
      setExplanation('Sorry, I could not generate an explanation at this time.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={explainModel}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-accent hover:opacity-90 text-white rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
      >
        <Sparkles size={14} />
        <span>AI Explain</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-accent/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="text-accent" size={18} />
                <h3 className="font-bold text-sm">AI Model Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/50 dark:hover:bg-zinc-800/50 rounded-lg">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 max-h-[400px] overflow-y-auto scrollbar-thin">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-400">
                  <Loader2 className="animate-spin" size={24} />
                  <p className="text-xs font-medium">Analyzing model...</p>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert">
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                    {explanation}
                  </p>
                </div>
              )}
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-[10px] font-bold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
