/**
 * Push Notifications Service
 * Web Push notifications for air quality alerts
 */
import { logger } from '@/lib/utils/logger';

// VAPID keys should be generated and stored in environment variables
// You can generate them using: npx web-push generate-vapid-keys

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

// Server-side push notification sending
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<boolean> {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@example.com';

  if (!vapidPublicKey || !vapidPrivateKey) {
    logger.warn('VAPID keys not configured');
    return false;
  }

  try {
    // Use fetch to send to push service directly
    // In production, you would use web-push library
    // npm install web-push @types/web-push
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400',
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    logger.error('Push notification error:', error);
    return false;
  }
}

// Alert types
export type AlertType = 
  | 'aqi_high' 
  | 'aqi_very_high' 
  | 'aqi_hazardous'
  | 'improvement'
  | 'weather_warning'
  | 'daily_summary';

// Create notification payload based on alert type
export function createAlertPayload(
  type: AlertType,
  data: {
    cityName: string;
    aqi?: number;
    previousAqi?: number;
    message?: string;
  }
): NotificationPayload {
  const { cityName, aqi, previousAqi, message } = data;

  switch (type) {
    case 'aqi_high':
      return {
        title: '⚠️ Povećano zagađenje',
        body: `${cityName}: AQI je ${aqi}. Osjetljive grupe trebaju ograničiti boravak vani.`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: `aqi-alert-${cityName}`,
        data: { type, cityName, aqi },
        actions: [
          { action: 'view', title: 'Pogledaj detalje' },
          { action: 'dismiss', title: 'Odbaci' }
        ]
      };

    case 'aqi_very_high':
      return {
        title: '🔴 Visoko zagađenje!',
        body: `${cityName}: AQI je ${aqi}! Izbjegavajte aktivnosti na otvorenom.`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: `aqi-alert-${cityName}`,
        data: { type, cityName, aqi },
        actions: [
          { action: 'view', title: 'Pogledaj detalje' },
          { action: 'health', title: 'Zdravstveni savjeti' }
        ]
      };

    case 'aqi_hazardous':
      return {
        title: '☠️ OPASNO ZAGAĐENJE!',
        body: `${cityName}: AQI je ${aqi}! Ostanite u zatvorenom prostoru!`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: `aqi-emergency-${cityName}`,
        data: { type, cityName, aqi },
        actions: [
          { action: 'view', title: 'Pogledaj detalje' },
          { action: 'health', title: 'Hitni savjeti' }
        ]
      };

    case 'improvement':
      return {
        title: '✅ Kvaliteta zraka poboljšana',
        body: `${cityName}: AQI je pao sa ${previousAqi} na ${aqi}.`,
        icon: '/icons/icon-192x192.png',
        tag: `aqi-improvement-${cityName}`,
        data: { type, cityName, aqi, previousAqi }
      };

    case 'weather_warning':
      return {
        title: '🌫️ Meteorološko upozorenje',
        body: message || `${cityName}: Vremenski uvjeti pogoduju nakupljanju zagađenja.`,
        icon: '/icons/icon-192x192.png',
        tag: `weather-warning-${cityName}`,
        data: { type, cityName }
      };

    case 'daily_summary':
      return {
        title: '📊 Dnevni pregled kvalitete zraka',
        body: message || `Prosječni AQI za ${cityName}: ${aqi}`,
        icon: '/icons/icon-192x192.png',
        tag: 'daily-summary',
        data: { type, cityName, aqi }
      };

    default:
      return {
        title: 'Obavijest o kvaliteti zraka',
        body: message || `Nove informacije za ${cityName}`,
        icon: '/icons/icon-192x192.png'
      };
  }
}

// Determine alert type based on AQI value
export function getAlertType(aqi: number, previousAqi?: number): AlertType | null {
  if (aqi > 300) return 'aqi_hazardous';
  if (aqi > 200) return 'aqi_very_high';
  if (aqi > 150) return 'aqi_high';
  if (previousAqi && previousAqi > 100 && aqi < 50) return 'improvement';
  return null;
}

// Store subscriptions (in production, use a database)
const subscriptions = new Map<string, PushSubscription>();

export function storeSubscription(userId: string, subscription: PushSubscription): void {
  subscriptions.set(userId, subscription);
}

export function getSubscription(userId: string): PushSubscription | undefined {
  return subscriptions.get(userId);
}

export function removeSubscription(userId: string): void {
  subscriptions.delete(userId);
}

export function getAllSubscriptions(): PushSubscription[] {
  return Array.from(subscriptions.values());
}
