/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Claude AI color palette
        'claude-bg': '#F5F5F3',
        'claude-surface': '#FFFFFF',
        'claude-border': '#E5E5E0',
        'claude-text': '#2C2C2C',
        'claude-text-secondary': '#6B6B6B',
        'claude-text-tertiary': '#9B9B9B',
        'claude-accent': '#CC785C',
        'claude-accent-hover': '#B86B4F',
        'claude-code-bg': '#F8F8F6',
      },
      fontFamily: {
        // Tangerine for headings (elegant, decorative)
        'heading': ['Tangerine', 'cursive'],
        // Gelasio for body text (readable serif)
        'sans': ['Gelasio', 'Georgia', 'serif'],
        'mono': [
          'ui-monospace',
          'SFMono-Regular',
          'SF Mono',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'monospace'
        ],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      borderRadius: {
        'claude': '0.75rem',
      },
      boxShadow: {
        'claude': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'claude-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}
