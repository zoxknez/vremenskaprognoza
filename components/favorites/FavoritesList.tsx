'use client';

import { useFavorites } from '@/hooks/useFavorites';
import { AirQualityData, AQI_COLORS } from '@/lib/types/air-quality';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { Star, Trash2, MapPin } from 'lucide-react';
import Link from 'next/link';

interface FavoritesListProps {
  data: AirQualityData[];
}

export function FavoritesList({ data }: FavoritesListProps) {
  const { favorites, isFavorite } = useFavorites();

  if (favorites.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold">Nema sačuvanih lokacija</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Klikni na zvezdicu pored stanice da je dodaš u favorite
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            Sačuvane lokacije ({favorites.length})
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {favorites.map((favorite) => (
            <div
              key={favorite.name}
              className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-medium">{favorite.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {favorite.country}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Dugme za dodavanje/uklanjanje favorita
interface FavoriteButtonProps {
  data: AirQualityData;
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
}

export function FavoriteButton({
  data,
  size = 'default',
  showLabel = false,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isCurrentlyFavorite = isFavorite(data.location.name);

  const handleToggle = () => {
    toggleFavorite({
      name: data.location.name,
      lat: data.location.coordinates[1],
      lon: data.location.coordinates[0],
      country: data.location.city,
    });
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={(e) => {
        e.stopPropagation();
        handleToggle();
      }}
      className={cn(
        isCurrentlyFavorite
          ? 'text-yellow-500 hover:text-yellow-600'
          : 'text-muted-foreground hover:text-yellow-500'
      )}
      title={isCurrentlyFavorite ? 'Ukloni iz favorita' : 'Dodaj u favorite'}
    >
      <Star
        className={cn(
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          isCurrentlyFavorite && 'fill-current'
        )}
      />
      {showLabel && (
        <span className="ml-1">
          {isCurrentlyFavorite ? 'Sačuvano' : 'Sačuvaj'}
        </span>
      )}
    </Button>
  );
}
