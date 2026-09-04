import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Search,
  DollarSign,
  Sun,
  ArrowRight,
  Trash2,
  Edit,
  Sparkles,
  Loader2,
  ShieldAlert,
  Compass,
  CheckCircle2,
  X,
  Navigation,
} from 'lucide-react';
import type { LocationItem } from '../../types';
import { api } from '../../lib/api';
import { CurrentLocationModal } from './CurrentLocationModal';

interface ScoutedResult {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category?: LocationItem['category'];
  notes: string;
  lightingNotes: string;
  permitStatus?: 'VERIFIED' | 'USER_PROVIDED' | 'AI_ESTIMATE' | 'UNVERIFIED';
  permitAdvice: string;
  estimatedCostRange: { low: number; expected: number; high: number; currency: string };
  suggestedShootingDay: number;
}

interface LocationListProps {
  locations: LocationItem[];
  onSelectLocation: (loc: LocationItem) => void;
  onAddNewLocation: (prefill?: Partial<LocationItem>) => void;
  onSaveLocation?: (loc: Partial<LocationItem>) => Promise<void>;
  onDeleteLocation: (locId: string) => void;
}

export const LocationList: React.FC<LocationListProps> = ({
  locations,
  onSelectLocation,
  onAddNewLocation,
  onSaveLocation,
  onDeleteLocation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isScouting, setIsScouting] = useState(false);
  const [isCurrentLocModalOpen, setIsCurrentLocModalOpen] = useState(false);
  const [scoutResults, setScoutResults] = useState<ScoutedResult[]>([]);
  const [pinSuccessMsg, setPinSuccessMsg] = useState<string | null>(null);
  const [pinningIndex, setPinningIndex] = useState<number | null>(null);

  const filtered = locations.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || loc.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const handleScoutSearch = async (queryToSearch: string) => {
    const targetQuery = queryToSearch.trim();
    if (!targetQuery) return;

    setIsScouting(true);
    setScoutResults([]);
    try {
      const res = await api.scoutLocationSearch('project-aurora-001', {
        query: targetQuery,
        city: 'Dubai',
        country: 'UAE',
      });

      if (res.success && res.results && res.results.length > 0) {
        setScoutResults(res.results);
      } else {
        alert(`No location found for "${targetQuery}". Try entering a nearby landmark or district.`);
      }
    } catch (err: unknown) {
      alert('AI Location Scouting failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsScouting(false);
    }
  };

  const handlePinScoutedLocation = async (result: ScoutedResult, index: number) => {
    setPinningIndex(index);
    try {
      const newLoc: Partial<LocationItem> = {
        name: result.name,
        address: result.address,
        latitude: result.latitude,
        longitude: result.longitude,
        category: result.category,
        notes: result.notes,
        lightingNotes: result.lightingNotes,
        permitStatus: result.permitStatus,
        estimatedCostRange: result.estimatedCostRange,
        shootingDays: [result.suggestedShootingDay || 1],
      };

      if (onSaveLocation) {
        await onSaveLocation(newLoc);
      } else {
        onAddNewLocation(newLoc);
      }

      setPinSuccessMsg(`Pinned "${result.name}" successfully to Project Aurora!`);
      // Remove this item from scout results
      setScoutResults((prev) => prev.filter((_, i) => i !== index));
      setTimeout(() => setPinSuccessMsg(null), 4000);
    } catch (err: unknown) {
      alert('Failed to pin location: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setPinningIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-light italic text-[#F5F2ED] tracking-tight">
            Location Scouting Master Directory
          </h2>
          <p className="text-xs uppercase tracking-widest text-white/40 mt-1 font-light">
            Curated filming sites across Project Aurora & AI Geospatial Scout
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCurrentLocModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-[#C5A059]/15 hover:bg-[#C5A059]/25 text-[#C5A059] border border-[#C5A059]/40 font-bold text-xs uppercase tracking-[0.15em] transition-all cursor-pointer shadow-sm"
            id="pin-current-spot-btn"
            title="Detect your device's exact GPS coordinates and reverse-scout your spot"
          >
            <Navigation className="h-4 w-4" />
            <span>Pin Current Spot</span>
          </button>

          <button
            onClick={() => onAddNewLocation()}
            className="flex items-center gap-2 px-5 py-3 bg-[#C5A059] hover:bg-[#d4b06a] text-black font-bold text-xs uppercase tracking-[0.15em] transition-all cursor-pointer shadow-sm"
            id="pin-new-location-btn"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Pin New Location</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {pinSuccessMsg && (
        <div className="flex items-center justify-between p-3.5 bg-[#C5A059]/10 border border-[#C5A059]/40 text-[#F5F2ED] text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-[#C5A059]" />
            <span className="font-mono">{pinSuccessMsg}</span>
          </div>
          <button onClick={() => setPinSuccessMsg(null)} className="text-white/40 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="space-y-3 bg-white/[0.02] p-4 border border-white/10">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchTerm.trim()) {
                handleScoutSearch(searchTerm);
              }
            }}
            className="relative flex-1 flex items-center"
          >
            <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-white/30" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved locations or type any landmark to scout (e.g. 'bur dubai temple', 'al seef')..."
              className="w-full pl-10 pr-28 py-2.5 bg-[#070707] border border-white/10 text-xs text-[#F5F2ED] placeholder-white/30 focus:outline-none focus:border-[#C5A059] font-light"
            />
            {searchTerm.trim() && (
              <button
                type="button"
                onClick={() => handleScoutSearch(searchTerm)}
                disabled={isScouting}
                className="absolute right-2 px-3 py-1.5 bg-[#C5A059] hover:bg-[#d4b06a] text-black font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isScouting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                <span>Scout & Pin</span>
              </button>
            )}
          </form>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['ALL', 'Waterfront', 'Heritage', 'Industrial', 'Desert'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer ${
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

        {/* Informative helper hint */}
        <div className="flex items-center justify-between text-[10px] text-white/40 font-mono pt-1">
          <span>
            {filtered.length} saved location{filtered.length !== 1 ? 's' : ''} found
            {searchTerm ? ` matching "${searchTerm}"` : ''}
          </span>
          {searchTerm.trim() && !isScouting && (
            <button
              onClick={() => handleScoutSearch(searchTerm)}
              className="text-[#C5A059] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              <span>Scout "{searchTerm}" with Fast AI Engine</span>
            </button>
          )}
        </div>

        {/* Fast Scout Preset Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1 mr-1">
            <Sparkles className="h-3 w-3 text-[#C5A059]" /> Quick Scout:
          </span>
          {[
            'Bur Dubai Temple',
            'Al Seef Heritage',
            'Dubai Marina Walk',
            'Al Fahidi District',
            'Alserkal Avenue',
            'Al Qudra Dunes',
            'Kerala Courtyard House',
          ].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setSearchTerm(preset);
                handleScoutSearch(preset);
              }}
              disabled={isScouting}
              className="text-[10px] font-mono px-2 py-0.5 bg-white/[0.04] hover:bg-[#C5A059]/20 hover:text-[#C5A059] text-white/60 border border-white/10 hover:border-[#C5A059]/40 transition-colors cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state during AI Scouting */}
      {isScouting && (
        <div className="p-8 border border-[#C5A059]/30 bg-[#C5A059]/5 text-center space-y-3 animate-in fade-in">
          <Loader2 className="h-6 w-6 text-[#C5A059] animate-spin mx-auto" />
          <h4 className="font-serif text-lg text-[#F5F2ED] italic">
            Scouting Geospatial Intelligence for "{searchTerm}"...
          </h4>
          <p className="text-xs text-white/50 font-light max-w-md mx-auto">
            Resolving WGS84 GPS coordinates, checking Dubai Film & TV Commission (DFTC) permit requirements, and generating lighting & camera advice.
          </p>
        </div>
      )}

      {/* AI Scouted Candidates Section */}
      {scoutResults.length > 0 && (
        <div className="space-y-4 p-5 bg-[#C5A059]/[0.03] border border-[#C5A059]/30">
          <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#C5A059]" />
              <h3 className="font-serif text-xl font-light text-[#F5F2ED]">
                Scouted Filming Sites for "{searchTerm}"
              </h3>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30 ml-2">
                Ready to Pin
              </span>
            </div>
            <button
              onClick={() => setScoutResults([])}
              className="text-white/40 hover:text-white text-xs font-mono"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scoutResults.map((result, idx) => (
              <div
                key={idx}
                className="bg-[#070707] border border-[#C5A059]/40 p-5 space-y-4 hover:border-[#C5A059] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-mono px-2 py-0.5 border border-[#C5A059]/30 bg-[#C5A059]/10 text-[#C5A059] tracking-wider">
                      {result.category}
                    </span>
                    <span className="text-[9px] font-mono text-white/50 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[#C5A059]" />
                      {result.latitude.toFixed(4)}° N, {result.longitude.toFixed(4)}° E
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif text-xl font-medium text-[#F5F2ED]">{result.name}</h4>
                    <p className="text-[11px] text-white/50 font-light mt-0.5">{result.address}</p>
                  </div>

                  <p className="text-xs text-white/80 italic bg-white/[0.02] p-3 border border-white/10 font-light leading-relaxed">
                    "{result.notes}"
                  </p>

                  <div className="space-y-1.5 text-[11px] font-mono bg-white/[0.02] p-3 border border-white/10">
                    <div className="flex items-center justify-between text-white/60">
                      <span className="text-[10px] uppercase text-white/40">Permit Guidance:</span>
                      <span className="text-[#C5A059]">{result.permitStatus}</span>
                    </div>
                    <p className="text-[10px] text-white/50 font-sans">{result.permitAdvice}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2.5 bg-white/[0.02] border border-white/10">
                      <span className="text-[9px] uppercase text-white/40 block">Est. Location Cost</span>
                      <span className="text-[#C5A059] font-medium text-xs mt-0.5 block">
                        {result.estimatedCostRange.currency} {result.estimatedCostRange.low.toLocaleString()} - {result.estimatedCostRange.high.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2.5 bg-white/[0.02] border border-white/10">
                      <span className="text-[9px] uppercase text-white/40 block">Suggested Day</span>
                      <span className="text-white/80 font-medium text-xs mt-0.5 block">
                        Shoot Day {result.suggestedShootingDay}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                  <button
                    onClick={() => handlePinScoutedLocation(result, idx)}
                    disabled={pinningIndex === idx}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#C5A059] hover:bg-[#d4b06a] text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                  >
                    {pinningIndex === idx ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <MapPin className="h-3.5 w-3.5" />
                    )}
                    <span>Pin to Project Aurora</span>
                  </button>

                  <button
                    onClick={() => {
                      onAddNewLocation({
                        name: result.name,
                        address: result.address,
                        latitude: result.latitude,
                        longitude: result.longitude,
                        category: result.category,
                        notes: result.notes,
                        lightingNotes: result.lightingNotes,
                        permitStatus: result.permitStatus,
                        estimatedCostRange: result.estimatedCostRange,
                        shootingDays: [result.suggestedShootingDay || 1],
                      });
                    }}
                    className="px-3 py-2.5 border border-white/15 hover:border-white/30 text-white/60 hover:text-white text-xs font-mono uppercase tracking-wider cursor-pointer"
                    title="Edit details before pinning"
                  >
                    Customize
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State when no saved locations match */}
      {filtered.length === 0 && !isScouting && (
        <div className="p-10 border border-white/10 bg-white/[0.015] text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center mx-auto text-[#C5A059]">
            <Compass className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-light text-[#F5F2ED]">
              {searchTerm ? `No Saved Locations Matching "${searchTerm}"` : `No Locations Found in ${selectedCategory}`}
            </h3>
            <p className="text-xs text-white/50 font-light max-w-md mx-auto leading-relaxed">
              {searchTerm
                ? `"${searchTerm}" has not been pinned to Project Aurora yet. Would you like CineMate's AI Scout to find its exact coordinates, permit rules, and pin it?`
                : `There are currently no scouted locations filed under category "${selectedCategory}".`}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {searchTerm ? (
              <button
                onClick={() => handleScoutSearch(searchTerm)}
                className="flex items-center gap-2 px-6 py-3 bg-[#C5A059] hover:bg-[#d4b06a] text-black font-bold text-xs uppercase tracking-[0.15em] transition-all cursor-pointer shadow-md"
              >
                <Sparkles className="h-4 w-4" />
                <span>Scout & Pin "{searchTerm}"</span>
              </button>
            ) : (
              <button
                onClick={() => setSelectedCategory('ALL')}
                className="px-4 py-2 border border-white/15 text-white/60 hover:text-white text-xs font-mono uppercase tracking-wider cursor-pointer"
              >
                Reset Category Filter
              </button>
            )}

            <button
              onClick={() => onAddNewLocation({ name: searchTerm })}
              className="flex items-center gap-2 px-5 py-3 border border-white/20 hover:border-white/40 text-[#F5F2ED] text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Manually Pin Site</span>
            </button>
          </div>
        </div>
      )}

      {/* Saved Locations Cards Grid */}
      {filtered.length > 0 && (
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
                    <span className="text-white/80 font-medium text-xs mt-0.5 block">
                      Shoot Day {loc.shootingDays.join(', ')}
                    </span>
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
      )}

      {/* Current GPS Location Modal */}
      <CurrentLocationModal
        isOpen={isCurrentLocModalOpen}
        onClose={() => setIsCurrentLocModalOpen(false)}
        onSaveLocation={async (loc) => {
          if (onSaveLocation) {
            await onSaveLocation(loc);
          } else {
            onAddNewLocation(loc);
          }
          setPinSuccessMsg(`Pinned current location "${loc.name}" successfully!`);
          setTimeout(() => setPinSuccessMsg(null), 4000);
        }}
      />
    </div>
  );
};
