import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { DirectorDashboard } from './DirectorDashboard';
import { ProducerDashboard } from './ProducerDashboard';
import { CinematographerDashboard } from './CinematographerDashboard';
import { AdminDashboard } from './AdminDashboard';
import { ShieldCheck, LogOut, Lock } from 'lucide-react';
import type { FilmProject, LocationItem, SceneItem, ShootDayItem } from '../../types';

interface DashboardHomeProps {
  project: FilmProject;
  locations: LocationItem[];
  scenes: SceneItem[];
  shootDays: ShootDayItem[];
  onOpenNoteModal: () => void;
  setActiveTab: (tab: string) => void;
  onRefreshData: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  project,
  locations,
  scenes,
  shootDays,
  onOpenNoteModal,
  setActiveTab,
  onRefreshData,
}) => {
  const { userRole, currentUser, logout } = useAuth();

  return (
    <div className="space-y-6">
      {/* Production Role Lock Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3 bg-[#121212] p-4 rounded-xl border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">
                Authenticated Role:
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#C5A059] text-black">
                {userRole}
              </span>
            </div>
            <p className="text-xs text-white/80 font-mono mt-0.5">
              Logged in as <span className="text-[#F5F2ED] font-semibold">{currentUser.name}</span> ({currentUser.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-mono hidden md:flex items-center gap-1.5">
            <Lock className="h-3 w-3 text-emerald-400" />
            <span>RBAC Enforced</span>
          </div>

          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white/70 hover:text-white text-xs font-mono transition-all cursor-pointer"
            id="dashboard-logout-role-btn"
            title="Log out to switch to another role"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Switch Role / Logout</span>
          </button>
        </div>
      </div>

      {userRole === 'DIRECTOR' && (
        <DirectorDashboard
          project={project}
          locations={locations}
          scenes={scenes}
          shootDays={shootDays}
          onOpenNoteModal={onOpenNoteModal}
          setActiveTab={setActiveTab}
          onRefreshData={onRefreshData}
        />
      )}

      {userRole === 'PRODUCER' && (
        <ProducerDashboard
          project={project}
          locations={locations}
          shootDays={shootDays}
          setActiveTab={setActiveTab}
        />
      )}

      {userRole === 'CINEMATOGRAPHER' && (
        <CinematographerDashboard
          locations={locations}
          scenes={scenes}
          setActiveTab={setActiveTab}
        />
      )}

      {userRole === 'ADMIN' && (
        <AdminDashboard setActiveTab={setActiveTab} />
      )}
    </div>
  );
};

