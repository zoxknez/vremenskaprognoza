'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { MeshGradientBackground } from '@/components/ui/backgrounds';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <MeshGradientBackground />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <GlassCard className="text-center p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
            className="text-8xl mb-6"
          >
            😵
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-2">Ups! Nešto je pošlo po zlu</h2>
          
          <p className="text-muted-foreground mb-6">
            {error.message || 'Došlo je do neočekivane greške. Pokušajte ponovo.'}
          </p>

          <div className="flex gap-4 justify-center">
            <motion.button
              onClick={reset}
              className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Pokušaj ponovo
            </motion.button>
            
            <motion.button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 rounded-xl font-semibold border border-border hover:bg-muted/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Početna
            </motion.button>
          </div>

          {error.digest && (
            <p className="mt-6 text-xs text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}

