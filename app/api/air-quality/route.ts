import { NextRequest, NextResponse } from 'next/server';
import { fetchAllAirQualityData } from '@/lib/api/aggregate';
import { calculateAQI } from '@/lib/utils/aqi';
import { getApiKey } from '@/lib/config/env';
import { airQualityQuerySchema, parseQueryParams, formatZodErrors } from '@/lib/utils/validation';
import { enforceRateLimit, requireSameOrigin } from '@/lib/utils/request-security';

const OPENWEATHER_API_KEY = getApiKey('openweather');

export async function GET(request: NextRequest) {
  const sameOriginError = requireSameOrigin(request);
  if (sameOriginError) {
    return sameOriginError;
  }

  const rateLimitError = await enforceRateLimit(request, {
    prefix: 'api:air-quality',
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  const searchParams = request.nextUrl.searchParams;

  // Zod validacija parametara
  const parseResult = parseQueryParams(searchParams, airQualityQuerySchema);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Neispravni parametri', details: formatZodErrors(parseResult.error) },
      { status: 400 }
    );
  }

  const { lat, lon } = parseResult.data;

  try {
    // If lat/lon provided, fetch air quality for specific location
    if (lat && lon) {
      if (!OPENWEATHER_API_KEY) {
        return NextResponse.json(
          { error: 'OpenWeather API key not configured' },
          { status: 503 }
        );
      }

      const aqiResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`
      );

      if (!aqiResponse.ok) {
        throw new Error('Failed to fetch air quality from OpenWeather');
      }

      const aqiData = await aqiResponse.json();
      const components = aqiData?.list?.[0]?.components || {};
      const pm25 = components.pm2_5 || 0;
      const pm10 = components.pm10 || 0;

      // Koristi centralizovanu AQI kalkulaciju
      const aqi = calculateAQI(pm25, pm10);

      return NextResponse.json({
        aqi: Math.max(aqi, 1),
        pm25: Math.round(pm25),
        pm10: Math.round(pm10),
        no2: Math.round(components.no2 || 0),
        o3: Math.round(components.o3 || 0),
        co: Math.round(components.co || 0),
        so2: Math.round(components.so2 || 0),
        nh3: Math.round(components.nh3 || 0),
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      });
    }

    // Default: fetch all air quality data
    const data = await fetchAllAirQualityData();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch air quality data' },
      { status: 500 }
    );
  }
}

