import { AirQualityData, AirQualitySource } from '@/lib/types/air-quality';
import { calculateAQI } from '@/lib/types/air-quality';

// SEPA - Agencija za zaštitu životne sredine Srbije
// Web scraping sa http://www.amskv.sepa.gov.rs/
// Alternativno: RSS feed ako postoji

const SEPA_STATIONS = [
  { id: 'bg-stari-grad', name: 'Beograd - Stari Grad', city: 'Beograd', lat: 44.8176, lon: 20.4633 },
  { id: 'bg-mostar', name: 'Beograd - Mostar', city: 'Beograd', lat: 44.8050, lon: 20.4550 },
  { id: 'bg-novi-beograd', name: 'Beograd - Novi Beograd', city: 'Beograd', lat: 44.8125, lon: 20.4213 },
  { id: 'bg-zeleno-brdo', name: 'Beograd - Zeleno Brdo', city: 'Beograd', lat: 44.7883, lon: 20.5278 },
  { id: 'ns-centar', name: 'Novi Sad - Centar', city: 'Novi Sad', lat: 45.2551, lon: 19.8451 },
  { id: 'nis-gradski', name: 'Niš - Gradski park', city: 'Niš', lat: 43.3209, lon: 21.8954 },
  { id: 'subotica', name: 'Subotica', city: 'Subotica', lat: 46.1000, lon: 19.6667 },
  { id: 'uzice', name: 'Užice', city: 'Užice', lat: 43.8586, lon: 19.8425 },
  { id: 'smederevo', name: 'Smederevo', city: 'Smederevo', lat: 44.6628, lon: 20.9269 },
  { id: 'pancevo', name: 'Pančevo', city: 'Pančevo', lat: 44.8738, lon: 20.6517 },
  { id: 'bor', name: 'Bor', city: 'Bor', lat: 44.0747, lon: 22.0967 },
  { id: 'kosjerić', name: 'Kosjerić', city: 'Kosjerić', lat: 43.9928, lon: 19.9119 },
  { id: 'valjevo', name: 'Valjevo', city: 'Valjevo', lat: 44.2747, lon: 19.8903 },
  { id: 'kragujevac', name: 'Kragujevac', city: 'Kragujevac', lat: 44.0128, lon: 20.9164 },
];

export async function fetchSEPAData(): Promise<AirQualityData[]> {
  const results: AirQualityData[] = [];

  try {
    // Pokušaj fetch sa SEPA API-ja (ako postoji)
    // Ako ne postoji zvanični API, koristimo web scraping ili RSS
    
    // Opcija 1: Probaj JSON API endpoint
    const apiResponse = await fetch(
      'http://www.amskv.sepa.gov.rs/api/data/current',
      {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(10000),
      }
    ).catch(() => null);

    if (apiResponse?.ok) {
      const data = await apiResponse.json();
      return processSEPAApiData(data);
    }

    // Opcija 2: Pokušaj RSS feed
    const rssResponse = await fetch(
      'http://www.amskv.sepa.gov.rs/rss/feed.xml',
      {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(10000),
      }
    ).catch(() => null);

    if (rssResponse?.ok) {
      const rssText = await rssResponse.text();
      return parseSEPARss(rssText);
    }

    // Opcija 3: Koristi poznate podatke sa OpenAQ za Srbiju
    // (SEPA stanice su često u OpenAQ bazi)
    const openaqResponse = await fetch(
      'https://api.openaq.org/v2/latest?country=RS&limit=100&parameter=pm25',
      {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (openaqResponse.ok) {
      const openaqData = await openaqResponse.json();
      return processOpenAQForSEPA(openaqData);
    }

    return [];
  } catch (error) {
    console.error('Error fetching SEPA data:', error);
    return [];
  }
}

function processSEPAApiData(data: any): AirQualityData[] {
  if (!data || !Array.isArray(data)) return [];

  return data.map((station: any) => {
    const { aqi, category } = calculateAQI(
      station.pm25,
      station.pm10,
      station.no2,
      station.o3
    );

    return {
      id: `sepa-${station.id}`,
      location: {
        name: station.name,
        coordinates: [station.longitude, station.latitude] as [number, number],
        city: station.city,
        region: 'Srbija',
      },
      parameters: {
        pm25: station.pm25,
        pm10: station.pm10,
        no2: station.no2,
        so2: station.so2,
        o3: station.o3,
        co: station.co,
      },
      aqi,
      aqiCategory: category,
      source: 'sepa' as AirQualitySource,
      timestamp: station.timestamp || new Date().toISOString(),
    };
  });
}

function parseSEPARss(rssText: string): AirQualityData[] {
  // Jednostavan XML parser za RSS
  const results: AirQualityData[] = [];
  
  try {
    // Ovde bi trebao pravi XML parsing
    // Za sada vraćamo praznu listu jer RSS format nije poznat
    console.log('RSS parsing not implemented yet');
  } catch (error) {
    console.error('Error parsing SEPA RSS:', error);
  }

  return results;
}

function processOpenAQForSEPA(data: any): AirQualityData[] {
  if (!data?.results) return [];

  return data.results
    .filter((result: any) => {
      // Filtriraj samo SEPA stanice
      const name = (result.location || '').toLowerCase();
      return (
        name.includes('sepa') ||
        name.includes('zavod') ||
        name.includes('agencija') ||
        SEPA_STATIONS.some(s => 
          name.includes(s.city.toLowerCase()) ||
          name.includes(s.name.toLowerCase())
        )
      );
    })
    .map((result: any) => {
      const parameters: Record<string, number> = {};
      
      result.measurements?.forEach((m: any) => {
        const param = m.parameter?.toLowerCase();
        if (['pm25', 'pm10', 'no2', 'so2', 'o3', 'co'].includes(param)) {
          parameters[param] = m.value;
        }
      });

      const { aqi, category } = calculateAQI(
        parameters.pm25,
        parameters.pm10,
        parameters.no2,
        parameters.o3
      );

      return {
        id: `sepa-openaq-${result.location}`,
        location: {
          name: result.location,
          coordinates: [result.coordinates.longitude, result.coordinates.latitude] as [number, number],
          city: result.city || 'Unknown',
          region: 'Srbija',
        },
        parameters,
        aqi,
        aqiCategory: category,
        source: 'sepa' as AirQualitySource,
        timestamp: result.measurements?.[0]?.lastUpdated || new Date().toISOString(),
      };
    });
}

// Eksport liste SEPA stanica za referencu
export { SEPA_STATIONS };
