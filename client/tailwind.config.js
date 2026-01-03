/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0a0a0a',
          'bg-light': '#111111',
          primary: '#00ff00',
          'primary-dim': '#00cc00',
          secondary: '#33ff33',
          accent: '#ffb000',
          error: '#ff3333',
          border: '#003300',
          'border-light': '#004400',
          muted: '#666666',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'flicker': 'flicker 0.15s infinite',
        'scanline': 'scanline 8s linear infinite',
        'typing': 'typing 3.5s steps(40, end)',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            textShadow: '0 0 4px #00ff00, 0 0 8px #00ff00',
          },
          '50%': {
            textShadow: '0 0 8px #00ff00, 0 0 16px #00ff00, 0 0 24px #00ff00',
          },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'typing': {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        'blink': {
          '50%': { borderColor: 'transparent' },
        },
      },
      boxShadow: {
        'glow': '0 0 10px rgba(0, 255, 0, 0.3)',
        'glow-strong': '0 0 20px rgba(0, 255, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
