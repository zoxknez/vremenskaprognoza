import { AirQualityData, AirQualitySource } from '@/lib/types/air-quality';
import { calculateAQI } from '@/lib/types/air-quality';
import { BALKAN_COUNTRIES, BalkanCountryCode } from './balkan-countries';

// WAQI API za ceo Balkan
const WAQI_API_BASE = 'https://api.waqi.info';

// Gradovi za svaku balkansku zemlju
const WAQI_CITIES: Record<BalkanCountryCode, string[]> = {
  RS: ['Belgrade', 'Novi Sad', 'Nis', 'Kragujevac', 'Subotica'],
  HR: ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar'],
  BA: ['Sarajevo', 'Banja Luka', 'Tuzla', 'Zenica', 'Mostar'],
  ME: ['Podgorica', 'Niksic', 'Pljevlja'],
  MK: ['Skopje', 'Bitola', 'Kumanovo', 'Tetovo'],
  SI: ['Ljubljana', 'Maribor', 'Celje', 'Kranj'],
  AL: ['Tirana', 'Durres', 'Vlore', 'Shkoder'],
  XK: ['Pristina', 'Prizren'],
  BG: ['Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse'],
  RO: ['Bucharest', 'Cluj-Napoca', 'Timisoara', 'Iasi', 'Constanta'],
  GR: ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa'],
};

export async function fetchWAQIBalkanData(): Promise<AirQualityData[]> {
  const token = process.env.WAQI_API_TOKEN || 'demo';
  const results: AirQualityData[] = [];

  // Fetch za svaku zemlju
  for (const [countryCode, cities] of Object.entries(WAQI_CITIES)) {
    const country = BALKAN_COUNTRIES[countryCode as BalkanCountryCode];
    
    for (const cityName of cities) {
      try {
        const response = await fetch(
          `${WAQI_API_BASE}/feed/${encodeURIComponent(cityName)}/?token=${token}`,
          {
            next: { revalidate: 600 },
            signal: AbortSignal.timeout(5000),
          }
        );

        if (!response.ok) continue;

        const data = await response.json();
        
        if (data.status === 'ok' && data.data) {
          const station = data.data;
          const iaqi = station.iaqi || {};
          
          const parameters: Record<string, number> = {};
          if (iaqi.pm25?.v) parameters.pm25 = iaqi.pm25.v;
          if (iaqi.pm10?.v) parameters.pm10 = iaqi.pm10.v;
          if (iaqi.no2?.v) parameters.no2 = iaqi.no2.v;
          if (iaqi.so2?.v) parameters.so2 = iaqi.so2.v;
          if (iaqi.o3?.v) parameters.o3 = iaqi.o3.v;
          if (iaqi.co?.v) parameters.co = iaqi.co.v;

          const aqi = station.aqi || calculateAQI(parameters.pm25, parameters.pm10, parameters.no2, parameters.o3).aqi;
          const { category } = calculateAQI(parameters.pm25, parameters.pm10, parameters.no2, parameters.o3);

          if (station.city?.geo && Array.isArray(station.city.geo) && station.city.geo.length >= 2) {
            results.push({
              id: `waqi-${countryCode}-${station.idx || cityName}`,
              location: {
                name: station.city?.name || cityName,
                coordinates: [station.city.geo[1], station.city.geo[0]] as [number, number],
                city: station.city?.name || cityName,
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
              aqi: typeof aqi === 'number' ? aqi : calculateAQI(parameters.pm25, parameters.pm10).aqi,
              aqiCategory: category,
              source: 'waqi' as AirQualitySource,
              timestamp: station.time?.iso || new Date().toISOString(),
              lastUpdated: station.time?.iso,
            });
          }
        }
      } catch (error) {
        continue;
      }
    }
  }

  return results;
}

// Pretraga WAQI stanica u okviru geografske oblasti
export async function fetchWAQIByBounds(
  latlng: [number, number, number, number] // [lat1, lng1, lat2, lng2]
): Promise<AirQualityData[]> {
  const token = process.env.WAQI_API_TOKEN || 'demo';
  
  try {
    const response = await fetch(
      `${WAQI_API_BASE}/map/bounds/?token=${token}&latlng=${latlng.join(',')}`,
      {
        next: { revalidate: 600 },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    
    if (data.status !== 'ok' || !data.data) {
      return [];
    }

    return data.data.map((station: any) => {
      const { aqi, category } = calculateAQI(station.aqi);

      return {
        id: `waqi-map-${station.uid}`,
        location: {
          name: station.station?.name || 'Unknown',
          coordinates: [station.lon, station.lat] as [number, number],
          city: station.station?.name?.split(',')[0] || 'Unknown',
          region: 'Balkan',
        },
        parameters: {},
        aqi: station.aqi === '-' ? 0 : parseInt(station.aqi) || 0,
        aqiCategory: category,
        source: 'waqi' as AirQualitySource,
        timestamp: station.utime || new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error('Error fetching WAQI bounds data:', error);
    return [];
  }
}

// Fetch za ceo Balkan koristeći bounds
export async function fetchWAQIEntireBalkan(): Promise<AirQualityData[]> {
  // Balkan bounds: approximately lat 34.8-48.3, lon 13.3-29.7
  return fetchWAQIByBounds([34.8, 13.3, 48.3, 29.7]);
}
