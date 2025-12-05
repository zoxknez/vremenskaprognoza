import { AirQualityData, AirQualitySource } from '@/lib/types/air-quality';
import { calculateAQI } from '@/lib/types/air-quality';
import { BALKAN_COUNTRIES, getAllBalkanCities, BalkanCountryCode } from './balkan-countries';

// OpenWeatherMap Air Pollution API
// Free tier: 1000 calls/day
const OPENWEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

export async function fetchOpenWeatherBalkanData(): Promise<AirQualityData[]> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return [];
  }

  const allCities = getAllBalkanCities();
  const results: AirQualityData[] = [];

  // Batch fetch - do 50 gradova odjednom da ne prekoračimo limit
  const batchSize = 50;
  const batches = [];
  
  for (let i = 0; i < allCities.length; i += batchSize) {
    batches.push(allCities.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const cityPromises = batch.map(async (city) => {
      try {
        const response = await fetch(
          `${OPENWEATHER_API_BASE}/air_pollution?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}`,
          {
            next: { revalidate: 600 },
            signal: AbortSignal.timeout(5000),
          }
        );

        if (!response.ok) return null;

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
            co: components.co ? components.co / 1000 : undefined,
          };

          const { aqi, category } = calculateAQI(
            parameters.pm25,
            parameters.pm10,
            parameters.no2,
            parameters.o3
          );

          return {
            id: `openweather-${city.countryCode}-${city.name}`,
            location: {
              name: city.name,
              coordinates: [city.lon, city.lat] as [number, number],
              city: city.name,
              region: city.country,
            },
            parameters,
            aqi,
            aqiCategory: category,
            source: 'openweather' as AirQualitySource,
            timestamp: new Date(airData.dt * 1000).toISOString(),
            lastUpdated: new Date(airData.dt * 1000).toISOString(),
          };
        }
        return null;
      } catch (error) {
        return null;
      }
    });

    const batchResults = await Promise.allSettled(cityPromises);
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
      }
    }

    // Pauza između batch-eva da ne prekoračimo rate limit
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

// Fetch sa prognozom - narednih 5 dana
export async function fetchOpenWeatherForecast(lat: number, lon: number): Promise<any[]> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    const response = await fetch(
      `${OPENWEATHER_API_BASE}/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`,
      {
        next: { revalidate: 3600 }, // Cache 1 sat
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.list || [];
  } catch (error) {
    console.error('Error fetching OpenWeather forecast:', error);
    return [];
  }
}

// Fetch istorijskih podataka
export async function fetchOpenWeatherHistory(
  lat: number,
  lon: number,
  start: number,
  end: number
): Promise<any[]> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    const response = await fetch(
      `${OPENWEATHER_API_BASE}/air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}&appid=${apiKey}`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.list || [];
  } catch (error) {
    console.error('Error fetching OpenWeather history:', error);
    return [];
  }
}
