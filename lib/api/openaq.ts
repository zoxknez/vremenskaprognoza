import { AirQualityData, AirQualitySource } from '@/lib/types/air-quality';
import { calculateAQI } from '@/lib/types/air-quality';

const OPENAQ_API_BASE = 'https://api.openaq.org/v2';

export async function fetchOpenAQData(country: string = 'RS'): Promise<AirQualityData[]> {
  try {
    // Try new OpenAQ API v3 endpoint first
    const response = await fetch(
      `https://api.openaq.org/v3/locations?limit=100&countries_id=${country}&order_by=lastUpdated&sort=desc`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      // If v3 fails, try v2
      const responseV2 = await fetch(
        `${OPENAQ_API_BASE}/latest?limit=100&country=${country}&order_by=lastUpdated&sort=desc`,
        {
          next: { revalidate: 300 },
        }
      );

      if (!responseV2.ok) {
        // If both fail, return empty array silently
        return [];
      }

      const data = await responseV2.json();
      return processOpenAQData(data);
    }

    const data = await response.json();
    return processOpenAQData(data);
  } catch (error) {
    console.error('Error fetching OpenAQ data:', error);
    return [];
  }
}

function processOpenAQData(data: any): AirQualityData[] {
  // Handle both v2 and v3 API formats
  const results = data.results || data.data || [];
  
  return results
    .filter((result: any) => {
      // Validate that coordinates exist and are valid
      const coords = result.coordinates || result.geometry?.coordinates;
      if (!coords || !Array.isArray(coords) || coords.length < 2) {
        return false;
      }
      const lon = coords[0] || coords[1]; // v2 uses [lon, lat], v3 might be different
      const lat = coords[1] || coords[0];
      return typeof lon === 'number' && typeof lat === 'number' && !isNaN(lon) && !isNaN(lat);
    })
    .map((result: any) => {
      const parameters: Record<string, number> = {};
      
      const measurements = result.measurements || result.parameters || [];
      measurements.forEach((measurement: any) => {
        const param = (measurement.parameter || measurement.name || '').toLowerCase();
        const value = measurement.value || measurement.lastValue;
        if (['pm25', 'pm10', 'no2', 'so2', 'o3', 'co'].includes(param) && typeof value === 'number') {
          parameters[param] = value;
        }
      });

      const coords = result.coordinates || result.geometry?.coordinates;
      const lon = coords[0] || coords[1];
      const lat = coords[1] || coords[0];

      const { aqi, category } = calculateAQI(
        parameters.pm25,
        parameters.pm10,
        parameters.no2,
        parameters.o3
      );

      return {
        id: `openaq-${result.id || result.locationId || Math.random()}`,
        location: {
          name: result.name || result.location || 'Unknown',
          coordinates: [Number(lon), Number(lat)],
          city: result.city || result.locality || 'Unknown',
          region: result.country || result.countryId || 'Unknown',
        },
        parameters: {
          pm25: parameters.pm25,
          pm10: parameters.pm10,
          no2: parameters.no2,
          so2: parameters.so2,
          o3: parameters.o3,
          co: parameters.co,
        },
        aqi,
        aqiCategory: category,
        source: 'openaq' as AirQualitySource,
        timestamp: result.lastUpdated || result.datetime || new Date().toISOString(),
        lastUpdated: result.lastUpdated || result.datetime,
      };
    });
}

