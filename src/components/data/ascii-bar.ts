/**
 * Shared math + client-side update logic for the ASCII bar family
 * (`AsciiBar`, `Meter`, `ProgressBar`). Pure functions only - no `window`/`document`
 * access at module scope - so this is safe to import from Astro frontmatter (server,
 * for the initial render) as well as from `<script>` tags (client, for live updates).
 *
 * DOM-touching exports (`setBarValue`) are only ever called client-side.
 */
import { TONE_TEXT_CLASS, type DataTone } from './tone';

/** Default track width (in characters) used across the bar family when no `width` is given. */
export const DEFAULT_BAR_WIDTH = 20;

/** Clamps `value` into `[min, max]`. Falls back to `min` for `NaN` or an inverted range. */
export function clampValue(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (max <= min) return min;
  return Math.min(max, Math.max(min, value));
}

/** Renders the monospace bracket track, e.g. `[#########-----------]`. */
export function renderAsciiBarText(value: number, min: number, max: number, width: number): string {
  const clamped = clampValue(value, min, max);
  const ratio = max > min ? (clamped - min) / (max - min) : 0;
  const filled = Math.round(ratio * width);
  const empty = Math.max(0, width - filled);
  return `[${'#'.repeat(Math.max(0, filled))}${'-'.repeat(empty)}]`;
}

/** Formats `value` as a percentage of `[min, max]`, e.g. `45%`. */
export function formatBarPercent(value: number, min: number, max: number): string {
  const clamped = clampValue(value, min, max);
  const ratio = max > min ? (clamped - min) / (max - min) : 0;
  return `${Math.round(ratio * 100)}%`;
}

/**
 * Auto-derives a tone from `low`/`high`/`optimum` thresholds, following the same
 * "which side is good" logic as the native HTML `<meter>` element:
 * - no thresholds given -> `default` (no judgment to render).
 * - `optimum` at/above `high` -> higher values are better (e.g. signal strength).
 * - `optimum` at/below `low` -> lower values are better (e.g. CPU/mem/disk load).
 * - `optimum` between `low` and `high` -> the middle is good, the extremes are `warn`.
 */
export function autoTone(
  value: number,
  min: number,
  max: number,
  low?: number,
  high?: number,
  optimum?: number
): DataTone {
  if (low == null && high == null) return 'default';

  const lo = low ?? min;
  const hi = high ?? max;
  const opt = optimum ?? (lo + hi) / 2;

  if (opt >= hi) {
    // Higher is better.
    if (value >= hi) return 'ok';
    if (value >= lo) return 'warn';
    return 'err';
  }

  if (opt <= lo) {
    // Lower is better.
    if (value <= lo) return 'ok';
    if (value <= hi) return 'warn';
    return 'err';
  }

  // The optimum sits inside the [lo, hi] range: the middle is good, the extremes are not.
  return value >= lo && value <= hi ? 'ok' : 'warn';
}

/**
 * Re-renders an `AsciiBar`'s track text and value readout for a new value, and reflects
 * that value onto an ancestor `role="meter"`/`role="progressbar"` host's `aria-valuenow`
 * (and its value/unit readout, if any). Shared by `Meter` and `ProgressBar` so both stay
 * in sync through one code path.
 *
 * @param el The `AsciiBar` root element (has `[data-ascii-bar]`), or any element containing
 *   one - e.g. the `Meter`/`ProgressBar` wrapper.
 * @param value The new value, in the bar's own domain (`data-min`..`data-max`).
 */
export function setBarValue(el: HTMLElement, value: number): void {
  const barRoot = el.hasAttribute('data-ascii-bar') ? el : el.querySelector<HTMLElement>('[data-ascii-bar]');
  if (!barRoot) return;

  const min = Number(barRoot.dataset.min ?? 0);
  const max = Number(barRoot.dataset.max ?? 100);
  const width = Number(barRoot.dataset.width ?? DEFAULT_BAR_WIDTH);
  const clamped = clampValue(value, min, max);

  barRoot.dataset.value = String(clamped);

  const track = barRoot.querySelector<HTMLElement>('[data-ascii-bar-track]');
  if (track) track.textContent = renderAsciiBarText(clamped, min, max, width);

  const valueEl = barRoot.querySelector<HTMLElement>('[data-ascii-bar-value]');
  if (valueEl) valueEl.textContent = formatBarPercent(clamped, min, max);

  const host = barRoot.closest<HTMLElement>('[role="meter"], [role="progressbar"]');
  if (host) {
    host.setAttribute('aria-valuenow', String(clamped));
    const readout = host.querySelector<HTMLElement>('[data-value-readout]');
    if (readout) readout.textContent = `${clamped}${host.dataset.unit ?? ''}`;
  }
}

export { TONE_TEXT_CLASS };
export type { DataTone };
