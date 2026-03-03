/**
 * Google Solar API / Weather Data
 * Provides UV index and other weather-related environmental data
 * 
 * Note: Google doesn't have a dedicated "Weather API" but UV index data
 * is available through the Solar API
 */

export interface UVIndexData {
    location: {
        name: string;
        coordinates: [number, number]; // [lon, lat]
        city: string;
        region?: string;
    };
    current: {
        uvIndex: number; // 0-11+ scale
        level: 'low' | 'moderate' | 'high' | 'very_high' | 'extreme';
        time: string;
    };
    forecast?: Array<{
        date: string;
        maxUV: number;
        level: 'low' | 'moderate' | 'high' | 'very_high' | 'extreme';
    }>;
    sunInfo?: {
        sunrise: string;
        sunset: string;
        solarNoon: string;
    };
    recommendations: {
        protection: string;
        explanation: string;
    };
    timestamp: string;
}

/**
 * Map UV index to level
 * Based on WHO/EPA standards
 */
function mapUVIndexToLevel(uvIndex: number): 'low' | 'moderate' | 'high' | 'very_high' | 'extreme' {
    if (uvIndex < 3) return 'low';
    if (uvIndex < 6) return 'moderate';
    if (uvIndex < 8) return 'high';
    if (uvIndex < 11) return 'very_high';
    return 'extreme';
}

/**
 * Get UV protection recommendations based on UV index
 */
function getUVRecommendations(uvIndex: number, level: string): {
    protection: string;
    explanation: string;
} {
    switch (level) {
        case 'low':
            return {
                protection: 'Minimal protection required',
                explanation: 'Wear sunglasses on bright days. If outside for more than 1 hour, apply SPF 15+ sunscreen.',
            };
        case 'moderate':
            return {
                protection: 'Protection required',
                explanation: 'Wear sunglasses and use SPF 30+ sunscreen. Seek shade during midday hours.',
            };
        case 'high':
            return {
                protection: 'Extra protection required',
                explanation: 'Wear sunglasses, protective clothing, and SPF 30+ sunscreen. Reduce time in sun between 10am-4pm.',
            };
        case 'very_high':
            return {
                protection: 'Special protection required',
                explanation: 'Avoid sun exposure between 10am-4pm. Wear protective clothing, sunglasses, and SPF 50+ sunscreen.',
            };
        case 'extreme':
            return {
                protection: 'Maximum protection required',
                explanation: 'Avoid outdoor activities during midday. Stay in shade. Full protective clothing and SPF 50+ required.',
            };
        default:
            return {
                protection: 'Check UV index',
                explanation: 'Monitor current UV levels and take appropriate precautions.',
            };
    }
}

/**
 * Fetch UV index data for a location
 * 
 * Note: Since Google doesn't have a dedicated UV API endpoint yet,
 * we'll use a combination of available data or fallback to OpenWeather
 * 
 * For now, this uses OpenWeather's free UV index API
 * TODO: Replace with Google Solar API once UV index is available
 */
export async function fetchGoogleUVIndex(
    lat: number,
    lon: number,
    cityName: string,
    region?: string
): Promise<UVIndexData | null> {
    // For now, use OpenWeather as they have UV index
    const openWeatherKey = process.env.OPENWEATHER_API_KEY;

    if (!openWeatherKey) {
        console.warn('OpenWeather API key not configured for UV index');
        return null;
    }

    try {
        // Fetch current UV index from OpenWeather
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${openWeatherKey}`,
            {
                next: { revalidate: 1800 }, // Cache for 30 minutes
                signal: AbortSignal.timeout(10000),
            }
        );

        if (!response.ok) {
            console.error(`UV Index API error: ${response.status}`);
            return null;
        }

        const data = await response.json();
        const uvIndex = data.value || 0;
        const level = mapUVIndexToLevel(uvIndex);
        const recommendations = getUVRecommendations(uvIndex, level);

        // Fetch UV forecast (if available)
        let forecast: NonNullable<UVIndexData['forecast']> = [];
        try {
            const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/uvi/forecast?lat=${lat}&lon=${lon}&cnt=5&appid=${openWeatherKey}`,
                {
                    next: { revalidate: 3600 },
                    signal: AbortSignal.timeout(10000),
                }
            );

            if (forecastResponse.ok) {
                const forecastData = await forecastResponse.json();
                if (Array.isArray(forecastData)) {
                    forecast = forecastData.map((item: { date?: number; value?: number }) => ({
                        date: new Date((item.date || 0) * 1000).toISOString(),
                        maxUV: item.value || 0,
                        level: mapUVIndexToLevel(item.value || 0),
                    }));
                }
            }
        } catch {
            // Forecast is optional
            console.warn('UV forecast not available');
        }

        return {
            location: {
                name: cityName,
                coordinates: [lon, lat],
                city: cityName,
                region,
            },
            current: {
                uvIndex,
                level,
                time: new Date(data.date * 1000).toISOString(),
            },
            forecast: forecast.length > 0 ? forecast : undefined,
            recommendations,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error(`Error fetching UV index for ${cityName}:`, error);
        return null;
    }
}

/**
 * Fetch UV index for multiple cities
 */
export async function fetchGoogleUVIndexBatch(
    cities: Array<{ name: string; lat: number; lon: number; region?: string }>
): Promise<UVIndexData[]> {
    const results: UVIndexData[] = [];

    const batchSize = 5;
    for (let i = 0; i < cities.length; i += batchSize) {
        const batch = cities.slice(i, i + batchSize);

        const batchResults = await Promise.allSettled(
            batch.map(city =>
                fetchGoogleUVIndex(city.lat, city.lon, city.name, city.region)
            )
        );

        for (const result of batchResults) {
            if (result.status === 'fulfilled' && result.value !== null) {
                results.push(result.value);
            }
        }

        if (i + batchSize < cities.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return results;
}

/**
 * Get color for UV level (for UI)
 */
export function getUVLevelColor(level: string): {
    bg: string;
    text: string;
    border: string;
} {
    switch (level) {
        case 'low':
            return {
                bg: 'bg-green-500/10',
                text: 'text-green-600 dark:text-green-400',
                border: 'border-green-500/20',
            };
        case 'moderate':
            return {
                bg: 'bg-yellow-500/10',
                text: 'text-yellow-600 dark:text-yellow-400',
                border: 'border-yellow-500/20',
            };
        case 'high':
            return {
                bg: 'bg-orange-500/10',
                text: 'text-orange-600 dark:text-orange-400',
                border: 'border-orange-500/20',
            };
        case 'very_high':
            return {
                bg: 'bg-red-500/10',
                text: 'text-red-600 dark:text-red-400',
                border: 'border-red-500/20',
            };
        case 'extreme':
            return {
                bg: 'bg-purple-500/10',
                text: 'text-purple-600 dark:text-purple-400',
                border: 'border-purple-500/20',
            };
        default:
            return {
                bg: 'bg-slate-500/10',
                text: 'text-slate-600 dark:text-slate-400',
                border: 'border-slate-500/20',
            };
    }
}
