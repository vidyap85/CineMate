import React, { useState } from 'react';
import {
  RefreshCw,
  Sparkles,
  ArrowRight,
  DollarSign,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingDown,
  Clock,
  FileCheck,
} from 'lucide-react';
import type { LocationItem, LocationSwapComparison } from '../../types';
import { api } from '../../lib/api';

interface LocationSwapSimulatorProps {
  locations: LocationItem[];
}

export const LocationSwapSimulator: React.FC<LocationSwapSimulatorProps> = ({ locations }) => {
  const [currentLocId, setCurrentLocId] = useState<string>(locations[0]?.locationId || 'loc-dubai-marina');
  const [candidateName, setCandidateName] = useState('Dubai Creek Harbour Promenade');
  const [candidateCategory, setCandidateCategory] = useState('Waterfront');
  const [targetSceneDesc, setTargetSceneDesc] = useState(
    'Protagonist walks facing sunrise with modern skyline reflections across the water.'
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [comparison, setComparison] = useState<LocationSwapComparison | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentLoc = locations.find((l) => l.locationId === currentLocId) || locations[0] || {
    locationId: 'loc-dubai-marina',
    name: 'Dubai Marina Waterfront Promenade',
    category: 'Waterfront',
    directorNotes: 'Slow Steadicam tracking following protagonist facing rising sun across yacht basin.',
    permitStatus: 'VERIFIED',
  };

  const handleSimulateSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setErrorMessage(null);

    try {
      const res = await api.simulateLocationSwap('project-aurora-001', {
        currentLocationId: currentLocId,
        currentLocation: currentLoc,
        candidateLocation: {
          name: candidateName,
          category: candidateCategory,
          address: 'Ras Al Khor Road, Dubai Creek Harbour, UAE',
          latitude: 25.1972,
          longitude: 55.3528,
        },
        targetSceneDescription: targetSceneDesc,
      });

      if (res.success && res.comparison) {
        setComparison(res.comparison);
      } else {
        throw new Error('Simulation completed but no comparison payload was returned.');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSimulating(false);
    }
  };

  // Safe fallback extractors
  const visualMatch = comparison?.metrics?.visualMatchPercentage ?? comparison?.visualSimilarityPercentage ?? 88;
  const costDelta = comparison?.metrics?.costDifferenceAED ?? -(comparison?.potentialSavings ?? 5000);
  const travelDelta = comparison?.metrics?.travelTimeDeltaMinutes ?? comparison?.travelTimeDeltaMinutes ?? -12;
  const permitComparison = comparison?.metrics?.permitComplexityComparison ?? 'Easier - District Authority';
  const verdict = comparison?.recommendationVerdict ?? 'Consider Swap';
  const summaryText = comparison?.tradeOffSummary ?? comparison?.reasoning ?? '';

  return (
    <div className="space-y-6" id="location-swap-simulator-view">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#121212] border border-white/10 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-semibold uppercase tracking-wider">
              AI TRADE-OFF SIMULATOR
            </span>
            <span className="text-[10px] font-mono text-white/40">Multi-Variable Analysis</span>
          </div>
          <h2 className="text-xl font-serif text-[#F5F2ED] tracking-tight mt-1">
            Location Swap & Contingency Simulator
          </h2>
          <p className="text-xs text-white/60">
            Compare candidate locations side-by-side for budget savings, travel time, and visual mood alignment.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#C5A059] bg-[#C5A059]/10 px-3.5 py-2 rounded-xl border border-[#C5A059]/20">
          <Sparkles className="h-4 w-4" />
          <span>Gemini 3.7 Flash Engine</span>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4 shadow-xl">
        <form onSubmit={handleSimulateSwap} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-white/80 font-medium font-mono text-[11px] uppercase tracking-wider block">
                Current Filming Location (Baseline)
              </label>
              <select
                value={currentLocId}
                onChange={(e) => setCurrentLocId(e.target.value)}
                className="w-full rounded-xl bg-[#0A0A0A] border border-white/15 px-3.5 py-2.5 text-[#F5F2ED] focus:outline-none focus:border-[#C5A059] font-mono text-xs cursor-pointer"
                id="baseline-location-select"
              >
                {locations.map((loc) => (
                  <option key={loc.locationId} value={loc.locationId} className="bg-[#121212] text-white">
                    {loc.name} ({loc.category || 'Location'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-white/80 font-medium font-mono text-[11px] uppercase tracking-wider block">
                Candidate Alternative Location Name
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g. Dubai Creek Harbour Promenade"
                className="w-full rounded-xl bg-[#0A0A0A] border border-white/15 px-3.5 py-2.5 text-[#F5F2ED] placeholder-white/30 focus:outline-none focus:border-[#C5A059] font-mono text-xs"
                id="candidate-location-name-input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-white/80 font-medium font-mono text-[11px] uppercase tracking-wider block">
              Director Scene Vision & Requirements
            </label>
            <textarea
              value={targetSceneDesc}
              onChange={(e) => setTargetSceneDesc(e.target.value)}
              rows={2}
              className="w-full rounded-xl bg-[#0A0A0A] border border-white/15 p-3 text-[#F5F2ED] placeholder-white/30 focus:outline-none focus:border-[#C5A059] resize-none text-xs leading-relaxed"
              id="scene-vision-textarea"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <span className="text-[11px] font-mono text-white/40">
              Evaluates visual match %, cost delta, travel turnaround, and permit complexity
            </span>
            <button
              type="submit"
              disabled={isSimulating}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-black font-semibold text-xs tracking-wider uppercase transition-all cursor-pointer shadow-lg hover:shadow-[#C5A059]/20 self-end sm:self-auto disabled:opacity-50"
              id="simulate-tradeoffs-btn"
            >
              {isSimulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span>{isSimulating ? 'Simulating with Gemini...' : 'Simulate Trade-Offs with Gemini'}</span>
            </button>
          </div>
        </form>

        {/* Inline Error Display */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Simulation Failed</span>
              <span className="text-red-300/80">{errorMessage}</span>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Results Card */}
      {comparison && (
        <div className="space-y-5 animate-in fade-in" id="tradeoff-results-container">
          {/* Top Verdict Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#121212] border border-[#C5A059]/40 p-4 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Gemini Recommendation</span>
                <span className="text-base font-bold text-[#F5F2ED]">{verdict}</span>
              </div>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold">
              Potential Savings: AED {Math.abs(comparison.potentialSavings || 5000).toLocaleString()}
            </div>
          </div>

          {/* Top Score Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-4 rounded-xl bg-[#121212] border border-white/10 space-y-1 shadow-lg">
              <span className="text-[10px] uppercase font-mono text-white/50">Visual Match</span>
              <div className="text-2xl font-bold text-amber-400 font-mono">
                {visualMatch}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 shadow-lg">
              <span className="text-[10px] uppercase font-mono text-emerald-400 font-semibold">Cost Delta</span>
              <div className="text-2xl font-bold text-emerald-300 font-mono">
                {costDelta < 0
                  ? `-AED ${Math.abs(costDelta).toLocaleString()}`
                  : `+AED ${costDelta.toLocaleString()}`}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#121212] border border-white/10 space-y-1 shadow-lg">
              <span className="text-[10px] uppercase font-mono text-white/50">Travel Delta</span>
              <div className="text-2xl font-bold text-cyan-300 font-mono">
                {travelDelta > 0 ? `+${travelDelta}` : travelDelta} Min
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#121212] border border-white/10 space-y-1 shadow-lg">
              <span className="text-[10px] uppercase font-mono text-white/50">Permit Complexity</span>
              <div className="text-xs font-bold text-[#F5F2ED] mt-2 font-mono">
                {permitComparison}
              </div>
            </div>
          </div>

          {/* Side-by-Side Direct Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Location Box */}
            <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-[10px] uppercase font-mono text-white/50 font-semibold">
                  Current: Baseline
                </span>
                <span className="text-xs font-bold text-white font-mono">{comparison.currentLocation?.name || currentLoc.name}</span>
              </div>
              <p className="text-xs text-white/80 italic bg-[#0A0A0A] p-3 rounded-xl border border-white/10 leading-relaxed">
                "{comparison.currentLocation?.notes || currentLoc.directorNotes || 'Baseline selected location for protagonist scene.'}"
              </p>
              <div className="text-xs space-y-1.5 text-white/70 font-mono pt-1">
                <div className="flex justify-between">
                  <span className="text-white/40">Permit Status:</span>
                  <span className="text-emerald-400 font-semibold">{comparison.currentLocation?.permitStatus || 'VERIFIED'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Category:</span>
                  <span className="text-white">{comparison.currentLocation?.category || currentLoc.category || 'Waterfront'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Est. Budget:</span>
                  <span className="text-[#C5A059]">AED {(comparison.currentLocation?.estimatedCost || 18500).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Candidate Location Box */}
            <div className="p-5 rounded-2xl bg-[#C5A059]/5 border border-[#C5A059]/30 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-2.5">
                <span className="text-[10px] uppercase font-mono text-[#C5A059] font-semibold">
                  Candidate Alternative
                </span>
                <span className="text-xs font-bold text-amber-300 font-mono">{comparison.candidateLocation?.name || candidateName}</span>
              </div>
              <p className="text-xs text-[#F5F2ED] italic bg-[#0A0A0A] p-3 rounded-xl border border-[#C5A059]/20 leading-relaxed">
                "{comparison.candidateLocation?.notes || 'Spacious modern boardwalk with direct skyline vista and reduced pedestrian crowding.'}"
              </p>
              <div className="text-xs space-y-1.5 text-white/70 font-mono pt-1">
                <div className="flex justify-between">
                  <span className="text-white/40">Category:</span>
                  <span className="text-white">{comparison.candidateLocation?.category || candidateCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Permit:</span>
                  <span className="text-amber-300 font-semibold">{permitComparison}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Est. Budget:</span>
                  <span className="text-emerald-400 font-semibold">AED {(comparison.candidateLocation?.estimatedCost || 13500).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trade-Off Summary & Verdict */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
              <Sparkles className="h-4 w-4 text-[#C5A059]" />
              <h4 className="font-bold text-white text-xs uppercase font-mono tracking-wider">
                Gemini AI Trade-Off Synthesis & Verdict
              </h4>
            </div>
            <p className="text-xs text-white/90 leading-relaxed bg-[#0A0A0A] p-4 rounded-xl border border-white/10">
              {summaryText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
