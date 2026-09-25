# Shared agent brief (Waves 1–3)

Read this file fully, then the spec at `docs/superpowers/specs/2026-09-25-terminal-template-design.md` ("Design direction" + "Architecture").

## Setup (every agent, in your worktree, Git Bash)
```bash
git merge main --no-edit          # your worktree branch starts from an old commit — do this first
cp "C:/Users/Alec/Documents/Dev/Personal-Repos/terminal-site-template/pnpm-lock.yaml" .
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
