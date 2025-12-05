import { AirQualityData, AirQualitySource } from '@/lib/types/air-quality';
import { calculateAQI } from '@/lib/types/air-quality';

// Klimerko - Vazduh građanima
// API: https://vazduhgradjanima.rs ili https://klimerko.org
// Ovo su građanski senzori

const KLIMERKO_API_ENDPOINTS = [
  'https://api.vazduhgradjanima.rs/v1/devices',
  'https://klimerko.org/api/v1/measurements',
  'https://vazduhgradjanima.rs/api/data',
];

// Poznate Klimerko lokacije u Srbiji
const KLIMERKO_KNOWN_LOCATIONS = [
  { id: 'klimerko-bg-vracar', name: 'Beograd - Vračar', city: 'Beograd', lat: 44.7936, lon: 20.4747 },
  { id: 'klimerko-bg-vozdovac', name: 'Beograd - Voždovac', city: 'Beograd', lat: 44.7667, lon: 20.4833 },
  { id: 'klimerko-bg-cukarica', name: 'Beograd - Čukarica', city: 'Beograd', lat: 44.7833, lon: 20.4167 },
  { id: 'klimerko-ns-centar', name: 'Novi Sad - Centar', city: 'Novi Sad', lat: 45.2551, lon: 19.8451 },
  { id: 'klimerko-nis', name: 'Niš', city: 'Niš', lat: 43.3209, lon: 21.8954 },
  { id: 'klimerko-kragujevac', name: 'Kragujevac', city: 'Kragujevac', lat: 44.0128, lon: 20.9164 },
  { id: 'klimerko-subotica', name: 'Subotica', city: 'Subotica', lat: 46.1000, lon: 19.6667 },
  { id: 'klimerko-pancevo', name: 'Pančevo', city: 'Pančevo', lat: 44.8738, lon: 20.6517 },
];

export async function fetchKlimerkoData(): Promise<AirQualityData[]> {
  const results: AirQualityData[] = [];

  // Pokušaj sa različitim API endpoint-ima
  for (const endpoint of KLIMERKO_API_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(10000),
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const processedData = processKlimerkoData(data);
        if (processedData.length > 0) {
          return processedData;
        }
      }
    } catch (error) {
      console.log(`Klimerko endpoint ${endpoint} failed, trying next...`);
      continue;
    }
  }

  // Fallback: Pokušaj sa Sensor Community podacima za Srbiju
  // jer mnogi Klimerko senzori su na Sensor Community platformi
  try {
    const sensorCommunityData = await fetchSensorCommunityFallback();
    if (sensorCommunityData.length > 0) {
      return sensorCommunityData;
    }
  } catch (error) {
    console.error('Sensor Community fallback failed:', error);
  }

  return results;
}

function processKlimerkoData(data: any): AirQualityData[] {
  // Handle different API response formats
  let devices: any[] = [];

  if (Array.isArray(data)) {
    devices = data;
  } else if (data.devices) {
    devices = data.devices;
  } else if (data.data) {
    devices = data.data;
  } else if (data.measurements) {
    devices = data.measurements;
  }

  return devices
    .filter((device: any) => {
      // Proveri da li ima validne koordinate
      const lat = device.latitude || device.lat || device.location?.latitude;
      const lon = device.longitude || device.lon || device.location?.longitude;
      return lat && lon && !isNaN(lat) && !isNaN(lon);
    })
    .map((device: any) => {
      const lat = device.latitude || device.lat || device.location?.latitude;
      const lon = device.longitude || device.lon || device.location?.longitude;

      const parameters: Record<string, number> = {};

      // Handle different field naming conventions
      if (device.pm25 !== undefined) parameters.pm25 = device.pm25;
      if (device.pm2_5 !== undefined) parameters.pm25 = device.pm2_5;
      if (device.PM25 !== undefined) parameters.pm25 = device.PM25;
      if (device.pm10 !== undefined) parameters.pm10 = device.pm10;
      if (device.PM10 !== undefined) parameters.pm10 = device.PM10;
      if (device.temperature !== undefined) parameters.temperature = device.temperature;
      if (device.humidity !== undefined) parameters.humidity = device.humidity;

      // Handle nested sensors data
      if (device.sensors) {
        device.sensors.forEach((sensor: any) => {
          if (sensor.type === 'pm25' || sensor.name?.includes('PM2.5')) {
            parameters.pm25 = sensor.value || sensor.lastValue;
          }
          if (sensor.type === 'pm10' || sensor.name?.includes('PM10')) {
            parameters.pm10 = sensor.value || sensor.lastValue;
          }
        });
      }

      const { aqi, category } = calculateAQI(parameters.pm25, parameters.pm10);

      // Pronađi najbliži poznati grad
      const nearestLocation = findNearestKlimerkoLocation(lat, lon);

      return {
        id: `klimerko-${device.id || device.device_id || Math.random().toString(36).substr(2, 9)}`,
        location: {
          name: device.name || nearestLocation?.name || `Klimerko ${device.id}`,
          coordinates: [lon, lat] as [number, number],
          city: device.city || nearestLocation?.city || 'Srbija',
          region: 'Srbija',
        },
        parameters: {
          pm25: parameters.pm25,
          pm10: parameters.pm10,
        },
        aqi,
        aqiCategory: category,
        source: 'klimerko' as AirQualitySource,
        timestamp: device.timestamp || device.lastUpdate || new Date().toISOString(),
      };
    });
}

async function fetchSensorCommunityFallback(): Promise<AirQualityData[]> {
  try {
    const response = await fetch(
      'https://data.sensor.community/airrohr/v1/filter/country=RS',
      {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter((sensor: any) => {
        const lat = parseFloat(sensor.location?.latitude);
        const lon = parseFloat(sensor.location?.longitude);
        return !isNaN(lat) && !isNaN(lon);
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
        const nearestLocation = findNearestKlimerkoLocation(lat, lon);

        return {
          id: `klimerko-sc-${sensor.sensor?.id || Math.random()}`,
          location: {
            name: nearestLocation?.name || `Senzor ${sensor.sensor?.id}`,
            coordinates: [lon, lat] as [number, number],
            city: nearestLocation?.city || 'Srbija',
            region: 'Srbija',
          },
          parameters: {
            pm25: parameters.pm25,
            pm10: parameters.pm10,
          },
          aqi,
          aqiCategory: category,
          source: 'klimerko' as AirQualitySource,
          timestamp: sensor.timestamp || new Date().toISOString(),
        };
      });
  } catch (error) {
    console.error('Sensor Community fallback error:', error);
    return [];
  }
}

function findNearestKlimerkoLocation(lat: number, lon: number) {
  let nearest = null;
  let minDistance = Infinity;

  for (const location of KLIMERKO_KNOWN_LOCATIONS) {
    const distance = Math.sqrt(
      Math.pow(lat - location.lat, 2) + Math.pow(lon - location.lon, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = location;
    }
  }

  // Vrati samo ako je dovoljno blizu (npr. 0.1 stepeni ~ 10km)
  return minDistance < 0.1 ? nearest : null;
}

export { KLIMERKO_KNOWN_LOCATIONS };
