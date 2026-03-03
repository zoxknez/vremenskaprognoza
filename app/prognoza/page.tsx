"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Droplets,
  Wind,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Cloudy,
  ChevronLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Sunrise,
  Sunset,
  Share2,
  Copy,
  Check,
  Thermometer,
} from "lucide-react";
import Link from "next/link";

import CitySearch, { SearchResult } from "@/components/common/CitySearch";
import { POPULAR_CITIES } from "@/lib/api/balkan-countries";
import {
  TemperatureChart,
  type HourlyForecast,
  type DailyForecast,
} from "@/components/prognoza/TemperatureChart";
import { ForecastSummary } from "@/components/prognoza/ForecastSummary";

const getWeatherIcon = (description: string, size: number = 32) => {
  const desc = description.toLowerCase();
  const style = { width: size, height: size };

  if (desc.includes("sun") || desc.includes("clear") || desc.includes("vedro") || desc.includes("jasno")) {
    return <Sun style={style} />;
  } else if (desc.includes("rain") || desc.includes("kisa")) {
    return <CloudRain style={style} />;
  } else if (desc.includes("snow") || desc.includes("sneg") || desc.includes("snijeg")) {
    return <CloudSnow style={style} />;
  } else if (desc.includes("thunder") || desc.includes("storm") || desc.includes("grmljavina")) {
    return <CloudLightning style={style} />;
  } else if (desc.includes("cloud") || desc.includes("oblac")) {
    return <Cloudy style={style} />;
  } else {
    return <Cloud style={style} />;
  }
};

export default function PrognozaPage() {
  const [selectedCity, setSelectedCity] = useState<SearchResult | undefined>(POPULAR_CITIES[0]);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"hourly" | "daily">("hourly");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSearchSelect = (city: SearchResult) => {
    setSelectedCity(city);
  };

  // Share functionality
  const handleShare = async (method: 'copy' | 'native') => {
    const shareText = selectedCity
      ? `Vremenska prognoza za ${selectedCity.name}: ${dailyForecast[0]?.tempMax}\u00B0/${dailyForecast[0]?.tempMin}\u00B0 - ${dailyForecast[0]?.description}`
      : 'Vremenska prognoza';
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (method === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: `Prognoza - ${selectedCity?.name}`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
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
    setError(null);

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
        // Add deterministic feels-like values when API does not provide them.
        const enhancedDaily = data.daily.map((day: DailyForecast) => ({
          ...day,
          feelsLikeMax: day.feelsLikeMax ?? day.tempMax,
          feelsLikeMin: day.feelsLikeMin ?? day.tempMin,
        }));
        setDailyForecast(enhancedDaily);
      }

    } catch (error) {
      console.error("Forecast fetch error:", error);
      setError("Nije moguće učitati prognozu za izabrani grad.");
      setHourlyForecast([]);
      setDailyForecast([]);

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
                  aria-label="Podeli prognozu"
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
                      {typeof navigator !== 'undefined' && 'share' in navigator && (
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

        {!loading && error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300">
            {error}
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
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
                          <p className="text-xl text-white font-semibold">{hour.temp}&deg;</p>
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
                        <p className="text-3xl text-white font-light mb-4">{hour.temp}&deg;</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Oseca se</span>
                            <span className="text-white">{hour.feelsLike}&deg;</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Vlaznost</span>
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
                          <span className="text-2xl text-white font-light">{day.tempMax}&deg;</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-blue-400" />
                          <span className="text-2xl text-slate-400 font-light">{day.tempMin}&deg;</span>
                        </div>
                      </div>
                      {/* Feels Like */}
                      {day.feelsLikeMax && day.feelsLikeMin && (
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <Thermometer className="w-3 h-3" />
                          <span>Oseca se: {day.feelsLikeMax}&deg; / {day.feelsLikeMin}&deg;</span>
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



