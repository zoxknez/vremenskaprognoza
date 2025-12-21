import { AirQualityData } from '@/lib/types/air-quality';

export interface AirQualityStats {
  totalStations: number;
  totalCities: number;
  totalCountries: number;
  citiesWithData: string[];
  countriesWithData: string[];
  sourcesCount: {
    waqi: number;
    openweather: number;
    openaq: number;
    sensorCommunity: number;
    aqicn: number;
    airvisual: number;
    sepa: number;
    allthingstalk: number;
  };
  averageAQI: number;
  worstCity: {
    name: string;
    aqi: number;
    country: string;
  } | null;
  bestCity: {
    name: string;
    aqi: number;
    country: string;
  } | null;
  lastUpdated: string;
}

export function calculateAirQualityStats(data: AirQualityData[]): AirQualityStats {
  if (data.length === 0) {
    return {
      totalStations: 0,
      totalCities: 0,
      totalCountries: 0,
      citiesWithData: [],
      countriesWithData: [],
      sourcesCount: {
        waqi: 0,
        openweather: 0,
        openaq: 0,
        sensorCommunity: 0,
        aqicn: 0,
        airvisual: 0,
        sepa: 0,
        allthingstalk: 0,
      },
      averageAQI: 0,
      worstCity: null,
      bestCity: null,
      lastUpdated: new Date().toISOString(),
    };
  }

  // Unique cities and countries
  const cities = new Set<string>();
  const countries = new Set<string>();
  
  // Source counts
  const sourcesCount = {
    waqi: 0,
    openweather: 0,
    openaq: 0,
    sensorCommunity: 0,
    aqicn: 0,
    airvisual: 0,
    sepa: 0,
    allthingstalk: 0,
  };

  // AQI calculations
  let totalAQI = 0;
  let worstAQI = -1;
  let bestAQI = Infinity;
  let worstCity: AirQualityStats['worstCity'] = null;
  let bestCity: AirQualityStats['bestCity'] = null;

  for (const station of data) {
    // Track cities and countries
    if (station.location.city) {
      cities.add(station.location.city);
    }
    if (station.location.region) {
      countries.add(station.location.region);
    }

    // Count sources
    if (station.source in sourcesCount) {
      sourcesCount[station.source as keyof typeof sourcesCount]++;
    }

    // Track AQI
    if (typeof station.aqi === 'number' && !isNaN(station.aqi)) {
      totalAQI += station.aqi;

      // Worst city
      if (station.aqi > worstAQI) {
        worstAQI = station.aqi;
        worstCity = {
          name: station.location.city || station.location.name,
          aqi: station.aqi,
          country: station.location.region || 'Unknown',
        };
      }

      // Best city
      if (station.aqi < bestAQI && station.aqi > 0) {
        bestAQI = station.aqi;
        bestCity = {
          name: station.location.city || station.location.name,
          aqi: station.aqi,
          country: station.location.region || 'Unknown',
        };
      }
    }
  }

  return {
    totalStations: data.length,
    totalCities: cities.size,
    totalCountries: countries.size,
    citiesWithData: Array.from(cities).sort(),
    countriesWithData: Array.from(countries).sort(),
    sourcesCount,
    averageAQI: Math.round(totalAQI / data.length),
    worstCity,
    bestCity,
    lastUpdated: new Date().toISOString(),
  };
}

// Get data grouped by country
export function groupByCountry(data: AirQualityData[]): Record<string, AirQualityData[]> {
  const grouped: Record<string, AirQualityData[]> = {};

  for (const station of data) {
    const country = station.location.region || 'Unknown';
    if (!grouped[country]) {
      grouped[country] = [];
    }
    grouped[country].push(station);
  }

  return grouped;
}

// Get data grouped by city
export function groupByCity(data: AirQualityData[]): Record<string, AirQualityData[]> {
  const grouped: Record<string, AirQualityData[]> = {};

  for (const station of data) {
    const city = station.location.city || station.location.name;
    if (!grouped[city]) {
      grouped[city] = [];
    }
    grouped[city].push(station);
  }

  return grouped;
}

export interface CityRankingData {
  name: string;
  country: string;
  aqi: number;
  averageAQI: number;
  minAQI: number;
  maxAQI: number;
  stationCount: number;
  lastUpdated: string;
  pm25?: number;
  pm10?: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

// Calculate data quality based on number of stations and data completeness
function calculateDataQuality(stationCount: number, hasAllParams: boolean): CityRankingData['dataQuality'] {
  if (stationCount >= 3 && hasAllParams) return 'excellent';
  if (stationCount >= 2 || hasAllParams) return 'good';
  if (stationCount >= 1) return 'fair';
  return 'poor';
}

// Get comprehensive city rankings with validation
export function getCityRankings(data: AirQualityData[]): CityRankingData[] {
  const cityGroups = groupByCity(data);
  const now = new Date().toISOString();
  
  const cityRankings = Object.entries(cityGroups).map(([city, stations]) => {
    // Filter out invalid stations
    const validStations = stations.filter(s => 
      typeof s.aqi === 'number' && 
      !isNaN(s.aqi) && 
      s.aqi > 0 && 
      s.aqi < 500 // Reasonable upper limit
    );
    
    if (validStations.length === 0) return null;

    // Calculate statistics
    const aqiValues = validStations.map(s => s.aqi);
    const avgAQI = aqiValues.reduce((sum, val) => sum + val, 0) / aqiValues.length;
    const minAQI = Math.min(...aqiValues);
    const maxAQI = Math.max(...aqiValues);

    // Calculate PM2.5 and PM10 averages if available
    const pm25Values = validStations
      .map(s => s.parameters?.pm25)
      .filter((val): val is number => typeof val === 'number' && !isNaN(val));
    const pm10Values = validStations
      .map(s => s.parameters?.pm10)
      .filter((val): val is number => typeof val === 'number' && !isNaN(val));

    const avgPM25 = pm25Values.length > 0 
      ? pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length 
      : undefined;
    const avgPM10 = pm10Values.length > 0 
      ? pm10Values.reduce((a, b) => a + b, 0) / pm10Values.length 
      : undefined;

    // Check data completeness
    const hasAllParams = validStations.some(s => 
      s.parameters?.pm25 !== undefined && 
      s.parameters?.pm10 !== undefined
    );

    return {
      name: city,
      country: validStations[0].location.region || 'Unknown',
      aqi: Math.round(avgAQI), // Use average for main AQI display
      averageAQI: Math.round(avgAQI * 10) / 10, // More precise average
      minAQI,
      maxAQI,
      stationCount: validStations.length,
      lastUpdated: now,
      pm25: avgPM25 ? Math.round(avgPM25 * 10) / 10 : undefined,
      pm10: avgPM10 ? Math.round(avgPM10 * 10) / 10 : undefined,
      dataQuality: calculateDataQuality(validStations.length, hasAllParams),
    } as CityRankingData;
  }).filter((city): city is CityRankingData => city !== null);

  return cityRankings;
}

// Get top N worst cities (most polluted)
export function getWorstCities(data: AirQualityData[], limit = 10): CityRankingData[] {
  const rankings = getCityRankings(data);
  
  return rankings
    .sort((a, b) => {
      // Primary sort by AQI (descending)
      if (b.aqi !== a.aqi) return b.aqi - a.aqi;
      // Secondary sort by data quality
      const qualityScore = { excellent: 4, good: 3, fair: 2, poor: 1 };
      return qualityScore[b.dataQuality] - qualityScore[a.dataQuality];
    })
    .slice(0, limit);
}

// Get top N best cities (cleanest air)
export function getBestCities(data: AirQualityData[], limit = 10): CityRankingData[] {
  const rankings = getCityRankings(data);
  
  return rankings
    .sort((a, b) => {
      // Primary sort by AQI (ascending)
      if (a.aqi !== b.aqi) return a.aqi - b.aqi;
      // Secondary sort by data quality
      const qualityScore = { excellent: 4, good: 3, fair: 2, poor: 1 };
      return qualityScore[b.dataQuality] - qualityScore[a.dataQuality];
    })
    .slice(0, limit);
}
