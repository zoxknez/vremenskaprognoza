'use client';

import { useCallback, useMemo, useState } from 'react';
import { Loader2, MapPin, Search, X } from 'lucide-react';

import { geocodeLocation, type GeocodeResult } from '@/lib/api/geocoding';
import { getFeaturedCities, searchCities, type City } from '@/lib/api/world-locations';
import { useToast } from '@/lib/hooks/useToast';

interface LocationSelectorProps {
  onLocationSelect: (location: { name: string; lat: number; lon: number; country?: string }) => void;
  currentLocation?: { name: string; lat: number; lon: number };
}

type SelectableLocation = { name: string; lat: number; lon: number; country?: string };

export function LocationSelector({ onLocationSelect, currentLocation }: LocationSelectorProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentLocations, setRecentLocations] = useState<City[]>([]);

  const featuredCities = useMemo(() => getFeaturedCities(10), []);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const localResults = searchCities(query, 5);
      const geocodeResults = await geocodeLocation(query);

      const combinedResults: GeocodeResult[] = [
        ...localResults.map((city) => ({
          name: city.name,
          displayName: `${city.name}, ${city.country}`,
          lat: city.lat,
          lon: city.lon,
          country: city.country,
          countryCode: city.countryCode,
          type: 'city' as const,
          importance: 1,
        })),
        ...geocodeResults,
      ];

      const uniqueResults = combinedResults.filter((result, index, self) => {
        return (
          index ===
          self.findIndex((candidate) => Math.abs(candidate.lat - result.lat) < 0.01 && Math.abs(candidate.lon - result.lon) < 0.01)
        );
      });

      setSearchResults(uniqueResults.slice(0, 10));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelect = (location: SelectableLocation) => {
    onLocationSelect(location);
    setSearchQuery('');
    setShowResults(false);

    const nextLocation: City = {
      name: location.name,
      lat: location.lat,
      lon: location.lon,
      country: location.country || '',
      countryCode: '',
    };

    setRecentLocations((previous) => {
      const filtered = previous.filter(
        (item) => Math.abs(item.lat - nextLocation.lat) > 0.01 || Math.abs(item.lon - nextLocation.lon) > 0.01
      );
      return [nextLocation, ...filtered].slice(0, 5);
    });
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolokacija nije podrzana',
        description: 'Ovaj pretrazivac ne podrzava pristup lokaciji.',
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(`/api/geocoding?lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const locationName = data.name || 'Vasa lokacija';

          onLocationSelect({
            name: locationName,
            lat: latitude,
            lon: longitude,
          });
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          onLocationSelect({
            name: 'Vasa lokacija',
            lat: latitude,
            lon: longitude,
          });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          variant: 'destructive',
          title: 'Lokacija nije dostupna',
          description: 'Omogucite pristup lokaciji u podesavanjima pretrazivaca.',
        });
        setIsGettingLocation(false);
      }
    );
  };

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      {currentLocation && (
        <div className="mb-3 flex items-center gap-2 text-xs text-slate-300">
          <MapPin className="h-3.5 w-3.5 text-cyan-300" />
          Trenutna lokacija: <span className="font-semibold text-slate-100">{currentLocation.name}</span>
        </div>
      )}

      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(event) => handleSearch(event.target.value)}
          onFocus={() => searchQuery && setShowResults(true)}
          placeholder="Pretrazite bilo koji grad..."
          className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/70 py-4 pl-12 pr-24 text-base text-white shadow-lg shadow-black/20 transition-all placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          aria-label="Pretraga grada"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setShowResults(false);
            }}
            className="absolute right-20 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            aria-label="Ocisti pretragu"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 p-2.5 text-white transition-all hover:from-sky-400 hover:to-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Koristi moju lokaciju"
          title="Koristi moju lokaciju"
        >
          {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
        </button>
      </div>

      {showResults && (
        <div className="absolute z-50 mt-2 max-h-96 w-full overflow-y-auto rounded-2xl border border-slate-700/70 bg-slate-900/95 shadow-2xl shadow-black/30 backdrop-blur-xl custom-scrollbar">
          {searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <button
                type="button"
                key={`${result.lat}-${result.lon}-${index}`}
                onClick={() =>
                  handleSelect({
                    name: result.name,
                    lat: result.lat,
                    lon: result.lon,
                    country: result.country,
                  })
                }
                className="w-full border-b border-slate-700/50 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-slate-800/70 focus-visible:outline-none focus-visible:bg-slate-800/70"
              >
                <p className="font-medium text-slate-100">{result.name}</p>
                <p className="text-sm text-slate-400">{result.displayName}</p>
              </button>
            ))
          ) : (
            <p className="px-4 py-4 text-sm text-slate-400">Nema rezultata za ovaj upit.</p>
          )}
        </div>
      )}

      {!showResults && !searchQuery && (
        <div className="mt-5">
          <h3 className="mb-3 text-sm font-medium text-slate-400">Popularni gradovi</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {featuredCities.map((city, index) => (
              <button
                type="button"
                key={`${city.name}-${index}`}
                onClick={() =>
                  handleSelect({
                    name: city.name,
                    lat: city.lat,
                    lon: city.lon,
                    country: city.country,
                  })
                }
                className="rounded-lg border border-slate-700/70 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-cyan-400/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {!showResults && !searchQuery && recentLocations.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-3 text-sm font-medium text-slate-400">Nedavno pregledano</h3>
          <div className="flex flex-wrap gap-2">
            {recentLocations.map((location, index) => (
              <button
                type="button"
                key={`${location.name}-${index}`}
                onClick={() => handleSelect(location)}
                className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200 transition-colors hover:bg-cyan-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
              >
                {location.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
