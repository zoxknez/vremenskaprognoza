'use client';

import { useServiceWorkerUpdate } from '@/lib/hooks/useServiceWorkerUpdate';
import { 
  getAppVersion, 
  getCacheVersion, 
  getServiceWorkerInfo,
  isPWAInstalled,
  clearAllCaches,
  unregisterServiceWorker
} from '@/lib/utils/pwa';
import { RefreshCw, CheckCircle, AlertCircle, Loader2, Trash2, Power } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ServiceWorkerTestPage() {
  const { updateAvailable, updateServiceWorker, checkForUpdate, registration } = useServiceWorkerUpdate();
  const [isChecking, setIsChecking] = useState(false);
  const [appVersion, setAppVersion] = useState<string>('');
  const [cacheVersion, setCacheVersion] = useState<string | null>(null);
  const [swInfo, setSwInfo] = useState<any>(null);
  const [isPWA, setIsPWA] = useState(false);

  const handleCheckForUpdate = async () => {
    setIsChecking(true);
    checkForUpdate();
    // Simuliraj delay za UX
    setTimeout(() => setIsChecking(false), 1000);
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Service Worker Test</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Test stranica za PWA update funkcionalnost
        </p>
      </div>

      {/* Status Card */}
      <div className="glass-effect rounded-xl border border-white/20 dark:border-white/10 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Status</h2>
        
        <div className="space-y-4">
          {/* Service Worker Registration */}
          <div className="flex items-center gap-3">
            {registration ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <div>
              <p className="font-medium">Service Worker</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {registration ? 'Registrovan' : 'Nije registrovan'}
              </p>
            </div>
          </div>

          {/* Update Available */}
          <div className="flex items-center gap-3">
            {updateAvailable ? (
              <AlertCircle className="w-5 h-5 text-orange-500 animate-pulse" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            <div>
              <p className="font-medium">Update Status</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {updateAvailable ? 'Nova verzija dostupna!' : 'Aplikacija je ažurirana'}
              </p>
            </div>
          </div>

          {/* Service Worker State */}
          {registration && (
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">Active Worker</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">
                  {registration.active ? 'Active' : 'N/A'}
                  {registration.waiting && ' + Waiting'}
                  {registration.installing && ' + Installing'}
                </p>
              </div>
            </div>
          )}

          {/* PWA Status */}
          <div className="flex items-center gap-3">
            {isPWA ? (
              <CheckCircle className="w-5 h-5 text-purple-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-gray-500" />
            )}
            <div>
              <p className="font-medium">PWA Status</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {isPWA ? 'Instalirana kao PWA' : 'Nije instalirana'}
              </p>
            </div>
          </div>

          {/* App & Cache Version */}
          {(appVersion || cacheVersion) && (
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-teal-500" />
              <div>
                <p className="font-medium">Verzije</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">
                  {appVersion && `App: v${appVersion}`}
                  {appVersion && cacheVersion && ' • '}
                  {cacheVersion && `Cache: v${cacheVersion}`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Service Worker Details */}
      {swInfo && (
        <div className="glass-effect rounded-xl border border-white/20 dark:border-white/10 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">SW Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-neutral-600 dark:text-neutral-400">Active:</span>
              <span className="ml-2 font-mono">{swInfo.active || 'N/A'}</span>
            </div>
            <div>
              <span className="text-neutral-600 dark:text-neutral-400">Waiting:</span>
              <span className="ml-2 font-mono">{swInfo.waiting || 'N/A'}</span>
            </div>
            <div>
              <span className="text-neutral-600 dark:text-neutral-400">Installing:</span>
              <span className="ml-2 font-mono">{swInfo.installing || 'N/A'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-neutral-600 dark:text-neutral-400">Scope:</span>
              <span className="ml-2 font-mono text-xs break-all">{swInfo.scope}</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="glass-effect rounded-xl border border-white/20 dark:border-white/10 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Akcije</h2>
        
        <div className="space-y-3">
          <button
            onClick={handleCheckForUpdate}
            disabled={isChecking}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            <span>Proveri za update</span>
          </button>

          {updateAvailable && (
            <button
              onClick={updateServiceWorker}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Aktiviraj novi update</span>
            </button>
          )}

          {/* Debug akcije */}
          <div className="pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 font-medium">
              🔧 Debug Akcije (koristi pažljivo):
            </p>
            
            <div className="space-y-2">
              <button
                onClick={async () => {
                  if (confirm('Obrisati sve cache podatke?')) {
                    await clearAllCaches();
                    window.location.reload();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Očisti cache</span>
              </button>

              <button
                onClick={async () => {
                  if (confirm('Unregister Service Worker?')) {
                    await unregisterServiceWorker();
                    window.location.reload();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
              >
                <Power className="w-4 h-4" />
                <span>Unregister SW</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Uputstva */}
      <div className="glass-effect rounded-xl border border-white/20 dark:border-white/10 p-6">
        <h2 className="text-xl font-semibold mb-4">Kako testirati</h2>
        
        <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
              Metoda 1: Promena cache verzije
            </h3>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Otvori <code className="px-1.5 py-0.5 bg-neutral-100 dark:bg-dark-700 rounded text-xs">public/sw.js</code></li>
              <li>Promeni <code className="px-1.5 py-0.5 bg-neutral-100 dark:bg-dark-700 rounded text-xs">CACHE_NAME</code> verziju (npr. v5 → v6)</li>
              <li>Sačekaj 60 sekundi ili klikni "Proveri za update"</li>
              <li>Videćeš notifikaciju za update</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
              Metoda 2: Chrome DevTools
            </h3>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Otvori DevTools (F12) → Application tab</li>
              <li>U levom meniju klikni Service Workers</li>
              <li>Promeni kod u sw.js</li>
              <li>Klikni "Update" u DevTools</li>
              <li>Videćeš novi worker u "waiting" stanju</li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-900 dark:text-blue-200 text-xs">
              <strong>Napomena:</strong> Update se automatski proverava svakih 60 sekundi. 
              Takođe možeš manuelno kliknuti "Proveri za update" dugme.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
