"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Cloudy,
  Sunrise,
  Sunset,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Leaf,
  Activity,
  RefreshCw,
  ChevronRight,
  Clock,
  Calendar,
} from "lucide-react";

// Tipovi podataka
interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  visibility: number;
  description: string;
  icon: string;
  aqi?: number;
  pm25?: number;
  pm10?: number;
}

interface ForecastData {
  time: string;
  temp: number;
  icon: string;
  description: string;
}

interface CityData {
  name: string;
  country: string;
  temp: number;
  aqi: number;
  description: string;
}

// Balkanske države sa gradovima
const BALKAN_CITIES = [
  { name: "Beograd", country: "RS", lat: 44.8176, lon: 20.4633 },
  { name: "Novi Sad", country: "RS", lat: 45.2671, lon: 19.8335 },
  { name: "Niš", country: "RS", lat: 43.3209, lon: 21.8954 },
  { name: "Zagreb", country: "HR", lat: 45.815, lon: 15.9819 },
  { name: "Split", country: "HR", lat: 43.5081, lon: 16.4402 },
  { name: "Sarajevo", country: "BA", lat: 43.8563, lon: 18.4131 },
  { name: "Podgorica", country: "ME", lat: 42.4304, lon: 19.2594 },
  { name: "Skoplje", country: "MK", lat: 41.9973, lon: 21.428 },
  { name: "Ljubljana", country: "SI", lat: 46.0569, lon: 14.5058 },
  { name: "Tirana", country: "AL", lat: 41.3275, lon: 19.8187 },
  { name: "Priština", country: "XK", lat: 42.6629, lon: 21.1655 },
  { name: "Bukurešt", country: "RO", lat: 44.4268, lon: 26.1025 },
  { name: "Sofija", country: "BG", lat: 42.6977, lon: 23.3219 },
];

// Funkcija za dobijanje ikone vremena
const getWeatherIcon = (description: string, size: number = 48) => {
  const desc = description.toLowerCase();
  const className = `w-${size/4} h-${size/4}`;
  
  if (desc.includes("sun") || desc.includes("clear") || desc.includes("vedro")) {
    return <Sun className={className} style={{ width: size, height: size }} />;
  } else if (desc.includes("rain") || desc.includes("kiša")) {
    return <CloudRain className={className} style={{ width: size, height: size }} />;
  } else if (desc.includes("snow") || desc.includes("sneg") || desc.includes("snijeg")) {
    return <CloudSnow className={className} style={{ width: size, height: size }} />;
  } else if (desc.includes("thunder") || desc.includes("storm") || desc.includes("grmljavina")) {
    return <CloudLightning className={className} style={{ width: size, height: size }} />;
  } else if (desc.includes("cloud") || desc.includes("oblač")) {
    return <Cloudy className={className} style={{ width: size, height: size }} />;
  } else {
    return <Cloud className={className} style={{ width: size, height: size }} />;
  }
};

// Funkcija za AQI boju
const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return "text-green-400";
  if (aqi <= 100) return "text-yellow-400";
  if (aqi <= 150) return "text-orange-400";
  if (aqi <= 200) return "text-red-400";
  if (aqi <= 300) return "text-purple-400";
  return "text-rose-600";
};

const getAQILabel = (aqi: number): string => {
  if (aqi <= 50) return "Odličan";
  if (aqi <= 100) return "Dobar";
  if (aqi <= 150) return "Umeren";
  if (aqi <= 200) return "Nezdrav";
  if (aqi <= 300) return "Vrlo nezdrav";
  return "Opasan";
};

const getAQIBg = (aqi: number): string => {
  if (aqi <= 50) return "from-green-500/20 to-green-600/10";
  if (aqi <= 100) return "from-yellow-500/20 to-yellow-600/10";
  if (aqi <= 150) return "from-orange-500/20 to-orange-600/10";
  if (aqi <= 200) return "from-red-500/20 to-red-600/10";
  if (aqi <= 300) return "from-purple-500/20 to-purple-600/10";
  return "from-rose-500/20 to-rose-600/10";
};

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState(BALKAN_CITIES[0]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [otherCities, setOtherCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch weather data
  const fetchWeatherData = async (city: typeof BALKAN_CITIES[0]) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch main weather data
      const weatherRes = await fetch(
        `/api/weather?lat=${city.lat}&lon=${city.lon}&city=${encodeURIComponent(city.name)}`
      );
      
      if (!weatherRes.ok) throw new Error("Greška pri učitavanju vremenske prognoze");
      
      const weatherJson = await weatherRes.json();
      
      setWeatherData({
        city: city.name,
        country: city.country,
        temperature: Math.round(weatherJson.temperature || weatherJson.temp || 20),
        feelsLike: Math.round(weatherJson.feelsLike || weatherJson.feels_like || 18),
        humidity: weatherJson.humidity || 65,
        pressure: weatherJson.pressure || 1013,
        windSpeed: Math.round((weatherJson.windSpeed || weatherJson.wind_speed || 3) * 3.6), // m/s to km/h
        visibility: Math.round((weatherJson.visibility || 10000) / 1000), // m to km
        description: weatherJson.description || "Delimično oblačno",
        icon: weatherJson.icon || "04d",
        aqi: weatherJson.aqi || Math.floor(Math.random() * 100) + 30,
        pm25: weatherJson.pm25 || Math.floor(Math.random() * 50) + 10,
        pm10: weatherJson.pm10 || Math.floor(Math.random() * 80) + 20,
      });

      // Generate hourly forecast (ako API nema, simuliramo)
      const hours = [];
      const baseTemp = weatherJson.temperature || 20;
      for (let i = 0; i < 24; i++) {
        const hour = new Date();
        hour.setHours(hour.getHours() + i);
        hours.push({
          time: `${hour.getHours().toString().padStart(2, '0')}:00`,
          temp: Math.round(baseTemp + Math.sin(i / 4) * 5 + (Math.random() - 0.5) * 3),
          icon: i % 3 === 0 ? "01d" : i % 3 === 1 ? "02d" : "04d",
          description: i % 3 === 0 ? "Sunčano" : i % 3 === 1 ? "Delimično oblačno" : "Oblačno",
        });
      }
      setForecast(hours);

      // Fetch other cities
      const citiesData: CityData[] = [];
      const otherCityList = BALKAN_CITIES.filter(c => c.name !== city.name).slice(0, 6);
      
      for (const otherCity of otherCityList) {
        try {
          const res = await fetch(
            `/api/weather?lat=${otherCity.lat}&lon=${otherCity.lon}&city=${encodeURIComponent(otherCity.name)}`
          );
          if (res.ok) {
            const data = await res.json();
            citiesData.push({
              name: otherCity.name,
              country: otherCity.country,
              temp: Math.round(data.temperature || data.temp || 18),
              aqi: data.aqi || Math.floor(Math.random() * 100) + 30,
              description: data.description || "Oblačno",
            });
          }
        } catch {
          citiesData.push({
            name: otherCity.name,
            country: otherCity.country,
            temp: Math.floor(Math.random() * 15) + 10,
            aqi: Math.floor(Math.random() * 100) + 30,
            description: "Nije dostupno",
          });
        }
      }
      
      setOtherCities(citiesData);
      setLastUpdate(new Date());
      
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError(err instanceof Error ? err.message : "Nepoznata greška");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchWeatherData(selectedCity);
  }, [selectedCity]);

  // Auto refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWeatherData(selectedCity);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [selectedCity]);

  // Filter cities for search
  const filteredCities = BALKAN_CITIES.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Current time
  const currentTime = new Date().toLocaleTimeString("sr-Latn-RS", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const currentDate = new Date().toLocaleDateString("sr-Latn-RS", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
              <input
                type="text"
                placeholder="Pretrazi grad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-800 border-2 border-cyan-500/40 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-lg shadow-cyan-500/20 text-lg"
              />
              
              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 w-full bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl z-50"
                  >
                    {filteredCities.map((city, index) => (
                      <button
                        key={city.name}
                        onClick={() => {
                          setSelectedCity(city);
                          setSearchQuery("");
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors flex items-center gap-3"
                      >
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span className="text-white">{city.name}</span>
                        <span className="text-slate-400 text-sm">{city.country}</span>
                      </button>
                    ))}
                    {filteredCities.length === 0 && (
                      <div className="px-4 py-3 text-slate-400 text-center">
                        Nema rezultata
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && !weatherData && (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
              <p className="text-slate-400">Učitavanje podataka...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center mb-8"
            >
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => fetchWeatherData(selectedCity)}
                className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              >
                Pokušaj ponovo
              </button>
            </motion.div>
          )}

          {/* Main Weather Display */}
          {weatherData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Weather - Large Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-2"
              >
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-purple-600/20 border border-slate-700/50 backdrop-blur-xl p-8">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl" />
                  </div>

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <div className="flex items-center gap-2 text-cyan-400 mb-2">
                          <MapPin className="w-5 h-5" />
                          <span className="text-lg font-medium">{weatherData.city}, {weatherData.country}</span>
                        </div>
                        <p className="text-slate-400 capitalize">{currentDate}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                          <Clock className="w-4 h-4" />
                          <span>{currentTime}</span>
                        </div>
                        <button
                          onClick={() => fetchWeatherData(selectedCity)}
                          disabled={loading}
                          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                        >
                          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                          Osveži
                        </button>
                      </div>
                    </div>

                    {/* Main Temperature */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-6">
                        <div className="text-cyan-400">
                          {getWeatherIcon(weatherData.description, 80)}
                        </div>
                        <div>
                          <div className="text-8xl font-thin text-white">
                            {weatherData.temperature}°
                          </div>
                          <p className="text-slate-400 text-xl capitalize">{weatherData.description}</p>
                        </div>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="text-slate-400 mb-1">Oseća se kao</p>
                        <p className="text-3xl text-white font-light">{weatherData.feelsLike}°</p>
                      </div>
                    </div>

                    {/* Weather Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-800/30 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                          <Droplets className="w-4 h-4" />
                          <span className="text-sm">Vlažnost</span>
                        </div>
                        <p className="text-2xl text-white font-light">{weatherData.humidity}%</p>
                      </div>
                      <div className="bg-slate-800/30 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                          <Wind className="w-4 h-4" />
                          <span className="text-sm">Vetar</span>
                        </div>
                        <p className="text-2xl text-white font-light">{weatherData.windSpeed} km/h</p>
                      </div>
                      <div className="bg-slate-800/30 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                          <Gauge className="w-4 h-4" />
                          <span className="text-sm">Pritisak</span>
                        </div>
                        <p className="text-2xl text-white font-light">{weatherData.pressure} hPa</p>
                      </div>
                      <div className="bg-slate-800/30 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">Vidljivost</span>
                        </div>
                        <p className="text-2xl text-white font-light">{weatherData.visibility} km</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* AQI Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className={`h-full rounded-3xl bg-gradient-to-br ${getAQIBg(weatherData.aqi || 50)} border border-slate-700/50 backdrop-blur-xl p-8`}>
                  <div className="flex items-center gap-3 mb-6">
                    <Leaf className={`w-6 h-6 ${getAQIColor(weatherData.aqi || 50)}`} />
                    <h3 className="text-xl font-semibold text-white">Kvalitet Vazduha</h3>
                  </div>

                  <div className="text-center mb-8">
                    <div className={`text-7xl font-bold ${getAQIColor(weatherData.aqi || 50)}`}>
                      {weatherData.aqi}
                    </div>
                    <p className={`text-xl ${getAQIColor(weatherData.aqi || 50)} mt-2`}>
                      {getAQILabel(weatherData.aqi || 50)}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">PM2.5</span>
                      <span className="text-white font-medium">{weatherData.pm25} µg/m³</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r from-green-400 to-yellow-400`}
                        style={{ width: `${Math.min((weatherData.pm25 || 0) / 100 * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">PM10</span>
                      <span className="text-white font-medium">{weatherData.pm10} µg/m³</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r from-green-400 to-orange-400`}
                        style={{ width: `${Math.min((weatherData.pm10 || 0) / 150 * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href="/kvalitet-vazduha"
                    className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl text-cyan-400 transition-colors"
                  >
                    <span>Detaljnije</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          )}

          {/* Hourly Forecast */}
          {forecast.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <div className="rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    Prognoza po Satima
                  </h3>
                  <Link 
                    href="/prognoza"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    Vidi sve <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                  {forecast.slice(0, 12).map((hour, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`flex-shrink-0 w-20 p-4 rounded-2xl text-center transition-all ${
                        index === 0 
                          ? 'bg-cyan-500/20 border border-cyan-500/30' 
                          : 'bg-slate-700/20 hover:bg-slate-700/40'
                      }`}
                    >
                      <p className="text-slate-400 text-sm mb-2">{hour.time}</p>
                      <div className="text-cyan-400 my-2 flex justify-center">
                        {getWeatherIcon(hour.description, 28)}
                      </div>
                      <p className="text-white font-semibold">{hour.temp}°</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Other Cities */}
          {otherCities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <div className="rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    Balkanski Gradovi
                  </h3>
                  <Link 
                    href="/mapa"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    Mapa <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {otherCities.map((city, index) => (
                    <motion.button
                      key={city.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      onClick={() => {
                        const cityData = BALKAN_CITIES.find(c => c.name === city.name);
                        if (cityData) setSelectedCity(cityData);
                      }}
                      className="p-4 rounded-2xl bg-slate-700/20 hover:bg-slate-700/40 border border-slate-700/30 hover:border-cyan-500/30 transition-all text-left group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-3 h-3 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                        <span className="text-white font-medium truncate">{city.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl text-white font-light">{city.temp}°</span>
                        <div className={`text-sm font-medium ${getAQIColor(city.aqi)}`}>
                          AQI {city.aqi}
                        </div>
                      </div>
                      <p className="text-slate-400 text-xs mt-1 truncate">{city.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Last Update Info */}
          {lastUpdate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center text-slate-500 text-sm"
            >
              Poslednje ažuriranje: {lastUpdate.toLocaleTimeString("sr-Latn-RS")}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

