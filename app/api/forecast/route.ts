import { NextRequest, NextResponse } from 'next/server';
import { getComprehensiveWeather, getBalkanWeatherForecast } from '@/lib/api/weather-forecast';
import { BALKAN_COUNTRIES } from '@/lib/api/balkan-countries';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const all = searchParams.get('all');

  try {
    // Get all Balkan capitals
    if (all === 'true') {
      const weather = await getBalkanWeatherForecast();
      return NextResponse.json(weather);
    }

    // Get by coordinates
    if (lat && lon) {
      const weather = await getComprehensiveWeather(
        parseFloat(lat),
        parseFloat(lon),
        city || 'Unknown'
      );

      if (!weather) {
        return NextResponse.json(
          { error: 'Weather data unavailable' },
          { status: 404 }
        );
      }

      return NextResponse.json(weather);
    }

    // Get by city name
    if (city) {
      // Find city in our database
      for (const country of Object.values(BALKAN_COUNTRIES)) {
        const foundCity = country.cities.find(
          (c) => c.name.toLowerCase() === city.toLowerCase()
        );
        if (foundCity) {
          const weather = await getComprehensiveWeather(
            foundCity.lat,
            foundCity.lon,
            foundCity.name
          );

          if (!weather) {
            return NextResponse.json(
              { error: 'Weather data unavailable' },
              { status: 404 }
            );
          }

          return NextResponse.json(weather);
        }
      }

      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }

    // Default: Return weather for Belgrade
    const weather = await getComprehensiveWeather(44.8178, 20.4568, 'Beograd');
    return NextResponse.json(weather);

  } catch (error) {
    console.error('Forecast API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather forecast' },
      { status: 500 }
    );
  }
}
