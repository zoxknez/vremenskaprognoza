'use client';

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

export interface HistoricalAQI {
    time: string;
    aqi: number;
    label: string;
}

interface AQIHistoryChartProps {
    history: HistoricalAQI[];
}

export function AQIHistoryChart({ history }: AQIHistoryChartProps) {
    if (history.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="w-6 h-6 text-cyan-400" />
                    <h3 className="text-xl font-semibold text-white">Istorija AQI (24h)</h3>
                </div>
                <p className="text-slate-400 text-sm">Istorijski podaci trenutno nisu dostupni.</p>
            </motion.div>
        );
    }

    const maxAqi = Math.max(...history.map(h => h.aqi), 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6"
        >
            <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-semibold text-white">Istorija AQI (24h)</h3>
            </div>

            <div className="flex items-end gap-1 h-40">
                {history.map((item, index) => {
                    const height = (item.aqi / maxAqi) * 100;
                    return (
                        <motion.div
                            key={index}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            className="flex-1 relative group"
                        >
                            <div
                                className={`w-full h-full rounded-t-lg ${item.aqi <= 50 ? 'bg-green-500' :
                                        item.aqi <= 100 ? 'bg-yellow-500' :
                                            item.aqi <= 150 ? 'bg-orange-500' :
                                                item.aqi <= 200 ? 'bg-red-500' :
                                                    'bg-purple-500'
                                    }`}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {item.time}: AQI {item.aqi}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Time labels */}
            <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>Pre 24h</span>
                <span>Pre 12h</span>
                <span>Sada</span>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs text-slate-400">Dobar (0-50)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-xs text-slate-400">Umeren (51-100)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-xs text-slate-400">Nezdrav za osetljive (101-150)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs text-slate-400">Nezdrav (151-200)</span>
                </div>
            </div>
        </motion.div>
    );
}
