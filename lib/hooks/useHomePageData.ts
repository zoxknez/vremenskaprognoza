'use client';

import { useState, useEffect, useCallback } from 'react';
import { POPULAR_CITIES } from '@/lib/api/balkan-countries';
import { WeatherData, ForecastData, CityData, SavedCity } from '@/lib/types/weather';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { logger } from '@/lib/utils/logger';

interface SelectedCity {
    name: string;
    lat: number;
    lon: number;
    country: string;
}

interface RankingCity {
    name: string;
    country: string;
    aqi: number;
    lat?: number;
    lon?: number;
}

interface UseHomePageDataReturn {
    // State
    selectedCity: SelectedCity | undefined;
    weather: WeatherData | null;
    forecast: ForecastData[];
    otherCities: CityData[];
    allCities: CityData[];
    topCleanCities: RankingCity[];
    topPollutedCities: RankingCity[];
    loading: boolean;
    error: string | null;
    currentTime: string;
    currentDate: string;
    sunData: { sunrise: string; sunset: string } | null;
    uvIndex: number | null;
    isLocating: boolean;
    locationPermission: 'prompt' | 'granted' | 'denied' | 'unavailable';
    // Favorites
    favorites: SavedCity[];
    isFavorite: (name: string) => boolean;
    toggleFavorite: (city: SavedCity) => void;
    // Actions
    setSelectedCity: (city: SelectedCity) => void;
    handleSearchSelect: (city: { name: string; lat: number; lon: number; country: string }) => void;
    handleResetLocation: () => Promise<void>;
    refreshWeather: () => void;
}

export function useHomePageData(): UseHomePageDataReturn {
    const [selectedCity, setSelectedCity] = useState<SelectedCity | undefined>(undefined);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [forecast, setForecast] = useState<ForecastData[]>([]);
    const [otherCities, setOtherCities] = useState<CityData[]>([]);
    const [allCities, setAllCities] = useState<CityData[]>([]);
    const [topCleanCities, setTopCleanCities] = useState<RankingCity[]>([]);
    const [topPollutedCities, setTopPollutedCities] = useState<RankingCity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [sunData, setSunData] = useState<{ sunrise: string; sunset: string } | null>(null);
    const [uvIndex, setUvIndex] = useState<number | null>(null);
    const [isLocating, setIsLocating] = useState(true);
    const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied' | 'unavailable'>('prompt');

    const { favorites, isFavorite, toggleFavorite } = useFavorites();

    // Auto-detect user location on first load
    useEffect(() => {
        const detectLocation = async () => {
            const storedLocation = localStorage.getItem('userLocation');
            if (storedLocation) {
                try {
                    const location = JSON.parse(storedLocation);
                    setSelectedCity(location);
                    setIsLocating(false);
                    return;
                } catch {
                    localStorage.removeItem('userLocation');
                }
            }

            if (!navigator.geolocation) {
                logger.log('Geolocation not supported');
                setLocationPermission('unavailable');
                setSelectedCity(POPULAR_CITIES[0]);
                setIsLocating(false);
                return;
            }

            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000,
                    });
                });

                const { latitude, longitude } = position.coords;
                setLocationPermission('granted');

                try {
                    const response = await fetch(
                        `/api/geocoding?lat=${latitude}&lon=${longitude}&reverse=true`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        const userCity = {
                            name: data.city || data.name || 'Moja lokacija',
                            lat: latitude,
                            lon: longitude,
                            country: data.country || 'RS',
                        };
                        localStorage.setItem('userLocation', JSON.stringify(userCity));
                        setSelectedCity(userCity);
                    } else {
                        setSelectedCity(POPULAR_CITIES[0]);
                    }
                } catch {
                    setSelectedCity(POPULAR_CITIES[0]);
                }
            } catch (error: unknown) {
                if (
                    typeof error === 'object' &&
                    error !== null &&
                    'code' in error &&
                    (error as GeolocationPositionError).code === 1
                ) {
                    setLocationPermission('denied');
                }
                setSelectedCity(POPULAR_CITIES[0]);
            }

            setIsLocating(false);
        };

        detectLocation();
    }, []);

    // Update time
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleTimeString('sr-Latn-RS', { hour: '2-digit', minute: '2-digit' })
            );
            setCurrentDate(
                now.toLocaleDateString('sr-Latn-RS', { weekday: 'long', day: 'numeric', month: 'long' })
            );
        };

        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch top cities
    const fetchTopCities = useCallback(async () => {
        try {
            const [cleanResponse, pollutedResponse] = await Promise.all([
                fetch('/api/air-quality/rankings?type=best&limit=5'),
                fetch('/api/air-quality/rankings?type=worst&limit=5'),
            ]);

            if (cleanResponse.ok && pollutedResponse.ok) {
                const cleanData = await cleanResponse.json();
                const pollutedData = await pollutedResponse.json();
                setTopCleanCities(cleanData.rankings || []);
                setTopPollutedCities(pollutedData.rankings || []);
            }
        } catch (error) {
            console.error('Error fetching top cities:', error);
        }
    }, []);

    // Fetch weather data
    const fetchWeatherData = useCallback(async (city: SelectedCity) => {
        setLoading(true);
        setError(null);

        try {
            const weatherPromise = fetch(
                `/api/weather?lat=${city.lat}&lon=${city.lon}&city=${encodeURIComponent(city.name)}`
            ).then(res => {
                if (!res.ok) throw new Error('Greska pri ucitavanju vremenske prognoze');
                return res.json();
            });

            const forecastPromise = fetch(
                `/api/forecast?lat=${city.lat}&lon=${city.lon}`
            ).then(res => res.json());

            const allCityList = POPULAR_CITIES.filter(c => c.name !== city.name).slice(0, 12);
            const allCitiesPromise = Promise.all(allCityList.map(async (otherCity) => {
                try {
                    const res = await fetch(
                        `/api/weather?lat=${otherCity.lat}&lon=${otherCity.lon}&city=${encodeURIComponent(otherCity.name)}`
                    );
                    const data = await res.json();
                    return {
                        name: otherCity.name,
                        country: otherCity.country,
                        temp: Math.round(data.temperature),
                        aqi: data.aqi || 0,
                        description: data.description,
                    };
                } catch {
                    return null;
                }
            }));

            const aqiCityList = POPULAR_CITIES.filter(c => c.name !== city.name).slice(0, 18);
            const aqiCitiesPromise = Promise.all(aqiCityList.map(async (otherCity) => {
                try {
                    const res = await fetch(
                        `/api/weather?lat=${otherCity.lat}&lon=${otherCity.lon}&city=${encodeURIComponent(otherCity.name)}`
                    );
                    const data = await res.json();
                    if (!data.aqi || data.aqi === 0) return null;
                    return {
                        name: otherCity.name,
                        country: otherCity.country,
                        temp: Math.round(data.temperature),
                        aqi: data.aqi,
                        description: data.description,
                    };
                } catch {
                    return null;
                }
            }));

            const [weatherData, forecastData, allCitiesResults, aqiCitiesResults] = await Promise.all([
                weatherPromise,
                forecastPromise,
                allCitiesPromise,
                aqiCitiesPromise,
            ]);

            setWeather({
                city: city.name,
                country: city.country,
                temperature: Math.round(weatherData.temperature),
                feelsLike: Math.round(weatherData.feelsLike),
                humidity: weatherData.humidity,
                pressure: weatherData.pressure,
                windSpeed: Math.round(weatherData.windSpeed * 3.6),
                visibility: weatherData.visibility / 1000,
                description: weatherData.description,
                icon: weatherData.icon,
                aqi: weatherData.aqi,
                pm25: weatherData.pm25,
                pm10: weatherData.pm10,
                no2: weatherData.no2,
                so2: weatherData.so2,
                o3: weatherData.o3,
                co: weatherData.co,
            });

            if (weatherData.sunrise && weatherData.sunset) {
                setSunData({
                    sunrise: new Date(weatherData.sunrise * 1000).toLocaleTimeString('sr-Latn-RS', { hour: '2-digit', minute: '2-digit' }),
                    sunset: new Date(weatherData.sunset * 1000).toLocaleTimeString('sr-Latn-RS', { hour: '2-digit', minute: '2-digit' }),
                });
            }

            if (weatherData.uvi !== undefined) {
                setUvIndex(weatherData.uvi);
            }

            if (forecastData.hourly) {
                setForecast(forecastData.hourly.slice(0, 24));
            }

            const validAllCities = allCitiesResults.filter((c): c is CityData => c !== null).slice(0, 12);
            setAllCities(validAllCities);

            const citiesWithAQI = aqiCitiesResults.filter((c): c is CityData => c !== null && c.aqi > 0).slice(0, 6);
            setOtherCities(citiesWithAQI);

        } catch (err) {
            console.error('Error fetching weather data:', err);
            setError(err instanceof Error ? err.message : 'Greska pri ucitavanju podataka');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch when city changes
    useEffect(() => {
        if (selectedCity) {
            fetchWeatherData(selectedCity);
        }
    }, [selectedCity, fetchWeatherData]);

    // Fetch top cities on mount
    useEffect(() => {
        fetchTopCities();
    }, [fetchTopCities]);

    const handleSearchSelect = useCallback((city: { name: string; lat: number; lon: number; country: string }) => {
        const newCity = { name: city.name, lat: city.lat, lon: city.lon, country: city.country };
        localStorage.setItem('userLocation', JSON.stringify(newCity));
        setSelectedCity(newCity);
    }, []);

    const handleResetLocation = useCallback(async () => {
        localStorage.removeItem('userLocation');
        setIsLocating(true);

        if (navigator.geolocation) {
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                    });
                });

                const { latitude, longitude } = position.coords;
                const response = await fetch(`/api/geocoding?lat=${latitude}&lon=${longitude}&reverse=true`);

                if (response.ok) {
                    const data = await response.json();
                    const userCity = {
                        name: data.city || data.name || 'Moja lokacija',
                        lat: latitude,
                        lon: longitude,
                        country: data.country || 'RS',
                    };
                    localStorage.setItem('userLocation', JSON.stringify(userCity));
                    setSelectedCity(userCity);
                    setLocationPermission('granted');
                }
            } catch {
                setSelectedCity(POPULAR_CITIES[0]);
            }
        }
        setIsLocating(false);
    }, []);

    const refreshWeather = useCallback(() => {
        if (selectedCity) {
            fetchWeatherData(selectedCity);
        }
    }, [selectedCity, fetchWeatherData]);

    return {
        selectedCity,
        weather,
        forecast,
        otherCities,
        allCities,
        topCleanCities,
        topPollutedCities,
        loading,
        error,
        currentTime,
        currentDate,
        sunData,
        uvIndex,
        isLocating,
        locationPermission,
        favorites,
        isFavorite,
        toggleFavorite,
        setSelectedCity,
        handleSearchSelect,
        handleResetLocation,
        refreshWeather,
    };
}

