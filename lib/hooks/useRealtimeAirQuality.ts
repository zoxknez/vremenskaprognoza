'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AirQualityData } from '@/lib/types/air-quality';
import { createRealtimeConnection, AirQualityRealtime, AirQualityPolling } from '@/lib/realtime/connection';

interface UseRealtimeAirQualityOptions {
  updateInterval?: number;
  enabled?: boolean;
  onUpdate?: (data: AirQualityData[]) => void;
}

interface UseRealtimeAirQualityReturn {
  data: AirQualityData[];
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  reconnect: () => void;
  disconnect: () => void;
}

export function useRealtimeAirQuality(
  initialData: AirQualityData[] = [],
  options: UseRealtimeAirQualityOptions = {}
): UseRealtimeAirQualityReturn {
  const { updateInterval = 60000, enabled = true, onUpdate } = options;
  
  const [data, setData] = useState<AirQualityData[]>(initialData);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const connectionRef = useRef<AirQualityRealtime | AirQualityPolling | null>(null);

  const handleData = useCallback((newData: AirQualityData[]) => {
    setData(newData);
    setLastUpdated(new Date());
    setIsLoading(false);
    setError(null);
    onUpdate?.(newData);
  }, [onUpdate]);

  const handleError = useCallback((err: Error) => {
    setError(err);
    setIsLoading(false);
  }, []);

  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setError(null);
  }, []);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (connectionRef.current) {
      if ('disconnect' in connectionRef.current) {
        connectionRef.current.disconnect();
      } else if ('stop' in connectionRef.current) {
        connectionRef.current.stop();
      }
    }

    connectionRef.current = createRealtimeConnection({
      updateInterval,
      onData: handleData,
      onError: handleError,
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
    });

    if ('connect' in connectionRef.current) {
      connectionRef.current.connect();
    } else if ('start' in connectionRef.current) {
      connectionRef.current.start();
    }
  }, [updateInterval, handleData, handleError, handleConnect, handleDisconnect]);

  const disconnect = useCallback(() => {
    if (connectionRef.current) {
      if ('disconnect' in connectionRef.current) {
        connectionRef.current.disconnect();
      } else if ('stop' in connectionRef.current) {
        connectionRef.current.stop();
      }
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setIsLoading(true);
    setTimeout(connect, 100);
  }, [connect, disconnect]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Update initial data if provided
  useEffect(() => {
    if (initialData.length > 0 && data.length === 0) {
      setData(initialData);
      setIsLoading(false);
    }
  }, [initialData, data.length]);

  return {
    data,
    isConnected,
    isLoading,
    error,
    lastUpdated,
    reconnect,
    disconnect,
  };
}

// Hook za auto-refresh bez real-time connection
export function useAutoRefresh(
  fetchFn: () => Promise<AirQualityData[]>,
  interval: number = 60000
) {
  const [data, setData] = useState<AirQualityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const newData = await fetchFn();
      setData(newData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    refresh();
    const intervalId = setInterval(refresh, interval);
    return () => clearInterval(intervalId);
  }, [refresh, interval]);

  return { data, isLoading, error, lastUpdated, refresh };
}
