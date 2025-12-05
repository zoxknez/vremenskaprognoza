import { AirQualityData, AirQualitySource } from '@/lib/types/air-quality';
import { calculateAQI } from '@/lib/types/air-quality';

// WAQI (World Air Quality Index) API
// Free tier: 1000 requests/day
const WAQI_API_BASE = 'https://api.waqi.info';

export async function fetchWAQIData(city: string = 'Belgrade'): Promise<AirQualityData[]> {
  try {
    // Try multiple Serbian cities
    const cities = ['Belgrade', 'Novi Sad', 'Nis', 'Kragujevac', 'Subotica'];
    const results: AirQualityData[] = [];

    for (const cityName of cities) {
      try {
        const response = await fetch(
          `${WAQI_API_BASE}/feed/${cityName}/?token=${process.env.WAQI_API_TOKEN || 'demo'}`,
          {
            next: { revalidate: 600 }, // Cache for 10 minutes
            signal: AbortSignal.timeout(5000),
          }
        );

        if (!response.ok) continue;

        const data = await response.json();
        
        if (data.status === 'ok' && data.data) {
          const station = data.data;
          const iaqi = station.iaqi || {};
          
          const parameters: Record<string, number> = {};
          if (iaqi.pm25?.v) parameters.pm25 = iaqi.pm25.v;
          if (iaqi.pm10?.v) parameters.pm10 = iaqi.pm10.v;
          if (iaqi.no2?.v) parameters.no2 = iaqi.no2.v;
          if (iaqi.so2?.v) parameters.so2 = iaqi.so2.v;
          if (iaqi.o3?.v) parameters.o3 = iaqi.o3.v;
          if (iaqi.co?.v) parameters.co = iaqi.co.v;

          const aqi = station.aqi || calculateAQI(parameters.pm25, parameters.pm10, parameters.no2, parameters.o3).aqi;
          const { category } = calculateAQI(parameters.pm25, parameters.pm10, parameters.no2, parameters.o3);

          if (station.city?.geo && Array.isArray(station.city.geo) && station.city.geo.length >= 2) {
            results.push({
              id: `waqi-${station.idx || cityName}`,
              location: {
                name: station.city?.name || cityName,
                coordinates: [station.city.geo[1], station.city.geo[0]], // [lon, lat]
                city: station.city?.name || cityName,
                region: 'Serbia',
              },
              parameters: {
                pm25: parameters.pm25,
                pm10: parameters.pm10,
                no2: parameters.no2,
                so2: parameters.so2,
                o3: parameters.o3,
                co: parameters.co,
              },
              aqi: typeof aqi === 'number' ? aqi : calculateAQI(parameters.pm25, parameters.pm10).aqi,
              aqiCategory: category,
              source: 'waqi' as AirQualitySource,
              timestamp: station.time?.iso || new Date().toISOString(),
              lastUpdated: station.time?.iso,
            });
          }
        }
      } catch (error) {
        // Continue to next city
        continue;
      }
    }

    return results;
  } catch (error) {
    return [];
  }
}

