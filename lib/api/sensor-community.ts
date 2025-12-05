import { AirQualityData, AirQualitySource } from '@/lib/types/air-quality';
import { calculateAQI } from '@/lib/types/air-quality';

const SENSOR_COMMUNITY_API_BASE = 'https://data.sensor.community/airrohr/v1/filter';

// Serbia bounding box: approximately 18.8°E to 23.0°E, 41.8°N to 46.2°N
const SERBIA_BBOX = {
  latMin: 41.8,
  latMax: 46.2,
  lonMin: 18.8,
  lonMax: 23.0,
};

export async function fetchSensorCommunityData(): Promise<AirQualityData[]> {
  try {
    // Try different endpoint formats
    let response = await fetch(
      `${SENSOR_COMMUNITY_API_BASE}/country=RS`,
      {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    );

    // If that doesn't work, try alternative endpoint
    if (!response.ok) {
      response = await fetch(
        `https://data.sensor.community/static/v2/data.json`,
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
    
    // Handle both array and object responses
    const sensors = Array.isArray(data) ? data : (data.data || []);
    
    return sensors
      .filter((sensor: any) => {
        const lat = sensor.location?.latitude;
        const lon = sensor.location?.longitude;
        return (
          typeof lat === 'number' &&
          typeof lon === 'number' &&
          !isNaN(lat) &&
          !isNaN(lon) &&
          lat >= SERBIA_BBOX.latMin &&
          lat <= SERBIA_BBOX.latMax &&
          lon >= SERBIA_BBOX.lonMin &&
          lon <= SERBIA_BBOX.lonMax
        );
      })
      .map((sensor: any) => {
        const parameters: Record<string, number> = {};
        
        sensor.sensordatavalues?.forEach((value: any) => {
          const param = value.value_type?.toLowerCase();
          if (['p1', 'p2'].includes(param)) {
            if (param === 'p1') parameters.pm10 = parseFloat(value.value);
            if (param === 'p2') parameters.pm25 = parseFloat(value.value);
          }
        });

        const { aqi, category } = calculateAQI(
          parameters.pm25,
          parameters.pm10
        );

        // Validate coordinates
        const lon = sensor.location?.longitude;
        const lat = sensor.location?.latitude;
        
        if (typeof lon !== 'number' || typeof lat !== 'number' || isNaN(lon) || isNaN(lat)) {
          return null;
        }

        return {
          id: `sensor-community-${sensor.id}`,
          location: {
            name: sensor.location?.name || `Sensor ${sensor.id}`,
            coordinates: [Number(lon), Number(lat)],
            city: sensor.location?.city || 'Unknown',
            region: 'Serbia',
          },
          parameters: {
            pm25: parameters.pm25,
            pm10: parameters.pm10,
          },
          aqi,
          aqiCategory: category,
          source: 'sensor-community' as AirQualitySource,
          timestamp: sensor.timestamp,
          lastUpdated: sensor.timestamp,
        };
      })
      .filter((item: AirQualityData | null) => item !== null) as AirQualityData[];
  } catch (error) {
    console.error('Error fetching Sensor Community data:', error);
    return [];
  }
}

