import { Router } from 'express';
import { requireAuth, requireProjectMember } from '../middleware/auth.js';
import { getObservabilityMetrics, getProjectAuditLogs, recordAuditLog } from '../observability.js';

export const observabilityRouter = Router();

// GET /api/observability/metrics (Health & SLIs/SLOs)
observabilityRouter.get('/metrics', (_req, res) => {
  const metrics = getObservabilityMetrics();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    metrics,
  });
});

// GET /api/projects/:projectId/audit-logs
observabilityRouter.get('/projects/:projectId/audit-logs', requireAuth, requireProjectMember, (req, res) => {
  const logs = getProjectAuditLogs(req.projectId!);
  res.json({ logs });
});

// POST /api/projects/:projectId/audit-logs
observabilityRouter.post('/projects/:projectId/audit-logs', requireAuth, requireProjectMember, (req, res) => {
  const { action, resourceType, resourceId, details } = req.body;
  const newLog = recordAuditLog({
    projectId: req.projectId!,
    userId: req.user!.uid,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: action || 'USER_INTERACTION',
    resourceType: resourceType || 'PROJECT',
    resourceId,
    details: details || 'User action logged',
  });

  res.status(201).json({ log: newLog });
});
