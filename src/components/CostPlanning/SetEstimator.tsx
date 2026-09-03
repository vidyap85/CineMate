import React, { useState } from 'react';
import { Hammer, Sparkles, Clock, Layers, DollarSign, Loader2, ArrowRight } from 'lucide-react';
import type { SetConstructionEstimate } from '../../types';
import { api } from '../../lib/api';

export const SetEstimator: React.FC = () => {
  const [setDescription, setSetDescription] = useState(
    'Old Kerala village house exterior with courtyard, approximately 2,000 sq ft with timber porch, textured laterite stone walls, and clay tile roof'
  );
  const [setSizeSqFt, setSetSizeSqFt] = useState(2000);
  const [currency, setCurrency] = useState('AED');
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimate, setEstimate] = useState<SetConstructionEstimate | null>(null);

  const handleEstimateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEstimating(true);
    try {
      const res = await api.estimateSetConstruction('project-aurora-001', {
        setDescription,
        setSizeSqFt,
        currency,
      });

      if (res.success && res.setEstimate) {
        setEstimate(res.setEstimate);
      }
    } catch (err: unknown) {
      alert('Set estimation failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsEstimating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-serif font-light italic text-[#F5F2ED] tracking-tight">Set Construction & Art Department Estimator</h2>
        <p className="text-xs uppercase tracking-widest text-white/40 mt-1 font-light">
          Build-vs-Scout cost simulator for soundstage and backlot construction
        </p>
      </div>

      {/* Input Config Form */}
      <div className="p-6 bg-white/[0.02] border border-white/10 space-y-5">
        <form onSubmit={handleEstimateSet} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-mono text-white/50">Set Concept & Architectural Description</label>
            <textarea
              value={setDescription}
              onChange={(e) => setSetDescription(e.target.value)}
              rows={3}
              placeholder="e.g. Old Kerala village house exterior with courtyard, or Cyberpunk neon alleyway..."
              className="w-full bg-[#070707] border border-white/15 p-3.5 text-[#F5F2ED] placeholder-white/30 focus:outline-none focus:border-[#C5A059] resize-none font-light leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-mono text-white/50">Approximate Floor Footprint (Sq Ft)</label>
              <input
                type="number"
                value={setSizeSqFt}
                onChange={(e) => setSetSizeSqFt(parseInt(e.target.value) || 500)}
                className="w-full bg-[#070707] border border-white/15 px-3.5 py-2.5 text-[#F5F2ED] font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-mono text-white/50">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#070707] border border-white/15 px-3.5 py-2.5 text-[#F5F2ED] font-mono text-xs focus:outline-none focus:border-[#C5A059]"
              >
                <option value="AED">AED (UAE Dirham)</option>
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-[10px] uppercase tracking-wider font-mono text-white/40">
              Covers Materials, Carpentry, Painting, Labor, Lighting grid, and Waste
            </span>
            <button
              type="submit"
              disabled={isEstimating || !setDescription.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-[#C5A059] hover:bg-[#d4b06a] text-black font-bold text-xs uppercase tracking-[0.15em] transition-all cursor-pointer shadow-sm"
            >
              {isEstimating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Hammer className="h-4 w-4" />}
              <span>Calculate Set Construction Budget</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results Display */}
      {estimate && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white/[0.015] border border-white/10 space-y-1 text-center">
              <span className="text-[10px] uppercase tracking-widest font-mono text-white/40">Minimum Set Budget</span>
              <div className="text-2xl font-light text-white/80 font-mono mt-1">
                {estimate.currency} {estimate.totalLow.toLocaleString()}
              </div>
            </div>

            <div className="p-5 bg-[#C5A059]/10 border border-[#C5A059]/40 space-y-1 text-center">
              <span className="text-[10px] uppercase tracking-widest font-mono text-[#C5A059] font-semibold">Expected Total Build Cost</span>
              <div className="text-3xl font-light text-[#C5A059] font-mono mt-1">
                {estimate.currency} {estimate.totalExpected.toLocaleString()}
              </div>
            </div>

            <div className="p-5 bg-white/[0.015] border border-white/10 space-y-1 text-center">
              <span className="text-[10px] uppercase tracking-widest font-mono text-white/40">Estimated Duration</span>
              <div className="text-2xl font-light text-white/80 font-mono mt-1">
                {estimate.estimatedDurationDays} Days Build
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="border border-white/10 bg-white/[0.015] p-6 space-y-4">
            <h3 className="font-serif text-xl font-light text-[#F5F2ED]">Set Department Line Item Breakdown</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-[#070707] border border-white/10">
                <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">Raw Materials & Timber</span>
                <span className="font-mono font-medium text-[#F5F2ED] text-xs mt-1 block">
                  {estimate.currency} {estimate.materialsCost.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 bg-[#070707] border border-white/10">
                <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">Master Carpentry</span>
                <span className="font-mono font-medium text-[#F5F2ED] text-xs mt-1 block">
                  {estimate.currency} {estimate.carpentryCost.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 bg-[#070707] border border-white/10">
                <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">Scenic Painting & Aging</span>
                <span className="font-mono font-medium text-[#F5F2ED] text-xs mt-1 block">
                  {estimate.currency} {estimate.paintingCost.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 bg-[#070707] border border-white/10">
                <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">Props & Set Dressing</span>
                <span className="font-mono font-medium text-[#F5F2ED] text-xs mt-1 block">
                  {estimate.currency} {estimate.propsCost.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 bg-[#070707] border border-white/10">
                <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">Electrical & Practicals</span>
                <span className="font-mono font-medium text-[#F5F2ED] text-xs mt-1 block">
                  {estimate.currency} {estimate.electricalCost.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 bg-[#070707] border border-white/10">
                <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">Lighting Rig Support</span>
                <span className="font-mono font-medium text-[#F5F2ED] text-xs mt-1 block">
                  {estimate.currency} {estimate.lightingInfrastructureCost.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 bg-[#070707] border border-white/10">
                <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">Labor & Crew Hands</span>
                <span className="font-mono font-medium text-[#F5F2ED] text-xs mt-1 block">
                  {estimate.currency} {estimate.laborCost.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 bg-[#070707] border border-white/10">
                <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block">Contingency Buffer</span>
                <span className="font-mono font-medium text-[#C5A059] text-xs mt-1 block">
                  {estimate.currency} {estimate.contingencyCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
