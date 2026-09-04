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
import { api } from './lib/api';
import { INITIAL_PROJECT, INITIAL_LOCATIONS, INITIAL_SCENES, INITIAL_SHOOT_DAYS } from './data/initialData';
import type { FilmProject, LocationItem, SceneItem, ShootDayItem, LocationReport } from './types';

function CineMateMain() {
  const { currentUser, userRole, isAuthenticated } = useAuth();
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
  const [isCostTabSubmode, setIsCostTabSubmode] = useState<'locations' | 'sets' | 'sandbox'>('locations');
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
          {activeTab === 'role_portals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h1 className="text-2xl font-serif text-[#F5F2ED]">Role Login Portals</h1>
                  <p className="text-xs text-white/50">Dedicated authentication gateways for Director, Producer, and Cinematographer.</p>
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 bg-[#C5A059] text-black font-semibold text-xs uppercase tracking-wider"
                >
                  Return to Dashboard
                </button>
              </div>
              <RoleLoginPage onLoginSuccess={() => setActiveTab('dashboard')} />
            </div>
          )}

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
          )}

          {activeTab === 'locations' && (
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
          )}

          {activeTab === 'scenes' && (
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
          )}

          {(activeTab === 'master_report' || activeTab === 'report') && (
            <LocationReportView
              locations={locations}
              scenes={scenes}
              shootDays={shootDays}
              onSendToSlack={(report) => {
                setActiveReport(report);
                setActiveTab('slack_dispatch');
              }}
            />
          )}

          {(activeTab === 'cost_planning' || activeTab === 'cost-planning' || activeTab === 'set-estimate' || activeTab === 'sandbox_engine' || activeTab === 'sandbox') && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4 overflow-x-auto">
                <button
                  onClick={() => setIsCostTabSubmode('locations')}
                  className={`px-5 py-2 text-xs uppercase tracking-[0.15em] font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isCostTabSubmode === 'locations' && activeTab !== 'sandbox_engine' && activeTab !== 'sandbox'
                      ? 'bg-[#C5A059] text-black font-bold shadow-md'
                      : 'border border-white/15 text-white/60 hover:text-white hover:bg-white/5'
                  }`}
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
                >
                  Set Construction & Art Dept
                </button>
                <button
                  onClick={() => setIsCostTabSubmode('sandbox')}
                  className={`px-5 py-2 text-xs uppercase tracking-[0.15em] font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isCostTabSubmode === 'sandbox' || activeTab === 'sandbox_engine' || activeTab === 'sandbox'
                      ? 'bg-[#C5A059] text-black font-bold shadow-md'
                      : 'border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059]/10'
                  }`}
                >
                  <span>Calculation Sandbox & PoLP SA</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 font-mono">SA Active</span>
                </button>
              </div>

              {activeTab === 'sandbox_engine' || activeTab === 'sandbox' || isCostTabSubmode === 'sandbox' ? (
                <SandboxCalculatorView />
              ) : isCostTabSubmode === 'locations' ? (
                <CostEstimator locations={locations} />
              ) : (
                <SetEstimator />
              )}
            </div>
          )}

          {(activeTab === 'weather_lighting' || activeTab === 'weather-lighting') && (
            <WeatherLightingView locations={locations} />
          )}

          {(activeTab === 'production_scout' || activeTab === 'production-scout') && (
            <ProductionScoutView
              locations={locations}
              scenes={scenes}
              shootDays={shootDays}
            />
          )}

          {(activeTab === 'location_swap' || activeTab === 'location-swap') && (
            <LocationSwapSimulator locations={locations} />
          )}

          {activeTab === 'journal' && <GeminiJournal />}

          {(activeTab === 'slack_dispatch' || activeTab === 'slack') && (
            <SlackIntegrationView
              report={activeReport}
              locations={locations}
              scenes={scenes}
              shootDays={shootDays}
            />
          )}

          {(activeTab === 'threat_model' || activeTab === 'threat-model') && <ThreatModelView />}

          {(activeTab === 'audit_logs' || activeTab === 'observability') && <AuditLogsView />}

          {(activeTab === 'test_walkthrough' || activeTab === 'testing') && <TestWalkthroughView />}

          {(activeTab === 'deployment_guide' || activeTab === 'deployment') && <DeploymentGuideView />}
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

export default function App() {
  return (
    <AuthProvider>
      <CineMateMain />
    </AuthProvider>
  );
}
