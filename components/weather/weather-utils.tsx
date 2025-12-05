import {
    Sun,
    Cloud,
    CloudRain,
    CloudSnow,
    CloudLightning,
    Cloudy,
} from "lucide-react";

// Funkcija za dobijanje ikone vremena
export const getWeatherIcon = (description: string, size: number = 48) => {
    const desc = description.toLowerCase();
    const className = `w-${size / 4} h-${size / 4}`;

    if (desc.includes("sun") || desc.includes("clear") || desc.includes("vedro")) {
        return <Sun className={className} style={{ width: size, height: size }} />;
    } else if (desc.includes("rain") || desc.includes("kiša")) {
        return <CloudRain className={className} style={{ width: size, height: size }} />;
    } else if (desc.includes("snow") || desc.includes("sneg") || desc.includes("snijeg")) {
        return <CloudSnow className={className} style={{ width: size, height: size }} />;
    } else if (desc.includes("thunder") || desc.includes("storm") || desc.includes("grmljavina")) {
        return <CloudLightning className={className} style={{ width: size, height: size }} />;
    } else if (desc.includes("cloud") || desc.includes("oblač")) {
        return <Cloudy className={className} style={{ width: size, height: size }} />;
    } else {
        return <Cloud className={className} style={{ width: size, height: size }} />;
    }
};

// Funkcija za AQI boju
export const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return "text-green-400";
    if (aqi <= 100) return "text-yellow-400";
    if (aqi <= 150) return "text-orange-400";
    if (aqi <= 200) return "text-red-400";
    if (aqi <= 300) return "text-purple-400";
    return "text-rose-600";
};

export const getAQILabel = (aqi: number): string => {
    if (aqi <= 50) return "Odličan";
    if (aqi <= 100) return "Dobar";
    if (aqi <= 150) return "Umeren";
    if (aqi <= 200) return "Nezdrav";
    if (aqi <= 300) return "Vrlo nezdrav";
    return "Opasan";
};

export const getAQIBg = (aqi: number): string => {
    if (aqi <= 50) return "from-green-500/20 to-green-600/10";
    if (aqi <= 100) return "from-yellow-500/20 to-yellow-600/10";
    if (aqi <= 150) return "from-orange-500/20 to-orange-600/10";
    if (aqi <= 200) return "from-red-500/20 to-red-600/10";
    if (aqi <= 300) return "from-purple-500/20 to-purple-600/10";
    return "from-rose-500/20 to-rose-600/10";
};
