/**
 * Utility funkcije za PWA update i verzionisanje
 */

/**
 * Dohvata trenutnu verziju aplikacije iz package.json
 */
export function getAppVersion(): string {
  // U production-u možeš koristiti environment variable
  return process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
}

/**
 * Dohvata verziju cache-a iz imena aktivnog service workera
 */
export async function getCacheVersion(): Promise<string | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const caches = await window.caches.keys();
    
    // Pronađi app cache (npr. 'air-quality-v5')
    const appCache = caches.find(name => name.startsWith('air-quality-v'));
    
    if (appCache) {
      // Extract version number
      const match = appCache.match(/v(\d+)/);
      return match ? match[1] : null;
    }
    
    return null;
  } catch (error) {
    logger.error('Failed to get cache version:', error);
    return null;
  }
}

/**
 * Poredi dve verzije i vraća da li je nova verzija dostupna
 */
export function compareVersions(current: string, latest: string): boolean {
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);
  
  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const curr = currentParts[i] || 0;
    const lat = latestParts[i] || 0;
    
    if (lat > curr) return true;
    if (lat < curr) return false;
  }
  
  return false;
}

/**
 * Formatuje verziju za prikaz
 */
export function formatVersion(version: string): string {
  return `v${version}`;
}

/**
 * Kreira naziv cache-a na osnovu verzije
 */
export function createCacheName(version: string, prefix = 'air-quality'): string {
  return `${prefix}-v${version}`;
}

/**
 * Proverava da li je browser podržava Service Workers
 */
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Proverava da li je aplikacija instalirana kao PWA
 */
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if running in standalone mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Check for iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isIOSStandalone = (navigator as any).standalone === true;
  
  return isStandalone || (isIOS && isIOSStandalone);
}

/**
 * Dohvata informacije o service workeru
 */
export async function getServiceWorkerInfo() {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) return null;

    return {
      active: registration.active?.state,
      waiting: registration.waiting?.state,
      installing: registration.installing?.state,
      updateViaCache: registration.updateViaCache,
      scope: registration.scope,
    };
  } catch (error) {
    logger.error('Failed to get SW info:', error);
    return null;
  }
}

/**
 * Manuelno očisti sve keš podatke
 * UPOZORENJE: Koristi samo za debugging
 */
export async function clearAllCaches(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const cacheNames = await window.caches.keys();
    await Promise.all(
      cacheNames.map(name => window.caches.delete(name))
    );
    console.log('All caches cleared');
  } catch (error) {
    console.error('Failed to clear caches:', error);
  }
}

/**
 * Unregister service worker
 * UPOZORENJE: Koristi samo za debugging
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!isServiceWorkerSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      console.log('Service Worker unregistered:', success);
      return success;
    }
    return false;
  } catch (error) {
    console.error('Failed to unregister SW:', error);
    return false;
  }
}
