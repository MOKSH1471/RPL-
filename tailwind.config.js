/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        rpl: {
          bg: '#0F0F1A',
          card: 'rgba(255, 255, 255, 0.7)',
          amber: {
            DEFAULT: '#F59E0B',
            light: '#FBBF24',
            dark: '#D97706',
            glow: 'rgba(245, 158, 11, 0.4)',
          },
          emerald: {
            DEFAULT: '#10B981',
            light: '#34D399',
            dark: '#059669',
            glow: 'rgba(16, 185, 129, 0.4)',
          },
          magenta: {
            DEFAULT: '#EC4899',
            light: '#F472B6',
            dark: '#DB2777',
            glow: 'rgba(236, 72, 153, 0.4)',
          },
          violet: {
            DEFAULT: '#8B5CF6',
            light: '#A78BFA',
            dark: '#7C3AED',
          },
          cyan: {
            DEFAULT: '#06B6D4',
            light: '#38BDF8',
          }
        },
      },
      fontFamily: {
        display: ['Syne', 'Outfit', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.5)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.5)',
        'glow-magenta': '0 0 25px -5px rgba(236, 72, 153, 0.5)',
        'vibrant': '0 20px 40px -15px rgba(139, 92, 246, 0.3)',
      },
    },
  },
  plugins: [],
};
