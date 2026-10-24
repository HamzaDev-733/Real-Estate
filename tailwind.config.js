/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060F1F',
          900: '#0A1A33',
          800: '#0F2747',
          700: '#16345F',
          600: '#1E4478',
          500: '#2F5D9B',
          400: '#5A7FB5',
          300: '#8CA5CB',
          200: '#BAC9E0',
          100: '#DCE4F0',
          50: '#EEF2F8',
        },
        mist: {
          50: '#F8F9FB',
          100: '#F0F2F6',
          200: '#E2E6EC',
          300: '#CBD2DC',
          400: '#9AA4B5',
          500: '#6B7689',
          600: '#4A5568',
          700: '#343C4B',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        dots: {
          '0%,80%,100%': { transform: 'scale(0.6)', opacity: '0.4' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        shimmer: 'shimmer 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        dots: 'dots 1.2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};
