/**
 * Google Air Quality API Integration
 * https://developers.google.com/maps/documentation/air-quality
 * 
 * Provides comprehensive air quality data including:
 * - Universal AQI (0-500 scale)
 * - Pollutant concentrations (PM2.5, PM10, NO₂, O₃, SO₂, CO)
 * - Health recommendations
 * - Dominant pollutant identification
 */

import { AirQualityData, AirQualitySource, AQICategory } from '@/lib/types/air-quality';

const GOOGLE_AIR_QUALITY_API_BASE = 'https://airquality.googleapis.com/v1';

/**
 * Google API Response Types
 */
interface GoogleAQIValue {
    aqi: number;
    aqiDisplay: string;
    category: string;
}

interface GooglePollutant {
    code: string;
    displayName: string;
    fullName: string;
    concentration: {
        value: number;
        units: string;
    };
    additionalInfo?: {
        sources?: string;
        effects?: string;
    };
}

interface GoogleAirQualityResponse {
    dateTime: string;
    regionCode: string;
    indexes: GoogleAQIValue[];
    pollutants: GooglePollutant[];
    healthRecommendations?: {
        generalPopulation?: string;
        elderly?: string;
        lungDiseasePopulation?: string;
        heartDiseasePopulation?: string;
        athletes?: string;
        pregnantWomen?: string;
        children?: string;
    };
}

/**
 * Map Google AQI category to our AQICategory type
 */
function mapGoogleCategoryToAQI(googleCategory: string): AQICategory {
    const category = googleCategory.toLowerCase();

    if (category.includes('good')) return 'good';
    if (category.includes('moderate')) return 'moderate';
    if (category.includes('unhealthy for sensitive')) return 'sensitive';
    if (category.includes('unhealthy') && !category.includes('very')) return 'unhealthy';
    if (category.includes('very unhealthy')) return 'veryUnhealthy';
    if (category.includes('hazardous')) return 'hazardous';

    // Default to moderate if unknown
    return 'moderate';
}

/**
 * Extract pollutant values from Google response
 */
function extractPollutants(pollutants: GooglePollutant[]): AirQualityData['parameters'] {
    const parameters: AirQualityData['parameters'] = {};

    for (const pollutant of pollutants) {
        const code = pollutant.code.toLowerCase();
        const value = pollutant.concentration.value;

        // Convert µg/m³ values to match our expected units
        switch (code) {
            case 'pm25':
                parameters.pm25 = value;
                break;
            case 'pm10':
                parameters.pm10 = value;
                break;
            case 'no2':
                parameters.no2 = value;
                break;
            case 'o3':
                parameters.o3 = value;
                break;
            case 'so2':
                parameters.so2 = value;
                break;
            case 'co':
                // CO is often in mg/m³, convert to µg/m³
                parameters.co = pollutant.concentration.units === 'PARTS_PER_MILLION'
                    ? value * 1160 // PPM to µg/m³ conversion for CO
                    : value;
                break;
        }
    }

    return parameters;
}

/**
 * Fetch current air quality conditions for a specific location
 * 
 * @param lat - Latitude
 * @param lon - Longitude
 * @param cityName - City name for display
 * @returns Air quality data or null if error
 */
export async function fetchGoogleAirQuality(
    lat: number,
    lon: number,
    cityName: string,
    region?: string
): Promise<AirQualityData | null> {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        console.warn('Google API key not configured');
        return null;
    }

    try {
        const response = await fetch(
            `${GOOGLE_AIR_QUALITY_API_BASE}/currentConditions:lookup?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    location: {
                        latitude: lat,
                        longitude: lon,
                    },
                    // Request universal AQI and all available pollutants
                    extraComputations: [
                        'HEALTH_RECOMMENDATIONS',
                        'DOMINANT_POLLUTANT_CONCENTRATION',
                        'POLLUTANT_CONCENTRATION',
                        'LOCAL_AQI',
                        'POLLUTANT_ADDITIONAL_INFO',
                    ],
                    languageCode: 'sr', // Serbian language for recommendations
                }),
                next: { revalidate: 600 }, // Cache for 10 minutes
                signal: AbortSignal.timeout(10000), // 10 second timeout
            }
        );

        if (!response.ok) {
            console.error(`Google Air Quality API error: ${response.status} ${response.statusText}`);

            // Log response body for debugging
            const errorText = await response.text();
            console.error('Error details:', errorText);

            return null;
        }

        const data: GoogleAirQualityResponse = await response.json();

        // Extract Universal AQI (preferred index)
        const universalAQI = data.indexes?.find(idx => idx.aqiDisplay === 'UAQI' || idx.category);

        if (!universalAQI || !data.pollutants) {
            console.warn(`Incomplete data from Google API for ${cityName}`);
            return null;
        }

        const parameters = extractPollutants(data.pollutants);
        const aqiCategory = mapGoogleCategoryToAQI(universalAQI.category);

        return {
            id: `google-${cityName.toLowerCase().replace(/\s+/g, '-')}-${lat}-${lon}`,
            location: {
                name: cityName,
                coordinates: [lon, lat], // [longitude, latitude]
                city: cityName,
                region: region || '',
            },
            parameters,
            aqi: universalAQI.aqi,
            aqiCategory,
            source: 'google' as AirQualitySource,
            timestamp: data.dateTime || new Date().toISOString(),
            lastUpdated: data.dateTime,
        };
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error fetching Google air quality for ${cityName}:`, error.message);
        } else {
            console.error(`Error fetching Google air quality for ${cityName}:`, error);
        }
        return null;
    }
}

/**
 * Fetch air quality for multiple cities in parallel
 * 
 * @param cities - Array of cities with coordinates
 * @returns Array of air quality data
 */
export async function fetchGoogleAirQualityBatch(
    cities: Array<{ name: string; lat: number; lon: number; region?: string }>
): Promise<AirQualityData[]> {
    const results: AirQualityData[] = [];

    // Process in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < cities.length; i += batchSize) {
        const batch = cities.slice(i, i + batchSize);

        const batchResults = await Promise.allSettled(
            batch.map(city =>
                fetchGoogleAirQuality(city.lat, city.lon, city.name, city.region)
            )
        );

        // Extract successful results
        for (const result of batchResults) {
            if (result.status === 'fulfilled' && result.value !== null) {
                results.push(result.value);
            }
        }

        // Add a small delay between batches to be respectful of API limits
        if (i + batchSize < cities.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return results;
}

/**
 * Fetch air quality forecast (up to 5 days)
 * 
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Forecast data (can be extended based on needs)
 */
export async function fetchGoogleAirQualityForecast(
    lat: number,
    lon: number
): Promise<GoogleAirQualityResponse[]> {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        console.warn('Google API key not configured');
        return [];
    }

    try {
        const response = await fetch(
            `${GOOGLE_AIR_QUALITY_API_BASE}/forecast:lookup?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    location: {
                        latitude: lat,
                        longitude: lon,
                    },
                    period: {
                        // Request hourly forecast for next 24 hours
                        startTime: new Date().toISOString(),
                        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    },
                    extraComputations: [
                        'HEALTH_RECOMMENDATIONS',
                        'POLLUTANT_CONCENTRATION',
                    ],
                    languageCode: 'sr',
                }),
                next: { revalidate: 3600 }, // Cache for 1 hour
                signal: AbortSignal.timeout(10000),
            }
        );

        if (!response.ok) {
            console.error(`Google Air Quality Forecast API error: ${response.status}`);
            return [];
        }

        const data = await response.json();
        return data.hourlyForecasts || [];
    } catch (error) {
        console.error('Error fetching Google air quality forecast:', error);
        return [];
    }
}
