'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudSun,
  Menu,
  X,
  Home,
  Cloud,
  Wind,
  Map,
  BarChart3,
  Settings,
  Search,
  Bell,
  Sparkles,
  User,
  Mail,
} from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Početna', icon: Home },
  { href: '/prognoza', label: 'Prognoza', icon: Cloud },
  { href: '/kvalitet-vazduha', label: 'Kvalitet Vazduha', icon: Wind },
  { href: '/mapa', label: 'Mapa', icon: Map },
  { href: '/statistika', label: 'Statistika', icon: BarChart3 },
  { href: '/o-autoru', label: 'O Autoru', icon: User },
  { href: '/kontakt', label: 'Kontakt', icon: Mail },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
                  <Sparkles className="text-white" size={20} />
                </div>
                <span className="font-display font-bold text-xl text-white hidden sm:block">
                  VremenskaPrognoza
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-white bg-slate-800/50'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                  <Search size={20} />
                </button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors relative">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                
                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                        isActive
                          ? 'text-white bg-primary-600/20 border-l-2 border-primary-500'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                      }`}
                    >
                      <Icon size={20} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
