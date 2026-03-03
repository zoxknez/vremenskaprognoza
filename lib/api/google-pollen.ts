/**
 * Google Pollen API Integration
 * https://developers.google.com/maps/documentation/pollen
 * 
 * Provides pollen data including:
 * - Daily pollen index (0-5 scale)
 * - Tree, grass, and weed pollen levels
 * - 5-day pollen forecast
 * - Plant information and in-season indicators
 * - Health recommendations for allergy sufferers
 */

export type PollenType = 'TREE' | 'GRASS' | 'WEED';
export type PollenIndexLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export interface PlantInfo {
    code: string;
    displayName: string;
    inSeason: boolean;
    type: PollenType;
}

export interface PollenTypeInfo {
    code: PollenType;
    displayName: string;
    indexValue: number; // 0-5
    indexLevel: PollenIndexLevel;
    healthRecommendations?: string[];
    inSeason: boolean;
}

export interface DailyPollenInfo {
    date: string; // ISO date format
    pollenTypes: {
        tree?: PollenTypeInfo;
        grass?: PollenTypeInfo;
        weed?: PollenTypeInfo;
    };
    plants?: PlantInfo[];
}

export interface PollenData {
    location: {
        name: string;
        coordinates: [number, number]; // [lon, lat]
        city: string;
        region?: string;
    };
    daily: DailyPollenInfo[];
    regionCode: string;
    timestamp: string;
}

const GOOGLE_POLLEN_API_BASE = 'https://pollen.googleapis.com/v1';

/**
 * Map Google pollen index (0-5) to level
 */
function mapIndexToLevel(index: number): PollenIndexLevel {
    if (index === 0) return 'NONE';
    if (index <= 1) return 'LOW';
    if (index <= 2) return 'MEDIUM';
    if (index <= 3) return 'HIGH';
    return 'VERY_HIGH';
}

/**
 * Fetch pollen forecast for a specific location
 * 
 * @param lat - Latitude
 * @param lon - Longitude  
 * @param cityName - City name for display
 * @param days - Number of forecast days (1-5)
 * @returns Pollen data or null if error
 */
export async function fetchGooglePollen(
    lat: number,
    lon: number,
    cityName: string,
    region?: string,
    days: number = 5
): Promise<PollenData | null> {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        console.warn('Google API key not configured');
        return null;
    }

    try {
        const response = await fetch(
            `${GOOGLE_POLLEN_API_BASE}/forecast:lookup?key=${apiKey}`,
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
                    days: Math.min(Math.max(days, 1), 5), // Clamp between 1-5
                    languageCode: 'en', // Pollen API supports multiple languages
                    plantsDescription: true, // Include plant info
                }),
                next: { revalidate: 3600 }, // Cache for 1 hour (pollen changes daily)
                signal: AbortSignal.timeout(10000),
            }
        );

        if (!response.ok) {
            console.error(`Google Pollen API error: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error('Error details:', errorText);
            return null;
        }

        const data = await response.json();

        if (!data.dailyInfo || data.dailyInfo.length === 0) {
            console.warn(`No pollen data available for ${cityName}`);
            return null;
        }

        // Parse daily pollen information
        const daily: DailyPollenInfo[] = data.dailyInfo.map((day: any) => {
            const pollenTypes: DailyPollenInfo['pollenTypes'] = {};

            // Extract pollen type information
            if (day.pollenTypeInfo) {
                for (const pollenInfo of day.pollenTypeInfo) {
                    const type = pollenInfo.code as PollenType;
                    const indexValue = pollenInfo.indexInfo?.value || 0;

                    const typeInfo: PollenTypeInfo = {
                        code: type,
                        displayName: pollenInfo.displayName,
                        indexValue,
                        indexLevel: mapIndexToLevel(indexValue),
                        healthRecommendations: pollenInfo.healthRecommendations || [],
                        inSeason: pollenInfo.inSeason || false,
                    };

                    if (type === 'TREE') pollenTypes.tree = typeInfo;
                    else if (type === 'GRASS') pollenTypes.grass = typeInfo;
                    else if (type === 'WEED') pollenTypes.weed = typeInfo;
                }
            }

            // Extract plant information
            const plants: PlantInfo[] = [];
            if (day.plantInfo) {
                for (const plant of day.plantInfo) {
                    plants.push({
                        code: plant.code,
                        displayName: plant.displayName,
                        inSeason: plant.inSeason || false,
                        type: plant.plantDescription?.type || 'TREE',
                    });
                }
            }

            return {
                date: day.date,
                pollenTypes,
                plants,
            };
        });

        return {
            location: {
                name: cityName,
                coordinates: [lon, lat],
                city: cityName,
                region,
            },
            daily,
            regionCode: data.regionCode || 'UNKNOWN',
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error fetching pollen data for ${cityName}:`, error.message);
        } else {
            console.error(`Error fetching pollen data for ${cityName}:`, error);
        }
        return null;
    }
}

/**
 * Fetch pollen data for multiple cities
 */
export async function fetchGooglePollenBatch(
    cities: Array<{ name: string; lat: number; lon: number; region?: string }>
): Promise<PollenData[]> {
    const results: PollenData[] = [];

    // Process in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < cities.length; i += batchSize) {
        const batch = cities.slice(i, i + batchSize);

        const batchResults = await Promise.allSettled(
            batch.map(city =>
                fetchGooglePollen(city.lat, city.lon, city.name, city.region)
            )
        );

        for (const result of batchResults) {
            if (result.status === 'fulfilled' && result.value !== null) {
                results.push(result.value);
            }
        }

        // Small delay between batches
        if (i + batchSize < cities.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return results;
}

/**
 * Get color for pollen level (for UI)
 */
export function getPollenLevelColor(level: PollenIndexLevel): {
    bg: string;
    text: string;
    border: string;
} {
    switch (level) {
        case 'NONE':
            return {
                bg: 'bg-slate-500/10',
                text: 'text-slate-600 dark:text-slate-400',
                border: 'border-gray-500/20',
            };
        case 'LOW':
            return {
                bg: 'bg-green-500/10',
                text: 'text-green-600 dark:text-green-400',
                border: 'border-green-500/20',
            };
        case 'MEDIUM':
            return {
                bg: 'bg-yellow-500/10',
                text: 'text-yellow-600 dark:text-yellow-400',
                border: 'border-yellow-500/20',
            };
        case 'HIGH':
            return {
                bg: 'bg-orange-500/10',
                text: 'text-orange-600 dark:text-orange-400',
                border: 'border-orange-500/20',
            };
        case 'VERY_HIGH':
            return {
                bg: 'bg-red-500/10',
                text: 'text-red-600 dark:text-red-400',
                border: 'border-red-500/20',
            };
    }
}

