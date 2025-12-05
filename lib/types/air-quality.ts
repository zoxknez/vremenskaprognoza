export type AirQualitySource = 'sepa' | 'openaq' | 'sensor-community' | 'klimerko' | 'allthingstalk' | 'waqi' | 'openweather' | 'aqicn' | 'airvisual';

export type AQICategory = 'good' | 'moderate' | 'unhealthy' | 'very-unhealthy' | 'hazardous';

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
  unhealthy: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/20',
  },
  'very-unhealthy': {
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-500/20',
  },
  hazardous: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20',
  },
};

export function calculateAQI(pm25?: number, pm10?: number, no2?: number, o3?: number): {
  aqi: number;
  category: AQICategory;
} {
  // Simplified AQI calculation based on US EPA standards
  // In production, use proper AQI calculation
  let maxAQI = 0;
  
  if (pm25) {
    const pm25AQI = Math.min(500, Math.max(0, (pm25 / 12) * 50));
    maxAQI = Math.max(maxAQI, pm25AQI);
  }
  
  if (pm10) {
    const pm10AQI = Math.min(500, Math.max(0, (pm10 / 50) * 50));
    maxAQI = Math.max(maxAQI, pm10AQI);
  }
  
  if (no2) {
    const no2AQI = Math.min(500, Math.max(0, (no2 / 100) * 50));
    maxAQI = Math.max(maxAQI, no2AQI);
  }
  
  if (o3) {
    const o3AQI = Math.min(500, Math.max(0, (o3 / 100) * 50));
    maxAQI = Math.max(maxAQI, o3AQI);
  }
  
  let category: AQICategory = 'good';
  if (maxAQI >= 300) category = 'hazardous';
  else if (maxAQI >= 200) category = 'very-unhealthy';
  else if (maxAQI >= 150) category = 'unhealthy';
  else if (maxAQI >= 100) category = 'moderate';
  
  return { aqi: Math.round(maxAQI), category };
}

