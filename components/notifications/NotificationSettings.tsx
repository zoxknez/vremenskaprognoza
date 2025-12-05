'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Mail, 
  Smartphone,
  Check,
  X,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { usePWA } from '@/lib/hooks/usePWA';

interface NotificationSettingsProps {
  userId?: string;
}

export function NotificationSettings({ userId = 'anonymous' }: NotificationSettingsProps) {
  const { isInstalled, requestNotificationPermission } = usePWA();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [email, setEmail] = useState('');
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check notification permission on mount
  useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  });

  // Notification preferences
  const [preferences, setPreferences] = useState({
    aqiThreshold: 100,
    dailyDigest: true,
    immediateAlerts: true,
    weatherWarnings: true,
  });

  const handlePushSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      // Request permission
      const permission = await requestNotificationPermission();
      
      if (permission !== 'granted') {
        setError('Morate dozvoliti notifikacije u pregledniku');
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // Send to server
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId,
          preferences,
        }),
      });

      if (!response.ok) throw new Error('Failed to subscribe');

      setPushSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri pretplati');
    } finally {
      setLoading(false);
    }
  };

  const handlePushUnsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      await fetch('/api/notifications/push', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      setPushSubscribed(false);
    } catch (err) {
      setError('Greška pri odjavi');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubscribe = async () => {
    if (!email || !email.includes('@')) {
      setError('Unesite validnu email adresu');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In production, save to database
      // For now, just mark as subscribed
      setEmailSubscribed(true);
      
      // Save to localStorage as demo
      localStorage.setItem('airquality_email', email);
      localStorage.setItem('airquality_email_prefs', JSON.stringify(preferences));
    } catch (err) {
      setError('Greška pri pretplati na email');
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    if (Notification.permission === 'granted') {
      new Notification('Test notifikacija', {
        body: 'Ovo je test notifikacija za kvalitetu zraka',
        icon: '/icons/icon-192x192.png',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Postavke obavijesti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Push Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Push notifikacije</span>
            </div>
            <Badge variant={pushSubscribed ? 'default' : 'outline'}>
              {pushSubscribed ? 'Aktivno' : 'Neaktivno'}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Primajte instant obavijesti kada se kvaliteta zraka promijeni.
          </p>

          {!isInstalled && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-600">
                Za najbolje iskustvo instalirajte aplikaciju na uređaj.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {!pushSubscribed ? (
              <Button 
                onClick={handlePushSubscribe} 
                disabled={loading || notificationPermission === 'denied'}
              >
                {loading ? 'Učitavanje...' : 'Uključi notifikacije'}
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={testNotification}>
                  Test
                </Button>
                <Button variant="destructive" onClick={handlePushUnsubscribe} disabled={loading}>
                  Isključi
                </Button>
              </>
            )}
          </div>

          {notificationPermission === 'denied' && (
            <p className="text-sm text-red-500">
              Notifikacije su blokirane. Omogućite ih u postavkama preglednika.
            </p>
          )}
        </div>

        <hr />

        {/* Email Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-500" />
              <span className="font-medium">Email obavijesti</span>
            </div>
            <Badge variant={emailSubscribed ? 'default' : 'outline'}>
              {emailSubscribed ? 'Aktivno' : 'Neaktivno'}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            Primajte dnevne preglede i upozorenja na email.
          </p>

          {!emailSubscribed ? (
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="vas@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={handleEmailSubscribe} disabled={loading}>
                Pretplati se
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">{email || localStorage.getItem('airquality_email')}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setEmailSubscribed(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <hr />

        {/* Preferences */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            <span className="font-medium">Postavke</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm">AQI prag za upozorenje</label>
              <Input
                type="number"
                className="w-20"
                value={preferences.aqiThreshold}
                onChange={(e) => setPreferences(p => ({ ...p, aqiThreshold: parseInt(e.target.value) || 100 }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Dnevni pregled</label>
              <Button
                variant={preferences.dailyDigest ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreferences(p => ({ ...p, dailyDigest: !p.dailyDigest }))}
              >
                {preferences.dailyDigest ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Hitna upozorenja</label>
              <Button
                variant={preferences.immediateAlerts ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreferences(p => ({ ...p, immediateAlerts: !p.immediateAlerts }))}
              >
                {preferences.immediateAlerts ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Vremenska upozorenja</label>
              <Button
                variant={preferences.weatherWarnings ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreferences(p => ({ ...p, weatherWarnings: !p.weatherWarnings }))}
              >
                {preferences.weatherWarnings ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
