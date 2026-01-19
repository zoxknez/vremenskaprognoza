'use client';

import { motion } from 'framer-motion';

// Base skeleton animation
const shimmer = {
    initial: { x: '-100%' },
    animate: { x: '100%' },
    transition: { repeat: Infinity, duration: 1.5, ease: 'linear' },
};

interface SkeletonProps {
    className?: string;
}

function SkeletonPulse({ className = '' }: SkeletonProps) {
    return (
        <div className={`relative overflow-hidden bg-slate-700/50 rounded ${className}`}>
            <motion.div
                {...shimmer}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/30 to-transparent"
            />
        </div>
    );
}

/**
 * Weather Card Skeleton
 * Matches the layout of WeatherCard component
 */
export function WeatherCardSkeleton() {
    return (
        <div className="lg:col-span-2 rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <SkeletonPulse className="w-16 h-16 rounded-2xl" />
                    <div className="space-y-2">
                        <SkeletonPulse className="w-32 h-6" />
                        <SkeletonPulse className="w-24 h-4" />
                    </div>
                </div>
                <SkeletonPulse className="w-10 h-10 rounded-full" />
            </div>

            {/* Temperature */}
            <div className="flex items-center gap-8 mb-8">
                <SkeletonPulse className="w-32 h-20 rounded-xl" />
                <div className="space-y-3">
                    <SkeletonPulse className="w-48 h-6" />
                    <SkeletonPulse className="w-36 h-4" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-slate-700/20 rounded-2xl p-4">
                        <SkeletonPulse className="w-8 h-8 rounded-lg mb-3" />
                        <SkeletonPulse className="w-16 h-5 mb-1" />
                        <SkeletonPulse className="w-12 h-4" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Air Quality Card Skeleton
 */
export function AirQualityCardSkeleton() {
    return (
        <div className="rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <SkeletonPulse className="w-8 h-8 rounded-lg" />
                <SkeletonPulse className="w-32 h-6" />
            </div>

            <div className="flex items-center gap-6 mb-6">
                <SkeletonPulse className="w-24 h-24 rounded-full" />
                <div className="space-y-2">
                    <SkeletonPulse className="w-20 h-8" />
                    <SkeletonPulse className="w-28 h-4" />
                </div>
            </div>

            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <SkeletonPulse className="w-16 h-4" />
                        <SkeletonPulse className="flex-1 h-2 rounded-full" />
                        <SkeletonPulse className="w-12 h-4" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Hourly Forecast Skeleton
 */
export function HourlyForecastSkeleton() {
    return (
        <div className="rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <SkeletonPulse className="w-6 h-6 rounded" />
                <SkeletonPulse className="w-40 h-5" />
            </div>

            <div className="flex gap-4 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-16 text-center">
                        <SkeletonPulse className="w-12 h-4 mx-auto mb-2" />
                        <SkeletonPulse className="w-10 h-10 mx-auto rounded-lg mb-2" />
                        <SkeletonPulse className="w-8 h-5 mx-auto" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * City List Skeleton
 */
export function CityListSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(count)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-4"
                >
                    <div className="flex items-center justify-between mb-3">
                        <SkeletonPulse className="w-20 h-5" />
                        <SkeletonPulse className="w-8 h-8 rounded-lg" />
                    </div>
                    <SkeletonPulse className="w-16 h-8 mb-2" />
                    <SkeletonPulse className="w-24 h-4" />
                </motion.div>
            ))}
        </div>
    );
}

/**
 * Additional Info Cards Skeleton
 */
export function AdditionalInfoSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <SkeletonPulse className="w-4 h-4 rounded" />
                        <SkeletonPulse className="w-32 h-4" />
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <SkeletonPulse className="w-20 h-6" />
                            <SkeletonPulse className="w-16 h-4" />
                        </div>
                        <SkeletonPulse className="w-16 h-16 rounded-xl" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Full Page Loading Skeleton
 * Used when loading the entire home page
 */
export function HomePageSkeleton() {
    return (
        <div className="container mx-auto px-4 max-w-7xl py-8 space-y-8">
            {/* Hero skeleton */}
            <div className="flex flex-col items-center py-16 space-y-6">
                <SkeletonPulse className="w-80 h-12" />
                <SkeletonPulse className="w-64 h-6" />
                <SkeletonPulse className="w-full max-w-md h-14 rounded-2xl" />
            </div>

            {/* Quick actions skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-5">
                        <div className="flex flex-col items-center gap-3">
                            <SkeletonPulse className="w-12 h-12 rounded-xl" />
                            <SkeletonPulse className="w-24 h-4" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Weather cards skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <WeatherCardSkeleton />
                <div className="space-y-6">
                    <AirQualityCardSkeleton />
                    <HourlyForecastSkeleton />
                </div>
            </div>

            <AdditionalInfoSkeleton />
            <CityListSkeleton />
        </div>
    );
}

// Export base component for custom use
export { SkeletonPulse };
