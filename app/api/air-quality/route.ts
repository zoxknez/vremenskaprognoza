import { NextRequest, NextResponse } from 'next/server';
import { fetchAllAirQualityData } from '@/lib/api/aggregate';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  try {
    // If lat/lon provided, fetch air quality for specific location
    if (lat && lon) {
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
      
      // Calculate AQI from PM2.5 (US EPA standard)
      let aqi = 50;
      if (pm25 <= 12) aqi = Math.round((50 / 12) * pm25);
      else if (pm25 <= 35.4) aqi = Math.round(50 + (50 / 23.4) * (pm25 - 12));
      else if (pm25 <= 55.4) aqi = Math.round(100 + (50 / 20) * (pm25 - 35.4));
      else if (pm25 <= 150.4) aqi = Math.round(150 + (50 / 95) * (pm25 - 55.4));
      else if (pm25 <= 250.4) aqi = Math.round(200 + (100 / 100) * (pm25 - 150.4));
      else aqi = Math.round(300 + (100 / 150) * (pm25 - 250.4));

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

