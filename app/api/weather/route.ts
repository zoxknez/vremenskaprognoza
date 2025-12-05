import { NextRequest, NextResponse } from 'next/server';
import { getBalkanWeather, getCityWeather } from '@/lib/api/weather';
import { translateWeatherDescription } from '@/lib/utils/weather-translations';
import { calculateAQI } from '@/lib/utils/aqi';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  
  // Validacija koordinata
  if (lat && lon) {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    
    if (isNaN(latNum) || isNaN(lonNum) || latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      return NextResponse.json(
        { error: 'Neispravne koordinate' },
        { status: 400 }
      );
    }
  }

  try {
    // If lat/lon provided, fetch directly from OpenWeather
    if (lat && lon) {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=en`,
        { next: { revalidate: 300 } } // Cache for 5 minutes
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather from OpenWeather');
      }
      
      const data = await response.json();
      
      // Fetch air quality data
      const aqiResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`,
        { next: { revalidate: 300 } }
      );
      
      let aqiData = null;
      if (aqiResponse.ok) {
        aqiData = await aqiResponse.json();
      }
      
      // Calculate AQI from components
      const components = aqiData?.list?.[0]?.components || {};
      const pm25 = components.pm2_5 || 0;
      const pm10 = components.pm10 || 0;
      
      // Koristi centralizovanu AQI kalkulaciju
      const aqi = calculateAQI(pm25, pm10);

      return NextResponse.json({
        city: city || data.name,
        country: data.sys?.country || 'RS',
        temperature: data.main?.temp,
        feelsLike: data.main?.feels_like,
        humidity: data.main?.humidity,
        pressure: data.main?.pressure,
        windSpeed: data.wind?.speed,
        visibility: data.visibility,
        description: translateWeatherDescription(data.weather?.[0]?.description || 'Nije dostupno'),
        icon: data.weather?.[0]?.icon || '04d',
        aqi: aqi,
        pm25: Math.round(pm25),
        pm10: Math.round(pm10),
        no2: Math.round(components.no2 || 0),
        o3: Math.round(components.o3 || 0),
        co: Math.round(components.co || 0),
      });
    }
    
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
