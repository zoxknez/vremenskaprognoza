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

// Get top N worst cities
export function getWorstCities(data: AirQualityData[], limit = 10): Array<{
  name: string;
  country: string;
  aqi: number;
  averageAQI: number;
}> {
  const cityGroups = groupByCity(data);
  
  const cityAverages = Object.entries(cityGroups).map(([city, stations]) => {
    const validStations = stations.filter(s => typeof s.aqi === 'number' && !isNaN(s.aqi));
    if (validStations.length === 0) return null;

    const avgAQI = validStations.reduce((sum, s) => sum + s.aqi, 0) / validStations.length;
    const maxAQI = Math.max(...validStations.map(s => s.aqi));

    return {
      name: city,
      country: validStations[0].location.region || 'Unknown',
      aqi: maxAQI,
      averageAQI: Math.round(avgAQI),
    };
  }).filter(Boolean) as Array<{
    name: string;
    country: string;
    aqi: number;
    averageAQI: number;
  }>;

  return cityAverages
    .sort((a, b) => b.averageAQI - a.averageAQI)
    .slice(0, limit);
}

// Get top N best cities
export function getBestCities(data: AirQualityData[], limit = 10): Array<{
  name: string;
  country: string;
  aqi: number;
  averageAQI: number;
}> {
  const cityGroups = groupByCity(data);
  
  const cityAverages = Object.entries(cityGroups).map(([city, stations]) => {
    const validStations = stations.filter(s => typeof s.aqi === 'number' && !isNaN(s.aqi) && s.aqi > 0);
    if (validStations.length === 0) return null;

    const avgAQI = validStations.reduce((sum, s) => sum + s.aqi, 0) / validStations.length;
    const minAQI = Math.min(...validStations.map(s => s.aqi));

    return {
      name: city,
      country: validStations[0].location.region || 'Unknown',
      aqi: minAQI,
      averageAQI: Math.round(avgAQI),
    };
  }).filter(Boolean) as Array<{
    name: string;
    country: string;
    aqi: number;
    averageAQI: number;
  }>;

  return cityAverages
    .sort((a, b) => a.averageAQI - b.averageAQI)
    .slice(0, limit);
}
