import { NextRequest, NextResponse } from 'next/server';
import { getBalkanWeather } from '@/lib/api/weather';
import { translateWeatherDescription } from '@/lib/utils/weather-translations';
import { calculateAQI } from '@/lib/utils/aqi';
import { BALKAN_COUNTRIES } from '@/lib/api/balkan-countries';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get('city');
  let lat = searchParams.get('lat');
  let lon = searchParams.get('lon');
  
  // If city is provided but no coordinates, try to find them
  if (city && (!lat || !lon)) {
    // 1. Try to find in local database
    let found = false;
    for (const country of Object.values(BALKAN_COUNTRIES)) {
      const cityData = country.cities.find(c => c.name.toLowerCase() === city.toLowerCase());
      if (cityData) {
        lat = cityData.lat.toString();
        lon = cityData.lon.toString();
        found = true;
        break;
      }
    }

    // 2. If not found, try Geocoding API
    if (!found && OPENWEATHER_API_KEY) {
      try {
        const geoResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_API_KEY}`
        );
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.length > 0) {
            lat = geoData[0].lat.toString();
            lon = geoData[0].lon.toString();
          }
        }
      } catch (e) {
        console.error('Geocoding error:', e);
      }
    }
  }

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
    // If lat/lon provided (or resolved from city), fetch directly from OpenWeather
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

      // Calculate dispersion
      let dispersionStatus: 'good' | 'moderate' | 'poor' = 'moderate';
      let dispersionReason = '';
      let pollutionRisk: 'low' | 'medium' | 'high' = 'medium';
      
      const windSpeed = data.wind?.speed || 0;
      const temp = data.main?.temp || 0;
      const humidity = data.main?.humidity || 0;
      const weatherDesc = (data.weather?.[0]?.description || '').toLowerCase();

      if (windSpeed > 5) {
        dispersionStatus = 'good';
        dispersionReason = 'Jak vetar pomaže raspršivanju zagađivača';
        pollutionRisk = 'low';
      } else if (windSpeed < 2) {
        dispersionStatus = 'poor';
        dispersionReason = 'Slab vetar dovodi do nakupljanja zagađenja';
        pollutionRisk = 'high';
      }

      if (temp < 5 && windSpeed < 3) {
        dispersionStatus = 'poor';
        dispersionReason = 'Hladnoća i slab vetar zadržavaju zagađenje pri tlu';
        pollutionRisk = 'high';
      }

      if (humidity > 85 && windSpeed < 3) {
        dispersionStatus = 'poor';
        dispersionReason = 'Visoka vlažnost i slab vetar pogoduju stvaranju smoga';
        pollutionRisk = 'high';
      }

      if (weatherDesc.includes('rain') || weatherDesc.includes('kiša')) {
        dispersionStatus = 'good';
        dispersionReason = 'Kiša ispire zagađivače iz atmosfere';
        pollutionRisk = 'low';
      }

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
        so2: Math.round(components.so2 || 0),
        o3: Math.round(components.o3 || 0),
        co: Math.round(components.co || 0),
        dispersion: {
          status: dispersionStatus,
          reason: dispersionReason,
          risk: pollutionRisk
        }
      });
    }
    
    // Fallback for home page list (no specific city/coords)
    const weather = await getBalkanWeather();
    return NextResponse.json(weather);

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
