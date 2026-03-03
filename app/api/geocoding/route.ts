import { NextRequest, NextResponse } from 'next/server';
import { getApiKey } from '@/lib/config/env';
import { handleAPIError, createErrorResponse } from '@/lib/utils/api-error';
import { coordinatesSchema } from '@/lib/utils/validation';
import { enforceRateLimit, requireSameOrigin } from '@/lib/utils/request-security';

const OPENWEATHER_API_KEY = getApiKey('openweather');

export interface GeocodingResult {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export async function GET(request: NextRequest) {
  const sameOriginError = requireSameOrigin(request);
  if (sameOriginError) {
    return sameOriginError;
  }

  const rateLimitError = await enforceRateLimit(request, {
    prefix: 'api:geocoding',
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const parsedLimit = Number.parseInt(searchParams.get('limit') || '5', 10);
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 10)
    : 5;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const reverse = searchParams.get('reverse');

  if (!OPENWEATHER_API_KEY) {
    return NextResponse.json(
      { error: 'OpenWeather API key not configured' },
      { status: 503 }
    );
  }

  // Reverse geocoding - get city name from coordinates
  const wantsReverse = (reverse === 'true' || (!query && lat && lon)) && lat && lon;
  if (wantsReverse) {
    const coordinates = coordinatesSchema.safeParse({ lat, lon });
    if (!coordinates.success) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    const { lat: latitude, lon: longitude } = coordinates.data;
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`,
        { next: { revalidate: 3600 } }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch from OpenWeather Reverse Geocoding API');
      }

      const data: GeocodingResult[] = await response.json();

      if (data.length === 0) {
        return NextResponse.json({ city: 'Nepoznata lokacija', country: 'RS' });
      }

      const item = data[0];
      return NextResponse.json({
        city: item.local_names?.sr || item.local_names?.hr || item.local_names?.bs || item.name,
        name: item.name,
        country: item.country,
        state: item.state,
        lat: item.lat,
        lon: item.lon,
      });
    } catch (error) {
      console.error('Reverse Geocoding API error:', error);
      return NextResponse.json(
        { error: 'Failed to get location name' },
        { status: 500 }
      );
    }
  }

  // Forward geocoding - search by city name
  if (!query || query.length < 2 || query.length > 120) {
    return NextResponse.json(
      { error: 'Query parameter "q" must be between 2 and 120 characters' },
      { status: 400 }
    );
  }

  try {
    // OpenWeather Geocoding API
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${OPENWEATHER_API_KEY}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from OpenWeather Geocoding API');
    }

    const data: GeocodingResult[] = await response.json();

    // Transform results to our format
    const results = data.map((item) => ({
      name: item.local_names?.sr || item.local_names?.hr || item.local_names?.bs || item.name,
      nameEn: item.name,
      lat: item.lat,
      lon: item.lon,
      country: item.country,
      state: item.state,
      displayName: item.state 
        ? `${item.local_names?.sr || item.name}, ${item.state}, ${item.country}`
        : `${item.local_names?.sr || item.name}, ${item.country}`,
    }));

    return NextResponse.json({
      results,
      query,
      count: results.length,
    });
  } catch (error) {
    const apiError = handleAPIError(error, 'GeocodingAPI');
    const errorResponse = createErrorResponse(apiError);
    return NextResponse.json(errorResponse, { status: apiError.statusCode });
  }
}
