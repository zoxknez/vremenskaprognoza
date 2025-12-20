'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Kompaktna verzija update prompta - prikazuje se kao floating button
 * umesto kao puna notifikacija. Dobro za manje ekrane ili minimalistički dizajn.
 */
export function PWAUpdateButton() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.register('/sw.js').then((registration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowUpdate(true);
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setShowUpdate(true);
            }
          });
        }
      });

      setInterval(() => {
        registration.update();
      }, 60000);
    });

    const handleControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      setIsUpdating(true);
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  if (!showUpdate) return null;

  return (
    <button
      onClick={handleUpdate}
      disabled={isUpdating}
      className="fixed bottom-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      title="Nova verzija dostupna - klikni za ažuriranje"
    >
      <RefreshCw className={`w-5 h-5 ${isUpdating ? 'animate-spin' : ''}`} />
      <span className="font-medium text-sm">
        {isUpdating ? 'Ažuriranje...' : 'Ažuriraj'}
      </span>
    </button>
  );
}
