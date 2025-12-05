"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Locate, ChevronRight, Globe } from "lucide-react";
import { POPULAR_CITIES } from "@/lib/api/balkan-countries";
import { WeatherData, ForecastData, CityData } from "@/lib/types/weather";
import WeatherCard from "@/components/weather/WeatherCard";
import AirQualityCard from "@/components/weather/AirQualityCard";
import HourlyForecast from "@/components/weather/HourlyForecast";
import CityList from "@/components/weather/CityList";
import { useFavorites } from "@/hooks/useFavorites";

// Type for geocoding results
interface GeocodingCity {
  name: string;
  nameEn: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  displayName: string;
}

// Combined search result type
type SearchResult = (typeof POPULAR_CITIES[0] & { isLocal?: boolean }) | (GeocodingCity & { isLocal?: boolean });

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState<{ name: string; lat: number; lon: number; country: string } | undefined>(POPULAR_CITIES[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [otherCities, setOtherCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLoadingOtherCities] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  const { isFavorite, toggleFavorite } = useFavorites();

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
    try {
      // 1. Fetch Current Weather
      const weatherRes = await fetch(
        `/api/weather?lat=${city.lat}&lon=${city.lon}&city=${encodeURIComponent(city.name)}`
      );
      const weatherData = await weatherRes.json();

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
      });

      // 2. Fetch Forecast
      const forecastRes = await fetch(
        `/api/forecast?lat=${city.lat}&lon=${city.lon}`
      );
      const forecastData = await forecastRes.json();

      if (forecastData.hourly) {
        setForecast(forecastData.hourly.slice(0, 24));
      }

      // 3. Fetch Other Cities (Parallel)
      // Filter out the selected city from POPULAR_CITIES to avoid duplication if it's in the list
      const otherCityList = POPULAR_CITIES.filter(c => c.name !== city.name).slice(0, 4);

      const otherCitiesPromises = otherCityList.map(async (otherCity) => {
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
      });

      const otherCitiesResults = await Promise.all(otherCitiesPromises);
      setOtherCities(otherCitiesResults.filter((c): c is CityData => c !== null));
      setLoadingOtherCities(false);

    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCity) {
      fetchWeatherData(selectedCity);
    }
  }, [selectedCity]);

  // Search handler with debounce and geocoding
  const searchCities = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // First, search local popular cities
    const localResults = POPULAR_CITIES.filter((city) =>
      city.name.toLowerCase().includes(query.toLowerCase())
    ).map(city => ({ ...city, isLocal: true }));

    // Show local results immediately
    setSearchResults(localResults);
    setShowResults(true);

    // If query is 3+ chars, also search via geocoding API for global results
    if (query.length >= 3) {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/geocoding?q=${encodeURIComponent(query)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          const globalResults: SearchResult[] = data.results.map((r: GeocodingCity) => ({
            ...r,
            isLocal: false,
          }));

          // Combine local and global, removing duplicates
          const combined: SearchResult[] = [...localResults];
          for (const global of globalResults) {
            const isDuplicate = localResults.some(
              local => Math.abs(local.lat - global.lat) < 0.1 && Math.abs(local.lon - global.lon) < 0.1
            );
            if (!isDuplicate) {
              combined.push(global);
            }
          }
          setSearchResults(combined.slice(0, 8)); // Limit to 8 results
        }
      } catch (error) {
        console.error('Geocoding search error:', error);
      } finally {
        setIsSearching(false);
      }
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCities(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchCities]);

  const handleSearchSelect = async (city: SearchResult) => {
    setSelectedCity({
      name: city.name,
      lat: city.lat,
      lon: city.lon,
      country: city.country,
    });
    setSearchQuery("");
    setShowResults(false);
  };

  const handleManualSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery) return;

    // Check if it's a known city
    const knownCity = POPULAR_CITIES.find(c => c.name.toLowerCase() === searchQuery.toLowerCase());
    if (knownCity) {
      handleSearchSelect(knownCity);
      return;
    }

    // Use geocoding API to find the city
    setLoading(true);
    try {
      const geoRes = await fetch(`/api/geocoding?q=${encodeURIComponent(searchQuery)}&limit=1`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          const city = geoData.results[0];
          setSelectedCity({
            name: city.name,
            lat: city.lat,
            lon: city.lon,
            country: city.country,
          });
          setSearchQuery("");
          setShowResults(false);
        } else {
          alert("Grad nije pronađen. Pokušajte sa drugim nazivom.");
        }
      }
    } catch (error) {
      console.error('Manual search error:', error);
      alert("Greška pri pretrazi. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        setLoading(true);
        try {
          const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const newCity = {
              name: data.city || "Moja Lokacija",
              country: data.country || "??",
              lat: latitude,
              lon: longitude
            };
            setSelectedCity(newCity);
          }
        } catch (e) {
          console.error("Locate error", e);
          setLoading(false);
        }
      }, (error) => {
        console.error("Geolocation error", error);
        alert("Nije moguće dobiti vašu lokaciju. Proverite podešavanja pretraživača.");
      });
    } else {
      alert("Vaš pretraživač ne podržava geolokaciju.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 sm:pt-24 pb-8 sm:pb-12">
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

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="w-full max-w-2xl relative z-20 px-4"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-cyan rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500" />
              <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
                <Search className="absolute left-3 sm:left-4 w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-focus-within:text-primary-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Pretražite grad..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                  className="w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-3 sm:py-4 bg-transparent text-white placeholder:text-slate-500 focus:outline-none text-base sm:text-lg rounded-2xl"
                />
                {loading && (
                  <div className="absolute right-3 sm:right-4">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!loading && (
                  <button
                    onClick={handleLocate}
                    className="absolute right-2 sm:right-3 p-2 sm:p-2.5 text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-xl transition-all active:scale-95"
                    title="Locate Me"
                    aria-label="Use my location"
                  >
                    <Locate className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showResults && (searchResults.length > 0 || searchQuery.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-3 sm:mt-4 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[60vh] sm:max-h-[400px] overflow-y-auto custom-scrollbar"
                  >
                    {isSearching && (
                      <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                        <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        Pretražujem globalno...
                      </div>
                    )}
                    {searchResults.length > 0 ? (
                      <div className="p-1.5 sm:p-2 space-y-1">
                        {searchResults.map((city, index) => (
                          <button
                            key={`${city.name}-${city.lat}-${city.lon}-${index}`}
                            onClick={() => handleSearchSelect(city)}
                            className="w-full flex items-center justify-between p-3 sm:p-3.5 hover:bg-white/5 active:bg-white/10 rounded-xl transition-colors group/item text-left min-h-[56px]"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg transition-colors ${
                                city.isLocal 
                                  ? 'bg-primary-500/10 text-primary-400' 
                                  : 'bg-slate-800 text-slate-400 group-hover/item:text-cyan-400 group-hover/item:bg-cyan-500/10'
                              }`}>
                                {city.isLocal ? (
                                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                                ) : (
                                  <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                              </div>
                              <div>
                                <p className="text-white font-medium text-sm sm:text-base">
                                  {city.name}
                                  {!city.isLocal && 'displayName' in city && city.state && (
                                    <span className="text-slate-500 font-normal">, {city.state}</span>
                                  )}
                                </p>
                                <p className="text-xs sm:text-sm text-slate-400">
                                  {city.country}
                                  {!city.isLocal && (
                                    <span className="ml-2 text-xs text-cyan-400/70">• Globalno</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover/item:text-primary-400 transition-colors opacity-0 group-hover/item:opacity-100" />
                          </button>
                        ))}
                      </div>
                    ) : searchQuery.length >= 2 && !isSearching ? (
                      <div className="p-6 sm:p-8 text-center text-slate-400">
                        <p className="text-sm sm:text-base">Nema rezultata za &quot;{searchQuery}&quot;</p>
                        <button
                          onClick={() => handleManualSearch()}
                          className="mt-3 sm:mt-4 px-5 sm:px-6 py-2 sm:py-2.5 bg-primary-500/10 hover:bg-primary-500/20 active:bg-primary-500/30 text-primary-400 rounded-xl transition-colors text-sm font-medium min-h-[44px]"
                        >
                          Pokušaj ponovo
                        </button>
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        {weather && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 pb-12 sm:pb-16 md:pb-20"
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
              <AirQualityCard data={weather} />
              {forecast.length > 0 && (
                <HourlyForecast forecast={forecast} />
              )}
            </div>
          </motion.div>
        )}

        {/* Other Cities Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="pb-12 sm:pb-16 md:pb-20"
        >
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white whitespace-nowrap">Ostali Gradovi</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          </div>
          <CityList
            cities={otherCities}
            onSelect={(city: any) => {
              const popularCity = POPULAR_CITIES.find(c => c.name === city.name);
              if (popularCity) {
                setSelectedCity(popularCity);
              } else {
                if (city.lat && city.lon) {
                  setSelectedCity(city);
                } else {
                  console.log("Selected city without coords:", city);
                }
              }
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
