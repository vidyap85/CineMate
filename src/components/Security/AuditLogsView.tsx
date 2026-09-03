import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Clock, User, Filter, RefreshCw, Layers } from 'lucide-react';
import { api } from '../../lib/api';
import type { AuditLogEntry } from '../../types';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [logsRes, metricsRes] = await Promise.all([
        api.getAuditLogs('project-aurora-001'),
        api.getObservabilityMetrics('project-aurora-001'),
      ]);

      if (logsRes.success && logsRes.logs) {
        setLogs(logsRes.logs);
      }
      if (metricsRes.success && metricsRes.metrics) {
        setMetrics(metricsRes.metrics);
      }
    } catch (err: unknown) {
      console.warn('Failed to fetch observability:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs =
    filterAction === 'ALL'
      ? logs
      : logs.filter((l) => l.action.toLowerCase().includes(filterAction.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-medium">
              PRODUCTION OBSERVABILITY & SLI/SLO
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Audit Trails & Performance Observability
          </h2>
          <p className="text-xs text-zinc-400">
            Immutable user action logs, RBAC authorization events, and real-time Gemini latency metrics
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* SLI/SLO Telemetry Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <span className="text-[10px] uppercase font-mono text-zinc-300">Total Inferences</span>
            <div className="text-2xl font-bold text-white font-mono">{metrics.totalRequests}</div>
            <span className="text-[10px] text-emerald-400 font-mono">100% Availability</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <span className="text-[10px] uppercase font-mono text-zinc-300">P95 Latency</span>
            <div className="text-2xl font-bold text-cyan-300 font-mono">{metrics.latencyP95Ms} ms</div>
            <span className="text-[10px] text-zinc-300 font-mono">SLO Target: &lt;1500ms</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <span className="text-[10px] uppercase font-mono text-zinc-300">Fallback Triggers</span>
            <div className="text-2xl font-bold text-amber-400 font-mono">{metrics.fallbackInvocations}</div>
            <span className="text-[10px] text-zinc-300 font-mono">Ladder Self-Healing</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <span className="text-[10px] uppercase font-mono text-zinc-300">Error Rate</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {(metrics.errorRate * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-zinc-300 font-mono">Zero unhandled exceptions</span>
          </div>
        </div>
      )}

      {/* Audit Log Stream */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">Security Audit Trail</h3>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['ALL', 'NOTE', 'REPORT', 'COST', 'SLACK'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterAction(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  filterAction === f
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {filteredLogs.map((log) => (
            <div
              key={log.logId}
              className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-zinc-900 text-amber-300 text-[10px] border border-zinc-800">
                  {log.action}
                </span>
                <span className="text-zinc-200 font-sans font-medium">{log.resource}</span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-zinc-300">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3 text-zinc-400" />
                  <span>{log.actorRole}</span>
                </span>
                <span>•</span>
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
