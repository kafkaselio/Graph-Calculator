/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Code, Table, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { SimulationResult, SimulationModel } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SimulationResult | null;
  model: SimulationModel;
}

export function ExportModal({ isOpen, onClose, result, model }: ExportModalProps) {
  const [format, setFormat] = useState<'csv' | 'json' | 'xlsx'>('csv');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [range, setRange] = useState({ start: 0, end: 100 });

  useEffect(() => {
    if (result && result.data.length > 0) {
      setSelectedColumns(Object.keys(result.data[0]));
      setRange({ start: 0, end: result.data.length - 1 });
    }
  }, [result]);

  if (!result || result.data.length === 0) return null;

  const allColumns = Object.keys(result.data[0]);

  const toggleColumn = (col: string) => {
    setSelectedColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const handleExport = () => {
    const slicedData = result.data.slice(range.start, range.end + 1);
    const filteredData = slicedData.map(row => {
      const newRow: any = {};
      selectedColumns.forEach(col => {
        newRow[col] = row[col];
      });
      return newRow;
    });

    const fileName = `${model.name.toLowerCase().replace(/\s+/g, '_')}_export`;

    if (format === 'csv') {
      const headers = selectedColumns.join(',');
      const rows = filteredData.map(row => selectedColumns.map(col => row[col]).join(',')).join('\n');
      const csv = `${headers}\n${rows}`;
      downloadFile(csv, `${fileName}.csv`, 'text/csv');
    } else if (format === 'json') {
      const json = JSON.stringify(filteredData, null, 2);
      downloadFile(json, `${fileName}.json`, 'application/json');
    } else if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Simulation Data");
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    }
    onClose();
  };

  const downloadFile = (content: string, name: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
          >
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-bold">Export Simulation Data</h3>
              <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-thin">
              {/* Format Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Export Format</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setFormat('csv')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      format === 'csv' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <FileText size={24} />
                    <span className="text-xs font-bold">CSV</span>
                  </button>
                  <button
                    onClick={() => setFormat('xlsx')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      format === 'xlsx' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Table size={24} />
                    <span className="text-xs font-bold">Excel</span>
                  </button>
                  <button
                    onClick={() => setFormat('json')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      format === 'json' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Code size={24} />
                    <span className="text-xs font-bold">JSON</span>
                  </button>
                </div>
              </div>

              {/* Column Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Select Variables</label>
                <div className="flex flex-wrap gap-2">
                  {allColumns.map(col => (
                    <button
                      key={col}
                      onClick={() => toggleColumn(col)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selectedColumns.includes(col)
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Range Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Data Range</label>
                  <span className="text-[10px] font-bold text-zinc-500">
                    {range.end - range.start + 1} points selected
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-400 font-bold">Start Index</span>
                    <input
                      type="number"
                      min={0}
                      max={range.end}
                      value={range.start}
                      onChange={(e) => setRange(prev => ({ ...prev, start: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-400 font-bold">End Index</span>
                    <input
                      type="number"
                      min={range.start}
                      max={result.data.length - 1}
                      value={range.end}
                      onChange={(e) => setRange(prev => ({ ...prev, end: Math.min(result.data.length - 1, parseInt(e.target.value) || 0) }))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-3">
                  <Filter size={16} className="text-indigo-600 mt-0.5" />
                  <p className="text-[10px] text-indigo-700 dark:text-indigo-300 leading-relaxed">
                    Total available data points: {result.data.length}. You can export a specific segment of the simulation results.
                  </p>
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
                onClick={handleExport}
                disabled={selectedColumns.length === 0 || range.start > range.end}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
              >
                <Download size={18} />
                <span>Export Data</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
