'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Wind, AlertTriangle, RefreshCw } from 'lucide-react';
import { WeatherData, ForecastData } from '@/lib/types/weather';
import WeatherCard from '@/components/weather/WeatherCard';
import AirQualityCard from '@/components/weather/AirQualityCard';
import HourlyForecast from '@/components/weather/HourlyForecast';

interface WeatherDashboardProps {
    weather: WeatherData | null;
    forecast: ForecastData[];
    loading: boolean;
    currentTime: string;
    currentDate: string;
    selectedCity?: { name: string; country: string; lat: number; lon: number };
    isFavorite: boolean;
    onRefresh: () => void;
    onToggleFavorite: () => void;
}

export function WeatherDashboard({
    weather,
    forecast,
    loading,
    currentTime,
    currentDate,
    selectedCity,
    isFavorite,
    onRefresh,
    onToggleFavorite,
}: WeatherDashboardProps) {
    if (!weather) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 pb-8 sm:pb-12"
        >
            <WeatherCard
                data={weather}
                loading={loading}
                onRefresh={onRefresh}
                currentTime={currentTime}
                currentDate={currentDate}
                isFavorite={isFavorite}
                onToggleFavorite={onToggleFavorite}
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
    );
}

interface ErrorDisplayProps {
    error: string | null;
    onRetry: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
    return (
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
                        onClick={onRetry}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 text-sm transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Pokušaj ponovo
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
