import React, { useState } from 'react';
import { Compass, Sparkles, AlertTriangle, CheckCircle2, Clock, MapPin, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import type { LocationItem, SceneItem, ShootDayItem, ProductionScoutAnalysis } from '../../types';
import { api } from '../../lib/api';

interface ProductionScoutViewProps {
  locations: LocationItem[];
  scenes: SceneItem[];
  shootDays: ShootDayItem[];
}

export const ProductionScoutView: React.FC<ProductionScoutViewProps> = ({
  locations,
  scenes,
  shootDays,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProductionScoutAnalysis | null>(() => {
    return {
      projectId: 'project-aurora-001',
      overallScore: 86,
      scheduleConflicts: [
        {
          dayNumber: 2,
          description:
            'Day 2 contains transit between Bur Dubai historic quarter and outer studio with a 45-minute peak traffic transit window.',
          severity: 'Medium',
          travelTimeMinutes: 45,
          recommendation:
            'Group Heritage alley scenes into a continuous single morning block before 11:00 AM to eliminate midday turnaround delay.',
        },
      ],
      locationScores: [
        {
          locationId: 'loc-dubai-marina',
          locationName: 'Dubai Marina Waterfront Promenade',
          score: 88,
          costRisk: 'Medium',
          permitRisk: 'Low',
          weatherRisk: 'Low',
          lightingQuality: 'Pristine (Dawn Rim Light)',
          crowdRisk: 'High',
          logisticsRisk: 'Medium',
          topRecommendation: 'Wrap public walkway tracking shots by 07:30 AM before morning foot traffic begins.',
        },
        {
          locationId: 'loc-alserkal',
          locationName: 'Alserkal Avenue Cultural District',
          score: 91,
          costRisk: 'Low',
          permitRisk: 'Low',
          weatherRisk: 'Low',
          lightingQuality: 'Excellent (Diffused Top Light)',
          crowdRisk: 'Low',
          logisticsRisk: 'Low',
          topRecommendation: 'Park generator truck in designated Lane 4 bay to avoid blocking gallery fire exits.',
        },
        {
          locationId: 'loc-al-fahidi',
          locationName: 'Al Fahidi Historical Quarter',
          score: 82,
          costRisk: 'Low',
          permitRisk: 'Low',
          weatherRisk: 'Low',
          lightingQuality: 'Pristine (Windtower Shading)',
          crowdRisk: 'Medium',
          logisticsRisk: 'High',
          topRecommendation: 'Use compact handheld EasyRig packages; narrow alleys cannot accommodate dolly tracks.',
        },
        {
          locationId: 'loc-al-qudra-desert',
          locationName: 'Al Qudra Desert Oasis & Dunes',
          score: 78,
          costRisk: 'High',
          permitRisk: 'Low',
          weatherRisk: 'Medium',
          lightingQuality: 'Pristine (Sunset Horizon)',
          crowdRisk: 'Low',
          logisticsRisk: 'High',
          topRecommendation: 'Deploy sand covers on all cinema lenses and secure 4x4 transport convoy before 02:00 PM.',
        },
      ],
      criticalRisks: [
        'Marina pedestrian crowd density rises rapidly after 08:00 AM',
        'Desert sunset window closes abruptly at 06:40 PM',
        'Historic cobblestone streets in Al Fahidi require silent rubber shoe pads for sound crew',
      ],
      keyRecommendations: [
        'Lock DFTC commercial filming permit 7 days in advance',
        'Pre-stage heavy grip gear at Al Quoz prior to Day 1 evening wrap',
        'Position EMT field medic on site for Day 3 desert dune shoot',
      ],
      generatedAt: '2026-09-02T04:00:00Z',
    };
  });

  const handleRunScout = async () => {
    setIsAnalyzing(true);
    try {
      const res = await api.runProductionScout('project-aurora-001', {
        locations,
        scenes,
        shootDays,
      });

      if (res.success && res.analysis) {
        setAnalysis(res.analysis);
      }
    } catch (err: unknown) {
      alert('Production scout failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-medium">
              CROSS-ROLE SYNTHESIS & RISK ENGINE
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            AI Production Scout Intelligence
          </h2>
          <p className="text-xs text-zinc-400">
            Synthesizes Director vision, Producer budget/permits, and Cinematographer lighting into holistic feasibility scores
          </p>
        </div>

        <button
          onClick={handleRunScout}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-semibold text-xs shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
          id="production-scout-run-btn"
        >
          {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Compass className="h-4 w-4" />}
          <span>Run AI Production Scout</span>
        </button>
      </div>

      {analysis && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Score Banner */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-zinc-950 font-bold font-mono text-2xl shadow-xl shadow-amber-950/50 border border-amber-400/40">
                {analysis.overallScore}
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Project Aurora Feasibility Index</h3>
                <p className="text-xs text-zinc-300 max-w-md">
                  High production viability. Minor schedule transit bottlenecks and desert sunset timing constraints identified.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-300 block">Locations</span>
                <span className="text-sm font-bold text-white">{analysis.locationScores.length} Sites</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-300 block">Transit Conflicts</span>
                <span className="text-sm font-bold text-amber-400">{analysis.scheduleConflicts.length} Detected</span>
              </div>
            </div>
          </div>

          {/* Schedule Conflicts Alert Box */}
          {analysis.scheduleConflicts.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Detected Schedule & Transit Conflicts</span>
              </div>

              <div className="space-y-2">
                {analysis.scheduleConflicts.map((conf, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 font-mono">
                        Day {conf.dayNumber} Conflict • {conf.travelTimeMinutes} Min Transit
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">
                        {conf.severity} Severity
                      </span>
                    </div>
                    <p className="text-zinc-200">{conf.description}</p>
                    <p className="text-emerald-300 font-medium pt-1">
                      💡 Recommendation: {conf.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location Production Scores Matrix */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">Multi-Dimensional Location Risk Matrix</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.locationScores.map((score) => (
                <div
                  key={score.locationId}
                  className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <div>
                      <h4 className="font-bold text-white text-xs">{score.locationName}</h4>
                      <span className="text-[10px] text-zinc-400">{score.lightingQuality}</span>
                    </div>
                    <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono font-bold text-xs">
                      {score.score}
                    </span>
                  </div>

                  {/* 5-Dimensional Risk Badges */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-center text-[10px] font-mono">
                    <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-300 block">Cost</span>
                      <span className={score.costRisk === 'Low' ? 'text-emerald-400' : 'text-amber-400'}>
                        {score.costRisk}
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-300 block">Permit</span>
                      <span className={score.permitRisk === 'Low' ? 'text-emerald-400' : 'text-amber-400'}>
                        {score.permitRisk}
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-300 block">Weather</span>
                      <span className={score.weatherRisk === 'Low' ? 'text-emerald-400' : 'text-amber-400'}>
                        {score.weatherRisk}
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-300 block">Crowd</span>
                      <span className={score.crowdRisk === 'Low' ? 'text-emerald-400' : 'text-amber-400'}>
                        {score.crowdRisk}
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-300 block">Logistics</span>
                      <span className={score.logisticsRisk === 'Low' ? 'text-emerald-400' : 'text-amber-400'}>
                        {score.logisticsRisk}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-300 italic pt-1 border-t border-zinc-900">
                    "{score.topRecommendation}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Recommendations & Risks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
              <h4 className="font-bold text-white text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Actionable Recommendations</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {analysis.keyRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
              <h4 className="font-bold text-white text-xs flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span>Production Risks to Mitigate</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {analysis.criticalRisks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
