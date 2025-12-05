"use client";

import { cn } from "@/lib/utils/cn";
import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  className?: string;
  variant?: "default" | "dark" | "light" | "gradient";
  blur?: "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  glow?: boolean;
  glowColor?: string;
}

export function GlassCard({
  children,
  className,
  variant = "default",
  blur = "xl",
  hover = true,
  glow = false,
  glowColor,
  ...props
}: GlassCardProps) {
  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  };

  const variantClasses = {
    default: "bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10",
    dark: "bg-black/20 dark:bg-black/40 border-black/10 dark:border-white/5",
    light: "bg-white/30 dark:bg-white/10 border-white/40 dark:border-white/20",
    gradient: "bg-gradient-to-br from-white/20 to-white/5 dark:from-white/10 dark:to-white/5 border-white/20 dark:border-white/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      className={cn(
        "relative overflow-hidden rounded-3xl border p-6",
        blurClasses[blur],
        variantClasses[variant],
        hover && "transition-shadow duration-300",
        glow && "shadow-glow",
        className
      )}
      style={glowColor ? { "--glow-color": glowColor } as React.CSSProperties : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface GradientCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  className?: string;
  gradient?: string;
  animated?: boolean;
}

export function GradientCard({
  children,
  className,
  gradient = "from-blue-500/20 via-purple-500/20 to-pink-500/20",
  animated = true,
  ...props
}: GradientCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
      className={cn(
        "relative overflow-hidden rounded-3xl p-6",
        "bg-gradient-to-br",
        gradient,
        "border border-white/10 dark:border-white/5",
        "backdrop-blur-xl",
        animated && "animate-gradient",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface AQICardProps {
  children: ReactNode;
  className?: string;
  aqi: number;
  animated?: boolean;
}

function getAQILevel(aqi: number): "good" | "moderate" | "unhealthy-sensitive" | "unhealthy" | "very-unhealthy" | "hazardous" {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthy-sensitive";
  if (aqi <= 200) return "unhealthy";
  if (aqi <= 300) return "very-unhealthy";
  return "hazardous";
}

const aqiStyles = {
  good: {
    gradient: "from-green-500/30 via-emerald-500/20 to-teal-500/10",
    border: "border-green-500/40",
    glow: "0 0 30px rgba(34, 197, 94, 0.4), 0 0 60px rgba(34, 197, 94, 0.2)",
    ring: "ring-green-500/30",
  },
  moderate: {
    gradient: "from-yellow-500/30 via-amber-500/20 to-orange-500/10",
    border: "border-yellow-500/40",
    glow: "0 0 30px rgba(234, 179, 8, 0.4), 0 0 60px rgba(234, 179, 8, 0.2)",
    ring: "ring-yellow-500/30",
  },
  "unhealthy-sensitive": {
    gradient: "from-orange-500/30 via-amber-600/20 to-red-500/10",
    border: "border-orange-500/40",
    glow: "0 0 30px rgba(249, 115, 22, 0.4), 0 0 60px rgba(249, 115, 22, 0.2)",
    ring: "ring-orange-500/30",
  },
  unhealthy: {
    gradient: "from-red-500/30 via-rose-500/20 to-pink-500/10",
    border: "border-red-500/40",
    glow: "0 0 30px rgba(239, 68, 68, 0.4), 0 0 60px rgba(239, 68, 68, 0.2)",
    ring: "ring-red-500/30",
  },
  "very-unhealthy": {
    gradient: "from-purple-500/30 via-violet-500/20 to-fuchsia-500/10",
    border: "border-purple-500/40",
    glow: "0 0 30px rgba(168, 85, 247, 0.4), 0 0 60px rgba(168, 85, 247, 0.2)",
    ring: "ring-purple-500/30",
  },
  hazardous: {
    gradient: "from-rose-900/30 via-red-900/20 to-purple-900/10",
    border: "border-rose-900/40",
    glow: "0 0 30px rgba(136, 19, 55, 0.4), 0 0 60px rgba(136, 19, 55, 0.2)",
    ring: "ring-rose-900/30",
  },
};

export function AQICard({
  children,
  className,
  aqi,
  animated = true,
}: AQICardProps) {
  const level = getAQILevel(aqi);
  const styles = aqiStyles[level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
      className={cn(
        "relative overflow-hidden rounded-3xl p-6",
        "bg-gradient-to-br backdrop-blur-xl",
        styles.gradient,
        styles.border,
        "border",
        animated && "animate-pulse-slow",
        className
      )}
      style={{ boxShadow: styles.glow }}
    >
      {/* Animated background orb */}
      <div
        className={cn(
          "absolute -top-1/2 -right-1/2 w-full h-full rounded-full opacity-30 blur-3xl",
          "bg-gradient-to-br",
          styles.gradient,
          animated && "animate-blob"
        )}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    stable: "text-yellow-500",
  };

  const trendIcons = {
    up: "↑",
    down: "↓",
    stable: "→",
  };

  return (
    <GlassCard className={cn("p-4", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight">{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {trend && trendValue && (
            <div className={cn("flex items-center gap-1 text-sm", trendColors[trend])}>
              <span>{trendIcons[trend]}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-xl bg-white/10 dark:bg-white/5">
            {icon}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
