---
title: Effects
description: Terminal visual effects and animation controls.
section: Guides
order: 2
---

Effects add retro terminal aesthetics to the site. Each one can be toggled independently by the user. When a visitor enables `prefers-reduced-motion` in their OS, all effects disable automatically.

## Available effects

**Boot** — A startup sequence animation that plays once on the home page. Shows booting text with the MAINFRAME-7 logo and a decode effect on your name.

**Noise** — Random TV static overlay, subtle and responsive to user interaction (reduces noise on hover).

**Scanline** — Horizontal scan lines across the screen, creating a classic CRT monitor effect.

**Overlay** — An additional CRT screen bloom/vignette effect.

**Decoder** — Text decode animation on headings and callouts. Characters appear one by one from random positions, then settle into place.

## User controls

Users can toggle effects individually in the **Settings** modal. They can also use the shell:

```bash
effects on              # Enable all effects
effects off             # Disable all effects
effects decoder on      # Enable decoder only
effects noise off       # Disable noise
```

Settings persist to localStorage under the key `terminal-effects`.

## Default configuration

Set defaults in `src/config.yaml`:

```yaml
template:
  effects:
    boot: true
    noise: true
    scanline: true
    overlay: true
    decoder: true
```

These are the initial values; users can change them anytime.

## Reduced motion

If the visitor has `prefers-reduced-motion: reduce` enabled (Settings > Accessibility on macOS/Windows, or Settings > Display on Linux), all effects turn off automatically, regardless of configuration.

This ensures accessible experience for users with vestibular disorders or motion sensitivity.

## Runtime API

Use the effects API from `src/lib/effects.ts`:

```typescript
import { isEnabled, setEffect, getEffects } from '~/lib/effects';

// Check if an effect is on
if (isEnabled('decoder')) {
  // Decoder is enabled
}

// Toggle an effect
setEffect('noise', false);

// Get all effect states
const effects = getEffects();
// { boot: true, noise: false, scanline: true, ... }
```

## Conditional rendering

Gate visual effects using `isEnabled()`:

```astro
---
import { isEnabled } from '~/lib/effects';

const showDecoder = isEnabled('decoder');
---

<Heading level={1} decode={showDecoder}> Welcome </Heading>
```

Never use effects that don't check this flag; an animation that can't be disabled is an accessibility failure.

## Listening for changes

```typescript
window.addEventListener('terminal:effects-change', (event) => {
  const { name, enabled } = event.detail;
  console.log(`Effect '${name}' is now ${enabled ? 'on' : 'off'}`);
});
```

## HTML data attributes

Effects set `data-fx-*` attributes on the root `<html>` element:

```html
<html data-fx-boot="on" data-fx-noise="off" data-fx-scanline="on"></html>
```

CSS can key off these:

```css
[data-fx-scanline='on'] body::before {
  /* Scanline overlay styles */
}
```

This approach keeps effects declarative and CSS-managed, not JavaScript-dependent.
