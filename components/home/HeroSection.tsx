'use client';

import { motion } from 'framer-motion';
import { Loader2, Navigation, AlertTriangle } from 'lucide-react';
import CitySearch, { SearchResult } from '@/components/common/CitySearch';

interface HeroSectionProps {
    isLocating: boolean;
    locationPermission: 'prompt' | 'granted' | 'denied' | 'unavailable';
    selectedCity?: { name: string; lat: number; lon: number; country: string };
    onCitySelect: (result: SearchResult) => void;
    onResetLocation: () => void;
}

export function HeroSection({
    isLocating,
    locationPermission,
    selectedCity,
    onCitySelect,
    onResetLocation,
}: HeroSectionProps) {
    return (
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
                    Precizna vremenska prognoza, kvalitet vazduha i detaljni podaci za gradove sirom Balkana i sveta.
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
                        <span className="text-sm">Detektovanje vase lokacije...</span>
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
                            onClick={onResetLocation}
                            className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                        >
                            Pokusaj ponovo
                        </button>
                    </motion.div>
                )}

                <div className="flex gap-2">
                    <div className="flex-1">
                        <CitySearch onCitySelect={onCitySelect} />
                    </div>
                    {locationPermission !== 'granted' && !isLocating && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={onResetLocation}
                            className="px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-300 hover:text-white hover:border-cyan-500/50 hover:bg-slate-800 transition-all flex items-center gap-2"
                            title="Koristi moju lokaciju"
                        >
                            <Navigation className="w-5 h-5" />
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

