/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#102A43',
          50: '#E8EEF3',
          100: '#C5D4E0',
          200: '#9FB8CC',
          300: '#789CB8',
          400: '#5280A3',
          500: '#2C648F',
          600: '#1A4D75',
          700: '#102A43',
          800: '#0A1C2D',
          900: '#040E16',
        },
        teal: {
          DEFAULT: '#007C89',
          50: '#E0F5F7',
          100: '#B3E8EC',
          200: '#80D9E0',
          300: '#4DCAD4',
          400: '#26BCC8',
          500: '#007C89',
          600: '#006875',
          700: '#005460',
          800: '#00404A',
          900: '#002C35',
        },
        turquoise: '#81E6D9',
        surface: '#F0F4F8',
        border: '#D9E2EC',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-in': 'slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'count-up': 'countUp 0.8s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(16,42,67,0.06), 0 4px 16px rgba(16,42,67,0.04)',
        'card-hover': '0 4px 12px rgba(16,42,67,0.10), 0 8px 32px rgba(16,42,67,0.06)',
        glass: '0 8px 32px rgba(16,42,67,0.12)',
      },
    },
  },
  plugins: [],
}
