'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AirQualityData } from '@/lib/types/air-quality';
import { AirQualityCard } from './AirQualityCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface StationListProps {
  data: AirQualityData[];
  onSelect?: (data: AirQualityData) => void;
  selectedId?: string;
}

type SortOption = 'aqi-desc' | 'aqi-asc' | 'name-asc' | 'name-desc';

export function StationList({ data, onSelect, selectedId }: StationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('aqi-desc');
  const [filterSource, setFilterSource] = useState<string>('all');

  const filteredAndSorted = useMemo(() => {
    let filtered = data.filter((item) => {
      const matchesSearch =
        item.location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSource = filterSource === 'all' || item.source === filterSource;
      return matchesSearch && matchesSource;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'aqi-desc':
          return b.aqi - a.aqi;
        case 'aqi-asc':
          return a.aqi - b.aqi;
        case 'name-asc':
          return a.location.name.localeCompare(b.location.name);
        case 'name-desc':
          return b.location.name.localeCompare(a.location.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [data, searchQuery, sortBy, filterSource]);

  const sources = Array.from(new Set(data.map((item) => item.source)));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pretraži lokacije..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 rounded-md border bg-background text-sm"
          >
            <option value="aqi-desc">AQI ↓</option>
            <option value="aqi-asc">AQI ↑</option>
            <option value="name-asc">Ime A-Z</option>
            <option value="name-desc">Ime Z-A</option>
          </select>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-2 rounded-md border bg-background text-sm"
          >
            <option value="all">Svi izvori</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSorted.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <AirQualityCard
              data={item}
              onClick={() => onSelect?.(item)}
            />
          </motion.div>
        ))}
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Nema pronađenih lokacija
        </div>
      )}
    </div>
  );
}

