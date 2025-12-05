'use client';

import { usePWA } from '@/lib/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Download, Wifi, WifiOff, RefreshCw, Bell } from 'lucide-react';
import { useState } from 'react';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isOnline, installApp, checkForUpdates, requestNotificationPermission } = usePWA();
  const [isLoading, setIsLoading] = useState(false);

  const handleInstall = async () => {
    setIsLoading(true);
    await installApp();
    setIsLoading(false);
  };

  const handleNotifications = async () => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      new Notification('Notifikacije aktivirane!', {
        body: 'Primićete obaveštenja o visokom zagađenju vazduha.',
        icon: '/icons/icon-192x192.png',
      });
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleNotifications}
          title="Omogući notifikacije"
        >
          <Bell className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={checkForUpdates}
          title="Proveri ažuriranja"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <Button
      onClick={handleInstall}
      disabled={isLoading}
      size="sm"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Instaliraj aplikaciju
    </Button>
  );
}

export function OnlineStatus() {
  const { isOnline } = usePWA();

  return (
    <div
      className={`flex items-center gap-2 text-sm ${
        isOnline ? 'text-green-500' : 'text-red-500'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span className="hidden sm:inline">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="hidden sm:inline">Offline</span>
        </>
      )}
    </div>
  );
}
