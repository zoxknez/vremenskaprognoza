import { motion } from "framer-motion";
import { MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import { CityData } from "@/lib/types/weather";
import { getAQIColor } from "./weather-utils";
import { POPULAR_CITIES } from "@/lib/api/balkan-countries";

interface CityListProps {
    cities: CityData[];
    onSelect: (city: any) => void;
}

export default function CityList({ cities, onSelect }: CityListProps) {
    if (cities.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
        >
            <div className="rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-cyan-400" />
                        Balkanski Gradovi
                    </h3>
                    <Link
                        href="/mapa"
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                        Mapa <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {cities.map((city, index) => (
                        <motion.button
                            key={city.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * index }}
                            onClick={() => {
                                const cityData = POPULAR_CITIES.find(
                                    (c) => c.name === city.name
                                );
                                if (cityData) {
                                    onSelect(cityData);
                                } else {
                                    // If it's a random city not in our list, just search by name
                                    onSelect({ name: city.name });
                                }
                            }}
                            className="p-4 rounded-2xl bg-slate-700/20 hover:bg-slate-700/40 border border-slate-700/30 hover:border-cyan-500/30 transition-all text-left group"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-3 h-3 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                                <span className="text-white font-medium truncate">
                                    {city.name}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl text-white font-light">
                                    {city.temp}°
                                </span>
                                <div className={`text-sm font-medium ${getAQIColor(city.aqi)}`}>
                                    AQI {city.aqi}
                                </div>
                            </div>
                            <p className="text-slate-400 text-xs mt-1 truncate">
                                {city.description}
                            </p>
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
