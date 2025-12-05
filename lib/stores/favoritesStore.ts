'use client';

import { useState, useEffect, useCallback } from 'react';

const MAX_FAVORITES = 10;

// Generički tip za favorite - podržava i gradove i lokacije kvaliteta vazduha
export interface FavoriteItem {
  id: string;
  name: string;
  city?: string;
  region?: string;
  country?: string;
  coordinates?: [number, number];
  addedAt: string;
  type: 'weather' | 'air-quality';
}

// Storage keys za različite tipove favorita
const STORAGE_KEYS = {
  weather: 'weather_favorites',
  'air-quality': 'air-quality-favorites',
} as const;

interface UseFavoritesOptions {
  type: 'weather' | 'air-quality';
  maxItems?: number;
}

interface UseFavoritesReturn {
  favorites: FavoriteItem[];
  addFavorite: (item: Omit<FavoriteItem, 'addedAt' | 'type'>) => boolean;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: Omit<FavoriteItem, 'addedAt' | 'type'>) => void;
  clearFavorites: () => void;
  reorderFavorites: (startIndex: number, endIndex: number) => void;
  isLoaded: boolean;
  canAddMore: boolean;
  maxFavorites: number;
}

export function useFavorites(options: UseFavoritesOptions): UseFavoritesReturn {
  const { type, maxItems = MAX_FAVORITES } = options;
  const storageKey = STORAGE_KEYS[type];
  
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migriraj stare formate ako je potrebno
        const migrated = Array.isArray(parsed) 
          ? parsed.map((item: FavoriteItem) => ({
              ...item,
              type: item.type || type,
              addedAt: item.addedAt || new Date().toISOString(),
            }))
          : [];
        setFavorites(migrated);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
    setIsLoaded(true);
  }, [storageKey, type]);

  // Save favorites to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites, isLoaded, storageKey]);

  const addFavorite = useCallback((item: Omit<FavoriteItem, 'addedAt' | 'type'>): boolean => {
    let added = false;
    setFavorites((prev) => {
      if (prev.length >= maxItems) {
        return prev;
      }
      
      if (prev.some((f) => f.id === item.id)) {
        return prev;
      }

      added = true;
      return [
        ...prev,
        {
          ...item,
          type,
          addedAt: new Date().toISOString(),
        },
      ];
    });
    return added;
  }, [maxItems, type]);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const isFavorite = useCallback(
    (id: string) => {
      return favorites.some((f) => f.id === id);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (item: Omit<FavoriteItem, 'addedAt' | 'type'>) => {
      if (isFavorite(item.id)) {
        removeFavorite(item.id);
      } else {
        addFavorite(item);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const reorderFavorites = useCallback((startIndex: number, endIndex: number) => {
    setFavorites((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      if (removed) {
        result.splice(endIndex, 0, removed);
      }
      return result;
    });
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    clearFavorites,
    reorderFavorites,
    isLoaded,
    canAddMore: favorites.length < maxItems,
    maxFavorites: maxItems,
  };
}

// Convenience hooks za specifične tipove
export function useWeatherFavorites() {
  return useFavorites({ type: 'weather' });
}

export function useAirQualityFavorites() {
  return useFavorites({ type: 'air-quality' });
}

// Helper za filtriranje podataka po favoritima
export function filterByFavorites<T extends { id: string }>(
  data: T[],
  favorites: FavoriteItem[]
): T[] {
  const favoriteIds = new Set(favorites.map((f) => f.id));
  const filtered = data.filter((item) => favoriteIds.has(item.id));

  // Sortiraj po redosledu favorita
  filtered.sort((a, b) => {
    const indexA = favorites.findIndex((f) => f.id === a.id);
    const indexB = favorites.findIndex((f) => f.id === b.id);
    return indexA - indexB;
  });

  return filtered;
}
