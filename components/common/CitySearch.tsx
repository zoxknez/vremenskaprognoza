'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Globe, Loader2, Locate, MapPin, Search } from 'lucide-react';

import { POPULAR_CITIES } from '@/lib/api/balkan-countries';
import { useToast } from '@/lib/hooks/useToast';
import { matchesSearch } from '@/lib/utils/transliteration';
import { cn } from '@/lib/utils/cn';

interface GeocodingCity {
  name: string;
  nameEn: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  displayName: string;
}

export type SearchResult =
  | ((typeof POPULAR_CITIES)[0] & { isLocal?: boolean })
  | (GeocodingCity & { isLocal?: boolean });

interface CitySearchProps {
  onCitySelect: (city: SearchResult) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  showLocateButton?: boolean;
}

export default function CitySearch({
  onCitySelect,
  placeholder = 'Pretrazite grad...',
  className,
  initialValue = '',
  showLocateButton = true,
}: CitySearchProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchCities = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const localResults = POPULAR_CITIES.filter((city) => matchesSearch(city.name, query)).map((city) => ({
      ...city,
      isLocal: true,
    }));

    setSearchResults(localResults);
    setShowResults(true);

    if (query.length < 3) {
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/geocoding?q=${encodeURIComponent(query)}&limit=5`);
      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const globalResults: SearchResult[] = (data.results || []).map((result: GeocodingCity) => ({
        ...result,
        isLocal: false,
      }));

      const combined: SearchResult[] = [...localResults];
      for (const globalResult of globalResults) {
        const isDuplicate = localResults.some(
          (localResult) => Math.abs(localResult.lat - globalResult.lat) < 0.1 && Math.abs(localResult.lon - globalResult.lon) < 0.1
        );

        if (!isDuplicate) {
          combined.push(globalResult);
        }
      }

      setSearchResults(combined.slice(0, 8));
    } catch (error) {
      console.error('Geocoding search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void searchCities(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchCities]);

  const handleSearchSelect = (city: SearchResult) => {
    setSearchQuery(city.name);
    setShowResults(false);
    onCitySelect(city);
  };

  const handleManualSearch = async () => {
    if (!searchQuery) {
      return;
    }

    const knownCity = POPULAR_CITIES.find((city) => matchesSearch(city.name, searchQuery));
    if (knownCity) {
      handleSearchSelect({ ...knownCity, isLocal: true });
      return;
    }

    setLoading(true);
    try {
      const geoResponse = await fetch(`/api/geocoding?q=${encodeURIComponent(searchQuery)}&limit=1`);
      if (!geoResponse.ok) {
        return;
      }

      const geoData = await geoResponse.json();
      if (geoData.results && geoData.results.length > 0) {
        handleSearchSelect({ ...geoData.results[0], isLocal: false });
      }
    } catch (error) {
      console.error('Manual search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolokacija nije podrzana',
        description: 'Ovaj pretrazivac ne podrzava geolokaciju.',
      });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
          if (!response.ok) {
            return;
          }

          const data = await response.json();
          handleSearchSelect({
            name: data.city || 'Moja lokacija',
            country: data.country || 'N/A',
            lat: latitude,
            lon: longitude,
            isLocal: false,
          });
        } catch (error) {
          console.error('Locate error:', error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLoading(false);
        toast({
          variant: 'destructive',
          title: 'Lokacija nije dostupna',
          description: 'Proverite dozvolu za lokaciju u podesavanjima pretrazivaca.',
        });
      }
    );
  };

  return (
    <div ref={searchRef} className={cn('relative z-20', className)}>
      <div className="group relative">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-cyan opacity-20 blur transition duration-500 group-hover:opacity-35" />

        <div className="relative flex items-center rounded-2xl border border-slate-700/50 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
          <Search className="absolute left-3 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-primary-400 sm:left-4 sm:h-6 sm:w-6" />

          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void handleManualSearch();
              }
            }}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            className="w-full rounded-2xl bg-transparent py-3 pl-12 pr-12 text-base text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 sm:py-4 sm:pl-14 sm:pr-14 sm:text-lg"
            aria-label="Pretraga grada"
          />

          {loading && (
            <div className="absolute right-3 sm:right-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary-500 sm:h-6 sm:w-6" />
            </div>
          )}

          {!loading && showLocateButton && (
            <button
              type="button"
              onClick={handleLocate}
              className="absolute right-2 rounded-xl p-2 text-slate-400 transition-all hover:bg-primary-500/10 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 active:scale-95 sm:right-3 sm:p-2.5"
              title="Lociraj me"
              aria-label="Koristi moju lokaciju"
            >
              <Locate className="h-5 w-5" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showResults && (searchResults.length > 0 || searchQuery.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="custom-scrollbar absolute left-0 right-0 top-full z-50 mt-3 max-h-[60vh] overflow-y-auto rounded-2xl border border-slate-700/50 bg-slate-900/95 shadow-2xl backdrop-blur-xl sm:mt-4 sm:max-h-[400px]"
            >
              {isSearching && (
                <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
                  <Loader2 className="h-3 w-3 animate-spin text-primary-500" />
                  Pretrazujem globalno...
                </div>
              )}

              {searchResults.length > 0 ? (
                <div className="space-y-1 p-1.5 sm:p-2">
                  {searchResults.map((city, index) => (
                    <button
                      type="button"
                      key={`${city.name}-${city.lat}-${city.lon}-${index}`}
                      onClick={() => handleSearchSelect(city)}
                      className="group/item flex min-h-[56px] w-full items-center justify-between rounded-xl p-3 text-left transition-colors hover:bg-white/5 active:bg-white/10 sm:p-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'rounded-lg p-2 transition-colors',
                            city.isLocal
                              ? 'bg-primary-500/10 text-primary-400'
                              : 'bg-slate-800 text-slate-400 group-hover/item:bg-cyan-500/10 group-hover/item:text-cyan-400'
                          )}
                        >
                          {city.isLocal ? <MapPin className="h-4 w-4 sm:h-5 sm:w-5" /> : <Globe className="h-4 w-4 sm:h-5 sm:w-5" />}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-white sm:text-base">
                            {city.name}
                            {!city.isLocal && 'displayName' in city && city.state && (
                              <span className="font-normal text-slate-500">, {city.state}</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400 sm:text-sm">
                            {city.country}
                            {!city.isLocal && <span className="ml-2 text-xs text-cyan-400/70">| Globalno</span>}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4 text-slate-600 opacity-0 transition-colors group-hover/item:text-primary-400 group-hover/item:opacity-100" />
                    </button>
                  ))}
                </div>
              ) : searchQuery.length >= 2 && !isSearching ? (
                <div className="p-6 text-center text-slate-400 sm:p-8">
                  <p className="text-sm sm:text-base">Nema rezultata za &quot;{searchQuery}&quot;</p>
                  <button
                    type="button"
                    onClick={() => void handleManualSearch()}
                    className="mt-3 min-h-[44px] rounded-xl bg-primary-500/10 px-5 py-2 text-sm font-medium text-primary-400 transition-colors hover:bg-primary-500/20 active:bg-primary-500/30 sm:mt-4 sm:px-6 sm:py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                  >
                    Pokusaj ponovo
                  </button>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
