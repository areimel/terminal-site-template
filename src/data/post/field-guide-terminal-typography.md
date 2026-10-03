---
publishDate: 2026-09-15
title: A field guide to terminal typography
excerpt: Terminal fonts aren't just nostalgia. They're optimized for dense information and small sizes. Here's which to use and when.
category: Design
tags:
  - Typography
  - Fonts
  - Terminal UI
image: /images/blog/photo-1513151233558-d860c5398176.webp
---

A well-chosen terminal font doesn't just look retro. It vanishes. You stop noticing the pixels and start reading the content. This guide covers the fonts I use at ARDA and why each one solves a specific problem.

## The three tiers

### Display: UAV OSD Mono

UAV OSD is brutally geometric—every character is exactly the same width, height aligned, zero serifs. Originally designed for avionics displays where pilots glanced at text for half a second.

Use it for:

- Page headings and section titles
- Menu labels
- Small status strings like "OK" or "WARN"
- Anything you want to feel authoritative and instant

Avoid it for body text longer than 2 lines; the tight spacing gets exhausting.

### Body: Kode Mono

Kode Mono is the workhorse. It's friendly enough for prose (blogs, docs, chat) but still maintains the visual crisp of a terminal font. Good legibility at all sizes, and the extended character set handles Unicode well.

```css
body {
  font-family: 'Kode Mono', monospace;
  font-size: 1rem;
  line-height: 1.6;
}
```

### Accent: VT323

VT323 is pure nostalgia—it's modeled after actual VT220 terminal output. Pixelated, lo-fi, unmistakable. Use it sparingly.

Perfect for:

- Large ASCII art moments
- Callouts or warnings that need to stand out
- Boot sequences and animations

Never use it for more than a few words; it hurts at scale.

## Font metrics that matter

When you're designing a terminal interface, three things are non-negotiable:

1. **Cap height consistency.** All uppercase letters must be the same height (they should be in a monospace font, but some modern fonts cheat).
2. **Distinct glyphs.** The characters `1`, `l`, and `I` must be visually different. Same with `0` and `O`.
3. **Punctuation clarity.** Backticks, quotes, and underscores need breathing room.

Test every font at actual usage sizes on actual devices. A font that looks sharp at 16px might blur at 11px. The best terminal font is one you never think about.

## Loading strategy

Terminal fonts are small files, but load them smart:

```html
<link rel="preload" as="font" href="/fonts/kode-mono.woff2" type="font/woff2" crossorigin />
```

Prioritize Kode Mono (body text). Lazy-load UAV OSD for above the fold, and only if you use VT323.

## One more thing

If you're redesigning a site with terminal aesthetics, start by picking the body font first. Headings and accents are flavor—body text is structure.
