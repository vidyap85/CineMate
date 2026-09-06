import React, { useState } from 'react';
import { Film, Sparkles, MapPin, Clock, Sun, Send, Plus, ArrowRight, Loader2, CheckCircle2, Navigation } from 'lucide-react';
import type { FilmProject, LocationItem, SceneItem, ShootDayItem } from '../../types';
import { api } from '../../lib/api';
import { CurrentLocationModal } from '../Locations/CurrentLocationModal';

interface DirectorDashboardProps {
  project: FilmProject;
  locations: LocationItem[];
  scenes: SceneItem[];
  shootDays: ShootDayItem[];
  onOpenNoteModal: () => void;
  setActiveTab: (tab: string) => void;
  onRefreshData: () => void;
}

export const DirectorDashboard: React.FC<DirectorDashboardProps> = ({
  project,
  locations,
  scenes,
  shootDays,
  onOpenNoteModal,
  setActiveTab,
  onRefreshData,
}) => {
  const [quickNote, setQuickNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCurrentLocModalOpen, setIsCurrentLocModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleQuickStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;

    setIsProcessing(true);
    setSuccessBanner(null);

    try {
      const res = await api.structureNote(project.projectId, quickNote);
      if (res.success && res.structuredData) {
        // Automatically save as a new scene
        const sd = res.structuredData;
        await api.createScene(project.projectId, {
          shootDay: sd.shootDay || 1,
          sceneNumber: sd.sceneNumber || String(scenes.length + 1),
          locationName: sd.locationName,
          shootingTime: sd.suggestedShootingTime,
          timeOfDay: (['Sunrise', 'Morning', 'Midday', 'Golden Hour', 'Sunset', 'Blue Hour', 'Night', 'Interior Day', 'Interior Night'].includes(sd.timeOfDay)
            ? sd.timeOfDay
            : 'Golden Hour') as any,
          description: sd.sceneDescription,
          directorNotes: `Weather: ${sd.weatherDependency}. Lighting: ${sd.lightingDependency}`,
          weatherDependency: sd.weatherDependency,
          lightingDependency: sd.lightingDependency,
          productionConsiderations: sd.productionConsiderations,
        });

        setQuickNote('');
        setSuccessBanner(`Added Scene ${sd.sceneNumber} (${sd.locationName}) via Gemini AI!`);
        onRefreshData();
      }
    } catch (err: unknown) {
      console.error(err);
      alert('Failed to process note: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-none bg-gradient-to-r from-[#12100B] via-[#0E0E0E] to-[#0A0A0A] border border-white/10 p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-none bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 text-[10px] font-mono uppercase tracking-[0.2em]">
                DIRECTOR COMMAND CENTER
              </span>
              <span className="text-[11px] uppercase tracking-widest text-white/40">Project Aurora</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-serif font-light italic text-[#F5F2ED] tracking-tight">
              From Location Scout to Shooting Plan
            </h1>
            <p className="text-xs text-white/60 leading-relaxed max-w-xl font-light tracking-wide">
              Capture freeform scene ideas, pin filming locations, and transform natural director vision notes into a synchronized 3-day production timeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCurrentLocModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3.5 bg-[#C5A059]/15 hover:bg-[#C5A059]/25 text-[#C5A059] border border-[#C5A059]/40 font-bold text-xs uppercase tracking-[0.15em] transition-all cursor-pointer shadow-sm"
              id="director-pin-current-spot-btn"
              title="Pin your current GPS location and analyze filming viability"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>Pin Current Spot</span>
            </button>
            <button
              onClick={onOpenNoteModal}
              className="flex items-center gap-2 px-6 py-3.5 bg-[#C5A059] hover:bg-[#d4b06a] text-black font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-sm cursor-pointer"
              id="director-open-note-modal-btn"
            >
              <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>AI Note Structurer</span>
            </button>
            <button
              onClick={() => setActiveTab('master_report')}
              className="flex items-center gap-2 px-6 py-3.5 border border-white/20 hover:border-white/40 hover:bg-white/5 text-[#F5F2ED] text-xs uppercase tracking-[0.15em] font-medium transition-all"
            >
              <Film className="h-3.5 w-3.5 text-[#C5A059]" />
              <span>Shooting Report</span>
            </button>
          </div>
        </div>
      </div>

      {successBanner && (
        <div className="flex items-center gap-2 p-3.5 rounded-none bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] text-xs font-mono uppercase tracking-wider animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Quick AI Note Ingestion Box */}
      <div className="rounded-none border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-[#C5A059]" />
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F5F2ED]">Quick Director Vision Ingestion</h2>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">AI Structured Analysis</span>
        </div>

        <form onSubmit={handleQuickStructure} className="space-y-4">
          <textarea
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            placeholder="e.g. Day 1, Scene 1: Character walks along Dubai Marina waterfront at 05:45 AM sunrise facing the rising sun. Golden hour rim light on face. Need marina walkway permit before crowds arrive."
            className="w-full h-24 rounded-none bg-[#070707] border border-white/15 p-4 text-xs text-[#F5F2ED] placeholder-white/25 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all resize-none font-light tracking-wide leading-relaxed"
            id="director-quick-note-textarea"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-[11px] text-white/40 max-w-xl font-light">
              Type freely in natural language — CineMate automatically parses Shoot Day, Scene #, Location, Time, Lighting, and Permit parameters.
            </p>
            <button
              type="submit"
              disabled={isProcessing || !quickNote.trim()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#C5A059] hover:bg-[#d4b06a] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-xs uppercase tracking-[0.2em] transition-all cursor-pointer shadow-sm shrink-0"
              id="director-quick-structure-btn"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Structuring...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Structure & Save</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Production Timeline Grid: Day 1, Day 2, Day 3 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-light text-[#F5F2ED] tracking-wide">3-Day Shooting Timeline</h2>
            <p className="text-[11px] uppercase tracking-widest text-white/40 mt-0.5">Scene distribution across scouted locations</p>
          </div>
          <button
            onClick={() => setActiveTab('scenes')}
            className="text-xs uppercase tracking-[0.15em] text-[#C5A059] hover:text-[#d4b06a] flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <span>Manage Scenes</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {shootDays.map((day) => {
            const dayScenes = scenes.filter((s) => s.shootDay === day.dayNumber);
            return (
              <div
                key={day.dayId}
                className="rounded-none border border-white/10 bg-white/[0.015] p-5 space-y-4 hover:border-white/20 transition-colors overflow-hidden"
              >
                <div className="border-b border-white/10 pb-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-none bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 font-medium shrink-0">
                      Day {day.dayNumber}
                    </span>
                    <span className="text-[11px] font-mono text-white/50 bg-white/[0.03] px-2 py-0.5 border border-white/10 shrink-0 whitespace-nowrap">
                      {day.date}
                    </span>
                  </div>
                  <h3
                    className="font-serif text-base font-normal text-[#F5F2ED] leading-snug line-clamp-2"
                    title={day.title}
                  >
                    {day.title}
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-white/50 uppercase tracking-wider font-mono">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Clock className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>Call: {day.callTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Film className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>{dayScenes.length} Scene(s)</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  {dayScenes.map((sc) => (
                    <div
                      key={sc.sceneId}
                      className="p-3 rounded-none bg-[#080808] border border-white/10 text-xs space-y-1.5 hover:border-[#C5A059]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[#C5A059] font-mono text-[11px]">Scene {sc.sceneNumber}</span>
                        <span className="text-[10px] uppercase tracking-wider text-white/40">{sc.shootingTime} • {sc.timeOfDay}</span>
                      </div>
                      <p className="text-white/80 line-clamp-2 text-xs leading-relaxed font-light">{sc.description}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-white/40 truncate pt-1">
                        <MapPin className="h-3 w-3 text-[#C5A059] shrink-0" />
                        <span className="truncate">{sc.locationName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pinned Locations Preview */}
      <div className="rounded-none border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 text-[#C5A059]" />
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F5F2ED]">Scouted Locations ({locations.length})</h2>
          </div>
          <button
            onClick={() => setActiveTab('locations')}
            className="text-xs uppercase tracking-[0.15em] text-[#C5A059] hover:text-[#d4b06a] flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <span>Interactive Map & Grid</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {locations.map((loc) => (
            <div
              key={loc.locationId}
              onClick={() => setActiveTab('locations')}
              className="p-4 rounded-none bg-[#080808] border border-white/10 hover:border-[#C5A059]/50 transition-all cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-none bg-white/5 text-white/60 border border-white/10">
                  {loc.category}
                </span>
                <span className="text-[10px] text-[#C5A059] font-medium tracking-wider uppercase">{loc.permitStatus}</span>
              </div>
              <h4 className="font-serif font-normal text-sm text-[#F5F2ED] truncate">{loc.name}</h4>
              <p className="text-[11px] text-white/40 truncate font-light">{loc.address}</p>
              <div className="text-[10px] text-white/50 font-mono pt-2 border-t border-white/5">
                Est: {loc.estimatedCostRange.currency} {loc.estimatedCostRange.low.toLocaleString()} - {loc.estimatedCostRange.high.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current GPS Location Scouting Modal */}
      <CurrentLocationModal
        isOpen={isCurrentLocModalOpen}
        onClose={() => setIsCurrentLocModalOpen(false)}
        onSaveLocation={async (loc) => {
          try {
            await api.createLocation(project.projectId, {
              ...loc,
              estimatedCostRange: loc.estimatedCostRange || { low: 3000, expected: 8000, high: 15000, currency: 'AED' },
              shootingDays: loc.shootingDays || [1],
            });
            setSuccessBanner(`Pinned "${loc.name}" to Project Aurora locations!`);
            onRefreshData();
            setTimeout(() => setSuccessBanner(null), 5000);
          } catch (err: unknown) {
            alert('Failed to save location: ' + (err instanceof Error ? err.message : String(err)));
          }
        }}
      />
    </div>
  );
};
