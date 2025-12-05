'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Wind,
  Droplets,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSun,
  Calendar,
  Share2,
  Star,
  Navigation2,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';

import { POPULAR_CITIES } from '@/lib/api/balkan-countries';
import { translateWeatherDescription, getWindDirection } from '@/lib/utils/weather-translations';
import { getAQILabel, getAQIColor, getAQIBgGradient } from '@/lib/utils/aqi';

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDeg: number;
  visibility: number;
  clouds: number;
  description: string;
  icon: string;
  sunrise: number;
  sunset: number;
  uvi?: number;
}

interface ForecastDay {
  date: string;
  day: string;
  high: number;
  low: number;
  icon: string;
  description: string;
  pop: number;
}

interface CityData {
  name: string;
  country: string;
  lat: number;
  lon: number;
  weather: WeatherData | null;
  forecast: ForecastDay[];
  aqi: number | null;
  loading: boolean;
  error: string | null;
}

function WeatherIcon({ iconCode, size = 24, className = '' }: { iconCode: string; size?: number; className?: string }) {
  const iconProps = { size, className };
  
  // OpenWeatherMap icon codes
  if (iconCode.startsWith('01')) {
    return iconCode.endsWith('d') 
      ? <Sun {...iconProps} className={`text-yellow-400 ${className}`} />
      : <Moon {...iconProps} className={`text-indigo-400 ${className}`} />;
  }
  if (iconCode.startsWith('02') || iconCode.startsWith('03')) {
    return <CloudSun {...iconProps} className={`text-slate-400 ${className}`} />;
  }
  if (iconCode.startsWith('04')) {
    return <Cloud {...iconProps} className={`text-slate-500 ${className}`} />;
  }
  if (iconCode.startsWith('09') || iconCode.startsWith('10')) {
    return <CloudRain {...iconProps} className={`text-blue-400 ${className}`} />;
  }
  if (iconCode.startsWith('13')) {
    return <Cloud {...iconProps} className={`text-white ${className}`} />;
  }
  
  return <Sun {...iconProps} className={`text-yellow-400 ${className}`} />;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString('sr-RS', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function getDayName(dateStr: string, index: number): string {
  if (index === 0) return 'Danas';
  const days = ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub'];
  const date = new Date(dateStr);
  return days[date.getDay()] ?? '';
}

export default function CityPage() {
  const params = useParams();
  const citySlug = (params?.name as string)?.toLowerCase();
  
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Pronađi grad iz POPULAR_CITIES
  const cityInfo = POPULAR_CITIES.find(
    c => c.name.toLowerCase() === citySlug || 
         c.name.toLowerCase().replace(/\s+/g, '-') === citySlug
  );
  
  const fetchCityData = useCallback(async () => {
    if (!cityInfo) {
      setError('Grad nije pronađen');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch weather data
      const weatherRes = await fetch(
        `/api/weather?lat=${cityInfo.lat}&lon=${cityInfo.lon}`
      );
      
      if (!weatherRes.ok) throw new Error('Greška pri učitavanju vremena');
      const weatherJson = await weatherRes.json();
      
      // Fetch forecast
      const forecastRes = await fetch(
        `/api/forecast?lat=${cityInfo.lat}&lon=${cityInfo.lon}`
      );
      const forecastJson = forecastRes.ok ? await forecastRes.json() : { daily: [] };
      
      // Fetch AQI (optional)
      let aqi: number | null = null;
      try {
        const aqiRes = await fetch(
          `/api/air-quality?lat=${cityInfo.lat}&lon=${cityInfo.lon}`
        );
        if (aqiRes.ok) {
          const aqiJson = await aqiRes.json();
          aqi = aqiJson.aqi ?? aqiJson.data?.aqi ?? null;
        }
      } catch {
        // AQI is optional
      }
      
      const weather: WeatherData | null = weatherJson.main ? {
        temp: Math.round(weatherJson.main.temp),
        feelsLike: Math.round(weatherJson.main.feels_like),
        humidity: weatherJson.main.humidity,
        pressure: weatherJson.main.pressure,
        windSpeed: Math.round((weatherJson.wind?.speed || 0) * 3.6), // m/s to km/h
        windDeg: weatherJson.wind?.deg || 0,
        visibility: Math.round((weatherJson.visibility || 10000) / 1000),
        clouds: weatherJson.clouds?.all || 0,
        description: weatherJson.weather?.[0]?.description || '',
        icon: weatherJson.weather?.[0]?.icon || '01d',
        sunrise: weatherJson.sys?.sunrise || 0,
        sunset: weatherJson.sys?.sunset || 0,
        uvi: weatherJson.uvi,
      } : null;
      
      const forecast: ForecastDay[] = (forecastJson.daily || forecastJson.list || [])
        .slice(0, 7)
        .map((day: Record<string, unknown>, index: number) => ({
          date: day.dt ? new Date((day.dt as number) * 1000).toISOString() : '',
          day: getDayName(day.dt ? new Date((day.dt as number) * 1000).toISOString() : '', index),
          high: Math.round((day.temp as { max?: number })?.max ?? (day.main as { temp_max?: number })?.temp_max ?? 0),
          low: Math.round((day.temp as { min?: number })?.min ?? (day.main as { temp_min?: number })?.temp_min ?? 0),
          icon: (day.weather as { icon?: string }[])?.[0]?.icon || '01d',
          description: (day.weather as { description?: string }[])?.[0]?.description || '',
          pop: Math.round(((day.pop as number) || 0) * 100),
        }));
      
      setCityData({
        name: cityInfo.name,
        country: cityInfo.country,
        lat: cityInfo.lat,
        lon: cityInfo.lon,
        weather,
        forecast,
        aqi,
        loading: false,
        error: null,
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Došlo je do greške');
    } finally {
      setIsLoading(false);
    }
  }, [cityInfo]);
  
  useEffect(() => {
    fetchCityData();
  }, [fetchCityData]);
  
  // Check favorite status
  useEffect(() => {
    if (cityInfo) {
      const stored = localStorage.getItem('weather_favorites');
      if (stored) {
        try {
          const favorites = JSON.parse(stored);
          setIsFavorite(favorites.some((f: { name: string }) => f.name === cityInfo.name));
        } catch {
          // ignore
        }
      }
    }
  }, [cityInfo]);
  
  const toggleFavorite = () => {
    if (!cityInfo) return;
    
    const stored = localStorage.getItem('weather_favorites');
    let favorites: { id: string; name: string }[] = [];
    
    try {
      favorites = stored ? JSON.parse(stored) : [];
    } catch {
      favorites = [];
    }
    
    const exists = favorites.findIndex(f => f.name === cityInfo.name);
    
    if (exists >= 0) {
      favorites.splice(exists, 1);
      setIsFavorite(false);
    } else {
      favorites.push({ id: cityInfo.name.toLowerCase(), name: cityInfo.name });
      setIsFavorite(true);
    }
    
    localStorage.setItem('weather_favorites', JSON.stringify(favorites));
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vreme u ${cityData?.name}`,
          text: `Pogledaj vremensku prognozu za ${cityData?.name}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert('Link kopiran u clipboard!');
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Učitavanje podataka...</p>
        </div>
      </div>
    );
  }
  
  if (error || !cityData || !cityData.weather) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            {error || 'Grad nije pronađen'}
          </h1>
          <p className="text-slate-400 mb-6">
            Nismo uspeli da pronađemo podatke za ovaj grad.
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={fetchCityData}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Pokušaj ponovo
            </button>
            <Link href="/" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
              Nazad na početnu
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const { weather, forecast, aqi } = cityData;

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
              <ArrowLeft size={20} />
              <span>Nazad</span>
            </Link>
            
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <MapPin size={16} />
                  <span>{cityData.country}</span>
                </div>
                <h1 className="text-4xl font-display font-bold text-white">{cityData.name}</h1>
                <p className="text-slate-500 mt-1">
                  {cityData.lat.toFixed(4)}°N, {cityData.lon.toFixed(4)}°E
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleFavorite}
                  className={`btn-ghost ${isFavorite ? 'text-yellow-400' : ''}`}
                >
                  <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                  <span className="hidden sm:inline">{isFavorite ? 'Sačuvano' : 'Sačuvaj'}</span>
                </button>
                <button onClick={handleShare} className="btn-secondary">
                  <Share2 size={18} />
                  <span className="hidden sm:inline">Podeli</span>
                </button>
                <button onClick={fetchCityData} className="btn-ghost">
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Current Weather Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="neo-card p-8 mb-8 relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-primary-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
              {/* Temperature & Icon */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 blur-3xl opacity-30 bg-weather-cloudy rounded-full" />
                  <WeatherIcon iconCode={weather.icon} size={120} className="relative z-10" />
                </div>
                <div>
                  <h2 className="text-8xl font-display font-bold tracking-tighter text-white temp-display">
                    {weather.temp}°
                  </h2>
                  <p className="text-xl text-slate-400">{translateWeatherDescription(weather.description)}</p>
                  <p className="text-slate-500">Osećaj: {weather.feelsLike}°C</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="stat-card">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Wind size={16} />
                    <span className="text-xs uppercase tracking-wider">Vetar</span>
                  </div>
                  <p className="text-xl font-bold text-white">{weather.windSpeed} km/h</p>
                  <div className="flex items-center gap-1 text-slate-500 text-sm">
                    <Navigation2 size={12} style={{ transform: `rotate(${weather.windDeg}deg)` }} />
                    <span>{getWindDirection(weather.windDeg)}</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Droplets size={16} />
                    <span className="text-xs uppercase tracking-wider">Vlažnost</span>
                  </div>
                  <p className="text-xl font-bold text-white">{weather.humidity}%</p>
                </div>
                
                <div className="stat-card">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Gauge size={16} />
                    <span className="text-xs uppercase tracking-wider">Pritisak</span>
                  </div>
                  <p className="text-xl font-bold text-white">{weather.pressure} hPa</p>
                </div>
                
                <div className="stat-card">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Eye size={16} />
                    <span className="text-xs uppercase tracking-wider">Vidljivost</span>
                  </div>
                  <p className="text-xl font-bold text-white">{weather.visibility} km</p>
                  <p className="text-slate-500 text-sm">Oblačnost: {weather.clouds}%</p>
                </div>
              </div>
            </div>

            {/* Sun times & AQI */}
            <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Sunrise className="text-amber-400" size={20} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Izlazak sunca</p>
                    <p className="text-white font-medium">{formatTime(weather.sunrise)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Sunset className="text-orange-400" size={20} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Zalazak sunca</p>
                    <p className="text-white font-medium">{formatTime(weather.sunset)}</p>
                  </div>
                </div>
                {weather.uvi !== undefined && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <Sun className="text-yellow-400" size={20} />
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm">UV Index</p>
                      <p className="text-white font-medium">{weather.uvi}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {aqi !== null && (
                <Link 
                  href="/kvalitet-vazduha" 
                  className={`flex items-center gap-3 px-5 py-3 rounded-xl border bg-gradient-to-r ${getAQIBgGradient(aqi)} border-slate-700/50 transition-colors hover:opacity-80`}
                >
                  <span className={`text-2xl font-bold ${getAQIColor(aqi)}`}>{aqi}</span>
                  <div>
                    <p className={`font-medium ${getAQIColor(aqi)}`}>AQI</p>
                    <p className="text-slate-400 text-sm">{getAQILabel(aqi)}</p>
                  </div>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Weekly Forecast */}
          {forecast.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="neo-card p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <Calendar size={20} className="text-slate-400" />
                <h2 className="text-xl font-semibold text-white">7-dnevna prognoza</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {forecast.map((day, index) => (
                  <div 
                    key={index}
                    className={`flex flex-col items-center p-4 rounded-xl ${
                      index === 0 ? 'bg-primary-600/10 border border-primary-500/20' : 'bg-slate-800/30 hover:bg-slate-800/50'
                    } transition-colors`}
                  >
                    <span className={`font-medium mb-2 ${index === 0 ? 'text-primary-400' : 'text-white'}`}>
                      {day.day}
                    </span>
                    <WeatherIcon iconCode={day.icon} size={32} />
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-white font-medium">{day.high}°</span>
                      <span className="text-slate-500">{day.low}°</span>
                    </div>
                    {day.pop > 20 && (
                      <div className="flex items-center gap-1 text-blue-400 text-sm mt-1">
                        <Droplets size={12} />
                        <span>{day.pop}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* City Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flat-card p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Informacije o gradu</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-slate-500 text-sm">Država</p>
                <p className="text-white font-medium">{cityData.country}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Koordinate</p>
                <p className="text-white font-medium">{cityData.lat.toFixed(2)}°N, {cityData.lon.toFixed(2)}°E</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Vremenska zona</p>
                <p className="text-white font-medium">CET (UTC+1)</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
