# Terminal Site Template: De-personalize + Component Kit + Demo Pages

## Context

This repo is a copy of Alec's personal portfolio: Astro 5, AstroWind-derived, with an 80s CRT terminal aesthetic. The goal is a **fork/clone GitHub template** that other people can use to build **sites and web apps** with the same theme. To get there:

- strip every personal detail
- delete dead code and AstroWind leftovers
- consolidate duplicated code (DRY)
- add a full terminal-native component kit plus demo pages that show it off

**Decisions from brainstorming**

- **Audience:** sites and apps.
- **Distribution:** fork/clone.
- **Interactivity:** vanilla TS plus custom elements (no UI framework).
- **Themes:** a `themes.ts` registry.
- **Leftovers:** remove unused AstroWind code; reskin whatever is still needed.
- **Integrations:** configured in config, off by default.
- **Motion:** config toggles, plus automatic `prefers-reduced-motion` and a single "effects off" switch.
- **Placeholder identity:** a fictional retro persona.
- **Docs:** `/docs` holds real template docs.
- **Tests:** README + CUSTOMIZING guide + Playwright smoke tests.
- **Execution:** foundation first, then fan out; one git worktree per agent/team.

**Key findings from exploration**

- **Personal data (about 20 files):**
  - `src/config.yaml`
  - components: `HomeHero`, `PersonalFacts`, `Skills`, `Footer`, `Logo`, `SvgComponents/NameLogo*`, `ArdaLogo`
  - `pages/contact.astro`, `pages/index.astro`
  - 4 project MDX files plus `public/images/projects/*`, 2 blog posts
  - `public/preview*.png`
  - **Live GTM ID** `GTM-KX6H9NQ` (`common/GoogleTagManager*.astro`)
  - **Web3Forms key** hard-coded in 3 form components
  - README, `project-docs/*`
- **Theme bugs:**
  - The theme list is hard-coded in 5 places: `ApplyColorMode`, `BasicScripts`, `ThemeSwitcher` (twice), `Layout`.
  - `localStorage.theme` collides with AstroWind's dark/light key.
  - `CustomStyles.astro` contains inconsistent variable sets and unused `--amber*` variables.
- **Duplication:**
  - 3 contact forms
  - `ButtonLink`/`TextLink`
  - two copies of the facts-grid CSS
  - the card style repeated 4 times
  - two loading screens
  - two CRT implementations
  - `ProjectHeader`/`ProjectQuickFacts`
  - two Headline components
  - nav links hard-coded in 3 places while `navigation.ts` still holds AstroWind demo data
- **Dead code:**
  - `AnimationWrapper`, `DecoderText` (never rendered), `TerminalComponents/LoadingScreen`
  - `NavComponents/SidebarNav` plus `SidebarOptions`, `SidebarButton`, `ExtraMenu`, `QRCode`, `ContactFormSmall`
  - `MouseToolTip`, `ProjectStatsWrapper`, `ProjectQuickFacts`, `NameLogoV1R2`/`V2`
  - `LandingLayout`, most of `widgets/` and `ui/`, `ToggleTheme`, `SplitbeeAnalytics`, `SiteVerification`
- **Config** loads through `vendor/integration` (the `astrowind:config` virtual module, `utils/configBuilder.ts`). Extend it; don't replace it.
- **Route collision risk:** posts and projects both use the `/%slug%` permalink. Move them to `/blog/%slug%` and `/projects/%slug%` so `/docs`, `/app` and `/components` stay safe.
- **Broken preloads** in `common/CommonMeta.astro`. A FontFace name mismatch in `LoadingScreenV1` registers each font twice.

---

## Design direction (from frontend-design)

The brief already fixes the look (80s lo-fi terminal), so these rules keep it from feeling templated:

- **One signature moment per page:**
  - Home: boot sequence into a name that decodes.
  - Landing: a live shell in the hero.
  - Dashboard: a streaming log.
  - Everything else stays quiet.
- **Type:**
  - UAV OSD Mono for display and headings; Kode Mono for UI and body.
  - VT323 only for large ASCII/display moments.
  - Modular scale (1.25) defined once as Tailwind tokens.
  - Prose measure capped at 72ch.
- **Structure carries information:**
  - A Panel title bar gives the window or file name (`~/projects/readme.txt`).
  - Borders encode hierarchy: `double` for app windows, `line` for content, `ascii` for callouts.
  - Numbering only appears on real sequences (Timeline, Steps).
  - All-caps is limited to system status strings (`OK`, `ERR`, `WARN`).
- **Motion:**
  - Effects are centralized, and each can be switched off.
  - Reduced motion disables everything except state feedback (toggles, toasts).
- **Copy voice:** a plain system voice.
  - CTAs name the action ("Send message"; a successful send shows "Message sent").
  - Errors say what failed and how to fix it.
- **Quality floor:** visible focus rings (glow outline), keyboard support in every interactive element, mobile down to 360px, axe-clean.

---

## Architecture (the contracts every team codes against)

### Folder layout (new; the old folders are removed)

```
src/components/
  core/        Panel, Button, Heading, Prompt, Divider, Badge, Kbd, Icon wrapper
  content/     Prose, CodeBlock, Blockquote, Callout, Card, TextBox, FactGrid
  media/       Figure, AsciiFrame, CrtImage, Embed, Gallery
  effects/     BootScreen, CrtOverlay, DecoderText, Typewriter
  forms/       Field, Select, Checkbox, Radio, Toggle, Form, ContactForm
  feedback/    Modal, Toast, Tooltip, Alert, Spinner, ProgressBar
  data/        DataTable, StatReadout, Meter, KeyValue, LogStream
  navigation/  SidebarNav, Footer, Tabs, Accordion, Breadcrumb, Pagination, SettingsModal, ThemeSwitcher, EffectsControls
  sections/    Hero, FeatureGrid, CTA, FAQ, Timeline, Testimonial, PricingTable
  shell/       TerminalShell (custom element) + styles
  blog/ projects/ docs/   content-type specific (reskinned, share ArticleShell)
  common/      Metadata, CommonMeta, Analytics (config-gated), ThemeHead
  <group>/_demo/<Group>Demo.astro   every group ships a demo, rendered by /components and /docs
src/lib/
  themes.ts          registry
  theme-runtime.ts   apply/persist/events (client)
  effects.ts         effects state + reduced-motion (client)
  shell/             engine.ts, commands.ts, types.ts
  forms.ts           provider submit helper
  toast.ts           toast() API
src/data/
  profile.ts         persona, skills, facts, stack (typed; replaces arrays in components)
  post/ projects/ docs/ changelog/   collections
```

- Add the alias `@lib/*` → `src/lib/*` in `tsconfig.json`.
- Styling uses Astro `class:list` (no new dependency).
- Custom events are namespaced `terminal:*`.

### Theme registry (`src/lib/themes.ts`)

```ts
export interface TerminalTheme {
  id: string;
  label: string;
  colors: {
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    bright: string;
    bgPrimary: string;
    bgSecondary: string;
    bgAccent: string;
    accent: string;
    accentBright: string;
    glow: string;
  };
  font?: 'kode' | 'uav' | 'vt323';
}
export const themes: TerminalTheme[]; // green, amber, red, yellow, blue (ported from CustomStyles)
export const defaultThemeId: string; // from config `template.themes.default`
```

- `common/ThemeHead.astro` loops over `themes` and emits `.theme-{id}{--theme-*}`. It keeps the existing `--theme-*` and `--terminal-*` names and the Tailwind `terminal-*` classes, so current markup keeps working.
- It also contains an inline no-flash script with storage key `terminal-theme`.
- It replaces `CustomStyles.astro` and `ApplyColorMode.astro`, and the theme logic in `BasicScripts` and `Layout`.
- `theme-runtime.ts` exports `applyTheme(id)`, `getTheme()`, `cycleTheme()` and dispatches `terminal:theme-change`.

### Effects (`src/lib/effects.ts`)

- State: `{ boot, noise, scanline, overlay, decoder, all }`.
- Defaults come from config; user overrides are stored in `localStorage['terminal-effects']`.
- It is applied before paint as `<html data-fx-noise="off">` and so on. CSS hides effects with `[data-fx-*="off"]`, and the reduced-motion media query sets all of them off.
- API: `isEnabled(name)`, `setEffect(name, on)`, event `terminal:effects-change`.

### Config (`src/config.yaml` + `vendor/integration/utils/configBuilder.ts`)

Add a `template:` block with typed defaults:

```yaml
template:
  identity:
    { name: Ada Operator, handle: ada, org: MAINFRAME-7 Systems, role: Systems Developer, tagline: ..., location: ... }
  social: [{ label: GitHub, href: 'https://github.com/example', icon: tabler:brand-github }]
  themes: { default: green }
  effects: { boot: true, noise: true, scanline: true, overlay: true, decoder: true }
  shell: { prompt: 'guest@mainframe-7:~$', motd: 'Type help to list commands.' }
  integrations: { forms: { provider: web3forms, accessKey: null }, gtm: { id: null }, ga: { id: null } }
```

- Export the new block as `TEMPLATE` from `astrowind:config`.
- Remove the AstroWind `ui.theme` dark/light setting.
- Change permalinks to `/blog/%slug%` and `/projects/%slug%`.

### Navigation (`src/navigation.ts`)

One `NavItem[] { label, href, icon, shellAlias? }` list, plus a footer list. The sidebar, footer, breadcrumb and the shell's `ls`/`cd` all read from it.

### Core primitive props (Wave 0 builds these; everyone reuses them)

- `Panel { as?, title?, variant?: 'line'|'double'|'ascii'|'none', tone?: 'default'|'accent'|'muted', padding?: 'none'|'sm'|'md'|'lg', class? }`
  - Named slots `actions` and `footer`.
  - Replaces the 4 duplicated card styles.
- `Button { href?, modalId?, type?, variant?: 'solid'|'outline'|'ghost'|'link', size?: 'sm'|'md'|'lg', prompt?: boolean, disabled?, class? }`
  - Merges `ButtonLink` and `TextLink`.
- `Heading { level: 1-6, as?, prompt?: boolean, decode?: boolean, glow?: 'none'|'subtle'|'strong' }`
- `Prompt { symbol?: string, blink?: boolean }`
  - Replaces `TerminalPrefix`.
- Also: `Divider { style?: 'line'|'ascii'|'dashed', label? }`, `Badge { tone?: 'default'|'ok'|'warn'|'err', variant? }`, `Kbd`.
- Tailwind `typography` is themed as `prose-terminal`, so `Prose` and docs work before Wave 1.

### Shell contract (`src/lib/shell/types.ts`)

```ts
export interface ShellContext {
  print(out: string | string[], tone?: 'default' | 'ok' | 'warn' | 'err'): void;
  clear(): void;
  navigate(href: string): void;
  setTheme(id: string): void;
  history: string[];
  commands: ShellCommand[];
}
export interface ShellCommand {
  name: string;
  aliases?: string[];
  description: string;
  usage?: string;
  hidden?: boolean;
  run(ctx: ShellContext, args: string[]): void | Promise<void>;
  complete?(args: string[]): string[];
}
```

- Built-in commands: `help ls cd open theme effects clear whoami echo date history`.
- Users add commands in `src/lib/shell/commands.ts`.
- `<terminal-shell>` has two modes: `inline` (embedded in a Panel) and `fullscreen` (`/terminal`).
- Keybindings: Up/Down for history, Tab to complete, Ctrl+L to clear.

### Routes after the work

| Route                                         | Status                              |
| --------------------------------------------- | ----------------------------------- |
| `/`                                           | portfolio home                      |
| `/projects`, `/projects/[slug]`               | reskinned                           |
| `/blog`, `/blog/[slug]`, `/blog/category/[c]` | reskinned                           |
| `/docs/[...slug]`                             | new: template docs                  |
| `/components`                                 | new gallery; replaces `/styleguide` |
| `/app`                                        | new dashboard demo                  |
| `/terminal`                                   | new: full-screen shell              |
| `/landing`                                    | new: product landing                |
| `/pricing`                                    | rebuilt                             |
| `/changelog`                                  | new, from a collection              |
| `/contact`                                    | rebuilt                             |
| `/now`, `/uses`                               | new                                 |
| `/404` ("segmentation fault")                 | rebuilt                             |
| `/privacy`, `/terms`                          | generic                             |
| `/rss.xml`                                    | kept                                |
| `/about`, `/services`, `/styleguide`          | removed                             |

---

## Execution: 4 waves, 25 agents total

A TODO list tracks every item below.

- Each Wave 1 and Wave 2 agent runs with `isolation: "worktree"` and gets a strict file-ownership list. It creates files only in its owned folders and must not edit shared files. Anything that needs a shared-file change is reported back to the lead.
- The lead (me) merges branches at the end of each wave, resolves conflicts, runs `pnpm install && pnpm run build && pnpm run check`, and commits.
- Each agent's definition of done:
  - its components have typed Props
  - a `_demo/<Group>Demo.astro` exists
  - `pnpm run check:astro` and `pnpm run build` pass in its worktree
  - keyboard and reduced-motion behavior have been checked

**Step 0 (lead):** copy this plan to `docs/superpowers/specs/2026-09-25-terminal-template-design.md`, commit it, and create the TODO list.

### Wave 0: Foundation (3 agents; sequential merges; nothing else starts until it's green)

| Agent                         | Model  | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1 Theme and effects core     | Sonnet | `lib/themes.ts`, `lib/theme-runtime.ts`, `lib/effects.ts`, `common/ThemeHead.astro`, `Layout.astro`, `tailwind.config.js` (type scale, `prose-terminal`), `assets/styles/*`, `styles/*`. It also deletes `CustomStyles`/`ApplyColorMode` theme logic and fixes the `CommonMeta` preloads and the font-name mismatch.                                                                                                                                                                                                            |
| F2 Config, nav and primitives | Sonnet | `vendor/integration/**`, `config.yaml`, `navigation.ts`, `tsconfig.json`, `components/core/**` with `_demo`, `PageLayout.astro`, `MarkdownLayout.astro`, and the permalink change in `utils/permalinks.ts`                                                                                                                                                                                                                                                                                                                      |
| F3 De-personalize and prune   | Haiku  | Removes every item on the personal-data and dead-code lists above. It covers `package.json` (name, description, author placeholder), `public/preview*`, `public/images/projects/*`, `project-docs/`, the demo pages `about`/`services`, `LandingLayout` and unused `widgets`/`ui`. It deletes the GTM and Web3Forms literals, leaving temporary stubs, and stubs out personal text. Its last step is a grep sweep for `alec`, `reimel`, `areimel`, `arda`, `GTM-KX6H9NQ` and the Web3Forms key; the sweep must come back empty. |

F1 and F2 run in parallel (their files don't overlap). F3 runs after both merge, because it touches files they rewire.

### Wave 1: Component kit, engines and content (14 agents in 5 teams, all parallel)

**Team A: Content, media and effects**

- A1 (Sonnet): `content/` typography (Prose, CodeBlock with a copy button, Blockquote).
- A2 (Sonnet): `content/` boxes (Card, TextBox, Callout, FactGrid).
  - FactGrid generalizes `PersonalFacts` and `ProjectStats`.
- A3 (Haiku): `media/` (Figure, AsciiFrame, CrtImage via CSS filter plus scanline mask, Embed, Gallery).
- A4 (Sonnet): `effects/`.
  - BootScreen merges `LoadingScreenV1` and the old LoadingScreen; its boot lines come from config.
  - CrtOverlay is the new home of TerminalOverlay.
  - DecoderText is actually wired up this time; plus Typewriter.
  - Every effect is gated by `lib/effects.ts`.

**Team B: Interactive UI**

- B1 (Sonnet): `forms/` + `lib/forms.ts`.
  - Field, Select, `[x]` Checkbox, `(*)` Radio, Toggle, Form, and a `ContactForm variant="full|compact|modal"` that replaces the 3 old forms.
  - The provider key comes from config. When there is no key, the form shows a demo-mode notice.
- B2 (Sonnet): `feedback/` + `lib/toast.ts`.
  - Modal (refactored: `data-modal-open`/`data-modal-close` attributes instead of `window.*` globals), Toast, Tooltip, Alert, Spinner (ASCII spinner frames), ProgressBar (`[#####-----]`).
- B3 (Sonnet): `navigation/`.
  - SidebarNav (from V2, driven by `navigation.ts`), Footer, SettingsModal (ThemeSwitcher + EffectsControls, driven by the registry), Tabs, Accordion, Breadcrumb, Pagination.
- B4 (Sonnet): `data/` (sortable DataTable, StatReadout, Meter, KeyValue, LogStream custom element).

**Team C: Shell**

- C1 (Sonnet): `lib/shell/**` (engine: parse, dispatch, history, completion; the built-in commands).
  - Pure TS with Vitest unit tests.
  - Adds the `vitest` dev dependency. This is the only `package.json` edit in the wave.
- C2 (Sonnet): `components/shell/TerminalShell.astro`, the custom element that implements the UI side of the `ShellContext` contract (both modes, a11y via an `aria-live` log).

**Team D: Content types and demo content**

- D1 (Sonnet): `blog/`, `projects/`, `pages/[...blog]`, `pages/[...projects]`.
  - Reskins them onto core primitives.
  - A shared `ArticleShell` for SinglePost and ProjectPost; ProjectHeader absorbs QuickFacts.
  - RelatedPosts no longer depends on AstroWind widgets.
- D2 (Sonnet): the `docs` and `changelog` collections in `content/config.ts`, `components/docs/` (DocsLayout with a file-tree sidebar, TOC, prev/next), `pages/docs/**`, `pages/changelog.astro`.
- D3 (Haiku): all content under `src/data/**`.
  - `profile.ts` persona "Ada Operator / MAINFRAME-7 Systems".
  - 3 projects, 3 posts, 2 changelog entries.
  - Docs Markdown: getting-started, config, theming, effects, shell-commands, components, forms and integrations, deploying.
  - Plain Markdown only; MDX component embeds come in Wave 2.

**Team E: QA infrastructure**

- E1 (Sonnet): `tests/**`, `playwright.config.ts`.
  - Tests cover the route list above:
    - every route returns 200 with no console errors
    - the theme persists across navigation
    - the effects toggle persists
    - shell commands `help`, `cd projects`, `theme amber`
    - the contact form's demo mode
    - an axe scan on each route
  - Adds `@playwright/test` and `@axe-core/playwright`; script `test:e2e`.
  - Routes that don't exist yet are marked `test.fixme` until Wave 2.

### Wave 2: Sections and pages (5 agents, parallel)

- P1 (Sonnet): `pages/index.astro` home (bento built from Card/FactGrid/Heading, driven by `profile.ts`, boot plus decoded name as the signature moment), `/now`, `/uses`.
- P2 (Sonnet): `sections/` (Hero with variants `split|terminal|minimal`, FeatureGrid, CTA, FAQ on Accordion, Timeline, Testimonial as a log quote, PricingTable) with `_demo`; `/landing` (live shell in the hero) and `/pricing`.
- P3 (Sonnet): `/contact`, `/404` (segfault plus core dump, `cd ~` link), `/privacy`, `/terms`, `/terminal`, and MDX component embeds in the docs and projects content.
- P4 (Sonnet): `/components` gallery. It composes every `_demo/*Demo.astro` with a sticky Tabs index and code snippets, and replaces `/styleguide` and `ColorPalette`.
- P5 (Sonnet): `/app` dashboard.
  - Layout: split panes; StatReadouts; Meters; a DataTable of processes; a LogStream (the signature moment); a Toast on actions; Tabs.
  - Responsive: it collapses to a single column.

### Wave 3: Integration and verification (3 agents + lead)

- V1 (Sonnet): run `pnpm run test:e2e`, remove the `fixme`s, fix failures, and take Playwright screenshots of every route in 2 themes at 360px and 1280px for lead review.
- V2 (`feature-dev:code-reviewer`, Sonnet): DRY and quality audit.
  - Check for leftover duplicated styles or components, unused files, hard-coded theme names, props that are declared but unused, and focus/keyboard gaps.
  - Findings are fixed by the lead or sent back to V1.
- V3 (Haiku): `README.md` (quick start, rebrand in 5 steps, deploy to Netlify/Vercel, credits to AstroWind and onWidget), `CUSTOMIZING.md` (add a theme, add a shell command, add a component demo, toggle effects, enable integrations), and updates to `CLAUDE.md` for the new structure.
- Lead:
  - Run the final personal-data grep sweep again.
  - Review screenshots against the design direction and cut one accessory per page.
  - Run `pnpm run check` and the build.
  - Make the final commit.

**Agent count:** 3 + 14 + 5 + 3 = **25** (19 Sonnet, 4 Haiku, plus 1 reviewer and the lead).

---

## Verification

1. `pnpm install && pnpm run build`: builds every route with no warnings about missing imports.
2. `pnpm run check`: Astro check, ESLint and Prettier are clean.
3. `pnpm exec vitest run`: shell engine unit tests.
4. `pnpm run test:e2e`: route smoke tests, theme and effects persistence, shell commands, axe with no serious violations.
5. Personal-data sweep: `rg -i "alec|reimel|areimel|arda|GTM-KX6H9NQ|75f8b211"` over the repo (excluding `.git`) returns nothing.
6. Manual pass with Playwright MCP:
   - switch themes on `/components` and confirm every demo re-themes
   - with OS reduced motion on, confirm there's no boot screen, CRT or decoder
   - `/app` works with the keyboard only
   - `/terminal` supports Tab completion and history
7. Fork test: change `template.identity` and `themes.default` in `config.yaml`, rebuild, and confirm that the name, footer, meta, shell prompt and default theme all update with no code edits.
