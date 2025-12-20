"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Globe,
  TrendingUp,
  TrendingDown,
  Activity,
  Database,
  Wifi,
  AlertCircle,
} from "lucide-react";

interface StatsData {
  stats: {
    totalStations: number;
    totalCities: number;
    totalCountries: number;
    citiesWithData: string[];
    countriesWithData: string[];
    sourcesCount: {
      waqi: number;
      openweather: number;
      openaq: number;
      sensorCommunity: number;
      aqicn: number;
      airvisual: number;
      sepa: number;
      allthingstalk: number;
    };
    averageAQI: number;
    worstCity: {
      name: string;
      aqi: number;
      country: string;
    } | null;
    bestCity: {
      name: string;
      aqi: number;
      country: string;
    } | null;
  };
  countryStats: Array<{
    country: string;
    totalStations: number;
    averageAQI: number;
    cities: number;
  }>;
}

export function AirQualityStatsCard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/air-quality/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700/50 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-700/50 rounded"></div>
            <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-3xl bg-slate-800/30 border border-red-500/30 backdrop-blur-xl p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-6 h-6" />
          <p>Greška pri učitavanju statistike</p>
        </div>
      </div>
    );
  }

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return "text-green-400";
    if (aqi <= 100) return "text-yellow-400";
    if (aqi <= 150) return "text-orange-400";
    if (aqi <= 200) return "text-red-400";
    return "text-purple-400";
  };

  const getAQIBg = (aqi: number): string => {
    if (aqi <= 50) return "bg-green-500/20 border-green-500/30";
    if (aqi <= 100) return "bg-yellow-500/20 border-yellow-500/30";
    if (aqi <= 150) return "bg-orange-500/20 border-orange-500/30";
    if (aqi <= 200) return "bg-red-500/20 border-red-500/30";
    return "bg-purple-500/20 border-purple-500/30";
  };

  const activeSources = Object.entries(stats.stats.sourcesCount)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-semibold text-white">Statistika Mreže</h3>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-slate-700/20 border border-slate-600/30">
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 text-sm">Stanice</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.stats.totalStations}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-700/20 border border-slate-600/30">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400 text-sm">Gradova</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.stats.totalCities}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-700/20 border border-slate-600/30">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-green-400" />
            <span className="text-slate-400 text-sm">Država</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.stats.totalCountries}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-700/20 border border-slate-600/30">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-yellow-400" />
            <span className="text-slate-400 text-sm">Prosečan AQI</span>
          </div>
          <p className={`text-3xl font-bold ${getAQIColor(stats.stats.averageAQI)}`}>
            {stats.stats.averageAQI}
          </p>
        </div>
      </div>

      {/* Best and Worst Cities */}
      {stats.stats.bestCity && stats.stats.worstCity && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded-2xl border ${getAQIBg(stats.stats.bestCity.aqi)}`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">Najčistiji Vazduh</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.stats.bestCity.name}</p>
            <p className="text-sm text-slate-400">{stats.stats.bestCity.country}</p>
            <p className={`text-3xl font-bold mt-2 ${getAQIColor(stats.stats.bestCity.aqi)}`}>
              AQI {stats.stats.bestCity.aqi}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${getAQIBg(stats.stats.worstCity.aqi)}`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-red-400" />
              <span className="text-white font-medium">Najzagađeniji Vazduh</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.stats.worstCity.name}</p>
            <p className="text-sm text-slate-400">{stats.stats.worstCity.country}</p>
            <p className={`text-3xl font-bold mt-2 ${getAQIColor(stats.stats.worstCity.aqi)}`}>
              AQI {stats.stats.worstCity.aqi}
            </p>
          </div>
        </div>
      )}

      {/* Active Data Sources */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-cyan-400" />
          Aktivni Izvori Podataka
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {activeSources.map(([source, count]) => (
            <div
              key={source}
              className="p-3 rounded-xl bg-slate-700/20 border border-slate-600/30"
            >
              <p className="text-xs text-slate-400 uppercase">{source}</p>
              <p className="text-lg font-bold text-white">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Country Statistics */}
      <div>
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-green-400" />
          Statistika po Državama
        </h4>
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {stats.countryStats.map((country, index) => (
            <motion.div
              key={country.country}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 rounded-xl bg-slate-700/20 border border-slate-600/30 hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium">{country.country}</p>
                  <p className="text-sm text-slate-400">
                    {country.cities} {country.cities === 1 ? 'grad' : 'gradova'} • {country.totalStations} {country.totalStations === 1 ? 'stanica' : 'stanica'}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getAQIColor(country.averageAQI)}`}>
                    {country.averageAQI}
                  </p>
                  <p className="text-xs text-slate-400">Prosek AQI</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
