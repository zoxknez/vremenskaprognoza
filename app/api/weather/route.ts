import { NextRequest, NextResponse } from 'next/server';
import { getBalkanWeather, getCityWeather } from '@/lib/api/weather';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get('city');

  try {
    if (city) {
      // Get weather for specific city
      const weather = await getCityWeather(city);
      
      if (!weather) {
        return NextResponse.json(
          { error: 'City not found or weather data unavailable' },
          { status: 404 }
        );
      }

      return NextResponse.json(weather);
    } else {
      // Get weather for all Balkan cities
      const weather = await getBalkanWeather();
      return NextResponse.json(weather);
    }
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
