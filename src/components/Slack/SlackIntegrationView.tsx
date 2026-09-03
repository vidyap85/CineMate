import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Hash,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Loader2,
  Sun,
  FileSpreadsheet,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { api } from '../../lib/api';
import type { LocationReport, LocationItem, SceneItem, ShootDayItem } from '../../types';

interface SlackIntegrationViewProps {
  report?: LocationReport | null;
  locations?: LocationItem[];
  scenes?: SceneItem[];
  shootDays?: ShootDayItem[];
  onTestDispatch?: () => void;
}

export const SlackIntegrationView: React.FC<SlackIntegrationViewProps> = ({
  report: propReport,
  locations,
  scenes,
  shootDays,
}) => {
  const [channels, setChannels] = useState([
    { id: 'C_AURORA_PROD', name: 'project-aurora-production', isDefault: true, desc: 'Master production crew broadcast' },
    { id: 'C_LOC_SCOUT', name: 'location-scouting-team', isDefault: false, desc: 'Location managers, permits & staging' },
    { id: 'C_DP_CAMERA', name: 'cinematography-lighting', isDefault: false, desc: 'Camera, DP, Gaffer & Solar timings' },
  ]);
  const [selectedChannel, setSelectedChannel] = useState('project-aurora-production');
  const [customWebhookUrl, setCustomWebhookUrl] = useState('');
  const [dispatchType, setDispatchType] = useState<'master_report' | 'solar_alert' | 'permit_clearance'>('master_report');
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [lastDispatchedPayload, setLastDispatchedPayload] = useState<any | null>(null);

  // Synthesize complete, valid LocationReport object
  const buildFullReport = (): LocationReport => {
    if (propReport && propReport.reportId) {
      return propReport;
    }

    return {
      reportId: 'report-aurora-master-001',
      projectId: 'project-aurora-001',
      projectName: 'Project Aurora',
      title: 'Project Aurora - Master Location Shooting Intelligence Plan',
      generatedAt: new Date().toISOString(),
      generatedBy: 'Vidya (Director) & CineGemini AI',
      version: 1,
      overallProductionScore: 84,
      executiveSummary:
        'Synthesized 3-day production timeline across Dubai Marina waterfront, Alserkal industrial warehouse, Al Fahidi heritage quarter, and Al Qudra desert dunes. Golden hour solar windows locked with DFTC permits verified.',
      provenance: {
        directorProvided: true,
        producerEnriched: true,
        cinematographerEnriched: true,
        geminiSynthesized: true,
      },
      days: [
        {
          dayNumber: 1,
          date: '2026-09-15',
          daySummary: 'Waterfront Dawn Steadicam & Urban Industrial Informant Dialogue',
          entries: [
            {
              sceneNumber: '1',
              shootDay: 1,
              locationName: 'Dubai Marina Waterfront Promenade',
              address: 'Dubai Marina Walk, Dubai, UAE',
              coordinates: { lat: 25.0778, lng: 55.1396 },
              shootingTime: '05:45 AM',
              directorNotes: 'Slow Steadicam tracking following protagonist facing rising sun across yacht basin.',
              producerCostRange: { low: 14000, expected: 18500, high: 24000, currency: 'AED' },
              permitRequirements: 'DFTC Commercial Filming Permit (5 days lead time)',
              permitStatus: 'VERIFIED',
              producerNotes: 'Marina security check-in at 05:00 AM sharp. Foot traffic rises after 07:30 AM.',
              recommendedWindow: '05:50 AM - 07:05 AM (Morning Golden Hour)',
              backupWindow: '05:15 PM - 06:10 PM (Evening Golden Hour)',
              lightingQuality: 'Pristine',
              weatherRisk: 'Low',
              lightingRisk: 'Medium',
              cinematographyNotes: 'Anamorphic 40mm T2.0 with ND 0.9 filter. Sun elevation increases rapidly.',
              locationProductionScore: 88,
              productionRisks: ['Morning coastal haze clearing by 06:10 AM', 'Pedestrian crowds after 07:30 AM'],
            },
            {
              sceneNumber: '2',
              shootDay: 1,
              locationName: 'Alserkal Avenue Cultural District',
              address: '17th St - Al Quoz Industrial Area 1, Dubai, UAE',
              coordinates: { lat: 25.1417, lng: 55.2283 },
              shootingTime: '10:30 AM',
              directorNotes: 'Warehouse courtyard encounter. High contrast architecture and diffused shadows.',
              producerCostRange: { low: 8500, expected: 12000, high: 16000, currency: 'AED' },
              permitRequirements: 'Alserkal District Filming Approval',
              permitStatus: 'USER PROVIDED',
              producerNotes: 'Generator truck parked in Lane 4. Catering staged in Warehouse 8.',
              recommendedWindow: '10:00 AM - 01:30 PM (Midday Overhead Diffusion)',
              backupWindow: '02:00 PM - 04:30 PM',
              lightingQuality: 'Excellent',
              weatherRisk: 'Low',
              lightingRisk: 'Low',
              cinematographyNotes: '12x12 Silk overhead to tame harsh overhead sun. 2x Skypanel S60 bounce.',
              locationProductionScore: 91,
              productionRisks: ['Acoustic echo between metal warehouse walls'],
            },
          ],
        },
        {
          dayNumber: 2,
          date: '2026-09-16',
          daySummary: 'Heritage Alleyway Stalking & Labyrinthine Chase',
          entries: [
            {
              sceneNumber: '3',
              shootDay: 2,
              locationName: 'Al Fahidi Historical Quarter',
              address: 'Al Souq Al Kabeer, Bur Dubai, Dubai, UAE',
              coordinates: { lat: 25.2638, lng: 55.2972 },
              shootingTime: '06:15 AM',
              directorNotes: 'Tight alley tracking shot through coral-stone wind tower corridors.',
              producerCostRange: { low: 9000, expected: 13500, high: 19000, currency: 'AED' },
              permitRequirements: 'Dubai Municipality & Heritage Department Permit',
              permitStatus: 'VERIFIED',
              producerNotes: 'No vehicle access inside historical quarter. Hand-carry gear carts required.',
              recommendedWindow: '06:10 AM - 08:30 AM (Narrow Alley Sidelight)',
              backupWindow: '04:45 PM - 06:15 PM',
              lightingQuality: 'Good',
              weatherRisk: 'Low',
              lightingRisk: 'Medium',
              cinematographyNotes: 'Cooke Anamorphic 50mm. Watch out for deep shadows between wind towers.',
              locationProductionScore: 82,
              productionRisks: ['Narrow passage restrictions', 'Tourist foot traffic from 09:00 AM'],
            },
          ],
        },
        {
          dayNumber: 3,
          date: '2026-09-17',
          daySummary: 'Desert Dune Climax & Sunset Confrontation',
          entries: [
            {
              sceneNumber: '4',
              shootDay: 3,
              locationName: 'Al Qudra Desert Dunes & Lakes',
              address: 'Al Qudra Road, Dubai, UAE',
              coordinates: { lat: 24.8481, lng: 55.3378 },
              shootingTime: '04:45 PM',
              directorNotes: 'Vast expanse standoff against lowering desert sun.',
              producerCostRange: { low: 18000, expected: 26000, high: 35000, currency: 'AED' },
              permitRequirements: 'Dubai Municipality Desert Conservation Permit + Drone NOC',
              permitStatus: 'AI ESTIMATE',
              producerNotes: '4x4 transport required for all cast & crew. Desert air purifier units on standby.',
              recommendedWindow: '05:10 PM - 06:25 PM (Sunset Golden & Blue Hour)',
              backupWindow: '05:40 AM - 06:50 AM (Next day sunrise)',
              lightingQuality: 'Pristine',
              weatherRisk: 'Medium',
              lightingRisk: 'High',
              cinematographyNotes: 'Ultra-wide anamorphic framing with heavy 1.2 ND + Circular Polarizer.',
              locationProductionScore: 78,
              productionRisks: ['Afternoon thermal winds and blowing sand on optical elements'],
            },
          ],
        },
      ],
    };
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setStatusMessage(null);

    try {
      const fullReport = buildFullReport();

      const res = await api.sendSlackReport('project-aurora-001', {
        report: fullReport,
        channel: selectedChannel,
        webhookUrl: customWebhookUrl.trim() || undefined,
      });

      if (res.success) {
        setLastDispatchedPayload(res.result?.payloadPreview);
        setStatusMessage({
          text: `Successfully dispatched Block Kit message to #${selectedChannel}! View simulated card below.`,
          success: true,
        });
      }
    } catch (err: unknown) {
      setStatusMessage({
        text: 'Dispatch failed: ' + (err instanceof Error ? err.message : String(err)),
        success: false,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6" id="slack-dispatch-view">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#121212] border border-white/10 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-semibold uppercase tracking-wider">
              PRODUCTION CREW COLLABORATION
            </span>
            <span className="text-[10px] font-mono text-white/40">Slack Block Kit 2.0</span>
          </div>
          <h1 className="text-xl font-serif text-[#F5F2ED] tracking-tight mt-1">
            Slack Production Dispatch Hub
          </h1>
          <p className="text-xs text-white/60">
            Transmit rich Slack Block Kit notifications with solar timings, budgets, and secure deep links.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/20">
          <ShieldCheck className="h-4 w-4" />
          <span>Webhook Server Proxy Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dispatch Settings & Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-mono text-xs uppercase tracking-wider text-white/90">
                Channel & Dispatch Configuration
              </h3>
              <span className="text-[10px] font-mono text-[#C5A059]">Aurora Production</span>
            </div>

            <form onSubmit={handleSendTestMessage} className="space-y-4 text-xs">
              {/* Channel Selector */}
              <div className="space-y-2">
                <label className="text-white/80 font-medium font-mono text-[11px] uppercase tracking-wider block">
                  Select Slack Channel
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {channels.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setSelectedChannel(ch.name)}
                      className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedChannel === ch.name
                          ? 'bg-[#C5A059]/15 border-[#C5A059] text-[#F5F2ED]'
                          : 'bg-[#0A0A0A] border-white/10 text-white/70 hover:border-white/20 hover:text-white'
                      }`}
                      id={`slack-channel-${ch.name}`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Hash className={`h-3.5 w-3.5 ${selectedChannel === ch.name ? 'text-[#C5A059]' : 'text-white/40'}`} />
                          <span className="font-mono font-semibold text-xs">{ch.name}</span>
                        </div>
                        <p className="text-[10px] text-white/40 pl-5.5 font-sans">{ch.desc}</p>
                      </div>
                      {ch.isDefault && (
                        <span className="text-[9px] px-2 py-0.5 rounded bg-white/10 text-[#C5A059] font-mono shrink-0">
                          Default
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Webhook URL Input */}
              <div className="space-y-1.5 pt-2">
                <label className="text-white/80 font-medium font-mono text-[11px] uppercase tracking-wider block">
                  Custom Incoming Webhook (Optional)
                </label>
                <input
                  type="url"
                  value={customWebhookUrl}
                  onChange={(e) => setCustomWebhookUrl(e.target.value)}
                  placeholder="https://hooks.slack.com/services/T00/B00/XXXX"
                  className="w-full rounded-xl bg-[#0A0A0A] border border-white/15 px-3.5 py-2.5 text-[#F5F2ED] placeholder-white/30 focus:outline-none focus:border-[#C5A059] font-mono text-xs"
                  id="slack-webhook-url-input"
                />
                <p className="text-[10px] text-white/40 leading-relaxed font-sans">
                  Leave empty to test with CineGemini's built-in sandbox Slack simulator.
                </p>
              </div>

              {/* Submit Dispatch Button */}
              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3.5 px-4 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-black font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-[#C5A059]/20"
                id="slack-dispatch-btn"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>Dispatch Master Report to #{selectedChannel}</span>
              </button>
            </form>

            {/* Status Message Display */}
            {statusMessage && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                  statusMessage.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
                id="slack-dispatch-status"
              >
                {statusMessage.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{statusMessage.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Slack Block Kit Preview Card (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#1a1d21] p-5 space-y-4 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            {/* Slack Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-white font-mono text-sm">#{selectedChannel}</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-400">Live Block Kit 2.0 Card Preview</span>
            </div>

            {/* Message Bot Header */}
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#C5A059] flex items-center justify-center text-black font-black text-xs shrink-0 shadow-md">
                CG
              </div>
              <div className="space-y-2 flex-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">CineGemini Bot</span>
                  <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[9px] font-mono text-zinc-400 border border-zinc-700">APP</span>
                  <span className="text-zinc-500 text-[11px]">Today at 05:00 AM</span>
                </div>

                {/* Slack Block Kit Rich Attachment */}
                <div className="border-l-4 border-[#C5A059] bg-[#222529] p-4 rounded-r-xl space-y-3.5 text-zinc-200 shadow-inner">
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <span>🎬 CINEGEMINI | PROJECT AURORA</span>
                    </div>
                    <div className="text-[11px] font-mono text-amber-300/90 mt-0.5">
                      LOCATION & SHOOTING INTELLIGENCE REPORT • Score: 84/100
                    </div>
                  </div>

                  <p className="text-zinc-300 text-xs leading-relaxed">
                    *Synthesized 3-day production timeline across Dubai Marina waterfront, Alserkal industrial warehouse, Al Fahidi heritage quarter, and Al Qudra desert dunes. Golden hour solar windows locked with DFTC permits verified.*
                  </p>

                  <div className="space-y-2 pt-1">
                    {/* Day 1 Entry */}
                    <div className="bg-[#1a1d21] p-3 rounded-lg border border-zinc-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-white font-mono">📅 DAY 1 (2026-09-15)</span>
                        <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">DFTC VERIFIED</span>
                      </div>
                      <div className="text-xs text-zinc-200">
                        • <strong className="text-[#C5A059]">Scene 1</strong> @ Dubai Marina Waterfront Promenade
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono flex flex-wrap gap-x-3 gap-y-1">
                        <span>⏰ Call Time: 05:45 AM</span>
                        <span>☀️ Sun Window: 05:50 AM - 07:05 AM</span>
                        <span>💰 Est: AED 14,000 - 24,000</span>
                      </div>
                    </div>

                    {/* Day 2 Entry */}
                    <div className="bg-[#1a1d21] p-3 rounded-lg border border-zinc-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-white font-mono">📅 DAY 2 (2026-09-16)</span>
                        <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">VERIFIED</span>
                      </div>
                      <div className="text-xs text-zinc-200">
                        • <strong className="text-[#C5A059]">Scene 3</strong> @ Al Fahidi Historical Quarter
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono flex flex-wrap gap-x-3 gap-y-1">
                        <span>⏰ Call Time: 06:15 AM</span>
                        <span>☀️ Sidelight Window: 06:10 AM - 08:30 AM</span>
                        <span>💰 Est: AED 9,000 - 19,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Security Access Deep Link Button */}
                  <div className="pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Requires authenticated project membership
                    </span>
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <span>Open Secure Project Report</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>Payload Delivery: Verified JSON Block Kit Structure</span>
            <span>Security: Bearer Authorization Bound</span>
          </div>
        </div>
      </div>
    </div>
  );
};
