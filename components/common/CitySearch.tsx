'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Locate, ChevronRight, Globe, Loader2 } from 'lucide-react';
import { POPULAR_CITIES } from '@/lib/api/balkan-countries';
import { cn } from '@/lib/utils/cn';
import { matchesSearch } from '@/lib/utils/transliteration';

// Type for geocoding results
interface GeocodingCity {
  name: string;
  nameEn: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  displayName: string;
}

// Combined search result type
export type SearchResult = (typeof POPULAR_CITIES[0] & { isLocal?: boolean }) | (GeocodingCity & { isLocal?: boolean });

interface CitySearchProps {
  onCitySelect: (city: SearchResult) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  showLocateButton?: boolean;
}

export default function CitySearch({ 
  onCitySelect, 
  placeholder = "Pretražite grad...", 
  className,
  initialValue = "",
  showLocateButton = true
}: CitySearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  // Search handler with debounce and geocoding
  const searchCities = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // First, search local popular cities with transliteration support
    const localResults = POPULAR_CITIES.filter((city) =>
      matchesSearch(city.name, query)
    ).map(city => ({ ...city, isLocal: true }));

    // Show local results immediately
    setSearchResults(localResults);
    setShowResults(true);

    // If query is 3+ chars, also search via geocoding API for global results
    if (query.length >= 3) {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/geocoding?q=${encodeURIComponent(query)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          const globalResults: SearchResult[] = data.results.map((r: GeocodingCity) => ({
            ...r,
            isLocal: false,
          }));

          // Combine local and global, removing duplicates
          const combined: SearchResult[] = [...localResults];
          for (const global of globalResults) {
            const isDuplicate = localResults.some(
              local => Math.abs(local.lat - global.lat) < 0.1 && Math.abs(local.lon - global.lon) < 0.1
            );
            if (!isDuplicate) {
              combined.push(global);
            }
          }
          setSearchResults(combined.slice(0, 8)); // Limit to 8 results
        }
      } catch (error) {
        console.error('Geocoding search error:', error);
      } finally {
        setIsSearching(false);
      }
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCities(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchCities]);

  const handleSearchSelect = (city: SearchResult) => {
    setSearchQuery(city.name);
    setShowResults(false);
    onCitySelect(city);
  };

  const handleManualSearch = async () => {
    if (!searchQuery) return;

    // Check if it's a known city (with transliteration support)
    const knownCity = POPULAR_CITIES.find(c => matchesSearch(c.name, searchQuery));
    if (knownCity) {
      handleSearchSelect({ ...knownCity, isLocal: true });
      return;
    }

    // Use geocoding API to find the city
    setLoading(true);
    try {
      const geoRes = await fetch(`/api/geocoding?q=${encodeURIComponent(searchQuery)}&limit=1`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          const city = geoData.results[0];
          handleSearchSelect({ ...city, isLocal: false });
        } else {
          // alert("Grad nije pronađen. Pokušajte sa drugim nazivom.");
        }
      }
    } catch (error) {
      console.error('Manual search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocate = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const newCity = {
              name: data.city || "Moja Lokacija",
              country: data.country || "??",
              lat: latitude,
              lon: longitude,
              isLocal: false
            };
            handleSearchSelect(newCity);
          }
        } catch (e) {
          console.error("Locate error", e);
        } finally {
            setLoading(false);
        }
      }, (error) => {
        console.error("Geolocation error", error);
        setLoading(false);
        alert("Nije moguće dobiti vašu lokaciju. Proverite podešavanja pretraživača.");
      });
    } else {
      alert("Vaš pretraživač ne podržava geolokaciju.");
    }
  };

  return (
    <div ref={searchRef} className={cn("relative z-20", className)}>
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-cyan rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500" />
        <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
          <Search className="absolute left-3 sm:left-4 w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-focus-within:text-primary-400 transition-colors" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            className="w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-3 sm:py-4 bg-transparent text-white placeholder:text-slate-500 focus:outline-none text-base sm:text-lg rounded-2xl"
          />
          {loading && (
            <div className="absolute right-3 sm:right-4">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500 animate-spin" />
            </div>
          )}
          {!loading && showLocateButton && (
            <button
              onClick={handleLocate}
              className="absolute right-2 sm:right-3 p-2 sm:p-2.5 text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-xl transition-all active:scale-95"
              title="Lociraj me"
              aria-label="Use my location"
            >
              <Locate className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showResults && (searchResults.length > 0 || searchQuery.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-3 sm:mt-4 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[60vh] sm:max-h-[400px] overflow-y-auto custom-scrollbar"
            >
              {isSearching && (
                <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-3 h-3 text-primary-500 animate-spin" />
                  Pretražujem globalno...
                </div>
              )}
              {searchResults.length > 0 ? (
                <div className="p-1.5 sm:p-2 space-y-1">
                  {searchResults.map((city, index) => (
                    <button
                      key={`${city.name}-${city.lat}-${city.lon}-${index}`}
                      onClick={() => handleSearchSelect(city)}
                      className="w-full flex items-center justify-between p-3 sm:p-3.5 hover:bg-white/5 active:bg-white/10 rounded-xl transition-colors group/item text-left min-h-[56px]"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${
                          city.isLocal 
                            ? 'bg-primary-500/10 text-primary-400' 
                            : 'bg-slate-800 text-slate-400 group-hover/item:text-cyan-400 group-hover/item:bg-cyan-500/10'
                        }`}>
                          {city.isLocal ? (
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm sm:text-base">
                            {city.name}
                            {!city.isLocal && 'displayName' in city && city.state && (
                              <span className="text-slate-500 font-normal">, {city.state}</span>
                            )}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-400">
                            {city.country}
                            {!city.isLocal && (
                              <span className="ml-2 text-xs text-cyan-400/70">• Globalno</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover/item:text-primary-400 transition-colors opacity-0 group-hover/item:opacity-100" />
                    </button>
                  ))}
                </div>
              ) : searchQuery.length >= 2 && !isSearching ? (
                <div className="p-6 sm:p-8 text-center text-slate-400">
                  <p className="text-sm sm:text-base">Nema rezultata za &quot;{searchQuery}&quot;</p>
                  <button
                    onClick={() => handleManualSearch()}
                    className="mt-3 sm:mt-4 px-5 sm:px-6 py-2 sm:py-2.5 bg-primary-500/10 hover:bg-primary-500/20 active:bg-primary-500/30 text-primary-400 rounded-xl transition-colors text-sm font-medium min-h-[44px]"
                  >
                    Pokušaj ponovo
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
