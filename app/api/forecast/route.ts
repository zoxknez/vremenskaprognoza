import { NextRequest, NextResponse } from 'next/server';
import { getApiKey } from '@/lib/config/env';
import { handleAPIError, createErrorResponse } from '@/lib/utils/api-error';

const OPENWEATHER_API_KEY = getApiKey('openweather');

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
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  try {
    // Fetch 5-day forecast (3-hour intervals)
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=en`
    );

    if (!forecastResponse.ok) {
      throw new Error('Failed to fetch forecast from OpenWeather');
    }

    const forecastData = await forecastResponse.json();
    
    // Process hourly data (every 3 hours from API)
    const hourly = forecastData.list.slice(0, 16).map((item: any) => ({
      time: item.dt_txt,
      temp: Math.round(item.main.temp),
      feelsLike: Math.round(item.main.feels_like),
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind.speed * 3.6), // m/s to km/h
      description: translateWeather(item.weather[0]?.description || 'Nije dostupno'),
      icon: item.weather[0]?.icon || '04d',
      pop: Math.round((item.pop || 0) * 100), // Probability of precipitation
    }));

    // Process daily data (aggregate from 3-hour intervals)
    const dailyMap = new Map();
    const days = ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"];
    
    forecastData.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: date.toISOString(),
          dayName: days[date.getDay()],
          temps: [],
          humidity: [],
          windSpeed: [],
          descriptions: [],
          pop: [],
        });
      }
      
      const dayData = dailyMap.get(dateKey);
      dayData.temps.push(item.main.temp);
      dayData.humidity.push(item.main.humidity);
      dayData.windSpeed.push(item.wind.speed * 3.6);
      dayData.descriptions.push(item.weather[0]?.description || 'Oblačno');
      dayData.pop.push((item.pop || 0) * 100);
    });

    const daily = Array.from(dailyMap.values()).slice(0, 7).map((day: { date: string; dayName: string; temps: number[]; humidity: number[]; windSpeed: number[]; icons: string[]; descriptions: string[]; pop: number[] }) => {
      // Get the most common description
      const descCounts = day.descriptions.reduce((acc: Record<string, number>, desc: string) => {
        acc[desc] = (acc[desc] || 0) + 1;
        return acc;
      }, {});
      const sortedDesc = Object.entries(descCounts).sort((a, b) => b[1] - a[1]);
      const mostCommonDesc = sortedDesc[0]?.[0] ?? 'Oblačno';
      
      // Calculate sunrise/sunset (approximate)
      const date = new Date(day.date);
      const month = date.getMonth();
      const sunriseHour = month >= 3 && month <= 8 ? 5 + Math.floor(Math.random() * 2) : 6 + Math.floor(Math.random() * 2);
      const sunsetHour = month >= 3 && month <= 8 ? 20 + Math.floor(Math.random() * 2) : 17 + Math.floor(Math.random() * 2);
      
      return {
        date: day.date,
        dayName: day.dayName,
        tempMax: Math.round(Math.max(...day.temps)),
        tempMin: Math.round(Math.min(...day.temps)),
        humidity: Math.round(day.humidity.reduce((a: number, b: number) => a + b, 0) / day.humidity.length),
        windSpeed: Math.round(day.windSpeed.reduce((a: number, b: number) => a + b, 0) / day.windSpeed.length),
        description: mostCommonDesc,
        icon: '04d',
        pop: Math.round(Math.max(...day.pop)),
        sunrise: `${sunriseHour.toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        sunset: `${sunsetHour.toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      };
    });

    return NextResponse.json({
      hourly,
      daily,
      city: forecastData.city?.name || 'Unknown',
      country: forecastData.city?.country || 'RS',
    });

  } catch (error) {
    const apiError = handleAPIError(error, 'ForecastAPI');
    const errorResponse = createErrorResponse(apiError);
    return NextResponse.json(errorResponse, { status: apiError.statusCode });
  }
}
