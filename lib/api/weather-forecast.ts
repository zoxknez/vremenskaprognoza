/**
 * Comprehensive Weather Forecast API
 * Detailed weather data with 7-day forecast, hourly data, and all meteorological parameters
 */

import { BALKAN_COUNTRIES } from './balkan-countries';
import type { OpenWeatherOneCallResponse, OpenWeatherForecastResponse, OpenWeatherCurrent, OpenWeatherForecastItem, OpenWeatherHourly, OpenWeatherDaily, OpenWeatherAlert } from '@/lib/types/api-responses';

// Detailed weather interfaces
export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  pressureTrend: 'rising' | 'falling' | 'stable';
  visibility: number;
  uvIndex: number;
  uvCategory: string;
  cloudCover: number;
  dewPoint: number;
  description: string;
  icon: string;
  wind: {
    speed: number;
    gust: number;
    direction: number;
    directionText: string;
  };
  precipitation: {
    probability: number;
    type: 'none' | 'rain' | 'snow' | 'sleet' | 'mixed';
    intensity: number;
    lastHour: number;
  };
  sun: {
    sunrise: string;
    sunset: string;
    dayLength: string;
    solarNoon: string;
  };
  moon: {
    phase: string;
    illumination: number;
    moonrise: string;
    moonset: string;
  };
  airQualityImpact: {
    dispersionIndex: number; // 1-10, higher = better dispersion
    inversionRisk: 'low' | 'moderate' | 'high';
    smogPotential: 'low' | 'moderate' | 'high';
    recommendation: string;
  };
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windGust: number;
  windDirection: number;
  cloudCover: number;
  precipitation: number;
  precipProbability: number;
  precipType: string;
  visibility: number;
  uvIndex: number;
  description: string;
  icon: string;
}

export interface DailyForecast {
  date: string;
  dayOfWeek: string;
  temperature: {
    min: number;
    max: number;
    morning: number;
    day: number;
    evening: number;
    night: number;
  };
  feelsLike: {
    morning: number;
    day: number;
    evening: number;
    night: number;
  };
  humidity: number;
  pressure: number;
  wind: {
    speed: number;
    gust: number;
    direction: number;
  };
  precipitation: {
    probability: number;
    total: number;
    type: string;
  };
  cloudCover: number;
  uvIndex: number;
  visibility: number;
  sun: {
    sunrise: string;
    sunset: string;
  };
  moon: {
    phase: string;
    moonrise: string;
    moonset: string;
  };
  description: string;
  icon: string;
  summary: string;
}

export interface WeatherAlert {
  id: string;
  event: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  headline: string;
  description: string;
  start: string;
  end: string;
  sender: string;
  tags: string[];
}

export interface ComprehensiveWeatherData {
  location: {
    name: string;
    city: string;
    country: string;
    coordinates: [number, number];
    timezone: string;
    localTime: string;
  };
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts: WeatherAlert[];
  historical?: {
    yesterday: {
      tempMax: number;
      tempMin: number;
      precipitation: number;
    };
  };
  metadata: {
    lastUpdated: string;
    source: string;
    units: 'metric' | 'imperial';
  };
}

// Helper functions
function getWindDirection(degrees: number): string {
  const directions = ['S', 'SSZ', 'SZ', 'ZSZ', 'Z', 'ZJZ', 'JZ', 'JJZ', 'J', 'JJI', 'JI', 'IJI', 'I', 'ISI', 'SI', 'SSI'];
  return directions[Math.round(degrees / 22.5) % 16];
}

function getUVCategory(uv: number): string {
  if (uv <= 2) return 'Nizak';
  if (uv <= 5) return 'Umjeren';
  if (uv <= 7) return 'Visok';
  if (uv <= 10) return 'Vrlo visok';
  return 'Ekstreman';
}

function getMoonPhase(phase: number): string {
  if (phase === 0 || phase === 1) return 'Mlad mjesec';
  if (phase < 0.25) return 'Mlađa srpasta';
  if (phase === 0.25) return 'Prva četvrt';
  if (phase < 0.5) return 'Mlađa grbasta';
  if (phase === 0.5) return 'Pun mjesec';
  if (phase < 0.75) return 'Starija grbasta';
  if (phase === 0.75) return 'Posljednja četvrt';
  return 'Starija srpasta';
}

function calculateDispersionIndex(wind: number, humidity: number, temp: number, pressure: number): number {
  // Higher wind = better dispersion
  let index = Math.min(wind / 2, 3); // 0-3 from wind
  
  // Lower humidity = better
  index += (100 - humidity) / 25; // 0-4 from humidity
  
  // Temperature inversion check
  if (temp < 5 && wind < 2) {
    index -= 2; // Penalty for inversion conditions
  }
  
  // High pressure often means stable air = worse dispersion
  if (pressure > 1025) {
    index -= 1;
  }
  
  return Math.max(1, Math.min(10, Math.round(index + 3)));
}

function getAirQualityImpact(
  wind: number, 
  humidity: number, 
  temp: number, 
  pressure: number
): CurrentWeather['airQualityImpact'] {
  const dispersion = calculateDispersionIndex(wind, humidity, temp, pressure);
  
  const inversionRisk = temp < 5 && wind < 2 ? 'high' : 
                        temp < 10 && wind < 3 ? 'moderate' : 'low';
  
  const smogPotential = humidity > 80 && wind < 2 ? 'high' :
                        humidity > 60 && wind < 3 ? 'moderate' : 'low';
  
  let recommendation = '';
  if (dispersion <= 3) {
    recommendation = 'Loši uvjeti za raspršivanje zagađenja. Izbjegavajte dugotrajne aktivnosti vani.';
  } else if (dispersion <= 5) {
    recommendation = 'Umjereni uvjeti. Osjetljive grupe trebaju biti oprezne.';
  } else if (dispersion <= 7) {
    recommendation = 'Dobri uvjeti za raspršivanje zagađenja.';
  } else {
    recommendation = 'Odlični uvjeti. Vjetar učinkovito raspršuje zagađivače.';
  }
  
  return { dispersionIndex: dispersion, inversionRisk, smogPotential, recommendation };
}

function formatDayLength(sunrise: number, sunset: number): string {
  const diff = sunset - sunrise;
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

// Fetch comprehensive weather data
export async function getComprehensiveWeather(
  lat: number,
  lon: number,
  cityName: string
): Promise<ComprehensiveWeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenWeather API key not configured');
    return null;
  }

  try {
    // Fetch One Call API 3.0 for comprehensive data
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=hr&exclude=minutely`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!response.ok) {
      // Fallback to 2.5 API
      return await getFallbackWeather(lat, lon, cityName, apiKey);
    }

    const data = await response.json();
    
    return parseOneCallData(data, cityName, lat, lon);
  } catch (error) {
    console.error(`Error fetching weather for ${cityName}:`, error);
    return null;
  }
}

// Fallback to OpenWeather 2.5 API
async function getFallbackWeather(
  lat: number,
  lon: number,
  cityName: string,
  apiKey: string
): Promise<ComprehensiveWeatherData | null> {
  try {
    // Current weather
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=hr`
    );
    
    // 5-day forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=hr`
    );

    if (!currentRes.ok || !forecastRes.ok) {
      return null;
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    return parseFallbackData(currentData, forecastData, cityName, lat, lon);
  } catch (error) {
    console.error('Fallback weather error:', error);
    return null;
  }
}

// Parse One Call API data
function parseOneCallData(
  data: OpenWeatherOneCallResponse,
  cityName: string,
  lat: number,
  lon: number
): ComprehensiveWeatherData {
  const current = data.current;
  
  // Fallback if current is undefined
  if (!current) {
    throw new Error('Missing current weather data from API');
  }
  
  return {
    location: {
      name: cityName,
      city: cityName,
      country: 'RS', // Would need reverse geocoding for accurate country
      coordinates: [lon, lat],
      timezone: data.timezone,
      localTime: new Date(current.dt * 1000).toISOString(),
    },
    current: {
      temperature: Math.round(current.temp * 10) / 10,
      feelsLike: Math.round(current.feels_like * 10) / 10,
      humidity: current.humidity,
      pressure: current.pressure,
      pressureTrend: 'stable',
      visibility: current.visibility || 10000,
      uvIndex: current.uvi || 0,
      uvCategory: getUVCategory(current.uvi || 0),
      cloudCover: current.clouds,
      dewPoint: Math.round(current.dew_point * 10) / 10,
      description: current.weather[0]?.description || 'N/A',
      icon: current.weather[0]?.icon || '01d',
      wind: {
        speed: Math.round(current.wind_speed * 10) / 10,
        gust: Math.round((current.wind_gust || current.wind_speed) * 10) / 10,
        direction: current.wind_deg || 0,
        directionText: getWindDirection(current.wind_deg || 0),
      },
      precipitation: {
        probability: data.hourly?.[0]?.pop || 0,
        type: current.rain ? 'rain' : current.snow ? 'snow' : 'none',
        intensity: current.rain?.['1h'] || current.snow?.['1h'] || 0,
        lastHour: current.rain?.['1h'] || current.snow?.['1h'] || 0,
      },
      sun: {
        sunrise: new Date(current.sunrise * 1000).toISOString(),
        sunset: new Date(current.sunset * 1000).toISOString(),
        dayLength: formatDayLength(current.sunrise, current.sunset),
        solarNoon: new Date((current.sunrise + current.sunset) / 2 * 1000).toISOString(),
      },
      moon: {
        phase: getMoonPhase(data.daily?.[0]?.moon_phase || 0),
        illumination: Math.round((data.daily?.[0]?.moon_phase || 0) * 100),
        moonrise: data.daily?.[0]?.moonrise ? new Date(data.daily[0].moonrise * 1000).toISOString() : '',
        moonset: data.daily?.[0]?.moonset ? new Date(data.daily[0].moonset * 1000).toISOString() : '',
      },
      airQualityImpact: getAirQualityImpact(
        current.wind_speed,
        current.humidity,
        current.temp,
        current.pressure
      ),
    },
    hourly: (data.hourly || []).slice(0, 48).map((hour: OpenWeatherHourly) => ({
      time: new Date(hour.dt * 1000).toISOString(),
      temperature: Math.round(hour.temp * 10) / 10,
      feelsLike: Math.round(hour.feels_like * 10) / 10,
      humidity: hour.humidity,
      pressure: hour.pressure,
      windSpeed: Math.round(hour.wind_speed * 10) / 10,
      windGust: Math.round((hour.wind_gust || hour.wind_speed) * 10) / 10,
      windDirection: hour.wind_deg,
      cloudCover: hour.clouds,
      precipitation: hour.rain?.['1h'] || hour.snow?.['1h'] || 0,
      precipProbability: Math.round(hour.pop * 100),
      precipType: hour.rain ? 'rain' : hour.snow ? 'snow' : 'none',
      visibility: hour.visibility || 10000,
      uvIndex: hour.uvi || 0,
      description: hour.weather[0]?.description || '',
      icon: hour.weather[0]?.icon || '01d',
    })),
    daily: (data.daily || []).slice(0, 7).map((day: OpenWeatherDaily, index: number) => {
      const date = new Date(day.dt * 1000);
      const daysOfWeek = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
      
      return {
        date: date.toISOString().split('T')[0],
        dayOfWeek: index === 0 ? 'Danas' : index === 1 ? 'Sutra' : daysOfWeek[date.getDay()],
        temperature: {
          min: Math.round(day.temp.min),
          max: Math.round(day.temp.max),
          morning: Math.round(day.temp.morn),
          day: Math.round(day.temp.day),
          evening: Math.round(day.temp.eve),
          night: Math.round(day.temp.night),
        },
        feelsLike: {
          morning: Math.round(day.feels_like.morn),
          day: Math.round(day.feels_like.day),
          evening: Math.round(day.feels_like.eve),
          night: Math.round(day.feels_like.night),
        },
        humidity: day.humidity,
        pressure: day.pressure,
        wind: {
          speed: Math.round(day.wind_speed * 10) / 10,
          gust: Math.round((day.wind_gust || day.wind_speed) * 10) / 10,
          direction: day.wind_deg,
        },
        precipitation: {
          probability: Math.round(day.pop * 100),
          total: (day.rain || 0) + (day.snow || 0),
          type: day.rain ? 'rain' : day.snow ? 'snow' : 'none',
        },
        cloudCover: day.clouds,
        uvIndex: day.uvi,
        visibility: 10000,
        sun: {
          sunrise: new Date(day.sunrise * 1000).toISOString(),
          sunset: new Date(day.sunset * 1000).toISOString(),
        },
        moon: {
          phase: getMoonPhase(day.moon_phase),
          moonrise: day.moonrise ? new Date(day.moonrise * 1000).toISOString() : '',
          moonset: day.moonset ? new Date(day.moonset * 1000).toISOString() : '',
        },
        description: day.weather[0]?.description || '',
        icon: day.weather[0]?.icon || '01d',
        summary: day.summary || day.weather[0]?.description || '',
      };
    }),
    alerts: (data.alerts || []).map((alert: OpenWeatherAlert) => ({
      id: `alert-${alert.start}-${alert.event}`,
      event: alert.event,
      severity: alert.tags?.includes('Extreme') ? 'extreme' : 
               alert.tags?.includes('Severe') ? 'severe' :
               alert.tags?.includes('Moderate') ? 'moderate' : 'minor',
      headline: alert.event,
      description: alert.description,
      start: new Date(alert.start * 1000).toISOString(),
      end: new Date(alert.end * 1000).toISOString(),
      sender: alert.sender_name,
      tags: alert.tags || [],
    })),
    metadata: {
      lastUpdated: new Date().toISOString(),
      source: 'OpenWeather One Call 3.0',
      units: 'metric',
    },
  };
}

// Parse fallback 2.5 API data
function parseFallbackData(
  currentData: OpenWeatherCurrent,
  forecastData: OpenWeatherForecastResponse,
  cityName: string,
  lat: number,
  lon: number
): ComprehensiveWeatherData {
  const current = currentData;
  
  // Group forecast by day
  const dailyMap = new Map<string, any[]>();
  forecastData.list.forEach((item: OpenWeatherForecastItem) => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, []);
    }
    dailyMap.get(date)!.push(item);
  });

  const daily = Array.from(dailyMap.entries()).slice(0, 7).map(([date, items], index) => {
    const temps = items.map(i => i.main.temp);
    const dateObj = new Date(date);
    const daysOfWeek = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
    
    return {
      date,
      dayOfWeek: index === 0 ? 'Danas' : index === 1 ? 'Sutra' : daysOfWeek[dateObj.getDay()],
      temperature: {
        min: Math.round(Math.min(...temps)),
        max: Math.round(Math.max(...temps)),
        morning: Math.round(items[0]?.main.temp || temps[0]),
        day: Math.round(items[Math.floor(items.length / 2)]?.main.temp || temps[0]),
        evening: Math.round(items[items.length - 1]?.main.temp || temps[0]),
        night: Math.round(temps[0]),
      },
      feelsLike: {
        morning: Math.round(items[0]?.main.feels_like || temps[0]),
        day: Math.round(items[Math.floor(items.length / 2)]?.main.feels_like || temps[0]),
        evening: Math.round(items[items.length - 1]?.main.feels_like || temps[0]),
        night: Math.round(items[0]?.main.feels_like || temps[0]),
      },
      humidity: Math.round(items.reduce((a, i) => a + i.main.humidity, 0) / items.length),
      pressure: Math.round(items.reduce((a, i) => a + i.main.pressure, 0) / items.length),
      wind: {
        speed: Math.round(items.reduce((a, i) => a + i.wind.speed, 0) / items.length * 10) / 10,
        gust: Math.round(items.reduce((a, i) => a + (i.wind.gust || i.wind.speed), 0) / items.length * 10) / 10,
        direction: items[0]?.wind.deg || 0,
      },
      precipitation: {
        probability: Math.round(Math.max(...items.map(i => i.pop || 0)) * 100),
        total: items.reduce((a, i) => a + (i.rain?.['3h'] || 0) + (i.snow?.['3h'] || 0), 0),
        type: items.some(i => i.rain) ? 'rain' : items.some(i => i.snow) ? 'snow' : 'none',
      },
      cloudCover: Math.round(items.reduce((a, i) => a + i.clouds.all, 0) / items.length),
      uvIndex: 0,
      visibility: Math.round(items.reduce((a, i) => a + (i.visibility || 10000), 0) / items.length),
      sun: {
        sunrise: new Date(current.sys.sunrise * 1000).toISOString(),
        sunset: new Date(current.sys.sunset * 1000).toISOString(),
      },
      moon: {
        phase: 'N/A',
        moonrise: '',
        moonset: '',
      },
      description: items[Math.floor(items.length / 2)]?.weather[0]?.description || '',
      icon: items[Math.floor(items.length / 2)]?.weather[0]?.icon || '01d',
      summary: items[Math.floor(items.length / 2)]?.weather[0]?.description || '',
    };
  });

  return {
    location: {
      name: current.name || cityName,
      city: cityName,
      country: current.sys?.country || '',
      coordinates: [lon, lat],
      timezone: `UTC+${current.timezone / 3600}`,
      localTime: new Date().toISOString(),
    },
    current: {
      temperature: Math.round(current.main.temp * 10) / 10,
      feelsLike: Math.round(current.main.feels_like * 10) / 10,
      humidity: current.main.humidity,
      pressure: current.main.pressure,
      pressureTrend: 'stable',
      visibility: current.visibility || 10000,
      uvIndex: 0,
      uvCategory: 'N/A',
      cloudCover: current.clouds?.all || 0,
      dewPoint: 0,
      description: current.weather[0]?.description || '',
      icon: current.weather[0]?.icon || '01d',
      wind: {
        speed: Math.round(current.wind?.speed * 10) / 10 || 0,
        gust: Math.round((current.wind?.gust || current.wind?.speed) * 10) / 10 || 0,
        direction: current.wind?.deg || 0,
        directionText: getWindDirection(current.wind?.deg || 0),
      },
      precipitation: {
        probability: 0,
        type: current.rain ? 'rain' : current.snow ? 'snow' : 'none',
        intensity: current.rain?.['1h'] || current.snow?.['1h'] || 0,
        lastHour: current.rain?.['1h'] || current.snow?.['1h'] || 0,
      },
      sun: {
        sunrise: new Date(current.sys.sunrise * 1000).toISOString(),
        sunset: new Date(current.sys.sunset * 1000).toISOString(),
        dayLength: formatDayLength(current.sys.sunrise, current.sys.sunset),
        solarNoon: new Date((current.sys.sunrise + current.sys.sunset) / 2 * 1000).toISOString(),
      },
      moon: {
        phase: 'N/A',
        illumination: 0,
        moonrise: '',
        moonset: '',
      },
      airQualityImpact: getAirQualityImpact(
        current.wind?.speed || 0,
        current.main.humidity,
        current.main.temp,
        current.main.pressure
      ),
    },
    hourly: forecastData.list.slice(0, 16).map((item: OpenWeatherForecastItem) => ({
      time: new Date(item.dt * 1000).toISOString(),
      temperature: Math.round(item.main.temp * 10) / 10,
      feelsLike: Math.round(item.main.feels_like * 10) / 10,
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      windSpeed: Math.round(item.wind.speed * 10) / 10,
      windGust: Math.round((item.wind.gust || item.wind.speed) * 10) / 10,
      windDirection: item.wind.deg,
      cloudCover: item.clouds.all,
      precipitation: item.rain?.['3h'] || item.snow?.['3h'] || 0,
      precipProbability: Math.round((item.pop || 0) * 100),
      precipType: item.rain ? 'rain' : item.snow ? 'snow' : 'none',
      visibility: item.visibility || 10000,
      uvIndex: 0,
      description: item.weather[0]?.description || '',
      icon: item.weather[0]?.icon || '01d',
    })),
    daily,
    alerts: [],
    metadata: {
      lastUpdated: new Date().toISOString(),
      source: 'OpenWeather 2.5',
      units: 'metric',
    },
  };
}

// Get weather for all Balkan capitals
export async function getBalkanWeatherForecast(): Promise<ComprehensiveWeatherData[]> {
  const results: ComprehensiveWeatherData[] = [];
  
  // Get capital cities
  const capitals = [
    { name: 'Beograd', lat: 44.8178, lon: 20.4568 },
    { name: 'Zagreb', lat: 45.815, lon: 15.9819 },
    { name: 'Sarajevo', lat: 43.8563, lon: 18.4131 },
    { name: 'Podgorica', lat: 42.4304, lon: 19.2594 },
    { name: 'Skopje', lat: 41.9981, lon: 21.4254 },
    { name: 'Ljubljana', lat: 46.0569, lon: 14.5058 },
    { name: 'Tirana', lat: 41.3275, lon: 19.8189 },
    { name: 'Priština', lat: 42.6629, lon: 21.1655 },
    { name: 'Sofija', lat: 42.6977, lon: 23.3219 },
    { name: 'Bukurešt', lat: 44.4268, lon: 26.1025 },
    { name: 'Atina', lat: 37.9838, lon: 23.7275 },
  ];

  for (const city of capitals) {
    const weather = await getComprehensiveWeather(city.lat, city.lon, city.name);
    if (weather) {
      results.push(weather);
    }
  }

  return results;
}
