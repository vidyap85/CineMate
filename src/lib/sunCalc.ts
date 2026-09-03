import type { SolarTimes } from '../types';

export function calculateClientSolarTimes(lat: number, lng: number, dateInput: Date | string = new Date()): SolarTimes {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const dateStr = d.toISOString().split('T')[0];
  
  const julianDay = d.getTime() / 86400000 + 2440587.5;
  const n = julianDay - 2451545.0 + 0.0008;
  const J_star = n - lng / 360;
  const M = (357.5291 + 0.98560028 * J_star) % 360;
  const M_rad = (M * Math.PI) / 180;
  const C = 1.9148 * Math.sin(M_rad) + 0.02 * Math.sin(2 * M_rad) + 0.0003 * Math.sin(3 * M_rad);
  const lambda = (M + C + 180 + 102.9372) % 360;
  const lambda_rad = (lambda * Math.PI) / 180;
  const J_transit = 2451545.0 + J_star + 0.0053 * Math.sin(M_rad) - 0.0069 * Math.sin(2 * lambda_rad);
  const delta = Math.asin(Math.sin(lambda_rad) * Math.sin((23.44 * Math.PI) / 180));
  const lat_rad = (lat * Math.PI) / 180;

  function getTimeForElevation(elevationDeg: number, isMorning: boolean): Date {
    const elev_rad = (elevationDeg * Math.PI) / 180;
    const cos_omega =
      (Math.sin(elev_rad) - Math.sin(lat_rad) * Math.sin(delta)) /
      (Math.cos(lat_rad) * Math.cos(delta));
    const clamped_cos = Math.max(-1, Math.min(1, cos_omega));
    const omega = Math.acos(clamped_cos) * (180 / Math.PI);
    const J_event = isMorning ? J_transit - omega / 360 : J_transit + omega / 360;
    const timeMs = (J_event - 2440587.5) * 86400000;
    return new Date(timeMs);
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  return {
    date: dateStr,
    dawn: formatTime(getTimeForElevation(-6.0, true)),
    sunrise: formatTime(getTimeForElevation(-0.833, true)),
    morningGoldenHourStart: formatTime(getTimeForElevation(-4.0, true)),
    morningGoldenHourEnd: formatTime(getTimeForElevation(6.0, true)),
    morningBlueHourStart: formatTime(getTimeForElevation(-6.0, true)),
    morningBlueHourEnd: formatTime(getTimeForElevation(-4.0, true)),
    solarNoon: formatTime(new Date((J_transit - 2440587.5) * 86400000)),
    eveningGoldenHourStart: formatTime(getTimeForElevation(6.0, false)),
    eveningGoldenHourEnd: formatTime(getTimeForElevation(-4.0, false)),
    sunset: formatTime(getTimeForElevation(-0.833, false)),
    eveningBlueHourStart: formatTime(getTimeForElevation(-4.0, false)),
    eveningBlueHourEnd: formatTime(getTimeForElevation(-6.0, false)),
    dusk: formatTime(getTimeForElevation(-6.0, false)),
  };
}
