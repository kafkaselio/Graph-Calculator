/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Beaker, 
  Settings2, 
  LineChart as ChartIcon, 
  Save, 
  Share2, 
  Download, 
  Plus, 
  Trash2, 
  Play, 
  History,
  RotateCcw,
  RefreshCw,
  LayoutDashboard,
  Layers,
  ChevronRight,
  Menu,
  X,
  Copy,
  Check,
  ExternalLink,
  Undo,
  Redo,
  Palette,
  Bookmark,
  BookmarkPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TEMPLATES } from './lib/templates';
import { runSimulation } from './lib/simulationEngine';
import { useHistory } from './lib/useHistory';
import { SimulationModel, SimulationResult, Variable, Equation, Scenario, VariablePreset } from './types';
import { VariableControl } from './components/VariableControl';
import { EquationEditor } from './components/EquationEditor';
import { MetricCard } from './components/MetricCard';
import { ChartContainer } from './components/ChartContainer';
import { AIAssistant } from './components/AIAssistant';
import { ScenarioModal } from './components/ScenarioModal';
import { ExportModal } from './components/ExportModal';
import { ComparisonChart } from './components/ComparisonChart';
import { ThemeModal } from './components/ThemeModal';
import { ThemeConfig } from './types';

const DEFAULT_THEME_CONFIG: ThemeConfig = {
  base: 'scientific',
  accentColor: '#6366f1',
  fontSans: 'Inter',
  fontMono: 'JetBrains Mono',
  fontSerif: 'Playfair Display',
  fontDisplay: 'Outfit',
  spacing: 'comfortable',
  borderRadius: 'md',
  glassmorphism: false
};

export default function App() {
  const initialModel = useMemo(() => {
    const saved = localStorage.getItem('scidash_active_model');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return TEMPLATES[0]; }
    }
    return TEMPLATES[0];
  }, []);

  const { 
    state: activeModel, 
    setState: setActiveModel, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory<SimulationModel>(initialModel);

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'scatter'>('line');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [history, setHistory] = useState<{ name: string; model: SimulationModel; timestamp: number }[]>(() => {
    const saved = localStorage.getItem('scidash_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [comparisonOutput, setComparisonOutput] = useState<string>('');
  const [isRunningAll, setIsRunningAll] = useState(false);

  // Initialize comparison output if not set
  useEffect(() => {
    if (activeModel.equations.length > 0 && !comparisonOutput) {
      setComparisonOutput(activeModel.equations[0].outputName);
    }
  }, [activeModel.equations, comparisonOutput]);

  const variableNames = useMemo(() => activeModel.variables.map(v => v.name), [activeModel.variables]);

  const scenarioResults = useMemo(() => {
    if (!activeModel.scenarios) return [];
    return activeModel.scenarios.map(scenario => {
      const tempModel: SimulationModel = {
        ...activeModel,
        variables: activeModel.variables.map(v => ({
          ...v,
          value: scenario.variableValues[v.id] ?? v.value
        }))
      };
      return {
        ...scenario,
        result: runSimulation(tempModel)
      };
    });
  }, [activeModel]);

  // Run simulation whenever model changes
  useEffect(() => {
    const result = runSimulation(activeModel);
    setSimulationResult(result);
    localStorage.setItem('scidash_active_model', JSON.stringify(activeModel));
  }, [activeModel]);

  useEffect(() => {
    localStorage.setItem('scidash_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleVariableChange = useCallback((id: string, value: number) => {
    setActiveModel(prev => ({
      ...prev,
      variables: prev.variables.map(v => v.id === id ? { ...v, value } : v)
    }));
  }, []);

  const handleVariableToggleLock = useCallback((id: string) => {
    setActiveModel(prev => ({
      ...prev,
      variables: prev.variables.map(v => v.id === id ? { ...v, isLocked: !v.isLocked } : v)
    }));
  }, []);

  const handleVariableUpdateMetadata = useCallback((id: string, updates: Partial<Variable>) => {
    setActiveModel(prev => ({
      ...prev,
      variables: prev.variables.map(v => v.id === id ? { ...v, ...updates } : v)
    }));
  }, []);

  const handleVariableRandomize = useCallback((id: string) => {
    setActiveModel(prev => ({
      ...prev,
      variables: prev.variables.map(v => {
        if (v.id === id) {
          const rMin = v.randomMin ?? v.min;
          const rMax = v.randomMax ?? v.max;
          const range = rMax - rMin;
          const randomValue = rMin + Math.random() * range;
          // Clamp to variable absolute bounds
          const clampedValue = Math.max(v.min, Math.min(v.max, randomValue));
          return { ...v, value: Number(clampedValue.toFixed(2)) };
        }
        return v;
      })
    }));
  }, []);

  const handleAddVariable = useCallback(() => {
    const name = prompt("Variable name (e.g. 'z'):");
    if (!name) return;
    const newVar: Variable = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      label: name.toUpperCase(),
      value: 1,
      min: 0,
      max: 100,
      step: 1,
      unit: ''
    };
    setActiveModel(prev => ({ ...prev, variables: [...prev.variables, newVar] }));
  }, []);

  const handleRemoveVariable = useCallback((id: string) => {
    setActiveModel(prev => ({ ...prev, variables: prev.variables.filter(v => v.id !== id) }));
  }, []);

  const handleEquationUpdate = useCallback((id: string, updates: Partial<Equation>) => {
    setActiveModel(prev => {
      const isExpressionUpdate = updates.expression !== undefined;
      const existingEq = prev.equations.find(eq => eq.id === id);
      
      // Prevent redundant updates if expression hasn't changed
      if (isExpressionUpdate && existingEq && existingEq.expression === updates.expression) {
        return prev;
      }

      return {
        ...prev,
        equations: prev.equations.map(eq => eq.id === id ? { ...eq, ...updates } : eq)
      };
    });
  }, []);

  const handleAddEquation = useCallback(() => {
    const name = prompt("Output name (e.g. 'Velocity'):");
    if (!name) return;
    const newEq: Equation = {
      id: Math.random().toString(36).substr(2, 9),
      expression: '0',
      outputName: name,
      unit: '',
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };
    setActiveModel(prev => ({ ...prev, equations: [...prev.equations, newEq] }));
  }, []);

  const handleRemoveEquation = useCallback((id: string) => {
    setActiveModel(prev => ({ ...prev, equations: prev.equations.filter(eq => eq.id !== id) }));
  }, []);

  const handleResetModel = useCallback(() => {
    const template = TEMPLATES.find(t => t.id === activeModel.id);
    if (template) {
      setActiveModel(JSON.parse(JSON.stringify(template)));
    }
  }, [activeModel.id]);

  const handleAddScenario = useCallback(() => {
    const name = prompt("Scenario name (e.g. 'High Pressure'):");
    if (!name) return;
    const variableValues: Record<string, number> = {};
    activeModel.variables.forEach(v => {
      variableValues[v.id] = v.value;
    });
    const newScenario: Scenario = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      variableValues
    };
    setActiveModel(prev => ({
      ...prev,
      scenarios: [...(prev.scenarios || []), newScenario]
    }));
    setIsComparisonMode(true);
  }, [activeModel.variables, activeModel.scenarios]);

  const handleUpdateTheme = useCallback((updates: Partial<ThemeConfig>) => {
    setActiveModel(prev => ({
      ...prev,
      themeConfig: {
        ...(prev.themeConfig || DEFAULT_THEME_CONFIG),
        ...updates
      }
    }));
  }, []);

  const themeConfig = activeModel.themeConfig || DEFAULT_THEME_CONFIG;
  const theme = themeConfig.base;

  const handleRemoveScenario = useCallback((id: string) => {
    setActiveModel(prev => ({
      ...prev,
      scenarios: (prev.scenarios || []).filter(s => s.id !== id)
    }));
  }, []);

  const handleAddPreset = useCallback(() => {
    const name = prompt("Preset name (e.g. 'Optimized State'):");
    if (!name) return;
    
    const variableValues: Record<string, number> = {};
    activeModel.variables.forEach(v => {
      variableValues[v.id] = v.value;
    });
    
    const newPreset: VariablePreset = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      variableValues
    };
    
    setActiveModel(prev => ({
      ...prev,
      presets: [...(prev.presets || []), newPreset]
    }));
  }, [activeModel.variables]);

  const handleRemovePreset = useCallback((id: string) => {
    setActiveModel(prev => ({
      ...prev,
      presets: (prev.presets || []).filter(p => p.id !== id)
    }));
  }, []);

  const handleUpdateScenarioVariable = useCallback((scenarioId: string, variableId: string, value: number) => {
    setActiveModel(prev => ({
      ...prev,
      scenarios: (prev.scenarios || []).map(s => 
        s.id === scenarioId 
          ? { ...s, variableValues: { ...s.variableValues, [variableId]: value } }
          : s
      )
    }));
  }, []);

  const handleApplyPresetToScenario = useCallback((scenarioId: string, preset: VariablePreset) => {
    setActiveModel(prev => ({
      ...prev,
      scenarios: (prev.scenarios || []).map(s => 
        s.id === scenarioId 
          ? { ...s, variableValues: { ...preset.variableValues } }
          : s
      )
    }));
  }, []);

  const handleApplyPresetToModel = useCallback((preset: VariablePreset) => {
    setActiveModel(prev => ({
      ...prev,
      variables: prev.variables.map(v => ({
        ...v,
        value: preset.variableValues[v.id] ?? v.value
      }))
    }));
  }, []);

  const handleRunAllScenarios = useCallback(() => {
    if (!activeModel.scenarios || activeModel.scenarios.length === 0) return;
    
    setIsRunningAll(true);
    // Even though it's instant, we provide visual feedback
    setTimeout(() => {
      setIsRunningAll(false);
    }, 800);
  }, [activeModel.scenarios]);

  const handleUpdateScenario = useCallback((id: string, updates: Partial<Scenario>) => {
    setActiveModel(prev => ({
      ...prev,
      scenarios: (prev.scenarios || []).map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  }, []);

  const handleSaveSimulation = () => {
    const name = prompt("Enter a name for this simulation:", activeModel.name);
    if (name) {
      setHistory(prev => [{ name, model: JSON.parse(JSON.stringify(activeModel)), timestamp: Date.now() }, ...prev]);
    }
  };

  const handleExportData = () => {
    setIsExportModalOpen(true);
  };

  const handleCopyLaTeX = () => {
    const latex = activeModel.equations.map(eq => `${eq.outputName} = ${eq.expression}`).join('\n');
    navigator.clipboard.writeText(latex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getThemeClasses = () => {
    const baseClasses = {
      academic: 'font-serif',
      presentation: 'font-display',
      scientific: 'font-sans'
    }[themeConfig.base];

    const spacingClasses = {
      compact: 'theme-spacing-compact',
      comfortable: 'theme-spacing-comfortable',
      spacious: 'theme-spacing-spacious'
    }[themeConfig.spacing];

    return `${baseClasses} ${spacingClasses} ${themeConfig.glassmorphism ? 'theme-glass' : ''} transition-all duration-300`;
  };

  const getRadiusValue = (radius: ThemeConfig['borderRadius']) => {
    return {
      none: '0px',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '20px',
      full: '9999px'
    }[radius];
  };

  return (
    <div 
      className={`min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex overflow-hidden ${getThemeClasses()}`}
      data-theme={theme}
      style={{
        '--accent-color': themeConfig.accentColor,
        '--radius-base': getRadiusValue(themeConfig.borderRadius),
        '--font-sans': themeConfig.fontSans,
        '--font-mono': themeConfig.fontMono,
        '--font-serif': themeConfig.fontSerif,
        '--font-display': themeConfig.fontDisplay,
      } as React.CSSProperties}
    >
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 360, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-screen border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col flex-shrink-0 z-20 theme-glass"
          >
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <Beaker className="text-white" size={20} />
                </div>
                <h1 className="font-bold text-xl tracking-tight">SciDash</h1>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg lg:hidden">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-sidebar space-y-8 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
              {/* Model Selector */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    <Layers size={14} />
                    <span>Simulation Model</span>
                  </div>
                  <button 
                    onClick={handleResetModel}
                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-600 transition-colors"
                    title="Reset to Default"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setActiveModel(template)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        activeModel.id === template.id
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-semibold text-sm">{template.name}</div>
                      <div className="text-xs opacity-70 line-clamp-1">{template.description}</div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Variable Controls */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    <Settings2 size={14} />
                    <span>Variables</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={handleAddPreset}
                      className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-accent transition-colors"
                      title="Save Current as Preset"
                    >
                      <BookmarkPlus size={14} />
                    </button>
                    <button 
                      onClick={handleAddVariable}
                      className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-accent"
                      title="Add Variable"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                
                {/* Global Presets Quick-select */}
                {activeModel.presets && activeModel.presets.length > 0 && (
                  <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
                    {activeModel.presets.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => handleApplyPresetToModel(preset)}
                        className="flex-shrink-0 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-accent/10 border border-zinc-200 dark:border-zinc-700 rounded-full text-[10px] font-bold text-zinc-500 hover:text-accent transition-colors group relative"
                      >
                        {preset.name}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePreset(preset.id);
                          }}
                          className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={8} />
                        </button>
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  {activeModel.variables.map((v) => (
                    <div key={v.id} className="relative group">
                      <VariableControl
                        variable={v}
                        onChange={handleVariableChange}
                        onUpdateMetadata={handleVariableUpdateMetadata}
                        onToggleLock={handleVariableToggleLock}
                        onRandomize={handleVariableRandomize}
                      />
                      <button 
                        onClick={() => handleRemoveVariable(v.id)}
                        className="absolute -top-1 -right-1 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Equation Editor */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    <Beaker size={14} />
                    <span>Equations</span>
                  </div>
                  <button 
                    onClick={handleAddEquation}
                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-indigo-600"
                    title="Add Equation"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {activeModel.equations.map((eq) => (
                    <div key={eq.id} className="relative group">
                      <EquationEditor
                        equation={eq}
                        variables={variableNames}
                        onUpdate={handleEquationUpdate}
                      />
                      <button 
                        onClick={() => handleRemoveEquation(eq.id)}
                        className="absolute -top-1 -right-1 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                <Menu size={20} />
              </button>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-lg">{activeModel.name}</h2>
                <AIAssistant model={activeModel} />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Live Simulation Environment</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 mr-2">
              <button 
                onClick={() => setIsThemeModalOpen(true)}
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded transition-all text-zinc-600 dark:text-zinc-400 mr-1"
                title="Customize Theme"
              >
                <Palette size={16} />
              </button>
              <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700 mr-1" />
              <button 
                onClick={undo}
                disabled={!canUndo}
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent rounded transition-all text-zinc-600 dark:text-zinc-400"
                title="Undo (Ctrl+Z)"
              >
                <Undo size={16} />
              </button>
              <button 
                onClick={redo}
                disabled={!canRedo}
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent rounded transition-all text-zinc-600 dark:text-zinc-400"
                title="Redo (Ctrl+Y)"
              >
                <Redo size={16} />
              </button>
            </div>
            <button 
              onClick={handleSaveSimulation}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-accent hover:opacity-90 text-white rounded-lg transition-colors shadow-sm"
            >
              <Save size={16} />
              <span className="hidden sm:inline">Save</span>
            </button>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400"
              title="History"
            >
              <History size={20} />
            </button>
            <button 
              onClick={handleExportData}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400"
              title="Export Data"
            >
              <Download size={20} />
            </button>
            <button 
              onClick={handleCopyLaTeX}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 relative"
              title="Copy LaTeX"
            >
              {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
            </button>
          </div>
        </header>

        {/* Dashboard Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {simulationResult?.metrics.map((metric, idx) => (
              <MetricCard
                key={idx}
                name={metric.name}
                value={metric.value}
                unit={metric.unit}
                color={metric.color}
                error={metric.error}
              />
            ))}
          </div>

          {/* Chart Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                <ChartIcon size={14} />
                <span>Visualizations</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                {(['line', 'area', 'bar', 'scatter', 'pie', 'radar', 'funnel', 'jar'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setChartType(t)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all capitalize ${
                      chartType === t
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            
            {isComparisonMode && activeModel.scenarios && activeModel.scenarios.length > 0 ? (
              <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ChartIcon size={18} className="text-indigo-600" />
                      <h3 className="font-bold">Scenario Comparison Analysis</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Compare Output:</span>
                      <select 
                        value={comparisonOutput}
                        onChange={(e) => setComparisonOutput(e.target.value)}
                        className="text-xs font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                      >
                        {activeModel.equations.map(eq => (
                          <option key={eq.id} value={eq.outputName}>{eq.outputName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <ComparisonChart 
                    scenarios={scenarioResults as any}
                    model={activeModel}
                    outputName={comparisonOutput || activeModel.equations[0]?.outputName}
                    theme={theme}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {scenarioResults.map((scenario) => (
                  <div key={scenario.id} className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-indigo-600">{scenario.name}</h4>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setEditingScenarioId(scenario.id)}
                          className="p-1 text-zinc-400 hover:text-indigo-600 transition-colors"
                          title="Edit Scenario"
                        >
                          <Settings2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleRemoveScenario(scenario.id)}
                          className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                          title="Remove Scenario"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {activeModel.variables.map(v => (
                        <div key={v.id} className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">{v.label}</label>
                          <input 
                            type="number"
                            value={scenario.variableValues[v.id] ?? v.value}
                            onChange={(e) => handleUpdateScenarioVariable(scenario.id, v.id, Number(e.target.value))}
                            className="text-xs p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                      ))}
                    </div>
                    {scenario.result && (
                      <div className="h-64">
                        <ChartContainer
                          data={scenario.result.data}
                          model={activeModel}
                          type={chartType}
                          theme={theme}
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {scenario.result?.metrics.slice(0, 2).map((m, i) => (
                        <div key={i} className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">
                          <div className="text-[10px] text-zinc-400">{m.name}</div>
                          <div className="text-sm font-bold" style={{ color: m.color }}>{m.value.toFixed(2)} {m.unit}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button 
                  onClick={handleAddScenario}
                  className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-900 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 transition-all group"
                >
                  <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors">
                    <Plus className="text-zinc-400 group-hover:text-indigo-600" />
                  </div>
                  <span className="text-sm font-bold text-zinc-400 group-hover:text-indigo-600">Add Comparison Scenario</span>
                </button>
              </div>
            </div>
          ) : (
              simulationResult && (
                <ChartContainer
                  data={simulationResult.data}
                  model={activeModel}
                  type={chartType}
                  theme={theme}
                />
              )
            )}
          </div>

          {/* Model Testing / Comparison */}
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-indigo-600" />
                <h3 className="font-bold">Model Testing & Comparison</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsComparisonMode(!isComparisonMode)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    isComparisonMode 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {isComparisonMode ? 'Disable Comparison' : 'Enable Comparison Mode'}
                </button>
                {isComparisonMode && (
                  <button 
                    onClick={handleRunAllScenarios}
                    disabled={isRunningAll || !activeModel.scenarios?.length}
                    className="flex items-center gap-2 px-3 py-1 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-all"
                    title="Run All Scenarios"
                  >
                    <RefreshCw size={14} className={isRunningAll ? 'animate-spin' : ''} />
                    <span>Run All</span>
                  </button>
                )}
                <button 
                  onClick={handleAddScenario}
                  className="p-1.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
                  title="Add Scenario"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div className="p-6">
              {!isComparisonMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Model Description</h4>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                      {activeModel.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeModel.variables.map(v => (
                        <div key={v.id} className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] font-mono">
                          {v.name}: {v.value}{v.unit}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-all group">
                        <Share2 size={16} className="text-zinc-400 group-hover:text-indigo-600" />
                        <span className="text-xs font-semibold">Share Embed</span>
                      </button>
                      <button className="flex items-center justify-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-all group">
                        <ExternalLink size={16} className="text-zinc-400 group-hover:text-indigo-600" />
                        <span className="text-xs font-semibold">Notion Widget</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Active Scenarios</h4>
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                      {activeModel.scenarios?.length || 0} Scenarios
                    </span>
                  </div>
                  
                  {(!activeModel.scenarios || activeModel.scenarios.length === 0) ? (
                    <div className="text-center py-12 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                      <Layers size={32} className="mx-auto mb-3 text-zinc-200" />
                      <p className="text-sm text-zinc-500">No scenarios defined yet. Add one to start comparing.</p>
                      <button 
                        onClick={handleAddScenario}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
                      >
                        Create First Scenario
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto pb-4 scrollbar-thin">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-100 dark:border-zinc-800">
                            <th className="py-3 px-4 text-[10px] font-bold text-zinc-400 uppercase">Variable</th>
                            {activeModel.scenarios.map(s => (
                              <th key={s.id} className="py-3 px-4 text-center min-w-[120px]">
                                <button 
                                  onClick={() => setEditingScenarioId(s.id)}
                                  className="text-[10px] font-bold text-indigo-600 uppercase hover:underline"
                                >
                                  {s.name}
                                </button>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {activeModel.variables.map(v => (
                            <tr key={v.id} className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                              <td className="py-3 px-4">
                                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{v.label}</span>
                                <span className="text-[10px] text-zinc-400 ml-1">({v.unit})</span>
                              </td>
                              {activeModel.scenarios?.map(s => (
                                <td key={s.id} className="py-2 px-4">
                                  <input 
                                    type="number"
                                    value={s.variableValues[v.id] ?? v.value}
                                    onChange={(e) => handleUpdateScenarioVariable(s.id, v.id, Number(e.target.value))}
                                    className="w-full text-center text-xs p-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                          <tr className="bg-indigo-50/30 dark:bg-indigo-950/10">
                            <td className="py-4 px-4 font-bold text-xs text-indigo-600">Primary Result</td>
                            {scenarioResults.map(s => (
                              <td key={s.id} className="py-4 px-4 text-center">
                                <span className="text-sm font-black text-indigo-600">
                                  {s.result?.metrics[0]?.value.toFixed(2)} {s.result?.metrics[0]?.unit}
                                </span>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* History Overlay */}
        <ThemeModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
          config={themeConfig}
          onChange={handleUpdateTheme}
        />
        <ScenarioModal
          isOpen={!!editingScenarioId}
          onClose={() => setEditingScenarioId(null)}
          scenario={activeModel.scenarios?.find(s => s.id === editingScenarioId) || null}
          variables={activeModel.variables}
          presets={activeModel.presets || []}
          onSave={handleUpdateScenario}
          onSavePreset={(preset) => {
            const newPreset: VariablePreset = {
              id: Math.random().toString(36).substr(2, 9),
              ...preset
            };
            setActiveModel(prev => ({
              ...prev,
              presets: [...(prev.presets || []), newPreset]
            }));
          }}
        />
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          result={simulationResult}
          model={activeModel}
        />
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute inset-y-0 right-0 w-80 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-30 flex flex-col"
            >
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History size={20} className="text-indigo-600" />
                  <h3 className="font-bold">Saved Simulations</h3>
                </div>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-zinc-400">
                    <History size={40} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm">No saved simulations yet.</p>
                  </div>
                ) : (
                  history.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-900 transition-all group relative cursor-pointer"
                      onClick={() => {
                        setActiveModel(item.model);
                        setShowHistory(false);
                      }}
                    >
                      <div className="font-semibold text-sm">{item.name}</div>
                      <div className="text-[10px] text-zinc-400 mt-1">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setHistory(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-2 right-2 p-1.5 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
