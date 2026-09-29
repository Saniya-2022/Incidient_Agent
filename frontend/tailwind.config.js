/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B1020',
        sidebar: '#0A0F1C',
        card: {
          DEFAULT: '#111827',
          secondary: '#151D2E',
        },
        border: '#263247',
        'border-light': '#374763',
        ai: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          dark: '#6D28D9',
          glow: 'rgba(139, 92, 246, 0.15)',
        },
        critical: {
          DEFAULT: '#EF4444',
          subtle: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.3)',
        },
        high: {
          DEFAULT: '#F97316',
          subtle: 'rgba(249, 115, 22, 0.12)',
          border: 'rgba(249, 115, 22, 0.3)',
        },
        medium: {
          DEFAULT: '#F59E0B',
          subtle: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.3)',
        },
        low: {
          DEFAULT: '#10B981',
          subtle: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.3)',
        },
        success: {
          DEFAULT: '#10B981',
          subtle: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.3)',
        },
        info: {
          DEFAULT: '#3B82F6',
          subtle: 'rgba(59, 130, 246, 0.12)',
          border: 'rgba(59, 130, 246, 0.3)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Consolas', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-ai': '0 0 20px -3px rgba(139, 92, 246, 0.25)',
        'glow-critical': '0 0 20px -3px rgba(239, 68, 68, 0.25)',
      },
    },
  },
  plugins: [],
}
