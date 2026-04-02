/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50:  '#fff5f7',
          100: '#ffe0e8',
          200: '#ffc2d1',
          300: '#f9a0b8',
          400: '#f07fa0',
          500: '#e05878',
          600: '#c03060',
          700: '#9a1a48',
          800: '#720e32',
          900: '#4b051f',
        },
        cream: {
          DEFAULT: '#fdf8f5',
          50:  '#fefcfa',
          100: '#fdf8f5',
          200: '#f5eff0',
          300: '#eedde2',
        },
        rose: {
          lace:  '#f5eff0',
          blush: '#fce4ec',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      boxShadow: {
        petal: '0 8px 32px rgba(240,127,160,0.12)',
        soft:  '0 4px 16px rgba(74,45,53,0.06)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
        'slide-in':   'slideIn 0.3s cubic-bezier(0.4,0,0.2,1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' },                       to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn:   { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
    },
  },
  plugins: [],
}
