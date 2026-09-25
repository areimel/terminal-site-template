# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A forkable Astro 5 template for building sites and web apps with an 80s lo-fi CRT terminal aesthetic: a themed component kit (~60 components across 10 groups), a config-driven persona/navigation system, a five-theme registry, toggleable visual effects, an interactive terminal shell, and demo pages (dashboard, landing, pricing, blog, projects, docs). See `README.md` for the quick start and `CUSTOMIZING.md` for task recipes.

## Development commands

- **Dev server**: `pnpm dev` (http://localhost:4321), or `pnpm dev-host` to expose it on the network
- **Build**: `pnpm build` (static output to `dist/`)
- **Preview the build**: `pnpm preview` (http://localhost:4321)
- **All checks**: `pnpm check` (Astro check + ESLint + Prettier, read-only)
  - Individually: `pnpm check:astro`, `pnpm check:eslint`, `pnpm check:prettier`
- **Fix**: `pnpm fix` (ESLint `--fix` + Prettier `--write`), or `pnpm fix:eslint` / `pnpm fix:prettier`
- **Unit tests**: `pnpm test` (Vitest; currently the shell engine/parser, DOM-free)
- **E2e tests**: `pnpm test:e2e` (Playwright: route smoke tests, theme/effects persistence, shell commands, contact form demo mode, axe scans)

Run `pnpm check` and `pnpm build` before considering any change done.

## Architecture

### Component groups (`src/components/`)

Components are organized by function, not by page:

- `core/` — Panel, Button, Heading, Prompt, Divider, Badge, Kbd, Icon, Container (the primitives everything else builds on)
- `content/` — Prose, CodeBlock, Blockquote, Card, TextBox, Callout, FactGrid
- `media/` — Figure, AsciiFrame, CrtImage, Embed, Gallery
- `effects/` — BootScreen, CrtOverlay, EffectsRuntime, DecoderText, Typewriter
- `forms/` — Field, Select, Checkbox, Radio, RadioGroup, Toggle, Form, ContactForm
- `feedback/` — Modal, Toaster, Tooltip, Alert, Spinner
- `data/` — AsciiBar, Meter, ProgressBar, StatReadout, KeyValue, DataTable, LogStream
- `navigation/` — SidebarNav, Footer, SettingsPanel, Tabs, Accordion(Item), Breadcrumb, Pagination, ThemeSwitcher, EffectsControls
- `sections/` — Hero, FeatureGrid, CTA, FAQ, Timeline, Testimonial, PricingTable
- `shell/` — TerminalShell (custom element)
- `blog/`, `projects/`, `article/`, `docs/` — content-type-specific components (share `ArticleShell`, `DocsLayout`)
- `app/`, `home/`, `gallery/` — page-specific pieces for `/app`, `/`, and `/components`
- `common/` — Metadata, CommonMeta, ThemeHead, GoogleTagManager\*, Favicons, BasicScripts

Every group except the page-specific ones ships a `src/components/<group>/_demo/<Group>Demo.astro`, and every group has a barrel `index.ts` re-exporting its components. `/components` (`src/pages/components.astro`) discovers demos and barrels via `import.meta.glob` — adding a demo and a barrel entry is what gets a new component onto that page, no registry to edit. See `CUSTOMIZING.md` → "Add a component" for the exact steps.

### `src/lib/` runtimes

- `themes.ts` — the `TerminalTheme` registry (`themes: TerminalTheme[]`, ids `green | amber | red | yellow | blue`, plus `defaultThemeId`, `getThemeById`, `themeClass`). Pure data; safe to import from Astro frontmatter or client scripts.
- `theme-runtime.ts` — client-side apply/persist/cycle: `getTheme()` (returns the current theme **id**), `applyTheme(id)`, `cycleTheme()`, `initThemeRuntime()`. Dispatches `terminal:theme-change` on `document`. Storage key `terminal-theme`.
- `effects.ts` — effect state: `EffectName = 'boot' | 'noise' | 'scanline' | 'overlay' | 'decoder'`, `effectDefaults` (from config), `getEffects()`, `isEnabled(name)`, `setEffect(name, on)`, `setAllEffects(on)`, `initEffectsRuntime()`. Dispatches `terminal:effects-change` on `document` with the full effects state as `detail`. Reduced motion always wins over any config/user override. Storage key `terminal-effects`. Reflected onto `<html data-fx-<name>="on|off">`.
- `modal.ts` — the `data-modal-open="<id>"` / `data-modal-close` DOM contract: a single delegated `document` click listener (installed once) opens/closes the matching `<dialog id="<id>">`. Also exports `openModal(id)`/`closeModal(id)` for imperative use.
- `toast.ts` — `toast({ message, tone?, timeout? })` dispatches a `window` `CustomEvent('terminal:toast', { detail })`; the single `Toaster` mounted in `PageLayout.astro` renders it.
- `forms.ts` — `submitForm(form)`: validates, then posts to Web3Forms using the form's `data-access-key` (or reports demo mode if none is configured). Dispatches `terminal:toast` either way.
- `shell/` — `types.ts` (the `ShellContext`/`ShellCommand`/`ShellEngine` contract), `engine.ts` (`createShell(host, extraCommands?)`, DOM-free and unit-tested), `builtins.ts` (help, ls, cd, open, theme, effects, clear, whoami, echo, date, history, sudo), `parse.ts`, `commands.ts` (`userCommands` — the file a fork edits to add its own commands).

### Config (`src/config.yaml` + `vendor/integration/`)

`vendor/integration/utils/configBuilder.ts` builds the typed `astrowind:config` virtual module from `src/config.yaml`, filling in defaults for anything omitted. Import what you need from it:

```ts
import { TEMPLATE, SITE, METADATA, APP_BLOG, APP_PROJECTS } from 'astrowind:config';
```

`TEMPLATE` shape: `identity {name, handle, org, role, tagline, location}`, `social [{label, href, icon}]`, `themes.default`, `effects {boot, noise, scanline, overlay, decoder}`, `shell {prompt, motd}`, `integrations {forms:{provider, accessKey}, gtm:{id}, ga:{id}}`. Note: `integrations.ga.id` exists in the schema but nothing currently reads it to load a script — GTM is the one that's actually wired up (`common/GoogleTagManagerHead.astro`/`GoogleTagManagerBody.astro`). There's no env-var interpolation into `config.yaml` — values in it are committed as plain text.

Extend `vendor/integration/**` for new config fields; don't replace the pattern (merge defaults + user config with `lodash.merge`).

### Navigation (`src/navigation.ts`)

`NavItem {label, href, icon, shellAlias?}`; `mainNav`, `footerNav`, and `socialLinks` (derived from `TEMPLATE.social`). `SidebarNav`, `Footer`, `Breadcrumb`, and the shell's `ls`/`cd`/`open` commands all read from these — add a page to the nav in one place and every consumer picks it up.

### Content collections (`src/content/config.ts`)

`post` and `project` (Markdown/MDX in `src/data/post/` and `src/data/projects/`), `docs` (`src/data/docs/**/*.md|mdx`, frontmatter `{title, description?, section: 'Getting started'|'Guides'|'Components'|'Reference', order, draft?}`, routed at `/docs/<id>` with `index.md` → `/docs`), and `changelog` (`src/data/changelog/*.md`, `{version, date, summary?, draft?}`).

## Conventions

- **Colors**: only via Tailwind `terminal-*` tokens (`text-terminal-300`, `bg-terminal-bg-secondary`, `border-terminal-400`, `text-terminal-bright`, …) or `--theme-*`/`--terminal-*` CSS variables. **Never hard-code a hex/rgb color in a component** — every component has to re-theme live across all 5 themes, and switching is instant because these all resolve through CSS variables, not fixed values.
- **Type scale**: `text-t-sm` through `text-t-5xl` (a 1.25 modular scale on a 16px root). Fonts: `font-uav-mono` for headings/display, Kode Mono (default body), VT323 only for large ASCII/display moments. Long-form text: `prose prose-terminal`.
- **Structure carries meaning**: Panel titles read like a window/file name (`~/projects/readme.txt`); border `variant` encodes hierarchy (`double` = app chrome, `line` = ordinary content, `ascii` = callouts); numbering only on real sequences; ALL-CAPS reserved for status strings (`OK`/`WARN`/`ERR`).
- **Motion**: anything decorative must check `isEnabled(name)` from `~/lib/effects` before animating and must respect `prefers-reduced-motion` (the effects runtime already forces every effect off under reduced motion — don't build a second, un-gated animation path). See `src/data/docs/effects.mdx` for the server-render-time-vs-client-runtime distinction on gating `decode`/effect markup.
- **Accessibility**: keyboard operable, correct ARIA roles/labels, a visible `:focus-visible` (the global glow-outline style already exists — reuse it), `aria-live` for dynamic text, works down to 360px width.
- **Copy**: plain, sentence case, CTAs name the action, errors say what failed and how to fix it. No filler, no em-dash label patterns, no `→` appended to buttons.
- **Astro components**: frontmatter script at the top, exported `interface Props` with JSDoc on non-obvious props, `class:list` for conditional classes, `class?: string` passthrough on every component.
- **Path aliases**: `~/*` → `src/*` (e.g. `~/components/core`, `~/lib/themes`, `~/utils/permalinks`). Configured in both `tsconfig.json` and the Vite `resolve.alias` in `astro.config.ts`.
- **Client JS**: vanilla TypeScript in `<script>` tags (Astro bundles them) — no UI framework. Stateful widgets are custom elements (`customElements.define('terminal-xyz', ...)`, guarded against double-registration). They survive Astro's `ClientRouter` navigation via their native `connectedCallback`/`disconnectedCallback` lifecycle; stateless enhancers that aren't custom elements guard against double-init and re-run on `astro:page-load`/`astro:after-swap` instead.
- **Events**: namespaced `terminal:*` (`terminal:theme-change`, `terminal:effects-change`, `terminal:toast`, `terminal:modal-open`, `terminal:modal-close`, `terminal:log`). Check whether a given event is dispatched on `document` or `window` before listening (see `src/lib/*.ts` — theme/effects use `document`; modal/toast use `window`).
- **Demo convention**: every component group ships `src/components/<group>/_demo/<Group>Demo.astro`, rendering every component and meaningful variant inside a `Panel` titled with the component's name plus one plain sentence of what it's for. `/components` composes these automatically.
- **Line endings**: `.gitattributes` normalizes text files to LF (`* text=auto eol=lf`); binary types (images, fonts) are marked `binary`. Don't fight this with editor-specific line-ending settings.
- **Image handling**: `astro.config.ts` uses `passthroughImageService()` — images are served as-is, not optimized/resized at build time. Compress large images yourself before adding them.
- **Deployment**: config for both Netlify (`netlify.toml`) and Vercel (`vercel.json`) is committed; the template isn't tied to either one. Note `netlify.toml`'s build command is currently `npm run build`, not `pnpm` — Netlify still installs via the committed `pnpm-lock.yaml`.

## Testing

- `pnpm test` runs Vitest against `src/lib/shell/*.test.ts` (DOM-free engine/parser tests) — extend these when you change shell parsing/dispatch.
- `pnpm test:e2e` runs Playwright (`tests/`, config in `playwright.config.ts`) against every route in the route list, checking console errors, theme/effects persistence, shell commands, the contact form's demo mode, and axe scans. Don't edit `tests/**` casually; update the route list there when routes are added/removed.
