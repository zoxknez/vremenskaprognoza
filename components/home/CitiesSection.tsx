'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';
import CityList from '@/components/weather/CityList';
import TemperatureCityList from '@/components/weather/TemperatureCityList';
import { CityData } from '@/lib/types/weather';
import { POPULAR_CITIES } from '@/lib/api/balkan-countries';

interface CitiesSectionProps {
    allCities: CityData[];
    otherCities: CityData[];
    topCleanCities: any[];
    topPollutedCities: any[];
    onSelectCity: (city: { name: string; lat: number; lon: number; country: string }) => void;
}

export function CitiesSection({
    allCities,
    otherCities,
    topCleanCities,
    topPollutedCities,
    onSelectCity,
}: CitiesSectionProps) {
    const handleCityClick = (city: any) => {
        const popularCity = POPULAR_CITIES.find(c => c.name === city.name);
        if (popularCity) {
            onSelectCity(popularCity);
        } else if (city.lat && city.lon) {
            onSelectCity(city);
        }
    };

    return (
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
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-white whitespace-nowrap">
                        Vremenska Prognoza
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-700/50 to-transparent" />
                </div>
                <TemperatureCityList cities={allCities} onSelect={handleCityClick} />
            </div>

            {/* Kvalitet vazduha - Samo gradovi sa AQI */}
            <div>
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-700/50 to-transparent" />
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-white whitespace-nowrap">
                        Kvalitet Vazduha
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-700/50 to-transparent" />
                </div>
                <CityList cities={otherCities} onSelect={handleCityClick} />
            </div>

            {/* TOP 5 Rangiranje Gradova */}
            {(topCleanCities.length > 0 || topPollutedCities.length > 0) && (
                <div>
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-700/50 to-transparent" />
                        <h2 className="text-xl sm:text-2xl font-display font-bold text-white whitespace-nowrap">
                            Rangiranje Gradova
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-700/50 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top 5 Najčistijih */}
                        {topCleanCities.length > 0 && (
                            <RankingCard
                                title="Top 5 Najčistiji Gradovi"
                                cities={topCleanCities}
                                type="clean"
                                onSelectCity={handleCityClick}
                            />
                        )}

                        {/* Top 5 Najzagađenijih */}
                        {topPollutedCities.length > 0 && (
                            <RankingCard
                                title="Top 5 Najzagađeniji Gradovi"
                                cities={topPollutedCities}
                                type="polluted"
                                onSelectCity={handleCityClick}
                            />
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

interface RankingCardProps {
    title: string;
    cities: any[];
    type: 'clean' | 'polluted';
    onSelectCity: (city: any) => void;
}

function RankingCard({ title, cities, type, onSelectCity }: RankingCardProps) {
    const isClean = type === 'clean';

    return (
        <motion.div
            initial={{ opacity: 0, x: isClean ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`rounded-3xl bg-gradient-to-br ${isClean
                    ? 'from-green-500/10 to-emerald-500/5 border-green-500/20'
                    : 'from-red-500/10 to-orange-500/5 border-red-500/20'
                } border backdrop-blur-xl p-6`}
        >
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl ${isClean ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {isClean ? (
                        <Sparkles className="w-5 h-5 text-green-400" />
                    ) : (
                        <TrendingUp className="w-5 h-5 text-red-400" />
                    )}
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>

            <div className="space-y-3">
                {cities.map((city, index) => (
                    <motion.div
                        key={city.name}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/30 ${isClean ? 'hover:border-green-500/30' : 'hover:border-red-500/30'
                            } transition-all cursor-pointer group`}
                        onClick={() => onSelectCity(city)}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                                    index === 1 ? 'bg-gray-400' :
                                        index === 2 ? 'bg-amber-700' : 'bg-gray-600'
                                }`}
                        >
                            {index + 1}
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-medium group-hover:text-cyan-300 transition-colors">
                                {city.name}
                            </p>
                            <p className="text-xs text-slate-400">{city.country}</p>
                        </div>
                        <div className="text-right">
                            <p className={`font-semibold ${isClean ? 'text-green-400' : 'text-red-400'
                                }`}>
                                AQI {city.aqi}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
