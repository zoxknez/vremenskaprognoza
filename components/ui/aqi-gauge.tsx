"use client";

import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

interface AQIGaugeProps {
  value: number;
  maxValue?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

function getAQIInfo(aqi: number): {
  level: string;
  color: string;
  gradient: string;
  description: string;
} {
  if (aqi <= 50) return {
    level: "Dobar",
    color: "#22c55e",
    gradient: "from-green-500 to-emerald-500",
    description: "Kvalitet vazduha je zadovoljavajući",
  };
  if (aqi <= 100) return {
    level: "Umeren",
    color: "#eab308",
    gradient: "from-yellow-500 to-amber-500",
    description: "Prihvatljiv kvalitet vazduha",
  };
  if (aqi <= 150) return {
    level: "Nezdrav za osetljive",
    color: "#f97316",
    gradient: "from-orange-500 to-amber-600",
    description: "Osetljive grupe mogu imati probleme",
  };
  if (aqi <= 200) return {
    level: "Nezdrav",
    color: "#ef4444",
    gradient: "from-red-500 to-rose-500",
    description: "Svi mogu osećati zdravstvene efekte",
  };
  if (aqi <= 300) return {
    level: "Veoma nezdrav",
    color: "#a855f7",
    gradient: "from-purple-500 to-violet-500",
    description: "Zdravstveno upozorenje za sve",
  };
  return {
    level: "Opasan",
    color: "#881337",
    gradient: "from-rose-900 to-red-900",
    description: "Hitno zdravstveno upozorenje",
  };
}

export function AQIGauge({
  value,
  maxValue = 500,
  size = "md",
  showLabel = true,
  animated = true,
  className,
}: AQIGaugeProps) {
  const { level, color, gradient, description } = getAQIInfo(value);
  const percentage = Math.min((value / maxValue) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75;

  const sizes = {
    sm: { container: "w-24 h-24", text: "text-xl", label: "text-xs" },
    md: { container: "w-36 h-36", text: "text-3xl", label: "text-sm" },
    lg: { container: "w-48 h-48", text: "text-4xl", label: "text-base" },
  };

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className={cn("relative", sizes[size].container)}>
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-135" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-muted/20"
            strokeDasharray={circumference * 0.75}
            strokeDashoffset={0}
          />
          {/* Animated progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference * 0.75}
            initial={{ strokeDashoffset: circumference * 0.75 }}
            animate={{ strokeDashoffset }}
            transition={{ duration: animated ? 1.5 : 0, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={cn("font-bold", sizes[size].text)}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{ color }}
          >
            {value}
          </motion.span>
          <span className={cn("text-muted-foreground", sizes[size].label)}>AQI</span>
        </div>

        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-xl"
          style={{ backgroundColor: color }}
        />
      </div>

      {showLabel && (
        <motion.div
          className="text-center mt-4 space-y-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <span
            className={cn(
              "inline-block px-3 py-1 rounded-full text-sm font-medium",
              "bg-gradient-to-r text-white",
              gradient
            )}
          >
            {level}
          </span>
          <p className="text-xs text-muted-foreground max-w-[150px]">{description}</p>
        </motion.div>
      )}
    </div>
  );
}

interface LinearAQIIndicatorProps {
  value: number;
  maxValue?: number;
  showMarkers?: boolean;
  className?: string;
}

export function LinearAQIIndicator({
  value,
  maxValue = 500,
  showMarkers = true,
  className,
}: LinearAQIIndicatorProps) {
  const { color } = getAQIInfo(value);
  const percentage = Math.min((value / maxValue) * 100, 100);

  const markers = [
    { value: 50, color: "#22c55e" },
    { value: 100, color: "#eab308" },
    { value: 150, color: "#f97316" },
    { value: 200, color: "#ef4444" },
    { value: 300, color: "#a855f7" },
    { value: 500, color: "#881337" },
  ];

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="relative h-3 rounded-full overflow-hidden bg-muted/30">
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, #22c55e 0%, #eab308 20%, #f97316 30%, #ef4444 40%, #a855f7 60%, #881337 100%)`,
            opacity: 0.3,
          }}
        />
        {/* Progress bar */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        {/* Current position marker */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg"
          style={{ backgroundColor: color }}
          initial={{ left: 0 }}
          animate={{ left: `calc(${percentage}% - 8px)` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>

      {showMarkers && (
        <div className="flex justify-between text-xs text-muted-foreground">
          {markers.map(({ value: v, color: c }) => (
            <span key={v} style={{ color: v <= value ? c : undefined }}>
              {v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface PollutantBarProps {
  name: string;
  value: number;
  unit: string;
  maxValue: number;
  color?: string;
  className?: string;
}

export function PollutantBar({
  name,
  value,
  unit,
  maxValue,
  color = "#3b82f6",
  className,
}: PollutantBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-sm text-muted-foreground">
          {value} <span className="text-xs">{unit}</span>
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-muted/30">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
