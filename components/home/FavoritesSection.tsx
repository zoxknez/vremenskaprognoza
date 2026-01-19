'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { SavedCity } from '@/lib/types/weather';

interface FavoritesSectionProps {
    favorites: SavedCity[];
    selectedCity?: { name: string };
    onSelectCity: (city: SavedCity) => void;
}

export function FavoritesSection({
    favorites,
    selectedCity,
    onSelectCity,
}: FavoritesSectionProps) {
    if (favorites.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="mb-8 sm:mb-12"
        >
            <div className="flex items-center gap-3 mb-4">
                <Heart className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-semibold text-white">Omiljeni gradovi</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                {favorites.map((fav) => (
                    <button
                        key={fav.name}
                        onClick={() => onSelectCity(fav)}
                        className={`flex-shrink-0 px-4 py-2.5 rounded-xl border transition-all ${selectedCity?.name === fav.name
                                ? "bg-primary-500/20 border-primary-500/50 text-primary-300"
                                : "bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-slate-600"
                            }`}
                    >
                        <span className="text-sm font-medium">{fav.name}</span>
                        <span className="text-xs text-slate-500 ml-1.5">{fav.country}</span>
                    </button>
                ))}
            </div>
        </motion.div>
    );
}
