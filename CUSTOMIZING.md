# Customizing the template

Task-oriented recipes for the most common changes. For a narrative walkthrough, see `/docs` (built from `src/data/docs/`); this file is the quick-reference version, plus a few things that don't have their own doc page yet.

## Change the branding

All brand strings live in one file: `src/data/global-content/branding.yaml`. Edit it to rebrand the entire site in one place:

- `projectName` — the site title (used for `<title>` and Open Graph `site_name`)
- `projectSlug` — URL/package-safe form, available as `BRANDING.projectSlug`
- `projectDescription` — the meta description
- `companyName` — short company name (identity.org everywhere by default; boot screen, demos)
- `companyFullName` — expanded form
- `companyDisplayName` — dotted display form (A.R.D.A.), opt-in
- `personaName` — persona shown in footer, boot log, shell whoami
- `personaHandle` — persona handle, shown by `whoami` and in the boot log
- `shellHost` — hostname in the shell prompt (`guest@<shellHost>:~$`)
- `author` — copyright holder

`vendor/integration/utils/configBuilder.ts` loads this and exposes it as `BRANDING` from `astrowind:config`, supplying defaults for SITE.name, METADATA title/description, TEMPLATE.identity, and TEMPLATE.shell.prompt — any value you set in `src/config.yaml` still overrides these defaults.

To use brand strings in a component, import them:

```ts
import { BRANDING, TEMPLATE } from 'astrowind:config';

// e.g., <h1>{BRANDING.projectName}</h1> or <p>{BRANDING.companyFullName}</p>
```

Note: markdown content (`README.md`, `src/data/docs/` etc.), `package.json`, and `LICENSE.md` must be edited by hand — they're not driven by config.

## Add a global content file

The `src/data/global-content/` folder holds site-wide YAML files that load automatically at build time. Create a new file to add structured content:

1. Create `src/data/global-content/contact.yaml`:

   ```yaml
   email: hello@example.com
   phone: '+1 555 0100'
   ```

2. Restart `pnpm dev` (new files need a dev-server restart; edits to existing files reload automatically).

3. Type it by adding a field to the existing `GlobalContent` interface in `vendor/integration/utils/configBuilder.ts`. Untyped files read as `unknown`, so `astro check` rejects property access on them until they're typed:

   ```ts
   export interface GlobalContent {
     branding: BrandingConfig;
     contact: { email: string; phone: string }; // add one line per file
     [key: string]: unknown;
   }
   ```

4. Import and use it in a component:

   ```astro
   ---
   import { GLOBAL_CONTENT } from 'astrowind:config';
   ---

   <a href={`mailto:${GLOBAL_CONTENT.contact.email}`}>Email us</a>
   ```

**Naming rule:** Each filename becomes a camelCased key in `GLOBAL_CONTENT` — `contact.yaml` → `GLOBAL_CONTENT.contact`, `site-links.yaml` → `GLOBAL_CONTENT.siteLinks`. Each file's top level must be a key/value mapping.

## Add a theme

Themes live in the registry at `src/lib/themes.ts`. Add an entry to the `themes` array — the switcher, the shell's `theme` command, and every component that uses `terminal-*` classes or `--theme-*` variables pick it up automatically, with no other code changes.

```ts
// src/lib/themes.ts
export const themes: TerminalTheme[] = [
  // ...existing themes
  {
    id: 'neon',
    label: 'Neon Nights',
    colors: {
      100: 'rgba(255, 0, 255, 0.1)',
      200: 'rgba(255, 0, 255, 0.2)',
      300: 'rgba(255, 0, 255, 0.4)',
      400: 'rgba(255, 0, 255, 0.6)',
      500: 'rgba(255, 0, 255, 0.8)',
      600: 'rgba(255, 0, 255, 0.9)',
      700: 'rgba(255, 0, 255, 1.0)',
      bright: 'rgba(255, 120, 255, 0.95)',
      bgPrimary: '#0a0014',
      bgSecondary: '#160024',
      bgAccent: '#220034',
      accent: 'rgba(0, 255, 200, 0.9)',
      accentBright: 'rgba(120, 255, 220, 0.95)',
      glow: '0 0 3ex var(--theme-600), 0 0 5px var(--theme-bright)',
    },
    font: 'uav', // optional: 'kode' | 'uav' | 'vt323'; omit to keep the default (Kode Mono)
  },
];
```

`colors` values are plain CSS color strings — the built-in themes use `rgba()` so opacity is baked into the numbered steps, but hex or any other valid CSS color works too. `ThemeHead.astro` reads this array at build time to emit one `.theme-<id>{ --theme-*: ... }` block per theme, so a new theme needs no other file touched.

Try it with `theme neon` in the shell, or from the Settings panel (gear icon in the sidebar).

## Change the default theme or effects

Both are config, not code — edit `src/config.yaml`:

```yaml
template:
  themes:
    default: amber # green | amber | red | yellow | blue | <your new theme id>
  effects:
    boot: true
    noise: true
    scanline: true
    overlay: true
    decoder: false # example: ship with decoder off by default
```

A visitor's own choice (made via Settings or the shell) is stored in `localStorage` (`terminal-theme`, `terminal-effects`) and overrides these defaults on their next visit; the config values only set what a first-time visitor sees.

## Add a shell command

Edit `src/lib/shell/commands.ts` — it's a plain array of `ShellCommand` objects (the shell's engine, `src/lib/shell/engine.ts`, merges it with the built-ins in `src/lib/shell/builtins.ts`; a command here with the same `name` as a built-in replaces it):

```ts
// src/lib/shell/types.ts (for reference — you don't need to edit this)
export interface ShellCommand {
  name: string;
  aliases?: string[];
  description: string;
  usage?: string;
  hidden?: boolean;
  run(ctx: ShellContext, args: string[]): void | Promise<void>;
  complete?(args: string[], ctx: ShellContext): string[];
}
```

```ts
// src/lib/shell/commands.ts
export const userCommands: ShellCommand[] = [
  // ...existing commands
  {
    name: 'status',
    description: 'Print the current theme and effects state.',
    usage: 'status',
    run(ctx) {
      const effects = ctx.getEffects();
      const on = Object.entries(effects)
        .filter(([, v]) => v)
        .map(([k]) => k);
      ctx.print([`theme: ${ctx.currentTheme()}`, `effects on: ${on.join(', ') || 'none'}`]);
    },
  },
];
```

`ShellContext` (also in `src/lib/shell/types.ts`) gives your `run`/`complete` functions `print`, `clear`, `navigate`, `setTheme`, `setEffect`, `getEffects`, `history`, `commands`, `routes` (from `navigation.ts`), `themes`, `currentTheme()`, and `identity`. The engine itself is DOM-free and unit-tested with Vitest (`src/lib/shell/engine.test.ts`) — `pnpm test` runs it without a browser.

## Add a component (and get it onto `/components`)

1. Create the component in the right group folder, e.g. `src/components/data/Sparkline.astro`, with a typed `interface Props` and a `class?: string` passthrough.
2. Add it to that group's barrel, `src/components/data/index.ts`:
   ```ts
   export { default as Sparkline } from './Sparkline.astro';
   ```
3. Add (or extend) `src/components/data/_demo/DataDemo.astro` — render the component and its meaningful variants, each wrapped in a `Panel` whose `title` is the component name plus one plain sentence of what it's for.

`/components` (`src/pages/components.astro`) discovers every `src/components/<group>/_demo/*Demo.astro` file at build time via `import.meta.glob` — a new group with its own demo folder shows up with no changes to that page. The gallery also parses each group's `index.ts` barrel to print an accurate `import { ... } from '~/components/<group>'` line, so step 2 isn't optional: skip it and the component still renders in its demo, but it won't appear in the sample import.

## Add a nav item

Edit `src/navigation.ts` — `mainNav` (sidebar) or `footerNav`:

```ts
export const mainNav: NavItem[] = [
  // ...existing items
  { label: 'Status', href: getPermalink('/status'), icon: 'tabler:activity', shellAlias: 'status' },
];
```

`shellAlias` is optional; when set, the shell's `ls`, `cd <alias>`, and `open <alias>` commands can reach the route by that name (they read `mainNav`/`footerNav` via `ShellContext.routes`). `icon` is any Tabler icon name (the project bundles the full `tabler:*` set via `astro-icon`).

## Use toasts

```ts
import { toast } from '~/lib/toast';

toast({ message: 'Settings saved.', tone: 'ok', timeout: 3000 });
// tone: 'default' | 'ok' | 'warn' | 'err'; timeout defaults to 5000ms, pass 0 to require manual dismissal
```

`toast()` just dispatches a `window` `CustomEvent('terminal:toast', { detail })`; the single `Toaster` instance mounted once in `PageLayout.astro` listens for it. Code that doesn't want to import `~/lib/toast` can dispatch the same event directly and get the same result.

## Use modals

Any element with `data-modal-open="<id>"` opens the `<dialog id="<id>">` rendered by a `Modal`; any element with `data-modal-close` inside it closes the nearest `<dialog>` ancestor. The core `Button` renders this for you via its `modalId` prop:

```astro
---
import { Button } from '~/components/core';
import { Modal } from '~/components/feedback';
---

<Button modalId="example">Open example</Button>

<Modal id="example" title="Example">
  <p>Modal body content.</p>
  <button slot="footer" data-modal-close>Close</button>
</Modal>
```

Or imperatively, from a `<script>`:

```ts
import { openModal, closeModal } from '~/lib/modal';

openModal('example');
closeModal('example');
```

A single delegated click listener (installed once, in `~/lib/modal.ts`) handles every `data-modal-open`/`data-modal-close` element on the page, including ones added after page load — you never need to re-wire triggers yourself.

## Enable forms (Web3Forms)

The one contact form, `ContactForm` (`~/components/forms`), posts through `~/lib/forms.ts` to [Web3Forms](https://web3forms.com). With no key configured it still renders and validates, but shows a "Demo mode" notice instead of sending. To enable it:

1. Get an access key at [web3forms.com](https://web3forms.com).
2. Set it in `src/config.yaml`:
   ```yaml
   template:
     integrations:
       forms:
         provider: web3forms
         accessKey: 'YOUR_WEB3FORMS_KEY'
   ```

`ContactForm` has two variants — `variant="full"` (adds a subject select, taller message field) and `variant="compact"` (name/email/message only). To show it in a modal, wrap it in `Modal` yourself (there's no separate `variant="modal"`):

```astro
<Modal id="contact" title="Contact">
  <ContactForm variant="compact" />
</Modal>
```

## Enable analytics

Google Tag Manager loads automatically once you set an id — no other change needed:

```yaml
template:
  integrations:
    gtm:
      id: 'GTM-XXXXXXX'
```

`GoogleTagManagerHead`/`GoogleTagManagerBody` (mounted in `src/layouts/Layout.astro`) render nothing when `gtm.id` is `null`, and the GTM snippet plus its `<noscript>` fallback when it's set.

Set `template.integrations.ga.id` (e.g. `'G-XXXXXXXXXX'`) to load Google Analytics via `common/GoogleAnalytics.astro`. If you already fire GA4 from a GTM container, leave `ga.id` empty so it isn't loaded twice.

## Add a docs page

Docs are a content collection (`src/content/config.ts`, `docs`), loaded from `src/data/docs/**/*.md|mdx`. Add a file with this frontmatter:

```md
---
title: My new guide
description: One line describing what this page covers.
section: Guides # 'Getting started' | 'Guides' | 'Components' | 'Reference'
order: 5 # position within that section, ascending
draft: false # optional; true hides it from the collection query
---

Page content in Markdown (or MDX, if you need to embed a live component).
```

Save it as `src/data/docs/my-new-guide.md` and it's live at `/docs/my-new-guide` (the file `src/data/docs/index.md` is special-cased to render at `/docs` itself). `DocsLayout` builds its file-tree sidebar, on-page table of contents, and prev/next links straight from the collection — no route or nav file to edit.

## Remove the boot screen or CRT effects entirely

Two options, depending on how permanent you want this:

- **Ship it off by default, but leave it available in Settings:** set `template.effects.boot: false` (or `overlay`/`noise`/`scanline`/`decoder`) in `src/config.yaml`. Visitors can still turn it back on themselves.
- **Remove it from the template entirely:** delete the corresponding line(s) from `src/layouts/Layout.astro`, e.g.:
  ```astro
  <!-- delete this import and this line to drop the boot screen -->import BootScreen from
  '~/components/effects/BootScreen.astro'; ...
  <BootScreen />
  <!-- delete this import and this line to drop the CRT overlay (noise/scanline/vignette) -->
  import CrtOverlay from '~/components/effects/CrtOverlay.astro'; ...
  <CrtOverlay />
  ```
  You can also delete the toggle from `EffectsControls`/`SettingsPanel` if you don't want a dead control left in Settings, and drop the corresponding key from `template.effects` in `src/config.yaml` and from `src/lib/effects.ts`'s `EffectName` union.
