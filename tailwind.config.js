/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["'Nunito'", "sans-serif"],
      },
      colors: {
        pastel: {
          pink:    "#FFB3C6",
          purple:  "#D4ADFC",
          blue:    "#ADE8F4",
          green:   "#B9FBC0",
          yellow:  "#FFF3B0",
          orange:  "#FFCBA4",
          lavender:"#E0C3FC",
          mint:    "#C9F0E8",
          peach:   "#FFDAB9",
          sky:     "#C8E6C9",
        },
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 2.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
