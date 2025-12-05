'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import {
  ArrowLeft,
  MapPin,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSun,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Share2,
  Star,
  Navigation2,
} from 'lucide-react';

// Mock data - in real app this would come from API
const cityData = {
  beograd: {
    name: 'Beograd',
    country: 'Srbija',
    region: 'Centralna Srbija',
    population: '1.4M',
    elevation: '117m',
    timezone: 'CET (UTC+1)',
    lat: 44.8176,
    lng: 20.4633,
    current: {
      temp: 24,
      feelsLike: 26,
      condition: 'Pretežno oblačno',
      icon: 'cloudy',
      humidity: 65,
      windSpeed: 12,
      windDir: 'SZ',
      windDeg: 315,
      pressure: 1015,
      visibility: 10,
      uvIndex: 5,
      dewPoint: 16,
      cloudCover: 60,
      aqi: 72,
      aqiLabel: 'Umeren',
      sunrise: '05:42',
      sunset: '20:31',
    },
    hourly: [
      { time: '13:00', temp: 24, icon: 'cloudy', precipitation: 0 },
      { time: '14:00', temp: 26, icon: 'partly-cloudy', precipitation: 0 },
      { time: '15:00', temp: 27, icon: 'sunny', precipitation: 0 },
      { time: '16:00', temp: 27, icon: 'sunny', precipitation: 0 },
      { time: '17:00', temp: 26, icon: 'partly-cloudy', precipitation: 5 },
      { time: '18:00', temp: 24, icon: 'cloudy', precipitation: 10 },
      { time: '19:00', temp: 22, icon: 'cloudy', precipitation: 20 },
      { time: '20:00', temp: 20, icon: 'night', precipitation: 15 },
      { time: '21:00', temp: 19, icon: 'night', precipitation: 5 },
      { time: '22:00', temp: 18, icon: 'night', precipitation: 0 },
    ],
    weekly: [
      { day: 'Danas', high: 27, low: 18, icon: 'cloudy', precipitation: 20 },
      { day: 'Uto', high: 30, low: 19, icon: 'sunny', precipitation: 0 },
      { day: 'Sre', high: 28, low: 20, icon: 'partly-cloudy', precipitation: 15 },
      { day: 'Čet', high: 24, low: 17, icon: 'rainy', precipitation: 70 },
      { day: 'Pet', high: 22, low: 15, icon: 'rainy', precipitation: 60 },
      { day: 'Sub', high: 25, low: 16, icon: 'partly-cloudy', precipitation: 25 },
      { day: 'Ned', high: 28, low: 17, icon: 'sunny', precipitation: 5 },
    ],
  },
};

function WeatherIcon({ type, size = 24, className = '' }: { type: string; size?: number; className?: string }) {
  const iconProps = { size, className };
  
  switch (type) {
    case 'sunny':
      return <Sun {...iconProps} className={`text-weather-sunny ${className}`} />;
    case 'cloudy':
      return <Cloud {...iconProps} className={`text-weather-cloudy ${className}`} />;
    case 'partly-cloudy':
      return <CloudSun {...iconProps} className={`text-slate-400 ${className}`} />;
    case 'rainy':
      return <CloudRain {...iconProps} className={`text-weather-rainy ${className}`} />;
    case 'night':
      return <Moon {...iconProps} className={`text-indigo-400 ${className}`} />;
    default:
      return <Sun {...iconProps} className={`text-weather-sunny ${className}`} />;
  }
}

function getAqiColor(aqi: number): string {
  if (aqi <= 50) return 'text-aqi-good';
  if (aqi <= 100) return 'text-aqi-moderate';
  if (aqi <= 150) return 'text-aqi-sensitive';
  return 'text-aqi-unhealthy';
}

function getAqiBgColor(aqi: number): string {
  if (aqi <= 50) return 'bg-aqi-good/20 border-aqi-good/30';
  if (aqi <= 100) return 'bg-aqi-moderate/20 border-aqi-moderate/30';
  if (aqi <= 150) return 'bg-aqi-sensitive/20 border-aqi-sensitive/30';
  return 'bg-aqi-unhealthy/20 border-aqi-unhealthy/30';
}

export default function CityPage() {
  const params = useParams();
  const citySlug = params?.name as string;
  
  // Get city data (mock - in real app would fetch from API)
  const city = cityData['beograd']; // Default to Belgrade for now
  
  if (!city) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Grad nije pronađen</h1>
          <Link href="/" className="btn-primary">Nazad na početnu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <Navigation />
      
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
                  <span>{city.region}, {city.country}</span>
                </div>
                <h1 className="text-4xl font-display font-bold text-white">{city.name}</h1>
                <p className="text-slate-500 mt-1">
                  {city.lat.toFixed(4)}°N, {city.lng.toFixed(4)}°E • Nadmorska visina: {city.elevation}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="btn-ghost">
                  <Star size={18} />
                  <span className="hidden sm:inline">Sačuvaj</span>
                </button>
                <button className="btn-secondary">
                  <Share2 size={18} />
                  <span className="hidden sm:inline">Podeli</span>
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
                  <WeatherIcon type={city.current.icon} size={120} className="relative z-10" />
                </div>
                <div>
                  <h2 className="text-8xl font-display font-bold tracking-tighter text-white temp-display">
                    {city.current.temp}°
                  </h2>
                  <p className="text-xl text-slate-400">{city.current.condition}</p>
                  <p className="text-slate-500">Osećaj: {city.current.feelsLike}°C</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="stat-card">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Wind size={16} />
                    <span className="text-xs uppercase tracking-wider">Vetar</span>
                  </div>
                  <p className="text-xl font-bold text-white">{city.current.windSpeed} km/h</p>
                  <div className="flex items-center gap-1 text-slate-500 text-sm">
                    <Navigation2 size={12} style={{ transform: `rotate(${city.current.windDeg}deg)` }} />
                    <span>{city.current.windDir}</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Droplets size={16} />
                    <span className="text-xs uppercase tracking-wider">Vlažnost</span>
                  </div>
                  <p className="text-xl font-bold text-white">{city.current.humidity}%</p>
                  <p className="text-slate-500 text-sm">Tačka rose: {city.current.dewPoint}°</p>
                </div>
                
                <div className="stat-card">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Gauge size={16} />
                    <span className="text-xs uppercase tracking-wider">Pritisak</span>
                  </div>
                  <p className="text-xl font-bold text-white">{city.current.pressure} hPa</p>
                  <div className="flex items-center gap-1 text-slate-500 text-sm">
                    <TrendingUp size={12} />
                    <span>Raste</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Eye size={16} />
                    <span className="text-xs uppercase tracking-wider">Vidljivost</span>
                  </div>
                  <p className="text-xl font-bold text-white">{city.current.visibility} km</p>
                  <p className="text-slate-500 text-sm">Oblačnost: {city.current.cloudCover}%</p>
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
                    <p className="text-white font-medium">{city.current.sunrise}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Sunset className="text-orange-400" size={20} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Zalazak sunca</p>
                    <p className="text-white font-medium">{city.current.sunset}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <Sun className="text-yellow-400" size={20} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">UV Index</p>
                    <p className="text-white font-medium">{city.current.uvIndex} (Umeren)</p>
                  </div>
                </div>
              </div>
              
              <Link 
                href="/kvalitet-vazduha" 
                className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${getAqiBgColor(city.current.aqi)} transition-colors hover:opacity-80`}
              >
                <span className={`text-2xl font-bold ${getAqiColor(city.current.aqi)}`}>{city.current.aqi}</span>
                <div>
                  <p className={`font-medium ${getAqiColor(city.current.aqi)}`}>AQI</p>
                  <p className="text-slate-400 text-sm">{city.current.aqiLabel}</p>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Hourly & Weekly Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Hourly Forecast */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 neo-card p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <Clock size={20} className="text-slate-400" />
                <h2 className="text-xl font-semibold text-white">Narednih 10 sati</h2>
              </div>
              
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {city.hourly.map((hour, index) => (
                  <div 
                    key={index}
                    className={`flex-shrink-0 flex flex-col items-center gap-3 p-4 rounded-2xl min-w-[80px] ${
                      index === 0 ? 'bg-primary-600/20 border border-primary-500/30' : 'bg-slate-800/30'
                    }`}
                  >
                    <span className="text-sm text-slate-400">{hour.time}</span>
                    <WeatherIcon type={hour.icon} size={32} />
                    <span className="text-lg font-bold text-white">{hour.temp}°</span>
                    {hour.precipitation > 0 && (
                      <div className="flex items-center gap-1 text-blue-400 text-xs">
                        <Droplets size={12} />
                        <span>{hour.precipitation}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Weekly Forecast */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="neo-card p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <Calendar size={20} className="text-slate-400" />
                <h2 className="text-xl font-semibold text-white">7-dnevna</h2>
              </div>
              
              <div className="space-y-3">
                {city.weekly.map((day, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      index === 0 ? 'bg-primary-600/10 border border-primary-500/20' : 'hover:bg-slate-800/30'
                    } transition-colors`}
                  >
                    <div className="flex items-center gap-3 min-w-[80px]">
                      <WeatherIcon type={day.icon} size={24} />
                      <span className={`font-medium ${index === 0 ? 'text-primary-400' : 'text-white'}`}>
                        {day.day}
                      </span>
                    </div>
                    
                    {day.precipitation > 20 && (
                      <div className="flex items-center gap-1 text-blue-400 text-sm">
                        <Droplets size={14} />
                        <span>{day.precipitation}%</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{day.high}°</span>
                      <span className="text-slate-500">{day.low}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* City Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flat-card p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Informacije o gradu</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-slate-500 text-sm">Populacija</p>
                <p className="text-white font-medium">{city.population}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Nadmorska visina</p>
                <p className="text-white font-medium">{city.elevation}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Vremenska zona</p>
                <p className="text-white font-medium">{city.timezone}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Koordinate</p>
                <p className="text-white font-medium">{city.lat.toFixed(2)}°N, {city.lng.toFixed(2)}°E</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
