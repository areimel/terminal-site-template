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

Each value is a plain CSS color string — the built-in themes use `rgba()` so opacity is baked into the numbered steps, but hex or any other valid CSS color works too. The font field is optional; if omitted, the theme inherits the default (Kode Mono).

## Adding a theme

To add a new theme, open `src/lib/themes.ts` and add an entry to the `themes` array:

```typescript
export const themes: TerminalTheme[] = [
  // ... existing themes ...
  {
    id: 'neon',
    label: 'Neon',
    colors: {
      100: '#4a4a5e',
      200: '#6f7f9f',
      300: '#a0b0d0',
      400: '#d0dff0',
      500: '#ffffff',
      600: '#ffffff',
      700: '#ffffff',
      bright: '#ff00ff',
      bgPrimary: '#0a0e27',
      bgSecondary: '#1a1e3f',
      bgAccent: '#2a2e4f',
      accent: '#00ffff',
      accentBright: '#ff00ff',
      glow: '0 0 3ex var(--theme-600), 0 0 5px var(--theme-bright)',
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

The event is dispatched on `document` (not `window`):

```typescript
document.addEventListener('terminal:theme-change', (event) => {
  console.log('New theme:', event.detail.id);
});
```

### Get the current theme

`getTheme()` returns the current theme's **id** (a string), not the theme object. Look it up in the registry with `getThemeById` if you need its colors:

```typescript
import { getTheme } from '~/lib/theme-runtime';
import { getThemeById } from '~/lib/themes';

const currentId = getTheme(); // e.g. 'amber'
const theme = getThemeById(currentId);
console.log(theme?.colors.accent);
```

## Tailwind tokens

Components use Tailwind `terminal-*` classes:

```html
<div class="text-terminal-300 bg-terminal-bg-primary">Text in theme color 300 on primary background</div>
```

Common tokens (each works with `text-`, `bg-`, `border-`, and `ring-`):

- `terminal-{100,200,300,400,500,600,700}` — the numbered text/border/background colors
- `terminal-bright` — high-contrast text
- `terminal-bg-{primary,secondary,accent}` — backgrounds (main, panels, input focus)

These map directly to the theme's color palette (`src/lib/themes.ts` `colors.100`–`colors.700`, `colors.bgPrimary`, etc). When a user switches themes, all `terminal-*` classes update immediately, because each one resolves to a `--terminal-*`/`--theme-*` CSS variable, not a fixed color.

There's no `terminal-accent` or `terminal-glow` Tailwind color — those live only as CSS variables and the plain (non-Tailwind) classes below.

## CSS variables

For custom styles, use CSS variables (emitted by `common/ThemeHead.astro`):

```css
.custom-element {
  color: var(--theme-300);
  background: var(--theme-bg-primary);
  border: 1px solid var(--theme-500);
}
```

Available variables: `--theme-{100–700}`, `--theme-bright`, `--theme-bg-primary`, `--theme-bg-secondary`, `--theme-bg-accent`, `--theme-accent`, `--theme-accent-bright`, `--theme-glow`, `--theme-glow-subtle`, `--theme-glow-strong`, `--theme-accent-glow`.

For text glow, use the plain CSS classes `ThemeHead.astro` also emits, rather than a Tailwind utility: `.text-glow-subtle` and `.text-glow-strong` (the `Heading` component's `glow` prop sets these for you).

## Type scale

Headings and body text use a modular scale (1.25x):

- `text-t-sm` — 0.8rem (~13px at the default 16px root)
- `text-t-base` — 1rem (16px)
- `text-t-lg` — 1.25rem (20px)
- `text-t-xl` — 1.5625rem (25px)
- `text-t-2xl` — 1.9531rem (~31px)
- `text-t-3xl` — 2.4414rem (~39px)
- `text-t-4xl` — 3.0518rem (~49px)
- `text-t-5xl` — 3.8147rem (~61px)

Use these consistently. Never hard-code font sizes or colors; always go through Tailwind or CSS variables.
