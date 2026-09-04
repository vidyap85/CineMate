import React, { useState } from 'react';
import { FileSpreadsheet, Sparkles, Send, Download, Printer, CheckCircle2, ShieldCheck, Clock, MapPin, DollarSign, AlertTriangle, Loader2 } from 'lucide-react';
import type { LocationReport, LocationItem, SceneItem, ShootDayItem } from '../../types';
import { api } from '../../lib/api';

interface LocationReportViewProps {
  locations: LocationItem[];
  scenes: SceneItem[];
  shootDays: ShootDayItem[];
  onSendToSlack: (report: LocationReport) => void;
}

export const LocationReportView: React.FC<LocationReportViewProps> = ({
  locations,
  scenes,
  shootDays,
  onSendToSlack,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<LocationReport | null>(() => {
    // Initial rich synthesized report
    return {
      reportId: 'report-aurora-master-001',
      projectId: 'project-aurora-001',
      projectName: 'Project Aurora',
      title: 'Project Aurora - Master Location Shooting Report',
      generatedAt: '2026-09-02T04:00:00Z',
      generatedBy: 'Vidya (Director) & CineMate AI',
      version: 1,
      overallProductionScore: 84,
      executiveSummary:
        'Synthesized 3-day production timeline across Dubai Marina waterfront, Alserkal industrial warehouse, Al Fahidi heritage quarter, and Al Qudra desert dunes. Dawn shooting windows locked with DFTC permits verified.',
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
              permitStatus: 'USER_PROVIDED',
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
              directorNotes: 'Protagonist navigates labyrinthine alleyways, sensing a tail behind him.',
              producerCostRange: { low: 11000, expected: 15000, high: 21000, currency: 'AED' },
              permitRequirements: 'Dubai Culture & Arts Authority Heritage Site Permit',
              permitStatus: 'VERIFIED',
              producerNotes: 'Rubber shoe pads mandatory on historic cobblestones. Battery LED packages only.',
              recommendedWindow: '06:15 AM - 08:30 AM (Shafts of light in wind towers)',
              backupWindow: '04:30 PM - 06:00 PM',
              lightingQuality: 'Pristine',
              weatherRisk: 'Low',
              lightingRisk: 'Low',
              cinematographyNotes: 'Handheld 28mm wide angle on EasyRig. High dynamic range capture for shadow alleyways.',
              locationProductionScore: 82,
              productionRisks: ['Tight alley clearance restricts bulky camera dollies'],
            },
          ],
        },
        {
          dayNumber: 3,
          date: '2026-09-17',
          daySummary: 'Desert Dune Sunset Climax & Blue Hour Standoff',
          entries: [
            {
              sceneNumber: '4',
              shootDay: 3,
              locationName: 'Al Qudra Desert Oasis & Dunes',
              address: 'Al Qudra Road, Dubai Desert Conservation Reserve, UAE',
              coordinates: { lat: 24.8333, lng: 55.3333 },
              shootingTime: '06:10 PM',
              directorNotes: 'Silhouettes against deep crimson and indigo sunset gradient on high dune crest.',
              producerCostRange: { low: 16000, expected: 22000, high: 30000, currency: 'AED' },
              permitRequirements: 'Dubai Desert Conservation Reserve Environmental Permit',
              permitStatus: 'VERIFIED',
              producerNotes: '4x4 transport convoy required. Medic team and sand dust covers on all gear.',
              recommendedWindow: '06:00 PM - 06:45 PM (Sunset & Blue Hour)',
              backupWindow: 'Next morning sunrise 05:45 AM',
              lightingQuality: 'Pristine',
              weatherRisk: 'Medium',
              lightingRisk: 'High',
              cinematographyNotes: '135mm telephoto for horizon lens compression. Tight 25 min twilight window.',
              locationProductionScore: 78,
              productionRisks: ['Sunset window closes abruptly at 06:40 PM', 'Desert wind picking up after dark'],
            },
          ],
        },
      ],
    };
  });

  const handleSynthesizeWithGemini = async () => {
    setIsGenerating(true);
    try {
      const res = await api.generateLocationReport('project-aurora-001', {
        locations,
        scenes,
        shootDays,
      });

      if (res.success && res.report) {
        setReport(res.report);
      }
    } catch (err: unknown) {
      alert('Report generation failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsGenerating(false);
    }
  };

  const exportMarkdown = () => {
    if (!report) return;
    let md = `# ${report.title}\n\n`;
    md += `**Project:** ${report.projectName}\n`;
    md += `**Generated By:** ${report.generatedBy} on ${new Date(report.generatedAt).toLocaleDateString()}\n`;
    md += `**Production Score:** ${report.overallProductionScore}/100\n\n`;
    md += `### Executive Summary\n${report.executiveSummary}\n\n---\n\n`;

    for (const day of report.days) {
      md += `## Day ${day.dayNumber} (${day.date}): ${day.daySummary}\n\n`;
      for (const entry of day.entries) {
        md += `### Scene ${entry.sceneNumber} @ ${entry.locationName}\n`;
        md += `- **Call Time:** ${entry.shootingTime}\n`;
        md += `- **Sun / Lighting Window:** ${entry.recommendedWindow}\n`;
        md += `- **Director Notes:** ${entry.directorNotes}\n`;
        md += `- **Cost Range:** ${entry.producerCostRange.currency} ${entry.producerCostRange.low.toLocaleString()} - ${entry.producerCostRange.high.toLocaleString()} (${entry.permitStatus})\n`;
        md += `- **Permit:** ${entry.permitRequirements}\n`;
        md += `- **DP Notes:** ${entry.cinematographyNotes}\n\n`;
      }
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CineMate_Project_Aurora_Shooting_Plan_v${report.version}.md`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header with Synthesis & Export Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-medium">
              PRE-PRODUCTION INTELLIGENCE REPORT
            </span>
            <span className="text-xs text-zinc-400 font-mono">v{report?.version || 1}.0</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Master Location & Shooting Schedule Report
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSynthesizeWithGemini}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-semibold text-xs shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
            id="report-re-synthesize-btn"
          >
            {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            <span>Re-Synthesize with Gemini</span>
          </button>

          {report && (
            <button
              onClick={() => onSendToSlack(report)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-medium text-xs border border-zinc-700 transition-colors"
              id="report-send-slack-btn"
            >
              <Send className="h-3.5 w-3.5 text-amber-400" />
              <span>Send to Slack</span>
            </button>
          )}

          <button
            onClick={exportMarkdown}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700"
            title="Download Markdown Plan"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {report && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold font-mono text-sm">
                  {report.overallProductionScore}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Overall Production Feasibility Score</h3>
                  <p className="text-[11px] text-zinc-400">Synthesized across Budget, Permits, Solar Times, and Logistics</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Director ✓
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Producer ✓
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  DP ✓
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
              {report.executiveSummary}
            </p>
          </div>

          {/* Day-by-Day Master Tables */}
          {report.days.map((day) => (
            <div
              key={day.dayNumber}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-bold text-xs">
                    DAY {day.dayNumber}
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-sm">{day.daySummary}</h3>
                    <p className="text-[11px] font-mono text-zinc-400">{day.date}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {day.entries.map((entry) => (
                  <div
                    key={entry.sceneNumber}
                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 text-xs">
                          Scene {entry.sceneNumber}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="font-semibold text-white text-xs">{entry.locationName}</span>
                        <span className="text-zinc-500 font-mono text-[11px]">({entry.shootingTime})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            entry.permitStatus === 'VERIFIED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {entry.permitStatus}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-cyan-300 border border-zinc-800">
                          Score: {entry.locationProductionScore}/100
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* Director Pillar */}
                      <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                        <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold block">
                          Director Vision & Notes
                        </span>
                        <p className="text-zinc-300 text-[11px] italic">"{entry.directorNotes}"</p>
                      </div>

                      {/* Producer Pillar */}
                      <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                        <span className="text-[10px] uppercase font-mono text-emerald-400 font-semibold block">
                          Producer Logistics & Permit
                        </span>
                        <div className="text-[11px] font-mono text-emerald-300">
                          Est: {entry.producerCostRange.currency} {entry.producerCostRange.low.toLocaleString()} - {entry.producerCostRange.high.toLocaleString()}
                        </div>
                        <p className="text-zinc-400 text-[11px]">{entry.permitRequirements}</p>
                      </div>

                      {/* Cinematographer Pillar */}
                      <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                        <span className="text-[10px] uppercase font-mono text-cyan-400 font-semibold block">
                          DP Lighting & Solar Window
                        </span>
                        <div className="text-[11px] font-mono text-cyan-300">
                          Window: {entry.recommendedWindow}
                        </div>
                        <p className="text-zinc-400 text-[11px]">{entry.cinematographyNotes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
