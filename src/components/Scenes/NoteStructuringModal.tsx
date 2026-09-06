import React, { useState } from 'react';
import { X, Sparkles, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import type { SceneItem } from '../../types';

interface NoteStructuringModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSceneCreated: (scene: Partial<SceneItem>) => Promise<void>;
}

export const NoteStructuringModal: React.FC<NoteStructuringModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onSceneCreated,
}) => {
  const [rawNote, setRawNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [structuredData, setStructuredData] = useState<{
    shootDay: number;
    sceneNumber: string;
    locationName: string;
    suggestedShootingTime: string;
    timeOfDay: string;
    sceneDescription: string;
    weatherDependency: string;
    lightingDependency: string;
    productionConsiderations: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleStructureNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawNote.trim()) return;

    setIsProcessing(true);
    setStructuredData(null);

    try {
      const res = await api.structureNote(projectId, rawNote);
      if (res.success && res.structuredData) {
        setStructuredData(res.structuredData);
        setModelUsed(res.modelUsed);
      }
    } catch (err: unknown) {
      alert('Failed to structure note: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveScene = async () => {
    if (!structuredData) return;
    setIsSaving(true);
    try {
      const parsedDay =
        typeof structuredData.shootDay === 'number'
          ? structuredData.shootDay
          : parseInt(String(structuredData.shootDay).replace(/\D/g, ''), 10) || 1;

      const cleanSceneNumber = String(structuredData.sceneNumber).replace(/^scene\s*/i, '').trim() || '1';

      await onSceneCreated({
        shootDay: parsedDay,
        sceneNumber: cleanSceneNumber,
        locationName: structuredData.locationName,
        shootingTime: structuredData.suggestedShootingTime,
        timeOfDay: structuredData.timeOfDay as any,
        description: structuredData.sceneDescription,
        directorNotes: `Director vision: ${structuredData.sceneDescription}`,
        producerNotes: structuredData.productionConsiderations,
        cinematographyNotes: {
          lens: '35mm / Anamorphic Low-Light Prime',
          lightingRequirement: structuredData.lightingDependency,
          naturalLightPreference: structuredData.lightingDependency,
          weatherBackup: structuredData.weatherDependency,
          cameraMovement: 'Dynamic tracking shot',
        },
        weatherDependency: structuredData.weatherDependency,
        lightingDependency: structuredData.lightingDependency,
        productionConsiderations: structuredData.productionConsiderations,
      });
      onClose();
    } catch (err: unknown) {
      alert('Failed to save scene: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                AI Natural Language Scene Structurer
              </h3>
              <p className="text-xs text-zinc-400">
                Turn unformatted Director brain-dumps into structured production data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Note input form */}
        <form onSubmit={handleStructureNote} className="space-y-3">
          <label className="text-xs font-semibold text-zinc-300">
            Paste or Type Director Raw Note:
          </label>
          <textarea
            value={rawNote}
            onChange={(e) => setRawNote(e.target.value)}
            placeholder="e.g. Day 1, Scene 1: Character walks along Dubai Marina waterfront at 05:45 AM sunrise facing the rising sun. Golden hour rim light on face. Need marina walkway permit before crowds arrive."
            rows={4}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-700 p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400">
              Multi-Tier AI Resilient Engine
            </span>
            <button
              type="submit"
              disabled={isProcessing || !rawNote.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-semibold text-xs transition-colors shadow"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Analyzing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Extract Parameters</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Structured Results Display */}
        {structuredData && (
          <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/30 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">Extracted Scene Structure</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                Model: {modelUsed}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-300 block">Shoot Day</span>
                <span className="font-bold text-amber-300 font-mono">Day {structuredData.shootDay}</span>
              </div>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-300 block">Scene Number</span>
                <span className="font-bold text-amber-300 font-mono">Scene {structuredData.sceneNumber}</span>
              </div>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-300 block">Shooting Time</span>
                <span className="font-bold text-cyan-300 font-mono">{structuredData.suggestedShootingTime}</span>
              </div>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-300 block">Time of Day</span>
                <span className="font-bold text-white">{structuredData.timeOfDay}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[11px] text-zinc-300 block">Location Name</span>
                <p className="text-white font-medium">{structuredData.locationName}</p>
              </div>

              <div>
                <span className="text-[11px] text-zinc-300 block">Clean Scene Description</span>
                <p className="text-zinc-200 bg-zinc-900 p-2 rounded border border-zinc-800">
                  {structuredData.sceneDescription}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-amber-400 block font-semibold">Lighting & Sun Dependency</span>
                  <p className="text-zinc-300 text-[11px]">{structuredData.lightingDependency}</p>
                </div>
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-emerald-400 block font-semibold">Permit & Logistics Note</span>
                  <p className="text-zinc-300 text-[11px]">{structuredData.productionConsiderations}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveScene}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-colors shadow"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                <span>Add Directly to Shooting Schedule</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
