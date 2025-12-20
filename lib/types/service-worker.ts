/**
 * TypeScript type definitions za PWA update funkcionalnost
 */

export interface ServiceWorkerUpdateState {
  /** Da li je dostupna nova verzija aplikacije */
  updateAvailable: boolean;
  
  /** Waiting service worker koji čeka aktivaciju */
  waitingWorker: ServiceWorker | null;
  
  /** Service worker registracija */
  registration: ServiceWorkerRegistration | null;
  
  /** Da li se trenutno ažurira */
  isUpdating: boolean;
}

export interface ServiceWorkerUpdateHook {
  /** Da li je dostupna nova verzija */
  updateAvailable: boolean;
  
  /** Funkcija za aktivaciju novog service workera */
  updateServiceWorker: () => void;
  
  /** Funkcija za manuelnu proveru novog update-a */
  checkForUpdate: () => void;
  
  /** Service worker registracija */
  registration: ServiceWorkerRegistration | null;
}

export interface PWAUpdatePromptProps {
  /** Custom klase za styling */
  className?: string;
  
  /** Custom poruka umesto default-ne */
  message?: string;
  
  /** Da li automatski prikazati prompt ili čekati manuelni trigger */
  autoShow?: boolean;
  
  /** Callback kada korisnik klikne "Ažuriraj" */
  onUpdate?: () => void;
  
  /** Callback kada korisnik klikne "Odbaci" */
  onDismiss?: () => void;
}

export interface ServiceWorkerMessage {
  type: 'SKIP_WAITING' | 'CACHE_UPDATE' | string;
  payload?: any;
}

/**
 * Cache verzije - increment ove kada deploy-uješ novu verziju
 */
export const CACHE_VERSIONS = {
  APP: 'air-quality-v5',
  RUNTIME: 'air-quality-runtime-v5',
} as const;

export type CacheVersion = typeof CACHE_VERSIONS[keyof typeof CACHE_VERSIONS];
