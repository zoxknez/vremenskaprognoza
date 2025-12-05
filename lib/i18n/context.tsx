'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, DEFAULT_LOCALE, SUPPORTED_LOCALES, translations, t as translate } from './translations';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  supportedLocales: typeof SUPPORTED_LOCALES;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = 'air-quality-locale';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load locale from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in SUPPORTED_LOCALES) {
      setLocaleState(stored as Locale);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (browserLang in SUPPORTED_LOCALES) {
        setLocaleState(browserLang as Locale);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save locale to localStorage
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLocale);
      // Update HTML lang attribute
      document.documentElement.lang = newLocale;
    }
  };

  // Translation function
  const t = (key: string, params?: Record<string, string | number>) => {
    return translate(key, locale, params);
  };

  // Set HTML lang attribute
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      document.documentElement.lang = locale;
    }
  }, [locale, isLoaded]);

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        supportedLocales: SUPPORTED_LOCALES,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

// Hook za dobijanje trenutnog jezika
export function useLocale() {
  const { locale } = useI18n();
  return locale;
}

// Hook za prevođenje
export function useTranslation() {
  const { t, locale } = useI18n();
  return { t, locale };
}
