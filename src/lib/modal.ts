/**
 * Modal controller: implements the cross-team `data-modal-open` /
 * `data-modal-close` DOM contract (see `docs/agents/BRIEF.md`, "Cross-team
 * DOM contracts"). Any element anywhere on the page with
 * `data-modal-open="<id>"` opens the `<dialog id="<id>">` rendered by
 * `feedback/Modal.astro`; any element with `data-modal-close` inside an
 * open dialog closes its nearest `<dialog>` ancestor.
 *
 * A single delegated click listener is installed on `document` (guarded so
 * it only ever runs once) instead of a listener per trigger. That means new
 * triggers rendered later keep working for free, and the listener survives
 * Astro ClientRouter navigations without needing to re-init - it's attached
 * to `document` itself, not to page content that gets swapped out.
 */

const OPEN_EVENT = 'terminal:modal-open';
const CLOSE_EVENT = 'terminal:modal-close';
const LOCK_CLASS = 'modal-open';

const openDialogIds = new Set<string>();
const openers = new WeakMap<HTMLDialogElement, HTMLElement>();

function getDialog(id: string): HTMLDialogElement | null {
  const el = document.getElementById(id);
  return el instanceof HTMLDialogElement ? el : null;
}

function lockScroll(): void {
  document.body.classList.add(LOCK_CLASS);
}

function unlockScrollIfNoneOpen(): void {
  if (openDialogIds.size === 0) document.body.classList.remove(LOCK_CLASS);
}

/** Opens the `<dialog id="<id>">` via `showModal()`. No-op if it's missing or already open. */
export function openModal(id: string): void {
  const dialog = getDialog(id);
  if (!dialog || dialog.open) return;

  // Remember whoever had focus when the modal was triggered (almost always
  // the element that was just clicked/activated) so focus can return there
  // when the dialog closes.
  const active = document.activeElement;
  if (active instanceof HTMLElement && active !== document.body) {
    openers.set(dialog, active);
  }

  dialog.showModal();
  openDialogIds.add(id);
  lockScroll();
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { id } }));
}

/** Closes the `<dialog id="<id>">`. No-op if it's missing or already closed. */
export function closeModal(id: string): void {
  const dialog = getDialog(id);
  if (!dialog || !dialog.open) return;
  dialog.close();
}

/**
 * Wires the parts of a dialog's lifecycle that can happen without going
 * through `openModal`/`closeModal` - Esc and `form[method="dialog"]`
 * submissions both close a `<dialog>` natively. Handling them here (via the
 * dialog's own `close` event, which fires no matter how it closed) keeps
 * focus-return, the scroll lock and the `terminal:modal-close` event correct
 * for every closing path. Also wires backdrop-click-to-close. Called once
 * per dialog by `feedback/Modal.astro`; safe to call again (idempotent).
 */
export function registerDialog(dialog: HTMLDialogElement): void {
  if (dialog.dataset.modalWired === 'true') return;
  dialog.dataset.modalWired = 'true';

  dialog.addEventListener('close', () => {
    openDialogIds.delete(dialog.id);
    unlockScrollIfNoneOpen();
    window.dispatchEvent(new CustomEvent(CLOSE_EVENT, { detail: { id: dialog.id } }));

    const opener = openers.get(dialog);
    openers.delete(dialog);
    if (opener && document.contains(opener)) opener.focus();
  });

  // A `<dialog>` shown with `showModal()` fills its content box only; a
  // click that lands outside that box (i.e. on the ::backdrop) still
  // dispatches a click event with the dialog itself as the target, so a
  // bounding-rect check tells backdrop clicks apart from clicks on content.
  dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) closeModal(dialog.id);
  });
}

let delegatedListenerInstalled = false;

/** Installs the single document-level delegated click listener. Idempotent. */
export function installModalTriggers(): void {
  if (delegatedListenerInstalled || typeof document === 'undefined') return;
  delegatedListenerInstalled = true;

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const opener = target.closest<HTMLElement>('[data-modal-open]');
    if (opener) {
      const id = opener.getAttribute('data-modal-open');
      if (id) openModal(id);
      return;
    }

    const closer = target.closest<HTMLElement>('[data-modal-close]');
    if (closer) {
      const dialog = closer.closest('dialog');
      if (dialog) closeModal(dialog.id);
    }
  });
}
