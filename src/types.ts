/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Variable {
  id: string;
  name: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  isLocked?: boolean;
  randomMin?: number;
  randomMax?: number;
}

export interface Equation {
  id: string;
  expression: string;
  outputName: string;
  unit: string;
  color: string;
}

export interface Scenario {
  id: string;
  name: string;
  variableValues: Record<string, number>; // variableId -> value
  result?: SimulationResult;
}

export interface VariablePreset {
  id: string;
  name: string;
  variableValues: Record<string, number>; // variableId -> value
}

export interface ThemeConfig {
  base: 'scientific' | 'academic' | 'presentation';
  accentColor: string;
  fontSans: string;
  fontMono: string;
  fontSerif: string;
  fontDisplay: string;
  spacing: 'compact' | 'comfortable' | 'spacious';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  glassmorphism: boolean;
}

export interface SimulationModel {
  id: string;
  name: string;
  description: string;
  variables: Variable[];
  equations: Equation[];
  chartConfig: {
    type: 'line' | 'area' | 'bar' | 'scatter' | 'pie' | 'radar' | 'funnel' | 'jar';
    xAxis: {
      variableId: string;
      label: string;
      min?: number;
      max?: number;
      points?: number;
    };
    yAxes: string[]; // output names
  };
  scenarios?: Scenario[];
  presets?: VariablePreset[];
  themeConfig?: ThemeConfig;
}

export interface SimulationResult {
  data: any[];
  metrics: {
    name: string;
    value: number;
    unit: string;
    color: string;
    error?: string;
  }[];
}
