'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle2, Loader2, Power, RefreshCw, Trash2 } from 'lucide-react';

import { useServiceWorkerUpdate } from '@/lib/hooks/useServiceWorkerUpdate';
import {
  clearAllCaches,
  getAppVersion,
  getCacheVersion,
  getServiceWorkerInfo,
  isPWAInstalled,
  unregisterServiceWorker,
} from '@/lib/utils/pwa';

type ServiceWorkerInfo = Awaited<ReturnType<typeof getServiceWorkerInfo>>;

export default function ServiceWorkerTestPage() {
  const { updateAvailable, updateServiceWorker, checkForUpdate, registration } = useServiceWorkerUpdate();
  const [isChecking, setIsChecking] = useState(false);
  const [isRunningAction, setIsRunningAction] = useState(false);
  const [appVersion, setAppVersion] = useState('');
  const [cacheVersion, setCacheVersion] = useState<string | null>(null);
  const [swInfo, setSwInfo] = useState<ServiceWorkerInfo>(null);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadInfo = async () => {
      const [resolvedCacheVersion, resolvedSwInfo] = await Promise.all([
        getCacheVersion(),
        getServiceWorkerInfo(),
      ]);

      if (cancelled) {
        return;
      }

      setAppVersion(getAppVersion());
      setCacheVersion(resolvedCacheVersion);
      setSwInfo(resolvedSwInfo);
      setIsPWA(isPWAInstalled());
    };

    void loadInfo();

    return () => {
      cancelled = true;
    };
  }, [registration, updateAvailable]);

  const handleCheckForUpdate = async () => {
    setIsChecking(true);
    checkForUpdate();
    setTimeout(() => setIsChecking(false), 900);
  };

  const handleClearCache = async () => {
    if (!window.confirm('Obrisati sve cache podatke?')) {
      return;
    }

    setIsRunningAction(true);
    await clearAllCaches();
    window.location.reload();
  };

  const handleUnregisterSw = async () => {
    if (!window.confirm('Unregister Service Worker?')) {
      return;
    }

    setIsRunningAction(true);
    await unregisterServiceWorker();
    window.location.reload();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-36 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto max-w-4xl px-4">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-cyan-300 transition-colors hover:text-cyan-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Nazad na pocetnu
        </Link>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">Service Worker panel</h1>
          <p className="text-slate-300">Interna stranica za proveru PWA update mehanizma.</p>
        </div>

        <section className="glass-effect mb-6 rounded-2xl p-6 shadow-xl shadow-black/20">
          <h2 className="mb-4 text-xl font-semibold text-white">Status</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {registration ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-300" />
              )}
              <div>
                <p className="font-medium text-white">Service Worker</p>
                <p className="text-sm text-slate-400">{registration ? 'Registrovan' : 'Nije registrovan'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {updateAvailable ? (
                <AlertCircle className="h-5 w-5 animate-pulse text-orange-300" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              )}
              <div>
                <p className="font-medium text-white">Update status</p>
                <p className="text-sm text-slate-400">
                  {updateAvailable ? 'Nova verzija je dostupna' : 'Aplikacija je azurna'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isPWA ? (
                <CheckCircle2 className="h-5 w-5 text-violet-300" />
              ) : (
                <AlertCircle className="h-5 w-5 text-slate-500" />
              )}
              <div>
                <p className="font-medium text-white">PWA status</p>
                <p className="text-sm text-slate-400">{isPWA ? 'Instalirana kao PWA' : 'Nije instalirana'}</p>
              </div>
            </div>

            {(appVersion || cacheVersion) && (
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 p-3">
                <p className="mb-1 text-sm font-medium text-white">Verzije</p>
                <p className="font-mono text-xs text-slate-400">
                  {appVersion && `App: v${appVersion}`}
                  {appVersion && cacheVersion && ' | '}
                  {cacheVersion && `Cache: v${cacheVersion}`}
                </p>
              </div>
            )}
          </div>
        </section>

        {swInfo && (
          <section className="glass-effect mb-6 rounded-2xl p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">SW details</h2>
            <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <p>
                <span className="text-slate-400">Active:</span>{' '}
                <span className="font-mono">{swInfo.active || 'N/A'}</span>
              </p>
              <p>
                <span className="text-slate-400">Waiting:</span>{' '}
                <span className="font-mono">{swInfo.waiting || 'N/A'}</span>
              </p>
              <p>
                <span className="text-slate-400">Installing:</span>{' '}
                <span className="font-mono">{swInfo.installing || 'N/A'}</span>
              </p>
              <p>
                <span className="text-slate-400">Update via cache:</span>{' '}
                <span className="font-mono">{swInfo.updateViaCache || 'N/A'}</span>
              </p>
              <p className="sm:col-span-2">
                <span className="text-slate-400">Scope:</span>{' '}
                <span className="break-all font-mono text-xs">{swInfo.scope || 'N/A'}</span>
              </p>
            </div>
          </section>
        )}

        <section className="glass-effect mb-6 rounded-2xl p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Akcije</h2>
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleCheckForUpdate}
              disabled={isChecking || isRunningAction}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:from-sky-400 hover:to-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isChecking ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
              Proveri update
            </button>

            {updateAvailable && (
              <button
                type="button"
                onClick={updateServiceWorker}
                disabled={isRunningAction}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-400 hover:to-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className="h-5 w-5" />
                Aktiviraj novi update
              </button>
            )}

            <div className="mt-4 rounded-xl border border-slate-700/60 bg-slate-950/60 p-4">
              <p className="mb-3 text-sm font-medium text-amber-200">Debug akcije (koristi pazljivo)</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleClearCache}
                  disabled={isRunningAction}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Ocisti cache
                </button>

                <button
                  type="button"
                  onClick={handleUnregisterSw}
                  disabled={isRunningAction}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Power className="h-4 w-4" />
                  Unregister SW
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-effect rounded-2xl p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Kako testirati</h2>
          <div className="space-y-5 text-sm text-slate-300">
            <div>
              <h3 className="mb-2 font-semibold text-white">Metoda 1: promena cache verzije</h3>
              <ol className="ml-2 list-inside list-decimal space-y-1">
                <li>
                  Otvori <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs">public/sw.js</code>
                </li>
                <li>
                  Promeni <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs">CACHE_NAME</code> (npr. v5
                  na v6)
                </li>
                <li>Sacekaj 60 sekundi ili klikni "Proveri update"</li>
                <li>Trebalo bi da se pojavi status za novu verziju</li>
              </ol>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-white">Metoda 2: Chrome DevTools</h3>
              <ol className="ml-2 list-inside list-decimal space-y-1">
                <li>Otvori DevTools (F12) i karticu Application</li>
                <li>Izaberi Service Workers</li>
                <li>Promeni kod u sw.js</li>
                <li>Klikni "Update" u DevTools</li>
                <li>Novi worker ce se pojaviti kao waiting</li>
              </ol>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
