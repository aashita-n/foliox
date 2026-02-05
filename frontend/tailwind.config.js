/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ultramarine Dark Blue Theme
        primary: {
          50: '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7ff',
          300: '#a5c0ff',
          400: '#7a9eff',
          500: '#4f7bff',
          600: '#1e3a8a', // Main primary - Ultramarine Dark Blue
          700: '#1e2f6a',
          800: '#1a254d',
          900: '#151b35',
        },
        // Professional Success (Emerald)
        success: {
          500: '#10b981',
          600: '#059669',
        },
        // Professional Danger (Rose)
        danger: {
          500: '#f43f5e',
          600: '#e11d48',
        },
        // Professional Warning (Amber)
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        // Slate gray scale for text
        slate: {
          850: '#1e293b',
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
