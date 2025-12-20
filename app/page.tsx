"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import CitySearch, { SearchResult } from "@/components/common/CitySearch";
import { POPULAR_CITIES } from "@/lib/api/balkan-countries";
import { WeatherData, ForecastData, CityData } from "@/lib/types/weather";
import WeatherCard from "@/components/weather/WeatherCard";
import AirQualityCard from "@/components/weather/AirQualityCard";
import HourlyForecast from "@/components/weather/HourlyForecast";
import CityList from "@/components/weather/CityList";
import TemperatureCityList from "@/components/weather/TemperatureCityList";
import { useFavorites } from "@/hooks/useFavorites";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { logger } from "@/lib/utils/logger";
import {
  Map,
  BarChart3,
  Wind,
  Calendar,
  Heart,
  Sunrise,
  Sunset,
  Sun,
  Shield,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Navigation,
  Loader2,
} from "lucide-react";



export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState<{ name: string; lat: number; lon: number; country: string } | undefined>(undefined);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [otherCities, setOtherCities] = useState<CityData[]>([]); // Gradovi sa kvalitetom vazduha
  const [allCities, setAllCities] = useState<CityData[]>([]); // Svi gradovi sa temperaturom
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLoadingOtherCities] = useState(true);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [sunData, setSunData] = useState<{ sunrise: string; sunset: string } | null>(null);
  const [uvIndex, setUvIndex] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied' | 'unavailable'>('prompt');

  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  // Auto-detect user location on first load
  useEffect(() => {
    const detectLocation = async () => {
      // Check if we've already stored a location preference
      const storedLocation = localStorage.getItem('userLocation');
      if (storedLocation) {
        try {
          const location = JSON.parse(storedLocation);
          setSelectedCity(location);
          setIsLocating(false);
          return;
        } catch {
          localStorage.removeItem('userLocation');
        }
      }

      // Check if geolocation is available
      if (!navigator.geolocation) {
        logger.log('Geolocation not supported');
        setLocationPermission('unavailable');
        setSelectedCity(POPULAR_CITIES[0]);
        setIsLocating(false);
        return;
      }

      // Try to get user's location
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes cache
          });
        });

        const { latitude, longitude } = position.coords;
        setLocationPermission('granted');

        // Reverse geocode to get city name
        try {
          const response = await fetch(
            `/api/geocoding?lat=${latitude}&lon=${longitude}&reverse=true`
          );
          
          if (response.ok) {
            const data = await response.json();
            const cityName = data.city || data.name || 'Moja lokacija';
            const country = data.country || 'RS';
            
            const userCity = {
              name: cityName,
              lat: latitude,
              lon: longitude,
              country: country,
            };
            
            // Store in localStorage for next visit
            localStorage.setItem('userLocation', JSON.stringify(userCity));
            setSelectedCity(userCity);
          } else {
            // Fallback - use coordinates with generic name
            const userCity = {
              name: 'Moja lokacija',
              lat: latitude,
              lon: longitude,
              country: 'RS',
            };
            localStorage.setItem('userLocation', JSON.stringify(userCity));
            setSelectedCity(userCity);
          }
        } catch {
          // Fallback on geocoding error
          const userCity = {
            name: 'Moja lokacija',
            lat: latitude,
            lon: longitude,
            country: 'RS',
          };
          setSelectedCity(userCity);
        }
      } catch (error) {
        // User denied or error occurred
        const geoError = error as GeolocationPositionError;
        if (geoError.code === 1) {
          setLocationPermission('denied');
        }
        logger.log('Location access denied or error:', geoError.message);
        setSelectedCity(POPULAR_CITIES[0]);
      } finally {
        setIsLocating(false);
      }
    };

    detectLocation();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("sr-Latn-RS", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setCurrentDate(
        now.toLocaleDateString("sr-Latn-RS", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchWeatherData = async (city: { name: string; lat: number; lon: number; country: string }) => {
    setLoading(true);
    setLoadingOtherCities(true);
    setError(null);
    try {
      // Prepare promises for parallel execution
      const weatherPromise = fetch(
        `/api/weather?lat=${city.lat}&lon=${city.lon}&city=${encodeURIComponent(city.name)}`
      ).then(res => {
        if (!res.ok) throw new Error('Greška pri učitavanju vremenske prognoze');
        return res.json();
      });

      const forecastPromise = fetch(
        `/api/forecast?lat=${city.lat}&lon=${city.lon}`
      ).then(res => res.json());

      // 1. Učitaj SVE gradove za temperaturu (12 gradova)
      const allCityList = POPULAR_CITIES.filter(c => c.name !== city.name).slice(0, 12);
      const allCitiesPromise = Promise.all(allCityList.map(async (otherCity) => {
        try {
          const res = await fetch(
            `/api/weather?lat=${otherCity.lat}&lon=${otherCity.lon}&city=${encodeURIComponent(otherCity.name)}`
          );
          const data = await res.json();
          return {
            name: otherCity.name,
            country: otherCity.country,
            temp: Math.round(data.temperature),
            aqi: data.aqi || 0,
            description: data.description,
          };
        } catch {
          return null;
        }
      }));

      // 2. Paralelno učitaj gradove sa kvalitetom vazduha (uzmi još 12 za veće šanse)
      const aqiCityList = POPULAR_CITIES.filter(c => c.name !== city.name).slice(0, 18);
      const aqiCitiesPromise = Promise.all(aqiCityList.map(async (otherCity) => {
        try {
          const res = await fetch(
            `/api/weather?lat=${otherCity.lat}&lon=${otherCity.lon}&city=${encodeURIComponent(otherCity.name)}`
          );
          const data = await res.json();
          // Samo gradovi koji imaju validne AQI podatke
          if (!data.aqi || data.aqi === 0) {
            return null;
          }
          return {
            name: otherCity.name,
            country: otherCity.country,
            temp: Math.round(data.temperature),
            aqi: data.aqi,
            description: data.description,
          };
        } catch {
          return null;
        }
      }));

      // Execute all requests in parallel
      const [weatherData, forecastData, allCitiesResults, aqiCitiesResults] = await Promise.all([
        weatherPromise,
        forecastPromise,
        allCitiesPromise,
        aqiCitiesPromise
      ]);

      setWeather({
        city: city.name,
        country: city.country,
        temperature: Math.round(weatherData.temperature),
        feelsLike: Math.round(weatherData.feelsLike),
        humidity: weatherData.humidity,
        pressure: weatherData.pressure,
        windSpeed: Math.round(weatherData.windSpeed * 3.6), // Convert m/s to km/h
        visibility: weatherData.visibility / 1000, // Convert m to km
        description: weatherData.description,
        icon: weatherData.icon,
        aqi: weatherData.aqi,
        pm25: weatherData.pm25,
        pm10: weatherData.pm10,
        no2: weatherData.no2,
        so2: weatherData.so2,
        o3: weatherData.o3,
        co: weatherData.co,
      });

      // Set sunrise/sunset data
      if (weatherData.sunrise && weatherData.sunset) {
        setSunData({
          sunrise: new Date(weatherData.sunrise * 1000).toLocaleTimeString("sr-Latn-RS", { hour: "2-digit", minute: "2-digit" }),
          sunset: new Date(weatherData.sunset * 1000).toLocaleTimeString("sr-Latn-RS", { hour: "2-digit", minute: "2-digit" }),
        });
      }

      // Set UV Index
      if (weatherData.uvi !== undefined) {
        setUvIndex(weatherData.uvi);
      }

      if (forecastData.hourly) {
        setForecast(forecastData.hourly.slice(0, 24));
      }

      // Setuj obe liste:
      // 1. Svi gradovi sa temperaturom (prvih 12 koji nisu null)
      const validAllCities = allCitiesResults.filter((c): c is CityData => c !== null).slice(0, 12);
      setAllCities(validAllCities);

      // 2. Samo gradovi sa validnim AQI podacima (prvih 6)
      const citiesWithAQI = aqiCitiesResults.filter((c): c is CityData => c !== null && c.aqi > 0).slice(0, 6);
      setOtherCities(citiesWithAQI);
      
      setLoadingOtherCities(false);

    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError(err instanceof Error ? err.message : "Greška pri učitavanju podataka");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get health advice based on AQI
  const getHealthAdvice = (aqi: number) => {
    if (aqi <= 50) return { text: "Kvalitet vazduha je odličan. Idealno za aktivnosti na otvorenom.", color: "text-green-400", icon: "😊" };
    if (aqi <= 100) return { text: "Prihvatljiv kvalitet. Osetljive osobe trebaju biti oprezne.", color: "text-yellow-400", icon: "😐" };
    if (aqi <= 150) return { text: "Nezdrav za osetljive grupe. Smanjite aktivnosti napolju.", color: "text-orange-400", icon: "😷" };
    if (aqi <= 200) return { text: "Nezdrav. Svi mogu osetiti zdravstvene efekte.", color: "text-red-400", icon: "🤒" };
    return { text: "Veoma nezdrav! Izbegavajte boravak napolju.", color: "text-purple-400", icon: "⚠️" };
  };

  // Helper function for UV index description
  const getUVDescription = (uv: number) => {
    if (uv <= 2) return { text: "Nizak", color: "text-green-400" };
    if (uv <= 5) return { text: "Umeren", color: "text-yellow-400" };
    if (uv <= 7) return { text: "Visok", color: "text-orange-400" };
    if (uv <= 10) return { text: "Veoma visok", color: "text-red-400" };
    return { text: "Ekstreman", color: "text-purple-400" };
  };

  useEffect(() => {
    if (selectedCity) {
      fetchWeatherData(selectedCity);
    }
  }, [selectedCity]);

  const handleSearchSelect = (city: SearchResult) => {
    const newCity = {
      name: city.name,
      lat: city.lat,
      lon: city.lon,
      country: city.country,
    };
    // Save user's selection
    localStorage.setItem('userLocation', JSON.stringify(newCity));
    setSelectedCity(newCity);
  };

  // Reset to auto-detect location
  const handleResetLocation = async () => {
    localStorage.removeItem('userLocation');
    setIsLocating(true);
    
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        });

        const { latitude, longitude } = position.coords;
        
        const response = await fetch(
          `/api/geocoding?lat=${latitude}&lon=${longitude}&reverse=true`
        );
        
        if (response.ok) {
          const data = await response.json();
          const userCity = {
            name: data.city || data.name || 'Moja lokacija',
            lat: latitude,
            lon: longitude,
            country: data.country || 'RS',
          };
          localStorage.setItem('userLocation', JSON.stringify(userCity));
          setSelectedCity(userCity);
          setLocationPermission('granted');
        }
      } catch {
        setSelectedCity(POPULAR_CITIES[0]);
      }
    }
    setIsLocating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-7xl">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 lg:py-24 text-center space-y-6 sm:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-3 sm:space-y-4 max-w-3xl px-4"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight leading-tight">
              Vremenska <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-cyan">Prognoza</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Precizna vremenska prognoza, kvalitet vazduha i detaljni podaci za gradove širom Balkana i sveta.
            </p>
          </motion.div>

          {/* Search Bar with Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="w-full max-w-2xl relative z-20 px-4"
          >
            {/* Location Status Banner */}
            {isLocating && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 mb-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Detektovanje vaše lokacije...</span>
              </motion.div>
            )}

            {!isLocating && locationPermission === 'granted' && selectedCity && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 mb-4 p-2 rounded-xl bg-green-500/10 border border-green-500/30"
              >
                <Navigation className="w-4 h-4 text-green-400 fill-green-400" />
                <span className="text-sm text-green-400">Lokacija detektovana: {selectedCity.name}</span>
              </motion.div>
            )}

            {!isLocating && locationPermission === 'denied' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-2 mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400">Pristup lokaciji odbijen</span>
                </div>
                <button
                  onClick={handleResetLocation}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                >
                  Pokušaj ponovo
                </button>
              </motion.div>
            )}

            <div className="flex gap-2">
              <div className="flex-1">
                <CitySearch onCitySelect={handleSearchSelect} />
              </div>
              {locationPermission !== 'granted' && !isLocating && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleResetLocation}
                  className="px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-300 hover:text-white hover:border-cyan-500/50 hover:bg-slate-800 transition-all flex items-center gap-2"
                  title="Koristi moju lokaciju"
                >
                  <Navigation className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12"
        >
          {[
            { href: "/prognoza", icon: Calendar, label: "7-dnevna prognoza", color: "from-blue-500 to-cyan-500" },
            { href: "/kvalitet-vazduha", icon: Wind, label: "Kvalitet vazduha", color: "from-green-500 to-emerald-500" },
            { href: "/mapa", icon: Map, label: "Interaktivna mapa", color: "from-purple-500 to-pink-500" },
            { href: "/statistika", icon: BarChart3, label: "Statistika", color: "from-orange-500 to-amber-500" },
          ].map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700/50 p-4 sm:p-5 hover:border-slate-600 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative flex flex-col items-center text-center gap-2 sm:gap-3">
                <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${item.color} bg-opacity-20`}>
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                  {item.label}
                </span>
              </div>
              <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm flex-1">{error}</p>
              <button
                onClick={() => selectedCity && fetchWeatherData(selectedCity)}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Pokušaj ponovo
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="mb-8 sm:mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-semibold text-white">Omiljeni gradovi</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
              {favorites.map((fav) => (
                <button
                  key={fav.name}
                  onClick={() => setSelectedCity(fav)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl border transition-all ${
                    selectedCity?.name === fav.name
                      ? "bg-primary-500/20 border-primary-500/50 text-primary-300"
                      : "bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <span className="text-sm font-medium">{fav.name}</span>
                  <span className="text-xs text-slate-500 ml-1.5">{fav.country}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Content Grid */}
        {weather && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 pb-8 sm:pb-12"
          >
            <WeatherCard
              data={weather}
              loading={loading}
              onRefresh={() => selectedCity && fetchWeatherData(selectedCity)}
              currentTime={currentTime}
              currentDate={currentDate}
              isFavorite={selectedCity ? isFavorite(selectedCity.name) : false}
              onToggleFavorite={() => selectedCity && toggleFavorite({
                name: selectedCity.name,
                country: selectedCity.country,
                lat: selectedCity.lat,
                lon: selectedCity.lon
              })}
            />

            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {/* Prikaži AQI SAMO ako postoje pravi podaci */}
              {weather.aqi !== null && weather.aqi !== undefined && weather.aqi > 0 && (
                <AirQualityCard data={weather} />
              )}
              
              {/* Poruka ako nema AQI podataka */}
              {(!weather.aqi || weather.aqi === 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6"
                >
                  <div className="flex items-center gap-3 text-slate-400">
                    <Wind className="w-5 h-5" />
                    <p className="text-sm">
                      Nema dostupnih podataka o kvalitetu vazduha za ovu lokaciju.
                    </p>
                  </div>
                </motion.div>
              )}
              
              {forecast.length > 0 && (
                <HourlyForecast forecast={forecast} />
              )}
            </div>
          </motion.div>
        )}

        {/* Additional Info Cards - Sun Data, UV Index, Health Advice */}
        {weather && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
          >
            {/* Sunrise/Sunset Card */}
            {sunData && (
              <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-5 sm:p-6">
                <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  Izlazak i zalazak sunca
                </h3>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10">
                      <Sunrise className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Izlazak</p>
                      <p className="text-lg font-semibold text-white">{sunData.sunrise}</p>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-700" />
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-orange-500/10">
                      <Sunset className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Zalazak</p>
                      <p className="text-lg font-semibold text-white">{sunData.sunset}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* UV Index Card */}
            {uvIndex !== null && (
              <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-5 sm:p-6">
                <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-yellow-400" />
                  UV Indeks
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-4xl font-bold ${getUVDescription(uvIndex).color}`}>
                      {uvIndex.toFixed(1)}
                    </p>
                    <p className={`text-sm mt-1 ${getUVDescription(uvIndex).color}`}>
                      {getUVDescription(uvIndex).text}
                    </p>
                  </div>
                  <div className="w-20 h-2 rounded-full bg-slate-700 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                      style={{ width: `${Math.min((uvIndex / 11) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Health Advice Card - SAMO ako postoje AQI podaci */}
            {weather.aqi && weather.aqi > 0 && (
              <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-5 sm:p-6">
                <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Zdravstveni savet
                </h3>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getHealthAdvice(weather.aqi).icon}</span>
                  <p className={`text-sm ${getHealthAdvice(weather.aqi).color} leading-relaxed`}>
                    {getHealthAdvice(weather.aqi).text}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Cities Sections */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="pb-12 sm:pb-16 md:pb-20 space-y-8"
        >
          {/* Temperatura - Svi gradovi */}
          <div>
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-700/50 to-transparent" />
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white whitespace-nowrap">Vremenska Prognoza</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-700/50 to-transparent" />
            </div>
            <TemperatureCityList
              cities={allCities}
              onSelect={(city: any) => {
                const popularCity = POPULAR_CITIES.find(c => c.name === city.name);
                if (popularCity) {
                  setSelectedCity(popularCity);
                } else if (city.lat && city.lon) {
                  setSelectedCity(city);
                }
              }}
            />
          </div>

          {/* Kvalitet vazduha - Samo gradovi sa AQI */}
          <div>
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-700/50 to-transparent" />
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white whitespace-nowrap">Kvalitet Vazduha</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-700/50 to-transparent" />
            </div>
            <CityList
              cities={otherCities}
              onSelect={(city: any) => {
                const popularCity = POPULAR_CITIES.find(c => c.name === city.name);
                if (popularCity) {
                  setSelectedCity(popularCity);
                } else if (city.lat && city.lon) {
                  setSelectedCity(city);
                }
              }}
            />
          </div>
        </motion.div>

        {/* Trending / Stats Promo Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="pb-8"
        >
          <Link
            href="/statistika"
            className="group block rounded-3xl bg-gradient-to-r from-primary-500/10 via-cyan-500/10 to-purple-500/10 border border-slate-700/50 hover:border-primary-500/30 p-6 sm:p-8 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary-500/20">
                  <TrendingUp className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white group-hover:text-primary-300 transition-colors">
                    Pogledajte istorijske podatke
                  </h3>
                  <p className="text-sm text-slate-400">
                    Uporedite temperaturu i kvalitet vazduha kroz vreme
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-primary-400 group-hover:translate-x-2 transition-transform">
                <span className="text-sm font-medium">Statistika</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
