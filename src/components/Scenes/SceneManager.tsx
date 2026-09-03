import React, { useState } from 'react';
import { Film, Plus, Clock, MapPin, Sparkles, Camera, Sun, Edit, Trash2, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import type { SceneItem, LocationItem, ShootDayItem } from '../../types';

interface SceneManagerProps {
  scenes: SceneItem[];
  locations: LocationItem[];
  shootDays: ShootDayItem[];
  onOpenNoteModal: () => void;
  onAddNewScene: () => void;
  onEditScene: (scene: SceneItem) => void;
}

export const SceneManager: React.FC<SceneManagerProps> = ({
  scenes,
  locations,
  shootDays,
  onOpenNoteModal,
  onAddNewScene,
  onEditScene,
}) => {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [expandedScenes, setExpandedScenes] = useState<Record<string, boolean>>({
    'scene-101': true,
    'scene-102': true,
  });

  const toggleExpand = (sceneId: string) => {
    setExpandedScenes((prev) => ({ ...prev, [sceneId]: !prev[sceneId] }));
  };

  const dayScenes = scenes.filter((s) => s.shootDay === activeDay);
  const currentDayInfo = shootDays.find((d) => d.dayNumber === activeDay);

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif font-light italic text-[#F5F2ED] tracking-tight">Scenes & Shooting Breakdown</h2>
          <p className="text-xs uppercase tracking-widest text-white/40 mt-1 font-light">Synchronized Day-by-Day filming schedule for crew alignment</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNoteModal}
            className="flex items-center gap-2 px-5 py-3 bg-[#C5A059] hover:bg-[#d4b06a] text-black font-bold text-xs uppercase tracking-[0.15em] transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Note Structurer</span>
          </button>
          <button
            onClick={onAddNewScene}
            className="flex items-center gap-2 px-5 py-3 border border-white/20 hover:border-white/40 hover:bg-white/5 text-[#F5F2ED] font-medium text-xs uppercase tracking-[0.15em] transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Scene</span>
          </button>
        </div>
      </div>

      {/* 3-Day Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        {shootDays.map((day) => {
          const count = scenes.filter((s) => s.shootDay === day.dayNumber).length;
          const isActive = activeDay === day.dayNumber;
          return (
            <button
              key={day.dayId}
              onClick={() => setActiveDay(day.dayNumber)}
              className={`flex items-center gap-3 px-5 py-2 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                isActive
                  ? 'bg-[#C5A059] text-black border-[#C5A059] font-bold'
                  : 'bg-transparent text-white/50 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <span>Day {day.dayNumber}</span>
              <span className={`px-2 py-0.5 text-[9px] font-mono ${isActive ? 'bg-black text-[#C5A059]' : 'bg-white/5 text-white/40'}`}>
                {count} scenes
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
          </div>
        </div>
      )}

      {/* Scene Cards List */}
      <div className="space-y-4">
        {dayScenes.length === 0 ? (
          <div className="p-12 text-center border border-white/10 bg-white/[0.01] space-y-4">
            <Film className="h-8 w-8 text-white/30 mx-auto" />
            <p className="text-white/40 text-xs font-light">No scenes scheduled for Day {activeDay} yet.</p>
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
                          <span>{scene.locationName}</span>
                        </div>
                        <span className="text-white/20">|</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-white/60" />
                          <span>{scene.shootingTime}</span>
                        </div>
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

                    {scene.cinematographyNotes && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#070707] border border-white/10 text-[11px]">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">Lens & Camera</span>
                          <span className="text-white/80 font-mono mt-0.5 block">{scene.cinematographyNotes.lens || 'Anamorphic 40mm T2.0'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">Lighting Key</span>
                          <span className="text-white/80 font-light mt-0.5 block">{scene.cinematographyNotes.lightingRequirement || 'Natural Sunrise Rim Light'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">Weather Backup</span>
                          <span className="text-white/80 font-light mt-0.5 block">{scene.cinematographyNotes.weatherBackup || 'Push to Evening Golden Hr'}</span>
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
