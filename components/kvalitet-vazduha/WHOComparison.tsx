'use client';

import { motion } from 'framer-motion';
import { Globe, Info, CheckCircle, XCircle } from 'lucide-react';
import { AirQualityData } from '@/lib/types/weather';

// WHO Guidelines for air quality (annual mean)
export const WHO_STANDARDS = {
    pm25: { limit: 5, label: "PM2.5", unit: "µg/m³" },
    pm10: { limit: 15, label: "PM10", unit: "µg/m³" },
    no2: { limit: 10, label: "NO₂", unit: "µg/m³" },
    o3: { limit: 100, label: "O₃ (8h)", unit: "µg/m³" },
    so2: { limit: 40, label: "SO₂ (24h)", unit: "µg/m³" },
};

interface WHOComparisonProps {
    airQuality: AirQualityData;
}

export function WHOComparison({ airQuality }: WHOComparisonProps) {
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
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${meetsStandards === totalStandards ? 'bg-green-500/20 text-green-400' :
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
                                    className={`h-2 rounded-full ${percentage <= 50 ? 'bg-green-500' :
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
}
