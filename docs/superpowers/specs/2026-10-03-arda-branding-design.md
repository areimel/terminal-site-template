# ARDA branding + `global-content/branding.yaml`

## Context

The template ships with placeholder branding: the fictional org **MAINFRAME-7** (site name, SEO title, `identity.org`, shell prompt `guest@mainframe-7`, `/app` console, demos, posts, docs; 35 hits / 19 files), the demo persona **Ada Operator / `ada`** (~9 hits), and the project name **Terminal Site Template** (`package.json`, README, LICENSE, getting-started docs). The user wants it rebranded as **ARDA Terminal Framework**, under their agency **ARDA (Advanced Research & Development Agency)**. All high-level brand strings should come from one YAML file, `src/data/global-content/branding.yaml`, so a fork can rebrand in one edit.

Much of this is already config-driven: `src/config.yaml` goes through `vendor/integration/utils/configBuilder.ts` into the `astrowind:config` virtual module (`SITE.name`, `METADATA.title`, `TEMPLATE.identity`, `TEMPLATE.shell.prompt`). BootScreen, Footer, DataDemo, Testimonial and TypographyDemo already read `TEMPLATE.identity`. **Decision: `branding.yaml` becomes the source of truth**, and config defaults are derived from it.

## Decisions (from Q&A)

| Topic                | Decision                                                                                                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mapping              | MAINFRAME-7 / "MAINFRAME-7 Systems" becomes **ARDA**. Site name "MAINFRAME-7 Terminal" becomes **ARDA Terminal Framework**. Shell prompt becomes `guest@arda:~$`.                      |
| Persona              | "Ada Operator" / `ada` becomes **Field Agent** / `agent`.                                                                                                                              |
| Dotted form          | `companyDisplayName: A.R.D.A.` is available but opt-in; `ARDA` is the default everywhere.                                                                                              |
| Source of truth      | `branding.yaml` is loaded by the existing integration and exposed as `BRANDING` from `astrowind:config`. `config.yaml` drops its duplicated brand strings but can still override them. |
| Markdown/MDX content | Plain text replace (no token system).                                                                                                                                                  |
| Meta files           | README, CUSTOMIZING, CLAUDE.md, `package.json` (name/description/author), LICENSE, and the historical specs in `docs/superpowers` are all renamed.                                     |
| Author               | `package.json` author is "Alec Reimel (ARDA)". LICENSE reads "Copyright (c) 2026 ARDA (Advanced Research & Development Agency)".                                                       |
| Description          | "A retro terminal-themed framework for building sites and web apps with Astro."                                                                                                        |

## Design

### 1. `src/data/global-content/branding.yaml` (new)

Flat camelCase keys, matching the user's `projectName` example, with a short comment per key:

```yaml
projectName: ARDA Terminal Framework
projectSlug: arda-terminal-framework
projectDescription: A retro terminal-themed framework for building sites and web apps with Astro.
companyName: ARDA # short form used everywhere by default
companyDisplayName: A.R.D.A. # dotted form, opt-in display use
companyFullName: Advanced Research & Development Agency
personaName: Field Agent # demo persona (footer, boot log, whoami)
personaHandle: agent
shellHost: arda # shell prompt becomes guest@<shellHost>:~$
author: Alec Reimel
```

### 2. Integration plumbing (`vendor/integration/`)

Extend the existing pattern; don't replace it.

- **`index.ts`**
  - Add an option `branding = 'src/data/global-content/branding.yaml'`.
  - Load it with the existing `loadConfig` and `addWatchFile` it.
  - Pass it to `configBuilder(rawConfig, rawBranding)`.
  - Emit `export const BRANDING = …` from the virtual module.
- **`utils/configBuilder.ts`**
  - Add a `BrandingConfig` type and `getBranding(raw)`, which uses `lodash.merge` over built-in defaults (the values above).
  - `getSite`, `getMetadata` and `getTemplate` take `branding` and derive their _defaults_ from it. User `config.yaml` values still merge over those defaults:
    - `SITE.name` comes from `projectName`.
    - `METADATA.title.default` is `projectName`, the title template is `'%s | ' + projectName`, and `openGraph.site_name` and `description` come from `projectName` and `projectDescription`.
    - `TEMPLATE.identity.org` is `companyName`; `identity.name` and `identity.handle` come from `personaName` and `personaHandle`.
    - `TEMPLATE.shell.prompt` is `` `guest@${shellHost}:~$` ``.
- **`types.d.ts`**: declare `export const BRANDING: BrandingConfig`.
- **`src/config.yaml`**: remove `site.name`, `metadata.title`, `metadata.description`, `openGraph.site_name`, `identity.name`/`handle`/`org` and `shell.prompt`. Leave a comment pointing to `branding.yaml` and noting that a value set here still overrides it.

### 3. Component/page consumers (hard-coded strings become variables)

Import `BRANDING` or `TEMPLATE` from `astrowind:config`:

- `src/pages/app.astro`: the page description uses `BRANDING.companyName`.
- `src/components/app/data.ts`: the `Cluster` value uses `BRANDING.companyName`.
- `src/components/content/_demo/BoxesDemo.astro`: the excerpt and callout use `companyName`, and `ADA-01` becomes `` `${personaHandle.toUpperCase()}-01` ``.
- `src/components/core/_demo/CoreDemo.astro`: the Prompt symbol uses `TEMPLATE.shell.prompt`.
- `src/components/media/_demo/MediaDemo.astro`: the ASCII label becomes `` `[${companyName}]` `` (check the visual alignment).
- Comments and JSDoc (`TerminalShell`, `Testimonial`, `SectionsDemo`, `BoxesDemo`, `DataDemo`, `app/data.ts`, `LogStream`, `log-demo.ts`): update the examples to ARDA/`agent`, or point at `branding.yaml`. Generic lowercase "mainframe" in log-demo descriptions stays if it describes log style rather than the brand.
- The Footer can optionally show `companyDisplayName`. Not by default; keep `© {year} {identity.name}`.

### 4. Plain-text replacements

- Content: `src/data/post/shipping-status-page-on-budget.md`, `field-guide-terminal-typography.md`, `src/data/docs/effects.mdx` (`MAINFRAME-7 SYSTEMS` becomes `ARDA SYSTEMS`, and the boot text mention), `src/data/docs/configuration.md` (also gains a "Branding" section documenting `branding.yaml`), and `getting-started.md` (repo name becomes `arda-terminal-framework`).
- Meta files:
  - README title becomes "ARDA Terminal Framework".
  - CUSTOMIZING gets a new "Rebrand" recipe pointing to `branding.yaml`.
  - CLAUDE.md: the "What this is" line, plus the Config section documenting `BRANDING` and `branding.yaml`.
  - `package.json` name, description and author.
  - LICENSE.
  - `playwright.config.ts` comment.
  - `docs/superpowers/specs/2026-09-25-terminal-template-design.md`.
- Persona location "Sector 7, Grid North" stays (persona flavor, not brand).

### 5. Tests

- `src/lib/shell/engine.test.ts`: update the fixture to Field Agent / `agent` / ARDA, and the expected `whoami` string.
- `tests/e2e/contact.spec.ts`: fill with `Field Agent` / `agent@example.com`.
- Grep `tests/` for any title or brand assertions; none were found besides contact.

## Execution (parallel workstreams, Sonnet/Haiku subagents)

0. **Me, first:** write this spec to `docs/superpowers/specs/2026-10-03-arda-branding-design.md`, create `branding.yaml`, and do the integration plumbing (section 2), since every other stream depends on `BRANDING` existing. Run `pnpm check:astro` to confirm the types.
1. **In parallel, after step 0:**
   - **A (Sonnet):** component/page consumers (section 3).
   - **B (Haiku):** content Markdown/MDX replacements, plus the Branding section in `configuration.md`.
   - **C (Haiku):** meta files (README, CUSTOMIZING recipe, CLAUDE.md, `package.json`, LICENSE, playwright comment, historical spec).
   - **D (Haiku):** tests (section 5).
2. **Me:** run a final grep sweep for `MAINFRAME|mainframe-7|\bAda\b|\bADA\b|ada@|Terminal Site Template|terminal-site-template` (expected: no brand hits; only intentional generic "mainframe" wording), then verify.

## Verification

- `pnpm check` (astro + eslint + prettier)
- `pnpm test` (shell engine with the new whoami string)
- `pnpm build`, then grep `dist/` for "MAINFRAME" and "Ada" (expect 0) and confirm `<title>` contains "ARDA Terminal Framework".
- `pnpm test:e2e` (route smoke, contact form, axe)
- Manual: `pnpm dev`, check the boot screen (ARDA BIOS), footer, `/app`, `/components`, and the shell `whoami` (`Field Agent (@agent), … at ARDA`). Then change `projectName` in `branding.yaml` and confirm the title and site name update on reload, which proves the single-source edit works.
