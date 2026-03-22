/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        base: '#070d1a',
        surface: '#0c1525',
        card: '#111d2e',
        'card-hover': '#162236',
        border: 'rgba(255,255,255,0.07)',
        teal: {
          DEFAULT: '#14b8a6',
          bright: '#2dd4bf',
          dim: '#0d9488',
          glow: 'rgba(20,184,166,0.15)',
        },
      },
      boxShadow: {
        soft: '0 8px 32px rgba(0,0,0,0.4)',
        glow: '0 0 40px rgba(20,184,166,0.12)',
        'glow-sm': '0 0 20px rgba(20,184,166,0.08)',
        'card': '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        'teal-gradient': 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
        'surface-gradient': 'linear-gradient(180deg, #0c1525 0%, #070d1a 100%)',
      },
      backgroundSize: {
        grid: '40px 40px',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
