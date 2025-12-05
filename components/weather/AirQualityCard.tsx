import { motion } from "framer-motion";
import { Leaf, ChevronRight } from "lucide-react";
import Link from "next/link";
import { WeatherData } from "@/lib/types/weather";
import { getAQIBg, getAQIColor, getAQILabel } from "./weather-utils";

interface AirQualityCardProps {
    data: WeatherData;
}

export default function AirQualityCard({ data }: AirQualityCardProps) {
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
                )} border border-slate-700/50 backdrop-blur-xl p-8`}
            >
                <div className="flex items-center gap-3 mb-6">
                    <Leaf className={`w-6 h-6 ${getAQIColor(aqi)}`} />
                    <h3 className="text-xl font-semibold text-white">Kvalitet Vazduha</h3>
                </div>

                <div className="text-center mb-8">
                    <div className={`text-7xl font-bold ${getAQIColor(aqi)}`}>
                        {aqi}
                    </div>
                    <p className={`text-xl ${getAQIColor(aqi)} mt-2`}>
                        {getAQILabel(aqi)}
                    </p>
                </div>

                <div className="space-y-4">
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
                </div>

                <Link
                    href="/kvalitet-vazduha"
                    className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl text-cyan-400 transition-colors"
                >
                    <span>Detaljnije</span>
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </motion.div>
    );
}
