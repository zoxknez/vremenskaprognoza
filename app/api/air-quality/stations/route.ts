import { NextRequest, NextResponse } from 'next/server';
import { coordinatesSchema } from '@/lib/utils/validation';
import { getAQILabel, getAQICategory, calculateAQIFromPM25 } from '@/lib/utils/aqi';
import { calculateDistance } from '@/lib/utils/geo';
import { enforceRateLimit, requireSameOrigin } from '@/lib/utils/request-security';

/**
 * API endpoint for nearby air quality monitoring stations
 * Returns stations within a specified radius with their current AQI
 */
export async function GET(request: NextRequest) {
    const sameOriginError = requireSameOrigin(request);
    if (sameOriginError) {
        return sameOriginError;
    }

    const rateLimitError = await enforceRateLimit(request, {
        prefix: 'api:air-quality-stations',
        limit: 90,
        windowMs: 60 * 1000,
    });
    if (rateLimitError) {
        return rateLimitError;
    }

    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const radiusParam = searchParams.get('radius');

    // Validate coordinates
    const validation = coordinatesSchema.safeParse({ lat, lon });
    if (!validation.success) {
        return NextResponse.json(
            { error: 'Nedostaju koordinate (lat, lon)' },
            { status: 400 }
        );
    }

    const { lat: latitude, lon: longitude } = validation.data;
    const parsedRadius = radiusParam ? parseFloat(radiusParam) : 50;
    const radius = Number.isFinite(parsedRadius) && parsedRadius > 0 ? Math.min(parsedRadius, 100) : 50; // Default 50km radius

    try {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            throw new Error('OpenWeather API key not configured');
        }

        // Create a grid of points around the location to simulate nearby stations
        // In production, this would query a real stations database
        const gridPoints = generateGridPoints(latitude, longitude, radius, 5);

        // Fetch air quality for each point
        const stationsPromises = gridPoints.map(async (point, index) => {
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${point.lat}&lon=${point.lon}&appid=${apiKey}`,
                    { next: { revalidate: 600 } } // Cache for 10 minutes
                );

                if (!response.ok) return null;

                const data = await response.json();
                const pm25 = data.list?.[0]?.components?.pm2_5 || 0;
                const aqi = calculateAQIFromPM25(pm25);
                const distance = calculateDistance(latitude, longitude, point.lat, point.lon);

                // Generate realistic station names based on direction
                const direction = getDirection(latitude, longitude, point.lat, point.lon);

                return {
                    id: `station-${index}`,
                    name: `Stanica ${direction}`,
                    distance: Math.round(distance * 10) / 10,
                    aqi: Math.round(aqi),
                    label: getAQILabel(aqi),
                    category: getAQICategory(aqi),
                    lat: point.lat,
                    lon: point.lon,
                    pm25: Math.round(pm25 * 10) / 10,
                };
            } catch {
                return null;
            }
        });

        const stations = (await Promise.all(stationsPromises))
            .filter((s): s is NonNullable<typeof s> => s !== null)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5); // Return closest 5 stations

        return NextResponse.json({
            stations,
            center: { lat: latitude, lon: longitude },
            radius,
            count: stations.length,
            generatedAt: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Nearby Stations API error:', error);

        return NextResponse.json({
            stations: [],
            error: 'Nije moguće učitati podatke o stanicama',
        }, { status: 500 });
    }
}

/**
 * Generate grid points around a center location
 */
function generateGridPoints(
    centerLat: number,
    centerLon: number,
    radiusKm: number,
    count: number
): { lat: number; lon: number }[] {
    const points: { lat: number; lon: number }[] = [];

    // Convert km to degrees (approximately)
    const latOffset = radiusKm / 111; // 1 degree latitude ≈ 111km
    const lonOffset = radiusKm / (111 * Math.cos(centerLat * Math.PI / 180));

    // Generate points in different directions
    const directions = [
        { lat: latOffset * 0.3, lon: lonOffset * 0.5 },   // NE
        { lat: latOffset * 0.3, lon: -lonOffset * 0.4 },  // NW
        { lat: -latOffset * 0.4, lon: lonOffset * 0.3 },  // SE
        { lat: -latOffset * 0.5, lon: -lonOffset * 0.2 }, // SW
        { lat: latOffset * 0.6, lon: 0 },                  // N
    ];

    for (let i = 0; i < Math.min(count, directions.length); i++) {
        points.push({
            lat: centerLat + directions[i].lat,
            lon: centerLon + directions[i].lon,
        });
    }

    return points;
}

/**
 * Get cardinal direction from center to point
 */
function getDirection(
    centerLat: number,
    centerLon: number,
    pointLat: number,
    pointLon: number
): string {
    const latDiff = pointLat - centerLat;
    const lonDiff = pointLon - centerLon;

    const isNorth = latDiff > 0.01;
    const isSouth = latDiff < -0.01;
    const isEast = lonDiff > 0.01;
    const isWest = lonDiff < -0.01;

    if (isNorth && isEast) return 'Severoistok';
    if (isNorth && isWest) return 'Severozapad';
    if (isSouth && isEast) return 'Jugoistok';
    if (isSouth && isWest) return 'Jugozapad';
    if (isNorth) return 'Sever';
    if (isSouth) return 'Jug';
    if (isEast) return 'Istok';
    if (isWest) return 'Zapad';
    return 'Centar';
}

