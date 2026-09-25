---
publishDate: 2026-04-10
title: Relay-7
excerpt: A tiny, embeddable message queue for hobby clusters and edge deployments. Single file, no external dependencies.
category: Infrastructure
tags:
  - Message Queue
  - Distributed Systems
  - Open Source
technologies:
  - 'Rust: async runtime'
  - 'Tokio: concurrency'
  - 'Protocol Buffers: serialization'
projectUrl: https://example.com/relay-7
repoUrl: https://github.com/example/relay-7
role: Systems Developer
duration: 8 weeks
image: /images/blog/photo-1551288049-bebda4e38f71.webp
---

## Overview

Relay-7 is a message queue designed for environments where adding a Kafka cluster is overkill. It's written in Rust, compiles to a single binary, and can run on a 256MB VPS. The entire codebase is under 3000 lines, which means you can read and understand the whole thing in an afternoon.

Unlike Redis or RabbitMQ, Relay-7 optimizes for simplicity and startup time over throughput. It's ideal for hobby projects, Kubernetes sidecar deployment, and edge functions that need to queue work locally.

## What I built

The core is an async TCP server built on Tokio. Clients connect, send messages in Protocol Buffer format, and Relay-7 routes them to subscribers or persists them to disk. All state lives in memory with periodic snapshots, so recovery is fast and deterministic.

The interesting bit is the subscription model. Clients can subscribe to message types, and Relay-7 handles backpressure automatically. If a subscriber is slow, the queue doesn't stack messages in memory forever; instead, it buffers to disk and replays when the subscriber catches up.

Configuration is a single YAML file. Topic definition, retention policy, and memory limits—all set once, no runtime complexity.

## Lessons

The hardest part wasn't the distributed systems logic; it was accepting that sometimes "good enough" is better than "perfect." I spent weeks implementing elegant consensus protocols before realizing: hobby projects don't need consensus. They need something that starts fast and doesn't lose data.

That realization changed everything. The architecture got simpler, the code got clearer, and the startup time dropped from 2 seconds to 200ms.

Working in Rust forced me to think about memory safety early. No surprise latency spikes from garbage collection, no data races hiding in async code. The compiler caught whole categories of bugs before I could ship them.

The single-binary constraint was also a feature, not a limitation. It made deployment trivial and deployment debugging deterministic. Everyone runs the exact same binary, so "works on my machine" isn't a valid excuse.
