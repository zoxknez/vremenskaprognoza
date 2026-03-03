'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, Sparkles, X } from 'lucide-react';

export function PWAUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const detectUpdate = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowUpdatePrompt(true);
      }
    };

    let isActive = true;

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        if (!isActive) {
          return;
        }

        detectUpdate(registration);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) {
            return;
          }

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setShowUpdatePrompt(true);
            }
          });
        });

        intervalRef.current = window.setInterval(() => {
          registration.update();
        }, 60000);
      })
      .catch((error) => {
        console.error('Service worker registration failed:', error);
      });

    const handleControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      isActive = false;
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleUpdate = () => {
    if (!waitingWorker) {
      return;
    }

    setIsUpdating(true);
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  return (
    <AnimatePresence>
      {showUpdatePrompt && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 50 }}
            transition={{ type: 'spring', duration: 0.45 }}
            className="fixed left-1/2 top-1/2 z-[70] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-sky-500 to-cyan-500 opacity-25 blur-2xl" />

              <div className="relative overflow-hidden rounded-3xl border border-sky-400/30 bg-slate-900 shadow-2xl shadow-black/30">
                <div className="bg-gradient-to-r from-sky-500 via-cyan-500 to-sky-500 bg-[length:200%_100%] p-6 animate-gradient">
                  <div className="flex items-start gap-4">
                    <motion.div
                      className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm"
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    >
                      <Sparkles className="h-7 w-7 text-white" />
                    </motion.div>

                    <div className="flex-1">
                      <h3 className="mb-1 text-2xl font-bold text-white">Nova verzija je spremna</h3>
                      <p className="text-base text-white/95">Azuriraj aplikaciju i preuzmi najnovija poboljsanja.</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="rounded-xl p-2 text-white transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                      aria-label="Zatvori obavestenje"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-3 text-base text-slate-200">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                      Novi feature-i i vizuelna poboljsanja
                    </div>
                    <div className="flex items-center gap-3 text-base text-slate-200">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-sky-400" />
                      Brzi odziv i bolje performanse
                    </div>
                    <div className="flex items-center gap-3 text-base text-slate-200">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
                      Ispravljeni prijavljeni problemi
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-sky-500/25 transition-all hover:from-sky-400 hover:to-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RefreshCw className={`h-5 w-5 ${isUpdating ? 'animate-spin' : ''}`} />
                      {isUpdating ? 'Azuriranje...' : 'Azuriraj odmah'}
                    </button>

                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="rounded-2xl bg-slate-800 px-6 py-4 text-lg font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                    >
                      Kasnije
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
