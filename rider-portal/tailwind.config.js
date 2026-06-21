/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#2d242a',
          purple: '#4a3a46',
          orange: '#ff9f00',
          orangeHover: '#e68f00',
          light: '#f5f5f5',
          white: '#ffffff',
          gray: '#8a8a8a'
        }
      }
    }
  },
  plugins: []
};