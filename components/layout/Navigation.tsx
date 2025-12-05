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
      <header className="fixed top-4 left-0 right-0 z-50 px-4">
        <nav className="max-w-7xl mx-auto bg-slate-950/70 backdrop-blur-2xl border border-slate-800/50 rounded-2xl shadow-2xl shadow-black/20">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-cyan rounded-xl opacity-80 group-hover:opacity-100 transition-opacity blur-sm" />
                  <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center border border-white/10">
                    <Sparkles className="text-white" size={20} />
                  </div>
                </div>
                <span className="font-display font-bold text-xl text-white hidden sm:block tracking-tight">
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
                      className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                          ? 'text-white'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute inset-0 bg-white/10 rounded-xl border border-white/5"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-3">
                <button className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
                  <Search size={20} />
                </button>
                <button className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 relative group">
                  <Bell size={20} />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-950 group-hover:scale-110 transition-transform" />
                </button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive
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
