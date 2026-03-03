'use client';

import { motion } from 'framer-motion';
import { Navigation } from 'lucide-react';
import Link from 'next/link';
import { getAQIColor, getAQILabel } from '@/components/weather/weather-utils';

export interface NearbyStation {
    name: string;
    distance: number;
    aqi: number;
    lat: number;
    lon: number;
}

interface NearbyStationsCardProps {
    stations: NearbyStation[];
    onSelectStation: (station: NearbyStation) => void;
}

export function NearbyStationsCard({ stations, onSelectStation }: NearbyStationsCardProps) {
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
                {stations.length === 0 && (
                    <div className="p-3 rounded-xl bg-slate-700/20 text-slate-400 text-sm">
                        Trenutno nema dostupnih podataka o obližnjim stanicama.
                    </div>
                )}

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
                            <div className={`w-3 h-3 rounded-full ${station.aqi <= 50 ? 'bg-green-500' :
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
}
