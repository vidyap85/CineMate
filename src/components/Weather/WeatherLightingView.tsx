import React, { useState, useEffect } from 'react';
import { Sun, Cloud, Wind, Droplets, Eye, Sparkles, Clock, Compass, AlertCircle, Loader2 } from 'lucide-react';
import type { LocationItem, WeatherData } from '../../types';
import { calculateClientSolarTimes } from '../../lib/sunCalc';
import { api } from '../../lib/api';

interface WeatherLightingViewProps {
  locations: LocationItem[];
}

export const WeatherLightingView: React.FC<WeatherLightingViewProps> = ({ locations }) => {
  const [selectedLoc, setSelectedLoc] = useState<LocationItem>(locations[0] || {} as LocationItem);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [consultQuery, setConsultQuery] = useState('');
  const [isConsulting, setIsConsulting] = useState(false);
  const [adviceText, setAdviceText] = useState<string | null>(null);

  const solar = calculateClientSolarTimes(selectedLoc.latitude || 25.0778, selectedLoc.longitude || 55.1396);

  useEffect(() => {
    if (!selectedLoc.locationId) return;
    setIsLoadingWeather(true);
    api
      .getWeather(
        'project-aurora-001',
        selectedLoc.latitude,
        selectedLoc.longitude,
        selectedLoc.name
      )
      .then((res) => {
        if (res.success && res.weather) {
          setWeather(res.weather);
        }
      })
      .catch((err) => console.warn('Weather fetch warning:', err))
      .finally(() => setIsLoadingWeather(false));
  }, [selectedLoc]);

  const handleConsultAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultQuery.trim()) return;

    setIsConsulting(true);
    setAdviceText(null);

    try {
      const res = await api.getCinematicAdvice('project-aurora-001', {
        locationName: selectedLoc.name,
        targetTime: '05:45 AM',
        targetDate: '2026-09-15',
        weatherData: weather || undefined,
        userQuery: consultQuery,
      });

      if (res.success && res.advice) {
        const a = res.advice;
        setAdviceText(
          `${a.lightingCharacteristics}\n\n• Primary Window: ${a.primaryShootingWindow.start} - ${a.primaryShootingWindow.end} (${a.primaryShootingWindow.description})\n• Backup Window: ${a.backupShootingWindow.start} - ${a.backupShootingWindow.end}\n• Suggested Lenses: ${a.suggestedLenses.join(', ')}\n• Camera Rig & Filtration: ${a.cameraConsiderations}`
        );
      }
    } catch (err: unknown) {
      alert('Cinematic advisor failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsConsulting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Solar Trajectory & Weather Intelligence</h2>
          <p className="text-xs text-zinc-400">
            Astronomical solar elevation calculations, atmospheric forecasting, and DP lighting windows
          </p>
        </div>

        {/* Location Picker */}
        <select
          value={selectedLoc.locationId}
          onChange={(e) => {
            const found = locations.find((l) => l.locationId === e.target.value);
            if (found) setSelectedLoc(found);
          }}
          className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-zinc-100 font-medium"
        >
          {locations.map((loc) => (
            <option key={loc.locationId} value={loc.locationId}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Astronomical Solar Times Visual Grid */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">
              Astronomical Solar Timeline • {selectedLoc.name}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">Date: {solar.date}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-center">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
            <span className="text-[10px] uppercase font-mono text-zinc-300">Dawn (-6°)</span>
            <div className="text-sm font-bold text-white font-mono">{solar.dawn}</div>
            <span className="text-[10px] text-zinc-300">Sky starts brightening</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
            <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold">Morning Golden Hr</span>
            <div className="text-sm font-bold text-amber-300 font-mono">
              {solar.morningGoldenHourStart} - {solar.morningGoldenHourEnd}
            </div>
            <span className="text-[10px] text-amber-300/80">Prime warm directional key</span>
          </div>

          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-1">
            <span className="text-[10px] uppercase font-mono text-cyan-400 font-semibold">Morning Blue Hr</span>
            <div className="text-sm font-bold text-cyan-300 font-mono">
              {solar.morningBlueHourStart} - {solar.morningBlueHourEnd}
            </div>
            <span className="text-[10px] text-cyan-300/80">Deep indigo mood</span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
            <span className="text-[10px] uppercase font-mono text-zinc-300">Solar Noon</span>
            <div className="text-sm font-bold text-white font-mono">{solar.solarNoon}</div>
            <span className="text-[10px] text-zinc-300">Requires overhead silk</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
            <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold">Evening Golden Hr</span>
            <div className="text-sm font-bold text-amber-300 font-mono">
              {solar.eveningGoldenHourStart} - {solar.eveningGoldenHourEnd}
            </div>
            <span className="text-[10px] text-amber-300/80">Warm horizon rim light</span>
          </div>

          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-1">
            <span className="text-[10px] uppercase font-mono text-cyan-400 font-semibold">Evening Blue Hr</span>
            <div className="text-sm font-bold text-cyan-300 font-mono">
              {solar.eveningBlueHourStart} - {solar.eveningBlueHourEnd}
            </div>
            <span className="text-[10px] text-cyan-300/80">25 min twilight gradient</span>
          </div>
        </div>
      </div>

      {/* Atmospheric Microclimate & Weather Card */}
      {weather && (
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">Microclimate & Atmospheric Forecast</h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">
              {weather.isSimulated ? 'Microclimate Model' : 'Live Station'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-300 block">Temperature</span>
              <div className="text-base font-bold text-white font-mono">
                {weather.temperatureC}°C ({weather.temperatureF}°F)
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-300 block">Atmosphere</span>
              <div className="text-xs font-bold text-zinc-200">{weather.condition}</div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-300 block">Cloud Cover</span>
              <div className="text-base font-bold text-cyan-300 font-mono">{weather.cloudCoverPercentage}%</div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-300 block">Rain Probability</span>
              <div className="text-base font-bold text-emerald-400 font-mono">{weather.rainProbability}%</div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-300 block">Wind Velocity</span>
              <div className="text-base font-bold text-amber-300 font-mono">{weather.windSpeedKmh} km/h</div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-300 block">UV Index</span>
              <div className="text-base font-bold text-white font-mono">{weather.uvIndex}</div>
            </div>
          </div>
        </div>
      )}

      {/* AI Cinematic Advisor interactive prompt */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">Consult Master Cinematographer (AI DP)</h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">ASC/BSC Expert Guidance</span>
        </div>

        <form onSubmit={handleConsultAdvisor} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={consultQuery}
              onChange={(e) => setConsultQuery(e.target.value)}
              placeholder="e.g. Is 05:45 AM a good time to shoot an anamorphic tracking shot at Dubai Marina?"
              className="flex-1 rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isConsulting || !consultQuery.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-zinc-950 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-lg shadow-cyan-950/40"
            >
              {isConsulting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              <span>Ask AI DP</span>
            </button>
          </div>
        </form>

        {adviceText && (
          <div className="p-4 rounded-xl bg-zinc-950 border border-cyan-500/30 text-xs text-zinc-200 whitespace-pre-line leading-relaxed font-sans animate-in fade-in">
            {adviceText}
          </div>
        )}
      </div>
    </div>
  );
};
