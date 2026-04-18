/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { SimulationModel, Scenario } from '../types';

interface ComparisonChartProps {
  scenarios: (Scenario & { result: any })[];
  model: SimulationModel;
  outputName: string;
  theme?: 'scientific' | 'academic' | 'presentation';
}

export function ComparisonChart({ scenarios, model, outputName, theme = 'scientific' }: ComparisonChartProps) {
  const xAxisConfig = model.chartConfig.xAxis;
  
  // Merge data from all scenarios for the chart
  const mergedData = useMemo(() => {
    if (!scenarios.length || !scenarios[0].result?.data) return [];
    
    const baseData = scenarios[0].result.data;
    return baseData.map((point: any, index: number) => {
      const mergedPoint: any = { [xAxisConfig.label]: point[xAxisConfig.label] };
      scenarios.forEach(scenario => {
        if (scenario.result?.data?.[index]) {
          mergedPoint[`${scenario.name}_${outputName}`] = scenario.result.data[index][outputName];
        }
      });
      return mergedPoint;
    });
  }, [scenarios, outputName, xAxisConfig.label]);

  const isAcademic = theme === 'academic';
  const isPresentation = theme === 'presentation';

  const gridColor = isPresentation ? '#e2e8f0' : isAcademic ? '#d1d5db' : '#f1f5f9';
  const axisColor = isPresentation ? '#1e293b' : isAcademic ? '#4b5563' : '#94a3b8';
  const tickFontSize = isPresentation ? 14 : isAcademic ? 11 : 12;
  const fontFamily = isPresentation ? 'Outfit' : isAcademic ? 'Playfair Display' : 'Inter';

  const getTooltipStyle = () => ({
    backgroundColor: theme === 'academic' ? '#fdfbf7' : '#fff',
    borderRadius: isPresentation ? '16px' : '8px',
    border: `1px solid ${isAcademic ? '#d4d4d8' : '#e2e8f0'}`,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    fontFamily
  });

  const axisProps = {
    tick: { fill: axisColor, fontSize: tickFontSize, fontFamily },
    axisLine: { stroke: axisColor, strokeWidth: isPresentation ? 2 : 1 },
    tickLine: { stroke: axisColor }
  };

  const formatTooltipValue = (val: number) => {
    if (typeof val !== 'number') return val;
    if (val === 0) return '0';
    const absVal = Math.abs(val);
    if (absVal < 0.001 || absVal > 100000) return val.toExponential(4);
    return val.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  // Generate colors for scenarios
  const scenarioColors = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  return (
    <div className="w-full h-[400px] bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
          Cross-Scenario Comparison: <span className="text-indigo-600">{outputName}</span>
        </h3>
      </div>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mergedData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray={isAcademic ? '0' : '3 3'} vertical={false} stroke={gridColor} />
            <XAxis dataKey={xAxisConfig.label} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={getTooltipStyle()} formatter={formatTooltipValue} />
            <Legend wrapperStyle={{ fontFamily, fontSize: tickFontSize, paddingTop: '10px' }} />
            {scenarios.map((scenario, index) => (
              <Line
                key={scenario.id}
                type={isAcademic ? 'basis' : 'monotone'}
                name={scenario.name}
                dataKey={`${scenario.name}_${outputName}`}
                stroke={scenarioColors[index % scenarioColors.length]}
                strokeWidth={isPresentation ? 4 : 2}
                dot={isPresentation}
                activeDot={{ r: isPresentation ? 8 : 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
