"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CitySearch, { SearchResult } from "@/components/common/CitySearch";
import { POPULAR_CITIES } from "@/lib/api/balkan-countries";
import { WeatherData, ForecastData, CityData } from "@/lib/types/weather";
import WeatherCard from "@/components/weather/WeatherCard";
import AirQualityCard from "@/components/weather/AirQualityCard";
import HourlyForecast from "@/components/weather/HourlyForecast";
import CityList from "@/components/weather/CityList";
import { useFavorites } from "@/hooks/useFavorites";



export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState<{ name: string; lat: number; lon: number; country: string } | undefined>(POPULAR_CITIES[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [otherCities, setOtherCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLoadingOtherCities] = useState(true);
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
      // Prepare promises for parallel execution
      const weatherPromise = fetch(
        `/api/weather?lat=${city.lat}&lon=${city.lon}&city=${encodeURIComponent(city.name)}`
      ).then(res => res.json());

      const forecastPromise = fetch(
        `/api/forecast?lat=${city.lat}&lon=${city.lon}`
      ).then(res => res.json());

      // Prepare other cities promises
      const otherCityList = POPULAR_CITIES.filter(c => c.name !== city.name).slice(0, 4);
      const otherCitiesPromise = Promise.all(otherCityList.map(async (otherCity) => {
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

      // Execute all requests in parallel
      const [weatherData, forecastData, otherCitiesResults] = await Promise.all([
        weatherPromise,
        forecastPromise,
        otherCitiesPromise
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
      });

      if (forecastData.hourly) {
        setForecast(forecastData.hourly.slice(0, 24));
      }

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

  const handleSearchSelect = (city: SearchResult) => {
    setSelectedCity({
      name: city.name,
      lat: city.lat,
      lon: city.lon,
      country: city.country,
    });
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
            <CitySearch onCitySelect={handleSearchSelect} />
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
