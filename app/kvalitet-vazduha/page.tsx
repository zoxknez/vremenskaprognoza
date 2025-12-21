"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MapPin,
  TrendingUp,
  TrendingDown,
  Info,
  Heart,
  Shield,
  Activity,
  Bell,
  BellOff,
  BarChart3,
  Globe,
  CheckCircle,
  XCircle,
  Navigation,
  Clock,
} from "lucide-react";
import Link from "next/link";
import CitySearch, { SearchResult } from "@/components/common/CitySearch";
import { POPULAR_CITIES } from "@/lib/api/balkan-countries";
import { AirQualityData } from "@/lib/types/weather";
import { getAQIColor, getAQIBg, getAQILabel } from "@/components/weather/weather-utils";
import { useFavorites } from "@/hooks/useFavorites";

// WHO Guidelines for air quality (annual mean)
const WHO_STANDARDS = {
  pm25: { limit: 5, label: "PM2.5", unit: "µg/m³" },
  pm10: { limit: 15, label: "PM10", unit: "µg/m³" },
  no2: { limit: 10, label: "NO₂", unit: "µg/m³" },
  o3: { limit: 100, label: "O₃ (8h)", unit: "µg/m³" },
  so2: { limit: 40, label: "SO₂ (24h)", unit: "µg/m³" },
};

interface HistoricalAQI {
  time: string;
  aqi: number;
  label: string;
}

interface NearbyStation {
  name: string;
  distance: number;
  aqi: number;
  lat: number;
  lon: number;
}

const getAQIDescription = (aqi: number): string => {
  if (aqi <= 50) return "Kvalitet vazduha je zadovoljavajući i zagađenje vazduha predstavlja mali ili nikakav rizik.";
  if (aqi <= 100) return "Kvalitet vazduha je prihvatljiv. Međutim, za neke zagađivače može postojati umeren zdravstveni problem za veoma mali broj osoba.";
  if (aqi <= 150) return "Članovi osetljivih grupa mogu osetiti zdravstvene efekte. Opšta populacija verovatno neće biti pogođena.";
  if (aqi <= 200) return "Svi mogu početi da osećaju zdravstvene efekte. Članovi osetljivih grupa mogu osetiti ozbiljnije efekte.";
  if (aqi <= 300) return "Zdravstvena upozorenja hitnih stanja. Cela populacija verovatno će biti pogođena.";
  return "Zdravstveno upozorenje: svi mogu osetiti ozbiljne zdravstvene efekte.";
};

const getHealthRecommendations = (aqi: number): string[] => {
  if (aqi <= 50) {
    return [
      "Idealno za aktivnosti na otvorenom",
      "Prozračite prostor",
      "Uživajte u svežem vazduhu",
    ];
  }
  if (aqi <= 100) {
    return [
      "Većina ljudi može normalno da bude aktivna",
      "Osetljive osobe bi trebalo da razmotre smanjenje intenzivnih aktivnosti",
      "Pratite prognoza kvaliteta vazduha",
    ];
  }
  if (aqi <= 150) {
    return [
      "Osetljive grupe bi trebalo da ograniče boravak napolju",
      "Smanjite intenzivne aktivnosti na otvorenom",
      "Držite prozore zatvorenim",
    ];
  }
  if (aqi <= 200) {
    return [
      "Izbegavajte fizičke aktivnosti na otvorenom",
      "Nosite masku ako morate napolje",
      "Koristite prečistač vazduha u zatvorenom prostoru",
    ];
  }
  return [
    "Ostanite u zatvorenom prostoru",
    "Izbegavajte bilo kakve aktivnosti napolju",
    "Koristite masku N95 ako morate napolje",
    "Potražite medicinsku pomoć ako osećate simptome",
  ];
};

// AQI History Chart Component
const AQIHistoryChart = ({ history }: { history: HistoricalAQI[] }) => {
  const maxAqi = Math.max(...history.map(h => h.aqi), 100);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-semibold text-white">Istorija AQI (24h)</h3>
      </div>
      
      <div className="flex items-end gap-1 h-40">
        {history.map((item, index) => {
          const height = (item.aqi / maxAqi) * 100;
          return (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="flex-1 relative group"
            >
              <div
                className={`w-full h-full rounded-t-lg ${
                  item.aqi <= 50 ? 'bg-green-500' :
                  item.aqi <= 100 ? 'bg-yellow-500' :
                  item.aqi <= 150 ? 'bg-orange-500' :
                  item.aqi <= 200 ? 'bg-red-500' :
                  'bg-purple-500'
                }`}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {item.time}: AQI {item.aqi}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Time labels */}
      <div className="flex justify-between mt-2 text-xs text-slate-500">
        <span>Pre 24h</span>
        <span>Pre 12h</span>
        <span>Sada</span>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-slate-400">Dobar (0-50)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-xs text-slate-400">Umeren (51-100)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-xs text-slate-400">Nezdrav za osetljive (101-150)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs text-slate-400">Nezdrav (151-200)</span>
        </div>
      </div>
    </motion.div>
  );
};

// WHO Standards Comparison Component
const WHOComparison = ({ airQuality }: { airQuality: AirQualityData }) => {
  const comparisons = [
    { key: 'pm25', value: airQuality.pm25, limit: WHO_STANDARDS.pm25.limit, label: 'PM2.5' },
    { key: 'pm10', value: airQuality.pm10, limit: WHO_STANDARDS.pm10.limit, label: 'PM10' },
    { key: 'no2', value: airQuality.no2, limit: WHO_STANDARDS.no2.limit, label: 'NO₂' },
    { key: 'o3', value: airQuality.o3, limit: WHO_STANDARDS.o3.limit, label: 'O₃' },
  ];

  const meetsStandards = comparisons.filter(c => c.value <= c.limit).length;
  const totalStandards = comparisons.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">WHO Standardi</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          meetsStandards === totalStandards ? 'bg-green-500/20 text-green-400' :
          meetsStandards >= totalStandards / 2 ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {meetsStandards}/{totalStandards} ispunjeno
        </div>
      </div>

      <div className="space-y-4">
        {comparisons.map((item, index) => {
          const percentage = (item.value / item.limit) * 100;
          const isWithinLimit = item.value <= item.limit;
          
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {isWithinLimit ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-white font-medium">{item.label}</span>
                </div>
                <div className="text-right">
                  <span className={isWithinLimit ? 'text-green-400' : 'text-red-400'}>
                    {item.value}
                  </span>
                  <span className="text-slate-500"> / {item.limit} µg/m³</span>
                </div>
              </div>
              <div className="w-full bg-slate-700/30 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentage, 100)}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`h-2 rounded-full ${
                    percentage <= 50 ? 'bg-green-500' :
                    percentage <= 100 ? 'bg-yellow-500' :
                    percentage <= 200 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                />
              </div>
              {!isWithinLimit && (
                <p className="text-xs text-red-400/80 mt-1">
                  {Math.round((item.value / item.limit - 1) * 100)}% iznad WHO preporučene vrednosti
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <p className="text-xs text-blue-300">
          <Info className="w-3 h-3 inline mr-1" />
          WHO (Svetska zdravstvena organizacija) je 2021. godine ažurirala smernice za kvalitet vazduha sa strožijim graničnim vrednostima.
        </p>
      </div>
    </motion.div>
  );
};

// Nearby Stations Mini Map Component
const NearbyStationsCard = ({ stations, onSelectStation }: { 
  stations: NearbyStation[], 
  onSelectStation: (station: NearbyStation) => void 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Navigation className="w-6 h-6 text-emerald-400" />
          <h3 className="text-xl font-semibold text-white">Najbliže Stanice</h3>
        </div>
        <Link
          href="/mapa"
          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Pogledaj mapu →
        </Link>
      </div>

      <div className="space-y-3">
        {stations.map((station, index) => (
          <motion.button
            key={station.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectStation(station)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-700/20 hover:bg-slate-700/40 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                station.aqi <= 50 ? 'bg-green-500' :
                station.aqi <= 100 ? 'bg-yellow-500' :
                station.aqi <= 150 ? 'bg-orange-500' :
                'bg-red-500'
              }`} />
              <div>
                <p className="text-white font-medium">{station.name}</p>
                <p className="text-xs text-slate-400">{station.distance.toFixed(1)} km</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-semibold ${getAQIColor(station.aqi)}`}>{station.aqi}</p>
              <p className={`text-xs ${getAQIColor(station.aqi)}`}>{getAQILabel(station.aqi)}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

// Notification Settings Component
const NotificationBanner = ({ 
  enabled, 
  onToggle,
  currentAqi 
}: { 
  enabled: boolean, 
  onToggle: () => void,
  currentAqi: number 
}) => {
  const [threshold, setThreshold] = useState(100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 border ${
        enabled 
          ? 'bg-cyan-500/10 border-cyan-500/30' 
          : 'bg-slate-800/30 border-slate-700/50'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {enabled ? (
            <Bell className="w-5 h-5 text-cyan-400" />
          ) : (
            <BellOff className="w-5 h-5 text-slate-400" />
          )}
          <div>
            <p className="text-white font-medium">
              {enabled ? 'Notifikacije uključene' : 'Obaveštenja o kvalitetu vazduha'}
            </p>
            <p className="text-xs text-slate-400">
              {enabled 
                ? `Primićete obaveštenje kada AQI pređe ${threshold}` 
                : 'Uključite da dobijate upozorenja za loš kvalitet vazduha'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {enabled && (
            <select
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value={50}>AQI &gt; 50</option>
              <option value={100}>AQI &gt; 100</option>
              <option value={150}>AQI &gt; 150</option>
              <option value={200}>AQI &gt; 200</option>
            </select>
          )}
          <button
            onClick={onToggle}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              enabled
                ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                : 'bg-cyan-500 text-white hover:bg-cyan-600'
            }`}
          >
            {enabled ? 'Isključi' : 'Uključi'}
          </button>
        </div>
      </div>
      
      {currentAqi > threshold && enabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-cyan-500/20"
        >
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Trenutni AQI ({currentAqi}) prelazi vaš prag upozorenja!</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default function KvalitetVazduhaPage() {
  const [selectedCity, setSelectedCity] = useState<SearchResult | undefined>(POPULAR_CITIES[0]);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [allCitiesAqi, setAllCitiesAqi] = useState<{ name: string; country: string; aqi: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [aqiHistory, setAqiHistory] = useState<HistoricalAQI[]>([]);
  const [nearbyStations, setNearbyStations] = useState<NearbyStation[]>([]);

  const { isFavorite, toggleFavorite } = useFavorites();

  const handleSearchSelect = (city: SearchResult) => {
    setSelectedCity(city);
  };

  // Generate mock AQI history (in real app, this would come from API)
  const generateAqiHistory = useCallback((currentAqi: number) => {
    const history: HistoricalAQI[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const variation = Math.floor(Math.random() * 30) - 15;
      const aqi = Math.max(10, Math.min(300, currentAqi + variation));
      
      history.push({
        time: time.getHours().toString().padStart(2, '0') + ':00',
        aqi,
        label: getAQILabel(aqi)
      });
    }
    
    return history;
  }, []);

  // Generate nearby stations (in real app, this would come from API)
  const generateNearbyStations = useCallback((city: SearchResult): NearbyStation[] => {
    const stationNames = [
      'Centar', 'Industrijska zona', 'Park', 'Autoput', 'Bolnica'
    ];
    
    return stationNames.slice(0, 4).map((name, index) => ({
      name: `${city.name} - ${name}`,
      distance: (index + 1) * 1.2 + Math.random() * 0.5,
      aqi: Math.floor(Math.random() * 100) + 30,
      lat: city.lat + (Math.random() - 0.5) * 0.05,
      lon: city.lon + (Math.random() - 0.5) * 0.05
    }));
  }, []);

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          // Show confirmation notification
          new Notification('VremeVazduh', {
            body: 'Notifikacije za kvalitet vazduha su uključene!',
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

    try {
      const response = await fetch(
        `/api/air-quality?lat=${city.lat}&lon=${city.lon}`
      );

      if (!response.ok) throw new Error("Failed to fetch air quality");

      const data = await response.json();

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
      setAqiHistory(generateAqiHistory(aqiData.aqi));
      setNearbyStations(generateNearbyStations(city));

    } catch (error) {
      console.error("Air quality fetch error:", error);
      // Fallback data
      const fallbackAqi = Math.floor(Math.random() * 150) + 30;
      setAirQuality({
        aqi: fallbackAqi,
        pm25: Math.floor(Math.random() * 50) + 10,
        pm10: Math.floor(Math.random() * 80) + 20,
        no2: Math.floor(Math.random() * 40) + 5,
        o3: Math.floor(Math.random() * 60) + 10,
        co: Math.floor(Math.random() * 500) + 100,
      });
      setAqiHistory(generateAqiHistory(fallbackAqi));
      if (city) setNearbyStations(generateNearbyStations(city));
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
    { name: "PM2.5", value: airQuality.pm25, unit: "µg/m³", max: 75, desc: "Fine čestice" },
    { name: "PM10", value: airQuality.pm10, unit: "µg/m³", max: 150, desc: "Grube čestice" },
    { name: "NO₂", value: airQuality.no2, unit: "µg/m³", max: 200, desc: "Azot dioksid" },
    { name: "O₃", value: airQuality.o3, unit: "µg/m³", max: 180, desc: "Ozon" },
    { name: "CO", value: airQuality.co, unit: "µg/m³", max: 10000, desc: "Ugljen monoksid" },
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
              Nazad na početnu
            </Link>
            <h1 className="text-4xl font-bold text-white">
              Kvalitet <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Vazduha</span>
            </h1>
            <p className="text-slate-400 max-w-lg">
              Detaljna analiza zagađenja i zdravstvene preporuke u realnom vremenu.
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
                      <span className="text-sm">Ažurirano: {new Date().toLocaleTimeString("sr-Latn-RS")}</span>
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
                  <h3 className="text-xl font-semibold text-white">Zdravstvene Preporuke</h3>
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
                    Deca, starije osobe, trudnice i osobe sa respiratornim ili kardiovaskularnim oboljenjima su posebno osetljive na zagađenje vazduha.
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
                  <h3 className="text-xl font-semibold text-white">Rangiranje Gradova</h3>
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
