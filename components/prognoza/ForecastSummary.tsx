'use client';

import {
    Sun,
    CloudRain,
    TrendingUp,
    TrendingDown,
    Thermometer,
} from 'lucide-react';
import { HourlyForecast, DailyForecast } from './TemperatureChart';

interface ForecastSummaryProps {
    daily: DailyForecast[];
    hourly: HourlyForecast[];
}

export function ForecastSummary({ daily, hourly }: ForecastSummaryProps) {
    if (daily.length < 2) return null;

    const today = daily[0];
    const tomorrow = daily[1];
    const tempDiff = tomorrow.tempMax - today.tempMax;
    const isTomorrowWarmer = tempDiff > 0;
    const isTomorrowColder = tempDiff < 0;

    // Find warmest and coldest days
    const warmestDay = daily.reduce((prev, curr) => curr.tempMax > prev.tempMax ? curr : prev, daily[0]);

    // Check for rain in next 24h
    const rainExpected = hourly.slice(0, 24).some(h => h.pop > 50);

    return (
        <div className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Sažetak prognoze
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tomorrow comparison */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30">
                    {isTomorrowWarmer ? (
                        <TrendingUp className="w-8 h-8 text-red-400" />
                    ) : isTomorrowColder ? (
                        <TrendingDown className="w-8 h-8 text-blue-400" />
                    ) : (
                        <Thermometer className="w-8 h-8 text-slate-400" />
                    )}
                    <div>
                        <p className="text-sm text-slate-400">Sutra</p>
                        <p className={`font-semibold ${isTomorrowWarmer ? 'text-red-400' : isTomorrowColder ? 'text-blue-400' : 'text-white'}`}>
                            {isTomorrowWarmer ? `Toplije za ${Math.abs(tempDiff)}°` :
                                isTomorrowColder ? `Hladnije za ${Math.abs(tempDiff)}°` :
                                    'Slično kao danas'}
                        </p>
                    </div>
                </div>

                {/* Warmest day */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30">
                    <Sun className="w-8 h-8 text-amber-400" />
                    <div>
                        <p className="text-sm text-slate-400">Najtopliji dan</p>
                        <p className="font-semibold text-white">
                            {new Date(warmestDay.date).toLocaleDateString('sr', { weekday: 'long' })} ({warmestDay.tempMax}°)
                        </p>
                    </div>
                </div>

                {/* Rain forecast */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30">
                    {rainExpected ? (
                        <CloudRain className="w-8 h-8 text-blue-400" />
                    ) : (
                        <Sun className="w-8 h-8 text-green-400" />
                    )}
                    <div>
                        <p className="text-sm text-slate-400">Naredna 24h</p>
                        <p className={`font-semibold ${rainExpected ? 'text-blue-400' : 'text-green-400'}`}>
                            {rainExpected ? 'Očekuje se kiša' : 'Bez padavina'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
