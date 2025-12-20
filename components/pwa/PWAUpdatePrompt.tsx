'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, Sparkles } from 'lucide-react';

export function PWAUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Proveri da li je browser podržava service worker
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Funkcija za detekciju novog service workera
    const detectUpdate = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        // Postoji waiting worker - nova verzija je spremna
        setWaitingWorker(registration.waiting);
        setShowUpdatePrompt(true);
      }
    };

    // Registruj service worker i postavi listenere
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Proveri odmah da li ima waiting worker
      detectUpdate(registration);

      // Slušaj za promene u service worker stanju
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova verzija je instalirana i čeka aktivaciju
              setWaitingWorker(newWorker);
              setShowUpdatePrompt(true);
            }
          });
        }
      });

      // Proveri za update svakih 60 sekundi
      setInterval(() => {
        registration.update();
      }, 60000);
    });

    // Slušaj za poruke od service workera
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
      
      // Pošalji poruku waiting workeru da preuzme kontrolu
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // Service worker će preuzeti kontrolu i triggerovati controllerchange event
      // koji će reload-ovati stranicu
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
    // Korisnik može kasnije da ažurira tako što će zatvoriti i ponovo otvoriti aplikaciju
  };

  return (
    <AnimatePresence>
      {showUpdatePrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <div className="glass-effect rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden">
            {/* Header sa gradient-om */}
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg">
                    Nova verzija dostupna!
                  </h3>
                  <p className="text-white/90 text-sm mt-1">
                    Ažuriraj aplikaciju za najbolje iskustvo
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Odbaci"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 bg-white/95 dark:bg-dark-800/95 backdrop-blur-sm">
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  <span>Novi features i poboljšanja</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  <span>Optimizacije performansi</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  <span>Bug fix-evi</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                  <span>{isUpdating ? 'Ažuriranje...' : 'Ažuriraj sada'}</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2.5 bg-neutral-100 dark:bg-dark-700 text-neutral-700 dark:text-neutral-300 rounded-xl font-medium hover:bg-neutral-200 dark:hover:bg-dark-600 transition-colors"
                >
                  Kasnije
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
