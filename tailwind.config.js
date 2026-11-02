/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Surface / Canvas Tokens
        surface: {
          page: 'var(--surface-page)',
          DEFAULT: 'var(--surface-card)',
          card: 'var(--surface-card)',
          elevated: 'var(--surface-elevated)',
          subtle: 'var(--surface-subtle)',
          muted: 'var(--surface-muted)',
          hover: 'var(--surface-hover)',
        },

        // Semantic Border Tokens
        border: {
          DEFAULT: 'var(--border-subtle)',
          subtle: 'var(--border-subtle)',
          muted: 'var(--border-muted)',
          strong: 'var(--border-strong)',
        },
        subtle: 'var(--border-subtle)',

        // Semantic Typography / Content Tokens
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          faint: 'var(--text-faint)',
        },

        // Semantic Status Tokens
        status: {
          overdue: {
            text: 'var(--status-overdue-text)',
            bg: 'var(--status-overdue-bg)',
            border: 'var(--status-overdue-border)',
            dot: 'var(--status-overdue-dot)',
          },
          inprogress: {
            text: 'var(--status-inprogress-text)',
            bg: 'var(--status-inprogress-bg)',
            border: 'var(--status-inprogress-border)',
            dot: 'var(--status-inprogress-dot)',
          },
          approved: {
            text: 'var(--status-approved-text)',
            bg: 'var(--status-approved-bg)',
            border: 'var(--status-approved-border)',
            dot: 'var(--status-approved-dot)',
          },
          reviewed: {
            text: 'var(--status-reviewed-text)',
            bg: 'var(--status-reviewed-bg)',
            border: 'var(--status-reviewed-border)',
            dot: 'var(--status-reviewed-dot)',
          },
        },

        // Core / Compatibility Tokens
        background: 'var(--surface-page)',
        foreground: 'var(--text-primary)',
        card: {
          DEFAULT: 'var(--surface-card)',
          foreground: 'var(--text-primary)',
        },
        popover: {
          DEFAULT: 'var(--surface-elevated)',
          foreground: 'var(--text-primary)',
        },
        primary: {
          DEFAULT: 'var(--text-primary)',
          foreground: 'var(--surface-card)',
        },
        secondary: {
          DEFAULT: 'var(--surface-muted)',
          foreground: 'var(--text-primary)',
        },
        muted: {
          DEFAULT: 'var(--surface-muted)',
          foreground: 'var(--text-muted)',
        },
        accent: {
          DEFAULT: 'var(--surface-subtle)',
          foreground: 'var(--text-primary)',
        },
        destructive: {
          DEFAULT: 'var(--status-overdue-text)',
          foreground: '#FFFFFF',
        },
        input: 'var(--border-subtle)',
        ring: 'var(--text-primary)',
      },
      borderRadius: {
        card: '0.375rem',
        badge: '0.375rem',
        button: '0.375rem',
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
        display: ['"Cal Sans"', 'Inter', '-apple-system', 'sans-serif'],
        cal: ['"Cal Sans"', 'Inter', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        '2xs': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'xs': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.02)',
        'elevated': '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
        'bespoke': '0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.03)',
        'bespoke-elevated': '0 1px 3px rgba(0, 0, 0, 0.05), 0 8px 24px rgba(0, 0, 0, 0.04)',
        'subtle-inner': 'inset 0 1px 2px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}
