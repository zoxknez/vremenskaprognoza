import { motion } from "framer-motion";
import { Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ForecastData } from "@/lib/types/weather";
import { getWeatherIcon } from "./weather-utils";

interface HourlyForecastProps {
    forecast: ForecastData[];
}

export default function HourlyForecast({ forecast }: HourlyForecastProps) {
    if (forecast.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
        >
            <div className="rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-cyan-400" />
                        Prognoza po Satima
                    </h3>
                    <Link
                        href="/prognoza"
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                        Vidi sve <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                    {forecast.slice(0, 12).map((hour, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className={`flex-shrink-0 w-20 p-4 rounded-2xl text-center transition-all ${index === 0
                                    ? "bg-cyan-500/20 border border-cyan-500/30"
                                    : "bg-slate-700/20 hover:bg-slate-700/40"
                                }`}
                        >
                            <p className="text-slate-400 text-sm mb-2">{hour.time}</p>
                            <div className="text-cyan-400 my-2 flex justify-center">
                                {getWeatherIcon(hour.description, 28)}
                            </div>
                            <p className="text-white font-semibold">{hour.temp}°</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
