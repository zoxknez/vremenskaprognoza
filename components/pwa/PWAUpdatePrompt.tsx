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
        <>
          {/* Backdrop overlay za bolju vidljivost */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={handleDismiss}
          />
          
          {/* Update notifikacija */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-lg px-4"
          >
            <div className="relative">
              {/* Pulsing ring effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl blur-2xl opacity-30 animate-pulse" />
              
              {/* Main card */}
              <div className="relative bg-white dark:bg-dark-900 rounded-3xl shadow-2xl border-2 border-primary-200 dark:border-primary-900 overflow-hidden">
                {/* Animated gradient header */}
                <div className="relative bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 bg-[length:200%_100%] animate-gradient p-6">
                  <div className="flex items-start gap-4">
                    <motion.div 
                      className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="w-7 h-7 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-2xl mb-1">
                        🎉 Nova verzija!
                      </h3>
                      <p className="text-white/95 text-base">
                        Ažuriraj aplikaciju i uživaj u novim funkcijama
                      </p>
                    </div>
                    <button
                      onClick={handleDismiss}
                      className="p-2 hover:bg-white/20 rounded-xl transition-all hover:scale-110 active:scale-95"
                      aria-label="Odbaci"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <motion.div 
                      className="flex items-center gap-3 text-base"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse" />
                      <span className="text-neutral-700 dark:text-neutral-200 font-medium">Novi features i poboljšanja</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-3 text-base"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-pulse" />
                      <span className="text-neutral-700 dark:text-neutral-200 font-medium">Brže performanse</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-3 text-base"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full animate-pulse" />
                      <span className="text-neutral-700 dark:text-neutral-200 font-medium">Ispravljeni bug-ovi</span>
                    </motion.div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-5 h-5 ${isUpdating ? 'animate-spin' : ''}`} />
                      <span>{isUpdating ? 'Ažuriranje...' : 'Ažuriraj odmah'}</span>
                    </motion.button>
                    <motion.button
                      onClick={handleDismiss}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-4 bg-neutral-100 dark:bg-dark-700 text-neutral-700 dark:text-neutral-300 rounded-2xl font-semibold text-lg hover:bg-neutral-200 dark:hover:bg-dark-600 transition-colors"
                    >
                      Kasnije
                    </motion.button>
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
