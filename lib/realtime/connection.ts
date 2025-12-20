// Real-time updates using Server-Sent Events (SSE)
// WebSocket alternative that works well with Next.js

import { AirQualityData } from '@/lib/types/air-quality';
import { logger } from '@/lib/utils/logger';

export interface RealtimeConfig {
  updateInterval: number; // in milliseconds
  onData: (data: AirQualityData[]) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export class AirQualityRealtime {
  private eventSource: EventSource | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private config: RealtimeConfig;

  constructor(config: RealtimeConfig) {
    this.config = config;
  }

  connect() {
    if (typeof window === 'undefined') return;

    try {
      this.eventSource = new EventSource('/api/air-quality/stream');

      this.eventSource.onopen = () => {
        this.reconnectAttempts = 0;
        this.config.onConnect?.();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.config.onData(data);
        } catch (error) {
          logger.error('Error parsing SSE data:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        logger.error('SSE error:', error);
        this.config.onError?.(new Error('SSE connection error'));
        this.handleReconnect();
      };
    } catch (error) {
      logger.error('Error creating EventSource:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnect attempts reached');
      this.config.onDisconnect?.();
      return;
    }

    this.disconnect();
    this.reconnectAttempts++;

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    this.reconnectTimeout = setTimeout(() => {
      logger.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      this.connect();
    }, delay);
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.config.onDisconnect?.();
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

// Polling fallback za browsere bez SSE podrške
export class AirQualityPolling {
  private intervalId: NodeJS.Timeout | null = null;
  private config: RealtimeConfig;
  private isActive = false;

  constructor(config: RealtimeConfig) {
    this.config = config;
  }

  start() {
    if (this.isActive) return;
    this.isActive = true;

    this.config.onConnect?.();
    this.fetchData();

    this.intervalId = setInterval(() => {
      this.fetchData();
    }, this.config.updateInterval);
  }

  private async fetchData() {
    try {
      const response = await fetch('/api/air-quality');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      this.config.onData(data);
    } catch (error) {
      logger.error('Polling error:', error);
      this.config.onError?.(error as Error);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isActive = false;
    this.config.onDisconnect?.();
  }

  isRunning(): boolean {
    return this.isActive;
  }
}

// Factory funkcija koja bira najbolji metod
export function createRealtimeConnection(config: RealtimeConfig) {
  if (typeof window !== 'undefined' && 'EventSource' in window) {
    return new AirQualityRealtime(config);
  }
  return new AirQualityPolling(config);
}
