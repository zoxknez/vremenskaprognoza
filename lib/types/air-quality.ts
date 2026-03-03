import { calculateAQI as calculatePmAQI, getAQICategory } from '@/lib/utils/aqi';
export type AirQualitySource = 'sepa' | 'openaq' | 'sensor-community' | 'allthingstalk' | 'waqi' | 'openweather' | 'aqicn' | 'airvisual' | 'google';

// Unified AQI Category type - US EPA standard
// good: 0-50, moderate: 51-100, sensitive: 101-150, unhealthy: 151-200, veryUnhealthy: 201-300, hazardous: 301+
export type AQICategory = 'good' | 'moderate' | 'sensitive' | 'unhealthy' | 'veryUnhealthy' | 'hazardous';

export interface AirQualityData {
  id: string;
  location: {
    name: string;
    coordinates: [number, number]; // [longitude, latitude]
    city: string;
    region?: string;
  };
  parameters: {
    pm25?: number;
    pm10?: number;
    no2?: number;
    so2?: number;
    o3?: number;
    co?: number;
  };
  aqi: number;
  aqiCategory: AQICategory;
  source: AirQualitySource;
  timestamp: string;
  lastUpdated?: string;
}

export interface Station {
  id: string;
  name: string;
  city: string;
  region: string;
  coordinates: [number, number];
  sources: AirQualitySource[];
  isActive: boolean;
}

export interface HistoricalData {
  stationId: string;
  timestamp: string;
  parameters: {
    pm25?: number;
    pm10?: number;
    no2?: number;
    so2?: number;
    o3?: number;
    co?: number;
  };
  aqi: number;
}

export const AQI_COLORS: Record<AQICategory, { bg: string; text: string; border: string }> = {
  good: {
    bg: 'bg-green-500/10',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-500/20',
  },
  moderate: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-500/20',
  },
  sensitive: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/20',
  },
  unhealthy: {
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-500/20',
  },
  veryUnhealthy: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20',
  },
  hazardous: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/20',
  },
};

export function calculateAQI(pm25?: number, pm10?: number, no2?: number, o3?: number): {
  aqi: number;
  category: AQICategory;
} {
  // PM2.5 / PM10 are calculated using the central US EPA breakpoint logic.
  let maxAQI = calculatePmAQI(pm25, pm10);

  // Keep compatibility for sources that provide only NO2 or O3 values.
  if (typeof no2 === 'number' && no2 >= 0) {
    const no2AQI = Math.min(500, Math.max(0, (no2 / 100) * 50));
    maxAQI = Math.max(maxAQI, no2AQI);
  }

  if (typeof o3 === 'number' && o3 >= 0) {
    const o3AQI = Math.min(500, Math.max(0, (o3 / 100) * 50));
    maxAQI = Math.max(maxAQI, o3AQI);
  }

  return {
    aqi: Math.round(maxAQI),
    category: getAQICategory(maxAQI),
  };
}

