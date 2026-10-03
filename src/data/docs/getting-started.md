---
title: Getting started
description: Set up a new terminal site in minutes.
section: Getting started
order: 1
---

This template is built with Astro 5 and requires Node 20 or later. Follow these steps to get your site running.

## Prerequisites

- **Node.js 20.x or later** (use a version manager like Volta or nvm)
- **pnpm** (installed globally: `npm install -g pnpm`)

Check your versions:

```bash
node --version
pnpm --version
```

## Clone or fork the template

To use this template as a starting point, fork it on GitHub or clone it:

```bash
git clone https://github.com/example/arda-terminal-framework.git
cd arda-terminal-framework
```

If you're forking, clone your fork instead:

```bash
git clone https://github.com/your-username/arda-terminal-framework.git
```

## Install dependencies

```bash
pnpm install --frozen-lockfile
```

The `--frozen-lockfile` flag ensures you install the exact versions defined in `pnpm-lock.yaml`. Omit it if you want to upgrade packages (though we recommend testing before shipping).

## Start the development server

```bash
pnpm run dev
```

Your site opens at `http://localhost:4321`. The server reloads on file changes—edit `src/pages/index.astro` and watch the browser update.

## Project structure

The key folders:

- `src/components/` — Reusable Astro components organized by function (core, content, forms, etc.)
- `src/data/` — Content files: posts (blog/), projects, docs, and `profile.ts` (your persona)
- `src/pages/` — File-based routing; `/pages/index.astro` → `/`
- `src/lib/` — Utilities: theme system, effects, shell engine
- `src/config.yaml` — Site metadata and template settings
- `public/` — Static assets (images, fonts)

Don't edit files in `.astro/` or `dist/`; these are build artifacts.

## Next steps

1. **Update your identity:** Edit `src/config.yaml` and `src/data/profile.ts`
2. **Create a theme:** See `/docs/theming`
3. **Write content:** Add posts to `src/data/post/`, projects to `src/data/projects/`
4. **Deploy:** See `/docs/deploying` for Netlify/Vercel setup

Build for production with `pnpm run build`. The output lands in `dist/`.
