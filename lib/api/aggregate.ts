import { AirQualityData } from '@/lib/types/air-quality';
import { fetchOpenAQData } from './openaq';
import { fetchSensorCommunityData } from './sensor-community';
import { fetchAllThingsTalkData } from './allthingstalk';
import { fetchSEPAData } from './sepa';
import { fetchWAQIData } from './waqi';
import { fetchOpenWeatherData } from './openweather';
import { fetchAQICNData } from './aqicn';
import { fetchAirVisualData } from './airvisual';
import { getMockData } from './mock-data';

export async function fetchAllAirQualityData(): Promise<AirQualityData[]> {
  const [
    openaqData,
    sensorCommunityData,
    allThingsTalkData,
    sepaData,
    waqiData,
    openWeatherData,
    aqicnData,
    airVisualData,
  ] = await Promise.allSettled([
    fetchOpenAQData('RS'),
    fetchSensorCommunityData(),
    fetchAllThingsTalkData(process.env.ALLTHINGSTALK_TOKEN),
    fetchSEPAData(),
    fetchWAQIData('Belgrade'),
    fetchOpenWeatherData(),
    fetchAQICNData(),
    fetchAirVisualData(),
  ]);

  const allData: AirQualityData[] = [];

  if (openaqData.status === 'fulfilled') {
    allData.push(...openaqData.value);
  }

  if (sensorCommunityData.status === 'fulfilled') {
    allData.push(...sensorCommunityData.value);
  }

  if (allThingsTalkData.status === 'fulfilled') {
    allData.push(...allThingsTalkData.value);
  }

  if (sepaData.status === 'fulfilled') {
    allData.push(...sepaData.value);
  }

  if (waqiData.status === 'fulfilled') {
    allData.push(...waqiData.value);
  }

  if (openWeatherData.status === 'fulfilled') {
    allData.push(...openWeatherData.value);
  }

  if (aqicnData.status === 'fulfilled') {
    allData.push(...aqicnData.value);
  }

  if (airVisualData.status === 'fulfilled') {
    allData.push(...airVisualData.value);
  }

  // If no data from APIs, use mock data for demonstration
  if (allData.length === 0) {
    return getMockData();
  }

  // Remove duplicates based on location (within 100m radius)
  const uniqueData = removeDuplicates(allData);

  return uniqueData;
}

function removeDuplicates(data: AirQualityData[]): AirQualityData[] {
  const seen = new Map<string, AirQualityData>();

  for (const item of data) {
    // Validate coordinates
    const lon = item.location.coordinates[0];
    const lat = item.location.coordinates[1];
    
    // Skip if coordinates are invalid
    if (typeof lon !== 'number' || typeof lat !== 'number' || isNaN(lon) || isNaN(lat)) {
      continue;
    }

    const key = `${lon.toFixed(3)},${lat.toFixed(3)}`;
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, item);
    } else {
      // Keep the one with more recent data or more sources
      if (new Date(item.timestamp) > new Date(existing.timestamp)) {
        seen.set(key, item);
      }
    }
  }

  return Array.from(seen.values());
}

