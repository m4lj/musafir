/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#0f172a',
          900: '#0f1629',
          800: '#1e1b4b',
          700: '#312e81',
        },
        accent: '#6366f1',
        emerald: {
          DEFAULT: '#059669',
          600: '#059669',
        },
        gold: '#f59e0b',
      },
      fontFamily: {
        arabic: ['Scheherazade New', 'serif'],
      }
    }
  },
  plugins: []
}
