import React, { useState } from 'react';
import { Film, Plus, Clock, MapPin, Sparkles, Camera, Sun, Edit, Trash2, ChevronDown, ChevronRight, Layers, ShieldCheck } from 'lucide-react';
import type { SceneItem, LocationItem, ShootDayItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SceneManagerProps {
  scenes: SceneItem[];
  locations: LocationItem[];
  shootDays: ShootDayItem[];
  userRole?: string;
  activeDay?: number;
  onSelectDay?: (day: number) => void;
  onOpenNoteModal: () => void;
  onAddNewScene: () => void;
  onEditScene: (scene: SceneItem) => void;
}

export const SceneManager: React.FC<SceneManagerProps> = ({
  scenes,
  locations,
  shootDays,
  userRole,
  activeDay: propActiveDay,
  onSelectDay,
  onOpenNoteModal,
  onAddNewScene,
  onEditScene,
}) => {
  const { userRole: authRole } = useAuth();
  const effectiveRole = userRole || authRole;
  const canAddScene = effectiveRole !== 'PRODUCER' && effectiveRole !== 'CINEMATOGRAPHER';

  const [internalDay, setInternalDay] = useState<number>(1);
  const activeDay = propActiveDay ?? internalDay;
  const setActiveDay = (day: number) => {
    setInternalDay(day);
    if (onSelectDay) onSelectDay(day);
  };

  const [expandedScenes, setExpandedScenes] = useState<Record<string, boolean>>({
    'scene-101': true,
    'scene-102': true,
  });

  const toggleExpand = (sceneId: string) => {
    setExpandedScenes((prev) => ({ ...prev, [sceneId]: !prev[sceneId] }));
  };

  // Derive all unique day numbers from both shootDays and scenes
  const dayNumbers = Array.from(
    new Set([
      ...shootDays.map((d) => d.dayNumber),
      ...scenes.map((s) => s.shootDay),
    ])
  ).sort((a, b) => a - b);

  // If activeDay is not in dayNumbers, fallback safely
  const effectiveDay = dayNumbers.includes(activeDay) ? activeDay : (dayNumbers[0] || 1);
  const dayScenes = scenes.filter((s) => s.shootDay === effectiveDay);
  const matchedDayInfo = shootDays.find((d) => d.dayNumber === effectiveDay);

  const currentDayInfo: ShootDayItem = matchedDayInfo || {
    dayId: `day-${effectiveDay}`,
    projectId: 'project-aurora-001',
    dayNumber: effectiveDay,
    date: '2026-09-18',
    title: `Shoot Day ${effectiveDay}: Location Production Schedule`,
    callTime: dayScenes[0]?.shootingTime || '06:00 AM',
    wrapTime: '06:00 PM',
    sceneIds: dayScenes.map((s) => s.sceneId),
    totalEstimatedCost: 28000,
    travelTimeMinutes: 30,
    notes: `${dayScenes.length} scheduled scene(s) for Day ${effectiveDay}`,
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-3xl font-serif font-light italic text-[#F5F2ED] tracking-tight">Scenes & Shooting Breakdown</h2>
            {effectiveRole === 'PRODUCER' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Producer Schedule Sync
              </span>
            )}
            {effectiveRole === 'CINEMATOGRAPHER' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Cinematographer Shot List
              </span>
            )}
          </div>
          <p className="text-xs uppercase tracking-widest text-white/40 font-light">
            Synchronized Day-by-Day filming schedule across Director, Producer, and Cinematographer logins
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="ai-note-structurer-button"
            onClick={onOpenNoteModal}
            className="flex items-center gap-2 px-5 py-3 bg-[#C5A059] hover:bg-[#d4b06a] text-black font-bold text-xs uppercase tracking-[0.15em] transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Note Structurer</span>
          </button>
          {canAddScene && (
            <button
              id="add-scene-button"
              onClick={onAddNewScene}
              className="flex items-center gap-2 px-5 py-3 border border-white/20 hover:border-white/40 hover:bg-white/5 text-[#F5F2ED] font-medium text-xs uppercase tracking-[0.15em] transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Scene</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Shoot Day Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
        {(dayNumbers.length > 0 ? dayNumbers : [1]).map((dayNum) => {
          const count = scenes.filter((s) => s.shootDay === dayNum).length;
          const isActive = effectiveDay === dayNum;
          return (
            <button
              key={`shoot-day-tab-${dayNum}`}
              onClick={() => setActiveDay(dayNum)}
              id={`tab-shoot-day-${dayNum}`}
              className={`flex items-center gap-3 px-5 py-2 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer border shrink-0 ${
                isActive
                  ? 'bg-[#C5A059] text-black border-[#C5A059] font-bold'
                  : 'bg-transparent text-white/50 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <span>Day {dayNum}</span>
              <span className={`px-2 py-0.5 text-[9px] font-mono ${isActive ? 'bg-black text-[#C5A059]' : 'bg-white/5 text-white/40'}`}>
                {count} {count === 1 ? 'scene' : 'scenes'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Day Overview Strip */}
      {currentDayInfo && (
        <div className="p-5 bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-light text-[#F5F2ED]">
              Day {currentDayInfo.dayNumber}: {currentDayInfo.title}
            </h3>
            <p className="text-white/50 text-[11px] font-light">{currentDayInfo.notes}</p>
          </div>
          <div className="flex items-center gap-4 text-white/70 font-mono text-[11px] uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-[#C5A059]" />
              <span>Call: {currentDayInfo.callTime} • Wrap: {currentDayInfo.wrapTime}</span>
            </div>
            {currentDayInfo.totalEstimatedCost ? (
              <span className="text-white/40 text-[10px]">Est. Budget: AED {currentDayInfo.totalEstimatedCost.toLocaleString()}</span>
            ) : null}
          </div>
        </div>
      )}

      {/* Scene Cards List */}
      <div className="space-y-4">
        {dayScenes.length === 0 ? (
          <div className="p-12 text-center border border-white/10 bg-white/[0.01] space-y-4">
            <Film className="h-8 w-8 text-white/30 mx-auto" />
            <p className="text-white/40 text-xs font-light">No scenes scheduled for Day {effectiveDay} yet.</p>
            <button
              onClick={onOpenNoteModal}
              className="px-5 py-2.5 bg-[#C5A059] text-black font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Paste Director Note to Add</span>
            </button>
          </div>
        ) : (
          dayScenes.map((scene) => {
            const isExpanded = expandedScenes[scene.sceneId] ?? true;
            return (
              <div
                key={scene.sceneId}
                className="border border-white/10 bg-white/[0.015] p-5 space-y-4 hover:border-white/20 transition-all"
              >
                <div
                  onClick={() => toggleExpand(scene.sceneId)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <span className="h-8 w-8 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 flex items-center justify-center font-mono font-bold text-xs">
                      {scene.sceneNumber}
                    </span>
                    <div>
                      <h4 className="font-serif text-lg font-light text-[#F5F2ED] flex items-center gap-2">
                        <span>Scene {scene.sceneNumber}</span>
                        <span className="text-white/30 font-sans text-xs">•</span>
                        <span className="text-white/50 text-xs font-sans uppercase tracking-wider">{scene.timeOfDay}</span>
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-white/50 mt-0.5">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#C5A059]" />
                          <span className="text-[#F5F2ED]">{scene.locationName}</span>
                        </div>
                        <span className="text-white/20">|</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-white/60" />
                          <span>{scene.shootingTime}</span>
                        </div>
                        <span className="text-white/20">|</span>
                        <span className="text-[10px] text-white/40">Day {scene.shootDay}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditScene(scene);
                      }}
                      className="p-2 border border-white/10 hover:border-white/30 hover:bg-white/5 text-white/60 hover:text-white transition-colors cursor-pointer"
                      title="Edit Scene"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-white/40" /> : <ChevronRight className="h-4 w-4 text-white/40" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="space-y-4 pt-4 border-t border-white/10 text-xs animate-in fade-in">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-mono text-white/40 block">Description & Action</span>
                      <p className="text-white/80 font-light mt-1 leading-relaxed">{scene.description}</p>
                    </div>

                    {scene.directorNotes && (
                      <div className="p-4 bg-[#070707] border border-white/10">
                        <span className="text-[9px] uppercase font-mono text-[#C5A059] font-medium tracking-widest block">
                          Director Vision Note
                        </span>
                        <p className="text-white/70 text-[11px] mt-1 italic font-light leading-relaxed">"{scene.directorNotes}"</p>
                      </div>
                    )}

                    {/* Producer & Clearance Note */}
                    {(scene.producerNotes || scene.productionConsiderations) && (
                      <div className="p-4 bg-[#070707] border border-emerald-500/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] uppercase font-mono text-emerald-400 font-medium tracking-widest flex items-center gap-1.5">
                            <ShieldCheck className="h-3 w-3" />
                            Producer & Logistics Clearance Note
                          </span>
                          <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/20">
                            Visible to Producer
                          </span>
                        </div>
                        <p className="text-white/80 text-[11px] font-light leading-relaxed">
                          {scene.producerNotes || scene.productionConsiderations}
                        </p>
                      </div>
                    )}

                    {/* Cinematography & Lighting Breakdown */}
                    {(scene.cinematographyNotes || scene.lightingDependency || scene.weatherDependency) && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 flex items-center gap-1">
                            <Camera className="h-3 w-3 text-[#C5A059]" />
                            <span>Cinematography & Lighting Specs</span>
                          </span>
                          <span className="text-[9px] font-mono uppercase tracking-wider text-[#C5A059]/80 bg-[#C5A059]/10 px-1.5 py-0.5 border border-[#C5A059]/20">
                            Visible to Cinematographer
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#070707] border border-white/10 text-[11px]">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">Lens & Camera</span>
                            <span className="text-white/80 font-mono mt-0.5 block">{scene.cinematographyNotes?.lens || '35mm / Anamorphic Prime'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">Lighting Key</span>
                            <span className="text-white/80 font-light mt-0.5 block">
                              {scene.cinematographyNotes?.lightingRequirement || scene.lightingDependency || 'Natural Lighting Key'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">Weather Backup</span>
                            <span className="text-white/80 font-light mt-0.5 block">
                              {scene.cinematographyNotes?.weatherBackup || scene.weatherDependency || 'Cover set backup'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
