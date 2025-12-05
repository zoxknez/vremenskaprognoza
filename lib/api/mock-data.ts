import { AirQualityData, AirQualitySource } from '@/lib/types/air-quality';
import { calculateAQI } from '@/lib/types/air-quality';

// Mock data for demonstration when APIs are not available
export function getMockData(): AirQualityData[] {
  const mockStations = [
    {
      name: 'Beograd - Centar',
      city: 'Beograd',
      coordinates: [20.4573, 44.7872] as [number, number],
      pm25: 25.5,
      pm10: 45.2,
      no2: 35.8,
      o3: 120.3,
    },
    {
      name: 'Novi Sad - Centar',
      city: 'Novi Sad',
      coordinates: [19.8335, 45.2671] as [number, number],
      pm25: 22.1,
      pm10: 38.5,
      no2: 28.3,
      o3: 95.7,
    },
    {
      name: 'Niš - Centar',
      city: 'Niš',
      coordinates: [21.8957, 43.3209] as [number, number],
      pm25: 28.3,
      pm10: 52.1,
      no2: 42.5,
      o3: 110.2,
    },
    {
      name: 'Kragujevac',
      city: 'Kragujevac',
      coordinates: [20.9164, 44.0128] as [number, number],
      pm25: 24.7,
      pm10: 41.8,
      no2: 32.1,
      o3: 105.5,
    },
    {
      name: 'Subotica',
      city: 'Subotica',
      coordinates: [19.6667, 46.1000] as [number, number],
      pm25: 20.3,
      pm10: 35.2,
      no2: 25.7,
      o3: 88.4,
    },
  ];

  return mockStations.map((station, index) => {
    const { aqi, category } = calculateAQI(
      station.pm25,
      station.pm10,
      station.no2,
      station.o3
    );

    return {
      id: `mock-${index}`,
      location: {
        name: station.name,
        coordinates: station.coordinates,
        city: station.city,
        region: 'Srbija',
      },
      parameters: {
        pm25: station.pm25,
        pm10: station.pm10,
        no2: station.no2,
        o3: station.o3,
      },
      aqi,
      aqiCategory: category,
      source: 'sensor-community' as AirQualitySource,
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  });
}

