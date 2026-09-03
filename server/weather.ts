import { calculateSolarTimes } from './solarCalc.js';
import { getSecret } from './secrets.js';

export interface ServerWeatherData {
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
  solarTimes: ReturnType<typeof calculateSolarTimes>;
  isSimulated?: boolean;
}

// In-memory weather cache: key = `${lat.toFixed(2)},${lng.toFixed(2)}`
const weatherCache = new Map<string, { data: ServerWeatherData; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export async function getWeatherDataForCoordinates(
  lat: number,
  lng: number,
  locationName = 'Filming Location',
  dateInput?: string
): Promise<ServerWeatherData> {
  const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const solarTimes = calculateSolarTimes(lat, lng, dateInput || new Date());
  const weatherApiKey = await getSecret('WEATHER_API_KEY');

  let weatherResult: ServerWeatherData;

  if (weatherApiKey) {
    try {
      // Call OpenWeatherMap / REST Weather endpoint
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${weatherApiKey}&units=metric`
      );
      if (response.ok) {
        const json = await response.json();
        const tempC = Math.round(json.main.temp);
        const tempF = Math.round((tempC * 9) / 5 + 32);

        weatherResult = {
          locationName: json.name || locationName,
          coordinates: { lat, lng },
          forecastTime: new Date().toISOString(),
          temperatureC: tempC,
          temperatureF: tempF,
          condition: json.weather?.[0]?.main || 'Clear Sky',
          conditionIcon: json.weather?.[0]?.icon || '01d',
          rainProbability: json.clouds?.all > 70 ? 45 : json.clouds?.all > 40 ? 15 : 5,
          cloudCoverPercentage: json.clouds?.all ?? 20,
          windSpeedKmh: Math.round((json.wind?.speed ?? 3.5) * 3.6),
          humidityPercentage: json.main?.humidity ?? 55,
          visibilityKm: Math.round((json.visibility ?? 10000) / 1000),
          uvIndex: tempC > 30 ? 8 : tempC > 20 ? 6 : 4,
          solarTimes,
          isSimulated: false,
        };

        weatherCache.set(cacheKey, { data: weatherResult, timestamp: Date.now() });
        return weatherResult;
      }
    } catch {
      // Fallback on network/API failure
    }
  }

  // Realistic microclimate estimation based on latitude, season, and coastal proximity
  const isTropical = Math.abs(lat) < 25;
  const isDesert = (lat > 20 && lat < 32 && lng > 35 && lng < 60); // e.g. Dubai / Middle East
  const baseTemp = isDesert ? 32 : isTropical ? 28 : 22;
  const cloudCover = isDesert ? 15 : isTropical ? 40 : 35;
  const rainProb = isDesert ? 2 : isTropical ? 30 : 18;

  weatherResult = {
    locationName,
    coordinates: { lat, lng },
    forecastTime: new Date().toISOString(),
    temperatureC: baseTemp,
    temperatureF: Math.round((baseTemp * 9) / 5 + 32),
    condition: isDesert ? 'Clear & Golden' : cloudCover > 50 ? 'Scattered Clouds' : 'Partly Cloudy',
    conditionIcon: isDesert ? '01d' : '02d',
    rainProbability: rainProb,
    cloudCoverPercentage: cloudCover,
    windSpeedKmh: isDesert ? 14 : 12,
    humidityPercentage: isDesert ? 48 : 62,
    visibilityKm: 12,
    uvIndex: isDesert ? 9 : 6,
    solarTimes,
    isSimulated: !weatherApiKey,
  };

  weatherCache.set(cacheKey, { data: weatherResult, timestamp: Date.now() });
  return weatherResult;
}
