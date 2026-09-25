---
title: Theming
description: Customize terminal colors and add your own themes.
section: Guides
order: 1
---

The template comes with five built-in themes: green, amber, red, yellow, and blue. Each theme is a color palette that maps to Tailwind classes and CSS variables. You can add your own or override defaults.

## Theme registry

Themes are defined in `src/lib/themes.ts`:

```typescript
export interface TerminalTheme {
  id: string;
  label: string;
  colors: {
    '100': string; // Dimmest text
    '200': string;
    '300': string;
    '400': string;
    '500': string; // Primary text
    '600': string;
    '700': string; // Brightest text
    bright: string; // High-contrast accents
    bgPrimary: string; // Main background
    bgSecondary: string; // Secondary panels
    bgAccent: string; // Input focus background
    accent: string; // Accent color
    accentBright: string;
    glow: string; // Focus outline color
  };
  font?: 'kode' | 'uav' | 'vt323';
}
```

All colors are hex values. The font field is optional; if omitted, the theme inherits the default (Kode Mono).

## Adding a theme

To add a new theme, open `src/lib/themes.ts` and add an entry to the `themes` array:

```typescript
export const themes: TerminalTheme[] = [
  // ... existing themes ...
  {
    id: 'neon',
    label: 'Neon',
    colors: {
      '100': '#4a4a5e',
      '200': '#6f7f9f',
      '300': '#a0b0d0',
      '400': '#d0dff0',
      '500': '#ffffff',
      '600': '#ffffff',
      '700': '#ffffff',
      bright: '#ff00ff',
      bgPrimary: '#0a0e27',
      bgSecondary: '#1a1e3f',
      bgAccent: '#2a2e4f',
      accent: '#00ffff',
      accentBright: '#ff00ff',
      glow: '#00ffff',
    },
    font: 'uav', // Optional
  },
];
```

Rebuild with `pnpm run dev`. Your new theme appears in Settings and can be selected via the shell (`theme neon`).

## Default theme

Set the default theme in `src/config.yaml`:

```yaml
template:
  themes:
    default: 'green'
```

Users can override this in Settings; their choice persists in localStorage.

## Runtime API

### Apply a theme programmatically

Use `applyTheme()` from `src/lib/theme-runtime.ts`:

```typescript
import { applyTheme } from '~/lib/theme-runtime';

applyTheme('amber');
```

### Listen for theme changes

```typescript
window.addEventListener('terminal:theme-change', (event) => {
  console.log('New theme:', event.detail.id);
});
```

### Get the current theme

```typescript
import { getTheme } from '~/lib/theme-runtime';

const currentTheme = getTheme();
console.log(currentTheme.colors.accent);
```

## Tailwind tokens

Components use Tailwind `terminal-*` classes:

```html
<div class="text-terminal-300 bg-terminal-bg-primary">Text in theme color 300 on primary background</div>
```

Common tokens:

- `text-terminal-{100,200,300,400,500,600,700}` — Text colors
- `text-terminal-bright` — High-contrast text
- `bg-terminal-bg-primary` — Main background
- `bg-terminal-bg-secondary` — Secondary panels
- `bg-terminal-bg-accent` — Input focus
- `border-terminal-{100–700}` — Border colors
- `text-terminal-accent` — Accent color
- `text-terminal-glow` — Glow/focus outline

These map directly to the theme's color palette. When a user switches themes, all `terminal-*` classes update immediately.

## CSS variables

For custom styles, use CSS variables:

```css
.custom-element {
  color: var(--theme-300);
  background: var(--theme-bg-primary);
  border: 1px solid var(--theme-500);
}
```

Available variables: `--theme-{100–700}`, `--theme-bright`, `--theme-bg-primary`, `--theme-bg-secondary`, `--theme-bg-accent`, `--theme-accent`, `--theme-accent-bright`, `--theme-glow`.

## Type scale

Headings and body text use a modular scale (1.25x):

- `text-t-sm` — 0.8rem (10px)
- `text-t-base` — 1rem (12px)
- `text-t-lg` — 1.25rem (16px)
- `text-t-xl` — 1.562rem (20px)
- `text-t-2xl` — 1.953rem (25px)
- `text-t-3xl` — 2.441rem (31px)
- `text-t-4xl` — 3.052rem (39px)
- `text-t-5xl` — 3.815rem (49px)

Use these consistently. Never hard-code font sizes or colors; always go through Tailwind or CSS variables.
