/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SimulationModel } from '../types';

export const TEMPLATES: SimulationModel[] = [
  {
    id: 'hookes-law',
    name: "Hooke's Law",
    description: "The force needed to extend or compress a spring by some distance is proportional to that distance.",
    variables: [
      { id: 'k', name: 'k', label: 'Spring Constant', value: 10, min: 1, max: 100, step: 1, unit: 'N/m' },
      { id: 'x', name: 'x', label: 'Displacement', value: 0.5, min: 0, max: 2, step: 0.01, unit: 'm' },
    ],
    equations: [
      { id: 'f', expression: 'k * x', outputName: 'Force', unit: 'N', color: '#ef4444' },
      { id: 'pe', expression: '0.5 * k * x^2', outputName: 'Potential Energy', unit: 'J', color: '#3b82f6' },
    ],
    chartConfig: {
      type: 'line',
      xAxis: { variableId: 'x', label: 'Displacement (m)', min: 0, max: 2, points: 50 },
      yAxes: ['Force', 'Potential Energy'],
    }
  },
  {
    id: 'thin-lens',
    name: 'Thin Lens Equation',
    description: 'Relates the focal length of a lens to the object and image distances.',
    variables: [
      { id: 'f', name: 'f', label: 'Focal Length', value: 10, min: 1, max: 50, step: 1, unit: 'cm' },
      { id: 'do', name: 'do', label: 'Object Distance', value: 25, min: 11, max: 100, step: 1, unit: 'cm' },
    ],
    equations: [
      { id: 'di', expression: '1 / (1/f - 1/do)', outputName: 'Image Distance', unit: 'cm', color: '#10b981' },
      { id: 'm', expression: '-(1 / (1/f - 1/do)) / do', outputName: 'Magnification', unit: '', color: '#f59e0b' },
    ],
    chartConfig: {
      type: 'line',
      xAxis: { variableId: 'do', label: 'Object Distance (cm)', min: 11, max: 100, points: 50 },
      yAxes: ['Image Distance'],
    }
  },
  {
    id: 'compound-interest',
    name: 'Compound Interest',
    description: 'The interest on a loan or deposit calculated based on both the initial principal and the accumulated interest.',
    variables: [
      { id: 'P', name: 'P', label: 'Principal', value: 1000, min: 100, max: 10000, step: 100, unit: '$' },
      { id: 'r', name: 'r', label: 'Annual Rate', value: 0.05, min: 0.01, max: 0.2, step: 0.01, unit: '%' },
      { id: 'n', name: 'n', label: 'Compounding Periods', value: 12, min: 1, max: 365, step: 1, unit: '/yr' },
      { id: 't', name: 't', label: 'Time', value: 10, min: 1, max: 50, step: 1, unit: 'yr' },
    ],
    equations: [
      { id: 'A', expression: 'P * (1 + r/n)^(n * t)', outputName: 'Total Amount', unit: '$', color: '#8b5cf6' },
      { id: 'I', expression: 'P * (1 + r/n)^(n * t) - P', outputName: 'Total Interest', unit: '$', color: '#ec4899' },
    ],
    chartConfig: {
      type: 'area',
      xAxis: { variableId: 't', label: 'Time (yr)', min: 0, max: 50, points: 50 },
      yAxes: ['Total Amount', 'Total Interest'],
    }
  },
  {
    id: 'projectile-motion',
    name: 'Projectile Motion',
    description: 'The motion of an object thrown or projected into the air, subject only to the acceleration of gravity.',
    variables: [
      { id: 'v0', name: 'v0', label: 'Initial Velocity', value: 20, min: 1, max: 100, step: 1, unit: 'm/s' },
      { id: 'theta', name: 'theta', label: 'Launch Angle', value: 45, min: 0, max: 90, step: 1, unit: 'deg' },
      { id: 'g', name: 'g', label: 'Gravity', value: 9.81, min: 1, max: 20, step: 0.01, unit: 'm/s²' },
    ],
    equations: [
      { id: 'R', expression: '(v0^2 * sin(2 * theta * pi / 180)) / g', outputName: 'Range', unit: 'm', color: '#ef4444' },
      { id: 'H', expression: '(v0^2 * sin(theta * pi / 180)^2) / (2 * g)', outputName: 'Max Height', unit: 'm', color: '#3b82f6' },
      { id: 'T', expression: '(2 * v0 * sin(theta * pi / 180)) / g', outputName: 'Total Time', unit: 's', color: '#10b981' },
    ],
    chartConfig: {
      type: 'scatter',
      xAxis: { variableId: 'theta', label: 'Angle (deg)', min: 0, max: 90, points: 50 },
      yAxes: ['Range', 'Max Height'],
    }
  },
  {
    id: 'population-dynamics',
    name: 'Population Dynamics',
    description: 'Simulates population distribution between different groups over time.',
    variables: [
      { id: 'total', name: 'total', label: 'Total Population', value: 1000, min: 100, max: 10000, step: 100, unit: '' },
      { id: 'growth', name: 'growth', label: 'Growth Rate', value: 0.02, min: -0.1, max: 0.1, step: 0.001, unit: '' },
      { id: 'urban', name: 'urban', label: 'Urban %', value: 60, min: 0, max: 100, step: 1, unit: '%' },
    ],
    equations: [
      { id: 'u', expression: 'total * (urban / 100)', outputName: 'Urban Population', unit: '', color: '#3b82f6' },
      { id: 'r', expression: 'total * (1 - urban / 100)', outputName: 'Rural Population', unit: '', color: '#10b981' },
    ],
    chartConfig: {
      type: 'pie',
      xAxis: { variableId: 'total', label: 'Total', min: 0, max: 10000, points: 1 },
      yAxes: ['Urban Population', 'Rural Population'],
    }
  },
  {
    id: 'water-tank',
    name: 'Water Tank Simulation',
    description: 'Visualizes the water level in a container based on flow rates.',
    variables: [
      { id: 'in', name: 'in', label: 'Inflow', value: 10, min: 0, max: 50, step: 1, unit: 'L/s' },
      { id: 'out', name: 'out', label: 'Outflow', value: 5, min: 0, max: 50, step: 1, unit: 'L/s' },
      { id: 'time', name: 'time', label: 'Time', value: 20, min: 0, max: 100, step: 1, unit: 's' },
      { id: 'cap', name: 'cap', label: 'Capacity', value: 1000, min: 100, max: 5000, step: 100, unit: 'L' },
    ],
    equations: [
      { id: 'lvl', expression: 'min(cap, max(0, (in - out) * time))', outputName: 'Water Level', unit: 'L', color: '#0ea5e9' },
    ],
    chartConfig: {
      type: 'jar',
      xAxis: { variableId: 'time', label: 'Time', min: 0, max: 100, points: 50 },
      yAxes: ['Water Level'],
    }
  },
  {
    id: 'custom-model',
    name: 'Custom Model',
    description: 'Build your own mathematical model from scratch.',
    variables: [
      { id: 'x', name: 'x', label: 'Input X', value: 1, min: 0, max: 10, step: 0.1, unit: '' },
      { id: 'y', name: 'y', label: 'Input Y', value: 2, min: 0, max: 10, step: 0.1, unit: '' },
    ],
    equations: [
      { id: 'out', expression: 'x + y', outputName: 'Result', unit: '', color: '#6366f1' },
    ],
    chartConfig: {
      type: 'line',
      xAxis: { variableId: 'x', label: 'Input X', min: 0, max: 10, points: 50 },
      yAxes: ['Result'],
    }
  },
  {
    id: 'ohms-law',
    name: "Ohm's Law & Power",
    description: "Calculates current and power dissipation in a simple resistive circuit based on voltage and resistance.",
    variables: [
      { id: 'V', name: 'V', label: 'Voltage', value: 12, min: 0, max: 240, step: 1, unit: 'V' },
      { id: 'R', name: 'R', label: 'Resistance', value: 10, min: 1, max: 1000, step: 1, unit: 'Ω' },
    ],
    equations: [
      { id: 'I', expression: 'V / R', outputName: 'Current', unit: 'A', color: '#f87171' },
      { id: 'P', expression: 'V^2 / R', outputName: 'Power', unit: 'W', color: '#fbbf24' },
    ],
    chartConfig: {
      type: 'line',
      xAxis: { variableId: 'V', label: 'Voltage (V)', min: 0, max: 240, points: 50 },
      yAxes: ['Current', 'Power'],
    }
  },
  {
    id: 'poiseuille-flow',
    name: "Poiseuille's Law",
    description: "Describes the flow rate of a viscous fluid through a long cylindrical pipe, showing the impact of radius and pressure.",
    variables: [
      { id: 'P', name: 'P', label: 'Pressure Drop', value: 100, min: 0, max: 1000, step: 10, unit: 'Pa' },
      { id: 'r', name: 'r', label: 'Pipe Radius', value: 0.05, min: 0.01, max: 0.2, step: 0.005, unit: 'm' },
      { id: 'L', name: 'L', label: 'Pipe Length', value: 1, min: 0.5, max: 10, step: 0.5, unit: 'm' },
      { id: 'mu', name: 'mu', label: 'Viscosity', value: 0.001, min: 0.0001, max: 0.01, step: 0.0001, unit: 'Pa·s' },
    ],
    equations: [
      { id: 'Q', expression: '(pi * P * r^4) / (8 * mu * L)', outputName: 'Flow Rate', unit: 'm³/s', color: '#2dd4bf' },
    ],
    chartConfig: {
      type: 'area',
      xAxis: { variableId: 'r', label: 'Radius (m)', min: 0.01, max: 0.2, points: 50 },
      yAxes: ['Flow Rate'],
    }
  },
  {
    id: 'chemical-kinetics',
    name: 'Chemical Reaction Rate',
    description: 'Simulates the concentration decay of a reactant over time in a first-order chemical reaction.',
    variables: [
      { id: 'C0', name: 'C0', label: 'Initial Conc.', value: 1.0, min: 0.1, max: 10, step: 0.1, unit: 'M' },
      { id: 'k', name: 'k', label: 'Rate Constant', value: 0.1, min: 0.01, max: 1, step: 0.01, unit: 's⁻¹' },
      { id: 't', name: 't', label: 'Time', value: 10, min: 0, max: 100, step: 1, unit: 's' },
    ],
    equations: [
      { id: 'Ct', expression: 'C0 * exp(-k * t)', outputName: 'Concentration', unit: 'M', color: '#818cf8' },
      { id: 'Rate', expression: 'k * C0 * exp(-k * t)', outputName: 'Reaction Rate', unit: 'M/s', color: '#f472b6' },
    ],
    chartConfig: {
      type: 'line',
      xAxis: { variableId: 't', label: 'Time (s)', min: 0, max: 100, points: 50 },
      yAxes: ['Concentration', 'Reaction Rate'],
    }
  }
];
