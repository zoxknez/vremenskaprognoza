import { AirQualityData, AirQualitySource } from '@/lib/types/air-quality';
import { calculateAQI } from '@/lib/types/air-quality';

// AQICN API - World Air Quality Index
// Free tier available
const AQICN_API_BASE = 'https://api.waqi.info';

// Alternative: AQICN.org API
export async function fetchAQICNData(): Promise<AirQualityData[]> {
  try {
    // Serbian cities
    const cities = [
      { name: 'Belgrade', search: 'Belgrade' },
      { name: 'Novi Sad', search: 'Novi%20Sad' },
      { name: 'Nis', search: 'Nis' },
    ];

    const results: AirQualityData[] = [];

    for (const city of cities) {
      try {
        // Try AQICN search API
        const searchResponse = await fetch(
          `${AQICN_API_BASE}/search/?keyword=${city.search}&token=${process.env.AQICN_API_TOKEN || 'demo'}`,
          {
            next: { revalidate: 600 },
            signal: AbortSignal.timeout(5000),
          }
        );

        if (!searchResponse.ok) continue;

        const searchData = await searchResponse.json();
        
        if (searchData.status === 'ok' && searchData.data && searchData.data.length > 0) {
          const station = searchData.data[0];
          
          // Fetch detailed data for the station
          const detailResponse = await fetch(
            `${AQICN_API_BASE}/feed/@${station.uid}/?token=${process.env.AQICN_API_TOKEN || 'demo'}`,
            {
              next: { revalidate: 600 },
              signal: AbortSignal.timeout(5000),
            }
          );

          if (!detailResponse.ok) continue;

          const detailData = await detailResponse.json();
          
          if (detailData.status === 'ok' && detailData.data) {
            const stationData = detailData.data;
            const iaqi = stationData.iaqi || {};
            
            const parameters: Record<string, number> = {};
            if (iaqi.pm25?.v) parameters.pm25 = iaqi.pm25.v;
            if (iaqi.pm10?.v) parameters.pm10 = iaqi.pm10.v;
            if (iaqi.no2?.v) parameters.no2 = iaqi.no2.v;
            if (iaqi.so2?.v) parameters.so2 = iaqi.so2.v;
            if (iaqi.o3?.v) parameters.o3 = iaqi.o3.v;
            if (iaqi.co?.v) parameters.co = iaqi.co.v;

            const aqi = stationData.aqi || calculateAQI(parameters.pm25, parameters.pm10).aqi;
            const { category } = calculateAQI(parameters.pm25, parameters.pm10, parameters.no2, parameters.o3);

            if (stationData.city?.geo && Array.isArray(stationData.city.geo) && stationData.city.geo.length >= 2) {
              results.push({
                id: `aqicn-${stationData.idx || city.name}`,
                location: {
                  name: stationData.city?.name || city.name,
                  coordinates: [stationData.city.geo[1], stationData.city.geo[0]],
                  city: stationData.city?.name || city.name,
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
                source: 'aqicn' as AirQualitySource,
                timestamp: stationData.time?.iso || new Date().toISOString(),
                lastUpdated: stationData.time?.iso,
              });
            }
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

