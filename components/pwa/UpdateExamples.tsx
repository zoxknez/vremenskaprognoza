'use client';

import { useServiceWorkerUpdate } from '@/lib/hooks/useServiceWorkerUpdate';
import { RefreshCw, AlertCircle } from 'lucide-react';

/**
 * Primer custom komponente koja koristi useServiceWorkerUpdate hook.
 * Ova komponenta prikazuje update badge u navigaciji.
 * 
 * NAPOMENA: Ovo je samo primer - trenutno se koristi PWAUpdatePrompt u layout.tsx
 */
export function UpdateBadge() {
  const { updateAvailable, updateServiceWorker } = useServiceWorkerUpdate();

  if (!updateAvailable) {
    return null;
  }

  return (
    <button
      onClick={updateServiceWorker}
      className="relative inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-full transition-colors"
      title="Nova verzija dostupna - klikni za ažuriranje"
    >
      <RefreshCw className="w-4 h-4" />
      <span className="hidden sm:inline">Update dostupan</span>
      
      {/* Pulsing indicator */}
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
      </span>
    </button>
  );
}

/**
 * Još jedan primer - mini update card
 */
export function UpdateCard() {
  const { updateAvailable, updateServiceWorker } = useServiceWorkerUpdate();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-orange-900 dark:text-orange-100">
            Nova verzija dostupna
          </h3>
          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
            Ažuriraj aplikaciju za nove funkcije i poboljšanja
          </p>
          <button
            onClick={updateServiceWorker}
            className="mt-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
          >
            Ažuriraj sada
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Primer - inline link sa ikonom
 */
export function UpdateLink() {
  const { updateAvailable, updateServiceWorker } = useServiceWorkerUpdate();

  if (!updateAvailable) {
    return null;
  }

  return (
    <button
      onClick={updateServiceWorker}
      className="inline-flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
    >
      <RefreshCw className="w-3.5 h-3.5" />
      <span>Update dostupan - klikni za ažuriranje</span>
    </button>
  );
}
