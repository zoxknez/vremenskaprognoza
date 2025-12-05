import { AirQualityData, AirQualitySource } from '@/lib/types/air-quality';
import { calculateAQI } from '@/lib/types/air-quality';

const ALLTHINGSTALK_API_BASE = 'https://api.allthingstalk.com';

export async function fetchAllThingsTalkData(deviceToken?: string): Promise<AirQualityData[]> {
  if (!deviceToken) {
    // Silently skip if token not provided
    return [];
  }

  try {
    // Note: This is a placeholder implementation
    // You'll need to adjust based on actual AllThingsTalk API structure
    const response = await fetch(
      `${ALLTHINGSTALK_API_BASE}/device`,
      {
        headers: {
          'Authorization': `Bearer ${deviceToken}`,
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`AllThingsTalk API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform AllThingsTalk data structure to our format
    // Adjust this based on actual API response structure
    return data.map((device: any) => {
      const parameters: Record<string, number> = {};
      
      // Extract air quality parameters from device assets
      device.assets?.forEach((asset: any) => {
        const name = asset.name?.toLowerCase();
        if (name.includes('pm25')) parameters.pm25 = asset.state?.value;
        if (name.includes('pm10')) parameters.pm10 = asset.state?.value;
        if (name.includes('no2')) parameters.no2 = asset.state?.value;
        if (name.includes('so2')) parameters.so2 = asset.state?.value;
        if (name.includes('o3')) parameters.o3 = asset.state?.value;
        if (name.includes('co')) parameters.co = asset.state?.value;
      });

      const { aqi, category } = calculateAQI(
        parameters.pm25,
        parameters.pm10,
        parameters.no2,
        parameters.o3
      );

      return {
        id: `allthingstalk-${device.id}`,
        location: {
          name: device.title || `Device ${device.id}`,
          coordinates: [
            device.location?.longitude || 0,
            device.location?.latitude || 0,
          ],
          city: device.location?.city || 'Unknown',
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
        aqi,
        aqiCategory: category,
        source: 'allthingstalk' as AirQualitySource,
        timestamp: device.lastActivity || new Date().toISOString(),
        lastUpdated: device.lastActivity,
      };
    });
  } catch (error) {
    console.error('Error fetching AllThingsTalk data:', error);
    return [];
  }
}

