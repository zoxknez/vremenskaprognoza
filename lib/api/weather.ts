/**
 * Meteorological Data API
 * Weather data that affects air pollution dispersion
 */

import { BALKAN_COUNTRIES } from './balkan-countries';

export interface MeteorologicalData {
  location: {
    name: string;
    city: string;
    coordinates: [number, number];
  };
  weather: {
    temperature: number; // Celsius
    humidity: number; // Percentage
    pressure: number; // hPa
    windSpeed: number; // m/s
    windDirection: number; // degrees
    windDirectionText: string;
    clouds: number; // Percentage
    visibility: number; // meters
    description: string;
    icon: string;
  };
  impact: {
    dispersion: 'good' | 'moderate' | 'poor';
    reason: string;
    pollutionRisk: 'low' | 'medium' | 'high';
  };
  timestamp: string;
}

// Wind direction text conversion
function getWindDirectionText(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Calculate pollution dispersion based on weather
function calculateDispersion(weather: MeteorologicalData['weather']): MeteorologicalData['impact'] {
  let dispersion: 'good' | 'moderate' | 'poor' = 'moderate';
  let reason = '';
  let pollutionRisk: 'low' | 'medium' | 'high' = 'medium';

  // Wind speed is the primary factor
  if (weather.windSpeed > 5) {
    dispersion = 'good';
    reason = 'Jak vjetar pomaže raspršivanju zagađivača';
    pollutionRisk = 'low';
  } else if (weather.windSpeed < 2) {
    dispersion = 'poor';
    reason = 'Slab vjetar dovodi do nakupljanja zagađenja';
    pollutionRisk = 'high';
  }

  // Temperature inversion check (cold + low wind = bad)
  if (weather.temperature < 5 && weather.windSpeed < 3) {
    dispersion = 'poor';
    reason = 'Temperaturna inverzija - hladnoća i slab vjetar zadržavaju zagađenje pri tlu';
    pollutionRisk = 'high';
  }

  // High humidity can trap pollutants
  if (weather.humidity > 85 && weather.windSpeed < 3) {
    dispersion = 'poor';
    reason = 'Visoka vlažnost i slab vjetar pogoduju stvaranju smoga';
    pollutionRisk = 'high';
  }

  // Rain helps clean air
  if (weather.description.toLowerCase().includes('rain') || weather.description.toLowerCase().includes('kiša')) {
    dispersion = 'good';
    reason = 'Kiša ispire zagađivače iz atmosfere';
    pollutionRisk = 'low';
  }

  return { dispersion, reason, pollutionRisk };
}

// Fetch weather for a specific location
async function fetchWeatherForLocation(
  lat: number,
  lon: number,
  cityName: string
): Promise<MeteorologicalData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenWeather API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=hr`,
      { next: { revalidate: 600 } } // Cache for 10 minutes
    );

    if (!response.ok) {
      console.error(`Weather API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    const weather: MeteorologicalData['weather'] = {
      temperature: Math.round(data.main.temp * 10) / 10,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind?.speed || 0,
      windDirection: data.wind?.deg || 0,
      windDirectionText: getWindDirectionText(data.wind?.deg || 0),
      clouds: data.clouds?.all || 0,
      visibility: data.visibility || 10000,
      description: data.weather?.[0]?.description || 'N/A',
      icon: data.weather?.[0]?.icon || '01d',
    };

    const impact = calculateDispersion(weather);

    return {
      location: {
        name: data.name || cityName,
        city: cityName,
        coordinates: [lon, lat],
      },
      weather,
      impact,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching weather for ${cityName}:`, error);
    return null;
  }
}

// Fetch weather for all major cities in Balkans
export async function getBalkanWeather(): Promise<MeteorologicalData[]> {
  const results: MeteorologicalData[] = [];
  
  // Get major cities from all countries
  const cities: { name: string; lat: number; lon: number }[] = [];
  
  Object.values(BALKAN_COUNTRIES).forEach((country) => {
    country.cities.forEach((city) => {
      cities.push({
        name: city.name,
        lat: city.lat,
        lon: city.lon,
      });
    });
  });

  // Fetch weather for each city in parallel (with limit)
  const batchSize = 10;
  for (let i = 0; i < cities.length; i += batchSize) {
    const batch = cities.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((city) => fetchWeatherForLocation(city.lat, city.lon, city.name))
    );
    results.push(...batchResults.filter((r): r is MeteorologicalData => r !== null));
  }

  return results;
}

// Fetch weather for a specific city
export async function getCityWeather(cityName: string): Promise<MeteorologicalData | null> {
  // Find city in our database
  for (const country of Object.values(BALKAN_COUNTRIES)) {
    const city = country.cities.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase()
    );
    if (city) {
      return fetchWeatherForLocation(city.lat, city.lon, city.name);
    }
  }

  // If not found, try geocoding
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (!apiKey) return null;

  try {
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${apiKey}`
    );
    
    if (!geoResponse.ok) return null;
    
    const geoData = await geoResponse.json();
    if (geoData.length === 0) return null;

    return fetchWeatherForLocation(geoData[0].lat, geoData[0].lon, cityName);
  } catch {
    return null;
  }
}

// Get weather alert if conditions are bad for air quality
export function getWeatherAlert(weather: MeteorologicalData): string | null {
  if (weather.impact.pollutionRisk === 'high') {
    return `⚠️ Upozorenje za ${weather.location.city}: ${weather.impact.reason}. Preporučuje se izbjegavanje dugog boravka na otvorenom.`;
  }
  return null;
}

// Weather icon URL
export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}
