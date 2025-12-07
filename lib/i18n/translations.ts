// Internacionalizacija (i18n) za aplikaciju

export type Locale = 'sr' | 'en' | 'hr' | 'bs' | 'mk' | 'sl' | 'bg' | 'ro' | 'el' | 'sq';

export const SUPPORTED_LOCALES: Record<Locale, { name: string; nativeName: string; flag: string }> = {
  sr: { name: 'Serbian', nativeName: 'Srpski', flag: '🇷🇸' },
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  hr: { name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
  bs: { name: 'Bosnian', nativeName: 'Bosanski', flag: '🇧🇦' },
  mk: { name: 'Macedonian', nativeName: 'Makedonski', flag: '🇲🇰' },
  sl: { name: 'Slovenian', nativeName: 'Slovenscina', flag: '🇸🇮' },
  bg: { name: 'Bulgarian', nativeName: 'Bulgarski', flag: '🇧🇬' },
  ro: { name: 'Romanian', nativeName: 'Romana', flag: '🇷🇴' },
  el: { name: 'Greek', nativeName: 'Ellinika', flag: '🇬🇷' },
  sq: { name: 'Albanian', nativeName: 'Shqip', flag: '🇦🇱' },
};

export const DEFAULT_LOCALE: Locale = 'sr';

// Translations
export const translations: Record<Locale, Record<string, string>> = {
  sr: {
    // Navigation
    'nav.home': 'Početna',
    'nav.dashboard': 'Dashboard',
    'nav.map': 'Mapa',
    'nav.list': 'Lista',
    'nav.compare': 'Uporedi',
    'nav.favorites': 'Favoriti',
    'nav.settings': 'Podešavanja',
    'nav.forecast': 'Prognoza',
    'nav.airQuality': 'Kvalitet Vazduha',
    'nav.statistics': 'Statistika',
    'nav.about': 'O Autoru',
    'nav.contact': 'Kontakt',
    'nav.desc.home': 'Pregled vremena',
    'nav.desc.forecast': '7-dnevna prognoza',
    'nav.desc.airQuality': 'AQI i PM vrednosti',
    'nav.desc.map': 'Interaktivna mapa',
    'nav.desc.statistics': 'Grafikoni i analize',
    'nav.desc.about': 'Ko stoji iza projekta',
    'nav.desc.contact': 'Pošaljite poruku',
    'nav.searchPlaceholder': 'Pretraži grad... (npr. London, Tokyo)',
    'nav.searchHint': 'Pretražite bilo koji grad na svetu • Pritisnite Enter za pretragu',
    'nav.quickActions': 'Brze akcije',
    'nav.searchCities': 'Pretraži gradove',
    'nav.menuOpen': 'Otvori meni',
    'nav.menuClose': 'Zatvori meni',

    // Dashboard
    'dashboard.title': 'Kvalitet vazduha na Balkanu',
    'dashboard.subtitle': 'Praćenje u realnom vremenu',
    'dashboard.activeStations': 'Aktivnih stanica',
    'dashboard.averageAqi': 'Prosečan AQI',
    'dashboard.dataSources': 'Izvora podataka',
    'dashboard.lastUpdated': 'Poslednje ažuriranje',
    'dashboard.noData': 'Nema dostupnih podataka',
    'dashboard.loading': 'Učitavanje...',

    // AQI Categories
    'aqi.good': 'Dobar',
    'aqi.moderate': 'Umeren',
    'aqi.unhealthy': 'Nezdrav',
    'aqi.veryUnhealthy': 'Vrlo nezdrav',
    'aqi.hazardous': 'Opasan',

    // Parameters
    'param.pm25': 'PM2.5',
    'param.pm10': 'PM10',
    'param.no2': 'NO₂',
    'param.so2': 'SO₂',
    'param.o3': 'O₃',
    'param.co': 'CO',

    // Health Advice
    'health.title': 'Zdravstveni saveti',
    'health.generalPopulation': 'Opšta populacija',
    'health.sensitiveGroups': 'Osetljive grupe',
    'health.outdoorActivity': 'Aktivnosti napolju',
    'health.recommended': 'Preporučeno',
    'health.moderate': 'Umereno',
    'health.reduce': 'Smanjite',
    'health.avoid': 'Izbegavajte',
    'health.stayIndoors': 'Ostanite unutra',

    // Forecast
    'forecast.title': 'Prognoza',
    'forecast.hourly': '48 sati',
    'forecast.daily': 'Dnevna',
    'forecast.trend': 'Trend',
    'forecast.increasing': 'Raste',
    'forecast.decreasing': 'Opada',
    'forecast.stable': 'Stabilan',

    // Location
    'location.nearest': 'Najbliža stanica',
    'location.enable': 'Omogući lokaciju',
    'location.searching': 'Tražim lokaciju...',
    'location.distance': 'Udaljenost',

    // Favorites
    'favorites.title': 'Sačuvane lokacije',
    'favorites.add': 'Dodaj u favorite',
    'favorites.remove': 'Ukloni iz favorita',
    'favorites.clear': 'Očisti sve',
    'favorites.empty': 'Nema sačuvanih lokacija',

    // Compare
    'compare.title': 'Uporedi gradove',
    'compare.select': 'Izaberi gradove',
    'compare.maxCities': 'Maksimum {count} gradova',

    // Ranking
    'ranking.title': 'Rangiranje',
    'ranking.best': 'Najbolji',
    'ranking.worst': 'Najgori',
    'ranking.mostImproved': 'Najviše poboljšan',

    // Notifications
    'notifications.title': 'Obaveštenja',
    'notifications.enable': 'Omogući obaveštenja',
    'notifications.highAqi': 'Visok nivo zagađenja',
    'notifications.threshold': 'Prag upozorenja',

    // Settings
    'settings.title': 'Podešavanja',
    'settings.language': 'Jezik',
    'settings.theme': 'Tema',
    'settings.themeLight': 'Svetla',
    'settings.themeDark': 'Tamna',
    'settings.themeSystem': 'Sistemska',
    'settings.units': 'Jedinice',

    // PWA
    'pwa.install': 'Instaliraj aplikaciju',
    'pwa.update': 'Nova verzija dostupna',
    'pwa.offline': 'Offline režim',
    'pwa.online': 'Online',

    // Common
    'common.search': 'Pretraži',
    'common.filter': 'Filtriraj',
    'common.sort': 'Sortiraj',
    'common.refresh': 'Osveži',
    'common.close': 'Zatvori',
    'common.save': 'Sačuvaj',
    'common.cancel': 'Otkaži',
    'common.loading': 'Učitavanje...',
    'common.error': 'Greška',
    'common.retry': 'Pokušaj ponovo',
    'common.noResults': 'Nema rezultata',
    'common.showMore': 'Prikaži više',
    'common.showLess': 'Prikaži manje',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.map': 'Map',
    'nav.list': 'List',
    'nav.compare': 'Compare',
    'nav.favorites': 'Favorites',
    'nav.settings': 'Settings',
    'nav.forecast': 'Forecast',
    'nav.airQuality': 'Air Quality',
    'nav.statistics': 'Statistics',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.desc.home': 'Weather overview',
    'nav.desc.forecast': '7-day forecast',
    'nav.desc.airQuality': 'AQI and PM values',
    'nav.desc.map': 'Interactive map',
    'nav.desc.statistics': 'Charts and analysis',
    'nav.desc.about': 'Who is behind the project',
    'nav.desc.contact': 'Send a message',
    'nav.searchPlaceholder': 'Search city... (e.g. London, Tokyo)',
    'nav.searchHint': 'Search any city in the world • Press Enter to search',
    'nav.quickActions': 'Quick actions',
    'nav.searchCities': 'Search cities',
    'nav.menuOpen': 'Open menu',
    'nav.menuClose': 'Close menu',

    // Dashboard
    'dashboard.title': 'Air Quality in the Balkans',
    'dashboard.subtitle': 'Real-time monitoring',
    'dashboard.activeStations': 'Active stations',
    'dashboard.averageAqi': 'Average AQI',
    'dashboard.dataSources': 'Data sources',
    'dashboard.lastUpdated': 'Last updated',
    'dashboard.noData': 'No data available',
    'dashboard.loading': 'Loading...',

    // AQI Categories
    'aqi.good': 'Good',
    'aqi.moderate': 'Moderate',
    'aqi.unhealthy': 'Unhealthy',
    'aqi.veryUnhealthy': 'Very Unhealthy',
    'aqi.hazardous': 'Hazardous',

    // Parameters
    'param.pm25': 'PM2.5',
    'param.pm10': 'PM10',
    'param.no2': 'NO₂',
    'param.so2': 'SO₂',
    'param.o3': 'O₃',
    'param.co': 'CO',

    // Health Advice
    'health.title': 'Health Advice',
    'health.generalPopulation': 'General Population',
    'health.sensitiveGroups': 'Sensitive Groups',
    'health.outdoorActivity': 'Outdoor Activity',
    'health.recommended': 'Recommended',
    'health.moderate': 'Moderate',
    'health.reduce': 'Reduce',
    'health.avoid': 'Avoid',
    'health.stayIndoors': 'Stay Indoors',

    // Forecast
    'forecast.title': 'Forecast',
    'forecast.hourly': '48 hours',
    'forecast.daily': 'Daily',
    'forecast.trend': 'Trend',
    'forecast.increasing': 'Increasing',
    'forecast.decreasing': 'Decreasing',
    'forecast.stable': 'Stable',

    // Location
    'location.nearest': 'Nearest station',
    'location.enable': 'Enable location',
    'location.searching': 'Searching location...',
    'location.distance': 'Distance',

    // Favorites
    'favorites.title': 'Saved locations',
    'favorites.add': 'Add to favorites',
    'favorites.remove': 'Remove from favorites',
    'favorites.clear': 'Clear all',
    'favorites.empty': 'No saved locations',

    // Compare
    'compare.title': 'Compare cities',
    'compare.select': 'Select cities',
    'compare.maxCities': 'Maximum {count} cities',

    // Ranking
    'ranking.title': 'Ranking',
    'ranking.best': 'Best',
    'ranking.worst': 'Worst',
    'ranking.mostImproved': 'Most improved',

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.enable': 'Enable notifications',
    'notifications.highAqi': 'High pollution level',
    'notifications.threshold': 'Alert threshold',

    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.themeLight': 'Light',
    'settings.themeDark': 'Dark',
    'settings.themeSystem': 'System',
    'settings.units': 'Units',

    // PWA
    'pwa.install': 'Install app',
    'pwa.update': 'New version available',
    'pwa.offline': 'Offline mode',
    'pwa.online': 'Online',

    // Common
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.refresh': 'Refresh',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.noResults': 'No results',
    'common.showMore': 'Show more',
    'common.showLess': 'Show less',
  },
  hr: {
    'nav.home': 'Početna',
    'nav.dashboard': 'Nadzorna ploča',
    'dashboard.title': 'Kvaliteta zraka na Balkanu',
    'aqi.good': 'Dobar',
    'aqi.moderate': 'Umjeren',
    'aqi.unhealthy': 'Nezdrav',
    // ... ostali prijevodi
  },
  bs: {
    'nav.home': 'Početna',
    'nav.dashboard': 'Kontrolna tabla',
    'dashboard.title': 'Kvalitet zraka na Balkanu',
    'aqi.good': 'Dobar',
    'aqi.moderate': 'Umjeren',
    // ... ostali prijevodi
  },
  mk: {
    'nav.home': 'Pocetna',
    'nav.dashboard': 'Kontrolna tabla',
    'dashboard.title': 'Kvalitet na vozduhot na Balkanot',
    'aqi.good': 'Dobar',
    'aqi.moderate': 'Umeren',
    // ... ostali prijevodi
  },
  sl: {
    'nav.home': 'Domov',
    'nav.dashboard': 'Nadzorna plošča',
    'dashboard.title': 'Kakovost zraka na Balkanu',
    'aqi.good': 'Dober',
    'aqi.moderate': 'Zmeren',
    // ... ostali prijevodi
  },
  bg: {
    'nav.home': 'Nachalo',
    'nav.dashboard': 'Tablo',
    'dashboard.title': 'Kachestvo na vazduha na Balkanite',
    'aqi.good': 'Dobar',
    'aqi.moderate': 'Umeren',
    // ... ostali prijevodi
  },
  ro: {
    'nav.home': 'Acasă',
    'nav.dashboard': 'Tablou de bord',
    'dashboard.title': 'Calitatea aerului în Balcani',
    'aqi.good': 'Bun',
    'aqi.moderate': 'Moderat',
    // ... ostali prijevodi
  },
  el: {
    'nav.home': 'Αρχική',
    'nav.dashboard': 'Πίνακας ελέγχου',
    'dashboard.title': 'Ποιότητα αέρα στα Βαλκάνια',
    'aqi.good': 'Καλή',
    'aqi.moderate': 'Μέτρια',
    // ... ostali prijevodi
  },
  sq: {
    'nav.home': 'Fillimi',
    'nav.dashboard': 'Paneli',
    'dashboard.title': 'Cilësia e ajrit në Ballkan',
    'aqi.good': 'Mirë',
    'aqi.moderate': 'Mesatar',
    // ... ostali prijevodi
  },
};

// Get translation
export function t(key: string, locale: Locale = DEFAULT_LOCALE, params?: Record<string, string | number>): string {
  let translation = translations[locale]?.[key] || translations[DEFAULT_LOCALE]?.[key] || key;
  
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(`{${param}}`, String(value));
    });
  }
  
  return translation;
}
