'use client';

import { useState, useEffect } from 'react';
import { AirQualityData } from '@/lib/types/air-quality';

export function useAirQuality(refreshInterval: number = 300000) {
  const [data, setData] = useState<AirQualityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/air-quality');
      if (!response.ok) {
        throw new Error('Failed to fetch air quality data');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { data, loading, error, refetch: fetchData };
}

