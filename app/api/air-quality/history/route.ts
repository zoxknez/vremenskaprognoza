import { NextRequest, NextResponse } from 'next/server';
import { coordinatesSchema } from '@/lib/utils/validation';
import { getAQILabel } from '@/lib/utils/aqi';

/**
 * API endpoint for AQI history data
 * Returns 24-hour historical AQI data for a location
 * 
 * Note: OpenWeather Air Pollution API provides current and forecast data.
 * For true historical data, a paid API subscription is required.
 * This endpoint returns forecast data as a reasonable approximation.
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    // Validate coordinates
    const validation = coordinatesSchema.safeParse({ lat, lon });
    if (!validation.success) {
        return NextResponse.json(
            { error: 'Nedostaju koordinate (lat, lon)' },
            { status: 400 }
        );
    }

    const { lat: latitude, lon: longitude } = validation.data;

    try {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            throw new Error('OpenWeather API key not configured');
        }

        // Fetch air pollution forecast (provides 5-day hourly data)
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`,
            { next: { revalidate: 1800 } } // Cache for 30 minutes
        );

        if (!response.ok) {
            throw new Error('Failed to fetch air quality data');
        }

        const data = await response.json();

        if (!data.list || data.list.length === 0) {
            return NextResponse.json({ history: [] });
        }

        // Take last 24 hours of data (or first 24 entries from forecast)
        const now = Date.now();
        const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

        // Filter for recent data and take 24 entries
        const recentData = data.list
            .filter((item: any) => item.dt * 1000 >= twentyFourHoursAgo)
            .slice(0, 24);

        // If not enough recent data, use first 24 entries from forecast
        const entries = recentData.length >= 24 ? recentData : data.list.slice(0, 24);

        // Calculate AQI from PM2.5 (simplified US EPA calculation)
        const history = entries.map((item: any) => {
            const pm25 = item.components?.pm2_5 || 0;
            const aqi = calculateSimpleAQI(pm25);
            const time = new Date(item.dt * 1000);

            return {
                time: time.getHours().toString().padStart(2, '0') + ':00',
                aqi: Math.round(aqi),
                label: getAQILabel(aqi),
                timestamp: item.dt,
            };
        });

        return NextResponse.json({
            history,
            location: { lat: latitude, lon: longitude },
            generatedAt: new Date().toISOString(),
        });

    } catch (error) {
        console.error('AQI History API error:', error);

        // Return empty array on error instead of mock data
        return NextResponse.json({
            history: [],
            error: 'Nije moguće učitati istorijske podatke',
        });
    }
}

/**
 * Simplified AQI calculation from PM2.5
 * Based on US EPA breakpoints
 */
function calculateSimpleAQI(pm25: number): number {
    if (pm25 <= 12) return (pm25 / 12) * 50;
    if (pm25 <= 35.4) return 50 + ((pm25 - 12) / 23.4) * 50;
    if (pm25 <= 55.4) return 100 + ((pm25 - 35.4) / 20) * 50;
    if (pm25 <= 150.4) return 150 + ((pm25 - 55.4) / 95) * 50;
    if (pm25 <= 250.4) return 200 + ((pm25 - 150.4) / 100) * 100;
    if (pm25 <= 350.4) return 300 + ((pm25 - 250.4) / 100) * 100;
    return 400 + ((pm25 - 350.4) / 150) * 100;
}
