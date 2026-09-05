import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  Film,
  FileSpreadsheet,
  Compass,
  ArrowLeftRight,
  DollarSign,
  Hammer,
  Sun,
  BookOpen,
  Send,
  ShieldCheck,
  Activity,
  CheckSquare2,
  Cloud,
  Cpu,
  BarChart3,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { userRole, currentUser, logout } = useAuth();

  const isAdmin = userRole === 'ADMIN';

  const navSections = isAdmin
    ? [
        {
          label: 'Admin & Security Ops',
          items: [
            { id: 'sandbox_engine', label: 'Calculation Sandbox (SA)', icon: Cpu, highlight: true },
            { id: 'threat_model', label: 'Agentic Threat Model (5 Zones)', icon: ShieldCheck, highlight: true },
            { id: 'audit_logs', label: 'Observability & Audit Logs', icon: Activity },
            { id: 'deployment_guide', label: 'Cloud Run & ADC Runbooks', icon: Cloud },
            { id: 'test_walkthrough', label: 'Security Test Walkthrough', icon: CheckSquare2 },
          ],
        },
        {
          label: 'Studio & Department',
          items: [
            { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard, badge: 'ADM' },
          ],
        },
      ]
    : [
        {
          label: 'Core Production',
          items: [
            { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard, badge: userRole },
            { id: 'locations', label: 'Location Scout & Grid', icon: MapPin },
            { id: 'scenes', label: 'Scenes & Breakdown', icon: Film },
            { id: 'master_report', label: 'Master Shooting Report', icon: FileSpreadsheet },
            { id: 'production_scout', label: 'AI Production Scout', icon: Compass, highlight: true },
            { id: 'location_swap', label: 'Location Swap Simulator', icon: ArrowLeftRight },
          ],
        },
        {
          label: 'Department Tools',
          items: [
            { id: 'cost_planning', label: 'Cost & Permit Intelligence', icon: DollarSign },
            ...(userRole === 'PRODUCER'
              ? [{ id: 'budget_risk', label: 'Monte Carlo & Payroll Rules', icon: BarChart3, highlight: true }]
              : []),
            { id: 'weather_lighting', label: 'Sun & Lighting Advisor', icon: Sun },
            { id: 'journal', label: 'Gemini Creative Journal', icon: BookOpen },
          ],
        },
        {
          label: 'Crew & Communication',
          items: [
            { id: 'slack_dispatch', label: 'Slack Crew Dispatch', icon: Send },
          ],
        },
      ];

  return (
    <aside className="w-64 shrink-0 border-r border-white/10 bg-[#0A0A0A] flex flex-col justify-between overflow-y-auto hidden md:flex h-[calc(100vh-73px)]">
      <div className="p-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1.5">
            <h3 className="px-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
              {section.label}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activeTab === item.id ||
                  (item.id === 'master_report' && activeTab === 'report') ||
                  (item.id === 'cost_planning' && activeTab === 'cost-planning') ||
                  (item.id === 'budget_risk' && (activeTab === 'budget_risk' || activeTab === 'monte_carlo' || activeTab === 'union_rules')) ||
                  (item.id === 'sandbox_engine' && (activeTab === 'sandbox' || activeTab === 'sandbox_engine')) ||
                  (item.id === 'production_scout' && activeTab === 'production-scout') ||
                  (item.id === 'location_swap' && activeTab === 'location-swap') ||
                  (item.id === 'weather_lighting' && activeTab === 'weather-lighting') ||
                  (item.id === 'slack_dispatch' && activeTab === 'slack') ||
                  (item.id === 'threat_model' && activeTab === 'threat-model') ||
                  (item.id === 'audit_logs' && activeTab === 'observability') ||
                  (item.id === 'test_walkthrough' && activeTab === 'testing') ||
                  (item.id === 'deployment_guide' && activeTab === 'deployment');

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#C5A059]/10 text-[#C5A059] font-medium border border-[#C5A059]/30'
                        : item.highlight
                        ? 'text-[#C5A059] hover:bg-white/[0.04] border border-transparent'
                        : 'text-white/60 hover:bg-white/[0.04] hover:text-[#F5F2ED] border border-transparent'
                    }`}
                    id={`sidebar-nav-${item.id}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-[#C5A059]' : item.highlight ? 'text-[#C5A059]' : 'text-white/40'
                        }`}
                      />
                      <span className="truncate tracking-wide">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-[#C5A059] font-mono border border-white/10">
                        {item.badge.slice(0, 3)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info & Logout Box */}
      <div className="p-4 border-t border-white/10 bg-white/[0.01] text-xs text-white/50 space-y-3">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-white/40">
          <span>{currentUser.name}</span>
          <span className="px-1.5 py-0.5 rounded bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] font-mono font-semibold text-[9px]">
            {userRole}
          </span>
        </div>
        
        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer rounded-lg"
          id="sidebar-logout-btn"
          title="Log out to authenticate as another role"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Log Out / Switch Role</span>
        </button>
      </div>
    </aside>
  );
};
