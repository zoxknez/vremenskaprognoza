import { AirQualityData, AirQualitySource } from '@/lib/types/air-quality';
import { calculateAQI } from '@/lib/types/air-quality';

// AirVisual (IQAir) API
// Free tier: 500 requests/month
const AIRVISUAL_API_BASE = 'https://api.airvisual.com/v2';

export async function fetchAirVisualData(): Promise<AirQualityData[]> {
  const apiKey = process.env.AIRVISUAL_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    // Serbian cities
    const cities = [
      { name: 'Belgrade', state: 'Central Serbia', country: 'Serbia' },
      { name: 'Novi Sad', state: 'Vojvodina', country: 'Serbia' },
    ];

    const results: AirQualityData[] = [];

    for (const city of cities) {
      try {
        const response = await fetch(
          `${AIRVISUAL_API_BASE}/city?city=${encodeURIComponent(city.name)}&state=${encodeURIComponent(city.state)}&country=${encodeURIComponent(city.country)}&key=${apiKey}`,
          {
            next: { revalidate: 600 },
            signal: AbortSignal.timeout(5000),
          }
        );

        if (!response.ok) continue;

        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
          const station = data.data;
          const current = station.current;
          const pollution = current?.pollution || {};
          const location = station.location || {};

          const parameters = {
            pm25: pollution.aqius ? pollution.aqius * 0.5 : undefined, // Approximate conversion
            pm10: pollution.aqius ? pollution.aqius * 0.7 : undefined,
          };

          const { aqi, category } = calculateAQI(parameters.pm25, parameters.pm10);

          if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
            results.push({
              id: `airvisual-${city.name}`,
              location: {
                name: location.city || city.name,
                coordinates: [location.coordinates[0], location.coordinates[1]],
                city: location.city || city.name,
                region: location.state || city.state,
              },
              parameters,
              aqi,
              aqiCategory: category,
              source: 'airvisual' as AirQualitySource,
              timestamp: current?.ts || new Date().toISOString(),
              lastUpdated: current?.ts,
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

