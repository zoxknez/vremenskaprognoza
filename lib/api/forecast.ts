import { AQICategory } from '@/lib/types/air-quality';

export interface ForecastData {
  timestamp: string;
  aqi: number;
  aqiCategory: AQICategory;
  parameters: {
    pm25?: number;
    pm10?: number;
    no2?: number;
    so2?: number;
    o3?: number;
    co?: number;
  };
}

export interface ForecastResponse {
  location: {
    name: string;
    coordinates: [number, number];
    city: string;
  };
  current: ForecastData;
  hourly: ForecastData[];
  daily: Array<{
    date: string;
    avgAqi: number;
    maxAqi: number;
    minAqi: number;
    aqiCategory: AQICategory;
  }>;
}

// API za prognozu kvaliteta vazduha
export async function fetchAQIForecast(
  lat: number,
  lon: number
): Promise<ForecastResponse | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.warn('OpenWeather API key not configured');
    return null;
  }

  try {
    // Fetch forecast data from OpenWeather
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch forecast');
    }

    const data = await response.json();
    
    if (!data.list || data.list.length === 0) {
      return null;
    }

    // Process the data
    const hourly: ForecastData[] = data.list.slice(0, 48).map((item: any) => {
      const components = item.components || {};
      const aqi = calculateAQIFromComponents(components);
      
      return {
        timestamp: new Date(item.dt * 1000).toISOString(),
        aqi,
        aqiCategory: getAQICategory(aqi),
        parameters: {
          pm25: components.pm2_5,
          pm10: components.pm10,
          no2: components.no2,
          so2: components.so2,
          o3: components.o3,
          co: components.co ? components.co / 1000 : undefined,
        },
      };
    });

    // Calculate daily aggregates
    const dailyMap = new Map<string, ForecastData[]>();
    
    for (const item of hourly) {
      const date = item.timestamp.split('T')[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, []);
      }
      dailyMap.get(date)!.push(item);
    }

    const daily = Array.from(dailyMap.entries()).map(([date, items]) => {
      const aqis = items.map(i => i.aqi);
      const avgAqi = Math.round(aqis.reduce((a, b) => a + b, 0) / aqis.length);
      
      return {
        date,
        avgAqi,
        maxAqi: Math.max(...aqis),
        minAqi: Math.min(...aqis),
        aqiCategory: getAQICategory(avgAqi),
      };
    });

    const current = hourly[0] || {
      timestamp: new Date().toISOString(),
      aqi: 0,
      aqiCategory: 'good' as AQICategory,
      parameters: {},
    };

    return {
      location: {
        name: 'Current Location',
        coordinates: [lon, lat],
        city: 'Unknown',
      },
      current,
      hourly,
      daily,
    };
  } catch (error) {
    console.error('Error fetching AQI forecast:', error);
    return null;
  }
}

// Calculate AQI from pollutant components
function calculateAQIFromComponents(components: any): number {
  let maxAqi = 0;

  if (components.pm2_5) {
    const pm25Aqi = calculatePM25AQI(components.pm2_5);
    maxAqi = Math.max(maxAqi, pm25Aqi);
  }

  if (components.pm10) {
    const pm10Aqi = calculatePM10AQI(components.pm10);
    maxAqi = Math.max(maxAqi, pm10Aqi);
  }

  if (components.no2) {
    const no2Aqi = calculateNO2AQI(components.no2);
    maxAqi = Math.max(maxAqi, no2Aqi);
  }

  if (components.o3) {
    const o3Aqi = calculateO3AQI(components.o3);
    maxAqi = Math.max(maxAqi, o3Aqi);
  }

  return Math.round(maxAqi);
}

// US EPA AQI breakpoints
function calculatePM25AQI(pm25: number): number {
  const breakpoints = [
    { low: 0, high: 12.0, aqiLow: 0, aqiHigh: 50 },
    { low: 12.1, high: 35.4, aqiLow: 51, aqiHigh: 100 },
    { low: 35.5, high: 55.4, aqiLow: 101, aqiHigh: 150 },
    { low: 55.5, high: 150.4, aqiLow: 151, aqiHigh: 200 },
    { low: 150.5, high: 250.4, aqiLow: 201, aqiHigh: 300 },
    { low: 250.5, high: 500.4, aqiLow: 301, aqiHigh: 500 },
  ];

  return calculateAQI(pm25, breakpoints);
}

function calculatePM10AQI(pm10: number): number {
  const breakpoints = [
    { low: 0, high: 54, aqiLow: 0, aqiHigh: 50 },
    { low: 55, high: 154, aqiLow: 51, aqiHigh: 100 },
    { low: 155, high: 254, aqiLow: 101, aqiHigh: 150 },
    { low: 255, high: 354, aqiLow: 151, aqiHigh: 200 },
    { low: 355, high: 424, aqiLow: 201, aqiHigh: 300 },
    { low: 425, high: 604, aqiLow: 301, aqiHigh: 500 },
  ];

  return calculateAQI(pm10, breakpoints);
}

function calculateNO2AQI(no2: number): number {
  const breakpoints = [
    { low: 0, high: 53, aqiLow: 0, aqiHigh: 50 },
    { low: 54, high: 100, aqiLow: 51, aqiHigh: 100 },
    { low: 101, high: 360, aqiLow: 101, aqiHigh: 150 },
    { low: 361, high: 649, aqiLow: 151, aqiHigh: 200 },
    { low: 650, high: 1249, aqiLow: 201, aqiHigh: 300 },
    { low: 1250, high: 2049, aqiLow: 301, aqiHigh: 500 },
  ];

  return calculateAQI(no2, breakpoints);
}

function calculateO3AQI(o3: number): number {
  const breakpoints = [
    { low: 0, high: 54, aqiLow: 0, aqiHigh: 50 },
    { low: 55, high: 70, aqiLow: 51, aqiHigh: 100 },
    { low: 71, high: 85, aqiLow: 101, aqiHigh: 150 },
    { low: 86, high: 105, aqiLow: 151, aqiHigh: 200 },
    { low: 106, high: 200, aqiLow: 201, aqiHigh: 300 },
  ];

  return calculateAQI(o3, breakpoints);
}

function calculateAQI(
  concentration: number,
  breakpoints: Array<{ low: number; high: number; aqiLow: number; aqiHigh: number }>
): number {
  for (const bp of breakpoints) {
    if (concentration >= bp.low && concentration <= bp.high) {
      return Math.round(
        ((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) *
          (concentration - bp.low) +
          bp.aqiLow
      );
    }
  }
  return 500; // Max AQI
}

function getAQICategory(aqi: number): AQICategory {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy';
  if (aqi <= 200) return 'very-unhealthy';
  return 'hazardous';
}
