'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Zap, Bell, Wifi } from 'lucide-react';
import { usePWA } from '@/lib/hooks/usePWA';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const dayInMs = 24 * 60 * 60 * 1000;
    
    // Show prompt after 3 seconds if:
    // - App is installable
    // - App is not already installed
    // - User hasn't dismissed it in the last 7 days
    if (isInstallable && !isInstalled && (Date.now() - dismissedTime > 7 * dayInMs)) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
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
    // Will show again on next visit
  };

  if (isDismissed || isInstalled || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleRemindLater}
          />
          
          {/* Prompt Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md z-50"
          >
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-r from-primary-600 to-cyan-600 p-6 pb-12">
                <button
                  onClick={handleDismiss}
                  className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Zatvori"
                >
                  <X size={20} />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Instaliraj Aplikaciju</h3>
                    <p className="text-white/80 text-sm">Brži pristup vremenskoj prognozi</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="p-6 -mt-6">
                <div className="bg-slate-800/50 rounded-2xl p-4 space-y-3 border border-slate-700/50">
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="p-2 bg-primary-500/10 rounded-lg">
                      <Zap className="w-5 h-5 text-primary-400" />
                    </div>
                    <span className="text-sm">Brže učitavanje i rad offline</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <Bell className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="text-sm">Obaveštenja o vremenskim promenama</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Wifi className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-sm">Pristup i bez interneta</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-primary-500 to-cyan-500 hover:from-primary-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50"
                  >
                    {isInstalling ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Instaliranje...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Instaliraj Besplatno
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleRemindLater}
                    className="w-full py-3 px-6 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors text-sm"
                  >
                    Možda kasnije
                  </button>
                </div>

                <p className="mt-4 text-center text-xs text-slate-500">
                  Ne zauzima mnogo prostora • Bez reklama
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
