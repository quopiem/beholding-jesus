/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./admin.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8F7F3',
        primary: {
          DEFAULT: '#1E293B',
          dark: '#0F172A',
          deep: '#0B1120',
          light: '#334155'
        },
        secondary: '#64748B',
        sage: {
          50: '#F4F7F4',
          100: '#E8EFE9',
          200: '#D2DFD4',
          300: '#B4CAB7',
          400: '#94B298',
          DEFAULT: '#78917B',
          600: '#5F7662',
          700: '#4B5E4E',
          800: '#39473C'
        },
        lavender: {
          50: '#F7F5FC',
          100: '#EDE9F7',
          200: '#DDD5F1',
          300: '#C5B7E6',
          DEFAULT: '#EDE9F7',
          accent: '#A795D6',
          deep: '#69559E'
        },
        gold: {
          50: '#FBF8F1',
          100: '#F6EFE0',
          200: '#EBDDC0',
          300: '#DEC69B',
          DEFAULT: '#C5A46D',
          dark: '#A6854E',
          deep: '#7E6334'
        },
        ivory: {
          DEFAULT: '#F8F7F3',
          card: '#FFFFFF',
          muted: '#F2EFEB'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        bible: ['Merriweather', 'Lora', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(30, 41, 59, 0.05), 0 4px 6px -2px rgba(30, 41, 59, 0.02)',
        'card': '0 4px 20px -2px rgba(30, 41, 59, 0.06)',
        'elevated': '0 12px 30px -4px rgba(30, 41, 59, 0.1)',
        'gold': '0 4px 20px -2px rgba(197, 164, 109, 0.25)',
      }
    },
  },
  plugins: [],
}
