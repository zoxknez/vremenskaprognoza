import { AirQualityData, AirQualitySource } from '@/lib/types/air-quality';
import { calculateAQI } from '@/lib/types/air-quality';
import { BALKAN_COUNTRIES, getAllBalkanCities, BalkanCountryCode } from './balkan-countries';

const OPENAQ_API_V3 = 'https://api.openaq.org/v3';
const OPENAQ_API_V2 = 'https://api.openaq.org/v2';

// Mapiranje ISO kodova za OpenAQ
const OPENAQ_COUNTRY_CODES: Record<BalkanCountryCode, string> = {
  RS: 'RS',
  HR: 'HR',
  BA: 'BA',
  ME: 'ME',
  MK: 'MK',
  SI: 'SI',
  AL: 'AL',
  XK: 'XK',
  BG: 'BG',
  RO: 'RO',
  GR: 'GR',
};

export async function fetchOpenAQBalkanData(): Promise<AirQualityData[]> {
  const allData: AirQualityData[] = [];
  
  // Fetch data for each Balkan country
  const fetchPromises = Object.keys(BALKAN_COUNTRIES).map(async (countryCode) => {
    try {
      const openaqCode = OPENAQ_COUNTRY_CODES[countryCode as BalkanCountryCode];
      
      // Try V3 API first
      let response = await fetch(
        `${OPENAQ_API_V3}/locations?limit=100&countries_id=${openaqCode}&order_by=lastUpdated&sort=desc`,
        {
          next: { revalidate: 300 },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        // Fallback to V2
        response = await fetch(
          `${OPENAQ_API_V2}/latest?limit=100&country=${openaqCode}&order_by=lastUpdated&sort=desc`,
          {
            next: { revalidate: 300 },
            signal: AbortSignal.timeout(10000),
          }
        );
      }

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return processOpenAQData(data, countryCode as BalkanCountryCode);
    } catch (error) {
      console.error(`Error fetching OpenAQ data for ${countryCode}:`, error);
      return [];
    }
  });

  const results = await Promise.allSettled(fetchPromises);
  
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allData.push(...result.value);
    }
  }

  return allData;
}

function processOpenAQData(data: any, countryCode: BalkanCountryCode): AirQualityData[] {
  const results = data.results || data.data || [];
  const country = BALKAN_COUNTRIES[countryCode];
  
  return results
    .filter((result: any) => {
      const coords = result.coordinates || result.geometry?.coordinates;
      if (!coords || !Array.isArray(coords) || coords.length < 2) {
        return false;
      }
      const lon = coords[0] || coords[1];
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
        id: `openaq-${countryCode}-${result.id || result.locationId || Math.random()}`,
        location: {
          name: result.name || result.location || 'Unknown',
          coordinates: [Number(lon), Number(lat)] as [number, number],
          city: result.city || result.locality || 'Unknown',
          region: country.name,
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

// Fetch data using bounding box for entire Balkans
export async function fetchOpenAQByBoundingBox(): Promise<AirQualityData[]> {
  try {
    const response = await fetch(
      `${OPENAQ_API_V2}/latest?limit=1000&coordinates=43.5,20.5&radius=500000&order_by=lastUpdated&sort=desc`,
      {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const results = data.results || [];
    
    return results
      .filter((result: any) => {
        const coords = result.coordinates;
        if (!coords) return false;
        
        // Filter to Balkan region
        return (
          coords.latitude >= 34.8 &&
          coords.latitude <= 48.3 &&
          coords.longitude >= 13.3 &&
          coords.longitude <= 29.7
        );
      })
      .map((result: any) => {
        const parameters: Record<string, number> = {};
        
        result.measurements?.forEach((measurement: any) => {
          const param = measurement.parameter?.toLowerCase();
          if (['pm25', 'pm10', 'no2', 'so2', 'o3', 'co'].includes(param)) {
            parameters[param] = measurement.value;
          }
        });

        const { aqi, category } = calculateAQI(
          parameters.pm25,
          parameters.pm10,
          parameters.no2,
          parameters.o3
        );

        return {
          id: `openaq-bbox-${result.location}`,
          location: {
            name: result.location,
            coordinates: [result.coordinates.longitude, result.coordinates.latitude] as [number, number],
            city: result.city || 'Unknown',
            region: result.country,
          },
          parameters,
          aqi,
          aqiCategory: category,
          source: 'openaq' as AirQualitySource,
          timestamp: result.measurements?.[0]?.lastUpdated || new Date().toISOString(),
        };
      });
  } catch (error) {
    console.error('Error fetching OpenAQ bbox data:', error);
    return [];
  }
}
