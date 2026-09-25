# Terminal Site Template

A retro 80s lo-fi terminal-themed [Astro 5](https://astro.build) template for building sites and web apps with a distinctive CRT aesthetic. It's built to be forked: strip the placeholder persona, edit a config file, and ship your own site on the same component kit.

**What's included**

- **5 color themes** (green, amber, red, yellow, blue), switchable at runtime and persisted across visits
- **Visual effects** (boot sequence, CRT noise, scanline, screen overlay, text-decode), each independently toggleable and fully disabled under `prefers-reduced-motion`
- **A themed component kit** — around 60 components across 10 groups (core, content, media, effects, forms, feedback, data, navigation, sections, shell), each documented live on `/components`
- **An interactive terminal shell** (`<terminal-shell>`) with built-in commands, history, and Tab completion — embeddable inline or full-screen at `/terminal`
- **Docs** at `/docs`, generated from a content collection
- **Demo pages**: a dashboard (`/app`), a product landing page (`/landing`), and a pricing page (`/pricing`)
- **Blog and projects** collections with category pages and RSS
- **Tests**: Playwright e2e smoke tests (routes, theme/effects persistence, shell commands, axe scans) plus Vitest unit tests for the shell engine

## Quick start

Requires Node (see `engines` in `package.json`; Node 20+ is a safe bet) and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev          # http://localhost:4321, reloads on save
pnpm build        # static build to dist/
pnpm preview      # serve the production build locally
pnpm check        # Astro check + ESLint + Prettier, all read-only
pnpm test         # Vitest (shell engine unit tests)
pnpm test:e2e     # Playwright smoke tests (route, theme, effects, shell, a11y)
```

`pnpm fix` runs ESLint and Prettier with `--fix`/`--write`.

## Make it yours in 5 steps

1. **Set your identity and defaults in `src/config.yaml`.** Edit `template.identity` (name, handle, org, role, tagline, location), `template.social` (links shown in the footer and shell), `site` and `metadata` (domain, title, description), and `template.themes.default` / `template.effects` for the theme and motion a first-time visitor sees.
2. **Replace the favicon.** Swap the files in `src/assets/favicons/` (`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`).
3. **Replace the content in `src/data/`.** Persona data lives in `src/data/profile.ts` (skills, facts, stack, now/uses); blog posts in `src/data/post/`; projects in `src/data/projects/`. Docs (`src/data/docs/`) and the changelog (`src/data/changelog/`) are yours to keep, edit, or delete.
4. **Delete the demo pages you don't need.** None of these are required by the rest of the site:
   - `src/pages/landing.astro` and `src/pages/pricing.astro` — both build on the shared `src/components/sections/` group (Hero, FeatureGrid, CTA, FAQ, Timeline, Testimonial, PricingTable); only remove that folder if you're dropping both pages and nothing else uses them.
   - `src/pages/app.astro` — its dashboard-only pieces live in `src/components/app/` (safe to delete together).
   - `src/pages/now.astro`, `src/pages/uses.astro` — read from `src/data/profile.ts`; delete the page and its data, or leave both and edit the data.
5. **Pick your default theme and effects.** `template.themes.default` in `src/config.yaml` is one of `green | amber | red | yellow | blue` (see `src/lib/themes.ts` to add your own — recipe in `CUSTOMIZING.md`). `template.effects` sets the boot/noise/scanline/overlay/decoder defaults; visitors can still override them, and reduced motion always wins.

See [`CUSTOMIZING.md`](./CUSTOMIZING.md) for task-by-task recipes (add a theme, add a shell command, add a component, wire up forms/analytics, and more), and [`/docs`](http://localhost:4321/docs) once the dev server is running for the full guide.

## Project structure

```
src/
├── assets/           # Favicons, images, fonts CSS, global styles
├── components/
│   ├── core/         # Panel, Button, Heading, Prompt, Divider, Badge, Kbd, Icon, Container
│   ├── content/       # Prose, CodeBlock, Blockquote, Card, TextBox, Callout, FactGrid
│   ├── media/         # Figure, AsciiFrame, CrtImage, Embed, Gallery
│   ├── effects/       # BootScreen, CrtOverlay, EffectsRuntime, DecoderText, Typewriter
│   ├── forms/         # Field, Select, Checkbox, Radio, RadioGroup, Toggle, Form, ContactForm
│   ├── feedback/      # Modal, Toaster, Tooltip, Alert, Spinner
│   ├── data/           # AsciiBar, Meter, ProgressBar, StatReadout, KeyValue, DataTable, LogStream
│   ├── navigation/    # SidebarNav, Footer, SettingsPanel, Tabs, Accordion, Breadcrumb, Pagination, ThemeSwitcher, EffectsControls
│   ├── sections/      # Hero, FeatureGrid, CTA, FAQ, Timeline, Testimonial, PricingTable
│   ├── shell/          # TerminalShell (custom element)
│   ├── blog/ projects/ article/ docs/   # content-type specific components
│   ├── app/            # /app dashboard demo pieces
│   ├── gallery/        # /components page internals (auto-discovery, palette)
│   └── <group>/_demo/  # every group ships a demo, rendered on /components
├── content/           # Collection schemas (src/content/config.ts)
├── data/
│   ├── profile.ts     # persona: skills, facts, stack, now, uses
│   ├── post/          # blog posts (Markdown)
│   ├── projects/      # projects (MDX)
│   ├── docs/           # template docs (Markdown/MDX)
│   └── changelog/      # release notes (Markdown)
├── layouts/           # Layout.astro, PageLayout.astro, DocsLayout.astro, MarkdownLayout.astro
├── lib/
│   ├── themes.ts        # theme registry
│   ├── theme-runtime.ts # apply/persist/cycle theme, `terminal:theme-change`
│   ├── effects.ts        # effects state, reduced-motion, `terminal:effects-change`
│   ├── modal.ts          # data-modal-open/close contract, openModal()/closeModal()
│   ├── toast.ts          # toast()
│   ├── forms.ts          # Web3Forms submit helper
│   └── shell/            # types.ts, engine.ts, builtins.ts, commands.ts (yours to extend), parse.ts
├── pages/             # file-based routing
├── styles/            # fonts.css and global CSS
├── utils/             # permalinks, images, frontmatter plugins
└── navigation.ts      # mainNav, footerNav, socialLinks
```

`vendor/integration/` is the `astrowind:config` virtual module (extends `src/config.yaml` with typed defaults — see `vendor/integration/utils/configBuilder.ts`); leave it alone unless you're adding a new config field.

## Deploying

Config for both is already in the repo:

- **Netlify** — `netlify.toml` (publishes `dist/`, sets asset cache headers)
- **Vercel** — `vercel.json` (clean URLs, asset cache headers)

Build with `pnpm build`; the static output goes to `dist/`. See `/docs/deploying` for environment variables (forms, analytics) and a pre-launch checklist.

## Credits

Built on [AstroWind](https://github.com/onwidget/astrowind) by [onWidget](https://onwidget.com) (MIT).

Fonts (verify each one's license before commercial use): Share Tech Mono, VT323, Kode Mono, UAV OSD Mono, UAV OSD Sans, Windows Command Prompt, Vermin Vibes 1989, Nasalization, Computerfont — bundled in `public/fonts/`, declared in `src/styles/fonts.css`.

## License

MIT — see [`LICENSE.md`](./LICENSE.md).
