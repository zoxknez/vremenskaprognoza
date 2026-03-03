'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Download, Smartphone, Wifi, X, Zap } from 'lucide-react';

import { usePWA } from '@/lib/hooks/usePWA';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const dismissedValue = localStorage.getItem('pwa-prompt-dismissed');
    const dismissedAt = dismissedValue ? parseInt(dismissedValue, 10) : 0;
    const dayInMs = 24 * 60 * 60 * 1000;

    if (isInstallable && !isInstalled && Date.now() - dismissedAt > 7 * dayInMs) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await installApp();
    setIsInstalling(false);
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
  };

  if (isDismissed || isInstalled || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleRemindLater}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 z-50 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2"
          >
            <div className="overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl shadow-black/30">
              <div className="relative bg-gradient-to-r from-sky-600 to-cyan-600 p-6 pb-12">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="absolute right-4 top-4 rounded-full p-2 text-white/70 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  aria-label="Zatvori"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
                    <Smartphone className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Instaliraj aplikaciju</h3>
                    <p className="text-sm text-white/90">Brzi pristup prognozi i kvalitetu vazduha</p>
                  </div>
                </div>
              </div>

              <div className="-mt-6 p-6">
                <div className="space-y-3 rounded-2xl border border-slate-700/50 bg-slate-800/60 p-4">
                  <div className="flex items-center gap-3 text-slate-200">
                    <div className="rounded-lg bg-sky-500/15 p-2">
                      <Zap className="h-5 w-5 text-sky-300" />
                    </div>
                    <span className="text-sm">Brze performanse i bolji odziv</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-200">
                    <div className="rounded-lg bg-cyan-500/15 p-2">
                      <Bell className="h-5 w-5 text-cyan-300" />
                    </div>
                    <span className="text-sm">Obavestenja o promenama uslova</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-200">
                    <div className="rounded-lg bg-emerald-500/15 p-2">
                      <Wifi className="h-5 w-5 text-emerald-300" />
                    </div>
                    <span className="text-sm">Pristup i kada mreza nije stabilna</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:from-sky-400 hover:to-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isInstalling ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Instaliranje...
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5" />
                        Instaliraj besplatno
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleRemindLater}
                    className="w-full rounded-xl px-6 py-3 text-sm text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                  >
                    Mozda kasnije
                  </button>
                </div>

                <p className="mt-4 text-center text-xs text-slate-500">Bez reklama | Malo prostora na uredjaju</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
