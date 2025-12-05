"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import Link from "next/link";

import { POPULAR_CITIES } from "@/lib/api/balkan-countries";

interface HourlyForecast {
  time: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  pop: number; // Probability of precipitation
}

interface DailyForecast {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
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

export default function ProgonzaPage() {
  const [selectedCity, setSelectedCity] = useState<typeof POPULAR_CITIES[0] | undefined>(POPULAR_CITIES[0]);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"hourly" | "daily">("hourly");

  const fetchForecast = async (city: typeof POPULAR_CITIES[0]) => {
    setLoading(true);

    try {
      // Fetch 5-day forecast from OpenWeather
      const response = await fetch(
        `/api/forecast?lat=${city.lat}&lon=${city.lon}`
      );

      if (!response.ok) throw new Error("Failed to fetch forecast");

      const data = await response.json();

      if (data.hourly) {
        setHourlyForecast(data.hourly);
      }

      if (data.daily) {
        setDailyForecast(data.daily);
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
        mockDaily.push({
          date: date.toISOString(),
          dayName: days[date.getDay()],
          tempMax: Math.round(baseTemp + 5 + Math.random() * 5),
          tempMin: Math.round(baseTemp - 5 - Math.random() * 5),
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

            {/* City Selector */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 pointer-events-none" />
                <select
                  value={selectedCity?.name ?? ''}
                  onChange={(e) => {
                    const city = POPULAR_CITIES.find(c => c.name === e.target.value);
                    if (city) setSelectedCity(city);
                  }}
                  className="pl-10 pr-8 py-3 bg-slate-800 border-2 border-cyan-500/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 appearance-none cursor-pointer min-w-[200px] shadow-lg"
                >
                  {POPULAR_CITIES.map(city => (
                    <option key={city.name} value={city.name} className="bg-slate-800 text-white">
                      {city.name}, {city.country}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 rotate-90 pointer-events-none" />
              </div>

              <button
                onClick={() => selectedCity && fetchForecast(selectedCity)}
                disabled={loading || !selectedCity}
                className="p-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl text-cyan-400 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
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

        {/* Hourly Forecast */}
        {!loading && activeTab === "hourly" && (
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

        {/* Daily Forecast */}
        {!loading && activeTab === "daily" && (
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
