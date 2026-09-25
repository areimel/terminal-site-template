/**
 * Client-side submit helper for the template's forms.
 *
 * DOM-only; import it from a client `<script>` tag (never from Astro frontmatter). It validates
 * the form with the constraint validation API, then posts to Web3Forms - unless no access key
 * is configured, in which case it reports a demo-mode result without sending anything. Either
 * way it dispatches a `terminal:toast` CustomEvent so any mounted toaster can announce the
 * result; that dispatch is a no-op if nothing is listening.
 *
 * The access key is read from the submitting form's `data-access-key` attribute, which
 * `forms/Form.astro` renders server-side from `TEMPLATE.integrations.forms.accessKey` - this
 * module never imports `astrowind:config` itself, so it stays usable outside Astro.
 */

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

export interface SubmitResult {
  ok: boolean;
  message: string;
}

function announce(result: SubmitResult): void {
  try {
    window.dispatchEvent(
      new CustomEvent('terminal:toast', {
        detail: { message: result.message, tone: result.ok ? 'ok' : 'err' },
      })
    );
  } catch {
    // No window/CustomEvent (e.g. this ran outside a browser) - nothing to announce.
  }
}

/**
 * Validates and submits `form`. Resolves with `{ ok, message }` and never throws; always
 * dispatches `terminal:toast` before resolving.
 */
export async function submitForm(form: HTMLFormElement): Promise<SubmitResult> {
  if (!form.checkValidity()) {
    form.reportValidity();
    const result: SubmitResult = { ok: false, message: 'Fix the highlighted fields and try again.' };
    announce(result);
    return result;
  }

  const accessKey = form.dataset.accessKey?.trim();

  if (!accessKey) {
    const result: SubmitResult = {
      ok: true,
      message: 'Demo mode: message not sent. Add a Web3Forms key in src/config.yaml to enable sending.',
    };
    announce(result);
    return result;
  }

  const payload: Record<string, unknown> = Object.fromEntries(new FormData(form).entries());
  payload.access_key = accessKey;

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });

    const result: SubmitResult = {
      ok: response.ok,
      message: response.ok ? 'Message sent.' : "Couldn't send your message. Check your connection and try again.",
    };
    announce(result);
    return result;
  } catch {
    const result: SubmitResult = {
      ok: false,
      message: "Couldn't send your message. Check your connection and try again.",
    };
    announce(result);
    return result;
  }
}
