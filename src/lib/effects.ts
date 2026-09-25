/**
 * Terminal effects runtime: boot screen, CRT noise/scanline/overlay and the
 * decoder-text effect are all gated through this module so any component
 * can check "should I animate?" in one place.
 *
 * Nothing here touches the DOM or storage at module scope, so this file is
 * safe to import from server-rendered Astro frontmatter as well as client
 * scripts. All browser access happens lazily, inside the exported
 * functions.
 */

export type EffectName = 'boot' | 'noise' | 'scanline' | 'overlay' | 'decoder';

export const effectNames: EffectName[] = ['boot', 'noise', 'scanline', 'overlay', 'decoder'];

export type EffectsState = Record<EffectName, boolean> & { all: boolean };

// TODO(lead): wire to `template.effects` in config.yaml once the config
// block lands (see docs/superpowers/specs/2026-09-25-terminal-template-design.md).
export const effectDefaults: EffectsState = {
  all: true,
  boot: true,
  noise: true,
  scanline: true,
  overlay: true,
  decoder: true,
};

const STORAGE_KEY = 'terminal-effects';
const EVENT_NAME = 'terminal:effects-change';

type StoredOverrides = Partial<EffectsState>;

function hasStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function readOverrides(): StoredOverrides {
  if (!hasStorage()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeOverrides(overrides: StoredOverrides): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // Storage may be unavailable (private browsing, quota, etc). Ignore.
  }
}

function prefersReducedMotion(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/**
 * Resolves the effective effects state: config defaults, overridden by any
 * user choices persisted in localStorage, forced fully off when the OS
 * requests reduced motion (this always wins, even over an explicit user
 * "on").
 */
export function getEffects(): EffectsState {
  const overrides = readOverrides();
  const reduced = prefersReducedMotion();
  const all = overrides.all ?? effectDefaults.all;

  const state = { all: reduced ? false : all } as EffectsState;
  for (const name of effectNames) {
    const requested = overrides[name] ?? effectDefaults[name];
    state[name] = reduced ? false : all === false ? false : requested;
  }
  return state;
}

export function isEnabled(name: EffectName): boolean {
  return getEffects()[name];
}

function reflect(state: EffectsState): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const name of effectNames) {
    root.setAttribute(`data-fx-${name}`, state[name] ? 'on' : 'off');
  }
}

function persistAndApply(overrides: StoredOverrides): EffectsState {
  writeOverrides(overrides);
  const state = getEffects();
  reflect(state);
  if (typeof document !== 'undefined') {
    document.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: state }));
  }
  return state;
}

export function setEffect(name: EffectName, on: boolean): EffectsState {
  const overrides = readOverrides();
  overrides[name] = on;
  return persistAndApply(overrides);
}

export function setAllEffects(on: boolean): EffectsState {
  const overrides = readOverrides();
  overrides.all = on;
  return persistAndApply(overrides);
}

let initialized = false;

/**
 * Reflects the current effects state onto `<html data-fx-*>` and keeps it
 * in sync with OS-level reduced-motion changes and Astro view transitions.
 * The very first application (before paint) happens in the inline script
 * emitted by `ThemeHead.astro`; this only needs to re-sync after hydration.
 * Idempotent: safe to call from every page.
 */
export function initEffectsRuntime(): void {
  if (typeof document === 'undefined' || initialized) return;
  initialized = true;

  reflect(getEffects());

  try {
    window.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
      reflect(getEffects());
    });
  } catch {
    // matchMedia unavailable; nothing to subscribe to.
  }

  document.addEventListener('astro:after-swap', () => {
    reflect(getEffects());
  });
}
