/**
 * Shared semantic tone -> text color mapping for the `data/` component group.
 *
 * Mirrors `core/Badge.astro`'s tone palette exactly: `ok`/`warn`/`err` use fixed status
 * colors (independent of the active terminal theme) so a reading stays legible and
 * consistent no matter which of the 5 themes is active; `default` follows the theme via
 * the `terminal-*` tokens.
 */
export type DataTone = 'default' | 'ok' | 'warn' | 'err';

export const TONE_TEXT_CLASS: Record<DataTone, string> = {
  default: 'text-terminal-400',
  ok: 'text-emerald-400',
  warn: 'text-amber-400',
  err: 'text-rose-400',
};
