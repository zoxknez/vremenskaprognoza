'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  CloudSun, 
  Wind, 
  Droplets, 
  Thermometer,
  MapPin,
  Search,
  ArrowRight,
  Sun,
  Moon,
  CloudRain,
  Cloud,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  TrendingUp,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Navigation } from '@/components/layout/Navigation';

// Mock weather data - will be replaced with API
const currentWeather = {
  location: 'Beograd',
  country: 'Srbija',
  temp: 24,
  feelsLike: 26,
  condition: 'Pretežno oblačno',
  icon: 'cloudy',
  humidity: 65,
  windSpeed: 12,
  windDir: 'SZ',
  pressure: 1015,
  visibility: 10,
  uvIndex: 5,
  aqi: 72,
  aqiLabel: 'Umeren',
  sunrise: '05:42',
  sunset: '20:31',
};

const hourlyForecast = [
  { time: 'Sada', temp: 24, icon: 'cloudy' },
  { time: '14:00', temp: 26, icon: 'sunny' },
  { time: '15:00', temp: 27, icon: 'sunny' },
  { time: '16:00', temp: 26, icon: 'partly-cloudy' },
  { time: '17:00', temp: 25, icon: 'partly-cloudy' },
  { time: '18:00', temp: 23, icon: 'cloudy' },
  { time: '19:00', temp: 21, icon: 'cloudy' },
  { time: '20:00', temp: 19, icon: 'night' },
];

const weeklyForecast = [
  { day: 'Pon', date: '24', high: 28, low: 18, icon: 'sunny', precipitation: 0 },
  { day: 'Uto', date: '25', high: 30, low: 19, icon: 'sunny', precipitation: 0 },
  { day: 'Sre', date: '26', high: 27, low: 20, icon: 'partly-cloudy', precipitation: 20 },
  { day: 'Čet', date: '27', high: 24, low: 17, icon: 'rainy', precipitation: 80 },
  { day: 'Pet', date: '28', high: 22, low: 15, icon: 'rainy', precipitation: 60 },
  { day: 'Sub', date: '29', high: 25, low: 16, icon: 'partly-cloudy', precipitation: 30 },
  { day: 'Ned', date: '30', high: 27, low: 17, icon: 'sunny', precipitation: 10 },
];

const cities = [
  { name: 'Beograd', temp: 24, icon: 'cloudy', aqi: 72 },
  { name: 'Novi Sad', temp: 25, icon: 'sunny', aqi: 58 },
  { name: 'Niš', temp: 27, icon: 'sunny', aqi: 85 },
  { name: 'Kragujevac', temp: 23, icon: 'partly-cloudy', aqi: 63 },
  { name: 'Subotica', temp: 24, icon: 'sunny', aqi: 45 },
  { name: 'Sarajevo', temp: 21, icon: 'cloudy', aqi: 67 },
];

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
  if (aqi <= 200) return 'text-aqi-unhealthy';
  if (aqi <= 300) return 'text-aqi-veryUnhealthy';
  return 'text-red-500';
}

function getAqiBgColor(aqi: number): string {
  if (aqi <= 50) return 'bg-aqi-good/20 border-aqi-good/30';
  if (aqi <= 100) return 'bg-aqi-moderate/20 border-aqi-moderate/30';
  if (aqi <= 150) return 'bg-aqi-sensitive/20 border-aqi-sensitive/30';
  if (aqi <= 200) return 'bg-aqi-unhealthy/20 border-aqi-unhealthy/30';
  if (aqi <= 300) return 'bg-aqi-veryUnhealthy/20 border-aqi-veryUnhealthy/30';
  return 'bg-red-900/20 border-red-500/30';
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Pretraži grad ili lokaciju..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-dark pl-12 pr-4 w-full"
              />
            </div>
          </motion.div>

          {/* Main Weather Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="neo-card p-8 mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              {/* Left: Location & Temperature */}
              <div className="flex-1">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <MapPin size={16} />
                  <span>{currentWeather.location}, {currentWeather.country}</span>
                </div>
                
                <div className="flex items-start gap-6">
                  <div>
                    <h1 className="text-8xl lg:text-9xl font-display font-bold tracking-tighter temp-display text-white">
                      {currentWeather.temp}°
                    </h1>
                    <p className="text-xl text-slate-400 mt-2">
                      {currentWeather.condition}
                    </p>
                    <p className="text-slate-500 mt-1">
                      Osećaj: {currentWeather.feelsLike}°C
                    </p>
                  </div>
                  
                  <div className="weather-icon-container">
                    <div className="weather-icon-glow bg-weather-cloudy" />
                    <WeatherIcon type={currentWeather.icon} size={100} className="relative z-10" />
                  </div>
                </div>
              </div>

              {/* Right: Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4 lg:w-80">
                <div className="stat-card">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Wind size={16} />
                    <span className="stat-label">Vetar</span>
                  </div>
                  <p className="stat-value">{currentWeather.windSpeed} km/h</p>
                  <p className="text-sm text-slate-500">{currentWeather.windDir}</p>
                </div>
                
                <div className="stat-card">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Droplets size={16} />
                    <span className="stat-label">Vlažnost</span>
                  </div>
                  <p className="stat-value">{currentWeather.humidity}%</p>
                </div>
                
                <div className="stat-card">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Eye size={16} />
                    <span className="stat-label">Vidljivost</span>
                  </div>
                  <p className="stat-value">{currentWeather.visibility} km</p>
                </div>
                
                <div className="stat-card">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Gauge size={16} />
                    <span className="stat-label">Pritisak</span>
                  </div>
                  <p className="stat-value">{currentWeather.pressure} hPa</p>
                </div>
              </div>
            </div>

            {/* Sun & AQI Info Bar */}
            <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Sunrise size={18} className="text-amber-400" />
                  <span className="text-slate-400">Izlazak: <span className="text-white">{currentWeather.sunrise}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Sunset size={18} className="text-orange-400" />
                  <span className="text-slate-400">Zalazak: <span className="text-white">{currentWeather.sunset}</span></span>
                </div>
              </div>
              
              <Link href="/kvalitet-vazduha" className={`flex items-center gap-3 px-4 py-2 rounded-full border ${getAqiBgColor(currentWeather.aqi)}`}>
                <span className={`font-bold ${getAqiColor(currentWeather.aqi)}`}>AQI {currentWeather.aqi}</span>
                <span className="text-slate-400">{currentWeather.aqiLabel}</span>
                <ChevronRight size={16} className="text-slate-500" />
              </Link>
            </div>
          </motion.div>

          {/* Hourly Forecast */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="neo-card p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Satna prognoza</h2>
              <Link href="/prognoza" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-sm">
                Detaljna prognoza <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {hourlyForecast.map((hour, index) => (
                <div 
                  key={index}
                  className={`flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl ${
                    index === 0 ? 'bg-primary-600/20 border border-primary-500/30' : 'bg-slate-800/30'
                  }`}
                >
                  <span className="text-sm text-slate-400">{hour.time}</span>
                  <WeatherIcon type={hour.icon} size={28} />
                  <span className="font-semibold text-white">{hour.temp}°</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Weekly Forecast & Air Quality */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* 7-Day Forecast */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 neo-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">7-dnevna prognoza</h2>
                <Link href="/prognoza" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-sm">
                  Prikaži sve <ArrowRight size={14} />
                </Link>
              </div>
              
              <div className="space-y-3">
                {weeklyForecast.map((day, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="w-16">
                      <p className="font-medium text-white">{day.day}</p>
                      <p className="text-sm text-slate-500">{day.date}</p>
                    </div>
                    
                    <WeatherIcon type={day.icon} size={28} />
                    
                    <div className="flex-1 flex items-center gap-3">
                      <span className="text-white font-medium w-10">{day.high}°</span>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-amber-400 rounded-full"
                          style={{ width: `${((day.high - 15) / 20) * 100}%` }}
                        />
                      </div>
                      <span className="text-slate-500 w-10">{day.low}°</span>
                    </div>
                    
                    {day.precipitation > 0 && (
                      <div className="flex items-center gap-1 text-blue-400">
                        <Droplets size={14} />
                        <span className="text-sm">{day.precipitation}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Other Cities */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="neo-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Drugi gradovi</h2>
                <Link href="/mapa" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-sm">
                  Mapa <ArrowRight size={14} />
                </Link>
              </div>
              
              <div className="space-y-3">
                {cities.map((city, index) => (
                  <Link 
                    key={index}
                    href={`/grad/${city.name.toLowerCase()}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <WeatherIcon type={city.icon} size={24} />
                      <span className="text-white group-hover:text-primary-400 transition-colors">{city.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm ${getAqiColor(city.aqi)}`}>AQI {city.aqi}</span>
                      <span className="text-xl font-semibold text-white">{city.temp}°</span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: Thermometer, title: 'Vremenska prognoza', desc: '7-dnevna i satna prognoza', href: '/prognoza' },
              { icon: Gauge, title: 'Kvalitet vazduha', desc: 'AQI i PM2.5 monitoring', href: '/kvalitet-vazduha' },
              { icon: Sun, title: 'UV Index', desc: 'Nivo UV zračenja', href: '/uv-index' },
              { icon: TrendingUp, title: 'Statistika', desc: 'Istorijski podaci', href: '/statistika' },
            ].map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="flat-card-hover p-6 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center mb-4 group-hover:bg-primary-600/30 transition-colors">
                  <feature.icon className="text-primary-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary-400" size={20} />
              <span className="font-semibold text-white">VremenskaPrognoza</span>
            </div>
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} VremenskaPrognoza. Sva prava zadržana.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/o-nama" className="text-slate-400 hover:text-white text-sm transition-colors">O nama</Link>
              <Link href="/api" className="text-slate-400 hover:text-white text-sm transition-colors">API</Link>
              <Link href="/kontakt" className="text-slate-400 hover:text-white text-sm transition-colors">Kontakt</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

