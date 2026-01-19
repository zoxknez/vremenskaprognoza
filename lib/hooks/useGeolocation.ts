'use client';

import { useState, useEffect, useCallback } from 'react';
import { AirQualityData } from '@/lib/types/air-quality';
import { calculateDistance, formatDistance } from '@/lib/utils/geo';

// Re-export for backwards compatibility
export { formatDistance } from '@/lib/utils/geo';

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

