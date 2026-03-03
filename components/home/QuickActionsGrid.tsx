'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, Calendar, Wind, Map, BarChart3, LucideIcon } from 'lucide-react';

interface QuickAction {
    href: string;
    icon: LucideIcon;
    label: string;
    color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
    { href: "/prognoza", icon: Calendar, label: "7-dnevna prognoza", color: "from-blue-500 to-cyan-500" },
    { href: "/kvalitet-vazduha", icon: Wind, label: "Kvalitet vazduha", color: "from-green-500 to-emerald-500" },
    { href: "/mapa", icon: Map, label: "Interaktivna mapa", color: "from-indigo-500 to-sky-500" },
    { href: "/statistika", icon: BarChart3, label: "Statistika", color: "from-orange-500 to-amber-500" },
];

export function QuickActionsGrid() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12"
        >
            {QUICK_ACTIONS.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className="group relative overflow-hidden rounded-2xl bg-slate-900/40 border border-slate-700/50 p-4 sm:p-5 hover:border-slate-500/70 hover:-translate-y-0.5 transition-all duration-300"
                >
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    <div className="relative flex flex-col items-center text-center gap-2 sm:gap-3">
                        <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${item.color} ring-1 ring-white/10 shadow-lg`}>
                            <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                            {item.label}
                        </span>
                    </div>
                    <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
                </Link>
            ))}
        </motion.div>
    );
}
