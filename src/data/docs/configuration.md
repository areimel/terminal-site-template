---
title: Configuration
description: Customize site metadata, identity, and integrations.
section: Getting started
order: 2
---

Configuration lives in three files: `src/data/global-content/branding.yaml` (identity and site strings), `src/config.yaml` (site-wide settings), and `src/navigation.ts` (menu structure).

## Branding

Brand strings live in `src/data/global-content/branding.yaml`. This is the single place to rebrand your site. It defines the product name, company name, persona, and shell hostname, which automatically fill in defaults for site metadata and identity throughout the site.

Each branding key:

- **projectName** — Product name used for the site name, page titles, and Open Graph site_name.
- **projectSlug** — URL/package-safe form of the product name.
- **projectDescription** — One-sentence description, used as the default meta description.
- **companyName** — Short company name, used everywhere by default (identity.org, boot screen, demos).
- **companyDisplayName** — Dotted display form (optional; nothing uses it unless you reference it).
- **companyFullName** — Expanded company name.
- **personaName** — Persona name shown in the footer, boot log, and shell's `whoami`.
- **personaHandle** — Short handle (no spaces), shown by `whoami` and in the boot log.
- **shellHost** — Hostname in the shell prompt: `guest@<shellHost>:~$`.
- **author** — Author or copyright holder.

A value set explicitly in `src/config.yaml` still overrides the one derived from branding.yaml. For example, `template.shell.prompt` in `config.yaml` replaces the derived `guest@<shellHost>:~$`.

Use branding values in code with:

```typescript
import { BRANDING } from 'astrowind:config';

// projectName, projectSlug, projectDescription, companyName, companyDisplayName, companyFullName, personaName, personaHandle, shellHost, author
console.log(BRANDING.projectName); // "ARDA Terminal Framework"
```

Markdown content files can't read these variables, so brand names inside posts and docs are edited by hand.

## src/config.yaml

The config file defines your site's identity, themes, effects, and integrations. Here's the template block:

```yaml
site: 'https://yourdomain.com'

template:
  identity:
    role: 'Systems Developer'
    tagline: 'Building steady systems.'
    location: 'Sector 7, Grid North'

  social:
    - label: 'GitHub'
      href: 'https://github.com/example'
      icon: 'tabler:brand-github'
    - label: 'X'
      href: 'https://x.com/example'
      icon: 'tabler:brand-x'

  themes:
    default: 'green'

  effects:
    boot: true
    noise: true
    scanline: true
    overlay: true
    decoder: true

  shell:
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

- **role** — Job title or position
- **tagline** — One-line description
- **location** — Geographic location or fictional sector

These fields are optional. `name`, `handle`, and `org` default to `personaName`, `personaHandle`, and `companyName` from the branding file (see Branding above); set them here only to override.

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

- **motd** — Message of the day shown on shell startup (e.g., "Type help to list commands.")

- **prompt** — Optional. Defaults to `guest@<shellHost>:~$` from `src/data/global-content/branding.yaml`; set it here to override.

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
