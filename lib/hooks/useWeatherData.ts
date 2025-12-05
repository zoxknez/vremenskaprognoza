"use client";

import { useState, useEffect, useCallback } from "react";
import { WeatherData, ForecastData, CityData } from "@/lib/types/weather";
import { toast } from "@/lib/hooks/useToast";

interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

interface UseWeatherDataResult {
  weather: WeatherData | null;
  forecast: ForecastData[];
  otherCities: CityData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useWeatherData(city: City | null): UseWeatherDataResult {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [otherCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = useCallback(async () => {
    if (!city) return;

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // Fetch weather data
      const weatherRes = await fetch(
        `/api/weather?lat=${city.lat}&lon=${city.lon}&city=${encodeURIComponent(city.name)}`,
        { signal: controller.signal }
      );

      if (!weatherRes.ok) {
        throw new Error("Nije moguće učitati vremenske podatke");
      }

      const weatherData = await weatherRes.json();

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
      });

      // Fetch forecast
      const forecastRes = await fetch(
        `/api/forecast?lat=${city.lat}&lon=${city.lon}`,
        { signal: controller.signal }
      );

      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        if (forecastData.hourly) {
          setForecast(forecastData.hourly.slice(0, 24));
        }
      }

    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Zahtev je istekao. Pokušajte ponovo.");
        } else {
          setError(err.message);
        }
        toast({
          variant: "destructive",
          title: "Greška",
          description: err.message,
        });
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  return {
    weather,
    forecast,
    otherCities,
    loading,
    error,
    refetch: fetchWeatherData,
  };
}
