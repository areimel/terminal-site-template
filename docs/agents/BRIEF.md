# Shared agent brief (Waves 1–3)

Read this file fully, then the spec at `docs/superpowers/specs/2026-09-25-terminal-template-design.md` ("Design direction" + "Architecture").

## Setup (every agent, in your worktree, Git Bash)

```bash
git merge main --no-edit          # your worktree branch starts from an old commit — do this first
pnpm install --frozen-lockfile
```

## Rules

- **File ownership is strict.** Create/edit/delete only what your prompt lists. Need a change elsewhere (tailwind config, Layout, package.json, navigation, another team's folder)? Don't make it — write it in your final report under "Requests".
- **DRY.** Build on the core primitives and runtimes below. Never re-implement a card/panel border, a button, a heading, theme switching, or effects gating. If two of your components share markup, extract it.
- **No personal data.** Persona is fictional: read from `TEMPLATE.identity` (never hard-code names in components).
- **No new dependencies** unless your prompt says so.
- Astro conventions: frontmatter script, exported `interface Props` with JSDoc on non-obvious props, `class:list`, `class?: string` passthrough on every component.
- Imports: `~/components/...`, `~/lib/...`, `~/utils/...` (alias `~/*` → `src/*`).
- Client JS: vanilla TS in `<script>` tags (Astro bundles them). Stateful widgets = custom elements (`customElements.define('terminal-xyz', ...)`, guard against double-define). Must survive Astro `ClientRouter` navigation (re-init on `astro:page-load` where needed, or rely on custom element lifecycle).
- Events are namespaced `terminal:*`.

## Design rules (from the spec — enforced in review)

- Colors only via Tailwind `terminal-*` tokens (`text-terminal-300`, `bg-terminal-bg-secondary`, `border-terminal-400`, `text-terminal-bright`…) or CSS vars `--theme-*`. **Never hard-code hex colors** — every component must re-theme live across all 5 themes.
- Type scale: `text-t-sm, text-t-base, text-t-lg, text-t-xl, text-t-2xl … text-t-5xl`. Fonts: `font-uav-mono` headings/display, Kode Mono body (default), VT323 only for big ASCII moments. Long-form text: `prose prose-terminal`.
- Structure carries meaning: Panel titles = window/file names; border variant = hierarchy; numbering only for real sequences; ALL-CAPS only for status strings (OK/WARN/ERR).
- Motion: only purposeful. Anything decorative must check `isEnabled(...)` from `~/lib/effects` and be off under `prefers-reduced-motion`.
- Accessibility: keyboard operable, correct roles/aria, visible `:focus-visible` (global glow style exists), labels on inputs, `aria-live` for dynamic text. Works at 360px width.
- Copy: plain, sentence case, CTAs name the action, errors say what failed + how to fix. No filler, no em-dash label patterns, no `→` appended to buttons.

## Contracts already on main

**Config** — `import { TEMPLATE } from 'astrowind:config'`:
`TEMPLATE.identity {name, handle, org, role, tagline, location}`, `TEMPLATE.social [{label, href, icon}]`, `TEMPLATE.themes.default`, `TEMPLATE.effects {boot, noise, scanline, overlay, decoder}`, `TEMPLATE.shell {prompt, motd}`, `TEMPLATE.integrations {forms:{provider, accessKey|null}, gtm:{id|null}, ga:{id|null}}`. Also `SITE`, `METADATA`, `APP_BLOG`, `APP_PROJECTS`.

**Navigation** — `src/navigation.ts`: `NavItem {label, href, icon, shellAlias?}`, `mainNav`, `footerNav`, `socialLinks`.

**Themes** — `~/lib/themes`: `TerminalTheme`, `themes` (ids: green, amber, red, yellow, blue), `defaultThemeId`, `getThemeById`, `themeClass`. `~/lib/theme-runtime`: `getTheme()`, `applyTheme(id)`, `cycleTheme()`, `initThemeRuntime()`; event `terminal:theme-change` `{id}`; storage `terminal-theme`.

**Effects** — `~/lib/effects`: `EffectName = boot|noise|scanline|overlay|decoder`, `effectNames`, `effectDefaults`, `getEffects()`, `isEnabled(name)`, `setEffect(name,on)`, `setAllEffects(on)`, `initEffectsRuntime()`; event `terminal:effects-change`; `<html data-fx-<name>="on|off">`.

**Core primitives** — `~/components/core/` (barrel `index.ts`; demo `_demo/CoreDemo.astro`):

- `Panel {as?, title?, variant?: line|double|ascii|none, tone?: default|accent|muted, padding?: none|sm|md|lg, class?}` slots `actions`, `footer`
- `Button {href?, modalId?, type?, variant?: solid|outline|ghost|link, size?: sm|md|lg, prompt?, disabled?, target?, class?}` — `modalId` renders `data-modal-open="<id>"`
- `Heading {level: 1–6, as?, prompt?, decode?, glow?: none|subtle|strong, class?}` — `decode` renders `data-decode` + `data-text`
- `Prompt {symbol?, blink?}`, `Divider {style?: line|ascii|dashed, label?}`, `Badge {tone?: default|ok|warn|err, variant?: solid|outline}`, `Kbd`, `Icon {name, size?, label?}`

**Cross-team DOM contracts** (implement your side exactly):

- Modals: any element with `data-modal-open="<id>"` opens `<dialog>`/modal with that id; `data-modal-close` inside closes it. (Owner: B2)
- Decoder: any element with `[data-decode]` (+ optional `data-text`) gets the decoder animation when effect `decoder` is on. (Owner: A4)
- Toasts: `import { toast } from '~/lib/toast'`; `toast({ message, tone?: 'default'|'ok'|'warn'|'err', timeout? })`; also `window.dispatchEvent(new CustomEvent('terminal:toast', {detail}))`. (Owner: B2)

## Demo convention

Every component group ships `src/components/<group>/_demo/<Group>Demo.astro`: renders every component and meaningful variant, each inside a `Panel` whose `title` is the component name, with 1 plain sentence of what it's for. No page wrapper — the `/components` gallery composes these. Include realistic, persona-neutral sample content.

## Done

1. `pnpm run build` passes. 2. `pnpm run check:astro` shows no errors in your files. 3. `pnpm exec eslint <your files>` and `pnpm exec prettier --check <your files>` clean (run `--write` to fix). 4. Commit:

```bash
git add -A && git commit -m "<type>(<scope>): <summary>" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

5. Final report (< 350 words): branch + commit hash; files created/changed/deleted; public API (Props / exports); **Requests** (shared-file changes you need); known issues.

## Wave 1 contract additions (binding)

- **No barrels** (`index.ts`) in Wave 1 except `core/` — the lead adds them at merge.
- **Don't delete old components that files outside your ownership still import.** List them under "Requests"; the lead deletes after merge.
- **Toggle** (B1, `~/components/forms/Toggle.astro`): `{ name, label, checked?, id?, description?, disabled?, class? }` → `<input type="checkbox" role="switch">`.
- **Modal** (B2, `~/components/feedback/Modal.astro`): `{ id, title?, size?: 'sm'|'md'|'lg', class? }`, default slot + `footer` slot; native `<dialog>`; opened by `[data-modal-open="<id>"]`, closed by `[data-modal-close]`, Esc, backdrop click. Also `openModal(id)` / `closeModal(id)` exported from `~/lib/modal.ts` (B2).
- **AsciiBar** (B4, `~/components/data/AsciiBar.astro`): `{ value, max?=100, width?=20, label?, showValue?, tone?, class? }`; `Meter` (role=meter) and `ProgressBar` (role=progressbar, supports `indeterminate`) both wrap it. Both live in `data/`.
- **Pagination** (B3, `~/components/navigation/Pagination.astro`): same props as the old `blog/Pagination.astro` (`prevUrl, nextUrl, prevText?, nextText?`) so it's a drop-in swap.
- **SettingsPanel** (B3): theme switcher + effects controls, no modal wrapper. Sidebar's settings button uses `data-modal-open="settings"`; the lead wraps `SettingsPanel` in `<Modal id="settings">` in PageLayout.
- **Card** (A2, `~/components/content/Card.astro`): `{ title, href?, excerpt?, meta?: string, tags?: string[], image?: string, imageAlt?, headingLevel?: 2|3|4, class? }` built on `Panel`.
- **Callout** (A2): `{ tone?: 'note'|'tip'|'warn'|'err', title?, class? }`.
- **Effects runtime include** (A4): `~/components/effects/EffectsRuntime.astro` — loads the `[data-decode]` enhancer site-wide; included once in Layout.

### Shell contract (C1 implements, C2 consumes) — `src/lib/shell/types.ts`, byte-for-byte:

```ts
export type ShellTone = 'default' | 'ok' | 'warn' | 'err';

export interface ShellRoute {
  alias: string;
  label: string;
  href: string;
}

export interface ShellContext {
  print(out: string | string[], tone?: ShellTone): void;
  clear(): void;
  navigate(href: string): void;
  setTheme(id: string): void;
  setEffect(name: string, on: boolean): void;
  getEffects(): Record<string, boolean>;
  history: string[];
  commands: ShellCommand[];
  routes: ShellRoute[];
  themes: { id: string; label: string }[];
  currentTheme: () => string;
  identity: { name: string; handle: string; role: string; org: string };
}

export interface ShellCommand {
  name: string;
  aliases?: string[];
  description: string;
  usage?: string;
  hidden?: boolean;
  run(ctx: ShellContext, args: string[]): void | Promise<void>;
  complete?(args: string[], ctx: ShellContext): string[];
}

export type ShellHost = Omit<ShellContext, 'history' | 'commands'>;

export interface ShellEngine {
  run(line: string): Promise<void>;
  complete(line: string): string[];
  readonly history: string[];
  readonly commands: ShellCommand[];
}
```

`src/lib/shell/engine.ts` exports `createShell(host: ShellHost, extraCommands?: ShellCommand[]): ShellEngine`. Engine and commands are DOM-free (no `astrowind:config`, no `window`) so Vitest can run them.

### Collections (D2 defines in `src/content/config.ts`; D3 writes content)

- `docs` (`src/data/docs/**/*.md|mdx`): `{ title: string, description?: string, section: 'Getting started'|'Guides'|'Components'|'Reference', order: number, draft?: boolean }`. Route: `/docs/<id>`; `index.md` → `/docs`.
- `changelog` (`src/data/changelog/*.md`): `{ version: string, date: date, summary?: string, draft?: boolean }`.

## Wave 2 (pages) — what exists on main now

Import from barrels: `import { Panel, Button, Heading, Container, Prompt, Divider, Badge, Kbd, Icon } from '~/components/core'`, and likewise `~/components/{content,media,effects,forms,feedback,data,navigation,shell}`. **Read a component's Props before using it** — don't guess.

- core: Panel, Button (passes through extra attrs), Heading, Prompt, Divider, Badge, Kbd, Icon, **Container** `{as?, size?: prose|default|wide|full, spacing?: none|sm|md|lg}` — use it for every page's content width.
- content: Prose, CodeBlock, Blockquote, Card, TextBox, Callout, FactGrid
- media: Figure, CrtImage, AsciiFrame, Embed, Gallery
- effects: BootScreen (global), CrtOverlay (global), EffectsRuntime (global), DecoderText, Typewriter
- forms: Field, Select, Checkbox, Radio, RadioGroup, Toggle, Form, ContactForm
- feedback: Modal, Toaster (mounted once in PageLayout), Tooltip, Alert, Spinner; `toast()` from `~/lib/toast`; `openModal/closeModal` from `~/lib/modal`
- data: AsciiBar, Meter, ProgressBar, StatReadout, KeyValue, DataTable, LogStream (custom element exposes `appendLine(line)`; also listens for `terminal:log`), `setBarValue`
- navigation: SidebarNav, Footer, SettingsPanel (all global via PageLayout), Tabs, Accordion, AccordionItem, Breadcrumb, Pagination, ThemeSwitcher, EffectsControls
- shell: TerminalShell `{mode?: inline|fullscreen, prompt?, motd?, height?, autofocus?, initialCommands?}`
- Demo persona data: `~/data/profile.ts` (skills, facts, stack, now, uses). Blog/projects/docs collections are populated.
- Every group has `_demo/<Group>Demo.astro`.

## Page rules

- Wrap every page in `~/layouts/PageLayout.astro` with `metadata={{ title, description }}`. PageLayout already renders `<main id="main-content">` — **don't add another `<main>`**.
- Exactly **one `<h1>`** per page. Headings in order.
- Content width via `Container`. Mobile first; test 360px.
- **One signature moment per page** (spec "Design direction"); everything else quiet. No fade-up-on-scroll for every section, no hover lift on every card.
- Don't edit `tests/**` — V1 updates the e2e route list in Wave 3.
- If a component is missing a capability you need, **add a prop to it only if your prompt lists it as owned**; otherwise compose around it and put the request in your report.
