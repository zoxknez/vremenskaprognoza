import { NextRequest, NextResponse } from 'next/server';
import { getBalkanWeather } from '@/lib/api/weather';
import { translateWeatherDescription } from '@/lib/utils/weather-translations';
import { calculateAQI } from '@/lib/utils/aqi';
import { BALKAN_COUNTRIES } from '@/lib/api/balkan-countries';
import { getApiKey } from '@/lib/config/env';
import { handleAPIError, createErrorResponse } from '@/lib/utils/api-error';

const OPENWEATHER_API_KEY = getApiKey('openweather');

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
      let hasRealAQIData = false;
      if (aqiResponse.ok) {
        aqiData = await aqiResponse.json();
        const components = aqiData?.list?.[0]?.components;
        
        // OpenWeather Air Pollution API vraća INTERPOLIRANE podatke čak i za mesta bez stanica!
        // ODBACUJEMO SVE interpolirane podatke - prikazujemo SAMO podatke sa pravih mernih stanica
        // Lista poznatih mernih stanica u Srbiji (OpenAQ, SEPA, itd.)
        const KNOWN_STATIONS = [
          { name: 'Beograd', lat: 44.8176, lon: 20.4633 },
          { name: 'Novi Sad', lat: 45.2671, lon: 19.8335 },
          { name: 'Niš', lat: 43.3209, lon: 21.8957 },
          { name: 'Kragujevac', lat: 44.0128, lon: 20.9164 },
          { name: 'Subotica', lat: 46.1000, lon: 19.6667 },
          { name: 'Smederevo', lat: 44.6628, lon: 20.9269 },
          { name: 'Pančevo', lat: 44.8738, lon: 20.6517 },
          { name: 'Užice', lat: 43.8586, lon: 19.8425 },
          { name: 'Valjevo', lat: 44.2747, lon: 19.8903 },
          { name: 'Kraljevo', lat: 43.7257, lon: 20.6897 },
        ];
        
        // Računamo udaljenost do najbliže poznate stanice (Haversine formula)
        const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
          const R = 6371; // Radius Zemlje u km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };
        
        const latNum = parseFloat(lat!);
        const lonNum = parseFloat(lon!);
        const distancesToStations = KNOWN_STATIONS.map(station => ({
          ...station,
          distance: calculateDistance(latNum, lonNum, station.lat, station.lon)
        }));
        
        const nearestStation = distancesToStations.reduce((prev, curr) => 
          prev.distance < curr.distance ? prev : curr
        );
        
        // SAMO lokacije unutar 5km od poznate stanice imaju prave podatke
        // Sve ostalo su interpolacije koje NE prikazujemo
        if (nearestStation.distance <= 5) {
          console.log(`✅ REAL DATA: ${city || `${lat},${lon}`} is ${nearestStation.distance.toFixed(1)}km from station ${nearestStation.name}`);
          hasRealAQIData = true;
        } else {
          console.log(`❌ FAKE DATA: ${city || `${lat},${lon}`} is ${nearestStation.distance.toFixed(1)}km from nearest station ${nearestStation.name} - SKIPPING AQI`);
          hasRealAQIData = false;
        }
      }
      
      // Calculate AQI from components SAMO ako postoje pravi podaci
      const components = aqiData?.list?.[0]?.components || {};
      const pm25 = hasRealAQIData ? (components.pm2_5 || 0) : 0;
      const pm10 = hasRealAQIData ? (components.pm10 || 0) : 0;
      
      // Koristi centralizovanu AQI kalkulaciju - vrati null ako nema podataka
      const aqi = hasRealAQIData ? calculateAQI(pm25, pm10) : null;

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
        sunrise: data.sys?.sunrise,
        sunset: data.sys?.sunset,
        uvi: data.uvi || null,
        // AQI podaci - null ako ne postoje pravi podaci
        aqi: aqi,
        pm25: hasRealAQIData ? Math.round(pm25) : null,
        pm10: hasRealAQIData ? Math.round(pm10) : null,
        no2: hasRealAQIData ? Math.round(components.no2 || 0) : null,
        so2: hasRealAQIData ? Math.round(components.so2 || 0) : null,
        o3: hasRealAQIData ? Math.round(components.o3 || 0) : null,
        co: hasRealAQIData ? Math.round(components.co || 0) : null,
        hasAirQualityData: hasRealAQIData,
        dispersion: hasRealAQIData ? {
          status: dispersionStatus,
          reason: dispersionReason,
          risk: pollutionRisk
        } : null
      });
    }
    
    // Fallback for home page list (no specific city/coords)
    const weather = await getBalkanWeather();
    return NextResponse.json(weather);

  } catch (error) {
    const apiError = handleAPIError(error, 'WeatherAPI');
    const errorResponse = createErrorResponse(apiError);
    return NextResponse.json(errorResponse, { status: apiError.statusCode });
  }
}
