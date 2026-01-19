"use client";

import { useState, useEffect } from "react";
import { SavedCity } from "@/lib/types/weather";
import { logger } from "@/lib/utils/logger";

export function useFavorites() {
    const [favorites, setFavorites] = useState<SavedCity[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("weather_favorites");
        if (stored) {
            try {
                setFavorites(JSON.parse(stored));
            } catch (e) {
                logger.error("Failed to parse favorites", e);
            }
        }
    }, []);

    const toggleFavorite = (city: SavedCity) => {
        const newFavorites = [...favorites];
        const index = newFavorites.findIndex((f) => f.name === city.name);

        if (index >= 0) {
            newFavorites.splice(index, 1);
        } else {
            newFavorites.push(city);
        }

        setFavorites(newFavorites);
        localStorage.setItem("weather_favorites", JSON.stringify(newFavorites));
    };

    const isFavorite = (cityName: string) => {
        return favorites.some((f) => f.name === cityName);
    };

    return { favorites, toggleFavorite, isFavorite };
}
