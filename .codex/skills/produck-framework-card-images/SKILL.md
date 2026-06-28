---
name: produck-framework-card-images
description: Generate or update Produck framework template card cover images. Use when Codex is asked to create future images for the Produck `/frameworks` page, framework template cards, Produck duck mascot variants, or matching flat 2D card artwork saved under `src/lib/assets` and wired through `src/lib/frameworks/templates.ts`.
---

# Produck Framework Card Images

## Core Standard

Create flat 2D framework card cover art for the Produck app. Use the existing Produck logo at `src/lib/assets/logo-produck.png` as mascot identity reference:

- Mint green rounded duck body/head
- Darker sage outline/accent
- Warm yellow beak/feet/accent
- Single black circular eye
- Warm off-white / pale cork background

Match the approved direction from `src/lib/assets/framework-outcomes-card-v2.png`: calm, sparse, readable at small card size, and clearly not 3D.

## Visual Rules

Always require:

- 3:2 image ratio, preferably `1536x1024`
- Flat 2D vector-style bitmap illustration
- Large simple shapes with generous empty space
- No text, numbers, labels, fake writing, watermarks, or real framework logos
- No 3D, clay, isometric perspective, photorealism, realistic lighting, or busy dashboards
- Fewer than 8 foreground objects unless the user explicitly asks for detail
- One clear duck action/pose per card

Vary the duck pose across cards. Avoid repeating "duck beside a board" unless requested. Use action verbs such as walking, listening, depositing, pinning, carrying, sliding, inspecting, measuring, grouping, or connecting.

## Current Framework Concepts

Use these mappings unless the user asks for a different concept:

- `outcomes`: Duck reviewing one outcomes board with an upward trend arrow, progress bar, and check tile.
- `experience-map`: Duck walking along a curved journey path with three touchpoints and a destination flag.
- `interview-snapshot`: Duck holding a notebook/clipboard, listening near one profile card and one quote bubble.
- `idea-bank`: Duck leaning forward to deposit one yellow idea token into a simple tray/slot.
- `story-map`: Duck pinning or placing one rounded story card under a simple journey lane.
- `backlog` / Epics: Duck carrying or stacking two large work blocks plus one smaller card.
- `kanban`: Duck sliding one highlighted task card between three sparse columns.
- `assumption-test`: Duck inspecting one highlighted dot on a simple 2x2 quadrant with a magnifier or pointer.

## Workflow

1. Inspect `src/lib/frameworks/templates.ts` to confirm template ids, names, and ordering.
2. Inspect current assets in `src/lib/assets/framework-*-card*.png` before generating variants.
3. Use the image generation skill/tool for raster artwork. Treat `logo-produck.png` and the closest approved card image as references for identity and style.
4. Generate one card first if the user is evaluating style; generate multiple only after the direction is accepted.
5. Save project-bound images into `src/lib/assets` with stable names:
   - `framework-<template-id>-card.png`
   - Use `framework-<template-id>-card-v2.png` for non-destructive variants when replacing an existing direction.
6. Wire images through `src/lib/frameworks/templates.ts` by importing the asset and assigning `coverImage`.
7. Keep `src/routes/(app)/frameworks/+page.svelte` using the existing `coverImage` fallback pattern unless the renderer is missing it.
8. Visually spot-check generated images. Do not run `pnpm check` or build unless the user asks.

## Prompt Pattern

Use a concise prompt like:

```text
Use case: stylized-concept
Asset type: 3:2 framework template card cover image for /frameworks: "<Template Name>"
Primary request: Create a calm flat 2D Produck illustration for a <template> framework card, with a distinct <pose/action> pose.
Reference style: Produck duck mascot identity from the logo: mint green rounded duck, darker sage outline/accent, yellow beak, single black circular eye. Match the approved flat 2D Outcomes card style: warm off-white background, sparse composition, big readable shapes.
Subject: <one simple framework-specific scene>.
Pose requirement: Duck should <specific action>. Avoid repeating previous card poses.
Style/medium: flat 2D vector-style bitmap illustration, minimal editorial app-card artwork, large simple shapes, very low detail density.
Composition/framing: wide 3:2 card cover, generous empty space, readable in a small 4-column grid card.
Scene/backdrop: plain warm off-white / pale cork background, no room, no clutter.
Color palette: Produck mint green, sage green, warm yellow, off-white cork, tiny graphite accents only.
Text: none. No letters, numbers, labels, fake text, or real logos.
Constraints: 2D only; no 3D, no clay, no isometric perspective, no realistic lighting, no busy dashboard, no clutter, no watermark. Use fewer than 8 foreground objects total.
```

## Wiring Pattern

In `templates.ts`, add imports and `coverImage` entries:

```ts
import outcomesCover from '$lib/assets/framework-outcomes-card-v2.png';

// ...
coverGradient: '...',
coverImage: outcomesCover
```

If `+page.svelte` lacks image support, render `template.coverImage` inside the existing cover button and keep the Lucide icon fallback:

```svelte
{#if template.coverImage}
  <img src={template.coverImage} alt="" class="h-full w-full object-cover transition-opacity group-hover:opacity-25" />
{:else}
  <Icon class="size-12 text-cork-700/70 transition-opacity group-hover:opacity-0" />
{/if}
```
