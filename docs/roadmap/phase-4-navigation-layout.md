# Phase 4 — Navigation & Layout (v0.4)

**Goal:** Complete app-shell building blocks (navigation, layout, menus) and add **Svelte**.

**Frameworks:** React + Vue + Angular + Web Components (new components) + **Svelte** (new adapter, all components so far)

---

## 1. Svelte adapter

- [ ] `@cuttle/svelte` package (Svelte 5, runes)
- [ ] Binding core machines to runes-based state
- [ ] Snippet-based parts, `bind:` support for form controls
- [ ] SSR check with SvelteKit
- [ ] Port all Phase 1–3 components

## 2. New components

| # | Component | Core logic | Notes |
|---|---|---|---|
| 1 | Sidebar | ✅ | collapsible, icon-only mode, mobile sheet, persistent state |
| 2 | App Bar | — | sticky, with actions slot |
| 3 | Navigation Menu | ✅ | mega-menu, hover/click, keyboard |
| 4 | Menubar | ✅ | desktop-app style menus, submenus |
| 5 | Context Menu | ✅ | right-click / long-press, reuses Dropdown Menu logic |
| 6 | Hover Card | ✅ | delayed preview, positioner |
| 7 | Stepper | ✅ | horizontal/vertical, linear/non-linear, error state |
| 8 | Bottom Navigation | ✅ | mobile nav |
| 9 | Speed Dial | ✅ | floating actions |
| 10 | Resizable | ✅ | panels, handles, keyboard resize, persisted sizes |
| 11 | Scroll Area | ✅ | custom scrollbars, native scrolling |
| 12 | Carousel | ✅ | swipe, keyboard, autoplay with pause, reduced-motion |
| 13 | Aspect Ratio | — | |
| 14 | Grid | — | responsive columns |
| 15 | Container | — | max-width sizes |

Also include the remaining small utilities: **Box**, **Paper**, **Link**, **Icon Button**, **Floating Action Button**, **Button Group**, **Label**/**Visually Hidden** helpers if not already shipped.

## 3. Layout recipes

- [ ] Docs "blocks": dashboard shell, settings page, auth page, marketing header — built only from Cuttle components
- [ ] Blocks copyable via `npx cuttle add block <name>`

## 4. CLI & docs

- [ ] `cuttle init` / `cuttle add` support Svelte / SvelteKit
- [ ] Framework switcher: React / Vue / Angular / Svelte / HTML
- [ ] "Getting started with Svelte" guide
- [ ] Theme playground v2: dark mode toggle, radius, accent, density presets; export CSS

## 5. Release

- [ ] Publish `@cuttle/svelte` and updated packages at `0.4.0`

---

## Exit criteria

- [ ] ~61 components pass the "done" checklist in **all 5 targets**
- [ ] At least 4 layout blocks published
- [ ] Works in SvelteKit with SSR
- [ ] v0.4.0 published
