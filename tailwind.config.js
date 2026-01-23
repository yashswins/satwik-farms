/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'farm-green-primary': '#2D5016',
        'farm-green-bright': '#68B030',
        'farm-green-light': '#98D84E',
        'farm-green-mint': '#C8E6C9',
        'farm-white': '#FFFFFF',
        'farm-cream': '#FAFAF8',
        'farm-earth': '#8B7355',
        'farm-sunshine': '#FFD54F',
        'farm-sky': '#81C3D7',
        'text-primary': '#1A1A1A',
        'text-secondary': '#4A5568',
        'text-light': '#718096',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'slide-in': 'slideIn 0.6s ease-out',
        'count-up': 'countUp 2s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        countUp: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    },
  },
  plugins: [],
};
