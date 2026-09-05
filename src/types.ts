export type UserRole = 'DIRECTOR' | 'PRODUCER' | 'CINEMATOGRAPHER' | 'ADMIN';

export interface UserProfile {
  uid: string;
  name: string;
  displayName?: string;
  email: string;
  role: UserRole;
  projectIds: string[];
  permissions?: string[];
  avatarUrl?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMember {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  joinedAt: string;
}

export interface FilmProject {
  projectId: string;
  projectName: string;
  description: string;
  genre?: string;
  budgetCap?: number;
  currency: string;
  ownerId: string;
  members: Record<string, ProjectMember>;
  createdAt: string;
  updatedAt: string;
}

export interface LocationItem {
  locationId: string;
  projectId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  category?: 'Waterfront' | 'Urban' | 'Heritage' | 'Industrial' | 'Beach' | 'Park' | 'Interior' | 'Studio' | 'Commercial' | 'Desert' | 'Mountain';
  notes?: string;
  sceneReferences: string[]; // scene IDs
  shootingDays: number[]; // shoot day numbers
  permitStatus?: 'VERIFIED' | 'USER_PROVIDED' | 'AI_ESTIMATE' | 'UNVERIFIED';
  estimatedCostRange?: {
    low: number;
    expected: number;
    high: number;
    currency: string;
  };
  weatherSummary?: string;
  lightingNotes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SceneItem {
  sceneId: string;
  projectId: string;
  shootDay: number;
  sceneNumber: string;
  locationId: string;
  locationName?: string;
  shootingTime: string; // e.g. "05:45 AM"
  timeOfDay?: 'Sunrise' | 'Morning' | 'Midday' | 'Golden Hour' | 'Sunset' | 'Blue Hour' | 'Night' | 'Interior Day' | 'Interior Night';
  description: string;
  directorNotes?: string;
  producerNotes?: string;
  cinematographyNotes?: {
    lens?: string;
    lightingRequirement?: string;
    cameraMovement?: string;
    naturalLightPreference?: string;
    artificialLighting?: string;
    equipment?: string;
    weatherBackup?: string;
    lightingConcerns?: string;
  };
  weatherDependency?: string;
  lightingDependency?: string;
  productionConsiderations?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShootDayItem {
  dayId: string;
  projectId: string;
  dayNumber: number;
  date: string; // YYYY-MM-DD
  title: string;
  callTime: string;
  wrapTime: string;
  sceneIds: string[];
  totalEstimatedCost?: number;
  travelTimeMinutes?: number;
  notes?: string;
}

export type ProvenanceTag = 'VERIFIED' | 'USER PROVIDED' | 'AI ESTIMATE' | 'UNVERIFIED';

export interface LocationReportEntry {
  sceneNumber: string;
  shootDay: number;
  locationName: string;
  address: string;
  coordinates: { lat: number; lng: number };
  shootingTime: string;
  directorNotes: string;
  
  // Producer Section
  producerCostRange: {
    low: number;
    expected: number;
    high: number;
    currency: string;
  };
  permitRequirements: string;
  permitStatus: ProvenanceTag;
  producerNotes?: string;

  // Cinematographer Section
  recommendedWindow: string;
  backupWindow: string;
  lightingQuality: 'Pristine' | 'Excellent' | 'Good' | 'Fair' | 'Challenging';
  weatherRisk: 'Low' | 'Medium' | 'High';
  lightingRisk: 'Low' | 'Medium' | 'High';
  cinematographyNotes?: string;

  // Synthesis
  locationProductionScore: number; // 0-100
  productionRisks: string[];
}

export interface LocationReport {
  reportId: string;
  projectId: string;
  projectName: string;
  title: string;
  generatedAt: string;
  generatedBy: string;
  version: number;
  days: {
    dayNumber: number;
    date: string;
    entries: LocationReportEntry[];
    daySummary?: string;
  }[];
  overallProductionScore: number;
  executiveSummary: string;
  slackSentAt?: string;
  slackChannel?: string;
  provenance: {
    directorProvided: boolean;
    producerEnriched: boolean;
    cinematographerEnriched: boolean;
    geminiSynthesized: boolean;
  };
}

export interface CostLineItem {
  category: 'Location Rental' | 'Permit & Licenses' | 'Security Personnel' | 'Parking & Transport' | 'Electricity & Generator' | 'Cleaning & Remediation' | 'Production Insurance' | 'Set Construction' | 'Contingency';
  amount: number;
  provenance: ProvenanceTag;
  details: string;
  officialSource?: string;
}

export interface LocationCostEstimate {
  estimateId: string;
  projectId: string;
  locationId: string;
  locationName: string;
  city: string;
  country: string;
  currency: string;
  crewSize: number;
  shootingDays: number;
  lowEstimate: number;
  likelyEstimate: number;
  highEstimate: number;
  breakdown: CostLineItem[];
  permitAuthority: string;
  permitStatus: ProvenanceTag;
  permitNotes: string;
  restrictions: string[];
  disclaimer: string;
  generatedAt: string;
}

export interface AlternativeLocation {
  name: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  distanceKm: number;
  visualSimilarityPercentage: number;
  costCategory: 'Significantly Lower' | 'Lower' | 'Comparable' | 'Higher';
  estimatedCostLow: number;
  estimatedCostHigh: number;
  currency: string;
  advantages: string[];
  disadvantages: string[];
  permitConsiderations: string;
  productionRisk: 'Low' | 'Medium' | 'High';
}

export interface SetConstructionEstimate {
  estimateId: string;
  projectId: string;
  setDescription: string;
  setSizeSqFt: number;
  currency: string;
  materialsCost: number;
  carpentryCost: number;
  paintingCost: number;
  propsCost: number;
  electricalCost: number;
  lightingInfrastructureCost: number;
  laborCost: number;
  transportCost: number;
  artDepartmentCost: number;
  dismantlingCost: number;
  wasteDisposalCost: number;
  contingencyCost: number;
  totalLow: number;
  totalExpected: number;
  totalHigh: number;
  estimatedDurationDays: number;
  assumptions: string[];
  generatedAt: string;
}

export interface DayWiseProductionCostPlan {
  projectId: string;
  currency: string;
  generatedAt: string;
  days: {
    dayNumber: number;
    date: string;
    scenes: string[];
    locations: string[];
    locationRentalCost: number;
    permitCost: number;
    setCost: number;
    crewAndEquipmentCost: number;
    otherCost: number;
    dayTotal: number;
    provenanceMap: Record<string, ProvenanceTag>;
  }[];
  overallTotalLow: number;
  overallTotalExpected: number;
  overallTotalHigh: number;
}

export interface SolarTimes {
  date: string;
  dawn: string;
  sunrise: string;
  morningGoldenHourStart: string;
  morningGoldenHourEnd: string;
  morningBlueHourStart: string;
  morningBlueHourEnd: string;
  solarNoon: string;
  eveningGoldenHourStart: string;
  eveningGoldenHourEnd: string;
  sunset: string;
  eveningBlueHourStart: string;
  eveningBlueHourEnd: string;
  dusk: string;
}

export interface WeatherData {
  locationName: string;
  coordinates: { lat: number; lng: number };
  forecastTime: string;
  temperatureC: number;
  temperatureF: number;
  condition: string;
  conditionIcon: string;
  rainProbability: number;
  cloudCoverPercentage: number;
  windSpeedKmh: number;
  humidityPercentage: number;
  visibilityKm: number;
  uvIndex: number;
  solarTimes: SolarTimes;
  isSimulated?: boolean;
}

export interface CinematicAdvice {
  sceneId?: string;
  locationName: string;
  targetTime: string;
  targetDate: string;
  primaryShootingWindow: {
    start: string;
    end: string;
    description: string;
  };
  backupShootingWindow: {
    start: string;
    end: string;
    description: string;
  };
  lightingCharacteristics: string;
  weatherRisks: string[];
  lightingRisks: string[];
  suggestedLenses: string[];
  cameraConsiderations: string;
  confidenceScore: number;
  generatedAt: string;
}

export interface ProductionScoutAnalysis {
  projectId: string;
  overallScore: number;
  scheduleConflicts: {
    dayNumber: number;
    description: string;
    severity: 'High' | 'Medium' | 'Low';
    travelTimeMinutes: number;
    recommendation: string;
  }[];
  locationScores: {
    locationId: string;
    locationName: string;
    score: number;
    costRisk: 'Low' | 'Medium' | 'High';
    permitRisk: 'Low' | 'Medium' | 'High';
    weatherRisk: 'Low' | 'Medium' | 'High';
    lightingQuality: string;
    crowdRisk: 'Low' | 'Medium' | 'High';
    logisticsRisk: 'Low' | 'Medium' | 'High';
    topRecommendation: string;
  }[];
  criticalRisks: string[];
  keyRecommendations: string[];
  generatedAt: string;
}

export interface LocationSwapComparison {
  currentLocation: {
    locationId?: string;
    name: string;
    address?: string;
    notes?: string;
    category?: string;
    permitStatus?: string;
    estimatedCost?: number;
    currency?: string;
    risk?: 'Low' | 'Medium' | 'High';
    permitComplexity?: 'Low' | 'Medium' | 'High';
    weatherSuitability?: string;
  };
  candidateLocation: {
    name: string;
    address?: string;
    notes?: string;
    category?: string;
    permitStatus?: string;
    estimatedCost?: number;
    currency?: string;
    risk?: 'Low' | 'Medium' | 'High';
    permitComplexity?: 'Low' | 'Medium' | 'High';
    weatherSuitability?: string;
  };
  alternativeLocation?: {
    name: string;
    address?: string;
    notes?: string;
    category?: string;
    permitStatus?: string;
    estimatedCost?: number;
    currency?: string;
    risk?: 'Low' | 'Medium' | 'High';
    permitComplexity?: 'Low' | 'Medium' | 'High';
    weatherSuitability?: string;
  };
  metrics: {
    visualMatchPercentage: number;
    costDifferenceAED: number;
    travelTimeDeltaMinutes: number;
    permitComplexityComparison: string;
  };
  potentialSavings: number;
  visualSimilarityPercentage: number;
  travelTimeDeltaMinutes: number;
  recommendationVerdict: 'Strongly Recommend Swap' | 'Consider Swap' | 'Keep Current Location';
  reasoning: string;
  tradeOffSummary: string;
  generatedAt: string;
}

export interface JournalMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  userRole?: UserRole;
}

export interface JournalConversation {
  conversationId: string;
  userId: string;
  userRole: UserRole;
  projectId: string;
  title: string;
  messages: JournalMessage[];
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlackConfig {
  connected: boolean;
  teamName?: string;
  channelName?: string;
  channelId?: string;
  botUserId?: string;
  connectedAt?: string;
  isMockDemoMode?: boolean;
}

export interface AuditLogItem {
  logId: string;
  projectId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resourceType: 'PROJECT' | 'LOCATION' | 'SCENE' | 'REPORT' | 'COST' | 'SET' | 'WEATHER' | 'SLACK' | 'AUTH' | 'PLAN' | 'SANDBOX';
  resourceId?: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface ObservabilityMetrics {
  authSuccessRate: number; // e.g. 99.8%
  apiAvailability: number; // e.g. 99.95%
  geminiLatencyMs: number;
  geminiSuccessRate: number;
  reportGenLatencyMs: number;
  slackDeliverySuccessRate: number;
  totalRequestsHandled: number;
  activeRateLimitsTriggered: number;
  systemUptimeSeconds: number;
}

export interface ThreatScenario {
  id: string;
  zone: 'Input Surfaces' | 'Planning & Reasoning' | 'Tool Execution' | 'Memory & State' | 'Inter-System Communication';
  title: string;
  owaspCategory: string;
  threatDescription: string;
  countermeasure: string;
  status: 'MITIGATED' | 'ENFORCED';
  verificationTest: string;
}

export type AuditLogEntry = AuditLogItem;

export interface JournalEntry {
  entryId: string;
  userId: string;
  projectId: string;
  title: string;
  roleTag: UserRole;
  messages: {
    role: 'user' | 'model';
    content: string;
    timestamp: string;
  }[];
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

