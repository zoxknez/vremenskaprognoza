import { NextRequest, NextResponse } from 'next/server';
import { getBalkanWeather, getCityWeather } from '@/lib/api/weather';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// Prevodi vremenske opise na srpski latinica
const weatherTranslations: Record<string, string> = {
  'clear sky': 'Vedro nebo',
  'few clouds': 'Malo oblaka',
  'scattered clouds': 'Rasuti oblaci',
  'broken clouds': 'Isprekidani oblaci',
  'shower rain': 'Pljusak',
  'rain': 'Kisa',
  'light rain': 'Slaba kisa',
  'moderate rain': 'Umerena kisa',
  'heavy rain': 'Jaka kisa',
  'thunderstorm': 'Grmljavina',
  'snow': 'Sneg',
  'light snow': 'Slab sneg',
  'heavy snow': 'Jak sneg',
  'mist': 'Magla',
  'fog': 'Gusta magla',
  'haze': 'Sumaglica',
  'smoke': 'Dim',
  'dust': 'Prasina',
  'sand': 'Pesak',
  'overcast clouds': 'Oblacno',
  'drizzle': 'Rosulja',
  'light intensity drizzle': 'Slaba rosulja',
  'freezing rain': 'Ledena kisa',
  'sleet': 'Susnjezica',
};

function translateWeather(description: string): string {
  const lower = description.toLowerCase();
  return weatherTranslations[lower] || description;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  try {
    // If lat/lon provided, fetch directly from OpenWeather
    if (lat && lon) {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=en`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather from OpenWeather');
      }
      
      const data = await response.json();
      
      // Fetch air quality data
      const aqiResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`
      );
      
      let aqiData = null;
      if (aqiResponse.ok) {
        aqiData = await aqiResponse.json();
      }
      
      // Calculate AQI from components (approximate conversion)
      const components = aqiData?.list?.[0]?.components || {};
      const pm25 = components.pm2_5 || 0;
      const pm10 = components.pm10 || 0;
      
      // Simple AQI calculation based on PM2.5 (US EPA standard)
      let aqi = 50;
      if (pm25 <= 12) aqi = Math.round((50 / 12) * pm25);
      else if (pm25 <= 35.4) aqi = Math.round(50 + (50 / 23.4) * (pm25 - 12));
      else if (pm25 <= 55.4) aqi = Math.round(100 + (50 / 20) * (pm25 - 35.4));
      else if (pm25 <= 150.4) aqi = Math.round(150 + (50 / 95) * (pm25 - 55.4));
      else if (pm25 <= 250.4) aqi = Math.round(200 + (100 / 100) * (pm25 - 150.4));
      else aqi = Math.round(300 + (100 / 150) * (pm25 - 250.4));

      return NextResponse.json({
        city: city || data.name,
        country: data.sys?.country || 'RS',
        temperature: data.main?.temp,
        feelsLike: data.main?.feels_like,
        humidity: data.main?.humidity,
        pressure: data.main?.pressure,
        windSpeed: data.wind?.speed,
        visibility: data.visibility,
        description: translateWeather(data.weather?.[0]?.description || 'Nije dostupno'),
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
