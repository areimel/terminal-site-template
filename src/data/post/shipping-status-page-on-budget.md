---
publishDate: 2026-09-10
title: Shipping a status page on a budget
excerpt: Status pages don't need to be expensive. A static site, edge caching, and a bit of discipline gets you to five nines uptime for pocket change.
category: DevOps
tags:
  - Infrastructure
  - Cost Optimization
  - Monitoring
image: /images/blog/photo-1517245386807-bb43f82c33c4.webp
---

Most status page services cost $50–$500 a month. We don't have $500 a month at MAINFRAME-7 for something that should just publish JSON and HTML. So we built Uplink instead.

Three principles guided the build: static output, edge distribution, and no databases for reads.

## The stack

```
┌─────────────────────────────────────────┐
│ Rust collector (cron job, five minutes) │
│ Writes raw metrics to S3                │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ Astro build (triggered on S3 change)    │
│ Generates static HTML + JSON            │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ Netlify CDN (cached globally)           │
│ Serves HTML at edge                     │
└─────────────────────────────────────────┘
```

Every piece is cheap or free. The Rust collector runs on a $2.50/month VPS. The Astro build is free on Netlify. The CDN is a few cents a month for bandwidth we'd already pay.

## What made it work

### 1. No real-time data

We don't update every second. Five-minute intervals are good enough for status pages. This means we can batch everything and avoid expensive streaming architectures.

### 2. HTTP caching headers

```
Cache-Control: public, max-age=300
Netlify-Cache-Tag: status-page
```

Five minutes of edge caching means the expensive parts (database calls, rendering) happen once, not a thousand times.

> Static doesn't mean stale. It means predictable.

### 3. Structured data first

We store raw metrics as JSON: timestamps, response times, availability. The Astro build transforms that into beautiful HTML. This separation means we can change the design without touching the data pipeline.

### 4. Optional real-time layer

For customers who need live updates, we added a tiny WebSocket server ($8/month on Fly.io). It's optional. Most people don't use it.

## Running costs

- VPS for collector: $30/year
- Netlify: free tier (unlimited builds, generous bandwidth)
- Fly.io (optional WebSocket): $72/year
- Total: ~$102/year for a service that handles millions of requests

Compare that to Statuspage.io ($99/month) or Atlassian (proprietary pricing). We're 12x cheaper.

## The catch

This approach works if you own your infrastructure or have good APIs to pull from. It doesn't work if you need a fancy UI builder or the ability to let customers customize their status page without code.

But if you're building something for a team that just needs reliable, beautiful status reporting? This pattern will ship faster and cheaper than any managed service.

Go static first. Add complexity only when it hurts.
