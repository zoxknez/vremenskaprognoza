'use client';

import { useEffect, useState } from 'react';

/**
 * Hook za browser notifikacije kada je dostupan PWA update.
 * Ovo je opciona funkcionalnost - može se koristiti zajedno sa PWAUpdatePrompt.
 */
export function useBrowserNotification() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('Browser ne podržava notifikacije');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') {
      return;
    }

    new Notification(title, {
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      ...options,
    });
  };

  return {
    permission,
    requestPermission,
    showNotification,
  };
}

/**
 * Komponenta koja automatski pokazuje browser notifikaciju kada je update dostupan.
 * 
 * UPOZORENJE: Ovo može biti invazivno za korisnike.
 * Koristi samo ako korisnik eksplicitno dozvoli notifikacije.
 */
export function PWAUpdateNotification() {
  const { permission, requestPermission, showNotification } = useBrowserNotification();
  const [hasShownNotification, setHasShownNotification] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const handleUpdate = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting && !hasShownNotification && permission === 'granted') {
        showNotification('VremeVazduh - Nova verzija!', {
          body: 'Dostupna je nova verzija aplikacije. Klikni za ažuriranje.',
          tag: 'app-update',
          requireInteraction: true,
        });
        setHasShownNotification(true);
      }
    };

    navigator.serviceWorker.register('/sw.js').then((registration) => {
      handleUpdate(registration);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              handleUpdate(registration);
            }
          });
        }
      });
    });
  }, [permission, hasShownNotification, showNotification]);

  // Ova komponenta ne renderuje ništa - samo pokazuje browser notifikaciju
  return null;
}
