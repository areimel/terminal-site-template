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

**Select** — Dropdown

```astro
<Select name="topic" label="Topic">
  <option>Support</option>
  <option>Sales</option>
</Select>
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

- `full` — Large form for dedicated contact pages
- `compact` — Small form for sidebars or footers
- `modal` — Form in a modal dialog

The form validates before submit, shows a loading state, and displays success/error messages.

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

When `accessKey` is `null`, the form shows a demo-mode notice saying "Form submission is disabled. This is a template."

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

GTM code loads automatically and tracks page views.

### Google Analytics

Add your GA ID in `src/config.yaml`:

```yaml
template:
  integrations:
    ga:
      id: 'G-XXXXXXXXXX'
```

GA code loads automatically and tracks events.

Both are optional. Set to `null` (or omit) to disable analytics.

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

## Form submission

To handle custom form submissions, listen for the submit event:

```astro
<form id="custom-form">
  <input type="text" name="message" />
  <button type="submit">Send</button>
</form>

<script>
  document.getElementById('custom-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);

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

## Environment variables

Store sensitive keys in `.env`:

```
WEB3FORMS_ACCESS_KEY=your_key_here
GTM_ID=GTM-XXXXXXXXX
```

Then reference them in your components (though for most configs, use `src/config.yaml` instead).

## Security

- Never hard-code API keys in components
- Store keys in environment variables or config
- Use HTTPS for all form submissions
- Validate input on the server side
- Consider CSRF tokens for sensitive forms

ContactForm handles most of this automatically with Web3Forms.
