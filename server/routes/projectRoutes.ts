import { Router } from 'express';
import type { FilmProject, LocationItem, SceneItem, ShootDayItem } from '../../src/types.js';
import { requireAuth, requireProjectMember } from '../middleware/auth.js';
import { recordAuditLog } from '../observability.js';

export const projectRouter = Router();

// In-memory project store (in production this delegates to Cloud Firestore)
const projectsStore: Record<string, FilmProject> = {
  'project-aurora-001': {
    projectId: 'project-aurora-001',
    projectName: 'Project Aurora',
    description: 'An international neo-noir thriller exploring dawn chases along waterfronts and historic quarters.',
    genre: 'Neo-Noir Thriller',
    budgetCap: 350000,
    currency: 'AED',
    ownerId: 'user-director-001',
    members: {
      'user-director-001': {
        uid: 'user-director-001',
        name: 'Vidya',
        email: 'vidyap85@gmail.com',
        role: 'DIRECTOR',
        permissions: ['scout_locations', 'create_scenes', 'generate_report', 'send_slack'],
        joinedAt: '2026-08-01T08:00:00Z',
      },
      'user-producer-001': {
        uid: 'user-producer-001',
        name: 'Elena Rostova',
        email: 'producer@cinegemini.io',
        role: 'PRODUCER',
        permissions: ['estimate_costs', 'analyze_permits', 'estimate_sets', 'approve_budget'],
        joinedAt: '2026-08-01T08:00:00Z',
      },
      'user-cinematographer-001': {
        uid: 'user-cinematographer-001',
        name: 'Marcus Thorne',
        email: 'cinematographer@cinegemini.io',
        role: 'CINEMATOGRAPHER',
        permissions: ['analyze_weather', 'calculate_solar', 'cinematic_advisor', 'add_lighting_notes'],
        joinedAt: '2026-08-01T08:00:00Z',
      },
    },
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-09-02T04:00:00Z',
  },
};

const locationsStore: Record<string, LocationItem[]> = {
  'project-aurora-001': [
    {
      locationId: 'loc-dubai-marina',
      projectId: 'project-aurora-001',
      name: 'Dubai Marina Waterfront Promenade',
      address: 'Dubai Marina Walk, Dubai, United Arab Emirates',
      latitude: 25.0778,
      longitude: 55.1396,
      placeId: 'ChIJz2x0X65tXz4R31v0z75j8l0',
      category: 'Waterfront',
      notes: 'Character walks toward the waterfront at sunrise. Dramatic glass and water reflections.',
      sceneReferences: ['scene-101'],
      shootingDays: [1],
      permitStatus: 'VERIFIED',
      estimatedCostRange: { low: 14000, expected: 18500, high: 24000, currency: 'AED' },
      weatherSummary: 'Clear skies, 28°C, low wind. Peak sunrise lighting.',
      lightingNotes: 'Morning Golden Hour (05:50 AM - 07:05 AM) provides 45° warm rim light on actors.',
      createdBy: 'user-director-001',
      createdAt: '2026-08-10T09:00:00Z',
      updatedAt: '2026-08-15T11:30:00Z',
    },
    {
      locationId: 'loc-alserkal',
      projectId: 'project-aurora-001',
      name: 'Alserkal Avenue Cultural District',
      address: '17th St - Al Quoz Industrial Area 1, Dubai, UAE',
      latitude: 25.1417,
      longitude: 55.2283,
      placeId: 'ChIJPbM6Qk9tXz4RP6yQp1v8q_0',
      category: 'Industrial',
      notes: 'Warehouse courtyard encounter. High contrast architecture and diffused shadows.',
      sceneReferences: ['scene-102'],
      shootingDays: [1],
      permitStatus: 'USER_PROVIDED',
      estimatedCostRange: { low: 8500, expected: 12000, high: 16000, currency: 'AED' },
      weatherSummary: 'Partly cloudy, 31°C, protected from heavy direct wind.',
      lightingNotes: 'Midday diffused overhead illumination between tall warehouse walls.',
      createdBy: 'user-director-001',
      createdAt: '2026-08-11T14:00:00Z',
      updatedAt: '2026-08-15T12:00:00Z',
    },
    {
      locationId: 'loc-al-fahidi',
      projectId: 'project-aurora-001',
      name: 'Al Fahidi Historical Quarter',
      address: 'Al Souq Al Kabeer, Bur Dubai, Dubai, UAE',
      latitude: 25.2638,
      longitude: 55.2972,
      placeId: 'ChIJz2x0X65tXz4R31v0z75j8l1',
      category: 'Heritage',
      notes: 'Narrow coral-stone alleyways. Shadowy chase scene requiring high dynamic range sensor.',
      sceneReferences: ['scene-201', 'scene-202'],
      shootingDays: [2],
      permitStatus: 'VERIFIED',
      estimatedCostRange: { low: 11000, expected: 15000, high: 21000, currency: 'AED' },
      weatherSummary: 'Warm ambient 30°C, narrow alley shading reduces heat buildup.',
      lightingNotes: 'Morning Golden hour backlighting creates rim light through wind towers.',
      createdBy: 'user-director-001',
      createdAt: '2026-08-12T10:30:00Z',
      updatedAt: '2026-08-16T15:00:00Z',
    },
    {
      locationId: 'loc-al-qudra-desert',
      projectId: 'project-aurora-001',
      name: 'Al Qudra Desert Oasis & Dunes',
      address: 'Al Qudra Road, Dubai Desert Conservation Reserve, UAE',
      latitude: 24.8333,
      longitude: 55.3333,
      placeId: 'ChIJz2x0X65tXz4R31v0z75j8l2',
      category: 'Desert',
      notes: 'Expansive desert dunes at twilight. Blue hour final confrontation.',
      sceneReferences: ['scene-301'],
      shootingDays: [3],
      permitStatus: 'VERIFIED',
      estimatedCostRange: { low: 16000, expected: 22000, high: 30000, currency: 'AED' },
      weatherSummary: 'Clear horizon, wind picking up around sunset (18 km/h).',
      lightingNotes: 'Sunset (06:35 PM) followed by 25 min Blue Hour window with pristine gradients.',
      createdBy: 'user-director-001',
      createdAt: '2026-08-14T16:00:00Z',
      updatedAt: '2026-08-18T10:00:00Z',
    },
  ],
};

const scenesStore: Record<string, SceneItem[]> = {
  'project-aurora-001': [
    {
      sceneId: 'scene-101',
      projectId: 'project-aurora-001',
      shootDay: 1,
      sceneNumber: '1',
      locationId: 'loc-dubai-marina',
      locationName: 'Dubai Marina Waterfront Promenade',
      shootingTime: '05:45 AM',
      timeOfDay: 'Sunrise',
      description: 'Opening sequence. Character emerges from night shadows and walks along the marina waterfront at first light.',
      directorNotes: 'Slow Steadicam tracking shot following protagonist facing the rising sun across the yacht basin.',
      producerNotes: 'Security clearance required for marina walkway before public foot traffic begins at 07:30 AM.',
      cinematographyNotes: {
        lens: 'Anamorphic 40mm T2.0',
        lightingRequirement: 'Natural sunrise key + subtle negative fill on shadow side',
        cameraMovement: 'Steadicam tracking backward at 24fps',
        naturalLightPreference: 'Sunrise rim light',
        artificialLighting: 'Minimal - 1x Aputure 600d with lantern for eye light',
        equipment: 'Steadicam rig, ND 0.9 filter',
        weatherBackup: 'If cloudy, push to Evening Golden Hour (05:20 PM)',
        lightingConcerns: 'Rapidly shifting sun elevation between 05:45 AM and 06:45 AM',
      },
      weatherDependency: 'Clear horizon for direct morning sun rays',
      lightingDependency: 'Morning Golden Hour (05:50 AM - 07:05 AM)',
      productionConsiderations: 'Marina security guard check-in at 05:00 AM sharp',
      createdBy: 'user-director-001',
      createdAt: '2026-08-10T10:00:00Z',
      updatedAt: '2026-08-15T11:45:00Z',
    },
    {
      sceneId: 'scene-102',
      projectId: 'project-aurora-001',
      shootDay: 1,
      sceneNumber: '2',
      locationId: 'loc-alserkal',
      locationName: 'Alserkal Avenue Cultural District',
      shootingTime: '10:30 AM',
      timeOfDay: 'Midday',
      description: 'Dialogue scene inside gallery warehouse courtyard. Informant passes encrypted drive.',
      directorNotes: 'Two-shot over-the-shoulder dialogue with sharp architectural diagonals in background.',
      producerNotes: 'Permit secured with Alserkal management. Generator truck parking in Lane 4.',
      cinematographyNotes: {
        lens: '50mm & 85mm primes',
        lightingRequirement: '12x12 diffusion overhead to tame harsh midday sunlight',
        cameraMovement: 'Subtle slow dolly push-in',
        naturalLightPreference: 'Diffused top light',
        artificialLighting: '2x Skypanel S60 bouncing off white warehouse wall',
        equipment: 'Dana Dolly, 12x12 Silk, Skypanels',
      },
      createdBy: 'user-director-001',
      createdAt: '2026-08-11T14:30:00Z',
      updatedAt: '2026-08-15T12:15:00Z',
    },
    {
      sceneId: 'scene-201',
      projectId: 'project-aurora-001',
      shootDay: 2,
      sceneNumber: '3',
      locationId: 'loc-al-fahidi',
      locationName: 'Al Fahidi Historical Quarter',
      shootingTime: '06:15 AM',
      timeOfDay: 'Morning',
      description: 'Protagonist navigates labyrinthine alleyways, sensing a tail behind him.',
      directorNotes: 'Tight framing to emphasize claustrophobia and historic textured walls.',
      producerNotes: 'Dubai Culture permit confirmed. Silent shoe rubber pads for crew on cobblestone.',
      cinematographyNotes: {
        lens: '28mm wide angle',
        lightingRequirement: 'Natural shafts of sunlight penetrating narrow windtower alleyways',
        cameraMovement: 'Handheld with EasyRig',
      },
      createdBy: 'user-director-001',
      createdAt: '2026-08-12T11:00:00Z',
      updatedAt: '2026-08-16T15:20:00Z',
    },
    {
      sceneId: 'scene-301',
      projectId: 'project-aurora-001',
      shootDay: 3,
      sceneNumber: '4',
      locationId: 'loc-al-qudra-desert',
      locationName: 'Al Qudra Desert Oasis & Dunes',
      shootingTime: '06:10 PM',
      timeOfDay: 'Sunset',
      description: 'Climactic standoff on the crest of a high red dune against the vast desert horizon.',
      directorNotes: 'Silhouettes against deep crimson and indigo sunset gradient.',
      producerNotes: '4x4 transport convoy required for heavy gear. EMT medic on site.',
      cinematographyNotes: {
        lens: '135mm telephoto for lens compression',
        lightingRequirement: 'Pure natural sunset gradient into Blue Hour',
        cameraMovement: 'Static lockdown on heavy Mitchell tripod',
        lightingConcerns: 'Window closes 25 minutes after sunset',
      },
      createdBy: 'user-director-001',
      createdAt: '2026-08-14T16:30:00Z',
      updatedAt: '2026-08-18T10:30:00Z',
    },
  ],
};

const shootDaysStore: Record<string, ShootDayItem[]> = {
  'project-aurora-001': [
    {
      dayId: 'day-1',
      projectId: 'project-aurora-001',
      dayNumber: 1,
      date: '2026-09-15',
      title: 'Waterfront Dawn & Urban Industrial Dialogue',
      callTime: '04:45 AM',
      wrapTime: '02:30 PM',
      sceneIds: ['scene-101', 'scene-102'],
      totalEstimatedCost: 30500,
      travelTimeMinutes: 25,
      notes: 'Morning crew breakfast at Marina dock before 05:45 AM sunrise roll.',
    },
    {
      dayId: 'day-2',
      projectId: 'project-aurora-001',
      dayNumber: 2,
      date: '2026-09-16',
      title: 'Historical Alleyways & Rooftop Stalking',
      callTime: '05:30 AM',
      wrapTime: '04:00 PM',
      sceneIds: ['scene-201'],
      totalEstimatedCost: 22000,
      travelTimeMinutes: 35,
      notes: 'Quiet battery-powered LED packages inside Heritage district.',
    },
    {
      dayId: 'day-3',
      projectId: 'project-aurora-001',
      dayNumber: 3,
      date: '2026-09-17',
      title: 'Desert Dune Sunset Climax & Blue Hour',
      callTime: '02:00 PM',
      wrapTime: '08:30 PM',
      sceneIds: ['scene-301'],
      totalEstimatedCost: 35000,
      travelTimeMinutes: 55,
      notes: 'Strict golden hour into blue hour shooting window. Sand covers on all lenses.',
    },
  ],
};

// GET /api/projects/:projectId
projectRouter.get('/:projectId', requireAuth, requireProjectMember, (req, res) => {
  const project = projectsStore[req.projectId!];
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }
  res.json({ success: true, project });
});

// GET /api/projects/:projectId/locations
projectRouter.get('/:projectId/locations', requireAuth, requireProjectMember, (req, res) => {
  const locations = locationsStore[req.projectId!] || [];
  res.json({ success: true, locations });
});

// POST /api/projects/:projectId/locations
projectRouter.post('/:projectId/locations', requireAuth, requireProjectMember, (req, res) => {
  const { name, address, latitude, longitude, placeId, category, notes, shootingDays } = req.body;
  if (!name || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ success: false, error: 'Name, latitude, and longitude are required' });
  }

  const newLocation: LocationItem = {
    locationId: `loc_${Date.now()}`,
    projectId: req.projectId!,
    name,
    address: address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    latitude: Number(latitude),
    longitude: Number(longitude),
    placeId,
    category: category || 'Urban',
    notes,
    sceneReferences: [],
    shootingDays: shootingDays || [1],
    permitStatus: 'AI_ESTIMATE',
    estimatedCostRange: { low: 8000, expected: 12000, high: 18000, currency: 'AED' },
    createdBy: req.user!.uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!locationsStore[req.projectId!]) locationsStore[req.projectId!] = [];
  locationsStore[req.projectId!].push(newLocation);

  recordAuditLog({
    projectId: req.projectId!,
    userId: req.user!.uid,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'LOCATION_CREATED',
    resourceType: 'LOCATION',
    resourceId: newLocation.locationId,
    details: `Created new filming location '${name}' at ${newLocation.address}`,
  });

  res.status(201).json({ success: true, location: newLocation });
});

// PUT /api/projects/:projectId/locations/:locationId
projectRouter.put('/:projectId/locations/:locationId', requireAuth, requireProjectMember, (req, res) => {
  const { locationId } = req.params;
  const list = locationsStore[req.projectId!] || [];
  const idx = list.findIndex((l) => l.locationId === locationId);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Location not found' });
  }

  list[idx] = {
    ...list[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  recordAuditLog({
    projectId: req.projectId!,
    userId: req.user!.uid,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'LOCATION_UPDATED',
    resourceType: 'LOCATION',
    resourceId: locationId,
    details: `Updated location details for '${list[idx].name}'`,
  });

  res.json({ success: true, location: list[idx] });
});

// DELETE /api/projects/:projectId/locations/:locationId
projectRouter.delete('/:projectId/locations/:locationId', requireAuth, requireProjectMember, (req, res) => {
  const { locationId } = req.params;
  const list = locationsStore[req.projectId!] || [];
  const idx = list.findIndex((l) => l.locationId === locationId);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Location not found' });
  }

  const deleted = list.splice(idx, 1)[0];
  recordAuditLog({
    projectId: req.projectId!,
    userId: req.user!.uid,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'LOCATION_DELETED',
    resourceType: 'LOCATION',
    resourceId: locationId,
    details: `Removed location '${deleted.name}'`,
  });

  res.json({ success: true, deletedLocationId: locationId });
});

// GET /api/projects/:projectId/scenes
projectRouter.get('/:projectId/scenes', requireAuth, requireProjectMember, (req, res) => {
  const scenes = scenesStore[req.projectId!] || [];
  res.json({ success: true, scenes });
});

// POST /api/projects/:projectId/scenes
projectRouter.post('/:projectId/scenes', requireAuth, requireProjectMember, (req, res) => {
  const { shootDay, sceneNumber, locationId, shootingTime, timeOfDay, description, directorNotes, cinematographyNotes } = req.body;
  if (!sceneNumber || !description) {
    return res.status(400).json({ success: false, error: 'Scene number and description are required' });
  }

  const locations = locationsStore[req.projectId!] || [];
  const matchedLoc = locations.find(
    (l) => l.locationId === locationId || (req.body.locationName && l.name.toLowerCase() === String(req.body.locationName).toLowerCase())
  );

  const resolvedLocationName = req.body.locationName || matchedLoc?.name || 'Assigned Location';
  const resolvedShootDay = Number(String(shootDay).replace(/\D/g, '')) || 1;
  const cleanSceneNumber = String(sceneNumber).replace(/^scene\s*/i, '').trim() || '1';

  const newScene: SceneItem = {
    sceneId: `scene_${Date.now()}`,
    projectId: req.projectId!,
    shootDay: resolvedShootDay,
    sceneNumber: cleanSceneNumber,
    locationId: locationId || matchedLoc?.locationId || `loc-${Date.now()}`,
    locationName: resolvedLocationName,
    shootingTime: shootingTime || '06:00 AM',
    timeOfDay: timeOfDay || 'Morning',
    description,
    directorNotes: directorNotes || (description ? `Director vision: ${description}` : undefined),
    producerNotes: req.body.producerNotes || req.body.productionConsiderations || 'Permit & logistics clearance registered for production.',
    productionConsiderations: req.body.productionConsiderations || req.body.producerNotes,
    weatherDependency: req.body.weatherDependency,
    lightingDependency: req.body.lightingDependency,
    cinematographyNotes: cinematographyNotes || {
      lightingRequirement: req.body.lightingDependency || 'Natural Lighting Key',
      naturalLightPreference: req.body.lightingDependency,
      weatherBackup: req.body.weatherDependency || 'Cover set backup',
      lens: 'Anamorphic 35mm / 50mm Prime',
      cameraMovement: 'Dynamic tracking shot',
    },
    createdBy: req.user!.uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!scenesStore[req.projectId!]) scenesStore[req.projectId!] = [];
  scenesStore[req.projectId!].push(newScene);

  // Synchronize shootDaysStore so newly added shoot days (e.g. Day 4) appear immediately for all roles
  if (!shootDaysStore[req.projectId!]) shootDaysStore[req.projectId!] = [];
  let targetDay = shootDaysStore[req.projectId!].find((d) => d.dayNumber === resolvedShootDay);
  if (!targetDay) {
    targetDay = {
      dayId: `day-${resolvedShootDay}`,
      projectId: req.projectId!,
      dayNumber: resolvedShootDay,
      date: new Date(Date.now() + (resolvedShootDay - 1) * 86400000).toISOString().split('T')[0],
      title: `Shoot Day ${resolvedShootDay}: ${resolvedLocationName}`,
      callTime: shootingTime || '06:00 AM',
      wrapTime: '06:00 PM',
      sceneIds: [newScene.sceneId],
      totalEstimatedCost: 28000,
      travelTimeMinutes: 30,
      notes: `Production schedule for Scene ${newScene.sceneNumber} at ${resolvedLocationName}`,
    };
    shootDaysStore[req.projectId!].push(targetDay);
    shootDaysStore[req.projectId!].sort((a, b) => a.dayNumber - b.dayNumber);
  } else {
    if (!targetDay.sceneIds.includes(newScene.sceneId)) {
      targetDay.sceneIds.push(newScene.sceneId);
    }
  }

  // Register location in locationsStore if not already present
  if (!matchedLoc && req.body.locationName) {
    const newLoc: LocationItem = {
      locationId: newScene.locationId,
      projectId: req.projectId!,
      name: resolvedLocationName,
      address: `${resolvedLocationName}, Dubai, United Arab Emirates`,
      latitude: 25.2048,
      longitude: 55.2708,
      category: 'Heritage',
      notes: newScene.productionConsiderations || newScene.description,
      sceneReferences: [newScene.sceneId],
      shootingDays: [resolvedShootDay],
      permitStatus: 'UNVERIFIED',
      estimatedCostRange: { low: 10000, expected: 15000, high: 22000, currency: 'AED' },
      weatherSummary: 'Clear skies, outdoor lighting dependent',
      lightingNotes: newScene.lightingDependency || 'Natural light and street lights',
      createdBy: req.user!.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    locationsStore[req.projectId!].push(newLoc);
  } else if (matchedLoc) {
    if (!matchedLoc.sceneReferences.includes(newScene.sceneId)) {
      matchedLoc.sceneReferences.push(newScene.sceneId);
    }
    if (!matchedLoc.shootingDays.includes(resolvedShootDay)) {
      matchedLoc.shootingDays.push(resolvedShootDay);
      matchedLoc.shootingDays.sort((a, b) => a - b);
    }
  }

  recordAuditLog({
    projectId: req.projectId!,
    userId: req.user!.uid,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'SCENE_CREATED',
    resourceType: 'SCENE',
    resourceId: newScene.sceneId,
    details: `Added Scene ${newScene.sceneNumber} for Shoot Day ${newScene.shootDay} at ${newScene.locationName}`,
  });

  res.status(201).json({
    success: true,
    scene: newScene,
    shootDays: shootDaysStore[req.projectId!],
    locations: locationsStore[req.projectId!],
  });
});

// PUT /api/projects/:projectId/scenes/:sceneId
projectRouter.put('/:projectId/scenes/:sceneId', requireAuth, requireProjectMember, (req, res) => {
  const { sceneId } = req.params;
  const list = scenesStore[req.projectId!] || [];
  const idx = list.findIndex((s) => s.sceneId === sceneId);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Scene not found' });
  }

  list[idx] = {
    ...list[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  recordAuditLog({
    projectId: req.projectId!,
    userId: req.user!.uid,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'SCENE_UPDATED',
    resourceType: 'SCENE',
    resourceId: sceneId,
    details: `Updated Scene ${list[idx].sceneNumber} details`,
  });

  res.json({ success: true, scene: list[idx] });
});

// GET /api/projects/:projectId/shoot-days
projectRouter.get('/:projectId/shoot-days', requireAuth, requireProjectMember, (req, res) => {
  const days = shootDaysStore[req.projectId!] || [];
  res.json({ success: true, shootDays: days });
});
