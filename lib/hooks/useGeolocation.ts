'use client';

import { useState, useEffect, useCallback } from 'react';
import { AirQualityData } from '@/lib/types/air-quality';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  isLoading: boolean;
  isSupported: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    isLoading: false,
    isSupported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
  });

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000,
  } = options;

  const getCurrentPosition = useCallback(() => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Geolokacija nije podržana' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          isLoading: false,
          isSupported: true,
        });
      },
      (error) => {
        let errorMessage = 'Greška pri dobijanju lokacije';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Pristup lokaciji je odbijen';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Lokacija nije dostupna';
            break;
          case error.TIMEOUT:
            errorMessage = 'Isteklo vreme za dobijanje lokacije';
            break;
        }
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  }, [state.isSupported, enableHighAccuracy, timeout, maximumAge]);

  return {
    ...state,
    getCurrentPosition,
  };
}

// Hook za pronalaženje najbliže stanice
export function useNearestStation(
  data: AirQualityData[],
  userLocation: { latitude: number | null; longitude: number | null }
) {
  const [nearestStation, setNearestStation] = useState<AirQualityData | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (!userLocation.latitude || !userLocation.longitude || data.length === 0) {
      setNearestStation(null);
      setDistance(null);
      return;
    }

    let nearest: AirQualityData | null = null;
    let minDistance = Infinity;

    for (const station of data) {
      const [lon, lat] = station.location.coordinates;
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        lat,
        lon
      );

      if (dist < minDistance) {
        minDistance = dist;
        nearest = station;
      }
    }

    setNearestStation(nearest);
    setDistance(minDistance);
  }, [data, userLocation.latitude, userLocation.longitude]);

  return { nearestStation, distance };
}

// Haversine formula za izračunavanje udaljenosti
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius Zemlje u km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Format distance
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}
