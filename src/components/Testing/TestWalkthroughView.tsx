import React, { useState } from 'react';
import { CheckCircle2, Play, ShieldCheck, Terminal, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';

export const TestWalkthroughView: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [isRunningAll, setIsRunningAll] = useState(false);

  const testSuites = [
    {
      id: 'rbac_suite',
      title: '1. Multi-Role RBAC & Data Isolation Test',
      description: 'Verifies role-based view switching and cross-project token isolation.',
      steps: [
        'Navigate to Dashboard perspective switcher at top-right.',
        'Switch between Director (Creative focus), Producer (Budget & Permits), and DP (Solar & Lenses).',
        'Verify that each dashboard presents strictly tailored KPIs and action items without permission leakage.',
      ],
      automatedTest: 'rbac_isolation_check',
    },
    {
      id: 'ai_note_structuring',
      title: '2. Natural Language Note Structuring Test',
      description: 'Tests Director brain-dump parameter extraction with Gemini model fallback ladder.',
      steps: [
        'Click "AI Note Structurer" in Scenes tab.',
        'Submit prompt: "Day 1, Scene 1: Character walks along Dubai Marina waterfront at 05:45 AM sunrise facing the rising sun."',
        'Verify parameters extracted: Shoot Day 1, Scene 1, 05:45 AM, Golden Hour Rim Light, DFTC permit.',
        'Click "Add to Shooting Schedule" and verify scene persists in Day 1 table.',
      ],
      automatedTest: 'note_structuring_check',
    },
    {
      id: 'solar_weather_suite',
      title: '3. Astronomical Solar & Weather Calculation Test',
      description: 'Tests deterministic solar elevation angles, sunrise/sunset, and golden hour windows.',
      steps: [
        'Open "Solar & Weather" tab.',
        'Select Dubai Marina (25.0778, 55.1396).',
        'Verify Morning Golden Hour is correctly computed as ~05:50 AM - 07:05 AM and Sunset Blue Hour as 06:15 PM - 06:40 PM.',
        'Ask AI DP Advisor: "Is 05:45 AM suitable for anamorphic lens tracking?" and verify advice output.',
      ],
      automatedTest: 'solar_calculation_check',
    },
    {
      id: 'cost_estimator_suite',
      title: '4. Location & Set Construction Cost Estimator Test',
      description: 'Validates itemized budget arithmetic, provenance tagging, and official permit restrictions.',
      steps: [
        'Open "Cost Intelligence" tab.',
        'Set Crew Size to 35, Shooting Days to 1, Location to Dubai Marina.',
        'Click "Generate Cost Intelligence" and verify itemized lines (Permits, Security, Rental) sum deterministically.',
        'Switch to "Set Construction Estimator" and simulate 2,000 sq ft Kerala village exterior.',
      ],
      automatedTest: 'cost_arithmetic_check',
    },
    {
      id: 'master_report_slack',
      title: '5. 3-Day Master Shooting Report & Slack Dispatch Test',
      description: 'Tests multi-role report synthesis, provenance badges, and Block Kit webhook dispatch.',
      steps: [
        'Open "Master Report" tab.',
        'Verify Overall Production Feasibility score (84/100) and 3-Day breakdown.',
        'Click "Send to Slack" and dispatch Block Kit preview to #project-aurora-production.',
        'Confirm successful webhook dispatch confirmation toast in UI.',
      ],
      automatedTest: 'slack_dispatch_check',
    },
    {
      id: 'security_suite',
      title: '6. OWASP Top 10 & 5-Zone Threat Defense Test',
      description: 'Verifies prompt injection sanitization, undefined property stripping, and rate limiting.',
      steps: [
        'Open "Security & Threat Model" tab.',
        'Inspect Threat Summary Table mapping all 11+ threats to implemented countermeasures.',
        'Click "Run Automated Security Verification Suite".',
        'Verify all 7 automated unit and regression checks pass 100% green.',
      ],
      automatedTest: 'threat_mitigation_check',
    },
    {
      id: 'journal_suite',
      title: '7. Role-Isolated Personal Journaling & Multi-Turn Gemini Chat Test',
      description: 'Validates that Director, Producer, and Cinematographer have separate personal journaling spaces with isolated chat history.',
      steps: [
        'Open "Gemini Creative Journal" from the Department Tools sidebar section.',
        'Verify active role banner (e.g., Director) shows isolated brainstorm topics like "Scene 1 Marina Dawn Framing".',
        'Send a message to Gemini in the active thread and verify multi-turn contextual response.',
        'Use the role switcher at the top to switch to Producer or Cinematographer.',
        'Confirm that the journal dynamically updates to display that role\'s private brainstorm topics without cross-role leakage.',
        'Create a new topic, chat with Gemini, and click "Export Transcript" to download the thread log.',
      ],
      automatedTest: 'journal_isolation_check',
    },
    {
      id: 'sandbox_execution_suite',
      title: '8. Backend Calculation Sandbox & Adversarial Containment Test',
      description: 'Tests V8 VM isolate execution, Monte Carlo risk trials, union payroll calculation, and adversarial escape containment.',
      steps: [
        'Open "Calculation Sandbox (SA)" from Department Tools or "Calculation Sandbox & PoLP SA" tab in Cost Planning.',
        'Run 1,000 Monte Carlo simulation runs; verify P50, P75, P90, P99 risk curves calculate in under 25ms.',
        'Switch to "Union & Turnaround Rules" tab; test 14.5 hr shift with 9.5 hr turnaround rest and verify overtime + violation penalty computation.',
        'Switch to "Adversarial Sandbox & Custom Formulas" tab; click "Attack Test: Access process.env".',
        'Verify sandbox intercepts access (`ReferenceError: process is not defined`), flags `ATTEMPTED_PROCESS_GLOBAL_ACCESS`, and keeps server host intact.',
        'Test "Attack Test: Infinite Loop DoS" and verify 2,000ms CPU execution cap triggers cleanly without freezing Node.js event loop.',
      ],
      automatedTest: 'sandbox_containment_check',
    },
    {
      id: 'service_account_polp_suite',
      title: '9. Dedicated Least-Privilege Service Account (PoLP) Test',
      description: 'Verifies dedicated service account identity enforcement and rejection of default Compute Engine credentials.',
      steps: [
        'Inspect the Service Account status banner at top of Calculation Sandbox view.',
        'Verify dedicated email matches `cinemate-sandbox-sa@cinegemini-prod.iam.gserviceaccount.com`.',
        'Verify "PoLP Enforced" and "Default compute account (*-compute@) explicitly rejected" security assertions.',
        'Click "4. Gemini Python Container Sandbox" and trigger ephemeral Python code execution in Google Cloud container.',
      ],
      automatedTest: 'service_account_polp_check',
    },
  ];

  const handleRunAllTests = async () => {
    setIsRunningAll(true);
    try {
      const res = await api.runSecurityVerification();
      if (res.success && res.results) {
        const resultsMap: Record<string, boolean> = {};
        res.results.forEach((r: any) => {
          resultsMap[r.test] = r.passed;
        });
        setTestResults(resultsMap);
      }
    } catch (err: unknown) {
      console.warn('Test runner warning:', err);
    } finally {
      setIsRunningAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-medium">
              FUNCTIONAL STABILITY & AUDIT
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Production Test Walkthrough & Acceptance Suite
          </h2>
          <p className="text-xs text-zinc-400">
            Step-by-step test cases for every user process, role interaction, and security defense
          </p>
        </div>

        <button
          onClick={handleRunAllTests}
          disabled={isRunningAll}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-semibold text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
        >
          <Play className="h-4 w-4 fill-zinc-950" />
          <span>Execute Full Test Suite</span>
        </button>
      </div>

      {/* Test Suites Accordion */}
      <div className="space-y-3">
        {testSuites.map((suite, idx) => {
          const isExpanded = expandedSection === idx;
          return (
            <div
              key={suite.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden transition-all"
            >
              <div
                onClick={() => setExpandedSection(isExpanded ? null : idx)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/30"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <div>
                    <h3 className="font-bold text-white text-sm">{suite.title}</h3>
                    <p className="text-xs text-zinc-400">{suite.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-zinc-950 text-emerald-400 text-[10px] font-mono border border-zinc-800">
                    STATUS: READY
                  </span>
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-zinc-400" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 bg-zinc-950/80 border-t border-zinc-800 space-y-3 text-xs animate-in fade-in">
                  <span className="text-zinc-300 font-semibold block uppercase font-mono text-[10px]">
                    Step-by-Step Walkthrough Procedure:
                  </span>
                  <ol className="list-decimal pl-5 space-y-1.5 text-zinc-300">
                    {suite.steps.map((s, i) => (
                      <li key={i} className="leading-relaxed">{s}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
