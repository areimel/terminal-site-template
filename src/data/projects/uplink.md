---
publishDate: 2026-06-15
title: Uplink
excerpt: A self-hosted status page for monitoring system health. Terminal-native design with edge distribution.
category: Infrastructure
tags:
  - Status Page
  - Monitoring
  - Open Source
technologies:
  - 'Rust: metrics collection'
  - 'Astro: static generation'
  - 'TypeScript: frontend logic'
projectUrl: https://example.com/uplink
repoUrl: https://github.com/example/uplink
role: Systems Developer
duration: 3 months
image: /images/blog/photo-1546984575-757f4f7c13cf.webp
---

## Overview

Uplink is a self-hosted status page tool designed for teams that need reliability reporting without the cost of managed SaaS. Built with an 80s terminal aesthetic, it renders beautiful HTML from raw metrics collected at five-minute intervals and distributed globally via CDN.

The tool splits into two pieces: a Rust collector that gathers metrics from your infrastructure, and an Astro build pipeline that transforms those metrics into a static status page. This separation keeps the system simple and the costs low.

## What I built

The Rust collector is the nervous system—it hits your service endpoints, records latencies, parses error logs, and writes everything to S3 in structured JSON. No database roundtrips, no complexity.

Then Astro takes that JSON, renders responsive HTML with the terminal theme, and deploys to Netlify. The entire pipeline runs on free tier services. Badges show real-time status; historical graphs show the last 30 days; every component re-themes live across five color palettes.

For teams that need live updates, I added an optional WebSocket layer on Fly.io that streams changes as they happen.

## Lessons

The biggest win was embracing static generation. Most status page tools tried to serve data in real-time. That's expensive. By accepting a five-minute latency, we eliminated database costs entirely and let CDN caching do the heavy lifting.

Separating data collection from presentation was equally important. Changing the design doesn't touch the pipeline. Adding new metrics doesn't require rebuilding the UI framework. Each piece can evolve independently.

The terminal aesthetic wasn't just aesthetic; it forced me to think about information hierarchy differently. Without colors to hide behind, every element earns its place through spacing and structure.
