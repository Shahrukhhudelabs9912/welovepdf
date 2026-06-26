import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './utils/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
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
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'animate-in': {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        // Branded loader (BrandLoader / BrandMark): the mark gently floats while
        // the three document "text" lines pulse in a staggered loop to read as
        // "working".
        'brand-float': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-6%) scale(1.04)' },
        },
        'brand-line': {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'animate-in': 'animate-in 0.6s ease-out',
        'brand-float': 'brand-float 1.8s ease-in-out infinite',
        // Same keyframe, staggered delays so the three lines ripple in sequence.
        'brand-line-1': 'brand-line 1.5s ease-in-out 0s infinite',
        'brand-line-2': 'brand-line 1.5s ease-in-out 0.2s infinite',
        'brand-line-3': 'brand-line 1.5s ease-in-out 0.4s infinite',
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-links': 'hsl(var(--primary))',
            '--tw-prose-headings': 'hsl(var(--foreground))',
            '--tw-prose-bold': 'hsl(var(--foreground))',
            maxWidth: 'none',
            h2: {
              scrollMarginTop: '6rem',
              fontWeight: '700',
              marginTop: '2.5em',
              marginBottom: '1em',
              paddingBottom: '0.5em',
              borderBottom: '1px solid hsl(var(--border))',
            },
            h3: {
              fontWeight: '600',
              marginTop: '2em',
              marginBottom: '0.75em',
            },
            a: {
              fontWeight: '500',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            'ul > li::marker': {
              color: 'hsl(var(--primary))',
            },
            'ol > li::marker': {
              color: 'hsl(var(--primary))',
              fontWeight: '600',
            },
            strong: {
              fontWeight: '600',
            },
          },
        },
        invert: {
          css: {
            '--tw-prose-links': 'hsl(var(--primary))',
            '--tw-prose-headings': 'hsl(var(--foreground))',
            '--tw-prose-bold': 'hsl(var(--foreground))',
          },
        },
      },
    },
  },
  plugins: [typography],
}

export default config