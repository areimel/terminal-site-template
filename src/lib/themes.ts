/**
 * Terminal theme registry.
 *
 * Pure data module: safe to import from both server-rendered Astro
 * frontmatter and client-side scripts. Nothing here touches the DOM or
 * browser storage at module scope -- that behavior lives in
 * `theme-runtime.ts`.
 */

import { TEMPLATE } from 'astrowind:config';

export interface TerminalTheme {
  id: string;
  label: string;
  colors: {
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    bright: string;
    bgPrimary: string;
    bgSecondary: string;
    bgAccent: string;
    accent: string;
    accentBright: string;
    glow: string;
  };
  font?: 'kode' | 'uav' | 'vt323';
}

/**
 * Text-glow formula. `body { text-shadow: var(--theme-glow) }` (see `ThemeHead.astro`) is
 * applied to every page's text, in every theme.
 *
 * It used to read `0 0 3ex var(--theme-600), 0 0 5px var(--theme-bright)` directly -
 * identical for every theme except for what `--theme-600`/`--theme-bright` resolve to. But
 * axe-core's color-contrast check treats a blurred text-shadow as partially compositing into
 * the perceived background (`blurRadiusToAlpha` in axe-core), and every theme's `600`/`bright`
 * steps are opaque enough (0.8-1.0) that this pushed several combinations below 4.5:1 -
 * the footer's `text-terminal-400` copy on `bg-terminal-bg-secondary` (measured ~2.4-3.7:1
 * across themes), but also fixed-hue foregrounds that don't share the theme's own hue at all
 * (e.g. `text-rose-400` log/error labels, measured ~3.3:1 in the green theme).
 *
 * `dimGlow` keeps each theme's own hue and the same two-shadow blur shape, just at a much
 * lower alpha (independent of the `600`/`bright` tokens themselves, which are still used at
 * full strength elsewhere - buttons, active states, `glow-strong`/`glow-subtle`).
 */
function dimGlow(rgb600: string, rgbBright: string): string {
  return `0 0 3ex rgba(${rgb600}, 0.15), 0 0 5px rgba(${rgbBright}, 0.1)`;
}

export const themes: TerminalTheme[] = [
  {
    id: 'green',
    label: 'Vintage Green',
    colors: {
      100: 'rgba(160, 255, 160, 0.25)',
      200: 'rgba(160, 255, 160, 0.35)',
      300: 'rgba(160, 255, 160, 0.7)',
      400: 'rgba(160, 255, 160, 0.75)',
      500: 'rgba(160, 255, 160, 0.9)',
      600: 'rgba(128, 255, 128, 0.95)',
      700: 'rgba(128, 255, 128, 1.0)',
      bright: 'rgba(200, 255, 200, 1.0)',
      bgPrimary: '#023612',
      bgSecondary: '#04320e',
      bgAccent: '#0d4417',
      accent: 'rgba(255, 170, 60, 0.9)',
      accentBright: 'rgba(255, 207, 118, 0.95)',
      glow: dimGlow('128, 255, 128', '200, 255, 200'),
    },
  },
  {
    id: 'amber',
    label: 'Cozy Amber',
    colors: {
      100: 'rgba(255, 183, 77, 0.1)',
      200: 'rgba(255, 183, 77, 0.2)',
      300: 'rgba(255, 183, 77, 0.65)',
      400: 'rgba(255, 183, 77, 0.75)',
      500: 'rgba(255, 183, 77, 0.8)',
      600: 'rgba(255, 170, 60, 0.9)',
      700: 'rgba(255, 160, 40, 1.0)',
      bright: 'rgba(255, 207, 118, 0.95)',
      bgPrimary: '#180d00',
      bgSecondary: '#281600',
      bgAccent: '#3a2000',
      accent: 'rgba(96, 255, 96, 0.9)',
      accentBright: 'rgba(180, 255, 180, 0.95)',
      glow: dimGlow('255, 170, 60', '255, 207, 118'),
    },
  },
  {
    id: 'red',
    label: 'Hacker Red',
    colors: {
      // 300/400 use a lighter, less saturated red than 500-700 (not a straight alpha step of
      // the same rgb): pure saturated red (255, 0, 60) has a low luminance ceiling (little
      // green in it, and luminance weighs green heavily), so even at alpha 1.0 it can't clear
      // 4.5:1 as body text against a background this dark. Lightening just the lower/muted
      // steps keeps 500+ (buttons, active states) a vivid "hacker red" while 300/400 read as
      // legible body/muted text.
      100: 'rgba(255, 0, 60, 0.1)',
      200: 'rgba(255, 0, 60, 0.2)',
      300: 'rgba(255, 120, 148, 0.75)',
      400: 'rgba(255, 120, 148, 0.85)',
      500: 'rgba(255, 0, 60, 1.0)',
      600: 'rgba(255, 0, 60, 0.9)',
      700: 'rgba(255, 0, 60, 1.0)',
      bright: 'rgba(255, 71, 108, 0.95)',
      bgPrimary: '#050505',
      bgSecondary: '#10090b',
      bgAccent: '#2a1216',
      accent: 'rgba(0, 255, 240, 0.9)',
      accentBright: 'rgba(64, 255, 248, 0.95)',
      glow: dimGlow('255, 0, 60', '255, 71, 108'),
    },
  },
  {
    id: 'yellow',
    label: 'Industrial Yellow',
    colors: {
      100: 'rgba(255, 230, 0, 0.1)',
      200: 'rgba(255, 230, 0, 0.2)',
      300: 'rgba(255, 230, 0, 0.55)',
      400: 'rgba(255, 230, 0, 0.65)',
      500: 'rgba(255, 230, 0, 0.8)',
      600: 'rgba(255, 230, 0, 0.9)',
      700: 'rgba(255, 230, 0, 1.0)',
      bright: 'rgba(255, 240, 60, 0.95)',
      bgPrimary: '#000000',
      bgSecondary: '#1a1a00',
      bgAccent: '#2a2a00',
      accent: 'rgba(0, 255, 240, 0.9)',
      accentBright: 'rgba(64, 255, 248, 0.95)',
      glow: dimGlow('255, 230, 0', '255, 240, 60'),
    },
  },
  {
    id: 'blue',
    label: 'Severance Blue',
    colors: {
      100: 'rgba(110, 230, 255, 0.25)',
      200: 'rgba(110, 230, 255, 0.35)',
      300: 'rgba(110, 230, 255, 0.62)',
      400: 'rgba(110, 230, 255, 0.75)',
      500: 'rgba(110, 230, 255, 0.9)',
      600: 'rgba(110, 230, 255, 0.95)',
      700: 'rgba(110, 230, 255, 1.0)',
      bright: 'rgba(140, 240, 255, 1.0)',
      bgPrimary: '#000e14',
      bgSecondary: '#001824',
      bgAccent: '#002638',
      accent: 'rgba(220, 240, 255, 0.9)',
      accentBright: 'rgba(240, 250, 255, 0.95)',
      glow: dimGlow('110, 230, 255', '140, 240, 255'),
    },
  },
];

/** Default theme, set via `template.themes.default` in src/config.yaml (falls back to the first theme). */
export const defaultThemeId: string = themes.some((theme) => theme.id === TEMPLATE.themes.default)
  ? TEMPLATE.themes.default
  : themes[0].id;

export function getThemeById(id: string): TerminalTheme | undefined {
  return themes.find((theme) => theme.id === id);
}

export function themeClass(id: string): string {
  return `theme-${id}`;
}
