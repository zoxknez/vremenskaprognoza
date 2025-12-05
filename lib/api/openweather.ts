import { AirQualityData, AirQualitySource } from '@/lib/types/air-quality';
import { calculateAQI } from '@/lib/types/air-quality';

// OpenWeatherMap Air Pollution API
// Free tier: 1000 calls/day
const OPENWEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

// Serbian cities coordinates
const SERBIAN_CITIES = [
  { name: 'Beograd', lat: 44.7872, lon: 20.4573 },
  { name: 'Novi Sad', lat: 45.2671, lon: 19.8335 },
  { name: 'Niš', lat: 43.3209, lon: 21.8957 },
  { name: 'Kragujevac', lat: 44.0128, lon: 20.9164 },
  { name: 'Subotica', lat: 46.1000, lon: 19.6667 },
  { name: 'Zrenjanin', lat: 45.3776, lon: 20.3865 },
  { name: 'Pančevo', lat: 44.8738, lon: 20.6517 },
];

export async function fetchOpenWeatherData(): Promise<AirQualityData[]> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    const results: AirQualityData[] = [];

    for (const city of SERBIAN_CITIES) {
      try {
        const response = await fetch(
          `${OPENWEATHER_API_BASE}/air_pollution?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}`,
          {
            next: { revalidate: 600 }, // Cache for 10 minutes
            signal: AbortSignal.timeout(5000),
          }
        );

        if (!response.ok) continue;

        const data = await response.json();
        
        if (data.list && data.list.length > 0) {
          const airData = data.list[0];
          const components = airData.components || {};
          
          const parameters = {
            pm25: components.pm2_5,
            pm10: components.pm10,
            no2: components.no2,
            so2: components.so2,
            o3: components.o3,
            co: components.co ? components.co / 1000 : undefined, // Convert from μg/m³ to mg/m³
          };

          const { aqi, category } = calculateAQI(
            parameters.pm25,
            parameters.pm10,
            parameters.no2,
            parameters.o3
          );

          results.push({
            id: `openweather-${city.name}`,
            location: {
              name: city.name,
              coordinates: [city.lon, city.lat],
              city: city.name,
              region: 'Serbia',
            },
            parameters,
            aqi,
            aqiCategory: category,
            source: 'openweather' as AirQualitySource,
            timestamp: new Date(airData.dt * 1000).toISOString(),
            lastUpdated: new Date(airData.dt * 1000).toISOString(),
          });
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

