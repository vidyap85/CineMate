/**
 * Astronomical Solar Calculations for CineGemini
 * Computes exact Sunrise, Sunset, Dawn (Civil twilight), Dusk,
 * Golden Hour (morning/evening), and Blue Hour (morning/evening)
 * using standard solar position equations.
 */

export interface SolarTimesResult {
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

function toJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function calculateSolarTimes(lat: number, lng: number, dateInput: Date | string = new Date()): SolarTimesResult {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const dateStr = d.toISOString().split('T')[0];
  
  // Julian Day
  const julianDay = toJulianDate(d);
  const n = julianDay - 2451545.0 + 0.0008;

  // Mean solar noon
  const J_star = n - lng / 360;

  // Solar mean anomaly
  const M = (357.5291 + 0.98560028 * J_star) % 360;
  const M_rad = (M * Math.PI) / 180;

  // Equation of the center
  const C = 1.9148 * Math.sin(M_rad) + 0.02 * Math.sin(2 * M_rad) + 0.0003 * Math.sin(3 * M_rad);

  // Ecliptic longitude
  const lambda = (M + C + 180 + 102.9372) % 360;
  const lambda_rad = (lambda * Math.PI) / 180;

  // Solar transit (solar noon)
  const J_transit = 2451545.0 + J_star + 0.0053 * Math.sin(M_rad) - 0.0069 * Math.sin(2 * lambda_rad);

  // Sun declination
  const delta = Math.asin(Math.sin(lambda_rad) * Math.sin((23.44 * Math.PI) / 180));
  const lat_rad = (lat * Math.PI) / 180;

  function getTimeForElevation(elevationDeg: number, isMorning: boolean): Date {
    const elev_rad = (elevationDeg * Math.PI) / 180;
    const cos_omega =
      (Math.sin(elev_rad) - Math.sin(lat_rad) * Math.sin(delta)) /
      (Math.cos(lat_rad) * Math.cos(delta));

    // Clamp for polar regions
    const clamped_cos = Math.max(-1, Math.min(1, cos_omega));
    const omega = Math.acos(clamped_cos) * (180 / Math.PI);
    
    const J_event = isMorning ? J_transit - omega / 360 : J_transit + omega / 360;
    const timeMs = (J_event - 2440587.5) * 86400000;
    return new Date(timeMs);
  }

  // Elevations:
  // Sunrise/Sunset: -0.833 deg
  // Civil Dawn/Dusk: -6.0 deg
  // Blue Hour: -6.0 deg to -4.0 deg
  // Golden Hour: -4.0 deg to +6.0 deg
  const dawnDate = getTimeForElevation(-6.0, true);
  const sunriseDate = getTimeForElevation(-0.833, true);
  const sunsetDate = getTimeForElevation(-0.833, false);
  const duskDate = getTimeForElevation(-6.0, false);
  const solarNoonDate = new Date((J_transit - 2440587.5) * 86400000);

  // Golden Hour morning (-4 deg to +6 deg)
  const mGoldenStart = getTimeForElevation(-4.0, true);
  const mGoldenEnd = getTimeForElevation(6.0, true);

  // Blue Hour morning (-6 deg to -4 deg)
  const mBlueStart = getTimeForElevation(-6.0, true);
  const mBlueEnd = getTimeForElevation(-4.0, true);

  // Golden Hour evening (+6 deg to -4 deg)
  const eGoldenStart = getTimeForElevation(6.0, false);
  const eGoldenEnd = getTimeForElevation(-4.0, false);

  // Blue Hour evening (-4 deg to -6 deg)
  const eBlueStart = getTimeForElevation(-4.0, false);
  const eBlueEnd = getTimeForElevation(-6.0, false);

  return {
    date: dateStr,
    dawn: formatTime(dawnDate),
    sunrise: formatTime(sunriseDate),
    morningGoldenHourStart: formatTime(mGoldenStart),
    morningGoldenHourEnd: formatTime(mGoldenEnd),
    morningBlueHourStart: formatTime(mBlueStart),
    morningBlueHourEnd: formatTime(mBlueEnd),
    solarNoon: formatTime(solarNoonDate),
    eveningGoldenHourStart: formatTime(eGoldenStart),
    eveningGoldenHourEnd: formatTime(eGoldenEnd),
    sunset: formatTime(sunsetDate),
    eveningBlueHourStart: formatTime(eBlueStart),
    eveningBlueHourEnd: formatTime(eBlueEnd),
    dusk: formatTime(duskDate),
  };
}
