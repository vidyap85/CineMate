import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types';
import { setApiAuthToken } from '../lib/api';

interface AuthContextType {
  currentUser: UserProfile;
  currentProjectId: string;
  userRole: UserRole;
  isAuthenticated: boolean;
  selectedLoginRole: UserRole;
  setSelectedLoginRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  switchProject: (projectId: string) => void;
  loginAsRole: (role: UserRole, customEmail?: string) => void;
  loginWithEmail: (email: string, role?: UserRole) => void;
  logout: () => void;
  availableRoles: { role: UserRole; label: string; email: string; name: string; avatar: string; description: string; permissions: string[] }[];
}

const PRESET_USERS: Record<UserRole, UserProfile> = {
  DIRECTOR: {
    uid: 'user-director-001',
    email: 'director@cinegemini.io',
    name: 'Sofia Chen',
    role: 'DIRECTOR',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    projectIds: ['project-aurora-001'],
    permissions: ['scout_locations', 'create_scenes', 'generate_report', 'send_slack'],
  },
  PRODUCER: {
    uid: 'user-producer-001',
    email: 'producer@cinegemini.io',
    name: 'Elena Rostova',
    role: 'PRODUCER',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    projectIds: ['project-aurora-001'],
    permissions: ['estimate_costs', 'analyze_permits', 'estimate_sets', 'approve_budget'],
  },
  CINEMATOGRAPHER: {
    uid: 'user-cinematographer-001',
    email: 'cinematographer@cinegemini.io',
    name: 'Marcus Thorne',
    role: 'CINEMATOGRAPHER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    projectIds: ['project-aurora-001'],
    permissions: ['analyze_weather', 'calculate_solar', 'cinematic_advisor', 'add_lighting_notes'],
  },
  ADMIN: {
    uid: 'user-admin-001',
    email: 'security.admin@cinegemini.io',
    name: 'Sarah Chen (Security & Ops)',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    projectIds: ['project-aurora-001', 'project-nebula-002'],
    permissions: ['manage_sandbox', 'audit_security', 'view_metrics', 'manage_service_account', 'threat_model_access'],
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem('cinegemini_authenticated');
    return savedAuth ? savedAuth === 'true' : true;
  });

  const [selectedLoginRole, setSelectedLoginRole] = useState<UserRole>('DIRECTOR');

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedRole = localStorage.getItem('cinegemini_role') as UserRole;
    return (savedRole && PRESET_USERS[savedRole]) || PRESET_USERS.DIRECTOR;
  });

  const [currentProjectId, setCurrentProjectId] = useState<string>('project-aurora-001');

  useEffect(() => {
    const token = `demo-${currentUser.role}:${currentUser.uid}:${currentUser.email}:${currentUser.name}`;
    setApiAuthToken(token);
    localStorage.setItem('cinegemini_role', currentUser.role);
    localStorage.setItem('cinegemini_authenticated', String(isAuthenticated));
  }, [currentUser, isAuthenticated]);

  const switchRole = (role: UserRole) => {
    if (PRESET_USERS[role]) {
      setCurrentUser(PRESET_USERS[role]);
      setSelectedLoginRole(role);
    }
  };

  const loginAsRole = (role: UserRole, customEmail?: string) => {
    const baseUser = PRESET_USERS[role] || PRESET_USERS.DIRECTOR;
    if (customEmail && customEmail.trim() && customEmail !== baseUser.email) {
      setCurrentUser({
        ...baseUser,
        email: customEmail.trim(),
        name: customEmail.split('@')[0],
      });
    } else {
      setCurrentUser(baseUser);
    }
    setSelectedLoginRole(role);
    setIsAuthenticated(true);
  };

  const switchProject = (projectId: string) => {
    setCurrentProjectId(projectId);
  };

  const loginWithEmail = (email: string, role: UserRole = 'DIRECTOR') => {
    const matched = Object.values(PRESET_USERS).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setCurrentUser(matched);
      setSelectedLoginRole(matched.role);
    } else {
      const newUser: UserProfile = {
        uid: `user_${Date.now()}`,
        email,
        name: email.split('@')[0],
        role,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
        projectIds: ['project-aurora-001'],
        permissions: ['scout_locations', 'create_scenes'],
      };
      setCurrentUser(newUser);
      setSelectedLoginRole(role);
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const availableRoles = [
    {
      role: 'DIRECTOR' as UserRole,
      label: 'Director (Creative & Visual)',
      email: 'director@cinegemini.io',
      name: 'Sofia Chen',
      avatar: PRESET_USERS.DIRECTOR.avatar!,
      description: 'Visionary leadership, script-to-scene breakdown, aesthetic moodboards, director notes, and crew dispatch.',
      permissions: ['Location Scouting', 'Scene Breakdown', 'AI Vision Synthesis', 'Slack Dispatch', 'Full Studio Access'],
    },
    {
      role: 'PRODUCER' as UserRole,
      label: 'Producer (Budget & Logistics)',
      email: 'producer@cinegemini.io',
      name: 'Elena Rostova',
      avatar: PRESET_USERS.PRODUCER.avatar!,
      description: 'Financial authority, location permit verifications, set construction costing, vendor agreements, and budget caps.',
      permissions: ['Cost Range Estimator', 'Permit Authority Check', 'Art Dept Set Estimator', 'Budget Cap Guardrails'],
    },
    {
      role: 'CINEMATOGRAPHER' as UserRole,
      label: 'Cinematographer (DP & Light)',
      email: 'cinematographer@cinegemini.io',
      name: 'Marcus Thorne',
      avatar: PRESET_USERS.CINEMATOGRAPHER.avatar!,
      description: 'Optics, lens packages, Golden/Blue hour solar ephemeris, camera movements, and natural/artificial lighting setup.',
      permissions: ['Solar Ephemeris Calculator', 'Weather Risk Modeling', 'Lens & Camera Advisor', 'Lighting Notes'],
    },
    {
      role: 'ADMIN' as UserRole,
      label: 'Security & Cloud Ops Administrator',
      email: 'security.admin@cinegemini.io',
      name: 'Sarah Chen',
      avatar: PRESET_USERS.ADMIN.avatar!,
      description: 'Production infrastructure, dedicated Service Account PoLP management, hardened V8 calculation sandbox, threat model auditing, and SLO observability.',
      permissions: ['V8 Calculation Sandbox', 'Service Account & IAM', '5-Zone Threat Matrix', 'Cloud Run & ADC Runbooks', 'SLO & Security Audit Logs'],
    },
  ];

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentProjectId,
        userRole: currentUser.role,
        isAuthenticated,
        selectedLoginRole,
        setSelectedLoginRole,
        switchRole,
        switchProject,
        loginAsRole,
        loginWithEmail,
        logout,
        availableRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
