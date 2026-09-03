import { Router } from 'express';
import { requireAuth, requireProjectMember } from '../middleware/auth.js';
import { getWeatherDataForCoordinates } from '../weather.js';
import { calculateSolarTimes } from '../solarCalc.js';
import { recordAuditLog } from '../observability.js';

export const weatherRouter = Router();

// GET /api/projects/:projectId/weather?lat=25.0778&lng=55.1396&name=DubaiMarina
weatherRouter.get('/:projectId/weather', requireAuth, requireProjectMember, async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 25.0778;
    const lng = parseFloat(req.query.lng as string) || 55.1396;
    const name = (req.query.name as string) || 'Filming Location';
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const weather = await getWeatherDataForCoordinates(lat, lng, name, date);

    res.json({
      success: true,
      weather,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to retrieve weather data', details: msg });
  }
});

// GET /api/projects/:projectId/solar-times?lat=25.0778&lng=55.1396
weatherRouter.get('/:projectId/solar-times', requireAuth, requireProjectMember, (req, res) => {
  const lat = parseFloat(req.query.lat as string) || 25.0778;
  const lng = parseFloat(req.query.lng as string) || 55.1396;
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

  const solarTimes = calculateSolarTimes(lat, lng, date);
  res.json({ success: true, solarTimes });
});
