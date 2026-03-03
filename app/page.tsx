"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, AlertTriangle } from "lucide-react";
import WeatherCard from "@/components/weather/WeatherCard";
import AirQualityCard from "@/components/weather/AirQualityCard";
import HourlyForecast from "@/components/weather/HourlyForecast";
import { useHomePageData } from "@/lib/hooks/useHomePageData";
import {
  HeroSection,
  QuickActionsGrid,
  FavoritesSection,
  AdditionalInfoCards,
  CitiesSection,
} from "@/components/home";
import {
  WeatherCardSkeleton,
  AirQualityCardSkeleton,
  HourlyForecastSkeleton,
} from "@/components/ui/skeletons";
import { SafeSection } from "@/components/common/SectionErrorBoundary";

export default function HomePage() {
  const {
    selectedCity,
    weather,
    forecast,
    otherCities,
    allCities,
    topCleanCities,
    topPollutedCities,
    loading,
    error,
    currentTime,
    currentDate,
    sunData,
    uvIndex,
    isLocating,
    locationPermission,
    favorites,
    isFavorite,
    toggleFavorite,
    handleSearchSelect,
    handleResetLocation,
    refreshWeather,
    setSelectedCity,
  } = useHomePageData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 sm:pt-24">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Hero Section */}
        <HeroSection
          isLocating={isLocating}
          locationPermission={locationPermission}
          selectedCity={selectedCity}
          onCitySelect={handleSearchSelect}
          onResetLocation={handleResetLocation}
        />

        {/* Quick Actions */}
        <QuickActionsGrid />

        {/* Favorites */}
        <FavoritesSection
          favorites={favorites}
          selectedCity={selectedCity}
          onSelectCity={(city) => setSelectedCity(city)}
        />

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
                onClick={refreshWeather}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Pokusaj ponovo
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Weather Dashboard - Loading State */}
        {loading && !weather && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 pb-8 sm:pb-12"
          >
            <WeatherCardSkeleton />
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <AirQualityCardSkeleton />
              <HourlyForecastSkeleton />
            </div>
          </motion.div>
        )}

        {/* Main Weather Dashboard - Data */}
        {weather && (
          <SafeSection title="Greska pri ucitavanju vremenske prognoze">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 pb-8 sm:pb-12"
            >
              <WeatherCard
                data={weather}
                loading={loading}
                onRefresh={refreshWeather}
                currentTime={currentTime}
                currentDate={currentDate}
                isFavorite={selectedCity ? isFavorite(selectedCity.name) : false}
                onToggleFavorite={() => {
                  if (selectedCity) {
                    toggleFavorite({
                      name: selectedCity.name,
                      country: selectedCity.country,
                      lat: selectedCity.lat,
                      lon: selectedCity.lon,
                    });
                  }
                }}
              />

              <div className="space-y-4 sm:space-y-6 md:space-y-8">
                {weather.aqi !== null && weather.aqi !== undefined && weather.aqi > 0 && (
                  <AirQualityCard data={weather} />
                )}

                {(!weather.aqi || weather.aqi === 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6"
                  >
                    <div className="flex items-center gap-3 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <p className="text-sm">
                        Nema dostupnih podataka o kvalitetu vazduha za ovu lokaciju.
                      </p>
                    </div>
                  </motion.div>
                )}

                {forecast.length > 0 && <HourlyForecast forecast={forecast} />}
              </div>
            </motion.div>
          </SafeSection>
        )}

        {/* Additional Info Cards */}
        {weather && (
          <AdditionalInfoCards
            sunData={sunData}
            uvIndex={uvIndex}
            aqi={weather.aqi}
          />
        )}

        {/* Cities Sections */}
        <CitiesSection
          allCities={allCities}
          otherCities={otherCities}
          topCleanCities={topCleanCities}
          topPollutedCities={topPollutedCities}
          onSelectCity={setSelectedCity}
        />
      </div>
    </div>
  );
}

