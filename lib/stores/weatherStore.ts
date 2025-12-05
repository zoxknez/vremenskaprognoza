"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

interface WeatherState {
  selectedCity: City | null;
  setSelectedCity: (city: City) => void;
}

// Default city
const DEFAULT_CITY: City = {
  name: "Beograd",
  country: "Srbija",
  lat: 44.7872,
  lon: 20.4573,
};

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set) => ({
      selectedCity: DEFAULT_CITY,
      setSelectedCity: (city) => set({ selectedCity: city }),
    }),
    {
      name: "weather-selected-city",
    }
  )
);
