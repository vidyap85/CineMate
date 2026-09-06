import React from 'react';
import { DollarSign, FileCheck, Hammer, ArrowLeftRight, TrendingUp, AlertTriangle, ShieldCheck, ArrowRight, BarChart3, Film, Calendar, Clock } from 'lucide-react';
import type { FilmProject, LocationItem, ShootDayItem, SceneItem } from '../../types';

interface ProducerDashboardProps {
  project: FilmProject;
  locations: LocationItem[];
  shootDays: ShootDayItem[];
  scenes?: SceneItem[];
  setActiveTab: (tab: string) => void;
}

export const ProducerDashboard: React.FC<ProducerDashboardProps> = ({
  project,
  locations,
  shootDays,
  scenes = [],
  setActiveTab,
}) => {
  const totalEstimatedCost = shootDays.reduce((acc, d) => acc + d.totalEstimatedCost, 0);
  const budgetCap = project.budgetCap || 350000;
  const budgetUtilization = Math.round((totalEstimatedCost / budgetCap) * 100);

  return (
    <div className="space-y-6">
      {/* Producer Header Banner */}
      <div className="rounded-none bg-gradient-to-r from-[#12100B] via-[#0E0E0E] to-[#0A0A0A] border border-white/10 p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-none bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 text-[10px] font-mono uppercase tracking-[0.2em]">
                PRODUCER LOGISTICS & BUDGET
              </span>
              <span className="text-[11px] uppercase tracking-widest text-white/40">Elena Rostova • Line Producer</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-serif font-light italic text-[#F5F2ED] tracking-tight">
              Financial Intelligence & Permit Authority
            </h1>
            <p className="text-xs text-white/60 leading-relaxed max-w-xl font-light tracking-wide">
              Real-time cost rollups, official authority permit verifications (DFTC), set construction calculations, and budget optimization alternatives.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActiveTab('cost_planning')}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-[#C5A059] hover:bg-[#d4b06a] text-black font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-sm cursor-pointer"
            >
              <DollarSign className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Cost Intelligence</span>
            </button>
            <button
              onClick={() => setActiveTab('cost_planning')}
              className="flex items-center gap-2.5 px-6 py-3.5 border border-white/20 hover:border-white/40 hover:bg-white/5 text-[#F5F2ED] text-xs uppercase tracking-[0.15em] font-medium transition-all"
            >
              <Hammer className="h-3.5 w-3.5 text-[#C5A059]" />
              <span>Set Construction</span>
            </button>
            <button
              onClick={() => setActiveTab('budget_risk')}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-[#C5A059]/10 hover:bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-xs uppercase tracking-[0.15em] font-medium transition-all cursor-pointer"
              id="producer-monte-carlo-btn"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Monte Carlo & Payroll</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-none bg-white/[0.015] border border-white/10 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">Approved Cap</span>
          <div className="text-2xl font-light text-[#F5F2ED] font-mono">
            {project.currency} {budgetCap.toLocaleString()}
          </div>
          <span className="text-[10px] text-white/40 tracking-wider">Executive ceiling budget</span>
        </div>

        <div className="p-5 rounded-none bg-white/[0.015] border border-white/10 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">Estimated Cost</span>
          <div className="text-2xl font-light text-[#C5A059] font-mono">
            {project.currency} {totalEstimatedCost.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#C5A059] tracking-wider">
            {budgetUtilization}% of budget cap utilized
          </span>
        </div>

        <div className="p-5 rounded-none bg-white/[0.015] border border-white/10 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">Permit Rate</span>
          <div className="text-2xl font-light text-[#F5F2ED] font-mono">75% Cleared</div>
          <span className="text-[10px] text-white/40 tracking-wider">3 of 4 locations verified</span>
        </div>

        <div className="p-5 rounded-none bg-white/[0.015] border border-white/10 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">Savings Pool</span>
          <div className="text-2xl font-light text-[#C5A059] font-mono">
            {project.currency} 18,500
          </div>
          <span className="text-[10px] text-white/40 tracking-wider">Via alternative location swaps</span>
        </div>
      </div>

      {/* Location Cost & Permit Breakdown Table */}
      <div className="rounded-none border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-light text-[#F5F2ED] tracking-wide">Location Cost & Permit Matrix</h2>
            <p className="text-[11px] uppercase tracking-widest text-white/40 mt-0.5">Provenance-tracked budget lines across scouting sites</p>
          </div>
          <button
            onClick={() => setActiveTab('cost_planning')}
            className="text-xs uppercase tracking-[0.15em] text-[#C5A059] hover:text-[#d4b06a] flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <span>Full Cost Breakdown</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase font-mono text-[10px] tracking-widest">
                <th className="pb-3">Location</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Shoot Days</th>
                <th className="pb-3">Est. Cost Range</th>
                <th className="pb-3">Permit Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {locations.map((loc) => (
                <tr key={loc.locationId} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 font-normal text-[#F5F2ED] max-w-[200px] truncate">{loc.name}</td>
                  <td className="py-3.5 text-white/50">{loc.category}</td>
                  <td className="py-3.5 font-mono text-white/60">Day {loc.shootingDays.join(', ')}</td>
                  <td className="py-3.5 font-mono text-[#C5A059]">
                    {loc.estimatedCostRange.currency} {loc.estimatedCostRange.low.toLocaleString()} - {loc.estimatedCostRange.high.toLocaleString()}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-none text-[10px] font-mono tracking-wider uppercase border ${
                        loc.permitStatus === 'VERIFIED'
                          ? 'bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/30'
                          : 'bg-white/5 text-white/60 border-white/15'
                      }`}
                    >
                      {loc.permitStatus}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => setActiveTab('location_swap')}
                      className="px-3 py-1.5 rounded-none border border-white/20 hover:border-white/40 hover:bg-white/5 text-white/80 text-[10px] uppercase tracking-wider font-medium cursor-pointer"
                    >
                      Compare Swap
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Synchronized Shooting Schedule Overview for Producer */}
      <div className="rounded-none border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-light text-[#F5F2ED] tracking-wide">Shooting Schedule & Day Rollup</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Live Producer Sync
              </span>
            </div>
            <p className="text-[11px] uppercase tracking-widest text-white/40 mt-0.5">
              Current multi-day filming plan, scene counts, and daily logistics costs
            </p>
          </div>
          <button
            onClick={() => setActiveTab('scenes')}
            className="text-xs uppercase tracking-[0.15em] text-[#C5A059] hover:text-[#d4b06a] flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <span>View All Scenes</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {shootDays.map((day) => {
            const dayScenes = scenes.filter((s) => s.shootDay === day.dayNumber);
            return (
              <div
                key={day.dayId}
                onClick={() => setActiveTab('scenes')}
                className="p-4 border border-white/10 bg-white/[0.01] hover:border-[#C5A059]/50 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 font-bold">
                    Day {day.dayNumber}
                  </span>
                  <span className="text-[10px] font-mono text-white/40">{day.date}</span>
                </div>
                <h3 className="font-serif text-sm font-light text-[#F5F2ED] line-clamp-1" title={day.title}>
                  {day.title}
                </h3>
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono">
                  <span className="text-white/50 flex items-center gap-1">
                    <Film className="h-3 w-3 text-[#C5A059]" />
                    {dayScenes.length} Scene(s)
                  </span>
                  <span className="text-[#C5A059]">
                    AED {day.totalEstimatedCost.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
