import React, { useState } from 'react';
import { Sun, CloudRain, Wind, Eye, Compass, Camera, Sparkles, Clock, ArrowRight, Loader2 } from 'lucide-react';
import type { LocationItem, SceneItem, WeatherData } from '../../types';
import { calculateClientSolarTimes } from '../../lib/sunCalc';
import { api } from '../../lib/api';

interface CinematographerDashboardProps {
  locations: LocationItem[];
  scenes: SceneItem[];
  setActiveTab: (tab: string) => void;
}

export const CinematographerDashboard: React.FC<CinematographerDashboardProps> = ({
  locations,
  scenes,
  setActiveTab,
}) => {
  const [selectedLoc, setSelectedLoc] = useState<LocationItem>(locations[0] || {} as LocationItem);
  const [advisorQuery, setAdvisorQuery] = useState('');
  const [isAdvising, setIsAdvising] = useState(false);
  const [adviceResult, setAdviceResult] = useState<string | null>(null);

  const solar = calculateClientSolarTimes(selectedLoc.latitude || 25.0778, selectedLoc.longitude || 55.1396);

  const handleAskAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorQuery.trim()) return;

    setIsAdvising(true);
    setAdviceResult(null);

    try {
      const res = await api.getCinematicAdvice('project-aurora-001', {
        locationName: selectedLoc.name,
        targetTime: '05:45 AM',
        targetDate: '2026-09-15',
        userQuery: advisorQuery,
      });

      if (res.success && res.advice) {
        setAdviceResult(
          `${res.advice.lightingCharacteristics}\n\n• Primary Window: ${res.advice.primaryShootingWindow.start} - ${res.advice.primaryShootingWindow.end} (${res.advice.primaryShootingWindow.description})\n• Lenses: ${res.advice.suggestedLenses.join(', ')}\n• Camera Notes: ${res.advice.cameraConsiderations}`
        );
      }
    } catch (err: unknown) {
      alert('Cinematic advisor failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsAdvising(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* DP Header */}
      <div className="rounded-none bg-gradient-to-r from-[#12100B] via-[#0E0E0E] to-[#0A0A0A] border border-white/10 p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-none bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 text-[10px] font-mono uppercase tracking-[0.2em]">
                CINEMATOGRAPHY INTELLIGENCE
              </span>
              <span className="text-[11px] uppercase tracking-widest text-white/40">Marcus Thorne • Director of Photography</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-serif font-light italic text-[#F5F2ED] tracking-tight">
              Solar Trajectory & Atmospheric Lighting Planner
            </h1>
            <p className="text-xs text-white/60 leading-relaxed max-w-xl font-light tracking-wide">
              Astronomical sunrise, golden hour, and blue hour calculations paired with cloud cover forecasting, lens recommendations, and lighting risk assessments.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('weather_lighting')}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-[#C5A059] hover:bg-[#d4b06a] text-black font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-sm cursor-pointer"
          >
            <Sun className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Solar & Weather Suite</span>
          </button>
        </div>
      </div>

      {/* Location Selector Pill Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 shrink-0 font-mono">Location:</span>
        {locations.map((loc) => (
          <button
            key={loc.locationId}
            onClick={() => setSelectedLoc(loc)}
            className={`px-4 py-1.5 rounded-none text-xs uppercase tracking-wider font-mono whitespace-nowrap transition-all border cursor-pointer ${
              selectedLoc.locationId === loc.locationId
                ? 'bg-[#C5A059]/15 text-[#C5A059] border-[#C5A059]/50 font-medium'
                : 'bg-transparent text-white/50 border-white/10 hover:text-white/80 hover:border-white/20'
            }`}
          >
            {loc.name}
          </button>
        ))}
      </div>

      {/* Astronomical Solar Times Grid */}
      <div className="rounded-none border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sun className="h-4 w-4 text-[#C5A059]" />
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F5F2ED]">
              Astronomical Lighting Windows • {selectedLoc.name}
            </h2>
          </div>
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
            {selectedLoc.latitude?.toFixed(4)}° N, {selectedLoc.longitude?.toFixed(4)}° E
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-center">
          <div className="p-4 rounded-none bg-[#080808] border border-white/10 space-y-1.5">
            <span className="text-[9px] uppercase font-mono text-white/40 tracking-wider">Astro Dawn</span>
            <div className="text-sm font-light text-[#F5F2ED] font-mono">{solar.dawn}</div>
            <span className="text-[10px] text-white/30 tracking-wider">Sun -6°</span>
          </div>

          <div className="p-4 rounded-none bg-[#C5A059]/10 border border-[#C5A059]/30 space-y-1.5">
            <span className="text-[9px] uppercase font-mono text-[#C5A059] font-medium tracking-wider">AM Golden Hr</span>
            <div className="text-sm font-medium text-[#C5A059] font-mono">
              {solar.morningGoldenHourStart} - {solar.morningGoldenHourEnd}
            </div>
            <span className="text-[10px] text-[#C5A059]/70 tracking-wider">Direct Rim Light</span>
          </div>

          <div className="p-4 rounded-none bg-white/5 border border-white/15 space-y-1.5">
            <span className="text-[9px] uppercase font-mono text-white/70 font-medium tracking-wider">AM Blue Hr</span>
            <div className="text-sm font-light text-[#F5F2ED] font-mono">
              {solar.morningBlueHourStart} - {solar.morningBlueHourEnd}
            </div>
            <span className="text-[10px] text-white/40 tracking-wider">Indigo Sky</span>
          </div>

          <div className="p-4 rounded-none bg-[#080808] border border-white/10 space-y-1.5">
            <span className="text-[9px] uppercase font-mono text-white/40 tracking-wider">Solar Noon</span>
            <div className="text-sm font-light text-[#F5F2ED] font-mono">{solar.solarNoon}</div>
            <span className="text-[10px] text-white/30 tracking-wider">Top Harsh</span>
          </div>

          <div className="p-4 rounded-none bg-[#C5A059]/10 border border-[#C5A059]/30 space-y-1.5">
            <span className="text-[9px] uppercase font-mono text-[#C5A059] font-medium tracking-wider">PM Golden Hr</span>
            <div className="text-sm font-medium text-[#C5A059] font-mono">
              {solar.eveningGoldenHourStart} - {solar.eveningGoldenHourEnd}
            </div>
            <span className="text-[10px] text-[#C5A059]/70 tracking-wider">Amber Gradient</span>
          </div>

          <div className="p-4 rounded-none bg-white/5 border border-white/15 space-y-1.5">
            <span className="text-[9px] uppercase font-mono text-white/70 font-medium tracking-wider">PM Blue Hr</span>
            <div className="text-sm font-light text-[#F5F2ED] font-mono">
              {solar.eveningBlueHourStart} - {solar.eveningBlueHourEnd}
            </div>
            <span className="text-[10px] text-white/40 tracking-wider">Twilight Sky</span>
          </div>
        </div>
      </div>

      {/* AI Cinematic Advisor Box */}
      <div className="rounded-none border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-[#C5A059]" />
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F5F2ED]">AI Cinematic Advisor Consultation</h2>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">ASC / BSC Lighting Protocol</span>
        </div>

        <form onSubmit={handleAskAdvisor} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={advisorQuery}
              onChange={(e) => setAdvisorQuery(e.target.value)}
              placeholder="e.g. Is 05:45 AM a good time to shoot an anamorphic tracking shot at Dubai Marina?"
              className="flex-1 rounded-none bg-[#070707] border border-white/15 px-4 py-3 text-xs text-[#F5F2ED] placeholder-white/25 focus:outline-none focus:border-[#C5A059] font-light tracking-wide"
            />
            <button
              type="submit"
              disabled={isAdvising || !advisorQuery.trim()}
              className="px-6 py-3 bg-[#C5A059] hover:bg-[#d4b06a] disabled:opacity-40 text-black font-bold text-xs uppercase tracking-[0.2em] transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isAdvising ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              <span>Consult Advisor</span>
            </button>
          </div>
        </form>

        {adviceResult && (
          <div className="p-5 rounded-none bg-[#080808] border border-[#C5A059]/40 text-xs text-[#F5F2ED]/90 whitespace-pre-line leading-relaxed font-light tracking-wide animate-in fade-in">
            {adviceResult}
          </div>
        )}
      </div>
    </div>
  );
};
