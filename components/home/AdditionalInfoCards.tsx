'use client';

import { motion } from 'framer-motion';
import { Sun, Sunrise, Sunset, Shield } from 'lucide-react';

interface AdditionalInfoCardsProps {
    sunData: { sunrise: string; sunset: string } | null;
    uvIndex: number | null;
    aqi: number | null | undefined;
}

function getUVDescription(uv: number): { text: string; color: string } {
    if (uv <= 2) return { text: 'Nizak', color: 'text-green-400' };
    if (uv <= 5) return { text: 'Umeren', color: 'text-yellow-400' };
    if (uv <= 7) return { text: 'Visok', color: 'text-orange-400' };
    if (uv <= 10) return { text: 'Veoma visok', color: 'text-red-400' };
    return { text: 'Ekstreman', color: 'text-purple-400' };
}

function getHealthAdvice(aqi: number): { text: string; color: string; badge: string } {
    if (aqi <= 50) {
        return {
            text: 'Kvalitet vazduha je dobar. Idealno za aktivnosti na otvorenom.',
            color: 'text-green-400',
            badge: 'OK',
        };
    }

    if (aqi <= 100) {
        return {
            text: 'Kvalitet vazduha je prihvatljiv. Osetljive osobe treba da ogranice duzi boravak napolju.',
            color: 'text-yellow-400',
            badge: 'PAZI',
        };
    }

    if (aqi <= 150) {
        return {
            text: 'Nezdrav za osetljive grupe. Smanjite aktivnosti na otvorenom.',
            color: 'text-orange-400',
            badge: 'UPOZ',
        };
    }

    if (aqi <= 200) {
        return {
            text: 'Nezdrav. Svi bi trebalo da smanje aktivnosti na otvorenom.',
            color: 'text-red-400',
            badge: 'RIZIK',
        };
    }

    if (aqi <= 300) {
        return {
            text: 'Veoma nezdrav. Izbegavajte aktivnosti na otvorenom.',
            color: 'text-purple-400',
            badge: 'VISOK',
        };
    }

    return {
        text: 'Opasno. Ostanite u zatvorenom prostoru.',
        color: 'text-rose-500',
        badge: 'OPASNO',
    };
}

export function AdditionalInfoCards({ sunData, uvIndex, aqi }: AdditionalInfoCardsProps) {
    const hasAnyData = sunData || uvIndex !== null || (aqi && aqi > 0);
    const healthAdvice = aqi && aqi > 0 ? getHealthAdvice(aqi) : null;

    if (!hasAnyData) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
        >
            {sunData && (
                <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-5 sm:p-6">
                    <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                        <Sun className="w-4 h-4 text-amber-400" />
                        Izlazak i zalazak sunca
                    </h3>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-amber-500/10">
                                <Sunrise className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Izlazak</p>
                                <p className="text-lg font-semibold text-white">{sunData.sunrise}</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-700" />
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-orange-500/10">
                                <Sunset className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Zalazak</p>
                                <p className="text-lg font-semibold text-white">{sunData.sunset}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {uvIndex !== null && (
                <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-5 sm:p-6">
                    <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                        <Sun className="w-4 h-4 text-yellow-400" />
                        UV indeks
                    </h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-4xl font-bold ${getUVDescription(uvIndex).color}`}>
                                {uvIndex.toFixed(1)}
                            </p>
                            <p className={`text-sm mt-1 ${getUVDescription(uvIndex).color}`}>
                                {getUVDescription(uvIndex).text}
                            </p>
                        </div>
                        <div className="w-20 h-2 rounded-full bg-slate-700 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                                style={{ width: `${Math.min((uvIndex / 11) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {healthAdvice && (
                <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-5 sm:p-6">
                    <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        Zdravstveni savet
                    </h3>
                    <div className="flex items-start gap-3">
                        <span className="text-[10px] font-semibold tracking-wide px-2 py-1 rounded-md bg-slate-900/70 text-slate-200 border border-slate-700">
                            {healthAdvice.badge}
                        </span>
                        <p className={`text-sm ${healthAdvice.color} leading-relaxed`}>
                            {healthAdvice.text}
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
