import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Film, Clapperboard, ShieldCheck, Activity, Send, UserCircle2, ChevronDown, Check } from 'lucide-react';
import type { UserRole } from '../types';

interface NavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  project?: any;
  onOpenNoteModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab = 'dashboard', setActiveTab, project, onOpenNoteModal }) => {
  const { currentUser, userRole, switchRole, availableRoles, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'DIRECTOR':
        return 'text-[#C5A059] border-[#C5A059]/40 bg-[#C5A059]/10';
      case 'PRODUCER':
        return 'text-[#E5C158] border-[#E5C158]/40 bg-[#E5C158]/10';
      case 'CINEMATOGRAPHER':
        return 'text-[#D4AF37] border-[#D4AF37]/40 bg-[#D4AF37]/10';
      case 'ADMIN':
        return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
      default:
        return 'text-white/70 border-white/20 bg-white/5';
    }
  };

  const isAdmin = userRole === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0A0A0A]/95 backdrop-blur-md px-6 lg:px-10 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand Identity & Active Project */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab?.('dashboard')}
            className="flex items-center gap-3 text-left focus:outline-none group"
            id="brand-header-button"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#C5A059] text-black shadow-md transition-transform group-hover:scale-105">
              <Film className="h-4 w-4 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-light tracking-[0.25em] text-[#F5F2ED] uppercase">CineMate</span>
                <span className="text-[9px] uppercase tracking-[0.2em] font-mono px-1.5 py-0.5 rounded border border-[#C5A059]/30 text-[#C5A059] bg-[#C5A059]/10">
                  STUDIO AI
                </span>
              </div>
              <p className="text-[11px] text-white/40 tracking-wider uppercase font-light">
                {project?.title || 'Project Aurora'} • Neo-Noir Thriller
              </p>
            </div>
          </button>
        </div>

        {/* Center: Quick Mode Toggles / Status indicators */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-none border border-white/10 bg-white/[0.02] text-[11px] text-white/70 uppercase tracking-widest font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059] animate-pulse"></span>
            <span>Gemini 3.6 Flash</span>
          </div>

          {isAdmin ? (
            <>
              <button
                onClick={() => setActiveTab?.('threat-model')}
                className={`flex items-center gap-2 px-3 py-1.5 text-[11px] uppercase tracking-wider font-mono transition-all border ${
                  activeTab === 'threat-model' || activeTab === 'threat_model'
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/50'
                    : 'bg-transparent text-white/50 border-white/10 hover:text-white/80 hover:border-white/20'
                }`}
                id="nav-threat-model-btn"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-rose-400" />
                <span>Threat Model: 5 Zones</span>
              </button>

              <button
                onClick={() => setActiveTab?.('observability')}
                className={`flex items-center gap-2 px-3 py-1.5 text-[11px] uppercase tracking-wider font-mono transition-all border ${
                  activeTab === 'observability' || activeTab === 'audit_logs'
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/50'
                    : 'bg-transparent text-white/50 border-white/10 hover:text-white/80 hover:border-white/20'
                }`}
                id="nav-observability-btn"
              >
                <Activity className="h-3.5 w-3.5 text-rose-400" />
                <span>SLO: 99.98%</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 border border-white/10 bg-white/[0.01] text-[11px] font-mono text-white/40 uppercase tracking-wider">
              <span>Department Workspace</span>
              <span className="text-[#C5A059]">•</span>
              <span className="text-white/70">{userRole}</span>
            </div>
          )}
        </div>

        {/* Right: Quick Action & Role Switcher */}
        <div className="flex items-center gap-4">
          {onOpenNoteModal && (
            <button
              onClick={onOpenNoteModal}
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[#C5A059] hover:bg-[#d4b06a] text-black text-[11px] uppercase tracking-[0.2em] font-bold transition-all shadow-sm cursor-pointer"
              id="nav-quick-note-btn"
            >
              <Clapperboard className="h-3.5 w-3.5" />
              <span>AI Note Structurer</span>
            </button>
          )}

          {userRole !== 'ADMIN' && (
            <button
              onClick={() => setActiveTab?.('slack_dispatch')}
              className="hidden sm:flex items-center gap-2 px-3 py-2 border border-white/20 hover:border-white/40 hover:bg-white/5 text-[11px] uppercase tracking-widest text-[#F5F2ED] transition-all"
              id="nav-slack-btn"
              title="Slack Crew Dispatch"
            >
              <Send className="h-3.5 w-3.5 text-[#C5A059]" />
              <span>Slack</span>
            </button>
          )}

          <div className="w-px h-6 bg-white/20 hidden sm:block"></div>

          {/* User Account & Security Session Menu */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-3 text-right focus:outline-none group cursor-pointer"
              id="role-switcher-button"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">Role Account</p>
                <p className="text-xs font-medium text-[#C5A059] tracking-wider">{userRole}</p>
              </div>
              <div className="w-9 h-9 rounded-full border border-[#C5A059]/40 bg-white/5 flex items-center justify-center text-xs text-[#F5F2ED] font-serif overflow-hidden">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="h-full w-full object-cover" />
                ) : (
                  <span>{currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'CG'}</span>
                )}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-white/40 group-hover:text-white transition-colors" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-xl bg-[#0E0E0E] border border-white/15 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Active User Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <img
                    src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                    alt={currentUser?.name}
                    className="h-11 w-11 rounded-full object-cover border border-[#C5A059]/50"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-[#F5F2ED] truncate">{currentUser?.name}</div>
                    <div className="text-[11px] text-white/50 truncate font-mono">{currentUser?.email}</div>
                    <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] text-[9px] font-mono font-bold uppercase tracking-wider">
                      <span>{userRole}</span>
                    </div>
                  </div>
                </div>

                {/* Session Security Details */}
                <div className="py-3 border-b border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-white/40">Project Scope:</span>
                    <span className="text-[#F5F2ED]">{project?.title || 'Project Aurora'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-white/40">Security Clearance:</span>
                    <span className="text-emerald-400 font-semibold">RBAC Level 3 Enforced</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-white/40">Session Token:</span>
                    <span className="text-white/60 truncate max-w-[140px]">Bearer • Verified</span>
                  </div>
                </div>

                <div className="py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-mono mb-1.5">
                    Production Role Isolation
                  </p>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    To switch department roles, log out and authenticate using the credentials for that role.
                  </p>
                </div>

                {/* Logout Action */}
                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={() => {
                      logout();
                      setRoleMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer font-semibold"
                    id="nav-logout-btn"
                  >
                    <span>Log Out & Return to Role Login</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
