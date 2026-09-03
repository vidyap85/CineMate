import React, { useState } from 'react';
import { MapPin, Plus, Search, Filter, DollarSign, Sun, ArrowRight, Trash2, Edit } from 'lucide-react';
import type { LocationItem } from '../../types';

interface LocationListProps {
  locations: LocationItem[];
  onSelectLocation: (loc: LocationItem) => void;
  onAddNewLocation: () => void;
  onDeleteLocation: (locId: string) => void;
}

export const LocationList: React.FC<LocationListProps> = ({
  locations,
  onSelectLocation,
  onAddNewLocation,
  onDeleteLocation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filtered = locations.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || loc.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-5">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-light italic text-[#F5F2ED] tracking-tight">Location Scouting Master Directory</h2>
          <p className="text-xs uppercase tracking-widest text-white/40 mt-1 font-light">Curated filming sites across Project Aurora</p>
        </div>

        <button
          onClick={onAddNewLocation}
          className="flex items-center gap-2 px-5 py-3 bg-[#C5A059] hover:bg-[#d4b06a] text-black font-bold text-xs uppercase tracking-[0.15em] transition-all cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Pin New Location</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/[0.02] p-4 rounded-none border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-white/30" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search locations by name, address, or landmark..."
            className="w-full pl-10 pr-4 py-2 bg-[#070707] border border-white/10 text-xs text-[#F5F2ED] placeholder-white/30 focus:outline-none focus:border-[#C5A059] font-light"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'Waterfront', 'Heritage', 'Industrial', 'Desert'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#C5A059]/15 text-[#C5A059] border-[#C5A059]/50 font-medium'
                  : 'bg-transparent text-white/40 border-white/10 hover:text-white/80 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Locations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((loc) => (
          <div
            key={loc.locationId}
            className="border border-white/10 bg-white/[0.015] p-5 space-y-4 hover:border-white/20 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-mono px-2 py-0.5 border border-white/10 bg-white/5 text-white/60 tracking-wider">
                  {loc.category}
                </span>
                <span
                  className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 border ${
                    loc.permitStatus === 'VERIFIED'
                      ? 'bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/30'
                      : 'bg-white/5 text-white/50 border-white/15'
                  }`}
                >
                  {loc.permitStatus}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-light text-[#F5F2ED]">{loc.name}</h3>
                <p className="text-[11px] text-white/40 truncate font-light mt-0.5">{loc.address}</p>
              </div>

              <p className="text-xs text-white/70 line-clamp-2 italic bg-[#070707] p-3 rounded-none border border-white/10 font-light leading-relaxed">
                "{loc.notes || 'Atmospheric filming location for master scenes.'}"
              </p>

              <div className="grid grid-cols-2 gap-3 text-[11px] font-mono pt-1">
                <div className="p-3 bg-[#070707] border border-white/10">
                  <span className="text-[9px] uppercase tracking-wider text-white/40 block">Est. Cost</span>
                  <span className="text-[#C5A059] font-medium text-xs mt-0.5 block">
                    {loc.estimatedCostRange.currency} {loc.estimatedCostRange.low.toLocaleString()} - {loc.estimatedCostRange.high.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-[#070707] border border-white/10">
                  <span className="text-[9px] uppercase tracking-wider text-white/40 block">Assigned Day</span>
                  <span className="text-white/80 font-medium text-xs mt-0.5 block">Shoot Day {loc.shootingDays.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={() => onSelectLocation(loc)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#C5A059] hover:bg-[#d4b06a] text-black text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer shadow-sm"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Site</span>
              </button>

              <button
                onClick={() => onDeleteLocation(loc.locationId)}
                className="p-2.5 border border-white/10 hover:border-red-500/40 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Remove Location"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
