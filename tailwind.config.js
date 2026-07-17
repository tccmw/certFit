/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        brand: {
          purple: '#863BFF',
          blue: '#4F46E5',
          violet: '#6D28D9',
          cyan: '#47BFFF',
        },
        canvas: 'hsl(var(--background))',
        surface: 'hsl(var(--card))',
        line: 'hsl(var(--border))',
        ink: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted-foreground))',
        success: '#16803A',
        warning: '#B7791F',
        danger: '#B91C1C',
      },
      boxShadow: {
        card: '0 1px 2px rgba(25, 21, 43, 0.07)',
        glow: '0 8px 20px rgba(134, 59, 255, 0.14)',
        soft: '0 8px 24px rgba(25, 21, 43, 0.08)',
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 2px)',
        md: 'var(--radius)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 2px)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(180deg, #863BFF 0%, #6D28D9 100%)',
        'brand-gradient-soft': 'linear-gradient(180deg, rgba(134, 59, 255, 0.09) 0%, rgba(71, 191, 255, 0.06) 100%)',
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
