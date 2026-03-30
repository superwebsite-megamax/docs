import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'netflix-red': '#E50914',
        'netflix-dark': '#B20710',
        'gold': '#FFD700',
        'neon-blue': '#00D4FF',
        'neon-purple': '#A855F7',
        'neon-pink': '#EC4899',
        'surface': '#0A0A0F',
        'surface-light': '#12121A',
        'surface-card': '#16161F',
      },
      fontFamily: {
        'display': ['"Bebas Neue"', 'Impact', 'sans-serif'],
        'heading': ['"Inter"', 'system-ui', 'sans-serif'],
        'body': ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'tech': ['"Orbitron"', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-mesh': 'radial-gradient(at 40% 20%, rgba(229,9,20,0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(0,212,255,0.08) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(168,85,247,0.06) 0px, transparent 50%)',
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(229,9,20,0.3), 0 0 60px rgba(229,9,20,0.1)',
        'glow-red-lg': '0 0 40px rgba(229,9,20,0.4), 0 0 100px rgba(229,9,20,0.15)',
        'glow-blue': '0 0 20px rgba(0,212,255,0.3), 0 0 60px rgba(0,212,255,0.1)',
        'glow-purple': '0 0 20px rgba(168,85,247,0.3), 0 0 60px rgba(168,85,247,0.1)',
        'card': '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        'card-hover': '0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(229,9,20,0.2), 0 0 40px rgba(229,9,20,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-in-left': 'slideInLeft 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-in-right': 'slideInRight 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'gradient-shift': 'gradientShift 4s ease infinite',
        'text-glow': 'textGlow 3s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
