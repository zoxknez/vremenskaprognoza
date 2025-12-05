// Centralizovani prevodi za vremenske uslove
// OpenWeatherMap weather conditions: https://openweathermap.org/weather-conditions

export interface WeatherTranslation {
  description: string;
  icon?: string;
}

// Mapiranje OpenWeatherMap ikona na opise
export const weatherTranslations: Record<string, WeatherTranslation> = {
  // Clear
  "01d": { description: "Vedro", icon: "☀️" },
  "01n": { description: "Vedra noć", icon: "🌙" },
  
  // Few clouds
  "02d": { description: "Malo oblačno", icon: "🌤️" },
  "02n": { description: "Malo oblačna noć", icon: "☁️" },
  
  // Scattered clouds
  "03d": { description: "Oblačno", icon: "☁️" },
  "03n": { description: "Oblačno", icon: "☁️" },
  
  // Broken clouds
  "04d": { description: "Pretežno oblačno", icon: "☁️" },
  "04n": { description: "Pretežno oblačno", icon: "☁️" },
  
  // Shower rain
  "09d": { description: "Pljusak", icon: "🌧️" },
  "09n": { description: "Pljusak", icon: "🌧️" },
  
  // Rain
  "10d": { description: "Kiša", icon: "🌧️" },
  "10n": { description: "Kiša", icon: "🌧️" },
  
  // Thunderstorm
  "11d": { description: "Grmljavina", icon: "⛈️" },
  "11n": { description: "Grmljavina", icon: "⛈️" },
  
  // Snow
  "13d": { description: "Sneg", icon: "❄️" },
  "13n": { description: "Sneg", icon: "❄️" },
  
  // Mist/Fog
  "50d": { description: "Magla", icon: "🌫️" },
  "50n": { description: "Magla", icon: "🌫️" },
};

// Prevod prema OpenWeatherMap main weather kategoriji
export const weatherCategoryTranslations: Record<string, string> = {
  "Clear": "Vedro",
  "Clouds": "Oblačno",
  "Rain": "Kiša",
  "Drizzle": "Rosulja",
  "Thunderstorm": "Grmljavina",
  "Snow": "Sneg",
  "Mist": "Izmaglica",
  "Fog": "Magla",
  "Haze": "Sumaglica",
  "Smoke": "Dim",
  "Dust": "Prašina",
  "Sand": "Pesak",
  "Ash": "Pepeo",
  "Squall": "Oluja",
  "Tornado": "Tornado",
};

// Prevod detaljnih opisa vremena
export const weatherDescriptionTranslations: Record<string, string> = {
  // Clear
  "clear sky": "Vedro nebo",
  
  // Clouds
  "few clouds": "Malo oblaka",
  "scattered clouds": "Rasuti oblaci",
  "broken clouds": "Isprekidani oblaci",
  "overcast clouds": "Potpuno oblačno",
  
  // Rain
  "light rain": "Slaba kiša",
  "moderate rain": "Umerena kiša",
  "heavy intensity rain": "Jaka kiša",
  "very heavy rain": "Veoma jaka kiša",
  "extreme rain": "Ekstremna kiša",
  "freezing rain": "Ledena kiša",
  "light intensity shower rain": "Slab pljusak",
  "shower rain": "Pljusak",
  "heavy intensity shower rain": "Jak pljusak",
  "ragged shower rain": "Neujednačen pljusak",
  
  // Drizzle
  "light intensity drizzle": "Slaba rosulja",
  "drizzle": "Rosulja",
  "heavy intensity drizzle": "Jaka rosulja",
  "light intensity drizzle rain": "Slaba rosulja sa kišom",
  "drizzle rain": "Rosulja sa kišom",
  "heavy intensity drizzle rain": "Jaka rosulja sa kišom",
  "shower rain and drizzle": "Pljusak i rosulja",
  "heavy shower rain and drizzle": "Jak pljusak i rosulja",
  "shower drizzle": "Prolazna rosulja",
  
  // Thunderstorm
  "thunderstorm with light rain": "Grmljavina sa slabom kišom",
  "thunderstorm with rain": "Grmljavina sa kišom",
  "thunderstorm with heavy rain": "Grmljavina sa jakom kišom",
  "light thunderstorm": "Slaba grmljavina",
  "thunderstorm": "Grmljavina",
  "heavy thunderstorm": "Jaka grmljavina",
  "ragged thunderstorm": "Neujednačena grmljavina",
  "thunderstorm with light drizzle": "Grmljavina sa slabom rosulljom",
  "thunderstorm with drizzle": "Grmljavina sa rosulljom",
  "thunderstorm with heavy drizzle": "Grmljavina sa jakom rosulljom",
  
  // Snow
  "light snow": "Slab sneg",
  "snow": "Sneg",
  "heavy snow": "Jak sneg",
  "sleet": "Susnežica",
  "light shower sleet": "Slaba susnežica",
  "shower sleet": "Susnežica",
  "light rain and snow": "Slaba kiša i sneg",
  "rain and snow": "Kiša i sneg",
  "light shower snow": "Slab snežni pljusak",
  "shower snow": "Snežni pljusak",
  "heavy shower snow": "Jak snežni pljusak",
  
  // Atmosphere
  "mist": "Izmaglica",
  "smoke": "Dim",
  "haze": "Sumaglica",
  "sand/dust whirls": "Pješčani/prašinasti vrtlozi",
  "fog": "Magla",
  "sand": "Pesak",
  "dust": "Prašina",
  "volcanic ash": "Vulkanski pepeo",
  "squalls": "Olujni udari",
  "tornado": "Tornado",
};

/**
 * Prevodi OpenWeatherMap weather icon kod u srpski opis
 */
export function translateWeatherIcon(iconCode: string): WeatherTranslation {
  return weatherTranslations[iconCode] ?? { description: "Nepoznato", icon: "❓" };
}

/**
 * Prevodi OpenWeatherMap main kategoriju u srpski
 */
export function translateWeatherCategory(category: string): string {
  return weatherCategoryTranslations[category] ?? category;
}

/**
 * Prevodi OpenWeatherMap description u srpski
 */
export function translateWeatherDescription(description: string): string {
  const lowerDesc = description.toLowerCase();
  return weatherDescriptionTranslations[lowerDesc] ?? description;
}

/**
 * Kombinovana funkcija za prevod vremena
 * Pokušava prvo description, pa icon, pa kategoriju
 */
export function translateWeather(
  description?: string,
  iconCode?: string,
  category?: string
): string {
  // Prvo probaj detaljni opis
  if (description) {
    const translated = translateWeatherDescription(description);
    if (translated !== description) return translated;
  }
  
  // Zatim probaj icon
  if (iconCode) {
    const iconTranslation = translateWeatherIcon(iconCode);
    if (iconTranslation.description !== "Nepoznato") {
      return iconTranslation.description;
    }
  }
  
  // Na kraju probaj kategoriju
  if (category) {
    return translateWeatherCategory(category);
  }
  
  return description ?? "Nepoznato";
}

/**
 * Vraća emoji za vremensku ikonu
 */
export function getWeatherEmoji(iconCode: string): string {
  return weatherTranslations[iconCode]?.icon ?? "❓";
}

// UV Index prevodi i kategorije
export const uvIndexCategories = [
  { min: 0, max: 2, label: "Nizak", color: "text-green-500", bgColor: "bg-green-500" },
  { min: 3, max: 5, label: "Umeren", color: "text-yellow-500", bgColor: "bg-yellow-500" },
  { min: 6, max: 7, label: "Visok", color: "text-orange-500", bgColor: "bg-orange-500" },
  { min: 8, max: 10, label: "Veoma visok", color: "text-red-500", bgColor: "bg-red-500" },
  { min: 11, max: 20, label: "Ekstremno visok", color: "text-purple-500", bgColor: "bg-purple-500" },
] as const;

export function getUVIndexCategory(uvi: number) {
  return uvIndexCategories.find(c => uvi >= c.min && uvi <= c.max) ?? uvIndexCategories[4];
}

// Smer vetra
export function getWindDirection(degrees: number): string {
  const directions = ["S", "SSI", "SI", "ISI", "I", "IJI", "JI", "JJI", "J", "JJZ", "JZ", "ZJZ", "Z", "ZSZ", "SZ", "SSZ"];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index] ?? "N/A";
}

export function getWindDirectionFull(degrees: number): string {
  const directions: Record<string, string> = {
    "S": "Sever",
    "SSI": "Sever-severoistok",
    "SI": "Severoistok",
    "ISI": "Istok-severoistok",
    "I": "Istok",
    "IJI": "Istok-jugoistok",
    "JI": "Jugoistok",
    "JJI": "Jug-jugoistok",
    "J": "Jug",
    "JJZ": "Jug-jugozapad",
    "JZ": "Jugozapad",
    "ZJZ": "Zapad-jugozapad",
    "Z": "Zapad",
    "ZSZ": "Zapad-severozapad",
    "SZ": "Severozapad",
    "SSZ": "Sever-severozapad",
  };
  const shortDir = getWindDirection(degrees);
  return directions[shortDir] ?? "Nepoznato";
}
