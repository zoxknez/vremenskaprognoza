import { motion, AnimatePresence } from "framer-motion";
import { Leaf, ChevronRight, Info, Wind, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { WeatherData } from "@/lib/types/weather";
import { getAQIBg, getAQIColor, getAQILabel } from "./weather-utils";

interface AirQualityCardProps {
    data: WeatherData;
}

export default function AirQualityCard({ data }: AirQualityCardProps) {
    const [showDetails, setShowDetails] = useState(false);
    const aqi = data.aqi || 50;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <div
                className={`h-full rounded-3xl bg-gradient-to-br ${getAQIBg(
                    aqi
                )} border border-slate-700/50 backdrop-blur-xl p-8 flex flex-col`}
            >
                <div className="flex items-center gap-3 mb-6">
                    <Leaf className={`w-6 h-6 ${getAQIColor(aqi)}`} />
                    <div>
                        <h3 className="text-xl font-semibold text-white">Kvalitet Vazduha</h3>
                        <p className="text-sm text-slate-400">{data.city}</p>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <div className={`text-7xl font-bold ${getAQIColor(aqi)}`}>
                        {aqi}
                    </div>
                    <p className={`text-xl ${getAQIColor(aqi)} mt-2`}>
                        {getAQILabel(aqi)}
                    </p>
                    
                    {data.dispersion && data.dispersion.reason && (
                        <div className="mt-4 p-3 bg-black/20 rounded-xl text-sm text-slate-300 flex items-start gap-2 text-left">
                            <Wind className="w-4 h-4 mt-0.5 shrink-0 text-cyan-400" />
                            <span>{data.dispersion.reason}</span>
                        </div>
                    )}
                </div>

                <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400">PM2.5</span>
                        <span className="text-white font-medium">{data.pm25} µg/m³</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full bg-gradient-to-r from-green-400 to-yellow-400`}
                            style={{
                                width: `${Math.min(((data.pm25 || 0) / 100) * 100, 100)}%`,
                            }}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400">PM10</span>
                        <span className="text-white font-medium">{data.pm10} µg/m³</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full bg-gradient-to-r from-green-400 to-orange-400`}
                            style={{
                                width: `${Math.min(((data.pm10 || 0) / 150) * 100, 100)}%`,
                            }}
                        />
                    </div>

                    {/* Expandable Details */}
                    <AnimatePresence>
                        {showDetails && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden space-y-4 pt-2"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-3 rounded-xl">
                                        <p className="text-xs text-slate-400 mb-1">NO₂</p>
                                        <p className="text-lg font-medium text-white">{data.no2 || 0}</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl">
                                        <p className="text-xs text-slate-400 mb-1">SO₂</p>
                                        <p className="text-lg font-medium text-white">{data.so2 || 0}</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl">
                                        <p className="text-xs text-slate-400 mb-1">O₃</p>
                                        <p className="text-lg font-medium text-white">{data.o3 || 0}</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl">
                                        <p className="text-xs text-slate-400 mb-1">CO</p>
                                        <p className="text-lg font-medium text-white">{data.co || 0}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-6 flex gap-2">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl text-slate-300 transition-colors text-sm"
                    >
                        {showDetails ? (
                            <>Manje <ChevronUp className="w-4 h-4" /></>
                        ) : (
                            <>Više <ChevronDown className="w-4 h-4" /></>
                        )}
                    </button>
                    <Link
                        href="/kvalitet-vazduha"
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded-xl transition-colors text-sm"
                    >
                        <span>Detaljnije</span>
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
