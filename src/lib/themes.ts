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
 * Shared text-glow formula. It is identical for every theme on purpose:
 * each theme only differs in what `--theme-600` / `--theme-bright` resolve
 * to, so a single formula (rather than a hand-tuned string per theme) keeps
 * every palette visually consistent. `ThemeHead.astro` derives the
 * `-strong` / `-subtle` variants from the same numbered color steps.
 */
const GLOW = '0 0 3ex var(--theme-600), 0 0 5px var(--theme-bright)';

export const themes: TerminalTheme[] = [
  {
    id: 'green',
    label: 'Vintage Green',
    colors: {
      100: 'rgba(160, 255, 160, 0.25)',
      200: 'rgba(160, 255, 160, 0.35)',
      300: 'rgba(160, 255, 160, 0.55)',
      400: 'rgba(160, 255, 160, 0.75)',
      500: 'rgba(160, 255, 160, 0.9)',
      600: 'rgba(128, 255, 128, 0.95)',
      700: 'rgba(128, 255, 128, 1.0)',
      bright: 'rgba(200, 255, 200, 1.0)',
      bgPrimary: '#023612',
      bgSecondary: '#11581e',
      bgAccent: '#0d4417',
      accent: 'rgba(255, 170, 60, 0.9)',
      accentBright: 'rgba(255, 207, 118, 0.95)',
      glow: GLOW,
    },
  },
  {
    id: 'amber',
    label: 'Cozy Amber',
    colors: {
      100: 'rgba(255, 183, 77, 0.1)',
      200: 'rgba(255, 183, 77, 0.2)',
      300: 'rgba(255, 183, 77, 0.4)',
      400: 'rgba(255, 183, 77, 0.6)',
      500: 'rgba(255, 183, 77, 0.8)',
      600: 'rgba(255, 170, 60, 0.9)',
      700: 'rgba(255, 160, 40, 1.0)',
      bright: 'rgba(255, 207, 118, 0.95)',
      bgPrimary: '#201200',
      bgSecondary: '#2d1900',
      bgAccent: '#3a2000',
      accent: 'rgba(96, 255, 96, 0.9)',
      accentBright: 'rgba(180, 255, 180, 0.95)',
      glow: GLOW,
    },
  },
  {
    id: 'red',
    label: 'Hacker Red',
    colors: {
      100: 'rgba(255, 0, 60, 0.1)',
      200: 'rgba(255, 0, 60, 0.2)',
      300: 'rgba(255, 0, 60, 0.4)',
      400: 'rgba(255, 0, 60, 0.6)',
      500: 'rgba(255, 0, 60, 0.8)',
      600: 'rgba(255, 0, 60, 0.9)',
      700: 'rgba(255, 0, 60, 1.0)',
      bright: 'rgba(255, 71, 108, 0.95)',
      bgPrimary: '#0a0a0a',
      bgSecondary: '#1a0f12',
      bgAccent: '#2a1216',
      accent: 'rgba(0, 255, 240, 0.9)',
      accentBright: 'rgba(64, 255, 248, 0.95)',
      glow: GLOW,
    },
  },
  {
    id: 'yellow',
    label: 'Industrial Yellow',
    colors: {
      100: 'rgba(255, 230, 0, 0.1)',
      200: 'rgba(255, 230, 0, 0.2)',
      300: 'rgba(255, 230, 0, 0.4)',
      400: 'rgba(255, 230, 0, 0.6)',
      500: 'rgba(255, 230, 0, 0.8)',
      600: 'rgba(255, 230, 0, 0.9)',
      700: 'rgba(255, 230, 0, 1.0)',
      bright: 'rgba(255, 240, 60, 0.95)',
      bgPrimary: '#000000',
      bgSecondary: '#1a1a00',
      bgAccent: '#2a2a00',
      accent: 'rgba(0, 255, 240, 0.9)',
      accentBright: 'rgba(64, 255, 248, 0.95)',
      glow: GLOW,
    },
  },
  {
    id: 'blue',
    label: 'Severance Blue',
    colors: {
      100: 'rgba(110, 230, 255, 0.25)',
      200: 'rgba(110, 230, 255, 0.35)',
      300: 'rgba(110, 230, 255, 0.55)',
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
      glow: GLOW,
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
