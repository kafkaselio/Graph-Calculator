/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';
import { motion } from 'motion/react';
import { SimulationModel } from '../types';

interface ChartContainerProps {
  data: any[];
  model: SimulationModel;
  type?: 'line' | 'area' | 'bar' | 'scatter' | 'pie' | 'radar' | 'funnel' | 'jar';
  theme?: 'scientific' | 'academic' | 'presentation';
}

export function ChartContainer({ data, model, type, theme = 'scientific' }: ChartContainerProps) {
  const { chartConfig, equations } = model;
  const { xAxis, yAxes } = chartConfig;
  const activeType = type || chartConfig.type || 'line';

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    const colors = equations.reduce((acc, eq) => {
      acc[eq.outputName] = eq.color;
      return acc;
    }, {} as Record<string, string>);

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

    const formatTooltipValue = (val: number) => {
      if (typeof val !== 'number') return val;
      if (val === 0) return '0';
      const absVal = Math.abs(val);
      if (absVal < 0.001 || absVal > 100000) return val.toExponential(4);
      return val.toLocaleString(undefined, { maximumFractionDigits: 6 });
    };

    const axisProps = {
      tick: { fill: axisColor, fontSize: tickFontSize, fontFamily },
      axisLine: { stroke: axisColor, strokeWidth: isPresentation ? 2 : 1 },
      tickLine: { stroke: axisColor }
    };

    switch (activeType) {
      case 'pie': {
        const pieData = yAxes.map(name => ({
          name,
          value: data[data.length - 1]?.[name] || 0
        }));
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={isPresentation ? 40 : 60}
              outerRadius={isPresentation ? 120 : 100}
              paddingAngle={isPresentation ? 8 : 5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[entry.name]} />
              ))}
            </Pie>
            <Tooltip contentStyle={getTooltipStyle()} formatter={formatTooltipValue} />
            <Legend wrapperStyle={{ fontFamily, fontSize: tickFontSize }} />
          </PieChart>
        );
      }
      case 'radar': {
        const radarData = yAxes.map(name => ({
          subject: name,
          A: data[data.length - 1]?.[name] || 0,
          fullMark: 100,
        }));
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke={gridColor} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: axisColor, fontSize: tickFontSize, fontFamily }} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: axisColor, fontSize: tickFontSize - 2, fontFamily }} />
            <Radar
              name="Simulation"
              dataKey="A"
              stroke={equations[0]?.color || '#6366f1'}
              fill={equations[0]?.color || '#6366f1'}
              fillOpacity={0.6}
            />
            <Tooltip contentStyle={getTooltipStyle()} formatter={formatTooltipValue} />
          </RadarChart>
        );
      }
      case 'funnel': {
        const funnelData = yAxes.map(name => ({
          value: data[data.length - 1]?.[name] || 0,
          name: name,
          fill: colors[name]
        })).sort((a, b) => b.value - a.value);
        return (
          <FunnelChart>
            <Tooltip contentStyle={getTooltipStyle()} formatter={formatTooltipValue} />
            <Funnel
              dataKey="value"
              data={funnelData}
              isAnimationActive
            >
              <LabelList position="right" fill={axisColor} stroke="none" dataKey="name" style={{ fontFamily, fontSize: tickFontSize }} />
            </Funnel>
          </FunnelChart>
        );
      }
      case 'jar': {
        const value = data[data.length - 1]?.[yAxes[0]] || 0;
        const capacityVar = model.variables.find(v => v.name === 'cap' || v.name === 'capacity');
        const capacity = capacityVar ? capacityVar.value : 100;
        const percentage = Math.min(100, Math.max(0, (value / capacity) * 100));
        
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className={`relative w-32 h-48 border-4 border-zinc-300 dark:border-zinc-700 rounded-b-3xl rounded-t-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 ${isPresentation ? 'scale-110 shadow-xl' : ''}`}>
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${percentage}%` }}
                className={`${isAcademic ? 'bg-amber-500/60' : 'bg-sky-500/60'} backdrop-blur-sm`}
                transition={{ type: 'spring', stiffness: 50, damping: 15 }}
              >
                <div className={`absolute top-0 left-0 right-0 h-2 ${isAcademic ? 'bg-amber-400/80' : 'bg-sky-400/80'} animate-pulse`} />
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className={`text-lg font-bold text-zinc-800 dark:text-zinc-200 drop-shadow-md ${isPresentation ? 'text-2xl' : ''}`}>
                  {percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className={`text-sm font-medium text-zinc-500 ${isAcademic ? 'italic' : ''}`}>{yAxes[0]}</p>
              <p className={`text-xl font-bold text-zinc-900 dark:text-zinc-100 ${isPresentation ? 'text-3xl' : ''}`}>{value.toFixed(2)} {equations[0]?.unit}</p>
            </div>
          </div>
        );
      }
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray={isAcademic ? '0' : '3 3'} vertical={false} stroke={gridColor} />
            <XAxis dataKey={xAxis.label} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={getTooltipStyle()} formatter={formatTooltipValue} />
            <Legend wrapperStyle={{ fontFamily, fontSize: tickFontSize }} />
            {yAxes.map((yAxis) => (
              <Area
                key={yAxis}
                type={isAcademic ? 'step' : 'monotone'}
                dataKey={yAxis}
                stroke={colors[yAxis]}
                fill={colors[yAxis]}
                fillOpacity={isPresentation ? 0.3 : 0.1}
                strokeWidth={isPresentation ? 4 : 2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey={xAxis.label} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={getTooltipStyle()} formatter={formatTooltipValue} />
            <Legend wrapperStyle={{ fontFamily, fontSize: tickFontSize }} />
            {yAxes.map((yAxis) => (
              <Bar key={yAxis} dataKey={yAxis} fill={colors[yAxis]} radius={isPresentation ? [8, 8, 0, 0] : [4, 4, 0, 0]} />
            ))}
          </BarChart>
        );
      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={xAxis.label} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={getTooltipStyle()} formatter={formatTooltipValue} />
            <Legend wrapperStyle={{ fontFamily, fontSize: tickFontSize }} />
            {yAxes.map((yAxis) => (
              <Scatter key={yAxis} name={yAxis} dataKey={yAxis} fill={colors[yAxis]} line={isAcademic} />
            ))}
          </ScatterChart>
        );
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray={isAcademic ? '0' : '3 3'} vertical={false} stroke={gridColor} />
            <XAxis dataKey={xAxis.label} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={getTooltipStyle()} formatter={formatTooltipValue} />
            <Legend wrapperStyle={{ fontFamily, fontSize: tickFontSize }} />
            {yAxes.map((yAxis) => (
              <Line
                key={yAxis}
                type={isAcademic ? 'basis' : 'monotone'}
                dataKey={yAxis}
                stroke={colors[yAxis]}
                strokeWidth={isPresentation ? 4 : 2}
                dot={isPresentation}
                activeDot={{ r: isPresentation ? 8 : 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div className="w-full h-[400px] bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      {activeType === 'jar' ? (
        renderChart()
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      )}
    </div>
  );
}
