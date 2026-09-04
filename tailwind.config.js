/** @type {import('tailwindcss').Config} */
module.exports = {
  // Dark mode follows the device unless an ancestor says otherwise: `.dark`
  // forces dark, `.light` forces light. Only the dashboard uses `dark:` and it
  // sets these on its own wrapper, so the marketing site is never affected.
  darkMode: ['variant', [
    '@media (prefers-color-scheme: dark) { &:not(.light *) }',
    '&:is(.dark *)',
  ]],
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

        // Ordering app palette, lifted from the phone app's theme
        // (Satwik_Farms_React/src/theme/colors.ts) so /order looks identical to
        // the native app. Namespaced `shop-*` so it cannot collide with the
        // marketing palette above — the two are deliberately different systems
        // and should not be unified.
        'shop-primary': '#53B175',
        'shop-primary-light': '#AEDCC0',
        'shop-primary-dark': '#3B8B5A',
        'shop-secondary': '#FF8A65',
        'shop-error': '#E53935',
        'shop-warning': '#F3603F',
        'shop-bg': '#F4F8F2',
        'shop-surface': '#FFFFFF',
        'shop-surface-alt': '#EEF4EC',
        'shop-surface-elevated': '#FAFAFA',
        'shop-border': '#D8E3D4',
        'shop-text': '#1B2E1B',
        'shop-text-secondary': '#7C7C7C',
        'shop-text-tertiary': '#B3B3B3',
        // Per-tab background tints (colors.ts:97-113)
        'shop-tab-home': '#F4FAF5',
        'shop-tab-explore': '#F3F8EF',
        'shop-tab-cart': '#FFF8F1',
        'shop-tab-account': '#F6F7FB',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        // Bound to the next/font CSS variable declared in app/order/layout.jsx.
        poppins: ['var(--font-poppins)', 'Poppins', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        // spacing.ts:24-30
        'shop-sm': '12px',
        'shop-md': '16px',
        'shop-lg': '20px',
        'shop-xl': '28px',
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
