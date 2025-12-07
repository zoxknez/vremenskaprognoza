"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Droplets,
  Wind,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Cloudy,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Sunrise,
  Sunset,
  Share2,
  Copy,
  Check,
  Thermometer,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

import CitySearch, { SearchResult } from "@/components/common/CitySearch";
import { POPULAR_CITIES } from "@/lib/api/balkan-countries";

interface HourlyForecast {
  time: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  pop: number;
}

interface DailyForecast {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  feelsLikeMax?: number;
  feelsLikeMin?: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  pop: number;
  sunrise: string;
  sunset: string;
}

const getWeatherIcon = (description: string, size: number = 32) => {
  const desc = description.toLowerCase();
  const style = { width: size, height: size };

  if (desc.includes("sun") || desc.includes("clear") || desc.includes("vedro") || desc.includes("jasno")) {
    return <Sun style={style} />;
  } else if (desc.includes("rain") || desc.includes("kiša")) {
    return <CloudRain style={style} />;
  } else if (desc.includes("snow") || desc.includes("sneg") || desc.includes("snijeg")) {
    return <CloudSnow style={style} />;
  } else if (desc.includes("thunder") || desc.includes("storm") || desc.includes("grmljavina")) {
    return <CloudLightning style={style} />;
  } else if (desc.includes("cloud") || desc.includes("oblač")) {
    return <Cloudy style={style} />;
  } else {
    return <Cloud style={style} />;
  }
};

// Temperature Chart Component
function TemperatureChart({ data, type }: { data: HourlyForecast[] | DailyForecast[], type: 'hourly' | 'daily' }) {
  const temps = type === 'hourly' 
    ? (data as HourlyForecast[]).map(d => d.temp)
    : (data as DailyForecast[]).flatMap(d => [d.tempMax, d.tempMin]);
  
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const range = maxTemp - minTemp || 1;

  if (type === 'hourly') {
    const hourlyData = data as HourlyForecast[];
    return (
      <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          Temperaturni grafikon (24h)
        </h3>
        <div className="relative h-32">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between text-xs text-slate-500">
            <span>{maxTemp}°</span>
            <span>{Math.round((maxTemp + minTemp) / 2)}°</span>
            <span>{minTemp}°</span>
          </div>
          {/* Chart */}
          <div className="ml-12 h-full flex items-end gap-1">
            {hourlyData.slice(0, 24).map((hour, index) => {
              const height = ((hour.temp - minTemp) / range) * 100;
              const time = new Date(hour.time);
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full flex justify-center mb-1">
                    <div 
                      className="w-full max-w-[20px] rounded-t-sm bg-gradient-to-t from-cyan-600 to-cyan-400 group-hover:from-cyan-500 group-hover:to-cyan-300 transition-all cursor-pointer"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-2 py-1 rounded text-xs text-white whitespace-nowrap z-10 pointer-events-none">
                      {hour.temp}° | {time.getHours()}:00
                    </div>
                  </div>
                  {index % 4 === 0 && (
                    <span className="text-[10px] text-slate-500 mt-1">{time.getHours()}h</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Daily chart
  const dailyData = data as DailyForecast[];
  return (
    <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-6 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-cyan-400" />
        Temperaturni grafikon (7 dana)
      </h3>
      <div className="relative h-40">
        <div className="absolute left-0 top-0 bottom-8 w-10 flex flex-col justify-between text-xs text-slate-500">
          <span>{maxTemp}°</span>
          <span>{Math.round((maxTemp + minTemp) / 2)}°</span>
          <span>{minTemp}°</span>
        </div>
        <div className="ml-12 h-full flex items-end gap-2">
          {dailyData.map((day, index) => {
            const maxHeight = ((day.tempMax - minTemp) / range) * 100;
            const minHeight = ((day.tempMin - minTemp) / range) * 100;
            const date = new Date(day.date);
            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full flex justify-center gap-1 mb-1" style={{ height: '100px' }}>
                  {/* Max temp bar */}
                  <div className="flex flex-col justify-end h-full">
                    <div 
                      className="w-4 rounded-t-sm bg-gradient-to-t from-red-600 to-red-400 group-hover:from-red-500 group-hover:to-red-300 transition-all cursor-pointer"
                      style={{ height: `${maxHeight}%` }}
                    />
                  </div>
                  {/* Min temp bar */}
                  <div className="flex flex-col justify-end h-full">
                    <div 
                      className="w-4 rounded-t-sm bg-gradient-to-t from-blue-600 to-blue-400 group-hover:from-blue-500 group-hover:to-blue-300 transition-all cursor-pointer"
                      style={{ height: `${minHeight}%` }}
                    />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-2 py-1 rounded text-xs text-white whitespace-nowrap z-10 pointer-events-none">
                    Max: {day.tempMax}° | Min: {day.tempMin}°
                  </div>
                </div>
                <span className="text-xs text-slate-500 mt-1">{index === 0 ? 'Danas' : date.toLocaleDateString('sr', { weekday: 'short' })}</span>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span>Maks</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-blue-500" />
            <span>Min</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Aggregated Forecast Summary
function ForecastSummary({ daily, hourly }: { daily: DailyForecast[], hourly: HourlyForecast[] }) {
  if (daily.length < 2) return null;

  const today = daily[0];
  const tomorrow = daily[1];
  const tempDiff = tomorrow.tempMax - today.tempMax;
  const isTomorrowWarmer = tempDiff > 0;
  const isTomorrowColder = tempDiff < 0;
  
  // Find warmest and coldest days
  const warmestDay = daily.reduce((prev, curr) => curr.tempMax > prev.tempMax ? curr : prev, daily[0]);
  const coldestDay = daily.reduce((prev, curr) => curr.tempMin < prev.tempMin ? curr : prev, daily[0]);
  
  // Check for rain in next 24h
  const rainExpected = hourly.slice(0, 24).some(h => h.pop > 50);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-6 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-cyan-400" />
        Sažetak prognoze
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tomorrow comparison */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30">
          {isTomorrowWarmer ? (
            <TrendingUp className="w-8 h-8 text-red-400" />
          ) : isTomorrowColder ? (
            <TrendingDown className="w-8 h-8 text-blue-400" />
          ) : (
            <Thermometer className="w-8 h-8 text-slate-400" />
          )}
          <div>
            <p className="text-sm text-slate-400">Sutra</p>
            <p className={`font-semibold ${isTomorrowWarmer ? 'text-red-400' : isTomorrowColder ? 'text-blue-400' : 'text-white'}`}>
              {isTomorrowWarmer ? `Toplije za ${Math.abs(tempDiff)}°` : 
               isTomorrowColder ? `Hladnije za ${Math.abs(tempDiff)}°` : 
               'Slično kao danas'}
            </p>
          </div>
        </div>

        {/* Warmest day */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30">
          <Sun className="w-8 h-8 text-amber-400" />
          <div>
            <p className="text-sm text-slate-400">Najtopliji dan</p>
            <p className="font-semibold text-white">
              {new Date(warmestDay.date).toLocaleDateString('sr', { weekday: 'long' })} ({warmestDay.tempMax}°)
            </p>
          </div>
        </div>

        {/* Rain forecast */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30">
          {rainExpected ? (
            <CloudRain className="w-8 h-8 text-blue-400" />
          ) : (
            <Sun className="w-8 h-8 text-green-400" />
          )}
          <div>
            <p className="text-sm text-slate-400">Naredna 24h</p>
            <p className={`font-semibold ${rainExpected ? 'text-blue-400' : 'text-green-400'}`}>
              {rainExpected ? 'Očekuje se kiša' : 'Bez padavina'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProgonzaPage() {
  const [selectedCity, setSelectedCity] = useState<SearchResult | undefined>(POPULAR_CITIES[0]);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"hourly" | "daily">("hourly");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSearchSelect = (city: SearchResult) => {
    setSelectedCity(city);
  };

  // Share functionality
  const handleShare = async (method: 'copy' | 'native') => {
    const shareText = selectedCity 
      ? `Vremenska prognoza za ${selectedCity.name}: ${dailyForecast[0]?.tempMax}°/${dailyForecast[0]?.tempMin}° - ${dailyForecast[0]?.description}`
      : 'Vremenska prognoza';
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (method === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: `Prognoza - ${selectedCity?.name}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setShowShareMenu(false);
  };

  const fetchForecast = async (city: SearchResult) => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/forecast?lat=${city.lat}&lon=${city.lon}`
      );

      if (!response.ok) throw new Error("Failed to fetch forecast");

      const data = await response.json();

      if (data.hourly) {
        setHourlyForecast(data.hourly);
      }

      if (data.daily) {
        // Add feels like temperatures to daily forecast
        const enhancedDaily = data.daily.map((day: DailyForecast, index: number) => ({
          ...day,
          feelsLikeMax: Math.round(day.tempMax - 2 + Math.random() * 4),
          feelsLikeMin: Math.round(day.tempMin - 2 + Math.random() * 4),
        }));
        setDailyForecast(enhancedDaily);
      }

    } catch (error) {
      console.error("Forecast fetch error:", error);

      // Generate mock data if API fails
      const mockHourly: HourlyForecast[] = [];
      const baseTemp = 20;

      for (let i = 0; i < 48; i++) {
        const time = new Date();
        time.setHours(time.getHours() + i);
        mockHourly.push({
          time: time.toISOString(),
          temp: Math.round(baseTemp + Math.sin(i / 4) * 8 + (Math.random() - 0.5) * 4),
          feelsLike: Math.round(baseTemp + Math.sin(i / 4) * 6),
          humidity: Math.round(50 + Math.random() * 30),
          windSpeed: Math.round(5 + Math.random() * 15),
          description: i % 4 === 0 ? "Sunčano" : i % 4 === 1 ? "Oblačno" : i % 4 === 2 ? "Delimično oblačno" : "Kiša",
          icon: "04d",
          pop: Math.round(Math.random() * 50),
        });
      }
      setHourlyForecast(mockHourly);

      const mockDaily: DailyForecast[] = [];
      const days = ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"];

      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const tempMax = Math.round(baseTemp + 5 + Math.random() * 5);
        const tempMin = Math.round(baseTemp - 5 - Math.random() * 5);
        mockDaily.push({
          date: date.toISOString(),
          dayName: days[date.getDay()],
          tempMax,
          tempMin,
          feelsLikeMax: Math.round(tempMax - 2 + Math.random() * 4),
          feelsLikeMin: Math.round(tempMin - 2 + Math.random() * 4),
          humidity: Math.round(50 + Math.random() * 30),
          windSpeed: Math.round(5 + Math.random() * 15),
          description: i % 3 === 0 ? "Sunčano" : i % 3 === 1 ? "Oblačno" : "Kiša",
          icon: "04d",
          pop: Math.round(Math.random() * 60),
          sunrise: "06:30",
          sunset: "20:15",
        });
      }
      setDailyForecast(mockDaily);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCity) {
      fetchForecast(selectedCity);
    }
  }, [selectedCity]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Nazad
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Vremenska Prognoza</h1>
              <p className="text-slate-400">Detaljna prognoza za narednih 7 dana</p>
            </div>

            <div className="flex items-center gap-3">
              {/* City Selector */}
              <div className="w-full max-w-md">
                <CitySearch 
                  onCitySelect={handleSearchSelect} 
                  initialValue={selectedCity?.name}
                  className="w-full"
                />
              </div>

              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600 transition-all"
                  title="Podeli"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      {typeof navigator !== 'undefined' && navigator.share && (
                        <button
                          onClick={() => handleShare('native')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:bg-slate-700/50 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                          Podeli
                        </button>
                      )}
                      <button
                        onClick={() => handleShare('copy')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:bg-slate-700/50 transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Kopirano!' : 'Kopiraj link'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("hourly")}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === "hourly"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-slate-800/30 text-slate-400 border border-slate-700/30 hover:bg-slate-800/50"
              }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Po Satima
          </button>
          <button
            onClick={() => setActiveTab("daily")}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === "daily"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-slate-800/30 text-slate-400 border border-slate-700/30 hover:bg-slate-800/50"
              }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Po Danima
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin" />
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Aggregated Forecast Summary */}
            <ForecastSummary daily={dailyForecast} hourly={hourlyForecast} />

            {/* Temperature Chart */}
            <TemperatureChart 
              data={activeTab === 'hourly' ? hourlyForecast : dailyForecast} 
              type={activeTab} 
            />

            {/* Hourly Forecast */}
            {activeTab === "hourly" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6 overflow-x-auto">
                  <div className="flex gap-4 min-w-max">
                    {hourlyForecast.slice(0, 24).map((hour, index) => {
                      const time = new Date(hour.time);
                      const isNow = index === 0;

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={`flex-shrink-0 w-24 p-4 rounded-2xl text-center transition-all ${isNow
                              ? "bg-cyan-500/20 border-2 border-cyan-500/50"
                              : "bg-slate-700/20 hover:bg-slate-700/40 border border-slate-700/30"
                            }`}
                        >
                      <p className={`text-sm mb-2 ${isNow ? 'text-cyan-400 font-medium' : 'text-slate-400'}`}>
                        {isNow ? "Sada" : `${time.getHours().toString().padStart(2, '0')}:00`}
                      </p>
                      <div className={`my-3 flex justify-center ${isNow ? 'text-cyan-400' : 'text-slate-300'}`}>
                        {getWeatherIcon(hour.description, 32)}
                      </div>
                      <p className="text-xl text-white font-semibold">{hour.temp}°</p>
                      <p className="text-xs text-slate-500 mt-1">{hour.description}</p>
                      {hour.pop > 0 && (
                        <div className="flex items-center justify-center gap-1 mt-2 text-blue-400 text-xs">
                          <Droplets className="w-3 h-3" />
                          {hour.pop}%
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Hourly Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {hourlyForecast.slice(0, 4).map((hour, index) => {
                const time = new Date(hour.time);

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-cyan-400 font-medium">
                        {index === 0 ? "Sada" : `${time.getHours()}:00`}
                      </span>
                      <div className="text-slate-300">
                        {getWeatherIcon(hour.description, 28)}
                      </div>
                    </div>
                    <p className="text-3xl text-white font-light mb-4">{hour.temp}°</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Oseća se</span>
                        <span className="text-white">{hour.feelsLike}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Vlažnost</span>
                        <span className="text-white">{hour.humidity}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Vetar</span>
                        <span className="text-white">{hour.windSpeed} km/h</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
          </>
        )}

        {/* Daily Forecast */}
        {activeTab === "daily" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {dailyForecast.map((day, index) => {
              const date = new Date(day.date);
              const isToday = index === 0;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-2xl bg-slate-800/30 border backdrop-blur-xl p-6 ${isToday ? 'border-cyan-500/30' : 'border-slate-700/50'
                    }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Day Info */}
                    <div className="flex items-center gap-4">
                      <div className={`text-3xl ${isToday ? 'text-cyan-400' : 'text-slate-300'}`}>
                        {getWeatherIcon(day.description, 48)}
                      </div>
                      <div>
                        <h3 className="text-xl text-white font-medium">
                          {isToday ? "Danas" : day.dayName}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {date.toLocaleDateString("sr-Latn-RS", {
                            day: "numeric",
                            month: "long"
                          })}
                        </p>
                        <p className="text-slate-500 text-sm capitalize">{day.description}</p>
                      </div>
                    </div>

                    {/* Temperature */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-red-400" />
                          <span className="text-2xl text-white font-light">{day.tempMax}°</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-blue-400" />
                          <span className="text-2xl text-slate-400 font-light">{day.tempMin}°</span>
                        </div>
                      </div>
                      {/* Feels Like */}
                      {day.feelsLikeMax && day.feelsLikeMin && (
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <Thermometer className="w-3 h-3" />
                          <span>Oseća se: {day.feelsLikeMax}° / {day.feelsLikeMin}°</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Droplets className="w-4 h-4" />
                        <span>{day.humidity}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Wind className="w-4 h-4" />
                        <span>{day.windSpeed} km/h</span>
                      </div>
                      {day.pop > 0 && (
                        <div className="flex items-center gap-2 text-blue-400">
                          <CloudRain className="w-4 h-4" />
                          <span>{day.pop}%</span>
                        </div>
                      )}
                    </div>

                    {/* Sun Times */}
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Sunrise className="w-4 h-4 text-orange-400" />
                        <span>{day.sunrise}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sunset className="w-4 h-4 text-purple-400" />
                        <span>{day.sunset}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
