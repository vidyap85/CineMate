import React, { useState } from 'react';
import { X, MapPin, Sparkles, Loader2 } from 'lucide-react';
import type { LocationItem } from '../../types';

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
  const [shootingDays, setShootingDays] = useState<number[]>(initialData?.shootingDays || [1]);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        name,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
        category,
        notes,
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
      <div className="w-full max-w-lg rounded-none bg-[#0A0A0A] border border-white/10 shadow-2xl p-7 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-light text-[#F5F2ED]">
                {initialData?.locationId ? 'Edit Filming Location' : 'Pin New Filming Location'}
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-mono mt-0.5">Scouted project coordinates and permit metadata</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer border border-white/10"
          >
            <X className="h-4 w-4" />
          </button>
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
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="w-full bg-[#070707] border border-white/15 px-3.5 py-2.5 text-[#F5F2ED] font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-mono text-white/50">Longitude (WGS84)</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
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
              rows={3}
              className="w-full bg-[#070707] border border-white/15 p-3 text-[#F5F2ED] placeholder-white/30 focus:outline-none focus:border-[#C5A059] resize-none font-light leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white/70 hover:text-white uppercase tracking-wider font-mono text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#C5A059] hover:bg-[#d4b06a] text-black font-bold uppercase tracking-[0.15em] text-xs transition-all shadow-sm cursor-pointer"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{initialData?.locationId ? 'Update Location' : 'Save Location'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
