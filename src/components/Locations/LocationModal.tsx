import React, { useState, useEffect } from 'react';
import { X, MapPin, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import type { LocationItem } from '../../types';
import { api } from '../../lib/api';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (loc: Partial<LocationItem>) => Promise<void>;
  initialData?: Partial<LocationItem> | null;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [latitude, setLatitude] = useState(initialData?.latitude || 25.0778);
  const [longitude, setLongitude] = useState(initialData?.longitude || 55.1396);
  const [category, setCategory] = useState(initialData?.category || 'Waterfront');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [lightingNotes, setLightingNotes] = useState(initialData?.lightingNotes || '');
  const [shootingDays, setShootingDays] = useState<number[]>(initialData?.shootingDays || [1]);
  const [permitStatus, setPermitStatus] = useState<LocationItem['permitStatus']>(initialData?.permitStatus || 'VERIFIED');
  const [isSaving, setIsSaving] = useState(false);

  // AI Quick Scout state inside modal
  const [quickSearch, setQuickSearch] = useState('');
  const [isQuickScouting, setIsQuickScouting] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const [scoutNotification, setScoutNotification] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setAddress(initialData.address || '');
      setLatitude(initialData.latitude || 25.0778);
      setLongitude(initialData.longitude || 55.1396);
      setCategory(initialData.category || 'Waterfront');
      setNotes(initialData.notes || '');
      setLightingNotes(initialData.lightingNotes || '');
      setShootingDays(initialData.shootingDays || [1]);
      setPermitStatus(initialData.permitStatus || 'VERIFIED');
    } else {
      setName('');
      setAddress('');
      setLatitude(25.0778);
      setLongitude(55.1396);
      setCategory('Waterfront');
      setNotes('');
      setLightingNotes('');
      setShootingDays([1]);
      setPermitStatus('VERIFIED');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleQuickScout = async () => {
    if (!quickSearch.trim()) return;
    setIsQuickScouting(true);
    setScoutNotification(null);
    try {
      const res = await api.scoutLocationSearch('project-aurora-001', {
        query: quickSearch.trim(),
        city: 'Dubai',
        country: 'UAE',
      });

      if (res.success && res.results && res.results.length > 0) {
        const top = res.results[0];
        setName(top.name);
        setAddress(top.address);
        setLatitude(top.latitude);
        setLongitude(top.longitude);
        setCategory(top.category);
        setNotes(top.notes);
        setLightingNotes(top.lightingNotes || '');
        setPermitStatus(top.permitStatus === 'VERIFIED' ? 'VERIFIED' : 'USER_PROVIDED');
        if (top.suggestedShootingDay) {
          setShootingDays([top.suggestedShootingDay]);
        }
        setScoutNotification(`Auto-filled coordinates and details for "${top.name}"!`);
      } else {
        alert(`No results found for "${quickSearch}". Try another landmark or address.`);
      }
    } catch (err: unknown) {
      alert('Quick scout failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsQuickScouting(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsGettingCurrentLocation(true);
    setScoutNotification('Acquiring satellite GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);
        setLatitude(lat);
        setLongitude(lng);
        setScoutNotification(`GPS acquired: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E (±${acc}m). Reverse scouting...`);

        try {
          const res = await api.reverseScoutCurrentLocation('project-aurora-001', {
            latitude: lat,
            longitude: lng,
            accuracy: acc,
            userNote: notes || name || 'Director live field scout from road',
          });
          if (res.success && res.location) {
            if (!name) setName(res.location.name);
            setAddress(res.location.address);
            if (res.location.category) setCategory(res.location.category);
            if (!notes) setNotes(res.location.notes);
            if (!lightingNotes) setLightingNotes(res.location.lightingNotes);
            setPermitStatus('USER_PROVIDED');
            setScoutNotification(`Auto-filled details for "${res.location.name}" at current GPS!`);
          }
        } catch {
          setScoutNotification(`Pinned current coordinates: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E!`);
        } finally {
          setIsGettingCurrentLocation(false);
        }
      },
      (err) => {
        setIsGettingCurrentLocation(false);
        let msg = 'Unable to get location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location in browser settings.';
        }
        setScoutNotification(msg);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        locationId: initialData?.locationId,
        name,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
        category,
        notes,
        lightingNotes,
        permitStatus,
        shootingDays,
      });
      onClose();
    } catch (err: unknown) {
      alert('Failed to save location: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-none bg-[#0A0A0A] border border-white/10 shadow-2xl p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-light text-[#F5F2ED]">
                {initialData?.locationId ? 'Edit Filming Location' : 'Pin New Filming Location'}
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-mono mt-0.5">
                Scouted project coordinates and permit metadata
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

        {/* AI Quick Auto-Scout Bar */}
        <div className="p-3.5 bg-[#C5A059]/5 border border-[#C5A059]/25 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-mono text-[#C5A059] flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              <span>AI Auto-Detect Landmark or Current GPS</span>
            </span>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isGettingCurrentLocation}
              className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 bg-[#C5A059]/20 hover:bg-[#C5A059]/30 text-[#C5A059] border border-[#C5A059]/40 flex items-center gap-1 cursor-pointer transition-all"
              title="Detect your device's exact GPS coordinates right now"
            >
              {isGettingCurrentLocation ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <MapPin className="h-3 w-3" />
              )}
              <span>Pin My Current GPS</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleQuickScout();
                }
              }}
              placeholder="e.g. 'Bur Dubai Temple', 'Al Seef Waterfront'..."
              className="flex-1 bg-[#070707] border border-white/15 px-3 py-1.5 text-xs text-[#F5F2ED] placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
            />
            <button
              type="button"
              onClick={handleQuickScout}
              disabled={isQuickScouting || !quickSearch.trim()}
              className="px-3 py-1.5 bg-[#C5A059] hover:bg-[#d4b06a] text-black font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {isQuickScouting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              <span>Auto-Fill</span>
            </button>
          </div>
          {scoutNotification && (
            <p className="text-[10px] text-[#C5A059] font-mono flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>{scoutNotification}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-mono text-white/50">Location Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dubai Marina Waterfront Promenade"
              required
              className="w-full bg-[#070707] border border-white/15 px-3.5 py-2.5 text-[#F5F2ED] placeholder-white/30 focus:outline-none focus:border-[#C5A059] font-light"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-mono text-white/50">Address / Landmark</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Dubai Marina Walk, Dubai, UAE"
              className="w-full bg-[#070707] border border-white/15 px-3.5 py-2.5 text-[#F5F2ED] placeholder-white/30 focus:outline-none focus:border-[#C5A059] font-light"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-mono text-white/50">Latitude (WGS84)</label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#070707] border border-white/15 px-3.5 py-2.5 text-[#F5F2ED] font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-mono text-white/50">Longitude (WGS84)</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#070707] border border-white/15 px-3.5 py-2.5 text-[#F5F2ED] font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-mono text-white/50">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#070707] border border-white/15 px-3.5 py-2.5 text-[#F5F2ED] focus:outline-none focus:border-[#C5A059]"
              >
                <option value="Waterfront">Waterfront</option>
                <option value="Heritage">Heritage</option>
                <option value="Industrial">Industrial</option>
                <option value="Desert">Desert</option>
                <option value="Urban">Urban</option>
                <option value="Studio">Studio Soundstage</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-mono text-white/50">Assigned Shoot Day</label>
              <select
                value={shootingDays[0] || 1}
                onChange={(e) => setShootingDays([parseInt(e.target.value)])}
                className="w-full bg-[#070707] border border-white/15 px-3.5 py-2.5 text-[#F5F2ED] focus:outline-none focus:border-[#C5A059]"
              >
                <option value={1}>Shoot Day 1</option>
                <option value={2}>Shoot Day 2</option>
                <option value={3}>Shoot Day 3</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-mono text-white/50">Director Notes & Atmosphere</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Dawn reflection on water, character walks facing sunrise..."
              rows={2}
              className="w-full bg-[#070707] border border-white/15 p-3 text-[#F5F2ED] placeholder-white/30 focus:outline-none focus:border-[#C5A059] resize-none font-light leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-mono text-white/50">Lighting & Camera Direction</label>
            <textarea
              value={lightingNotes}
              onChange={(e) => setLightingNotes(e.target.value)}
              placeholder="e.g. Golden hour rim lighting through wind towers, ND6 filter recommended..."
              rows={2}
              className="w-full bg-[#070707] border border-white/15 p-3 text-[#F5F2ED] placeholder-white/30 focus:outline-none focus:border-[#C5A059] resize-none font-light leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white/40 hover:text-white text-xs font-mono uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#d4b06a] text-black font-bold text-xs uppercase tracking-[0.15em] transition-all cursor-pointer shadow-sm flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              <span>{initialData?.locationId ? 'Update Location' : 'Pin to Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
