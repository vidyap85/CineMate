import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardHome } from './components/Dashboard/DashboardHome';
import { LocationMap } from './components/Locations/LocationMap';
import { LocationList } from './components/Locations/LocationList';
import { LocationModal } from './components/Locations/LocationModal';
import { SceneManager } from './components/Scenes/SceneManager';
import { NoteStructuringModal } from './components/Scenes/NoteStructuringModal';
import { LocationReportView } from './components/Reports/LocationReportView';
import { CostEstimator } from './components/CostPlanning/CostEstimator';
import { SetEstimator } from './components/CostPlanning/SetEstimator';
import { SandboxCalculatorView } from './components/CostPlanning/SandboxCalculatorView';
import { WeatherLightingView } from './components/Weather/WeatherLightingView';
import { ProductionScoutView } from './components/ProductionScout/ProductionScoutView';
import { LocationSwapSimulator } from './components/LocationSwap/LocationSwapSimulator';
import { GeminiJournal } from './components/Journal/GeminiJournal';
import { SlackIntegrationView } from './components/Slack/SlackIntegrationView';
import { ThreatModelView } from './components/Security/ThreatModelView';
import { AuditLogsView } from './components/Security/AuditLogsView';
import { TestWalkthroughView } from './components/Testing/TestWalkthroughView';
import { DeploymentGuideView } from './components/Deployment/DeploymentGuideView';
import { RoleLoginPage } from './components/Auth/RoleLoginPage';
import { ShieldAlert, LogOut, Film } from 'lucide-react';
import { api } from './lib/api';
import { INITIAL_PROJECT, INITIAL_LOCATIONS, INITIAL_SCENES, INITIAL_SHOOT_DAYS } from './data/initialData';
import type { FilmProject, LocationItem, SceneItem, ShootDayItem, LocationReport } from './types';

function CineMateMain() {
  const { currentUser, userRole, isAuthenticated } = useAuth();
  const isAdmin = userRole === 'ADMIN';
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [project, setProject] = useState<FilmProject>(INITIAL_PROJECT);
  const [locations, setLocations] = useState<LocationItem[]>(INITIAL_LOCATIONS);
  const [scenes, setScenes] = useState<SceneItem[]>(INITIAL_SCENES);
  const [shootDays, setShootDays] = useState<ShootDayItem[]>(INITIAL_SHOOT_DAYS);
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Partial<LocationItem> | null>(null);
  const [isCostTabSubmode, setIsCostTabSubmode] = useState<'locations' | 'sets' | 'budget_risk'>('locations');
  const [activeReport, setActiveReport] = useState<LocationReport | null>(null);

  useEffect(() => {
    loadProjectData();
  }, [currentUser]);

  const loadProjectData = async () => {
    try {
      const [projRes, locsRes, scenesRes, daysRes] = await Promise.all([
        api.getProject('project-aurora-001'),
        api.getLocations('project-aurora-001'),
        api.getScenes('project-aurora-001'),
        api.getShootDays('project-aurora-001'),
      ]);

      if (projRes?.project) setProject(projRes.project);
      if (locsRes?.locations && locsRes.locations.length > 0) setLocations(locsRes.locations);
      if (scenesRes?.scenes && scenesRes.scenes.length > 0) setScenes(scenesRes.scenes);
      if (daysRes?.shootDays && daysRes.shootDays.length > 0) setShootDays(daysRes.shootDays);
    } catch (err: unknown) {
      console.warn('Project initialization notice (using cached state):', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLocation = async (locData: Partial<LocationItem>) => {
    if (locData.locationId) {
      const res = await api.updateLocation('project-aurora-001', locData.locationId, locData);
      if (res.success && res.location) {
        setLocations((prev) => prev.map((l) => (l.locationId === locData.locationId ? res.location : l)));
      }
    } else {
      const res = await api.createLocation('project-aurora-001', locData);
      if (res.success && res.location) {
        setLocations((prev) => [...prev, res.location]);
      }
    }
    setEditingLocation(null);
  };

  const handleDeleteLocation = (locId: string) => {
    if (!confirm('Are you sure you want to remove this location?')) return;
    setLocations((prev) => prev.filter((l) => l.locationId !== locId));
  };

  const handleSceneCreated = async (sceneData: Partial<SceneItem>) => {
    const res = await api.createScene('project-aurora-001', sceneData);
    if (res.success && res.scene) {
      setScenes((prev) => [...prev, res.scene]);
    }
  };

  if (!isAuthenticated) {
    return <RoleLoginPage onLoginSuccess={() => setActiveTab('dashboard')} />;
  }

  if (isLoading || !project) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0A0A0A] text-[#F5F2ED]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-sm bg-[#C5A059] flex items-center justify-center text-black font-serif font-bold text-xl tracking-widest animate-pulse shadow-2xl">
            CM
          </div>
          <span className="text-xs uppercase tracking-[0.2em] font-mono text-white/40">Loading CineMate Studio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-[#F5F2ED] font-sans antialiased overflow-hidden selection:bg-[#C5A059]/30 selection:text-[#C5A059]">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          project={project}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenNoteModal={() => setIsNoteModalOpen(true)}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
          {activeTab === 'dashboard' && (
            <DashboardHome
              project={project}
              locations={locations}
              scenes={scenes}
              shootDays={shootDays}
              onOpenNoteModal={() => setIsNoteModalOpen(true)}
              setActiveTab={setActiveTab}
              onRefreshData={loadProjectData}
            />
          )}

          {(activeTab === 'scout_map' || activeTab === 'map') && (
            isAdmin ? (
              <DepartmentAccessNotice
                featureName="Location Scout & Map"
                onReturnToDashboard={() => setActiveTab('dashboard')}
              />
            ) : (
              <LocationMap
                locations={locations}
                onSelectLocation={(loc) => {
                  setEditingLocation(loc);
                  setIsLocationModalOpen(true);
                }}
                onAddNewLocation={() => {
                  setEditingLocation(null);
                  setIsLocationModalOpen(true);
                }}
                onSaveLocation={handleSaveLocation}
              />
            )
          )}

          {activeTab === 'locations' && (
            isAdmin ? (
              <DepartmentAccessNotice
                featureName="Location Scout & Grid"
                onReturnToDashboard={() => setActiveTab('dashboard')}
              />
            ) : (
              <LocationList
                locations={locations}
                onSelectLocation={(loc) => {
                  setEditingLocation(loc);
                  setIsLocationModalOpen(true);
                }}
                onAddNewLocation={(prefill) => {
                  setEditingLocation(prefill || null);
                  setIsLocationModalOpen(true);
                }}
                onSaveLocation={handleSaveLocation}
                onDeleteLocation={handleDeleteLocation}
              />
            )
          )}

          {activeTab === 'scenes' && (
            isAdmin ? (
              <DepartmentAccessNotice
                featureName="Scenes & Breakdown"
                onReturnToDashboard={() => setActiveTab('dashboard')}
              />
            ) : (
              <SceneManager
                scenes={scenes}
                locations={locations}
                shootDays={shootDays}
                onOpenNoteModal={() => setIsNoteModalOpen(true)}
                onAddNewScene={() => setIsNoteModalOpen(true)}
                onEditScene={(scene) => {
                  setIsNoteModalOpen(true);
                }}
              />
            )
          )}

          {(activeTab === 'master_report' || activeTab === 'report') && (
            isAdmin ? (
              <DepartmentAccessNotice
                featureName="Master Shooting Report"
                onReturnToDashboard={() => setActiveTab('dashboard')}
              />
            ) : (
              <LocationReportView
                locations={locations}
                scenes={scenes}
                shootDays={shootDays}
                onSendToSlack={(report) => {
                  setActiveReport(report);
                  setActiveTab('slack_dispatch');
                }}
              />
            )
          )}

          {(activeTab === 'cost_planning' || activeTab === 'cost-planning' || activeTab === 'set-estimate') && (
            isAdmin ? (
              <DepartmentAccessNotice
                featureName="Cost & Permit Intelligence"
                onReturnToDashboard={() => setActiveTab('dashboard')}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4 overflow-x-auto">
                  <button
                    onClick={() => setIsCostTabSubmode('locations')}
                    className={`px-5 py-2 text-xs uppercase tracking-[0.15em] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isCostTabSubmode === 'locations'
                        ? 'bg-[#C5A059] text-black font-bold shadow-md'
                        : 'border border-white/15 text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                    id="tab-cost-locations-btn"
                  >
                    Location & Permit Intelligence
                  </button>
                  <button
                    onClick={() => setIsCostTabSubmode('sets')}
                    className={`px-5 py-2 text-xs uppercase tracking-[0.15em] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isCostTabSubmode === 'sets'
                        ? 'bg-[#C5A059] text-black font-bold shadow-md'
                        : 'border border-white/15 text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                    id="tab-cost-sets-btn"
                  >
                    Set Construction & Art Dept
                  </button>
                  {userRole === 'PRODUCER' && (
                    <button
                      onClick={() => setIsCostTabSubmode('budget_risk')}
                      className={`px-5 py-2 text-xs uppercase tracking-[0.15em] font-medium transition-all cursor-pointer whitespace-nowrap ${
                        isCostTabSubmode === 'budget_risk'
                          ? 'bg-[#C5A059] text-black font-bold shadow-md'
                          : 'border border-white/15 text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                      id="tab-cost-budget-risk-btn"
                    >
                      Monte Carlo & Union Payroll
                    </button>
                  )}
                </div>

                {isCostTabSubmode === 'locations' ? (
                  <CostEstimator locations={locations} />
                ) : isCostTabSubmode === 'sets' ? (
                  <SetEstimator />
                ) : (
                  <SandboxCalculatorView producerMode={true} />
                )}
              </div>
            )
          )}

          {(activeTab === 'budget_risk' || activeTab === 'monte_carlo' || activeTab === 'union_rules') && (
            userRole === 'PRODUCER' ? (
              <SandboxCalculatorView producerMode={true} />
            ) : (
              <AdminRestrictedGuard
                featureName="Monte Carlo Budget Risk & Union Payroll Rules"
                userRole={userRole}
              />
            )
          )}

          {(activeTab === 'weather_lighting' || activeTab === 'weather-lighting') && (
            isAdmin ? (
              <DepartmentAccessNotice
                featureName="Sun & Lighting Advisor"
                onReturnToDashboard={() => setActiveTab('dashboard')}
              />
            ) : (
              <WeatherLightingView locations={locations} />
            )
          )}

          {(activeTab === 'production_scout' || activeTab === 'production-scout') && (
            isAdmin ? (
              <DepartmentAccessNotice
                featureName="AI Production Scout"
                onReturnToDashboard={() => setActiveTab('dashboard')}
              />
            ) : (
              <ProductionScoutView
                locations={locations}
                scenes={scenes}
                shootDays={shootDays}
              />
            )
          )}

          {(activeTab === 'location_swap' || activeTab === 'location-swap') && (
            isAdmin ? (
              <DepartmentAccessNotice
                featureName="Location Swap Simulator"
                onReturnToDashboard={() => setActiveTab('dashboard')}
              />
            ) : (
              <LocationSwapSimulator locations={locations} />
            )
          )}

          {activeTab === 'journal' && (
            isAdmin ? (
              <DepartmentAccessNotice
                featureName="Gemini Creative Journal"
                onReturnToDashboard={() => setActiveTab('dashboard')}
              />
            ) : (
              <GeminiJournal />
            )
          )}

          {(activeTab === 'slack_dispatch' || activeTab === 'slack') && (
            isAdmin ? (
              <DepartmentAccessNotice
                featureName="Slack Crew Dispatch"
                onReturnToDashboard={() => setActiveTab('dashboard')}
              />
            ) : (
              <SlackIntegrationView
                report={activeReport}
                locations={locations}
                scenes={scenes}
                shootDays={shootDays}
              />
            )
          )}

          {/* Admin & Security Ops Routes (Strictly Role-Guarded) */}
          {(activeTab === 'sandbox_engine' || activeTab === 'sandbox') && (
            isAdmin ? (
              <SandboxCalculatorView />
            ) : userRole === 'PRODUCER' ? (
              <SandboxCalculatorView producerMode={true} />
            ) : (
              <AdminRestrictedGuard
                featureName="V8 Calculation Sandbox & Dedicated Service Account Engine"
                userRole={userRole}
              />
            )
          )}

          {(activeTab === 'threat_model' || activeTab === 'threat-model') && (
            isAdmin ? (
              <ThreatModelView />
            ) : (
              <AdminRestrictedGuard
                featureName="Agentic Threat Modeling Matrix (5 Zones)"
                userRole={userRole}
              />
            )
          )}

          {(activeTab === 'audit_logs' || activeTab === 'observability') && (
            isAdmin ? (
              <AuditLogsView />
            ) : (
              <AdminRestrictedGuard
                featureName="Observability Metrics & Security Audit Trail"
                userRole={userRole}
              />
            )
          )}

          {(activeTab === 'test_walkthrough' || activeTab === 'testing') && (
            isAdmin ? (
              <TestWalkthroughView />
            ) : (
              <AdminRestrictedGuard
                featureName="Security & Functional Test Suite Walkthrough"
                userRole={userRole}
              />
            )
          )}

          {(activeTab === 'deployment_guide' || activeTab === 'deployment') && (
            isAdmin ? (
              <DeploymentGuideView />
            ) : (
              <AdminRestrictedGuard
                featureName="Cloud Run Deployment & PoLP IAM Runbooks"
                userRole={userRole}
              />
            )
          )}
        </main>
      </div>

      {/* Global Modals */}
      <NoteStructuringModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        projectId="project-aurora-001"
        onSceneCreated={handleSceneCreated}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => {
          setIsLocationModalOpen(false);
          setEditingLocation(null);
        }}
        onSave={handleSaveLocation}
        initialData={editingLocation}
      />
    </div>
  );
}

function AdminRestrictedGuard({
  featureName,
  userRole,
}: {
  featureName: string;
  userRole: string;
}) {
  const { logout } = useAuth();
  return (
    <div className="p-8 max-w-2xl mx-auto my-12 bg-[#0E0E0E] border border-rose-500/30 text-center space-y-5 rounded-none shadow-2xl">
      <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-rose-400 px-2 py-0.5 border border-rose-500/30 bg-rose-500/10">
          Administrator Role Clearance Required
        </span>
        <h2 className="text-2xl font-serif text-[#F5F2ED] tracking-wide mt-2">
          Restricted Security Module
        </h2>
        <p className="text-xs text-white/60 leading-relaxed max-w-md mx-auto">
          Access to <span className="text-rose-300 font-medium font-mono">{featureName}</span> is restricted to the <strong className="text-[#F5F2ED]">ADMIN</strong> security role under our PoLP governance standard.
        </p>
      </div>

      <div className="p-3 bg-white/[0.02] border border-white/10 text-[11px] font-mono text-white/50 text-left space-y-1">
        <div>Current Session: <span className="text-[#C5A059]">{userRole}</span></div>
        <div>Required Role: <span className="text-rose-400 font-bold">ADMIN (Security & Operations)</span></div>
        <div>Policy: Least-Privilege Role Isolation & Cloud Run Protection</div>
      </div>

      <div className="pt-2 flex items-center justify-center gap-3">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono uppercase tracking-wider transition-all cursor-pointer font-semibold shadow-lg"
          id="guard-switch-role-btn"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out to Switch Role</span>
        </button>
      </div>
    </div>
  );
}

function DepartmentAccessNotice({
  featureName,
  onReturnToDashboard,
}: {
  featureName: string;
  onReturnToDashboard: () => void;
}) {
  return (
    <div className="p-8 max-w-xl mx-auto my-12 bg-[#0E0E0E] border border-white/10 text-center space-y-4 shadow-xl">
      <div className="w-10 h-10 mx-auto rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
        <Film className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C5A059]">
          Department Clearance Feature
        </span>
        <h2 className="text-xl font-serif text-[#F5F2ED]">{featureName}</h2>
      </div>
      <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed">
        This module is reserved for creative and production department crew members. Admin clearance focuses exclusively on Security & Cloud Ops, Sandbox Telemetry, Overview Dashboard, and Creative Journal Review.
      </p>
      <div className="pt-2">
        <button
          onClick={onReturnToDashboard}
          className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#d4b06a] text-black text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-md"
          id="department-return-dashboard-btn"
        >
          Return to Overview Dashboard
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CineMateMain />
    </AuthProvider>
  );
}
