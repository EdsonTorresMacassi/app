/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        corporate: {
          dark: '#0F172A', // Slate 900
          light: '#F8FAFC', // Slate 50
          primary: 'var(--color-primary)',
          primaryHover: 'var(--color-primary-hover)',
          accent: '#0EA5E9', // Sky 500
          green: '#10B981', // Emerald 500
          greenDark: '#064E3B', // Emerald 900
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
