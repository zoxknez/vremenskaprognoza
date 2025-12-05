"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/", label: "Početna", icon: "🏠" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/map", label: "Mapa", icon: "🗺️" },
  { href: "/rankings", label: "Rangiranje", icon: "🏆" },
  { href: "/alerts", label: "Upozorenja", icon: "🔔" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl">🌬️</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                  AirQuality
                </h1>
                <p className="text-xs text-muted-foreground">Balkan Monitor</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/" && pathname?.startsWith(item.href));
                
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      className={cn(
                        "relative px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navbar-active"
                          className="absolute inset-0 bg-muted/50 rounded-xl"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              {/* Mobile menu button */}
              <motion.button
                className="md:hidden p-2 rounded-xl hover:bg-muted/50 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="w-6 h-5 flex flex-col justify-between"
                  animate={isMobileMenuOpen ? "open" : "closed"}
                >
                  <motion.span
                    className="w-full h-0.5 bg-foreground rounded-full origin-left"
                    variants={{
                      closed: { rotate: 0 },
                      open: { rotate: 45, y: -2 },
                    }}
                  />
                  <motion.span
                    className="w-full h-0.5 bg-foreground rounded-full"
                    variants={{
                      closed: { opacity: 1 },
                      open: { opacity: 0 },
                    }}
                  />
                  <motion.span
                    className="w-full h-0.5 bg-foreground rounded-full origin-left"
                    variants={{
                      closed: { rotate: 0 },
                      open: { rotate: -45, y: 2 },
                    }}
                  />
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 md:hidden"
          >
            <div className="bg-background/95 backdrop-blur-xl border-b border-border shadow-lg">
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href || 
                    (item.href !== "/" && pathname?.startsWith(item.href));
                  
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                            isActive
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          )}
                        >
                          <span className="text-xl">{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-20" />
    </>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-border/50 bg-background/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-xl">🌬️</span>
              </div>
              <div>
                <h3 className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                  AirQuality
                </h3>
                <p className="text-xs text-muted-foreground">Balkan Monitor</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Praćenje kvaliteta vazduha u realnom vremenu za region Balkana.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Brzi linkovi</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="/map" className="hover:text-foreground transition-colors">Interaktivna mapa</Link></li>
              <li><Link href="/rankings" className="hover:text-foreground transition-colors">Rangiranje gradova</Link></li>
              <li><Link href="/alerts" className="hover:text-foreground transition-colors">Upozorenja</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold">Resursi</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition-colors">O projektu</Link></li>
              <li><Link href="/api-docs" className="hover:text-foreground transition-colors">API dokumentacija</Link></li>
              <li><Link href="/health-tips" className="hover:text-foreground transition-colors">Zdravstveni saveti</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Data Sources */}
          <div className="space-y-4">
            <h4 className="font-semibold">Izvori podataka</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>OpenWeather API</li>
              <li>WAQI (World AQI)</li>
              <li>SEPA Srbija</li>
              <li>Sensor.Community</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AirQuality Balkan Monitor. Sva prava zadržana.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privatnost
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Uslovi korišćenja
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
