'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, AlertTriangle } from 'lucide-react';

interface NotificationBannerProps {
    enabled: boolean;
    onToggle: () => void;
    currentAqi: number;
}

export function NotificationBanner({
    enabled,
    onToggle,
    currentAqi
}: NotificationBannerProps) {
    const [threshold, setThreshold] = useState(100);

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-4 border ${enabled
                    ? 'bg-cyan-500/10 border-cyan-500/30'
                    : 'bg-slate-800/30 border-slate-700/50'
                }`}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    {enabled ? (
                        <Bell className="w-5 h-5 text-cyan-400" />
                    ) : (
                        <BellOff className="w-5 h-5 text-slate-400" />
                    )}
                    <div>
                        <p className="text-white font-medium">
                            {enabled ? 'Notifikacije uključene' : 'Obaveštenja o kvalitetu vazduha'}
                        </p>
                        <p className="text-xs text-slate-400">
                            {enabled
                                ? `Primićete obaveštenje kada AQI pređe ${threshold}`
                                : 'Uključite da dobijate upozorenja za loš kvalitet vazduha'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {enabled && (
                        <select
                            value={threshold}
                            onChange={(e) => setThreshold(Number(e.target.value))}
                            className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                        >
                            <option value={50}>AQI &gt; 50</option>
                            <option value={100}>AQI &gt; 100</option>
                            <option value={150}>AQI &gt; 150</option>
                            <option value={200}>AQI &gt; 200</option>
                        </select>
                    )}
                    <button
                        onClick={onToggle}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${enabled
                                ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                                : 'bg-cyan-500 text-white hover:bg-cyan-600'
                            }`}
                    >
                        {enabled ? 'Isključi' : 'Uključi'}
                    </button>
                </div>
            </div>

            {currentAqi > threshold && enabled && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-cyan-500/20"
                >
                    <div className="flex items-center gap-2 text-yellow-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">Trenutni AQI ({currentAqi}) prelazi vaš prag upozorenja!</span>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
