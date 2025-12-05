import { NextRequest, NextResponse } from 'next/server';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export interface GeocodingResult {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const limit = searchParams.get('limit') || '5';

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required and must be at least 2 characters' },
      { status: 400 }
    );
  }

  if (!OPENWEATHER_API_KEY) {
    return NextResponse.json(
      { error: 'OpenWeather API key not configured' },
      { status: 500 }
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
    console.error('Geocoding API error:', error);
    return NextResponse.json(
      { error: 'Failed to search for cities' },
      { status: 500 }
    );
  }
}
