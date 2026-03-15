/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#e5e9ff',
          200: '#c8ceff',
          300: '#a4acff',
          400: '#7c82ff',
          500: '#5b58ff',
          600: '#4236ff',
          700: '#3327e0',
          800: '#281fb0',
          900: '#1f1a85',
        },
      },
    },
  },
  plugins: [],
};

