"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Leaf,
  AlertTriangle,
  ChevronLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Info,
  Heart,
  Shield,
  Activity,
} from "lucide-react";
import Link from "next/link";
import CitySearch, { SearchResult } from "@/components/common/CitySearch";
import { POPULAR_CITIES } from "@/lib/api/balkan-countries";
import { AirQualityData } from "@/lib/types/weather";
import { getAQIColor, getAQIBg, getAQILabel } from "@/components/weather/weather-utils";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { AQIHistoryChart, type HistoricalAQI } from "@/components/kvalitet-vazduha/AQIHistoryChart";
import { WHOComparison } from "@/components/kvalitet-vazduha/WHOComparison";
import { NearbyStationsCard, type NearbyStation } from "@/components/kvalitet-vazduha/NearbyStationsCard";
import { NotificationBanner } from "@/components/kvalitet-vazduha/NotificationBanner";

import { getAQIDescription, getHealthRecommendations } from "@/lib/utils/aqi";

export default function KvalitetVazduhaPage() {
  const [selectedCity, setSelectedCity] = useState<SearchResult | undefined>(POPULAR_CITIES[0]);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [allCitiesAqi, setAllCitiesAqi] = useState<{ name: string; country: string; aqi: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [aqiHistory, setAqiHistory] = useState<HistoricalAQI[]>([]);
  const [nearbyStations, setNearbyStations] = useState<NearbyStation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { isFavorite, toggleFavorite } = useFavorites();

  const handleSearchSelect = (city: SearchResult) => {
    setSelectedCity(city);
  };

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          // Show confirmation notification
          new Notification('VremeVazduh', {
            body: 'Notifikacije za kvalitet vazduha su ukljucene!',
            icon: '/icons/icon-192x192.png'
          });
        }
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const fetchAirQuality = async (city: SearchResult) => {
    setLoading(true);
    setError(null);

    try {
      const [aqiResponse, historyResponse, stationsResponse] = await Promise.all([
        fetch(`/api/air-quality?lat=${city.lat}&lon=${city.lon}`),
        fetch(`/api/air-quality/history?lat=${city.lat}&lon=${city.lon}`),
        fetch(`/api/air-quality/stations?lat=${city.lat}&lon=${city.lon}&radius=25`),
      ]);

      if (!aqiResponse.ok) throw new Error("Failed to fetch air quality");

      const data = await aqiResponse.json();
      const historyPayload = historyResponse.ok ? await historyResponse.json() : { history: [] };
      const stationsPayload = stationsResponse.ok ? await stationsResponse.json() : { stations: [] };

      const aqiData: AirQualityData = {
        aqi: data.aqi || 50,
        pm25: data.pm25 || 0,
        pm10: data.pm10 || 0,
        no2: data.no2 || 0,
        o3: data.o3 || 0,
        co: data.co || 0,
        so2: data.so2 || 0,
      };

      setAirQuality(aqiData);
      setAqiHistory(
        Array.isArray(historyPayload.history)
          ? historyPayload.history.map((item: HistoricalAQI) => ({
              time: item.time,
              aqi: item.aqi,
              label: item.label || getAQILabel(item.aqi),
            }))
          : []
      );

      setNearbyStations(
        Array.isArray(stationsPayload.stations)
          ? stationsPayload.stations.map((station: {
              name: string;
              distance: number;
              aqi: number;
              lat: number;
              lon: number;
            }) => ({
              name: station.name,
              distance: station.distance,
              aqi: station.aqi,
              lat: station.lat,
              lon: station.lon,
            }))
          : []
      );

    } catch (error) {
      console.error("Air quality fetch error:", error);
      setError("Nije moguće učitati podatke o kvalitetu vazduha za izabrani grad.");
      setAirQuality(null);
      setAqiHistory([]);
      setNearbyStations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCitiesAqi = async () => {
    // Use the most relevant cities (major Balkan cities)
    const citiesToFetch = POPULAR_CITIES.slice(0, 12);

    const promises = citiesToFetch.map(async (city) => {
      try {
        const response = await fetch(
          `/api/air-quality?lat=${city.lat}&lon=${city.lon}`,
          {
            method: 'GET',
            cache: 'no-cache',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Only return if we have valid AQI data
          if (data.aqi && typeof data.aqi === 'number' && data.aqi > 0 && data.aqi < 500) {
            return {
              name: city.name,
              country: city.country,
              aqi: Math.round(data.aqi),
            };
          }
        }
      } catch (error) {
        console.error(`Failed to fetch AQI for ${city.name}:`, error);
      }
      // Return null for invalid data - will be filtered out
      return null;
    });

    const fetchedResults = (await Promise.all(promises))
      .filter((result): result is { name: string; country: string; aqi: number } => result !== null)
      .sort((a, b) => a.aqi - b.aqi);

    // Only update if we have at least some valid data
    if (fetchedResults.length > 0) {
      setAllCitiesAqi(fetchedResults);
    }
  };

  useEffect(() => {
    if (selectedCity) {
      fetchAirQuality(selectedCity);
    }
  }, [selectedCity]);

  useEffect(() => {
    fetchAllCitiesAqi();
  }, []);

  const pollutants = airQuality ? [
    { name: "PM2.5", value: airQuality.pm25, unit: "ug/m3", max: 75, desc: "Fine cestice" },
    { name: "PM10", value: airQuality.pm10, unit: "ug/m3", max: 150, desc: "Grube cestice" },
    { name: "NO2", value: airQuality.no2, unit: "ug/m3", max: 200, desc: "Azot dioksid" },
    { name: "O3", value: airQuality.o3, unit: "ug/m3", max: 180, desc: "Ozon" },
    { name: "CO", value: airQuality.co, unit: "ug/m3", max: 10000, desc: "Ugljen monoksid" },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-2 group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Nazad na pocetnu
            </Link>
            <h1 className="text-4xl font-bold text-white">
              Kvalitet <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">vazduha</span>
            </h1>
            <p className="text-slate-400 max-w-lg">
              Detaljna analiza zagadjenja i zdravstvene preporuke u realnom vremenu.
            </p>
          </motion.div>

          {/* City Selector */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md"
          >
            <CitySearch
              onCitySelect={handleSearchSelect}
              initialValue={selectedCity?.name}
              className="w-full"
            />
          </motion.div>
        </div>

        {/* Loading */}
        {loading && !airQuality && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin" />
          </div>
        )}

        {/* Notification Banner */}
        {airQuality && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <NotificationBanner
              enabled={notificationsEnabled}
              onToggle={handleToggleNotifications}
              currentAqi={airQuality.aqi}
            />
          </motion.div>
        )}

        {error && !loading && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {airQuality && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main AQI Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-2"
            >
              <div className={`rounded-3xl bg-gradient-to-br ${getAQIBg(airQuality.aqi)} border backdrop-blur-xl p-8`}>
                <div className="flex items-center gap-3 mb-6">
                  <Leaf className={`w-8 h-8 ${getAQIColor(airQuality.aqi)}`} />
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-white">
                        {selectedCity?.name ?? 'Grad'}, {selectedCity?.country ?? ''}
                      </h2>
                      {selectedCity && (
                        <button
                          onClick={() => toggleFavorite({
                            name: selectedCity.name,
                            country: selectedCity.country,
                            lat: selectedCity.lat,
                            lon: selectedCity.lon
                          })}
                          aria-label={isFavorite(selectedCity.name) ? 'Ukloni iz omiljenih' : 'Dodaj u omiljene'}
                          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                        >
                          <Heart
                            className={`w-6 h-6 transition-colors ${isFavorite(selectedCity.name) ? "fill-white text-white" : "text-white/70 hover:text-white"
                              }`}
                          />
                        </button>
                      )}
                    </div>
                    <p className="text-slate-200/80">Indeks kvaliteta vazduha (AQI)</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                  {/* AQI Circle */}
                  <div className="relative">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-slate-700/30"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(airQuality.aqi / 500) * 553} 553`}
                        className={getAQIColor(airQuality.aqi)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-5xl font-bold ${getAQIColor(airQuality.aqi)}`}>
                        {airQuality.aqi}
                      </span>
                      <span className={`text-lg ${getAQIColor(airQuality.aqi)}`}>
                        {getAQILabel(airQuality.aqi)}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex-1">
                    <p className="text-slate-300 text-lg mb-4">
                      {getAQIDescription(airQuality.aqi)}
                    </p>

                    <div className="flex items-center gap-2 text-slate-400">
                      <Info className="w-4 h-4" />
                      <span className="text-sm">Azurirano: {new Date().toLocaleTimeString("sr-Latn-RS")}</span>
                    </div>
                  </div>
                </div>

                {/* Pollutants Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {pollutants.map((pollutant, index) => (
                    <motion.div
                      key={pollutant.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-800/30 rounded-2xl p-4"
                    >
                      <p className="text-slate-400 text-xs mb-1">{pollutant.desc}</p>
                      <p className="text-white font-semibold">{pollutant.name}</p>
                      <p className="text-2xl text-cyan-400 font-light">{pollutant.value}</p>
                      <p className="text-slate-500 text-xs">{pollutant.unit}</p>
                      <div className="mt-2 w-full bg-slate-700/30 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-green-400 to-red-400"
                          style={{ width: `${Math.min((pollutant.value / pollutant.max) * 100, 100)}%` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Health Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="w-6 h-6 text-red-400" />
                  <h3 className="text-xl font-semibold text-white">Zdravstvene preporuke</h3>
                </div>

                <div className="space-y-4">
                  {getHealthRecommendations(airQuality.aqi).map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-700/20"
                    >
                      <Shield className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getAQIColor(airQuality.aqi)}`} />
                      <p className="text-slate-300 text-sm">{rec}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Sensitive Groups */}
                <div className="mt-6 p-4 rounded-xl bg-slate-700/20 border border-slate-600/30">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-medium">Osetljive grupe</span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Deca, starije osobe, trudnice i osobe sa respiratornim ili kardiovaskularnim oboljenjima su posebno osetljive na zagadjenje vazduha.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* NEW: AQI History Chart, WHO Comparison, Nearby Stations */}
            <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AQI History Chart */}
              <div className="lg:col-span-2">
                <AQIHistoryChart history={aqiHistory} />
              </div>

              {/* Nearby Stations */}
              <NearbyStationsCard
                stations={nearbyStations}
                onSelectStation={(station) => {
                  // Could navigate to map or show station details
                  console.log('Selected station:', station);
                }}
              />
            </div>

            {/* WHO Standards Comparison - Full Width */}
            <div className="lg:col-span-3">
              <WHOComparison airQuality={airQuality} />
            </div>

            {/* Cities Ranking */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-3"
            >
              <div className="rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-xl font-semibold text-white">Rangiranje gradova</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {allCitiesAqi.map((city, index) => (
                    <motion.button
                      key={city.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        const cityData = POPULAR_CITIES.find(c => c.name === city.name);
                        if (cityData) setSelectedCity(cityData);
                      }}
                      className={`p-4 rounded-2xl border transition-all ${city.name === selectedCity?.name
                        ? 'bg-cyan-500/20 border-cyan-500/50'
                        : 'bg-slate-700/20 border-slate-700/30 hover:border-slate-600/50'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm">#{index + 1}</span>
                        {index === 0 && <TrendingDown className="w-4 h-4 text-green-400" />}
                        {index === allCitiesAqi.length - 1 && <TrendingUp className="w-4 h-4 text-red-400" />}
                      </div>
                      <p className="text-white font-medium truncate">{city.name}</p>
                      <p className={`text-2xl font-bold ${getAQIColor(city.aqi)}`}>{city.aqi}</p>
                      <p className={`text-xs ${getAQIColor(city.aqi)}`}>{getAQILabel(city.aqi)}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

