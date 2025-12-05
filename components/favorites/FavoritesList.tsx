'use client';

import { useFavorites, useFavoriteData } from '@/lib/hooks/useFavorites';
import { AirQualityData, AQI_COLORS } from '@/lib/types/air-quality';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { Star, Trash2, GripVertical, MapPin, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface FavoritesListProps {
  data: AirQualityData[];
}

export function FavoritesList({ data }: FavoritesListProps) {
  const { favorites, removeFavorite, clearFavorites, isLoaded } = useFavorites();
  const favoriteData = useFavoriteData(data, favorites);

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Učitavanje...</div>
        </CardContent>
      </Card>
    );
  }

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
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFavorites}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Očisti sve
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {favorites.map((favorite, index) => {
            const stationData = favoriteData.find((d) => d.id === favorite.id);
            const colors = stationData
              ? AQI_COLORS[stationData.aqiCategory]
              : AQI_COLORS.moderate;

            return (
              <div
                key={favorite.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border',
                  stationData ? colors.bg : 'bg-muted/50',
                  stationData ? colors.border : ''
                )}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {favorite.name}
                      <Link
                        href={`/dashboard/location/${favorite.id}`}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {favorite.city}, {favorite.region}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {stationData ? (
                    <div className="text-right">
                      <div className={cn('text-2xl font-bold', colors.text)}>
                        {stationData.aqi}
                      </div>
                      <div className="text-xs text-muted-foreground">AQI</div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Nema podataka
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFavorite(favorite.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
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
  const { isFavorite, toggleFavorite, canAddMore } = useFavorites();
  const isCurrentlyFavorite = isFavorite(data.id);

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(data);
      }}
      disabled={!isCurrentlyFavorite && !canAddMore}
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
