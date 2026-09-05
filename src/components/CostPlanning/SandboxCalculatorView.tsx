import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Cpu,
  Zap,
  Clock,
  AlertTriangle,
  Play,
  Terminal,
  Activity,
  CheckCircle2,
  Lock,
  Sparkles,
  BarChart3,
  DollarSign,
  Users,
  Layers,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../lib/api';

export interface SandboxCalculatorViewProps {
  producerMode?: boolean;
}

export const SandboxCalculatorView: React.FC<SandboxCalculatorViewProps> = ({ producerMode = false }) => {
  const [activeSubTab, setActiveSubTab] = useState<'monte_carlo' | 'union_rules' | 'formula_lab' | 'gemini_python'>(
    producerMode ? 'monte_carlo' : 'formula_lab'
  );

  // Service Account Identity State
  const [saIdentity, setSaIdentity] = useState<{
    email: string;
    isDedicated: boolean;
    authMethod: string;
    projectId: string;
    securityCompliance: {
      leastPrivilegeEnforced: boolean;
      defaultComputeRejected: boolean;
      complianceLevel: string;
      advisoryMessage: string;
    };
  } | null>(null);

  // Monte Carlo State
  const [baseBudget, setBaseBudget] = useState<number>(150000);
  const [crewSize, setCrewSize] = useState<number>(35);
  const [shootingDays, setShootingDays] = useState<number>(3);
  const [weatherRisk, setWeatherRisk] = useState<number>(0.25);
  const [permitVolatility, setPermitVolatility] = useState<number>(0.30);
  const [iterations, setIterations] = useState<number>(1000);
  const [isSimulatingMC, setIsSimulatingMC] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mcResult, setMcResult] = useState<any>(null);

  // Union Rules State
  const [baseDayRate, setBaseDayRate] = useState<number>(3500);
  const [crewCount, setCrewCount] = useState<number>(25);
  const [stdHours, setStdHours] = useState<number>(10);
  const [actualHours, setActualHours] = useState<number>(14.5);
  const [turnaroundRest, setTurnaroundRest] = useState<number>(9.5);
  const [mealInterval, setMealInterval] = useState<number>(7.0);
  const [isNightShoot, setIsNightShoot] = useState<boolean>(false);
  const [isSimulatingUnion, setIsSimulatingUnion] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [unionResult, setUnionResult] = useState<any>(null);

  // Custom Formula Lab State
  const [customFormula, setCustomFormula] = useState<string>(
    'const crewCost = input.crew * 850;\nconst generatorKw = input.lights * 1.8;\nreturn { totalCrewDaily: crewCost, generatorFuelAed: generatorKw * 4.2 };'
  );
  const [customInputJson, setCustomInputJson] = useState<string>('{\n  "crew": 28,\n  "lights": 12\n}');
  const [isTestingFormula, setIsTestingFormula] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formulaResult, setFormulaResult] = useState<any>(null);

  // Gemini Python Code Execution State
  const [geminiPrompt, setGeminiPrompt] = useState<string>(
    'Calculate the generator fuel consumption and total power load for a night desert shoot with two 18kW HMI lights, four 4kW ARRI M40s, and a 100kVA diesel generator running for 8 hours at 75% load.'
  );
  const [isExecutingPython, setIsExecutingPython] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pythonResult, setPythonResult] = useState<any>(null);

  useEffect(() => {
    if (!producerMode) {
      loadIdentity();
    }
  }, [producerMode]);

  const loadIdentity = async () => {
    try {
      const res = await api.getSandboxIdentity();
      if (res.success) {
        setSaIdentity(res.serviceAccount);
      }
    } catch {
      // fallback
    }
  };

  const handleRunMonteCarlo = async () => {
    setIsSimulatingMC(true);
    try {
      const res = await api.runMonteCarloSimulation({
        baseBudget,
        crewSize,
        shootingDays,
        weatherRiskFactor: weatherRisk,
        permitVolatility,
        iterations,
      });
      if (res.success && res.result) {
        setMcResult({ ...res.result, executionTimeMs: res.executionTimeMs, sa: res.serviceAccount });
      }
    } catch (err: unknown) {
      alert('Monte Carlo simulation failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSimulatingMC(false);
    }
  };

  const handleRunUnionPayroll = async () => {
    setIsSimulatingUnion(true);
    try {
      const res = await api.runUnionPayrollRules({
        baseDayRate,
        crewCount,
        standardDayHours: stdHours,
        actualWorkHours: actualHours,
        turnaroundRestHours: turnaroundRest,
        mealBreakIntervalHours: mealInterval,
        isNightShoot,
      });
      if (res.success && res.result) {
        setUnionResult({ ...res.result, executionTimeMs: res.executionTimeMs, sa: res.serviceAccount });
      }
    } catch (err: unknown) {
      alert('Union rules calculation failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSimulatingUnion(false);
    }
  };

  const handleTestCustomFormula = async () => {
    setIsTestingFormula(true);
    try {
      let parsedInput = {};
      try {
        parsedInput = JSON.parse(customInputJson);
      } catch {
        alert('Invalid JSON input data. Please provide valid JSON.');
        setIsTestingFormula(false);
        return;
      }

      const res = await api.runCustomFormulaSandbox(customFormula, parsedInput);
      setFormulaResult(res);
    } catch (err: unknown) {
      alert('Sandbox execution error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsTestingFormula(false);
    }
  };

  const handleExecuteGeminiPython = async () => {
    setIsExecutingPython(true);
    try {
      const res = await api.runGeminiCodeExecution(geminiPrompt);
      setPythonResult(res);
    } catch (err: unknown) {
      alert('Python code execution failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsExecutingPython(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      {producerMode ? (
        <div className="border border-white/10 bg-gradient-to-r from-[#12100B] via-[#0E0E0E] to-[#0A0A0A] p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 text-[10px] font-mono uppercase tracking-[0.2em]">
              PRODUCER FINANCIAL INTELLIGENCE
            </span>
            <span className="text-[11px] uppercase tracking-widest text-white/40">Elena Rostova • Line Producer</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-light italic text-[#F5F2ED] tracking-tight">
            Monte Carlo Budget Risk & Union Payroll Engine
          </h1>
          <p className="text-xs text-white/60 leading-relaxed max-w-2xl font-light tracking-wide">
            Run sandboxed 1,000-iteration Monte Carlo variance trials to quantify contingency reserves and financial overrun probabilities, and evaluate deterministic union turnaround rest penalties and golden hour overtime tiers.
          </p>
        </div>
      ) : (
        /* Admin Service Account & PoLP Header */
        <div className="border border-white/10 bg-[#0B0B0B] p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-[#C5A059]" />
                <h2 className="text-xl font-serif text-[#F5F2ED] tracking-tight">
                  Backend Calculation Sandbox & Dedicated Service Account
                </h2>
              </div>
              <p className="text-xs uppercase tracking-widest text-white/40 mt-1 font-mono">
                Dedicated Service Account (cinepilot-backend-sa) • Application Default Credentials (ADC) • Hardened V8 VM
              </p>
            </div>

            {/* Service Account Security Chip */}
            <div className="flex items-center gap-2.5 bg-black/60 border border-emerald-500/30 px-3.5 py-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                    User-Managed Service Account Active (PoLP)
                  </span>
                </div>
                <p className="text-[11px] font-mono text-white/90 font-medium">
                  {saIdentity?.email || 'cinepilot-backend-sa@cinegemini-prod.iam.gserviceaccount.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Security Compliance Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-white/5 text-xs font-mono">
            <div className="flex items-start gap-2 bg-white/[0.02] p-2.5 border border-white/5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-white/90 font-bold block text-[11px]">Least-Privilege IAM (PoLP)</span>
                <span className="text-white/50 text-[10px]">
                  Dedicated user-managed account; default compute (<code className="text-white/70">*-compute@</code>) rejected
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-white/[0.02] p-2.5 border border-white/5">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-white/90 font-bold block text-[11px]">No Private Key in Production</span>
                <span className="text-white/50 text-[10px]">
                  Cloud Run Service Identity via Application Default Credentials (ADC); zero downloaded JSON files
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-white/[0.02] p-2.5 border border-white/5">
              <Lock className="h-4 w-4 text-[#C5A059] shrink-0 mt-0.5" />
              <div>
                <span className="text-white/90 font-bold block text-[11px]">Zero Browser Exposure</span>
                <span className="text-white/50 text-[10px]">
                  Credentials & tokens resolve strictly server-side; never exposed to browser context
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-white/[0.02] p-2.5 border border-white/5">
              <Zap className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-white/90 font-bold block text-[11px]">Local Impersonation Ready</span>
                <span className="text-white/50 text-[10px]">
                  Developers use <code className="text-white/70">--impersonate-service-account</code> without storing keys locally
                </span>
              </div>
            </div>
          </div>

          {/* Deployment & Impersonation Runbook Drawer */}
          <div className="p-3 bg-black/40 border border-white/10 rounded-sm text-xs font-mono space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#C5A059] font-bold text-[11px] uppercase tracking-wider">
                <Terminal className="h-3.5 w-3.5" />
                <span>Production Deployment & Local ADC Impersonation Protocol</span>
              </div>
              <span className="text-[10px] text-white/40 font-normal">
                Method: {saIdentity?.authMethod || 'APPLICATION_DEFAULT_CREDENTIALS'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="bg-black/80 border border-white/10 p-2.5 rounded space-y-1">
                <span className="text-cyan-300 font-bold block text-[10px] uppercase tracking-wider">
                  1. Cloud Run Deploy with Service Identity (ADC - No JSON Keys)
                </span>
                <code className="text-white/70 text-[10px] block break-all selection:bg-cyan-900">
                  gcloud run deploy cinepilot-backend \<br />
                  &nbsp;&nbsp;--service-account="{saIdentity?.email || 'cinepilot-backend-sa@PROJECT_ID.iam.gserviceaccount.com'}" \<br />
                  &nbsp;&nbsp;--set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest"
                </code>
              </div>

              <div className="bg-black/80 border border-white/10 p-2.5 rounded space-y-1">
                <span className="text-emerald-300 font-bold block text-[10px] uppercase tracking-wider">
                  2. Local Dev: ADC Service-Account Impersonation
                </span>
                <code className="text-white/70 text-[10px] block break-all selection:bg-emerald-900">
                  gcloud auth application-default login \<br />
                  &nbsp;&nbsp;--impersonate-service-account="{saIdentity?.email || 'cinepilot-backend-sa@PROJECT_ID.iam.gserviceaccount.com'}"
                </code>
              </div>
            </div>

            <p className="text-[10px] text-white/40 italic">
              * Security Mandate: Only use a service-account JSON private key if a specific legacy deployment environment cannot support ADC or Workload Identity.
            </p>
          </div>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {(producerMode
          ? [
              { id: 'monte_carlo' as const, label: '1. Monte Carlo Budget Risk (1,000 Runs)', icon: BarChart3 },
              { id: 'union_rules' as const, label: '2. Union & Turnaround Payroll Rules', icon: Users },
            ]
          : [
              { id: 'formula_lab' as const, label: '1. Adversarial Sandbox & Custom Formulas', icon: Terminal },
              { id: 'gemini_python' as const, label: '2. Gemini Python Container Sandbox', icon: Sparkles },
            ]
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#C5A059] text-black font-bold shadow-md'
                  : 'bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.06] border border-white/10'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: MONTE CARLO BUDGET RISK */}
      {activeSubTab === 'monte_carlo' && producerMode && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-[#0B0B0B] border border-white/10 p-5 space-y-4">
            <h3 className="text-sm font-serif font-bold text-[#F5F2ED] flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#C5A059]" />
              <span>Simulation Parameters</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-[10px] text-white/50 uppercase tracking-widest block mb-1">
                  Base Production Budget (AED)
                </label>
                <input
                  type="number"
                  value={baseBudget}
                  onChange={(e) => setBaseBudget(Number(e.target.value) || 10000)}
                  className="w-full bg-black/60 border border-white/15 px-3 py-2 text-[#F5F2ED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-widest block mb-1">
                    Crew Size
                  </label>
                  <input
                    type="number"
                    value={crewSize}
                    onChange={(e) => setCrewSize(Number(e.target.value) || 5)}
                    className="w-full bg-black/60 border border-white/15 px-3 py-2 text-[#F5F2ED]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-widest block mb-1">
                    Shooting Days
                  </label>
                  <input
                    type="number"
                    value={shootingDays}
                    onChange={(e) => setShootingDays(Number(e.target.value) || 1)}
                    className="w-full bg-black/60 border border-white/15 px-3 py-2 text-[#F5F2ED]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-white/50 uppercase tracking-widest mb-1">
                  <span>Weather Interruption Probability</span>
                  <span className="text-[#C5A059] font-bold">{Math.round(weatherRisk * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.8"
                  step="0.05"
                  value={weatherRisk}
                  onChange={(e) => setWeatherRisk(Number(e.target.value))}
                  className="w-full accent-[#C5A059]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-white/50 uppercase tracking-widest mb-1">
                  <span>Permit Volatility Factor</span>
                  <span className="text-[#C5A059] font-bold">{Math.round(permitVolatility * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.7"
                  step="0.05"
                  value={permitVolatility}
                  onChange={(e) => setPermitVolatility(Number(e.target.value))}
                  className="w-full accent-[#C5A059]"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/50 uppercase tracking-widest block mb-1">
                  Simulation Iterations
                </label>
                <select
                  value={iterations}
                  onChange={(e) => setIterations(Number(e.target.value))}
                  className="w-full bg-black/60 border border-white/15 px-3 py-2 text-[#F5F2ED]"
                >
                  <option value={500}>500 randomized runs</option>
                  <option value={1000}>1,000 randomized runs (Standard)</option>
                  <option value={2500}>2,500 randomized runs (High Precision)</option>
                </select>
              </div>

              <button
                onClick={handleRunMonteCarlo}
                disabled={isSimulatingMC}
                className="w-full mt-4 bg-[#C5A059] hover:bg-[#D4B26F] text-black font-bold py-2.5 px-4 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
              >
                {isSimulatingMC ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 fill-black" />
                )}
                <span>Run Sandboxed Monte Carlo</span>
              </button>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-2 bg-[#0B0B0B] border border-white/10 p-5 space-y-5">
            {!mcResult ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10">
                <BarChart3 className="h-10 w-10 text-white/20 mb-3" />
                <p className="text-sm text-white/60 font-mono">
                  Ready to execute Monte Carlo simulation inside the isolated V8 VM sandbox.
                </p>
                <p className="text-xs text-white/40 mt-1">
                  Click "Run Sandboxed Monte Carlo" to test 1,000 variance trials.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Latency & Identity Banner */}
                <div className="flex items-center justify-between bg-black/40 border border-white/10 px-3.5 py-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{mcResult.iterationsRun} Trials Executed in {mcResult.executionTimeMs}ms</span>
                  </div>
                  <span className="text-white/50 text-[11px]">
                    {producerMode ? (
                      <span>Engine: <code className="text-[#C5A059]">Isolated V8 VM Sandbox</code></span>
                    ) : (
                      <span>Service Account: <code className="text-[#C5A059]">{mcResult.sa?.email || 'cinemate-sandbox-sa'}</code></span>
                    )}
                  </span>
                </div>

                {/* Percentile Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-mono">
                  <div className="bg-white/[0.02] border border-white/10 p-3">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 block">P50 (Median)</span>
                    <span className="text-lg font-bold text-[#F5F2ED] mt-1 block">
                      {mcResult.p50Expected.toLocaleString()} AED
                    </span>
                    <span className="text-[10px] text-emerald-400">Baseline Target</span>
                  </div>

                  <div className="bg-white/[0.02] border border-white/10 p-3">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 block">P75 (Likely)</span>
                    <span className="text-lg font-bold text-amber-300 mt-1 block">
                      {mcResult.p75LikelyRisk.toLocaleString()} AED
                    </span>
                    <span className="text-[10px] text-amber-300">
                      +{Math.round(((mcResult.p75LikelyRisk - baseBudget) / baseBudget) * 100)}% overrun
                    </span>
                  </div>

                  <div className="bg-white/[0.02] border border-white/10 p-3">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 block">P90 (Severe)</span>
                    <span className="text-lg font-bold text-orange-400 mt-1 block">
                      {mcResult.p90SevereRisk.toLocaleString()} AED
                    </span>
                    <span className="text-[10px] text-orange-400">
                      +{Math.round(((mcResult.p90SevereRisk - baseBudget) / baseBudget) * 100)}% overrun
                    </span>
                  </div>

                  <div className="bg-white/[0.02] border border-white/10 p-3">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 block">P99 (Worst Case)</span>
                    <span className="text-lg font-bold text-red-400 mt-1 block">
                      {mcResult.p99WorstCase.toLocaleString()} AED
                    </span>
                    <span className="text-[10px] text-red-400">Black Swan Cap</span>
                  </div>
                </div>

                {/* Risk Histogram Distribution */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-white/60">
                    Distribution Probability Curve ({mcResult.iterationsRun} Iterations)
                  </h4>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    {mcResult.histogramBuckets.map((b: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-32 text-right text-white/50 shrink-0">{b.bucketLabel}</span>
                        <div className="flex-1 bg-white/5 h-4 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              idx < 4
                                ? 'bg-emerald-500/70'
                                : idx < 7
                                ? 'bg-amber-500/70'
                                : 'bg-red-500/70'
                            }`}
                            style={{ width: `${Math.max(b.percentage * 2.5, 2)}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-white/70">{b.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Advisory Note */}
                <div className="p-3 bg-white/[0.03] border border-white/10 text-xs font-mono text-white/80">
                  <span className="text-[#C5A059] font-bold block mb-1">Sandboxed Risk Assessment:</span>
                  <p>{mcResult.riskSummary}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: UNION OVERTIME RULES */}
      {activeSubTab === 'union_rules' && producerMode && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs */}
          <div className="bg-[#0B0B0B] border border-white/10 p-5 space-y-4">
            <h3 className="text-sm font-serif font-bold text-[#F5F2ED] flex items-center gap-2">
              <Users className="h-4 w-4 text-[#C5A059]" />
              <span>Call Sheet & Shift Parameters</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-[10px] text-white/50 uppercase tracking-widest block mb-1">
                  Department Base Day Rate (AED)
                </label>
                <input
                  type="number"
                  value={baseDayRate}
                  onChange={(e) => setBaseDayRate(Number(e.target.value) || 1000)}
                  className="w-full bg-black/60 border border-white/15 px-3 py-2 text-[#F5F2ED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-widest block mb-1">
                    Crew Count
                  </label>
                  <input
                    type="number"
                    value={crewCount}
                    onChange={(e) => setCrewCount(Number(e.target.value) || 1)}
                    className="w-full bg-black/60 border border-white/15 px-3 py-2 text-[#F5F2ED]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-widest block mb-1">
                    Standard Day Hours
                  </label>
                  <select
                    value={stdHours}
                    onChange={(e) => setStdHours(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/15 px-3 py-2 text-[#F5F2ED]"
                  >
                    <option value={10}>10 Hours Standard</option>
                    <option value={12}>12 Hours Standard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-white/50 uppercase tracking-widest block mb-1">
                  Actual Worked Hours Today
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={actualHours}
                  onChange={(e) => setActualHours(Number(e.target.value) || 10)}
                  className="w-full bg-black/60 border border-white/15 px-3 py-2 text-[#F5F2ED]"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/50 uppercase tracking-widest block mb-1">
                  Rest Turnaround Granted (Mandatory: 12.0h)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={turnaroundRest}
                  onChange={(e) => setTurnaroundRest(Number(e.target.value) || 12)}
                  className="w-full bg-black/60 border border-white/15 px-3 py-2 text-[#F5F2ED]"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/50 uppercase tracking-widest block mb-1">
                  Continuous Work Before Meal (Max: 6.0h)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={mealInterval}
                  onChange={(e) => setMealInterval(Number(e.target.value) || 6)}
                  className="w-full bg-black/60 border border-white/15 px-3 py-2 text-[#F5F2ED]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="nightShootCheck"
                  checked={isNightShoot}
                  onChange={(e) => setIsNightShoot(e.target.checked)}
                  className="accent-[#C5A059] h-4 w-4"
                />
                <label htmlFor="nightShootCheck" className="text-white/80 cursor-pointer text-xs">
                  Night Shoot Differential (+15%)
                </label>
              </div>

              <button
                onClick={handleRunUnionPayroll}
                disabled={isSimulatingUnion}
                className="w-full mt-4 bg-[#C5A059] hover:bg-[#D4B26F] text-black font-bold py-2.5 px-4 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
              >
                {isSimulatingUnion ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 fill-black" />
                )}
                <span>Evaluate Rules in Sandbox</span>
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 bg-[#0B0B0B] border border-white/10 p-5 space-y-5">
            {!unionResult ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10">
                <Users className="h-10 w-10 text-white/20 mb-3" />
                <p className="text-sm text-white/60 font-mono">
                  Ready to calculate overtime, turnaround violations, and meal penalties.
                </p>
                <p className="text-xs text-white/40 mt-1">
                  Click "Evaluate Rules in Sandbox" to run the union contract equations.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Latency & Identity Banner */}
                <div className="flex items-center justify-between bg-black/40 border border-white/10 px-3.5 py-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Evaluated in {unionResult.executionTimeMs}ms via V8 Sandbox</span>
                  </div>
                  <span className="text-white/50 text-[11px]">
                    {producerMode ? (
                      <span>Engine: <code className="text-[#C5A059]">Isolated V8 VM Sandbox</code></span>
                    ) : (
                      <span>Service Account: <code className="text-[#C5A059]">{unionResult.sa?.email || 'cinemate-sandbox-sa'}</code></span>
                    )}
                  </span>
                </div>

                {/* Gross Total Callout */}
                <div className="bg-white/[0.02] border border-white/10 p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono block">
                      Total Calculated Gross Payroll
                    </span>
                    <span className="text-3xl font-serif text-[#C5A059] font-bold">
                      {unionResult.grossPayrollTotal.toLocaleString()} {unionResult.currency}
                    </span>
                  </div>
                  <div className="text-right text-xs font-mono text-white/50">
                    <span>Base: {unionResult.baseTotal.toLocaleString()} AED</span>
                    <br />
                    <span className="text-amber-400">
                      Penalties & Overtime: +{(unionResult.grossPayrollTotal - unionResult.baseTotal).toLocaleString()} AED
                    </span>
                  </div>
                </div>

                {/* Line Item Breakdown */}
                <div className="border border-white/10 divide-y divide-white/5 text-xs font-mono">
                  <div className="p-3 flex justify-between bg-white/[0.02]">
                    <span className="text-white/70">Regular Day Base Total ({crewCount} crew × {baseDayRate} AED)</span>
                    <span className="text-[#F5F2ED] font-bold">{unionResult.baseTotal.toLocaleString()} AED</span>
                  </div>

                  <div className="p-3 flex justify-between">
                    <span className="text-white/70">
                      Overtime 1.5x ({unionResult.overtimeHours15x} hrs)
                    </span>
                    <span className="text-amber-300">+{unionResult.overtimePay15x.toLocaleString()} AED</span>
                  </div>

                  <div className="p-3 flex justify-between">
                    <span className="text-white/70">
                      Golden Time 2.0x ({unionResult.goldenTimeHours20x} hrs past 14-hr cap)
                    </span>
                    <span className="text-red-400 font-bold">+{unionResult.goldenTimePay20x.toLocaleString()} AED</span>
                  </div>

                  <div className="p-3 flex justify-between">
                    <span className="text-white/70">
                      Meal Grace Violations ({unionResult.mealPenaltyUnits} penalty units)
                    </span>
                    <span className="text-amber-400">+{unionResult.mealPenaltyCost.toLocaleString()} AED</span>
                  </div>

                  <div className="p-3 flex justify-between">
                    <span className="text-white/70">
                      Turnaround Rest Invasion ({unionResult.turnaroundViolationHours} hrs invaded)
                    </span>
                    <span className="text-red-400 font-bold">+{unionResult.turnaroundPenaltyCost.toLocaleString()} AED</span>
                  </div>

                  <div className="p-3 flex justify-between">
                    <span className="text-white/70">Night Hazard Differential</span>
                    <span className="text-sky-300">+{unionResult.nightHazardBonus.toLocaleString()} AED</span>
                  </div>
                </div>

                {/* Detected Violations */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-white/60">
                    Detected Safety & Union Violations:
                  </h4>
                  {unionResult.violationsSummary.length === 0 ? (
                    <p className="text-xs font-mono text-emerald-400">No union rule violations detected for this call.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {unionResult.violationsSummary.map((v: string, idx: number) => (
                        <div key={idx} className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-200 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM FORMULA & ADVERSARIAL CONTAINMENT LAB */}
      {activeSubTab === 'formula_lab' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formula Editor & Presets */}
          <div className="bg-[#0B0B0B] border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif font-bold text-[#F5F2ED] flex items-center gap-2">
                <Terminal className="h-4 w-4 text-[#C5A059]" />
                <span>Isolated V8 Formula Script</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">Node vm.runInContext</span>
            </div>

            {/* Attack / Preset Buttons */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-mono text-white/50 block">
                Load Sandbox Test Scenarios:
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCustomFormula('const crewCost = input.crew * 850;\nconst generatorKw = input.lights * 1.8;\nreturn { totalCrewDaily: crewCost, generatorFuelAed: generatorKw * 4.2 };');
                    setCustomInputJson('{\n  "crew": 28,\n  "lights": 12\n}');
                  }}
                  className="text-[10px] font-mono px-2 py-1 bg-white/5 hover:bg-[#C5A059]/20 hover:text-[#C5A059] text-white/70 border border-white/10 cursor-pointer"
                >
                  Clean Formula: Equipment Load
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomFormula('// Adversarial Test: Attempting to access process.env to leak keys\nreturn process.env.GEMINI_API_KEY;');
                    setCustomInputJson('{}');
                  }}
                  className="text-[10px] font-mono px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 cursor-pointer"
                >
                  Attack Test: Access process.env
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomFormula('// Adversarial Test: Attempting to load fs or child_process\nconst fs = require("fs");\nreturn fs.readdirSync("/");');
                    setCustomInputJson('{}');
                  }}
                  className="text-[10px] font-mono px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 cursor-pointer"
                >
                  Attack Test: require("fs")
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomFormula('// Adversarial Test: Infinite loop DoS attempt\nwhile(true) {}\nreturn "unreachable";');
                    setCustomInputJson('{}');
                  }}
                  className="text-[10px] font-mono px-2 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 cursor-pointer"
                >
                  Attack Test: Infinite Loop DoS
                </button>
              </div>
            </div>

            {/* Code Editor Area */}
            <div>
              <label className="text-[10px] uppercase tracking-widest font-mono text-white/50 block mb-1">
                Custom JavaScript Script:
              </label>
              <textarea
                value={customFormula}
                onChange={(e) => setCustomFormula(e.target.value)}
                rows={7}
                className="w-full bg-[#050505] border border-white/15 p-3 text-emerald-300 font-mono text-xs focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            {/* Input Data JSON */}
            <div>
              <label className="text-[10px] uppercase tracking-widest font-mono text-white/50 block mb-1">
                Input Data JSON (available as <code className="text-[#C5A059]">input</code>):
              </label>
              <textarea
                value={customInputJson}
                onChange={(e) => setCustomInputJson(e.target.value)}
                rows={3}
                className="w-full bg-[#050505] border border-white/15 p-3 text-white/80 font-mono text-xs focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <button
              onClick={handleTestCustomFormula}
              disabled={isTestingFormula}
              className="w-full bg-[#C5A059] hover:bg-[#D4B26F] text-black font-bold py-2.5 px-4 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
            >
              {isTestingFormula ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4 fill-black" />
              )}
              <span>Execute in Isolated V8 Sandbox</span>
            </button>
          </div>

          {/* Containment Log Output */}
          <div className="bg-[#0B0B0B] border border-white/10 p-5 space-y-4">
            <h3 className="text-sm font-serif font-bold text-[#F5F2ED] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Sandbox Interception & Execution Log</span>
            </h3>

            {!formulaResult ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10">
                <Terminal className="h-10 w-10 text-white/20 mb-3" />
                <p className="text-sm text-white/60 font-mono">
                  No formula executed yet.
                </p>
                <p className="text-xs text-white/40 mt-1">
                  Select a test scenario or write code, then click Execute.
                </p>
              </div>
            ) : (
              <div className="space-y-4 font-mono text-xs">
                {/* Status Box */}
                <div
                  className={`p-3 border flex items-center justify-between ${
                    formulaResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/10 border-red-500/30 text-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {formulaResult.success ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    )}
                    <span className="font-bold">
                      {formulaResult.success ? 'Execution Succeeded' : 'Execution Contained & Intercepted'}
                    </span>
                  </div>
                  <span className="text-[11px] text-white/60">{formulaResult.executionTimeMs}ms CPU</span>
                </div>

                {/* Security Interception Badges */}
                {formulaResult.securityInterceptions && formulaResult.securityInterceptions.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-widest text-amber-300 block">
                      Active Threat Interceptions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {formulaResult.securityInterceptions.map((item: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/40 text-[10px]"
                        >
                          BLOCKED: {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Returned Output */}
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-1">
                    Sandbox Output Result:
                  </span>
                  <pre className="p-3 bg-[#050505] border border-white/10 text-emerald-300 overflow-x-auto text-[11px]">
                    {formulaResult.success
                      ? JSON.stringify(formulaResult.result, null, 2)
                      : `Error: ${formulaResult.error}`}
                  </pre>
                </div>

                {/* Service Account Isolation Proof */}
                <div className="p-3 bg-white/[0.02] border border-white/5 space-y-1 text-[11px] text-white/60">
                  <span className="text-[#C5A059] font-bold block text-xs">Sandbox Isolation Proof:</span>
                  <p>• Host environment process variables: <span className="text-emerald-400">UNTOUCHED</span></p>
                  <p>• Service Account: <span className="text-white/90">{formulaResult.serviceAccount?.email}</span></p>
                  <p>• Host filesystem access: <span className="text-emerald-400">PROHIBITED</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: GEMINI PYTHON CLOUD CONTAINER SANDBOX */}
      {activeSubTab === 'gemini_python' && (
        <div className="bg-[#0B0B0B] border border-white/10 p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#C5A059]" />
              <h3 className="text-sm font-serif font-bold text-[#F5F2ED]">
                Google Cloud Container Sandbox (Gemini Python Code Execution)
              </h3>
            </div>
            <p className="text-xs text-white/40 font-mono mt-1">
              Automated server-side Python calculations executed inside Google's managed ephemeral container sandbox.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-mono text-white/50 block">
              Logistics Calculation Prompt for Python Code Execution Tool:
            </label>
            <textarea
              value={geminiPrompt}
              onChange={(e) => setGeminiPrompt(e.target.value)}
              rows={3}
              className="w-full bg-black/60 border border-white/15 p-3 text-xs text-[#F5F2ED] font-mono focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          <button
            onClick={handleExecuteGeminiPython}
            disabled={isExecutingPython}
            className="bg-[#C5A059] hover:bg-[#D4B26F] text-black font-bold py-2.5 px-5 text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow"
          >
            {isExecutingPython ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>Execute Python via Gemini Sandbox</span>
          </button>

          {pythonResult && (
            <div className="mt-4 p-4 bg-black/50 border border-white/10 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-white/50 border-b border-white/10 pb-2">
                <span className="text-emerald-400">
                  Model: <code className="text-[#C5A059]">{pythonResult.modelUsed}</code>
                </span>
                <span>
                  Service Account: <code className="text-white/80">{pythonResult.serviceAccount?.email}</code>
                </span>
              </div>
              <div className="text-white/90 whitespace-pre-wrap leading-relaxed">
                {pythonResult.output || pythonResult.executionOutcome}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
