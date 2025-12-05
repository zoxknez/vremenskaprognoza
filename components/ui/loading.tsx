"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { ReactNode } from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) {
  const variants = {
    text: "rounded h-4",
    circular: "rounded-full aspect-square",
    rectangular: "rounded-none",
    rounded: "rounded-xl",
  };

  const animations = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  return (
    <div
      className={cn(
        "bg-muted/50 dark:bg-muted/30",
        variants[variant],
        animations[animation],
        className
      )}
      style={{ width, height }}
    />
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 rounded-3xl bg-card/50 backdrop-blur-xl border border-border/50 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="w-24 h-4" />
        <Skeleton variant="circular" className="w-8 h-8" />
      </div>
      <Skeleton variant="text" className="w-full h-12" />
      <div className="flex gap-4">
        <Skeleton variant="text" className="w-16 h-4" />
        <Skeleton variant="text" className="w-20 h-4" />
      </div>
    </div>
  );
}

export function AQICardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 rounded-3xl bg-muted/20 backdrop-blur-xl border border-border/30 space-y-4", className)}>
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="w-20 h-20" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-32 h-6" />
          <Skeleton variant="text" className="w-24 h-4" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="text" className="w-full h-3" />
            <Skeleton variant="text" className="w-2/3 h-5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MapSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative rounded-3xl overflow-hidden bg-muted/20 backdrop-blur-xl border border-border/30", className)}>
      <div className="aspect-video flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-sm text-muted-foreground">Učitavanje mape...</span>
        </motion.div>
      </div>
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 rounded-3xl bg-card/50 backdrop-blur-xl border border-border/50 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="w-32 h-6" />
        <div className="flex gap-2">
          <Skeleton variant="rounded" className="w-16 h-8" />
          <Skeleton variant="rounded" className="w-16 h-8" />
        </div>
      </div>
      <div className="h-64 flex items-end gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="flex-1 bg-muted/30 rounded-t-lg"
            initial={{ height: 0 }}
            animate={{ height: `${Math.random() * 80 + 20}%` }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          />
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ 
  count = 5, 
  className 
}: { 
  count?: number; 
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-4 p-4 rounded-2xl bg-card/50 backdrop-blur border border-border/50"
        >
          <Skeleton variant="circular" className="w-12 h-12" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-40 h-5" />
            <Skeleton variant="text" className="w-24 h-3" />
          </div>
          <Skeleton variant="rounded" className="w-16 h-8" />
        </motion.div>
      ))}
    </div>
  );
}

interface PageLoaderProps {
  message?: string;
  submessage?: string;
}

export function PageLoader({ 
  message = "Učitavanje...", 
  submessage 
}: PageLoaderProps) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6">
      {/* Animated loader */}
      <div className="relative">
        <motion.div
          className="w-20 h-20 rounded-full border-4 border-muted"
          style={{ borderTopColor: "hsl(var(--primary))" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-4 border-muted"
          style={{ borderBottomColor: "hsl(var(--primary))" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/50 to-primary/20 blur-sm"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Text */}
      <div className="text-center space-y-2">
        <motion.p
          className="text-lg font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
        {submessage && (
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {submessage}
          </motion.p>
        )}
      </div>

      {/* Animated dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ y: [-4, 4, -4] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function InlineLoader({ 
  size = "md",
  className 
}: { 
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  };

  return (
    <motion.div
      className={cn(
        "rounded-full border-muted",
        sizes[size],
        className
      )}
      style={{ borderTopColor: "hsl(var(--primary))" }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  );
}
