/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        brand: {
          purple: '#A855F7',
          blue: '#3B82F6',
          violet: '#7C3AED',
          cyan: '#38BDF8',
        },
        canvas: '#F8FAFC',
        surface: '#FFFFFF',
        line: '#E2E8F0',
        ink: '#0F172A',
        muted: '#64748B',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      boxShadow: {
        card: '0 4px 12px rgba(15, 23, 42, 0.08)',
        glow: '0 10px 24px rgba(168, 85, 247, 0.18)',
        soft: '0 18px 45px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #A855F7 0%, #3B82F6 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'soft-scale': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both',
        'soft-scale': 'soft-scale 0.35s ease-out both',
        'gradient-shift': 'gradient-shift 8s ease infinite',
      },
    },
  },
  plugins: [],
}
