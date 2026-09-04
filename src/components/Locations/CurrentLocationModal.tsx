import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Compass,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Navigation,
  Sun,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import type { LocationItem } from '../../types';
import { api } from '../../lib/api';

interface CurrentLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLocation: (loc: Partial<LocationItem>) => Promise<void>;
}

export const CurrentLocationModal: React.FC<CurrentLocationModalProps> = ({
  isOpen,
  onClose,
  onSaveLocation,
}) => {
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'acquiring' | 'success' | 'error'>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number | null }>({
    lat: 25.2655,
    lng: 55.2974,
    accuracy: null,
  });
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [directorNote, setDirectorNote] = useState(
    'Spotted on the road: Old Kerala-style courtyard house with timber porch, textured laterite stone walls, and clay tile roof. Looks viable for night exterior.'
  );
  const [customName, setCustomName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scoutedPreview, setScoutedPreview] = useState<{
    name: string;
    address: string;
    category: LocationItem['category'];
    notes: string;
    lightingNotes: string;
    permitStatus: 'VERIFIED' | 'USER_PROVIDED' | 'AI_ESTIMATE' | 'UNVERIFIED';
    permitAdvice: string;
    estimatedCostRange: { low: number; expected: number; high: number; currency: string };
    suggestedShootingDay: number;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Trigger GPS acquisition when modal opens
  useEffect(() => {
    if (isOpen) {
      setGpsError(null);
      setScoutedPreview(null);
      acquireGpsPosition();
    }
  }, [isOpen]);

  const acquireGpsPosition = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsError('Geolocation is not supported by your browser. Using manual coordinates.');
      return;
    }

    setGpsStatus('acquiring');
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        });
        setGpsStatus('success');
      },
      (err) => {
        let msg = 'Unable to retrieve your current location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can enable it in your browser settings or adjust coordinates manually below.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'GPS signal is currently unavailable.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Retrying or adjust coordinates manually.';
        }
        setGpsStatus('error');
        setGpsError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  };

  const handleAnalyzeWithAI = async () => {
    setIsAnalyzing(true);
    try {
      const res = await api.reverseScoutCurrentLocation('project-aurora-001', {
        latitude: coords.lat,
        longitude: coords.lng,
        accuracy: coords.accuracy || undefined,
        userNote: directorNote,
      });

      if (res.success && res.location) {
        setScoutedPreview(res.location);
        if (!customName) {
          setCustomName(res.location.name);
        }
      }
    } catch (err: unknown) {
      alert('AI reverse scouting failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    try {
      const locToSave: Partial<LocationItem> = {
        name: customName.trim() || scoutedPreview?.name || 'Field Scouted Spot',
        address: scoutedPreview?.address || `GPS ${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E`,
        latitude: coords.lat,
        longitude: coords.lng,
        category: scoutedPreview?.category || 'Heritage',
        notes: scoutedPreview?.notes || directorNote,
        lightingNotes: scoutedPreview?.lightingNotes || 'Spotted on location during scout. Evaluate sun angle.',
        permitStatus: 'USER_PROVIDED',
        estimatedCostRange: scoutedPreview?.estimatedCostRange || {
          low: 3000,
          expected: 8000,
          high: 15000,
          currency: 'AED',
        },
        shootingDays: [scoutedPreview?.suggestedShootingDay || 1],
      };

      await onSaveLocation(locToSave);
      onClose();
    } catch (err: unknown) {
      alert('Failed to pin location: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#0A0A0A] border border-[#C5A059]/40 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/40">
              <Navigation className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-2xl font-light text-[#F5F2ED]">
                  Pin Current Location
                </h3>
                <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30">
                  Live Field Scout
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-mono mt-0.5">
                Instant GPS capture & AI site intelligence for on-the-go directors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer border border-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* GPS Satellite Lock Status Bar */}
        <div className="p-4 bg-white/[0.02] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-white/50 flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-[#C5A059]" />
              <span>Satellite GPS Coordinates</span>
            </span>

            {gpsStatus === 'acquiring' && (
              <span className="text-[10px] font-mono text-[#C5A059] flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Acquiring satellite fix...</span>
              </span>
            )}
            {gpsStatus === 'success' && (
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>GPS Locked {coords.accuracy ? `(±${coords.accuracy}m)` : ''}</span>
              </span>
            )}
            {gpsStatus === 'error' && (
              <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span>Manual Override</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#070707] border border-white/10 p-2.5">
              <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">Latitude (N)</span>
              <input
                type="number"
                step="any"
                value={coords.lat}
                onChange={(e) => setCoords({ ...coords, lat: parseFloat(e.target.value) || 0 })}
                className="w-full bg-transparent font-mono text-xs text-[#C5A059] focus:outline-none mt-0.5"
              />
            </div>
            <div className="bg-[#070707] border border-white/10 p-2.5">
              <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">Longitude (E)</span>
              <input
                type="number"
                step="any"
                value={coords.lng}
                onChange={(e) => setCoords({ ...coords, lng: parseFloat(e.target.value) || 0 })}
                className="w-full bg-transparent font-mono text-xs text-[#C5A059] focus:outline-none mt-0.5"
              />
            </div>
          </div>

          {gpsError && (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] leading-relaxed">
              {gpsError}
              <button
                onClick={acquireGpsPosition}
                className="ml-2 underline font-mono text-[10px] text-white hover:text-[#C5A059] cursor-pointer"
              >
                Retry GPS
              </button>
            </div>
          )}
        </div>

        {/* Director Field Observation Note */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-mono text-white/60 flex items-center justify-between">
            <span>Director's Visual Note / What did you spot? *</span>
            <span className="text-white/30 font-normal">e.g. house style, courtyard, gates</span>
          </label>
          <textarea
            value={directorNote}
            onChange={(e) => setDirectorNote(e.target.value)}
            rows={3}
            placeholder="e.g. Spotted on the road: Old Kerala-style courtyard house with timber porch, textured laterite stone walls, and clay tile roof. Looks viable for night exterior."
            className="w-full bg-[#070707] border border-white/15 p-3.5 text-[#F5F2ED] placeholder-white/30 focus:outline-none focus:border-[#C5A059] text-xs font-light leading-relaxed resize-none"
          />
        </div>

        {/* AI Reverse Geospatial Analyze Action */}
        {!scoutedPreview && (
          <div className="pt-2">
            <button
              onClick={handleAnalyzeWithAI}
              disabled={isAnalyzing || !directorNote.trim()}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#C5A059] hover:bg-[#d4b06a] text-black font-bold text-xs uppercase tracking-[0.15em] transition-all cursor-pointer shadow-md"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Reverse-Scouting Real Area & Permit Guidance...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze Spot with AI & Pin Location</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* AI Analysis Preview Card */}
        {scoutedPreview && (
          <div className="p-4 bg-[#C5A059]/[0.04] border border-[#C5A059]/40 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-2.5">
              <span className="text-[10px] uppercase font-mono text-[#C5A059] flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                <span>AI Geospatial Intelligence Verified</span>
              </span>
              <span className="text-[9px] uppercase font-mono px-2 py-0.5 border border-[#C5A059]/30 bg-[#C5A059]/10 text-[#C5A059]">
                {scoutedPreview.category}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-wider font-mono text-white/40">Location Title</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-[#070707] border border-white/15 px-3 py-2 text-sm text-[#F5F2ED] font-serif"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">Identified Address & Area</span>
              <p className="text-xs text-white/70 font-light">{scoutedPreview.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 bg-[#070707] border border-white/10">
                <span className="text-[9px] uppercase text-white/40 block">Lighting / Sun Orientation</span>
                <span className="text-xs text-white/80 mt-0.5 block line-clamp-2">
                  {scoutedPreview.lightingNotes}
                </span>
              </div>
              <div className="p-2.5 bg-[#070707] border border-white/10">
                <span className="text-[9px] uppercase text-white/40 block">Filming Permit Guidance</span>
                <span className="text-xs text-[#C5A059] mt-0.5 block line-clamp-2">
                  {scoutedPreview.permitAdvice}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleConfirmSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#C5A059] hover:bg-[#d4b06a] text-black font-bold text-xs uppercase tracking-[0.15em] transition-all cursor-pointer shadow-sm"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                <span>Save to Project Aurora</span>
              </button>

              <button
                onClick={() => setScoutedPreview(null)}
                className="px-4 py-3 border border-white/15 text-white/60 hover:text-white text-xs font-mono uppercase tracking-wider cursor-pointer"
              >
                Re-Analyze
              </button>
            </div>
          </div>
        )}

        {/* Instant Fallback Pin without AI */}
        {!scoutedPreview && (
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <span className="text-[10px] text-white/40 font-mono">In a hurry or offline?</span>
            <button
              onClick={handleConfirmSave}
              disabled={isSaving || !directorNote.trim()}
              className="text-[#C5A059] hover:underline font-mono text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <span>Instant Quick-Pin without AI</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
