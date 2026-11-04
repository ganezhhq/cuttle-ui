# Phase 2 — Everyday UI (v0.2)

**Goal:** Add the components most apps need daily, and add **Vue** to prove the core is truly framework-free.

**Frameworks:** React (new components) + **Vue** (new adapter, all Phase 1 + Phase 2 components)

---

## 1. Vue adapter (do this first)

- [ ] `@cuttle-ui/vue` package setup (tsup / Vite library mode)
- [ ] `useMachine` composable binding core machines to Vue reactivity
- [ ] `as-child` support via slot forwarding
- [ ] SSR check in a Nuxt playground
- [ ] Port **Button** and **Dialog** first — if anything in `core` is React-specific, fix `core`, not the adapter
- [ ] Port remaining Phase 1 components (Input, Textarea, Label, Field, Checkbox, Radio Group, Switch, Select, Tooltip, Popover, Card, Stack, Typography)

## 2. New components

| # | Component | Core logic | Notes |
|---|---|---|---|
| 1 | Tabs | ✅ | roving focus, horizontal/vertical, manual/auto activation |
| 2 | Accordion | ✅ | single/multiple, collapsible, animated height |
| 3 | Collapsible | ✅ | animated height |
| 4 | Dropdown Menu | ✅ | submenus, checkbox/radio items, typeahead |
| 5 | Toast | ✅ | queue, stacking, swipe to dismiss, pause on hover, live region |
| 6 | Alert | — | info, success, warning, danger |
| 7 | Alert Dialog | ✅ | built on Dialog, `role="alertdialog"`, no outside dismiss |
| 8 | Avatar | ✅ | image with fallback initials |
| 9 | Badge | — | pill shape, variants |
| 10 | Chip | ✅ | removable, selectable |
| 11 | Skeleton | — | shimmer animation, reduced-motion safe |
| 12 | Progress | — | linear + circular, determinate/indeterminate |
| 13 | Spinner | — | sizes |
| 14 | Breadcrumbs | — | collapse long trails |
| 15 | Pagination | ✅ | page ranges, ellipsis, keyboard |
| 16 | Drawer / Sheet | ✅ | sides: top/right/bottom/left; built on Dialog |
| 17 | Separator | — | horizontal/vertical, decorative vs semantic |
| 18 | Kbd | — | keyboard key display |

## 3. Cross-framework testing

- [ ] Shared behavior test specs (one spec, run against React and Vue adapters)
- [ ] Docs demos rendered in both frameworks from the same example definitions

## 4. CLI

- [ ] `cuttle init` detects Vue / Nuxt
- [ ] `cuttle add` copies Vue SFCs + CSS for Vue projects
- [ ] Improve `cuttle update` merge and conflict output

## 5. Docs

- [ ] Framework switcher (React / Vue) on every component page
- [ ] "Getting started with Vue" guide (Vite + Nuxt)
- [ ] Toast and theming recipes

## 6. Release

- [ ] Publish `@cuttle-ui/vue` and updated packages at `0.2.0`

---

## Exit criteria

- [ ] 33 components pass the "done" checklist in **both React and Vue**
- [ ] No React-specific code in `@cuttle-ui/core`
- [ ] Shared test specs pass on both adapters
- [ ] Works in Nuxt with SSR
- [ ] v0.2.0 published
