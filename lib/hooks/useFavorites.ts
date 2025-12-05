'use client';

import { useState, useEffect, useCallback } from 'react';
import { AirQualityData } from '@/lib/types/air-quality';

const STORAGE_KEY = 'air-quality-favorites';
const MAX_FAVORITES = 10;

interface FavoriteLocation {
  id: string;
  name: string;
  city: string;
  region: string;
  coordinates: [number, number];
  addedAt: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites, isLoaded]);

  const addFavorite = useCallback((data: AirQualityData) => {
    setFavorites((prev) => {
      if (prev.length >= MAX_FAVORITES) {
        return prev;
      }
      
      if (prev.some((f) => f.id === data.id)) {
        return prev;
      }

      return [
        ...prev,
        {
          id: data.id,
          name: data.location.name,
          city: data.location.city,
          region: data.location.region || '',
          coordinates: data.location.coordinates,
          addedAt: new Date().toISOString(),
        },
      ];
    });
  }, []);

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
    (data: AirQualityData) => {
      if (isFavorite(data.id)) {
        removeFavorite(data.id);
      } else {
        addFavorite(data);
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
      result.splice(endIndex, 0, removed);
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
    canAddMore: favorites.length < MAX_FAVORITES,
    maxFavorites: MAX_FAVORITES,
  };
}

// Helper hook za filtriranje podataka po favoritima
export function useFavoriteData(
  data: AirQualityData[],
  favorites: FavoriteLocation[]
) {
  const favoriteIds = new Set(favorites.map((f) => f.id));
  const favoriteData = data.filter((item) => favoriteIds.has(item.id));

  // Sortiraj po redosledu favorita
  favoriteData.sort((a, b) => {
    const indexA = favorites.findIndex((f) => f.id === a.id);
    const indexB = favorites.findIndex((f) => f.id === b.id);
    return indexA - indexB;
  });

  return favoriteData;
}
