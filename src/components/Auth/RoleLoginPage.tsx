import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Film,
  Clapperboard,
  DollarSign,
  Camera,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  KeyRound,
  ChevronRight,
  Sun,
  Layers,
  FileCheck,
  Send,
  Cpu,
  Activity,
} from 'lucide-react';
import type { UserRole } from '../../types';

interface RoleLoginPageProps {
  initialRole?: UserRole;
  onLoginSuccess?: () => void;
}

export const RoleLoginPage: React.FC<RoleLoginPageProps> = ({ initialRole, onLoginSuccess }) => {
  const { availableRoles, loginAsRole, selectedLoginRole, setSelectedLoginRole } = useAuth();
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>(initialRole || selectedLoginRole || 'DIRECTOR');
  const [customEmail, setCustomEmail] = useState<string>('');
  const [passkeyInput, setPasskeyInput] = useState<string>('••••••••••••');
  const [viewMode, setViewMode] = useState<'individual' | 'gateway'>('individual');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeRoleData = availableRoles.find((r) => r.role === activeRoleTab) || availableRoles[0];

  const handleRoleLogin = (role: UserRole, emailOverride?: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      loginAsRole(role, emailOverride || (customEmail ? customEmail : undefined));
      setIsSubmitting(false);
      onLoginSuccess?.();
    }, 350);
  };

  const getRoleMetadata = (role: UserRole) => {
    switch (role) {
      case 'DIRECTOR':
        return {
          title: 'Director Portal',
          subtitle: 'Creative Vision & Narrative Command',
          badge: 'CREATIVE LEAD',
          icon: Clapperboard,
          accentColor: '#C5A059',
          bgAccent: 'rgba(197, 160, 89, 0.08)',
          borderAccent: 'border-[#C5A059]/40',
          features: [
            { icon: Film, title: 'Scene & Script Breakdown', desc: 'Transform scripts into shooting days, scene beats, and camera angles.' },
            { icon: Sparkles, title: 'Gemini Location Intelligence', desc: 'Synthesize location scouts with moodboards and aesthetic briefs.' },
            { icon: Send, title: 'Crew Slack Call Sheets', desc: 'Dispatch daily schedules directly to cast and heads of department.' },
          ],
          defaultEmail: 'vidyap85@gmail.com',
          holderName: 'Vidya (Director Lead)',
        };
      case 'PRODUCER':
        return {
          title: 'Producer Portal',
          subtitle: 'Logistics, Costing & Permit Clearance',
          badge: 'FINANCIAL & LEGAL LEAD',
          icon: DollarSign,
          accentColor: '#E5C158',
          bgAccent: 'rgba(229, 193, 88, 0.08)',
          borderAccent: 'border-[#E5C158]/40',
          features: [
            { icon: DollarSign, title: 'Itemized Cost Range Engine', desc: 'Live low/expected/high variance models and AED budget caps.' },
            { icon: FileCheck, title: 'Film Commission Permits', desc: 'Verify municipal clearances, drone waivers, and municipal rules.' },
            { icon: Layers, title: 'Art Dept & Set Costing', desc: 'Estimate props, set construction, and location modification fees.' },
          ],
          defaultEmail: 'producer@cinegemini.io',
          holderName: 'Elena Rostova (Executive Producer)',
        };
      case 'CINEMATOGRAPHER':
        return {
          title: 'Cinematographer Portal',
          subtitle: 'Optics, Solar Ephemeris & Lighting Planning',
          badge: 'CAMERA & LIGHTING LEAD',
          icon: Camera,
          accentColor: '#D4AF37',
          bgAccent: 'rgba(212, 175, 55, 0.08)',
          borderAccent: 'border-[#D4AF37]/40',
          features: [
            { icon: Sun, title: 'Solar Ephemeris Calculator', desc: 'Pinpoint exact Golden Hour, Blue Hour, and solar azimuth angles.' },
            { icon: Camera, title: 'Lens & Camera Advisor', desc: 'AI-assisted sensor, focal length, and anamorphic recommendations.' },
            { icon: Layers, title: 'Lighting & Weather Contingency', desc: 'Plan artificial fill packages and backup lighting for overcast days.' },
          ],
          defaultEmail: 'cinematographer@cinegemini.io',
          holderName: 'Marcus Thorne (Director of Photography)',
        };
      case 'ADMIN':
        return {
          title: 'Admin & Security Portal',
          subtitle: 'Dedicated SA, V8 Sandbox & Cloud Audit Suite',
          badge: 'SECURITY & OPS LEAD',
          icon: ShieldCheck,
          accentColor: '#F43F5E',
          bgAccent: 'rgba(244, 63, 94, 0.08)',
          borderAccent: 'border-rose-500/40',
          features: [
            { icon: Cpu, title: 'Hardened V8 Sandbox Engine', desc: 'Execute Monte Carlo simulations and custom formulas with 2000ms CPU timeout.' },
            { icon: ShieldCheck, title: 'Service Account & PoLP Enforcer', desc: 'Manage cinepilot-backend-sa, ADC without private keys, and reject compute defaults.' },
            { icon: Activity, title: '5-Zone Threat Model & Audit Logs', desc: 'Audit OWASP LLM mitigations, SLO metrics, and Cloud Run security deployment runbooks.' },
          ],
          defaultEmail: 'security.admin@cinegemini.io',
          holderName: 'Sarah Chen (Security & Cloud Ops Admin)',
        };
    }
  };

  const currentMeta = getRoleMetadata(activeRoleTab);

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F2ED] flex flex-col justify-between selection:bg-[#C5A059] selection:text-black">
      {/* Top Studio Header */}
      <header className="w-full border-b border-white/10 bg-[#0A0A0A]/95 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#C5A059] text-black shadow-md">
            <Film className="h-5 w-5 stroke-[2.4]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-serif tracking-[0.2em] text-[#F5F2ED] uppercase">CineMate</span>
              <span className="text-[9px] uppercase tracking-[0.2em] font-mono px-1.5 py-0.5 border border-[#C5A059]/40 text-[#C5A059] bg-[#C5A059]/10">
                STUDIO GATEWAY
              </span>
            </div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
              Project Aurora • Security Enforced (RBAC Level 3)
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 border border-white/10 bg-white/[0.02] p-1">
          <button
            onClick={() => setViewMode('individual')}
            className={`px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-all ${
              viewMode === 'individual'
                ? 'bg-[#C5A059] text-black font-semibold shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
            id="login-view-individual-btn"
          >
            Role Login Page
          </button>
          <button
            onClick={() => setViewMode('gateway')}
            className={`px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-all ${
              viewMode === 'gateway'
                ? 'bg-[#C5A059] text-black font-semibold shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
            id="login-view-gateway-btn"
          >
            3-Portal Hub
          </button>
        </div>
      </header>

      {/* Main Login Body */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-10">
        {viewMode === 'individual' ? (
          /* ================= INDIVIDUAL ROLE LOGIN VIEW ================= */
          <div className="w-full max-w-4xl bg-[#0D0D0D] border border-white/10 shadow-2xl overflow-hidden">
            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-white/10 bg-[#0A0A0A]">
              {(['DIRECTOR', 'PRODUCER', 'CINEMATOGRAPHER', 'ADMIN'] as UserRole[]).map((role) => {
                const meta = getRoleMetadata(role);
                const isActive = activeRoleTab === role;
                const RoleIcon = meta.icon;
                return (
                  <button
                    key={role}
                    onClick={() => {
                      setActiveRoleTab(role);
                      setSelectedLoginRole(role);
                      setCustomEmail('');
                    }}
                    className={`py-3.5 px-4 text-left transition-all flex items-center justify-center sm:justify-start gap-3 border-b-2 ${
                      isActive
                        ? 'border-[#C5A059] bg-[#141414] text-[#F5F2ED]'
                        : 'border-transparent text-white/40 hover:text-white/80 hover:bg-white/[0.02]'
                    }`}
                    id={`tab-role-login-${role.toLowerCase()}`}
                  >
                    <RoleIcon className={`h-4 w-4 ${isActive ? 'text-[#C5A059]' : 'text-white/40'}`} />
                    <div className="hidden sm:block">
                      <p className="text-[11px] font-mono uppercase tracking-widest">{role}</p>
                      <p className="text-[10px] text-white/40 truncate">{meta.badge}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Split Content: Left details / Right Credentials */}
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Column: Role Details & Responsibilities */}
              <div className="lg:col-span-6 p-8 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0B0B0B] flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-[#C5A059]/30 bg-[#C5A059]/10 text-[#C5A059] text-[10px] font-mono uppercase tracking-[0.2em] mb-4">
                    <currentMeta.icon className="h-3 w-3" />
                    <span>{currentMeta.badge}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-serif text-[#F5F2ED] tracking-wide mb-2">
                    {currentMeta.title}
                  </h1>
                  <p className="text-xs text-white/60 mb-6 leading-relaxed">
                    {currentMeta.subtitle}. Access encrypted production assets, AI scene intelligence, and project clearance tools for Project Aurora.
                  </p>

                  <div className="space-y-4 mb-8">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">Role Authority & Privileges</p>
                    {currentMeta.features.map((feat, idx) => {
                      const Icon = feat.icon;
                      return (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5">
                          <div className="p-1.5 bg-[#C5A059]/10 border border-[#C5A059]/20 text-[#C5A059] mt-0.5">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[#F5F2ED]">{feat.title}</p>
                            <p className="text-[11px] text-white/50 leading-normal">{feat.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Preconfigured Profile preview */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeRoleData.avatar}
                      alt={activeRoleData.name}
                      className="h-10 w-10 rounded-full border border-[#C5A059]/40 object-cover"
                    />
                    <div>
                      <p className="text-xs font-serif text-[#F5F2ED]">{activeRoleData.name}</p>
                      <p className="text-[10px] font-mono text-white/40">{activeRoleData.email}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                    VERIFIED
                  </span>
                </div>
              </div>

              {/* Right Column: Credentials & Action */}
              <div className="lg:col-span-6 p-8 bg-[#0E0E0E] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white/70">
                      Authenticate Credentials
                    </h2>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#C5A059]">
                      <Lock className="h-3 w-3" />
                      <span>Zero-Trust Token</span>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                        Production Email / Lead ID
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                        <input
                          type="email"
                          value={customEmail || currentMeta.defaultEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          placeholder={currentMeta.defaultEmail}
                          className="w-full bg-[#141414] border border-white/15 px-3 py-2.5 pl-9 text-xs text-[#F5F2ED] placeholder:text-white/30 focus:border-[#C5A059] focus:outline-none font-mono"
                          id={`input-email-${activeRoleTab.toLowerCase()}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                        Department Clearance Passkey (Demo Encrypted)
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                        <input
                          type="password"
                          value={passkeyInput}
                          onChange={(e) => setPasskeyInput(e.target.value)}
                          className="w-full bg-[#141414] border border-white/15 px-3 py-2.5 pl-9 text-xs text-[#F5F2ED] focus:border-[#C5A059] focus:outline-none font-mono tracking-widest"
                          id={`input-passkey-${activeRoleTab.toLowerCase()}`}
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-white/[0.02] border border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
                        <span>Project Scope</span>
                        <span className="text-[#C5A059]">project-aurora-001</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
                        <span>Role Boundary</span>
                        <span className="text-[#F5F2ED]">{activeRoleTab}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
                        <span>Security Standard</span>
                        <span className="text-emerald-400">OWASP A01 / RBAC</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-6 space-y-3">
                  <button
                    onClick={() => handleRoleLogin(activeRoleTab, customEmail || currentMeta.defaultEmail)}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-[#C5A059] hover:bg-[#d4b06a] text-black font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                    id={`btn-login-submit-${activeRoleTab.toLowerCase()}`}
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full border-2 border-black border-t-transparent animate-spin"></span>
                        Authorizing Token...
                      </span>
                    ) : (
                      <>
                        <span>Enter as {activeRoleTab}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-[10px] text-white/30 font-mono">
                      Clicking authenticate provisions secure bearer token with {activeRoleTab} permission claims.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= 3-PORTAL HUB VIEW ================= */
          <div className="w-full max-w-6xl">
            <div className="text-center mb-10">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C5A059] px-2 py-1 border border-[#C5A059]/30 bg-[#C5A059]/10">
                Production Department Gateways
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif text-[#F5F2ED] tracking-wide mt-3 mb-2">
                Select Your Role Portal
              </h1>
              <p className="text-xs text-white/50 max-w-lg mx-auto">
                Each portal loads role-specific AI tools, data isolation boundaries, and production dashboards for Project Aurora.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(['DIRECTOR', 'PRODUCER', 'CINEMATOGRAPHER', 'ADMIN'] as UserRole[]).map((role) => {
                const meta = getRoleMetadata(role);
                const roleData = availableRoles.find((r) => r.role === role)!;
                const RoleIcon = meta.icon;

                return (
                  <div
                    key={role}
                    className="bg-[#0D0D0D] border border-white/10 hover:border-[#C5A059]/50 transition-all p-6 flex flex-col justify-between group shadow-xl"
                    id={`card-portal-${role.toLowerCase()}`}
                  >
                    <div>
                      {/* Top badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059]">
                          <RoleIcon className="h-5 w-5" />
                        </div>
                        <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border border-white/10 text-white/60">
                          {meta.badge}
                        </span>
                      </div>

                      <h2 className="text-xl font-serif text-[#F5F2ED] tracking-wide mb-1 group-hover:text-[#C5A059] transition-colors">
                        {meta.title}
                      </h2>
                      <p className="text-xs text-white/50 mb-6">{meta.subtitle}</p>

                      {/* Lead user */}
                      <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 mb-6">
                        <img
                          src={roleData.avatar}
                          alt={roleData.name}
                          className="h-8 w-8 rounded-full object-cover border border-[#C5A059]/30"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-serif text-[#F5F2ED] truncate">{roleData.name}</p>
                          <p className="text-[10px] font-mono text-white/40 truncate">{roleData.email}</p>
                        </div>
                      </div>

                      {/* Privileges list */}
                      <div className="space-y-2 mb-6">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">Core Capabilities</p>
                        {roleData.permissions.slice(0, 3).map((perm, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-2 text-xs text-white/70">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#C5A059] shrink-0" />
                            <span className="truncate">{perm}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Button */}
                    <div className="pt-4 border-t border-white/10">
                      <button
                        onClick={() => handleRoleLogin(role, roleData.email)}
                        className="w-full py-2.5 px-3 bg-[#141414] hover:bg-[#C5A059] text-white hover:text-black font-semibold text-xs uppercase tracking-wider border border-white/20 hover:border-[#C5A059] transition-all flex items-center justify-center gap-2 cursor-pointer"
                        id={`btn-portal-enter-${role.toLowerCase()}`}
                      >
                        <span>Launch {role} Portal</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer / Threat & Security Compliance Bar */}
      <footer className="w-full border-t border-white/10 bg-[#0A0A0A] px-6 lg:px-12 py-3 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-white/40 gap-2">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-[#C5A059]" />
          <span>Role-Based Access Control (RBAC) • Multi-Tenant Token Verification</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Active Project: Project Aurora (001)</span>
          <span>•</span>
          <span>Server Model: Gemini 3.6 Flash</span>
        </div>
      </footer>
    </div>
  );
};
