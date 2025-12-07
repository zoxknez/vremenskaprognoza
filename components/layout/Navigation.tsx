'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';
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
  ChevronRight,
} from 'lucide-react';

const navLinks = [
  { href: '/', labelKey: 'nav.home', icon: Home, descKey: 'nav.desc.home' },
  { href: '/prognoza', labelKey: 'nav.forecast', icon: Cloud, descKey: 'nav.desc.forecast' },
  { href: '/kvalitet-vazduha', labelKey: 'nav.airQuality', icon: Wind, descKey: 'nav.desc.airQuality' },
  { href: '/mapa', labelKey: 'nav.map', icon: Map, descKey: 'nav.desc.map' },
  { href: '/statistika', labelKey: 'nav.statistics', icon: BarChart3, descKey: 'nav.desc.statistics' },
  { href: '/o-autoru', labelKey: 'nav.about', icon: User, descKey: 'nav.desc.about' },
  { href: '/kontakt', labelKey: 'nav.contact', icon: Mail, descKey: 'nav.desc.contact' },
];

export function Navigation() {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasNotifications] = useState(false); // Set to true when real notifications exist
  
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Handle scroll for hiding navigation
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show at the top
      if (currentScrollY < 10) {
        setIsVisible(true);
      } 
      // Hide when scrolling down and past threshold
      else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsVisible(false);
      } 
      // Show when scrolling up
      else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to home page with search query
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Close menu when pressing Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      <motion.header 
        className="fixed top-4 left-0 right-0 z-50 px-4"
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: isVisible ? 0 : -100,
          opacity: isVisible ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
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
                  VremeVazduh
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.slice(0, 5).map((link) => {
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
                      {t(link.labelKey)}
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
              <div className="flex items-center gap-2">
                {/* Search Button */}
                <button 
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                  aria-label={t('common.search')}
                >
                  <Search size={20} />
                </button>
                
                {/* Notifications - only show dot when there are notifications */}
                <button className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 relative group">
                  <Bell size={20} />
                  {hasNotifications && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
                  )}
                </button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                  aria-label={mobileMenuOpen ? t('nav.menuClose') : t('nav.menuOpen')}
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-24 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg z-50"
            >
              <form onSubmit={handleSearch} className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <Search className="w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('nav.searchPlaceholder')}
                    className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-lg"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="px-4 pb-4 pt-2 border-t border-slate-800">
                  <p className="text-xs text-slate-500">
                    {t('nav.searchHint')}
                  </p>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Sheet Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
            >
              <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
                </div>
                
                {/* Menu Items */}
                <div className="px-4 pb-8 overflow-y-auto max-h-[calc(85vh-60px)]">
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {navLinks.map((link) => {
                      const isActive = pathname === link.href;
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                            isActive
                              ? 'bg-primary-500/20 border border-primary-500/30'
                              : 'bg-slate-800/50 border border-slate-700/50 active:scale-95'
                          }`}
                        >
                          <div className={`p-3 rounded-xl ${
                            isActive 
                              ? 'bg-primary-500 text-white' 
                              : 'bg-slate-700/50 text-slate-400'
                          }`}>
                            <Icon size={24} />
                          </div>
                          <div className="text-center">
                            <p className={`font-medium text-sm ${isActive ? 'text-white' : 'text-slate-300'}`}>
                              {t(link.labelKey)}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {t(link.descKey)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Quick Actions */}
                  <div className="border-t border-slate-800 pt-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 px-1">{t('nav.quickActions')}</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setSearchOpen(true);
                        }}
                        className="w-full flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 active:scale-[0.98] transition-transform"
                      >
                        <div className="flex items-center gap-3">
                          <Search className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-300">{t('nav.searchCities')}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Safe area for iOS */}
                <div className="h-safe-area-inset-bottom bg-slate-900" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
