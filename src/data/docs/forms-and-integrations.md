---
title: Forms and integrations
description: Handle user input and connect external services.
section: Guides
order: 4
---

The template includes form components and integrations for contact submissions, analytics, and more.

## Form primitives

Build custom forms using these components:

**Field** — Text input

```astro
<Field name="email" label="Email" type="email" />
```

**Select** — Dropdown. Takes an `options` prop (an array of `{ value, label }`) rather than `<option>` children:

```astro
<Select
  name="topic"
  label="Topic"
  options={[
    { value: 'support', label: 'Support' },
    { value: 'sales', label: 'Sales' },
  ]}
/>
```

**Checkbox** — Checkbox input

```astro
<Checkbox name="agree" label="I agree to the terms" />
```

**Radio** — Radio button

```astro
<Radio name="frequency" value="daily" label="Daily" />
<Radio name="frequency" value="weekly" label="Weekly" />
```

**Toggle** — On/off switch

```astro
<Toggle name="notifications" label="Enable notifications" />
```

**Form** — Wrapper

```astro
<Form action="/api/subscribe" method="POST">
  <Field name="email" label="Email" required />
  <Button type="submit">Subscribe</Button>
</Form>
```

All form components are accessible: labels linked to inputs, proper ARIA roles, and error messages.

## ContactForm component

The template includes a ready-made contact form:

```astro
<ContactForm variant="full" />
```

**Variants:**

- `full` — Large form for dedicated contact pages (adds a subject select and a taller message field)
- `compact` — Small form for sidebars or footers (name/email/message only)

There's no separate `modal` variant — wrap either variant in a `Modal` yourself for a modal contact form:

```astro
<Modal id="contact" title="Contact">
  <ContactForm variant="compact" />
</Modal>
```

The form validates before submit, disables the submit button while sending, and writes a status message (`OK ...` / `ERR ...`) into an `aria-live` region.

## Web3Forms integration

ContactForm uses Web3Forms for email submission. Set your access key in `src/config.yaml`:

```yaml
template:
  integrations:
    forms:
      provider: 'web3forms'
      accessKey: 'YOUR_WEB3FORMS_KEY'
```

To get an access key:

1. Sign up at [web3forms.com](https://web3forms.com)
2. Create a form and copy the access key
3. Paste it in your config

When `accessKey` is `null`, `ContactForm` shows a demo-mode notice next to its submit button ("Demo mode: no Web3Forms key configured, so messages won't be sent."), and submitting it reports the same thing back through the status region and a toast instead of sending anything.

## Analytics

The template supports Google Tag Manager and Google Analytics.

### Google Tag Manager

Add your GTM ID in `src/config.yaml`:

```yaml
template:
  integrations:
    gtm:
      id: 'GTM-XXXXXXXXX'
```

`common/GoogleTagManagerHead.astro` and `common/GoogleTagManagerBody.astro` (mounted in `src/layouts/Layout.astro`) read `TEMPLATE.integrations.gtm.id` and render nothing when it's `null`; setting it emits the GTM snippet plus its `<noscript>` fallback with no other change needed.

### Google Analytics

`common/GoogleAnalytics.astro` (mounted in `src/layouts/Layout.astro`) reads `template.integrations.ga.id` and loads gtag.js when it's set:

```yaml
template:
  integrations:
    ga:
      id: 'G-XXXXXXXXXX'
```

If you already use GTM, you can instead fire a GA4 tag from your GTM container and leave `ga.id` empty so GA isn't loaded twice.

Set `gtm.id`/`ga.id` to `null` (or omit them) to leave analytics off.

## Toasts

Show temporary notifications to users:

```typescript
import { toast } from '~/lib/toast';

toast({
  message: 'Message sent!',
  tone: 'ok', // 'default' | 'ok' | 'warn' | 'err'
  timeout: 3000, // milliseconds
});
```

Or dispatch a custom event:

```typescript
window.dispatchEvent(
  new CustomEvent('terminal:toast', {
    detail: {
      message: 'Something happened',
      tone: 'warn',
    },
  })
);
```

Toasts appear in the bottom-right corner and auto-dismiss after the timeout.

## Form submission to your own endpoint

`Form`'s `provider` prop is specific to Web3Forms. For anything else (your own API, a different form service), skip `provider` and handle the submit yourself. Note that this template builds as a fully static site (`output: 'static'` in `astro.config.ts`) — `/api/submit` below is a placeholder for wherever you're actually sending the request (a third-party endpoint, or your own server if you add one), not a route this template provides:

```astro
<form id="custom-form">
  <input type="text" name="message" />
  <button type="submit">Send</button>
</form>

<script>
  import { toast } from '~/lib/toast';

  const form = document.getElementById('custom-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form as HTMLFormElement);

    fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(data)),
    })
      .then(() => {
        toast({ message: 'Success!', tone: 'ok' });
      })
      .catch((err) => {
        toast({ message: `Error: ${err.message}`, tone: 'err' });
      });
  });
</script>
```

## A note on secrets

`src/config.yaml` holds plain values — there's no `.env`/`process.env` interpolation built in, so whatever you put in `template.integrations.forms.accessKey` (or `gtm.id`/`ga.id`) is committed to your repo as-is. A Web3Forms access key is meant to be public (it only lets people submit to your form, not read anything), so this is fine for the default setup. If you fork this template publicly and don't want your key visible in the repo, wire your own build-time substitution (e.g. read `import.meta.env.WEB3FORMS_ACCESS_KEY` in a small wrapper and pass it wherever `TEMPLATE.integrations.forms.accessKey` is read today) — that's not something the template does for you out of the box.

## Security

- Never hard-code API keys in components — read them from `TEMPLATE.integrations.*` (see above for the caveat)
- Use HTTPS for all form submissions (Web3Forms's endpoint always is)
- Validate input on the server side too — the template's client-side validation (`Field required`, `type="email"`, etc.) is a UX convenience, not a security boundary
- Consider CSRF tokens for sensitive forms beyond a simple contact form

`ContactForm` covers the common case (validation, demo mode, status messaging) but doesn't implement CSRF protection on its own.
