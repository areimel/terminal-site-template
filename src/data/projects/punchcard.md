---
publishDate: 2026-05-20
title: Punchcard
excerpt: A minimal CLI habit tracker that stores everything in a single text file. No cloud sync, no subscriptions.
category: Productivity
tags:
  - CLI Tools
  - Habits
  - Open Source
technologies:
  - 'Go: cross-platform binary'
  - 'SQLite: local storage'
  - 'TUI: terminal interface'
projectUrl: https://example.com/punchcard
repoUrl: https://github.com/example/punchcard
role: Systems Developer
duration: 6 weeks
image: /images/blog/photo-1542831371-29b0f74f9713.webp
---

## Overview

Punchcard is a habit tracker that lives entirely on your machine. No signup, no sync, no algorithm deciding whether you're "doing well enough." You run it from the terminal, log your habit for the day, and it shows a simple grid of completed days.

The interface is inspired by old punch card systems—one card per habit, one hole per completed day. The entire database is a plaintext SQLite file you can version control, backup, or share.

## What I built

The core is a single Go binary that compiles on Linux, macOS, and Windows. Install it, run `punchcard add exercise`, and you're tracking. The TUI is built on Bubble Tea, giving you arrow keys, vim navigation, and modal confirmation prompts.

Every habit gets a visual grid showing the last 90 days. Red days are misses; green days are wins. The terminal theme adapts to your system colors, and you can cycle between themes with a single keystroke.

Data lives in SQLite, which means you get fast queries, reliable transactions, and the ability to export CSV if you ever want to. No proprietary sync format, no vendor lock-in.

## Lessons

The biggest insight was that constraints make software better. By removing cloud sync and real-time notifications, I eliminated entire categories of bugs. A single-machine habit tracker is simpler, faster, and more reliable than a cloud service.

Choosing Go over Node.js paid off immediately. The compiled binary is 5MB, starts in milliseconds, and requires zero runtime dependencies. That simplicity made it easy to get feedback from friends—just copy the binary, run it.

The terminal aesthetic wasn't forced here; it was natural. Habits are tracked visually (grid of cells), so embracing a retro terminal design actually clarified the interface. No gradients, no animations—just data you can trust.
