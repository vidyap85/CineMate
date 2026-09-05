import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { getServiceAccountIdentity } from '../secrets.js';
import {
  executeMonteCarloSimulation,
  executeUnionPayrollRules,
  executeCustomFormulaSandbox,
  executeGeminiCodeExecutionSandbox,
} from '../sandbox.js';
import { recordAuditLog, recordApiMetrics } from '../observability.js';

export const sandboxRouter = Router();

// Sandbox rate limiter: 40 requests per minute
const sandboxRateLimiter = createRateLimiter(60000, 40, 'Sandbox Calculation Engine');

/**
 * GET /api/sandbox/identity
 * Returns the active Service Account identity, least-privilege verification status,
 * and sandbox isolation capabilities. Restricted to ADMIN role.
 */
sandboxRouter.get('/identity', requireAuth, requireRole(['ADMIN']), async (_req, res) => {
  const sa = getServiceAccountIdentity();
  res.json({
    success: true,
    serviceAccount: sa,
    sandboxCapabilities: {
      v8IsolatedVm: true,
      monteCarloSimulator: true,
      unionPayrollEngine: true,
      customFormulaSafetyTrap: true,
      geminiCodeExecution: true,
      securityGuarantees: [
        'Isolated V8 context with no host process/require/fs access',
        'Strict 2,000ms CPU timeout enforcement (DoS/ReDoS prevention)',
        'Zero network access from sandbox context',
        'Dedicated user-managed service account: cinepilot-backend-sa with Least-Privilege IAM',
        'Cloud Run Service Identity via Application Default Credentials (ADC) — no downloaded JSON private key in production',
        'Local development supported via ADC and service-account impersonation',
        'Zero service-account credential exposure to the browser',
        'Default Compute Engine service account (*-compute@) rejected per PoLP',
      ],
    },
  });
});

/**
 * POST /api/sandbox/monte-carlo
 * Runs sandboxed Monte Carlo budget simulation (N=1,000 randomized production risk runs).
 * Restricted to ADMIN and PRODUCER roles.
 */
sandboxRouter.post('/monte-carlo', requireAuth, requireRole(['ADMIN', 'PRODUCER']), sandboxRateLimiter, async (req, res) => {
  const startTime = Date.now();
  const body = (req.body && typeof req.body === 'object') ? req.body : {};
  const baseBudget = Number(body.baseBudget) || 150000;
  const crewSize = Number(body.crewSize) || 35;
  const shootingDays = Number(body.shootingDays) || 3;
  const weatherRiskFactor = typeof body.weatherRiskFactor === 'number' ? body.weatherRiskFactor : 0.25;
  const permitVolatility = typeof body.permitVolatility === 'number' ? body.permitVolatility : 0.30;
  const currency = typeof body.currency === 'string' ? body.currency : 'AED';
  const iterations = Number(body.iterations) || 1000;

  try {
    const result = executeMonteCarloSimulation({
      baseBudget,
      crewSize,
      shootingDays,
      weatherRiskFactor,
      permitVolatility,
      currency,
      iterations,
    });

    recordApiMetrics('SANDBOX', Date.now() - startTime, result.success);
    recordAuditLog({
      projectId: req.projectId || 'project-aurora-001',
      userId: req.user?.uid || 'sandbox-user',
      userName: req.user?.name || 'Dedicated Producer',
      userRole: req.user?.role || 'PRODUCER',
      action: 'SANDBOX_MONTE_CARLO_SIMULATION',
      resourceType: 'SANDBOX',
      details: `Executed ${iterations} Monte Carlo budget risk iterations in isolated VM sandbox`,
    });

    res.json(result);
  } catch (err: unknown) {
    recordApiMetrics('SANDBOX', Date.now() - startTime, false);
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: msg });
  }
});

/**
 * POST /api/sandbox/union-payroll
 * Evaluates union turnaround and overtime payroll rules in the hardened VM sandbox.
 * Restricted to ADMIN and PRODUCER roles.
 */
sandboxRouter.post('/union-payroll', requireAuth, requireRole(['ADMIN', 'PRODUCER']), sandboxRateLimiter, async (req, res) => {
  const startTime = Date.now();
  const body = (req.body && typeof req.body === 'object') ? req.body : {};
  const baseDayRate = Number(body.baseDayRate) || 3500;
  const crewCount = Number(body.crewCount) || 25;
  const standardDayHours = Number(body.standardDayHours) || 10;
  const actualWorkHours = Number(body.actualWorkHours) || 14.5;
  const turnaroundRestHours = Number(body.turnaroundRestHours) || 9.5;
  const mealBreakIntervalHours = Number(body.mealBreakIntervalHours) || 7.0;
  const isNightShoot = Boolean(body.isNightShoot);
  const currency = typeof body.currency === 'string' ? body.currency : 'AED';

  try {
    const result = executeUnionPayrollRules({
      baseDayRate,
      crewCount,
      standardDayHours,
      actualWorkHours,
      turnaroundRestHours,
      mealBreakIntervalHours,
      isNightShoot,
      currency,
    });

    recordApiMetrics('SANDBOX', Date.now() - startTime, result.success);
    recordAuditLog({
      projectId: req.projectId || 'project-aurora-001',
      userId: req.user?.uid || 'sandbox-user',
      userName: req.user?.name || 'Security Admin',
      userRole: req.user?.role || 'ADMIN',
      action: 'SANDBOX_UNION_PAYROLL_EVALUATION',
      resourceType: 'SANDBOX',
      details: `Evaluated turnaround & overtime payroll rules (${actualWorkHours}h, ${crewCount} crew) in isolated VM sandbox`,
    });

    res.json(result);
  } catch (err: unknown) {
    recordApiMetrics('SANDBOX', Date.now() - startTime, false);
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: msg });
  }
});

/**
 * POST /api/sandbox/custom-formula
 * Safely executes user-defined calculation formulas in the isolated V8 VM.
 * Intercepts malicious attempts to reach process, require, global, or network.
 * Restricted to ADMIN role.
 */
sandboxRouter.post('/custom-formula', requireAuth, requireRole(['ADMIN']), sandboxRateLimiter, async (req, res) => {
  const startTime = Date.now();
  const body = (req.body && typeof req.body === 'object') ? req.body : {};
  const formula = typeof body.formula === 'string' ? body.formula : '';
  const inputData = (body.inputData && typeof body.inputData === 'object') ? body.inputData : {};

  if (!formula.trim()) {
    return res.status(400).json({ success: false, error: 'Formula code is required' });
  }

  try {
    const result = executeCustomFormulaSandbox(formula, inputData);

    recordApiMetrics('SANDBOX', Date.now() - startTime, result.success);
    recordAuditLog({
      projectId: req.projectId || 'project-aurora-001',
      userId: req.user?.uid || 'sandbox-user',
      userName: req.user?.name || 'Security Admin',
      userRole: req.user?.role || 'ADMIN',
      action: 'SANDBOX_CUSTOM_FORMULA_EVAL',
      resourceType: 'SANDBOX',
      details: `Executed custom formula in isolated sandbox (interceptions: ${result.securityInterceptions.length})`,
    });

    res.json(result);
  } catch (err: unknown) {
    recordApiMetrics('SANDBOX', Date.now() - startTime, false);
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: msg });
  }
});

/**
 * POST /api/sandbox/gemini-code-execution
 * Executes server-side Python calculations via Gemini Code Execution container sandbox.
 * Restricted to ADMIN role.
 */
sandboxRouter.post('/gemini-code-execution', requireAuth, requireRole(['ADMIN']), sandboxRateLimiter, async (req, res) => {
  const startTime = Date.now();
  const body = (req.body && typeof req.body === 'object') ? req.body : {};
  const prompt = typeof body.prompt === 'string' ? body.prompt : '';
  const projectId = req.projectId || 'project-aurora-001';

  if (!prompt.trim()) {
    return res.status(400).json({ success: false, error: 'Prompt calculation instructions are required' });
  }

  try {
    const result = await executeGeminiCodeExecutionSandbox(prompt, projectId);
    recordApiMetrics('SANDBOX', Date.now() - startTime, result.success);
    res.json(result);
  } catch (err: unknown) {
    recordApiMetrics('SANDBOX', Date.now() - startTime, false);
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: msg });
  }
});
