/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Karmazyn zmierzony bezpośrednio z 2lo-sandomierz.pl (#990000)
        brand: {
          50: '#fbebeb',
          100: '#f3d0d0',
          200: '#e6a3a3',
          300: '#d47575',
          400: '#c14747',
          500: '#990000',
          600: '#800000',
          700: '#660000',
        },
      },
    },
  },
  plugins: [],
}
