import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Layers, Plus, ExternalLink, Sun, DollarSign, ShieldCheck } from 'lucide-react';
import type { LocationItem } from '../../types';
import { calculateClientSolarTimes } from '../../lib/sunCalc';
import { CurrentLocationModal } from './CurrentLocationModal';

interface LocationMapProps {
  locations: LocationItem[];
  onSelectLocation: (loc: LocationItem) => void;
  onAddNewLocation: () => void;
  onSaveLocation?: (loc: Partial<LocationItem>) => Promise<void>;
  selectedLocationId?: string;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  locations,
  onSelectLocation,
  onAddNewLocation,
  onSaveLocation,
  selectedLocationId,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [isCurrentLocModalOpen, setIsCurrentLocModalOpen] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState<LocationItem>(
    locations.find((l) => l.locationId === selectedLocationId) || locations[0] || ({} as LocationItem)
  );
  const [mapType, setMapType] = useState<'cinematic' | 'satellite' | 'street'>('cinematic');

  const filteredLocations =
    activeFilter === 'ALL' ? locations : locations.filter((l) => l.category.toLowerCase() === activeFilter.toLowerCase());

  const solar = calculateClientSolarTimes(selectedLoc.latitude || 25.0778, selectedLoc.longitude || 55.1396);

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] p-4 rounded-none border border-white/10">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono shrink-0">Category:</span>
          {['ALL', 'Waterfront', 'Heritage', 'Desert', 'Industrial'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider transition-all border cursor-pointer ${
                activeFilter === cat
                  ? 'bg-[#C5A059]/15 text-[#C5A059] border-[#C5A059]/50'
                  : 'bg-transparent text-white/40 border-white/10 hover:text-white/80 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-white/[0.02] border border-white/10 text-xs">
            <button
              onClick={() => setMapType('cinematic')}
              className={`px-3 py-1 text-[10px] uppercase tracking-wider font-mono cursor-pointer transition-colors ${mapType === 'cinematic' ? 'bg-[#C5A059] text-black font-semibold' : 'text-white/40 hover:text-white'}`}
            >
              Cinematic
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-3 py-1 text-[10px] uppercase tracking-wider font-mono cursor-pointer transition-colors ${mapType === 'satellite' ? 'bg-[#C5A059] text-black font-semibold' : 'text-white/40 hover:text-white'}`}
            >
              Satellite
            </button>
          </div>

          <button
            onClick={() => setIsCurrentLocModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#C5A059]/15 hover:bg-[#C5A059]/25 text-[#C5A059] border border-[#C5A059]/40 font-bold text-xs uppercase tracking-wider transition-all shrink-0 cursor-pointer shadow-sm"
            id="map-pin-current-spot-btn"
            title="Detect GPS coordinates and pin your current spot"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Pin Current Spot</span>
          </button>

          <button
            onClick={onAddNewLocation}
            className="flex items-center gap-2 px-4 py-2 bg-[#C5A059] hover:bg-[#d4b06a] text-black font-bold text-xs uppercase tracking-[0.15em] transition-all shrink-0 cursor-pointer shadow-sm"
            id="map-add-location-btn"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Pin Location</span>
          </button>
        </div>
      </div>

      {/* Main Map & Scout Inspector Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Scouting Stage / Visual Canvas */}
        <div className="lg:col-span-2 relative h-[520px] rounded-none overflow-hidden border border-white/10 bg-[#070707] shadow-2xl flex flex-col justify-between p-6">
          {/* Visual Background Simulation Map */}
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              mapType === 'satellite'
                ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-neutral-950 to-[#070707] opacity-90'
                : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900/60 via-[#0a0a0a] to-[#050505]'
            }`}
          >
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03]" />
            
            {/* Ambient Lighting Glow for Selected Location */}
            <div
              className="absolute w-72 h-72 rounded-full bg-[#C5A059]/10 blur-3xl pointer-events-none transition-all duration-500"
              style={{
                top: `${((selectedLoc.latitude - 24.5) / 1.5) * 100}%`,
                left: `${((selectedLoc.longitude - 54.8) / 1.0) * 100}%`,
              }}
            />
          </div>

          {/* Map Top Floating Header */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-none bg-black/80 backdrop-blur border border-white/15 text-xs text-white/80 shadow-lg">
              <Compass className="h-3.5 w-3.5 text-[#C5A059] animate-spin-slow" />
              <span className="font-mono text-[11px] uppercase tracking-wider">UAE Filming Coordinate Grid (WGS84)</span>
            </div>
            <span className="px-3 py-1.5 rounded-none bg-black/80 backdrop-blur border border-white/15 text-[10px] font-mono uppercase tracking-widest text-[#C5A059]">
              {filteredLocations.length} Locations Active
            </span>
          </div>

          {/* Pinned Locations on Canvas Map */}
          <div className="relative z-10 flex-1 my-4 flex items-center justify-center">
            <div className="relative w-full h-full max-w-xl max-h-96 border border-white/10 rounded-none bg-black/40 p-4">
              {filteredLocations.map((loc, idx) => {
                const isSelected = selectedLoc.locationId === loc.locationId;
                // Relative positions for map pins inside container
                const leftOffsets = [20, 48, 65, 35, 80];
                const topOffsets = [35, 60, 25, 75, 45];
                const left = `${leftOffsets[idx % leftOffsets.length]}%`;
                const top = `${topOffsets[idx % topOffsets.length]}%`;

                return (
                  <button
                    key={loc.locationId}
                    onClick={() => {
                      setSelectedLoc(loc);
                      onSelectLocation(loc);
                    }}
                    style={{ left, top }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group focus:outline-none transition-transform cursor-pointer ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-none border shadow-xl transition-all ${
                        isSelected
                          ? 'bg-[#C5A059] text-black border-white ring-4 ring-[#C5A059]/20'
                          : 'bg-black text-[#C5A059] border-[#C5A059]/40 hover:border-[#C5A059]'
                      }`}
                    >
                      <MapPin className="h-4 w-4 stroke-[2.5]" />
                    </div>
                    <span
                      className={`mt-1.5 text-[9px] uppercase tracking-widest font-mono px-2.5 py-0.5 rounded-none shadow-lg whitespace-nowrap border transition-all ${
                        isSelected
                          ? 'bg-[#C5A059] text-black border-white font-bold'
                          : 'bg-black/90 text-white/70 border-white/10 group-hover:text-white'
                      }`}
                    >
                      {loc.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Bottom Status Strip */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-none bg-black/80 backdrop-blur border border-white/15 text-xs">
            <div className="flex items-center gap-3">
              <Sun className="h-4 w-4 text-[#C5A059]" />
              <span className="font-medium text-[#F5F2ED] tracking-wide">{selectedLoc.name}</span>
              <span className="text-white/40 font-mono text-[11px]">
                ({selectedLoc.latitude?.toFixed(4)}, {selectedLoc.longitude?.toFixed(4)})
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest">
              <span className="text-[#C5A059]">Golden Hr: {solar.morningGoldenHourStart}</span>
              <span className="text-white/60">Blue Hr: {solar.eveningBlueHourStart}</span>
            </div>
          </div>
        </div>

        {/* Scouted Location Inspector Side Panel */}
        <div className="rounded-none border border-white/10 bg-white/[0.02] p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[9px] uppercase font-mono px-2 py-0.5 border border-[#C5A059]/30 bg-[#C5A059]/10 text-[#C5A059] font-medium tracking-wider">
                  {selectedLoc.category} Site
                </span>
                <h3 className="font-serif text-2xl font-light text-[#F5F2ED] mt-2 tracking-tight">{selectedLoc.name}</h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-none text-[9px] font-mono uppercase tracking-wider border ${
                  selectedLoc.permitStatus === 'VERIFIED'
                    ? 'bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/30'
                    : 'bg-white/5 text-white/50 border-white/15'
                }`}
              >
                {selectedLoc.permitStatus}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-white/40 block text-[10px] uppercase tracking-widest font-mono">Address</span>
                <p className="text-white/80 font-light mt-0.5">{selectedLoc.address}</p>
              </div>

              <div>
                <span className="text-white/40 block text-[10px] uppercase tracking-widest font-mono">Director Notes & Atmosphere</span>
                <p className="text-white/70 italic bg-[#070707] p-3 rounded-none border border-white/10 mt-1 font-light leading-relaxed">
                  "{selectedLoc.notes || 'Natural sunrise lighting and dramatic horizon reflections.'}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-[#070707] border border-white/10">
                  <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">Indicative Cost</span>
                  <span className="font-mono text-[#C5A059] text-xs mt-1 block">
                    {selectedLoc.estimatedCostRange?.currency} {selectedLoc.estimatedCostRange?.low.toLocaleString()} - {selectedLoc.estimatedCostRange?.high.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-[#070707] border border-white/10">
                  <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">Assigned Day</span>
                  <span className="font-mono text-white/90 text-xs mt-1 block">
                    Day {selectedLoc.shootingDays?.join(', ')}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-white/40 block text-[10px] uppercase tracking-widest font-mono">DP Lighting Guidance</span>
                <p className="text-white/60 text-[11px] font-light mt-0.5 leading-relaxed">
                  {selectedLoc.lightingNotes || 'Peak rim light 45 minutes after sunrise. Bring 0.9 ND filters.'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center gap-3">
            <button
              onClick={() => onSelectLocation(selectedLoc)}
              className="flex-1 py-3 bg-[#C5A059] hover:bg-[#d4b06a] text-black text-xs uppercase tracking-[0.15em] font-bold transition-colors cursor-pointer shadow-sm text-center"
            >
              Edit Location
            </button>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${selectedLoc.latitude},${selectedLoc.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white/80 transition-colors"
              title="Open in Google Maps"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Current GPS Location Modal */}
      <CurrentLocationModal
        isOpen={isCurrentLocModalOpen}
        onClose={() => setIsCurrentLocModalOpen(false)}
        onSaveLocation={async (loc) => {
          if (onSaveLocation) {
            await onSaveLocation(loc);
          } else {
            onAddNewLocation();
          }
        }}
      />
    </div>
  );
};
