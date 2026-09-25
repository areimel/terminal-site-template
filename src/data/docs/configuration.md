---
title: Configuration
description: Customize site metadata, identity, and integrations.
section: Getting started
order: 2
---

Configuration lives in two files: `src/config.yaml` (site-wide settings) and `src/navigation.ts` (menu structure).

## src/config.yaml

The config file defines your site's identity, themes, effects, and integrations. Here's the template block:

```yaml
site: 'https://yourdomain.com'
metadata:
  title: 'My Terminal Site'
  description: 'A site built with the terminal template'

template:
  identity:
    name: 'Ada Operator'
    handle: 'ada'
    org: 'MAINFRAME-7 Systems'
    role: 'Systems Developer'
    tagline: 'Building reliable infrastructure'
    location: 'Sector 7, Grid North'

  social:
    - label: 'GitHub'
      href: 'https://github.com/example'
      icon: 'tabler:brand-github'
    - label: 'LinkedIn'
      href: 'https://linkedin.com/in/example'
      icon: 'tabler:brand-linkedin'

  themes:
    default: 'green'

  effects:
    boot: true
    noise: true
    scanline: true
    overlay: true
    decoder: true

  shell:
    prompt: 'guest@mainframe-7:~$'
    motd: 'Type help to list commands.'

  integrations:
    forms:
      provider: 'web3forms'
      accessKey: null
    gtm:
      id: null
    ga:
      id: null
```

### Identity fields

- **name** — Your full name or persona
- **handle** — Short name for terminal prompts (no spaces)
- **org** — Organization or company name
- **role** — Job title
- **tagline** — One-line description
- **location** — Geographic location or fictional sector

These appear in the footer, meta tags, and shell identity.

### Social links

Each entry is a platform link used in the footer and shell. Use Tabler icon names (e.g., `tabler:brand-github`, `tabler:brand-twitter`).

### Theme selection

Set `themes.default` to one of: `green`, `amber`, `red`, `yellow`, or `blue`. Users can override this in Settings.

### Effects toggles

Each effect can be enabled or disabled by default:

- **boot** — Boot sequence animation on page load
- **noise** — TV static noise overlay
- **scanline** — Scanline overlay effect
- **overlay** — CRT screen overlay
- **decoder** — Text decode animation

Users can toggle these in Settings. The `prefers-reduced-motion` media query disables all effects automatically.

### Shell configuration

- **prompt** — The shell prompt shown in the terminal (e.g., `user@host:~$`)
- **motd** — Message of the day shown on shell startup

### Integrations

**Forms:** Set `provider` to `web3forms` and add your `accessKey` to enable contact form submissions. Leave `accessKey` as `null` for demo mode (shows a success message without sending).

**Analytics:** Add your Google Tag Manager or Google Analytics IDs to enable tracking. Both are optional; `null` means tracking is off.

## src/navigation.ts

Navigation defines the main menu and footer links. The format is:

```typescript
export const mainNav: NavItem[] = [
  {
    label: 'Projects',
    href: '/projects',
    icon: 'tabler:briefcase',
  },
  {
    label: 'Blog',
    href: '/blog',
    icon: 'tabler:news',
  },
  {
    label: 'Docs',
    href: '/docs',
    icon: 'tabler:book',
  },
];

export const footerNav: NavItem[] = [
  {
    label: 'Privacy',
    href: '/privacy',
  },
  {
    label: 'Terms',
    href: '/terms',
  },
];
```

### NavItem properties

- **label** — Text shown in menus
- **href** — URL path
- **icon** (optional) — Tabler icon for the sidebar
- **shellAlias** (optional) — Command alias in the shell (e.g., `shellAlias: "home"` makes `/` accessible via `cd home`)

The sidebar, breadcrumb navigation, and shell's `ls` command all read from `mainNav`. Use icons liberally; they help visual scanning at a glance.
