/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#F4F6FB',
        sidebar:    '#FFFFFF',
        card: {
          DEFAULT:   '#FFFFFF',
          secondary: '#F8F9FE',
        },
        border:       '#E2E8F0',
        'border-light': '#CBD5E1',
        brand: {
          DEFAULT: '#7C3AED',
          light:   '#8B5CF6',
          dark:    '#6D28D9',
          50:      '#F5F3FF',
          100:     '#EDE9FE',
        },
        ai: {
          DEFAULT: '#7C3AED',
          light:   '#A78BFA',
          dark:    '#6D28D9',
          glow:    'rgba(124, 58, 237, 0.12)',
        },
        critical: {
          DEFAULT: '#DC2626',
          subtle:  'rgba(220, 38, 38, 0.08)',
          border:  'rgba(220, 38, 38, 0.25)',
        },
        high: {
          DEFAULT: '#EA580C',
          subtle:  'rgba(234, 88, 12, 0.08)',
          border:  'rgba(234, 88, 12, 0.25)',
        },
        medium: {
          DEFAULT: '#D97706',
          subtle:  'rgba(217, 119, 6, 0.08)',
          border:  'rgba(217, 119, 6, 0.25)',
        },
        low: {
          DEFAULT: '#059669',
          subtle:  'rgba(5, 150, 105, 0.08)',
          border:  'rgba(5, 150, 105, 0.25)',
        },
        success: {
          DEFAULT: '#059669',
          subtle:  'rgba(5, 150, 105, 0.08)',
          border:  'rgba(5, 150, 105, 0.25)',
        },
        info: {
          DEFAULT: '#2563EB',
          subtle:  'rgba(37, 99, 235, 0.08)',
          border:  'rgba(37, 99, 235, 0.25)',
        },
        slate: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Consolas', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'card':       '0 1px 3px 0 rgba(0,0,0,.08), 0 1px 2px -1px rgba(0,0,0,.06)',
        'card-md':    '0 4px 12px -2px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.06)',
        'glow-brand': '0 0 0 3px rgba(124, 58, 237, 0.15)',
        'glow-ai':    '0 4px 20px -4px rgba(124, 58, 237, 0.25)',
        'glow-critical': '0 0 20px -3px rgba(220, 38, 38, 0.2)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
