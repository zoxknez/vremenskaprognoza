"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { MeshGradientBackground } from '@/components/ui/backgrounds';

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <MeshGradientBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <GlassCard className="text-center p-8">
          <motion.div
            className="text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 mb-4"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          >
            404
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold mb-2">Stranica nije pronađena</h2>
            
            <p className="text-muted-foreground mb-6">
              Izgleda da ste zalutali. Stranica koju tražite ne postoji ili je premeštena.
            </p>

            <div className="flex gap-4 justify-center">
              <Link href="/">
                <motion.button
                  className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Početna stranica
                </motion.button>
              </Link>
              
              <Link href="/dashboard">
                <motion.button
                  className="px-6 py-3 rounded-xl font-semibold border border-border hover:bg-muted/50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Dashboard
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

