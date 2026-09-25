/**
 * Client-side theme runtime: applies/persists the active terminal theme and
 * keeps it consistent across Astro view-transition navigations.
 *
 * The no-flash, before-paint application of the *initial* theme happens in
 * the inline script emitted by `ThemeHead.astro` (it duplicates the
 * lookup/fallback logic below on purpose, since it must run synchronously
 * before any module can be imported). This module takes over afterwards
 * for theme switching and re-applies on `astro:after-swap`.
 */

import { themes, defaultThemeId, getThemeById, themeClass } from './themes';

const STORAGE_KEY = 'terminal-theme';
const EVENT_NAME = 'terminal:theme-change';

function hasStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function readStoredThemeId(): string {
  if (!hasStorage()) return defaultThemeId;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && getThemeById(stored) ? stored : defaultThemeId;
  } catch {
    return defaultThemeId;
  }
}

function writeStoredThemeId(id: string): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Storage may be unavailable (private browsing, quota, etc). Ignore.
  }
}

/** Returns the currently active theme id, read from the `<html>` class. */
export function getTheme(): string {
  if (typeof document === 'undefined') return readStoredThemeId();
  const current = Array.from(document.documentElement.classList).find((cls) => cls.startsWith('theme-'));
  const id = current?.replace('theme-', '');
  return id && getThemeById(id) ? id : readStoredThemeId();
}

/** Applies a theme by id, persists it, and dispatches `terminal:theme-change`. */
export function applyTheme(id: string): void {
  if (typeof document === 'undefined') return;
  const resolved = getThemeById(id) ?? getThemeById(defaultThemeId) ?? themes[0];

  const root = document.documentElement;
  for (const theme of themes) {
    root.classList.remove(themeClass(theme.id));
  }
  root.classList.add(themeClass(resolved.id));
  writeStoredThemeId(resolved.id);

  document.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { id: resolved.id } }));
}

/** Switches to the next theme in the registry, wrapping around. */
export function cycleTheme(): void {
  const currentId = getTheme();
  const index = themes.findIndex((theme) => theme.id === currentId);
  const next = themes[(index + 1) % themes.length];
  applyTheme(next.id);
}

let initialized = false;

/**
 * Wires up the theme runtime for a page: re-applies the persisted theme
 * (a cheap no-op most of the time, since `ThemeHead`'s inline script
 * already set the right class before paint) and keeps it correct across
 * `astro:after-swap` navigations. Idempotent: safe to call from every page.
 */
export function initThemeRuntime(): void {
  if (typeof document === 'undefined' || initialized) return;
  initialized = true;

  applyTheme(readStoredThemeId());

  document.addEventListener('astro:after-swap', () => {
    applyTheme(readStoredThemeId());
  });
}
