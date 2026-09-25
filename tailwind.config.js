import defaultTheme from 'tailwindcss/defaultTheme';
import typographyPlugin from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,json,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontSize: {
        // Add default line heights for heading sizes
        '4xl': ['2.25rem', { lineHeight: '1.25' }],
        '5xl': ['3rem', { lineHeight: '1.25' }],
        '6xl': ['3.75rem', { lineHeight: '1.25' }],
        '7xl': ['4.5rem', { lineHeight: '1.25' }],
        '8xl': ['6rem', { lineHeight: '1.25' }],
        '9xl': ['8rem', { lineHeight: '1.25' }],

        // Modular type scale (ratio 1.25, base 1rem). Terminal-native
        // components use these tokens instead of the default Tailwind
        // scale so the whole kit shares one rhythm.
        't-sm': ['0.8rem', { lineHeight: '1.6' }],
        't-base': ['1rem', { lineHeight: '1.6' }],
        't-lg': ['1.25rem', { lineHeight: '1.5' }],
        't-xl': ['1.5625rem', { lineHeight: '1.4' }],
        't-2xl': ['1.9531rem', { lineHeight: '1.35' }],
        't-3xl': ['2.4414rem', { lineHeight: '1.3' }],
        't-4xl': ['3.0518rem', { lineHeight: '1.25' }],
        't-5xl': ['3.8147rem', { lineHeight: '1.15' }],
      },
      colors: {
        primary: 'var(--aw-color-primary)',
        secondary: 'var(--aw-color-secondary)',
        accent: 'var(--aw-color-accent)',
        default: 'var(--aw-color-text-default)',
        muted: 'var(--aw-color-text-muted)',
        terminal: {
          100: 'var(--terminal-100)',
          200: 'var(--terminal-200)',
          300: 'var(--terminal-300)',
          400: 'var(--terminal-400)',
          500: 'var(--terminal-500)',
          600: 'var(--terminal-600)',
          700: 'var(--terminal-700)',
          bright: 'var(--terminal-bright)',
        },
        'terminal-bg': {
          primary: 'var(--terminal-bg-primary)',
          secondary: 'var(--terminal-bg-secondary)',
          accent: 'var(--terminal-bg-accent)',
        },
      },
      fontFamily: {
        sans: ['var(--aw-font-sans, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--aw-font-serif, ui-serif)', ...defaultTheme.fontFamily.serif],
        heading: ['var(--aw-font-heading, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        vt323: ['VT323', 'monospace'],
        kode: ['"Kode Mono"', 'monospace'],
        'uav-mono': ['"UAV OSD Mono"', 'monospace'],
      },

      // `prose prose-terminal` themes @tailwindcss/typography with the
      // terminal CSS variables, so Prose/docs content re-themes for free.
      typography: () => ({
        terminal: {
          css: {
            '--tw-prose-body': 'var(--theme-500)',
            '--tw-prose-headings': 'var(--theme-bright)',
            '--tw-prose-lead': 'var(--theme-400)',
            '--tw-prose-links': 'var(--theme-accent)',
            '--tw-prose-bold': 'var(--theme-bright)',
            '--tw-prose-counters': 'var(--theme-400)',
            '--tw-prose-bullets': 'var(--theme-400)',
            '--tw-prose-hr': 'var(--theme-300)',
            '--tw-prose-quotes': 'var(--theme-400)',
            '--tw-prose-quote-borders': 'var(--theme-500)',
            '--tw-prose-captions': 'var(--theme-400)',
            '--tw-prose-code': 'var(--theme-bright)',
            '--tw-prose-pre-code': 'var(--theme-500)',
            '--tw-prose-pre-bg': 'var(--theme-bg-secondary)',
            '--tw-prose-th-borders': 'var(--theme-300)',
            '--tw-prose-td-borders': 'var(--theme-200)',
            maxWidth: '72ch',
            fontFamily: 'var(--aw-font-sans)',
            color: 'var(--theme-500)',
            h1: { fontFamily: 'var(--aw-font-heading)' },
            h2: { fontFamily: 'var(--aw-font-heading)' },
            h3: { fontFamily: 'var(--aw-font-heading)' },
            h4: { fontFamily: 'var(--aw-font-heading)' },
            a: { textDecoration: 'underline', textDecorationStyle: 'dotted' },
            code: {
              backgroundColor: 'var(--theme-bg-secondary)',
              padding: '0.15em 0.4em',
              borderRadius: '2px',
              fontWeight: '400',
            },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            hr: { borderColor: 'var(--theme-300)' },
            blockquote: { borderLeftColor: 'var(--theme-500)' },
          },
        },
      }),
    },
  },
  plugins: [typographyPlugin],
};
