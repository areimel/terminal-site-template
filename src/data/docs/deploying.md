---
title: Deploying
description: Build and deploy your site to Netlify, Vercel, or any static host.
section: Reference
order: 1
---

This is a static site built with Astro. The production build compiles to static HTML and CSS, deployable to any host.

## Build output

```bash
pnpm run build
```

Output lands in `dist/`. This folder contains:

- `index.html` — Home page
- `blog/`, `projects/`, `docs/` — Content routes
- `_astro/` — Bundled CSS and JS
- `images/` — Optimized images
- Everything else is static and cacheable

The build process:

1. Collects content from `src/data/**` and `src/pages/**`
2. Runs Astro's static site generator
3. Optimizes images and bundles JavaScript
4. Outputs to `dist/`

The build is fast (under 20 seconds) because the site is static—no server rendering, no database queries.

## Preview locally

```bash
pnpm run preview
```

Serves the `dist/` folder on `http://localhost:3000`. This is what visitors see after deployment.

## Netlify

The repo includes a `netlify.toml` configuration.

### Deploy from GitHub

1. Push your code to GitHub
2. Sign in to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repo
5. Netlify detects the config and deploys automatically

The build command is `pnpm install && pnpm run build`. Output is `dist/`.

### Environment variables

For analytics or forms, add env vars in Netlify:

1. Go to your site settings → Build & Deploy → Environment
2. Add `GTM_ID`, `WEB3FORMS_ACCESS_KEY`, etc.

Reference them in `src/config.yaml`:

```yaml
template:
  integrations:
    gtm:
      id: '${process.env.GTM_ID}'
```

### Deploy previews

Every pull request gets a deploy preview URL. Netlify builds and hosts it automatically—great for testing.

## Vercel

The repo includes a `vercel.json` configuration.

### Deploy from GitHub

1. Sign in to [vercel.com](https://vercel.com)
2. Click "New Project" and import your GitHub repo
3. Vercel detects the config and deploys automatically

The build command is `pnpm install && pnpm run build`. Output is `dist/`.

### Environment variables

1. Go to your project settings → Environment Variables
2. Add `GTM_ID`, `WEB3FORMS_ACCESS_KEY`, etc.
3. Redeploy for changes to take effect

Vercel builds on every push; preview deployments are automatic.

## Custom domain

Both Netlify and Vercel let you add a custom domain:

1. Buy a domain (Namecheap, Google Domains, etc.)
2. In your host (Netlify/Vercel), go to settings and add the domain
3. Update your DNS records to point to the host's nameservers
4. SSL certificate is automatic (Let's Encrypt)

DNS propagation takes up to 24 hours.

## Site configuration checklist

Before launch:

- [ ] Update `src/config.yaml` with your identity, organization, and location
- [ ] Replace `public/favicon.svg` with your logo
- [ ] Add a custom OG image: `public/og-image.png` (1200x630px)
- [ ] Update social links in `navigation.ts`
- [ ] Add your analytics IDs (GTM, GA) and Web3Forms key
- [ ] Delete demo pages you don't need (e.g., `/pricing`, `/landing`)
- [ ] Run `pnpm run check` to ensure no errors
- [ ] Run `pnpm run build` and preview locally with `pnpm run preview`
- [ ] Test on mobile (use DevTools or your phone)
- [ ] Check a11y with axe or WebAIM WAVE

## Monitoring

After deployment:

1. Set up **404 monitoring** in your host's analytics (look for 404 errors in logs)
2. Set up **uptime monitoring** (Pingdom, UptimeRobot, or Netlify's built-in alerts)
3. Enable **error tracking** if deploying JS (Sentry, Rollbar, or browser console)
4. Check **Core Web Vitals** regularly (Google Search Console or PageSpeed Insights)

Static sites are usually very reliable, but external integrations (forms, analytics) can fail.

## Performance optimization

Your site is already fast because it's static, but:

1. Optimize images: use WebP, resize to viewport width
2. Lazy-load images below the fold: `loading="lazy"`
3. Preload critical resources: fonts, CSS, above-the-fold images
4. Cache headers: the host usually sets these automatically
5. CDN: both Netlify and Vercel use edge CDNs by default

For detailed audits, use Google Lighthouse or WebPageTest.

## Rollback

If something breaks after deploy:

**Netlify:** Go to Deploys, find a previous build, and click "Publish to production."

**Vercel:** Go to Deployments, find the previous deployment, and click "Promote to Production."

Rollbacks are instant (no rebuild needed).
