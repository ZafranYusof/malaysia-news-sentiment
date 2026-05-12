/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#8B1A1A',
        secondary: '#7c3aed',
        ink: {
          DEFAULT: '#1A1A1A',
          muted: '#6B6A65',
          faint: '#A8A59E',
        },
        paper: {
          DEFAULT: '#FAF8F3',
          card: '#FFFFFF',
          line: '#E8E4DB',
          dark: '#12110F',
          'dark-card': '#1A1917',
          'dark-line': '#2A2824',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
