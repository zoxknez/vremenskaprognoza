'use client';

import { BarChart3 } from 'lucide-react';

export interface HourlyForecast {
    time: string;
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
    pop: number;
}

export interface DailyForecast {
    date: string;
    dayName: string;
    tempMax: number;
    tempMin: number;
    feelsLikeMax?: number;
    feelsLikeMin?: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
    pop: number;
    sunrise: string;
    sunset: string;
}

interface TemperatureChartProps {
    data: HourlyForecast[] | DailyForecast[];
    type: 'hourly' | 'daily';
}

export function TemperatureChart({ data, type }: TemperatureChartProps) {
    const temps = type === 'hourly'
        ? (data as HourlyForecast[]).map(d => d.temp)
        : (data as DailyForecast[]).flatMap(d => [d.tempMax, d.tempMin]);

    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    const range = maxTemp - minTemp || 1;

    if (type === 'hourly') {
        const hourlyData = data as HourlyForecast[];
        return (
            <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    Temperaturni grafikon (24h)
                </h3>
                <div className="relative h-32">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between text-xs text-slate-500">
                        <span>{maxTemp}°</span>
                        <span>{Math.round((maxTemp + minTemp) / 2)}°</span>
                        <span>{minTemp}°</span>
                    </div>
                    {/* Chart */}
                    <div className="ml-12 h-full flex items-end gap-1">
                        {hourlyData.slice(0, 24).map((hour, index) => {
                            const height = ((hour.temp - minTemp) / range) * 100;
                            const time = new Date(hour.time);
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center group">
                                    <div className="relative w-full flex justify-center mb-1">
                                        <div
                                            className="w-full max-w-[20px] rounded-t-sm bg-gradient-to-t from-cyan-600 to-cyan-400 group-hover:from-cyan-500 group-hover:to-cyan-300 transition-all cursor-pointer"
                                            style={{ height: `${Math.max(height, 5)}%` }}
                                        />
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-2 py-1 rounded text-xs text-white whitespace-nowrap z-10 pointer-events-none">
                                            {hour.temp}° | {time.getHours()}:00
                                        </div>
                                    </div>
                                    {index % 4 === 0 && (
                                        <span className="text-[10px] text-slate-500 mt-1">{time.getHours()}h</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Daily chart
    const dailyData = data as DailyForecast[];
    return (
        <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Temperaturni grafikon (7 dana)
            </h3>
            <div className="relative h-40">
                <div className="absolute left-0 top-0 bottom-8 w-10 flex flex-col justify-between text-xs text-slate-500">
                    <span>{maxTemp}°</span>
                    <span>{Math.round((maxTemp + minTemp) / 2)}°</span>
                    <span>{minTemp}°</span>
                </div>
                <div className="ml-12 h-full flex items-end gap-2">
                    {dailyData.map((day, index) => {
                        const maxHeight = ((day.tempMax - minTemp) / range) * 100;
                        const minHeight = ((day.tempMin - minTemp) / range) * 100;
                        const date = new Date(day.date);
                        return (
                            <div key={index} className="flex-1 flex flex-col items-center group">
                                <div className="relative w-full flex justify-center gap-1 mb-1" style={{ height: '100px' }}>
                                    {/* Max temp bar */}
                                    <div className="flex flex-col justify-end h-full">
                                        <div
                                            className="w-4 rounded-t-sm bg-gradient-to-t from-red-600 to-red-400 group-hover:from-red-500 group-hover:to-red-300 transition-all cursor-pointer"
                                            style={{ height: `${maxHeight}%` }}
                                        />
                                    </div>
                                    {/* Min temp bar */}
                                    <div className="flex flex-col justify-end h-full">
                                        <div
                                            className="w-4 rounded-t-sm bg-gradient-to-t from-blue-600 to-blue-400 group-hover:from-blue-500 group-hover:to-blue-300 transition-all cursor-pointer"
                                            style={{ height: `${minHeight}%` }}
                                        />
                                    </div>
                                    {/* Tooltip */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-2 py-1 rounded text-xs text-white whitespace-nowrap z-10 pointer-events-none">
                                        Max: {day.tempMax}° | Min: {day.tempMin}°
                                    </div>
                                </div>
                                <span className="text-xs text-slate-500 mt-1">
                                    {index === 0 ? 'Danas' : date.toLocaleDateString('sr', { weekday: 'short' })}
                                </span>
                            </div>
                        );
                    })}
                </div>
                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-red-500" />
                        <span>Maks</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-blue-500" />
                        <span>Min</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
