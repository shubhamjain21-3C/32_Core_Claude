import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        '3c': {
          // Amber/Gold palette (unified across all pages)
          'gold':          '#D4860A',
          'gold-light':    '#F0A830',
          'gold-pale':     '#FDE8B0',
          'brick':         '#8B3A2A',
          'charcoal':      '#2C1F14',
          'forest':        '#2D5016',
          'cream':         '#FFF8EE',
          'glass-blue':    '#4A6FA5',
        },
      },
      fontFamily: {
        heading: ['var(--font-montserrat)', 'sans-serif'],
        body:    ['var(--font-inter)',       'sans-serif'],
      },
      backgroundImage: {
        'gold-grad':  'linear-gradient(160deg, #FFF8EE 0%, #FDE8B0 50%, #F5C060 100%)',
        'hero-grad':  'linear-gradient(to bottom, #1e0f05, #2C1F14)',
        'nav-grad':   'linear-gradient(to right,  #1e0f05, #2C1F14)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
