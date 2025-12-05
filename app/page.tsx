import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Locate, Clock, ChevronRight } from "lucide-react";
import { POPULAR_CITIES } from "@/lib/api/balkan-countries";
import { WeatherData, ForecastData, CityData } from "@/lib/types/weather";
import WeatherCard from "@/components/weather/WeatherCard";
import AirQualityCard from "@/components/weather/AirQualityCard";
import HourlyForecast from "@/components/weather/HourlyForecast";
import CityList from "@/components/weather/CityList";
import { useFavorites } from "@/hooks/useFavorites";

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState(POPULAR_CITIES[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [otherCities, setOtherCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof POPULAR_CITIES>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("sr-Latn-RS", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setCurrentDate(
        now.toLocaleDateString("sr-Latn-RS", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchWeatherData = async (city: { name: string; lat: number; lon: number; country: string }) => {
    setLoading(true);
    try {
      // 1. Fetch Current Weather
      const weatherRes = await fetch(
        `/api/weather?lat=${city.lat}&lon=${city.lon}&city=${encodeURIComponent(city.name)}`
      );
      const weatherData = await weatherRes.json();

      setWeather({
        city: city.name,
        country: city.country,
        temperature: Math.round(weatherData.temperature),
        feelsLike: Math.round(weatherData.feelsLike),
        humidity: weatherData.humidity,
        pressure: weatherData.pressure,
        windSpeed: Math.round(weatherData.windSpeed * 3.6), // Convert m/s to km/h
        visibility: weatherData.visibility / 1000, // Convert m to km
        description: weatherData.description,
        icon: weatherData.icon,
        aqi: weatherData.aqi,
        pm25: weatherData.pm25,
        pm10: weatherData.pm10,
      });

      // 2. Fetch Forecast
      const forecastRes = await fetch(
        `/api/forecast?lat=${city.lat}&lon=${city.lon}`
      );
      const forecastData = await forecastRes.json();

      if (forecastData.hourly) {
        setForecast(forecastData.hourly.slice(0, 24));
      }

      // 3. Fetch Other Cities (Parallel)
      // Filter out the selected city from POPULAR_CITIES to avoid duplication if it's in the list
      const otherCityList = POPULAR_CITIES.filter(c => c.name !== city.name).slice(0, 4);

      const otherCitiesPromises = otherCityList.map(async (otherCity) => {
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
      });

      const otherCitiesResults = await Promise.all(otherCitiesPromises);
      setOtherCities(otherCitiesResults.filter((c): c is CityData => c !== null));

    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(selectedCity);
  }, [selectedCity]);

  // Search handler
  useEffect(() => {
    if (searchQuery.length > 1) {
      const results = POPULAR_CITIES.filter((city) =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const handleSearchSelect = async (city: typeof POPULAR_CITIES[0]) => {
    setSelectedCity(city);
    setSearchQuery("");
    setShowResults(false);
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    // Check if it's a known city
    const knownCity = POPULAR_CITIES.find(c => c.name.toLowerCase() === searchQuery.toLowerCase());
    if (knownCity) {
      handleSearchSelect(knownCity);
      return;
    }

    // If not, try to fetch it via API (which handles geocoding)
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        // Note: The API response might need to include lat/lon/country if we want to set it as selectedCity correctly
        // For now, let's assume the API returns enough info or we refetch.
        // Actually, the current API returns weather data directly. 
        // We should ideally get the coordinates to set `selectedCity`.
        console.log("Manual search for unknown city not fully implemented with forecast yet. Stick to the list or 'Locate Me'.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        setLoading(true);
        try {
          const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const newCity = {
              name: data.city || "Moja Lokacija",
              country: data.country || "??",
              lat: latitude,
              lon: longitude
            };
            setSelectedCity(newCity);
          }
        } catch (e) {
          console.error("Locate error", e);
          setLoading(false);
        }
      }, (error) => {
        console.error("Geolocation error", error);
        alert("Nije moguće dobiti vašu lokaciju. Proverite podešavanja pretraživača.");
      });
    } else {
      alert("Vaš pretraživač ne podržava geolokaciju.");
    }
    setSelectedCity(city);
  } else {
    console.log("Selected city without coords:", city);
}
            }
          }}
        />
      </div >
    </div >
  );
}
