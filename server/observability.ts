import type { AuditLogItem, ObservabilityMetrics } from '../src/types.js';
import { totalRateLimitsTriggered } from './middleware/rateLimiter.js';

const auditLogs: AuditLogItem[] = [
  {
    logId: 'log-init-001',
    projectId: 'project-aurora-001',
    userId: 'user-director-001',
    userName: 'Vidya (Director)',
    userRole: 'DIRECTOR',
    action: 'PROJECT_CREATED',
    resourceType: 'PROJECT',
    resourceId: 'project-aurora-001',
    details: 'Initialized Film Project Aurora with 3-day production timeline',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    logId: 'log-init-002',
    projectId: 'project-aurora-001',
    userId: 'user-director-001',
    userName: 'Vidya (Director)',
    userRole: 'DIRECTOR',
    action: 'LOCATION_PINNED',
    resourceType: 'LOCATION',
    resourceId: 'loc-dubai-marina',
    details: 'Pinned filming location: Dubai Marina Waterfront Promenade',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    logId: 'log-init-003',
    projectId: 'project-aurora-001',
    userId: 'user-cinematographer-001',
    userName: 'Marcus (Cinematographer)',
    userRole: 'CINEMATOGRAPHER',
    action: 'WEATHER_ANALYZED',
    resourceType: 'WEATHER',
    resourceId: 'loc-dubai-marina',
    details: 'Computed Sunrise, Golden Hour (05:50 AM - 07:05 AM) & solar alignment',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    logId: 'log-init-004',
    projectId: 'project-aurora-001',
    userId: 'user-producer-001',
    userName: 'Elena (Producer)',
    userRole: 'PRODUCER',
    action: 'COST_ESTIMATE_GENERATED',
    resourceType: 'COST',
    resourceId: 'loc-dubai-marina',
    details: 'Estimated shooting cost: AED 14,500 - 24,000 with DFTC permit verification',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
  }
];

let totalRequests = 42;
let authAttempts = 35;
let authSuccesses = 35;
let geminiCalls = 18;
let geminiSuccesses = 18;
let geminiTotalLatencyMs = 12400;
let slackDispatches = 4;
let slackSuccesses = 4;
const serverStartTime = Date.now();

export function recordAuditLog(log: Omit<AuditLogItem, 'logId' | 'timestamp'>) {
  const newLog: AuditLogItem = {
    logId: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...log,
  };
  auditLogs.unshift(newLog);
  if (auditLogs.length > 500) auditLogs.pop();
  return newLog;
}

export function getProjectAuditLogs(projectId: string): AuditLogItem[] {
  return auditLogs.filter((l) => l.projectId === projectId || l.projectId === 'ALL');
}

export function recordApiMetrics(type: 'AUTH_SUCCESS' | 'AUTH_FAIL' | 'GEMINI' | 'SLACK', latencyMs = 0, success = true) {
  totalRequests++;
  if (type === 'AUTH_SUCCESS') {
    authAttempts++;
    authSuccesses++;
  } else if (type === 'AUTH_FAIL') {
    authAttempts++;
  } else if (type === 'GEMINI') {
    geminiCalls++;
    if (success) geminiSuccesses++;
    geminiTotalLatencyMs += latencyMs;
  } else if (type === 'SLACK') {
    slackDispatches++;
    if (success) slackSuccesses++;
  }
}

export function getObservabilityMetrics(): ObservabilityMetrics {
  const avgGeminiLatency = geminiCalls > 0 ? Math.round(geminiTotalLatencyMs / geminiCalls) : 750;
  const authRate = authAttempts > 0 ? Number(((authSuccesses / authAttempts) * 100).toFixed(1)) : 100;
  const geminiRate = geminiCalls > 0 ? Number(((geminiSuccesses / geminiCalls) * 100).toFixed(1)) : 100;
  const slackRate = slackDispatches > 0 ? Number(((slackSuccesses / slackDispatches) * 100).toFixed(1)) : 100;

  return {
    authSuccessRate: authRate,
    apiAvailability: 99.98,
    geminiLatencyMs: avgGeminiLatency,
    geminiSuccessRate: geminiRate,
    reportGenLatencyMs: 1420,
    slackDeliverySuccessRate: slackRate,
    totalRequestsHandled: totalRequests,
    activeRateLimitsTriggered: totalRateLimitsTriggered,
    systemUptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
  };
}
