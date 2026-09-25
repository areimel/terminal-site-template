/**
 * Toast API: the cross-team contract other components use to surface
 * system messages (see `docs/agents/BRIEF.md`, "Cross-team DOM contracts").
 *
 * `toast(...)` just dispatches a `terminal:toast` window event; the single,
 * Layout-mounted `feedback/Toaster.astro` is what actually listens and
 * renders it. That means calling `toast(...)` and dispatching the raw event
 * yourself (`window.dispatchEvent(new CustomEvent('terminal:toast', {
 * detail })))`) are equivalent - both go through this same event, so code
 * that doesn't want to import `~/lib/toast` can still participate in the
 * contract.
 */

export type ToastTone = 'default' | 'ok' | 'warn' | 'err';

export interface ToastOptions {
  /** The message shown. Plain sentence case, says what happened. */
  message: string;
  tone?: ToastTone;
  /** Auto-dismiss delay in ms. Defaults to 5000. Pass 0 to require manual dismissal. */
  timeout?: number;
}

export const TOAST_EVENT = 'terminal:toast';

/** Fires a toast. No-op outside the browser (e.g. during SSR/build). */
export function toast(options: ToastOptions): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<ToastOptions>(TOAST_EVENT, { detail: options }));
}
