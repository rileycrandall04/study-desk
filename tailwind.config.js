/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        parchment: {
          50:  '#FDF8F0',
          100: '#FAF0E1',
          200: '#F0E4CC',
          300: '#E0D0B0',
          400: '#C8B48A',
          500: '#B09A6A',
        },
        ink: {
          50:  '#F5F3F0',
          100: '#E8E4DD',
          200: '#C8C0B4',
          300: '#8B8070',
          400: '#6B5E4D',
          500: '#4A3F30',
          600: '#342B1E',
          700: '#1E1710',
        },
        gold: {
          50:  '#FBF7EC',
          100: '#F5EDCF',
          200: '#EDDFAB',
          300: '#DFCC7E',
          400: '#C4A35A',
          500: '#A8872E',
          600: '#8B6914',
        },
        highlight: {
          gold:  '#F5EDCF',
          red:   '#FADCD9',
          green: '#D5E8D4',
          blue:  '#D9E4F5',
        },
        dark: {
          bg:      '#1a1712',
          surface: '#252017',
          border:  '#3d3528',
          muted:   '#4a3f30',
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
