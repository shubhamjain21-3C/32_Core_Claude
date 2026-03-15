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
          'bg':           '#050d1a',
          'bg-2':         '#0a1c35',
          'bg-hero':      '#071224',
          'surface':      '#0d2248',
          'card':         '#0d1f3c',
          'blue':         '#2a7fd4',
          'blue-dark':    '#1a5090',
          'blue-mid':     '#1e6ab0',
          'blue-cta':     '#1a5fa8',
          'cyan':         '#00ccff',
          'cyan-light':   '#6ab4e8',
          'glow':         '#aaf0ff',
          'text':         '#ffffff',
          'text-2':       '#c8dff0',
          'text-muted':   '#7aaecc',
          'text-accent':  '#4a90c4',
          'border':       '#1e3a5f',
        },
      },
      fontFamily: {
        heading: ['var(--font-montserrat)', 'sans-serif'],
        body:    ['var(--font-inter)',       'sans-serif'],
      },
      backgroundImage: {
        'hero-grad': 'linear-gradient(to bottom, #071224, #0d2248)',
        'nav-grad':  'linear-gradient(to right,  #050d1a, #0a1c35)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
