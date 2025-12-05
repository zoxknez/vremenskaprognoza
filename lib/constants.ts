// Centralizovane konstante za aplikaciju

// API Endpoints
export const API_ENDPOINTS = {
  weather: '/api/weather',
  forecast: '/api/forecast',
  airQuality: '/api/air-quality',
  stations: '/api/stations',
  contact: '/api/contact',
} as const;

// Cache durations (u sekundama)
export const CACHE_DURATIONS = {
  weather: 300, // 5 minuta
  forecast: 3600, // 1 sat
  airQuality: 300, // 5 minuta
  stations: 86400, // 24 sata
} as const;

// Timeout za API pozive (u ms)
export const API_TIMEOUT = 10000; // 10 sekundi

// Maksimalan broj favorita
export const MAX_FAVORITES = 10;

// Podrazumevani grad
export const DEFAULT_CITY = {
  name: 'Beograd',
  lat: 44.8176,
  lon: 20.4633,
  country: 'Srbija',
};

// Granice za Balkan region (za validaciju koordinata)
export const BALKAN_BOUNDS = {
  minLat: 35.0,
  maxLat: 47.0,
  minLon: 13.0,
  maxLon: 30.0,
};

// Links za navigaciju
export const NAV_LINKS = [
  { href: '/', label: 'Početna', icon: 'Home' },
  { href: '/mapa', label: 'Mapa', icon: 'Map' },
  { href: '/kvalitet-vazduha', label: 'Kvalitet vazduha', icon: 'Wind' },
  { href: '/prognoza', label: 'Prognoza', icon: 'Cloud' },
  { href: '/statistika', label: 'Statistika', icon: 'BarChart' },
  { href: '/kontakt', label: 'Kontakt', icon: 'Mail' },
] as const;

// Social links
export const SOCIAL_LINKS = {
  github: 'https://github.com/zoxknez',
  portfolio: 'https://mojportfolio.vercel.app/',
  issues: 'https://github.com/zoxknez/vremenskaprognoza/issues',
} as const;

// Meta podaci za SEO
export const SITE_META = {
  title: 'VremeVazduh',
  description: 'Vremenska prognoza i kvalitet vazduha za gradove na Balkanu u realnom vremenu',
  url: 'https://vremevazduh.space',
  image: '/og-image.png',
  locale: 'sr_RS',
  type: 'website',
} as const;
