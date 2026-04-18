/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create, all } from 'mathjs';
import { SimulationModel, SimulationResult } from '../types';

// Configure mathjs to use BigNumber with high precision
const math = create(all, {
  number: 'BigNumber',
  precision: 64
});

export function runSimulation(model: SimulationModel): SimulationResult {
  const { variables, equations, chartConfig } = model;
  
  // Create a scope for evaluation
  const scope: Record<string, any> = {};
  variables.forEach(v => {
    scope[v.name] = math.bignumber!(v.value);
  });

  // Calculate metrics (current values)
  const metrics = equations.map(eq => {
    try {
      const result = math.evaluate!(eq.expression, scope) as any;
      const value = typeof result?.toNumber === 'function' ? result.toNumber() : Number(result);
      
      if (typeof value !== 'number' || !isFinite(value)) {
        let errorMsg = 'Invalid result';
        if (value === Infinity || value === -Infinity) errorMsg = 'Division by zero or overflow';
        if (isNaN(value)) errorMsg = 'Result is not a number';
        
        return {
          name: eq.outputName,
          value: 0,
          unit: eq.unit,
          color: eq.color,
          error: errorMsg
        };
      }

      return {
        name: eq.outputName,
        value: value,
        unit: eq.unit,
        color: eq.color
      };
    } catch (e: any) {
      console.error(`Error evaluating equation ${eq.expression}:`, e);
      return {
        name: eq.outputName,
        value: 0,
        unit: eq.unit,
        color: eq.color,
        error: e.message
      };
    }
  });

  // Generate chart data
  const data: any[] = [];
  const { xAxis, yAxes } = chartConfig;
  const xVar = variables.find(v => v.id === xAxis.variableId);
  
  if (xVar) {
    const min = xAxis.min ?? xVar.min;
    const max = xAxis.max ?? xVar.max;
    const points = xAxis.points ?? 100; // Increased points for smoother curves
    const step = math.divide!(math.subtract!(math.bignumber!(max), math.bignumber!(min)), math.bignumber!(points));

    for (let i = 0; i <= points; i++) {
      const xOffset = math.multiply!(math.bignumber!(i), step);
      const xBN = math.add!(math.bignumber!(min), xOffset) as any;
      const xValue = typeof xBN?.toNumber === 'function' ? xBN.toNumber() : Number(xBN);
      
      const pointScope = { ...scope, [xVar.name]: xBN };
      const point: any = { [xAxis.label]: xValue };
      
      equations.forEach(eq => {
        if (yAxes.includes(eq.outputName)) {
          try {
            const res = math.evaluate!(eq.expression, pointScope) as any;
            const val = typeof res?.toNumber === 'function' ? res.toNumber() : Number(res);
            point[eq.outputName] = (typeof val === 'number' && isFinite(val)) ? val : 0;
          } catch (e) {
            point[eq.outputName] = 0;
          }
        }
      });
      data.push(point);
    }
  }

  return { data, metrics };
}

export function validateEquation(expression: string, variables: string[]): { valid: boolean; error?: string; char?: number } {
  if (!expression || expression.trim() === '') {
    return { valid: false, error: 'Expression cannot be empty' };
  }

  try {
    const node = math.parse!(expression);
    const symbols: string[] = [];
    node.traverse((n: any) => {
      if (n.isSymbolNode) {
        symbols.push(n.name);
      }
    });
    
    const mathFunctions = ['pi', 'e', 'sin', 'cos', 'tan', 'log', 'sqrt', 'exp', 'abs', 'min', 'max', 'pow'];
    const unknownSymbols = symbols.filter(s => !variables.includes(s) && !mathFunctions.includes(s));
    
    if (unknownSymbols.length > 0) {
      return { valid: false, error: `Unknown variables or functions: ${unknownSymbols.join(', ')}` };
    }
    
    // Try evaluating with dummy values to catch runtime errors like division by zero
    const dummyScope: Record<string, any> = {};
    variables.forEach(v => dummyScope[v] = math.bignumber!(1));
    
    const resultRaw = math.evaluate!(expression, dummyScope) as any;
    const result = typeof resultRaw?.toNumber === 'function' ? resultRaw.toNumber() : Number(resultRaw);
    
    if (typeof result !== 'number' || !isFinite(result)) {
      if (result === Infinity || result === -Infinity) {
        return { valid: false, error: 'Potential division by zero detected' };
      }
      if (isNaN(result)) {
        return { valid: false, error: 'Equation produces an invalid number (NaN)' };
      }
    }
    
    return { valid: true };
  } catch (e: any) {
    let errorMsg = e.message;
    let charIndex = e.char;

    // Clean up mathjs error messages
    if (errorMsg.includes('Unexpected type of argument')) {
      errorMsg = 'Invalid function argument or operator usage';
    } else if (errorMsg.includes('Value expected')) {
      errorMsg = 'Incomplete expression: expected a value or variable';
    }

    if (charIndex !== undefined) {
      const pointer = ' '.repeat(Math.max(0, charIndex - 1)) + '▲';
      errorMsg = `${errorMsg}\n${expression}\n${pointer}`;
    }

    return { valid: false, error: errorMsg, char: charIndex };
  }
}
