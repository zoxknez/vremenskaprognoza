/**
 * Google Air Quality API - Worldwide Coverage
 * Fetches air quality data for any location worldwide using Google Air Quality API
 */

import { AirQualityData } from '@/lib/types/air-quality';
import { fetchGoogleAirQualityBatch } from './google-air-quality';
import { getAllWorldCities, getFeaturedCities } from './world-locations';

/**
 * Fetch Google Air Quality data for featured worldwide cities
 * @returns Array of air quality data from Google API
 */
export async function fetchGoogleWorldwideData(): Promise<AirQualityData[]> {
    try {
        // Get featured cities (most populated/important)
        const cities = getFeaturedCities(50); // Top 50 cities worldwide

        // Convert to format expected by fetchGoogleAirQualityBatch
        const cityList = cities.map(city => ({
            name: city.name,
            lat: city.lat,
            lon: city.lon,
            region: city.country,
        }));

        // Fetch air quality data for all cities
        const data = await fetchGoogleAirQualityBatch(cityList);

        console.log(`✅ Google API (Worldwide): Fetched ${data.length} stations`);
        return data;
    } catch (error) {
        console.error('❌ Google Worldwide API error:', error);
        return [];
    }
}

/**
 * Fetch air quality for all available cities (for comprehensive coverage)
 * Use with caution - this will make many API calls
 */
export async function fetchGoogleAllCitiesData(): Promise<AirQualityData[]> {
    try {
        const cities = getAllWorldCities();

        const cityList = cities.map(city => ({
            name: city.name,
            lat: city.lat,
            lon: city.lon,
            region: city.country,
        }));

        const data = await fetchGoogleAirQualityBatch(cityList);

        console.log(`✅ Google API (All Cities): Fetched ${data.length}/${cities.length} stations`);
        return data;
    } catch (error) {
        console.error('❌ Google All Cities API error:', error);
        return [];
    }
}

// Maintain backwards compatibility - alias for Balkan-specific code
export const fetchGoogleBalkanData = fetchGoogleWorldwideData;
