import React, { useState } from 'react';
import { DollarSign, Sparkles, FileCheck, ShieldCheck, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import type { LocationCostEstimate, LocationItem } from '../../types';
import { api } from '../../lib/api';

interface CostEstimatorProps {
  locations: LocationItem[];
}

export const CostEstimator: React.FC<CostEstimatorProps> = ({ locations }) => {
  const [selectedLoc, setSelectedLoc] = useState<LocationItem>(locations[0] || {} as LocationItem);
  const [crewSize, setCrewSize] = useState<number>(35);
  const [shootingDays, setShootingDays] = useState<number>(1);
  const [currency, setCurrency] = useState<string>('AED');
  const [specialReqs, setSpecialReqs] = useState<string>('Standard camera package, generator truck, and security');
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimate, setEstimate] = useState<LocationCostEstimate | null>(null);

  const handleGenerateEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEstimating(true);
    try {
      const res = await api.estimateLocationCost('project-aurora-001', {
        locationId: selectedLoc.locationId,
        locationName: selectedLoc.name,
        city: 'Dubai',
        country: 'UAE',
        crewSize,
        shootingDays,
        currency,
        specialRequirements: specialReqs,
      });

      if (res.success && res.costEstimate) {
        setEstimate(res.costEstimate);
      }
    } catch (err: unknown) {
      alert('Cost estimation failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsEstimating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-serif font-light italic text-[#F5F2ED] tracking-tight">Location Cost & Permit Intelligence</h2>
        <p className="text-xs uppercase tracking-widest text-white/40 mt-1 font-light">
          Realistic indicative budget line items and official authority permit requirements
        </p>
      </div>

      {/* Configuration Form */}
      <div className="p-6 bg-white/[0.02] border border-white/10 space-y-5">
        <form onSubmit={handleGenerateEstimate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] uppercase tracking-widest font-mono text-white/50">Scouted Filming Location</label>
              <select
                value={selectedLoc.locationId}
                onChange={(e) => {
                  const found = locations.find((l) => l.locationId === e.target.value);
                  if (found) setSelectedLoc(found);
                }}
                className="w-full bg-[#070707] border border-white/15 px-3.5 py-2.5 text-[#F5F2ED] focus:outline-none focus:border-[#C5A059]"
              >
                {locations.map((loc) => (
                  <option key={loc.locationId} value={loc.locationId}>
                    {loc.name} ({loc.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-mono text-white/50">Crew Size</label>
              <input
                type="number"
                value={crewSize}
                onChange={(e) => setCrewSize(parseInt(e.target.value) || 10)}
                className="w-full bg-[#070707] border border-white/15 px-3.5 py-2.5 text-[#F5F2ED] font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-mono text-white/50">Shooting Days</label>
              <input
                type="number"
                value={shootingDays}
                onChange={(e) => setShootingDays(parseInt(e.target.value) || 1)}
                className="w-full bg-[#070707] border border-white/15 px-3.5 py-2.5 text-[#F5F2ED] font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-mono text-white/50">Special Requirements & Staging</label>
            <input
              type="text"
              value={specialReqs}
              onChange={(e) => setSpecialReqs(e.target.value)}
              className="w-full bg-[#070707] border border-white/15 px-3.5 py-2.5 text-[#F5F2ED] placeholder-white/30 focus:outline-none focus:border-[#C5A059] font-light"
              placeholder="e.g. Steadicam, generator truck, crowd control, drone clearance..."
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-[10px] uppercase tracking-wider font-mono text-white/40">
              Provenance: AI Estimate with verified authority rules
            </span>
            <button
              type="submit"
              disabled={isEstimating}
              className="flex items-center gap-2 px-6 py-3 bg-[#C5A059] hover:bg-[#d4b06a] text-black font-bold text-xs uppercase tracking-[0.15em] transition-all cursor-pointer shadow-sm"
            >
              {isEstimating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span>Generate Indicative Cost Intelligence</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results Display */}
      {estimate && (
        <div className="space-y-6 animate-in fade-in">
          {/* Summary Rollup Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white/[0.015] border border-white/10 space-y-1 text-center">
              <span className="text-[10px] uppercase tracking-widest font-mono text-white/40">Low Bound (Cost-Controlled)</span>
              <div className="text-2xl font-light text-white/80 font-mono mt-1">
                {estimate.currency} {estimate.lowEstimate.toLocaleString()}
              </div>
            </div>

            <div className="p-5 bg-[#C5A059]/10 border border-[#C5A059]/40 space-y-1 text-center">
              <span className="text-[10px] uppercase tracking-widest font-mono text-[#C5A059] font-semibold">Expected Budget Line</span>
              <div className="text-3xl font-light text-[#C5A059] font-mono mt-1">
                {estimate.currency} {estimate.likelyEstimate.toLocaleString()}
              </div>
            </div>

            <div className="p-5 bg-white/[0.015] border border-white/10 space-y-1 text-center">
              <span className="text-[10px] uppercase tracking-widest font-mono text-white/40">High Bound (Full Staging)</span>
              <div className="text-2xl font-light text-white/80 font-mono mt-1">
                {estimate.currency} {estimate.highEstimate.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="border border-white/10 bg-white/[0.015] p-6 space-y-4">
            <h3 className="font-serif text-xl font-light text-[#F5F2ED]">Itemized Budget Breakdown</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 uppercase font-mono text-[9px] tracking-wider">
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Description / Scope</th>
                    <th className="pb-3">Provenance</th>
                    <th className="pb-3 text-right">Amount ({estimate.currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-light">
                  {estimate.breakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 font-medium text-[#F5F2ED]">{item.category}</td>
                      <td className="py-3 text-white/70">{item.details}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 text-[9px] font-mono bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 uppercase tracking-wider">
                          {item.provenance}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-medium text-[#C5A059]">
                        {item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Permit Authority & Restrictions Note */}
          <div className="p-5 bg-white/[0.02] border border-white/10 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-[#C5A059] font-medium uppercase font-mono text-xs tracking-wider">
              <FileCheck className="h-4 w-4" />
              <span>Authority: {estimate.permitAuthority}</span>
            </div>
            <p className="text-white/70 font-light leading-relaxed">{estimate.permitNotes}</p>
            {estimate.restrictions.length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <span className="text-white/40 text-[10px] uppercase font-mono tracking-wider block">Key Operational Restrictions:</span>
                <ul className="list-disc pl-4 space-y-1 text-white/70 text-xs font-light mt-1">
                  {estimate.restrictions.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-[10px] text-white/30 pt-1 italic font-light">{estimate.disclaimer}</div>
          </div>
        </div>
      )}
    </div>
  );
};
