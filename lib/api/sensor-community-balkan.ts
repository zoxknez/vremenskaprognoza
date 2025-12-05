import { AirQualityData, AirQualitySource } from '@/lib/types/air-quality';
import { calculateAQI } from '@/lib/types/air-quality';
import { BALKAN_COUNTRIES, BalkanCountryCode } from './balkan-countries';

// Sensor Community API - funkcioniše za ceo Balkan
const SENSOR_COMMUNITY_API = 'https://data.sensor.community/airrohr/v1/filter';

// Bounding box za ceo Balkan
const BALKAN_BBOX = {
  latMin: 34.8,
  latMax: 48.3,
  lonMin: 13.3,
  lonMax: 29.7,
};

export async function fetchSensorCommunityBalkanData(): Promise<AirQualityData[]> {
  const allData: AirQualityData[] = [];

  // Fetch za svaku zemlju
  const countryPromises = Object.keys(BALKAN_COUNTRIES).map(async (countryCode) => {
    try {
      let response = await fetch(
        `${SENSOR_COMMUNITY_API}/country=${countryCode}`,
        {
          next: { revalidate: 300 },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        // Alternativni način - po tipu senzora
        response = await fetch(
          `${SENSOR_COMMUNITY_API}/type=SDS011`,
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
      return processSensorData(data, countryCode as BalkanCountryCode);
    } catch (error) {
      return [];
    }
  });

  const results = await Promise.allSettled(countryPromises);
  
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allData.push(...result.value);
    }
  }

  // Ako nema podataka po zemljama, probaj globalni fetch sa filterom
  if (allData.length === 0) {
    try {
      const globalData = await fetchGlobalSensorData();
      allData.push(...globalData);
    } catch (error) {
      console.error('Error fetching global sensor data:', error);
    }
  }

  return allData;
}

async function fetchGlobalSensorData(): Promise<AirQualityData[]> {
  try {
    // Koristi statički JSON sa svim podacima
    const response = await fetch(
      'https://data.sensor.community/static/v2/data.json',
      {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(30000), // Duži timeout jer je veliki fajl
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    
    // Filtriraj samo balkanske zemlje
    return data
      .filter((sensor: any) => {
        const lat = parseFloat(sensor.location?.latitude);
        const lon = parseFloat(sensor.location?.longitude);
        
        return (
          !isNaN(lat) &&
          !isNaN(lon) &&
          lat >= BALKAN_BBOX.latMin &&
          lat <= BALKAN_BBOX.latMax &&
          lon >= BALKAN_BBOX.lonMin &&
          lon <= BALKAN_BBOX.lonMax
        );
      })
      .map((sensor: any) => {
        const lat = parseFloat(sensor.location.latitude);
        const lon = parseFloat(sensor.location.longitude);
        
        const parameters: Record<string, number> = {};
        
        sensor.sensordatavalues?.forEach((value: any) => {
          const param = value.value_type?.toLowerCase();
          if (param === 'p1') parameters.pm10 = parseFloat(value.value);
          if (param === 'p2') parameters.pm25 = parseFloat(value.value);
          if (param === 'temperature') parameters.temperature = parseFloat(value.value);
          if (param === 'humidity') parameters.humidity = parseFloat(value.value);
        });

        const { aqi, category } = calculateAQI(parameters.pm25, parameters.pm10);

        // Odredi zemlju po koordinatama
        const country = getCountryByCoords(lat, lon);

        return {
          id: `sensor-community-${sensor.id || sensor.sensor?.id || Math.random()}`,
          location: {
            name: `Sensor ${sensor.sensor?.id || 'Unknown'}`,
            coordinates: [lon, lat] as [number, number],
            city: sensor.location?.city || country?.name || 'Unknown',
            region: country?.name || 'Balkan',
          },
          parameters: {
            pm25: parameters.pm25,
            pm10: parameters.pm10,
          },
          aqi,
          aqiCategory: category,
          source: 'sensor-community' as AirQualitySource,
          timestamp: sensor.timestamp || new Date().toISOString(),
        };
      });
  } catch (error) {
    console.error('Error fetching global sensor data:', error);
    return [];
  }
}

function processSensorData(data: any[], countryCode: BalkanCountryCode): AirQualityData[] {
  const country = BALKAN_COUNTRIES[countryCode];
  
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter((sensor: any) => {
      const lat = parseFloat(sensor.location?.latitude);
      const lon = parseFloat(sensor.location?.longitude);
      
      if (isNaN(lat) || isNaN(lon)) return false;
      
      // Proveri da li je unutar bbox zemlje
      return (
        lat >= country.bbox.latMin &&
        lat <= country.bbox.latMax &&
        lon >= country.bbox.lonMin &&
        lon <= country.bbox.lonMax
      );
    })
    .map((sensor: any) => {
      const lat = parseFloat(sensor.location.latitude);
      const lon = parseFloat(sensor.location.longitude);
      
      const parameters: Record<string, number> = {};
      
      sensor.sensordatavalues?.forEach((value: any) => {
        const param = value.value_type?.toLowerCase();
        if (param === 'p1') parameters.pm10 = parseFloat(value.value);
        if (param === 'p2') parameters.pm25 = parseFloat(value.value);
      });

      const { aqi, category } = calculateAQI(parameters.pm25, parameters.pm10);

      return {
        id: `sensor-${countryCode}-${sensor.id || sensor.sensor?.id}`,
        location: {
          name: `Sensor ${sensor.sensor?.id || 'Unknown'}`,
          coordinates: [lon, lat] as [number, number],
          city: sensor.location?.city || findNearestCity(lat, lon, country.cities)?.name || 'Unknown',
          region: country.name,
        },
        parameters: {
          pm25: parameters.pm25,
          pm10: parameters.pm10,
        },
        aqi,
        aqiCategory: category,
        source: 'sensor-community' as AirQualitySource,
        timestamp: sensor.timestamp || new Date().toISOString(),
      };
    });
}

// Helper funkcije
function getCountryByCoords(lat: number, lon: number) {
  for (const country of Object.values(BALKAN_COUNTRIES)) {
    if (
      lat >= country.bbox.latMin &&
      lat <= country.bbox.latMax &&
      lon >= country.bbox.lonMin &&
      lon <= country.bbox.lonMax
    ) {
      return country;
    }
  }
  return null;
}

function findNearestCity(lat: number, lon: number, cities: readonly { readonly name: string; readonly lat: number; readonly lon: number }[]) {
  let nearest: { readonly name: string; readonly lat: number; readonly lon: number } | null = null;
  let minDistance = Infinity;

  for (const city of cities) {
    const distance = Math.sqrt(
      Math.pow(lat - city.lat, 2) + Math.pow(lon - city.lon, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = city;
    }
  }

  return nearest;
}
