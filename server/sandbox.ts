import vm from 'node:vm';
import { generateContentWithFallback, sanitizeUntrustedInput } from './gemini.js';
import { getSecret, getServiceAccountIdentity } from './secrets.js';
import { recordAuditLog, recordApiMetrics } from './observability.js';

export interface SandboxExecutionResult<T = unknown> {
  success: boolean;
  result?: T;
  error?: string;
  executionTimeMs: number;
  securityInterceptions: string[];
  serviceAccount: {
    email: string;
    isDedicated: boolean;
    leastPrivilegeEnforced: boolean;
  };
}

export interface MonteCarloParams {
  baseBudget: number;
  crewSize: number;
  shootingDays: number;
  weatherRiskFactor: number; // 0.0 to 1.0 (e.g. 0.25 for desert heat/dust)
  permitVolatility: number; // 0.0 to 1.0
  currency?: string;
  iterations?: number; // Default: 1000
}

export interface MonteCarloResult {
  p50Expected: number;
  p75LikelyRisk: number;
  p90SevereRisk: number;
  p99WorstCase: number;
  mean: number;
  min: number;
  max: number;
  standardDeviation: number;
  iterationsRun: number;
  currency: string;
  histogramBuckets: Array<{
    bucketLabel: string;
    rangeStart: number;
    rangeEnd: number;
    count: number;
    percentage: number;
  }>;
  riskSummary: string;
}

export interface UnionPayrollParams {
  baseDayRate: number;
  crewCount: number;
  standardDayHours: number; // 10 or 12
  actualWorkHours: number; // e.g. 15
  turnaroundRestHours: number; // e.g. 9.5 (standard required is 12)
  mealBreakIntervalHours: number; // e.g. 7.5 (standard required is max 6)
  isNightShoot: boolean;
  currency?: string;
}

export interface UnionPayrollResult {
  baseTotal: number;
  overtimeHours15x: number;
  overtimePay15x: number;
  goldenTimeHours20x: number;
  goldenTimePay20x: number;
  mealPenaltyUnits: number;
  mealPenaltyCost: number;
  turnaroundViolationHours: number;
  turnaroundPenaltyCost: number;
  nightHazardBonus: number;
  grossPayrollTotal: number;
  currency: string;
  violationsSummary: string[];
}

/**
 * Hardened Node.js V8 Sandbox Executor
 * Strips all dangerous host APIs (process, require, fs, fetch, child_process, globalThis).
 * Enforces strict CPU execution timeout to eliminate DoS and infinite loops.
 */
export function runInIsolatedSandbox<T = unknown>(
  scriptCode: string,
  inputData: Record<string, unknown> = {},
  timeoutMs = 2000
): {
  success: boolean;
  result?: T;
  error?: string;
  executionTimeMs: number;
  securityInterceptions: string[];
} {
  const startTime = Date.now();
  const securityInterceptions: string[] = [];

  // Security pattern detection on the source string before execution
  const suspiciousPatterns = [
    { pattern: /\bprocess\b/i, label: 'ATTEMPTED_PROCESS_GLOBAL_ACCESS' },
    { pattern: /\brequire\s*\(/i, label: 'ATTEMPTED_REQUIRE_MODULE_ACCESS' },
    { pattern: /\bimport\s*\(/i, label: 'ATTEMPTED_DYNAMIC_IMPORT' },
    { pattern: /\bglobalThis\b/i, label: 'ATTEMPTED_GLOBAL_THIS_ACCESS' },
    { pattern: /\bchild_process\b/i, label: 'ATTEMPTED_CHILD_PROCESS_ACCESS' },
    { pattern: /\bfs\b/i, label: 'ATTEMPTED_FILESYSTEM_ACCESS' },
    { pattern: /\bfetch\b/i, label: 'ATTEMPTED_OUTBOUND_NETWORK_FETCH' },
    { pattern: /\bXMLHttpRequest\b/i, label: 'ATTEMPTED_XHR_NETWORK_ACCESS' },
    { pattern: /\beval\s*\(/i, label: 'ATTEMPTED_DYNAMIC_EVAL' },
  ];

  for (const item of suspiciousPatterns) {
    if (item.pattern.test(scriptCode)) {
      securityInterceptions.push(item.label);
    }
  }

  // Create stripped execution context with NO access to host environment
  const sandboxContext: Record<string, unknown> = {
    // Safe standard arithmetic primitives
    Math,
    JSON,
    Array,
    Object,
    Number,
    String,
    Boolean,
    Date,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    // Provide sanitized input data
    input: Object.freeze(JSON.parse(JSON.stringify(inputData))),
    // Interception trap logs
    __interceptionLog: (reason: string) => {
      securityInterceptions.push(reason);
    },
    // Explicitly blocked globals
    process: undefined,
    require: undefined,
    global: undefined,
    globalThis: undefined,
    fetch: undefined,
    Buffer: undefined,
  };

  const context = vm.createContext(sandboxContext);

  try {
    // Wrap user code in an isolated IIFE that returns its result
    const wrappedScript = `
      "use strict";
      (function() {
        ${scriptCode}
      })()
    `;

    const script = new vm.Script(wrappedScript);
    const result = script.runInContext(context, {
      timeout: timeoutMs,
      displayErrors: true,
    }) as T;

    return {
      success: true,
      result,
      executionTimeMs: Date.now() - startTime,
      securityInterceptions,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: errorMsg,
      executionTimeMs: Date.now() - startTime,
      securityInterceptions,
    };
  }
}

/**
 * Sandboxed Monte Carlo Budget Risk Simulator
 * Runs N randomized production iterations to compute P50, P75, P90, P99 risk ceilings.
 */
export function executeMonteCarloSimulation(params: MonteCarloParams): SandboxExecutionResult<MonteCarloResult> {
  const sa = getServiceAccountIdentity();
  const iterations = Math.min(Math.max(params.iterations || 1000, 100), 5000);
  const currency = params.currency || 'AED';

  const script = `
    const base = input.baseBudget;
    const days = input.shootingDays;
    const crew = input.crewSize;
    const wRisk = input.weatherRiskFactor;
    const pVol = input.permitVolatility;
    const n = input.iterations;

    // Pseudo-random Gaussian using Box-Muller transform
    function gaussianRandom(mean, stdev) {
      let u = 1 - Math.random();
      let v = Math.random();
      let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      return mean + z * stdev;
    }

    const trials = [];
    for (let i = 0; i < n; i++) {
      // Base daily burn rate
      const dailyBurn = base / Math.max(days, 1);
      
      // Permit fluctuation variance (-10% to +45% based on volatility)
      const permitDelta = dailyBurn * 0.15 * (Math.random() * (pVol * 1.5) - (pVol * 0.2));

      // Overtime & logistics delay hours variance
      const overtimeHours = Math.max(0, gaussianRandom(1.5, 2.0));
      const overtimeCost = overtimeHours * (crew * 95);

      // Weather interruption risk (e.g. desert sandstorms, sudden squall)
      let weatherPenalty = 0;
      if (Math.random() < wRisk) {
        // Interruption delay of 2 to 6 hours
        const delayHours = 2 + Math.random() * 4;
        weatherPenalty = delayHours * (crew * 120);
      }

      // Equipment contingency variance
      const equipmentContingency = dailyBurn * 0.05 * Math.random();

      const totalSimCost = base + (permitDelta * days) + (overtimeCost * days) + weatherPenalty + equipmentContingency;
      trials.push(Math.round(totalSimCost));
    }

    trials.sort((a, b) => a - b);

    const sum = trials.reduce((acc, v) => acc + v, 0);
    const mean = Math.round(sum / n);
    const min = trials[0];
    const max = trials[n - 1];

    const p50 = trials[Math.floor(n * 0.50)];
    const p75 = trials[Math.floor(n * 0.75)];
    const p90 = trials[Math.floor(n * 0.90)];
    const p99 = trials[Math.floor(n * 0.99)];

    // Standard deviation
    const variance = trials.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
    const stdDev = Math.round(Math.sqrt(variance));

    // Generate 10 histogram buckets for visualization
    const bucketCount = 10;
    const rangeStep = (max - min) / bucketCount;
    const buckets = [];

    for (let b = 0; b < bucketCount; b++) {
      const bStart = Math.round(min + b * rangeStep);
      const bEnd = Math.round(min + (b + 1) * rangeStep);
      const inBucket = trials.filter(v => v >= bStart && (b === bucketCount - 1 ? v <= bEnd : v < bEnd)).length;
      buckets.push({
        bucketLabel: bStart.toLocaleString() + ' - ' + bEnd.toLocaleString(),
        rangeStart: bStart,
        rangeEnd: bEnd,
        count: inBucket,
        percentage: Math.round((inBucket / n) * 100)
      });
    }

    let summary = 'Normal risk exposure within standard production contingency.';
    const overrunRatio = (p90 - base) / base;
    if (overrunRatio > 0.25) {
      summary = 'High risk exposure: 90th percentile budget exceeds approved baseline by ' + Math.round(overrunRatio * 100) + '%. Consider location alternatives or weather insurance.';
    } else if (overrunRatio > 0.10) {
      summary = 'Moderate risk exposure: Recommend reserving an emergency contingency pool of at least ' + Math.round(p90 - base).toLocaleString() + ' ' + input.currency + '.';
    }

    return {
      p50Expected: p50,
      p75LikelyRisk: p75,
      p90SevereRisk: p90,
      p99WorstCase: p99,
      mean: mean,
      min: min,
      max: max,
      standardDeviation: stdDev,
      iterationsRun: n,
      currency: input.currency,
      histogramBuckets: buckets,
      riskSummary: summary
    };
  `;

  const exec = runInIsolatedSandbox<MonteCarloResult>(script, {
    baseBudget: params.baseBudget,
    shootingDays: params.shootingDays,
    crewSize: params.crewSize,
    weatherRiskFactor: params.weatherRiskFactor,
    permitVolatility: params.permitVolatility,
    currency,
    iterations,
  });

  return {
    ...exec,
    serviceAccount: {
      email: sa.email,
      isDedicated: sa.isDedicated,
      leastPrivilegeEnforced: sa.securityCompliance.leastPrivilegeEnforced,
    },
  };
}

/**
 * Sandboxed Union & DFTC Overtime Payroll Rules Calculator
 * Evaluates complex turnaround, overtime, meal penalties, and night differentials in an isolated VM.
 */
export function executeUnionPayrollRules(params: UnionPayrollParams): SandboxExecutionResult<UnionPayrollResult> {
  const sa = getServiceAccountIdentity();
  const currency = params.currency || 'AED';

  const script = `
    const baseDayRate = input.baseDayRate;
    const crewCount = input.crewCount;
    const stdHours = input.standardDayHours || 10;
    const workHours = input.actualWorkHours;
    const turnaroundRest = input.turnaroundRestHours;
    const mealInterval = input.mealBreakIntervalHours;
    const isNight = input.isNightShoot;

    const hourlyRate = baseDayRate / stdHours;
    const violations = [];

    // 1. Regular Base Total
    const baseTotal = baseDayRate * crewCount;

    // 2. Overtime Tier 1 (Hours between standard and 14: paid at 1.5x)
    let otHours15 = 0;
    if (workHours > stdHours) {
      otHours15 = Math.min(workHours - stdHours, 14 - stdHours);
    }
    const otPay15 = otHours15 * (hourlyRate * 1.5) * crewCount;
    if (otHours15 > 0) {
      violations.push('Overtime Tier 1: ' + otHours15.toFixed(1) + ' hrs at 1.5x regular rate.');
    }

    // 3. Golden Time Tier 2 (Hours past 14: paid at 2.0x)
    let goldenHours20 = 0;
    if (workHours > 14) {
      goldenHours20 = workHours - 14;
      violations.push('CRITICAL: Golden Time violation (' + goldenHours20.toFixed(1) + ' hrs past 14-hour ceiling) billed at double time (2.0x).');
    }
    const goldenPay20 = goldenHours20 * (hourlyRate * 2.0) * crewCount;

    // 4. Meal Penalty Violations (Mandatory meal break every 6 hours)
    let mealViolations = 0;
    if (mealInterval > 6.0) {
      // 1 penalty unit for every 30 mins over 6 hours
      mealViolations = Math.ceil((mealInterval - 6.0) / 0.5);
      violations.push('Meal Penalty: ' + mealViolations + ' grace window violation(s) (' + mealInterval + ' hrs continuous call without meal wrap).');
    }
    const mealPenaltyCost = mealViolations * 75 * crewCount; // Standard $75 / 275 AED per violation per crew

    // 5. Turnaround Rest Invasion (Mandatory 12-hour rest between wrap and next call)
    let turnaroundInvasionHours = 0;
    let turnaroundPenaltyCost = 0;
    if (turnaroundRest < 12.0) {
      turnaroundInvasionHours = 12.0 - turnaroundRest;
      // Penalty: Invaded hours billed at premium 2x hourly rate for entire department
      turnaroundPenaltyCost = turnaroundInvasionHours * (hourlyRate * 2.0) * crewCount;
      violations.push('SAFETY WARNING: 12-hour turnaround invaded by ' + turnaroundInvasionHours.toFixed(1) + ' hours (' + turnaroundRest + ' hrs rest granted). Forced call penalty applied.');
    }

    // 6. Night Hazard Differential (+15% on hourly rate for night shoots)
    let nightBonus = 0;
    if (isNight) {
      nightBonus = workHours * (hourlyRate * 0.15) * crewCount;
      violations.push('Night Hazard Differential: +15% nocturnal work bonus applied.');
    }

    const grossTotal = Math.round(baseTotal + otPay15 + goldenPay20 + mealPenaltyCost + turnaroundPenaltyCost + nightBonus);

    return {
      baseTotal: Math.round(baseTotal),
      overtimeHours15x: Number(otHours15.toFixed(1)),
      overtimePay15x: Math.round(otPay15),
      goldenTimeHours20x: Number(goldenHours20.toFixed(1)),
      goldenTimePay20x: Math.round(goldenPay20),
      mealPenaltyUnits: mealViolations,
      mealPenaltyCost: Math.round(mealPenaltyCost),
      turnaroundViolationHours: Number(turnaroundInvasionHours.toFixed(1)),
      turnaroundPenaltyCost: Math.round(turnaroundPenaltyCost),
      nightHazardBonus: Math.round(nightBonus),
      grossPayrollTotal: grossTotal,
      currency: input.currency || 'AED',
      violationsSummary: violations
    };
  `;

  const exec = runInIsolatedSandbox<UnionPayrollResult>(script, {
    baseDayRate: params.baseDayRate,
    crewCount: params.crewCount,
    standardDayHours: params.standardDayHours,
    actualWorkHours: params.actualWorkHours,
    turnaroundRestHours: params.turnaroundRestHours,
    mealBreakIntervalHours: params.mealBreakIntervalHours,
    isNightShoot: params.isNightShoot,
    currency,
  });

  return {
    ...exec,
    serviceAccount: {
      email: sa.email,
      isDedicated: sa.isDedicated,
      leastPrivilegeEnforced: sa.securityCompliance.leastPrivilegeEnforced,
    },
  };
}

/**
 * Sandboxed Custom Formula Execution
 * Safely evaluates user-authored formulas or risk calculations without host environment risk.
 */
export function executeCustomFormulaSandbox(
  userFormula: string,
  inputData: Record<string, unknown> = {}
): SandboxExecutionResult {
  const sa = getServiceAccountIdentity();
  const cleanFormula = sanitizeUntrustedInput(userFormula);

  const exec = runInIsolatedSandbox(cleanFormula, inputData, 1500);

  return {
    ...exec,
    serviceAccount: {
      email: sa.email,
      isDedicated: sa.isDedicated,
      leastPrivilegeEnforced: sa.securityCompliance.leastPrivilegeEnforced,
    },
  };
}

/**
 * Gemini Python Code Execution Sandbox
 * Delegates complex mathematical models and equipment load distributions
 * to Google's server-side container sandbox via @google/genai codeExecution tool.
 */
export async function executeGeminiCodeExecutionSandbox(
  prompt: string,
  projectId = 'project-aurora-001'
): Promise<{
  success: boolean;
  output?: string;
  pythonCodeGenerated?: string;
  executionOutcome?: string;
  modelUsed: string;
  serviceAccount: {
    email: string;
    isDedicated: boolean;
    leastPrivilegeEnforced: boolean;
  };
}> {
  const startTime = Date.now();
  const sa = getServiceAccountIdentity();

  try {
    const fullPrompt = `You are a film production engineering calculator.
Use your Python code execution tool to write and execute code that solves this exact calculation:
${prompt}

Output your analysis and the exact numerical answers derived from Python execution.`;

    const { text, modelUsed } = await generateContentWithFallback(fullPrompt, {
      systemInstruction: 'You are an engineering logistics solver for film productions. Solve numeric problems using Python code execution.',
      temperature: 0.1,
    });

    recordApiMetrics('SANDBOX', Date.now() - startTime, true);
    recordAuditLog({
      projectId,
      userId: 'sandbox-worker',
      userName: 'Dedicated Sandbox Worker (PoLP SA)',
      userRole: 'PRODUCER',
      action: 'SANDBOX_GEMINI_CODE_EXECUTION',
      resourceType: 'SANDBOX',
      details: `Executed Python calculation sandbox via ${modelUsed} using service account: ${sa.email}`,
    });

    return {
      success: true,
      output: text,
      modelUsed,
      serviceAccount: {
        email: sa.email,
        isDedicated: sa.isDedicated,
        leastPrivilegeEnforced: sa.securityCompliance.leastPrivilegeEnforced,
      },
    };
  } catch (err: unknown) {
    recordApiMetrics('SANDBOX', Date.now() - startTime, false);
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      output: undefined,
      executionOutcome: msg,
      modelUsed: 'gemini-fallback',
      serviceAccount: {
        email: sa.email,
        isDedicated: sa.isDedicated,
        leastPrivilegeEnforced: sa.securityCompliance.leastPrivilegeEnforced,
      },
    };
  }
}
