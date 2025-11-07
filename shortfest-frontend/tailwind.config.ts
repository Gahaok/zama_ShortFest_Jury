import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E74C3C',
          dark: '#C0392B',
          light: '#EC7063',
        },
        secondary: {
          DEFAULT: '#F39C12',
          dark: '#D68910',
          light: '#F5B041',
        },
        background: {
          DEFAULT: '#1A1A2E',
          surface: '#16213E',
          elevated: '#0F3460',
        },
        text: {
          primary: '#EAEAEA',
          secondary: '#A0A0A0',
          muted: '#6C6C6C',
        },
        accent: {
          DEFAULT: '#0F3460',
          hover: '#1A4D7F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;


