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
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const reverse = searchParams.get('reverse');

  if (!OPENWEATHER_API_KEY) {
    return NextResponse.json(
      { error: 'OpenWeather API key not configured' },
      { status: 500 }
    );
  }

  // Reverse geocoding - get city name from coordinates
  if (reverse === 'true' && lat && lon) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`,
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
  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required and must be at least 2 characters' },
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
    console.error('Geocoding API error:', error);
    return NextResponse.json(
      { error: 'Failed to search for cities' },
      { status: 500 }
    );
  }
}
