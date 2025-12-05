import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary dark palette - deep space theme
        slate: {
          850: '#1a1f2e',
          950: '#0a0e17',
        },
        // Weather condition colors
        weather: {
          sunny: '#FFB800',
          cloudy: '#94A3B8',
          rainy: '#3B82F6',
          stormy: '#7C3AED',
          snowy: '#E0F2FE',
          foggy: '#CBD5E1',
          windy: '#06B6D4',
          night: '#1E293B',
        },
        // Temperature gradient colors
        temp: {
          freezing: '#60A5FA',
          cold: '#38BDF8',
          cool: '#22D3EE',
          mild: '#34D399',
          warm: '#FBBF24',
          hot: '#F97316',
          extreme: '#EF4444',
        },
        // Air quality index colors
        aqi: {
          good: '#22C55E',
          moderate: '#EAB308',
          sensitive: '#F97316',
          unhealthy: '#EF4444',
          veryUnhealthy: '#A855F7',
          hazardous: '#7F1D1D',
        },
        // Primary brand colors
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        // Accent colors
        accent: {
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '10xl': ['10rem', { lineHeight: '1' }],
        '11xl': ['12rem', { lineHeight: '1' }],
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.15)',
        'glow-sm': '0 0 15px -3px',
        'glow': '0 0 25px -5px',
        'glow-lg': '0 0 35px -5px',
        'neo': '8px 8px 16px #0a0d14, -8px -8px 16px #1a2030',
        'neo-inset': 'inset 4px 4px 8px #0a0d14, inset -4px -4px 8px #1a2030',
        'neo-sm': '4px 4px 8px #0a0d14, -4px -4px 8px #1a2030',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient': 'linear-gradient(135deg, #0a0e17 0%, #1a1f2e 50%, #0f1420 100%)',
        'aurora': 'linear-gradient(45deg, #0a0e17, #1a237e, #004d40, #0a0e17)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'gradient': 'gradient 15s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'weather-bounce': 'weatherBounce 2s ease-in-out infinite',
        'rain-drop': 'rainDrop 1s linear infinite',
        'cloud-drift': 'cloudDrift 30s linear infinite',
        'sun-rays': 'sunRays 3s ease-in-out infinite',
        'wind-blow': 'windBlow 2s ease-in-out infinite',
        'counter-up': 'counterUp 1s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        weatherBounce: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-10px) scale(1.05)' },
        },
        rainDrop: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        cloudDrift: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        sunRays: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        windBlow: {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '25%': { transform: 'translateX(5px) rotate(5deg)' },
          '75%': { transform: 'translateX(-5px) rotate(-5deg)' },
        },
        counterUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
