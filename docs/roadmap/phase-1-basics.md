# Phase 1 — Basics (v0.1)

**Goal:** Ship the first 15 essential components in React and prove the core → styles → adapter pattern end to end. First public release.

**Frameworks:** React

---

## 1. Reference implementations (do these first)

1. **Button** — the first stateless component. Defines variants, sizes, `asChild`, loading state, and docs page format. Every later component follows its pattern.
2. **Dialog** — the first stateful component. Validates the core machine, focus trap, dismissable layer, portal, and spring motion.

Don't start the rest until both are fully "done" per the checklist.

### Reference implementation status

Everything on the "done" checklist is met except the items below. Button has no core machine, as the component table shows.

| Item | Button | Dialog |
|---|---|---|
| Screen-reader tested (NVDA + VoiceOver) | **Not yet, needs a person** | **Not yet, needs a person** |
| Automated checks (axe, keyboard, light, dark, RTL, reduced motion, SSR build, snapshots) | Passing | Passing |
| Bundle size, gzipped | CSS 1.0 KB | CSS 0.6 KB. The React package with both is 2.4 KB and the core package is 3.5 KB, both before tree-shaking |

SSR is checked by building `apps/ssr-check`. Hydration has not been checked in a browser. Nuxt, Angular SSR and SvelteKit apply once those adapters exist. Both docs pages show CLI commands, but `cuttle add` does not exist yet.

## 2. Components

| # | Component | Core logic | Notes |
|---|---|---|---|
| 1 | Button | — | variants: solid, outline, soft, ghost, link, danger; sizes sm/md/lg; loading |
| 2 | Dialog | ✅ | modal, focus trap, Esc, outside click, scroll lock |
| 3 | Input | — | sizes, invalid state, disabled |
| 4 | Textarea | ✅ | auto-resize option |
| 5 | Label | — | links to control via `for`/`id` |
| 6 | Field | ✅ | wires label + description + error to control via ARIA |
| 7 | Checkbox | ✅ | checked, unchecked, indeterminate |
| 8 | Radio Group | ✅ | roving focus, arrow keys |
| 9 | Switch | ✅ | |
| 10 | Select | ✅ | listbox, typeahead, positioner |
| 11 | Tooltip | ✅ | hover/focus, delay, positioner |
| 12 | Popover | ✅ | positioner, dismissable layer |
| 13 | Card | — | header, content, footer; tinted surface |
| 14 | Stack | — | direction, gap, align, justify |
| 15 | Typography | — | heading levels, text, muted, code |

## 3. Signature details to implement

- [x] Ink accent on solid Button and focus rings
- [ ] Shimmer focus on Input, Textarea, Select trigger, Button (done on Button)
- [ ] Spring open/close on Dialog, Popover, Tooltip, Select (done on Dialog)
- [ ] Tinted surfaces on Card, Popover, Dialog (done on Dialog)

## 4. CLI

- [ ] `npx cuttle add <component>` — copies React adapter + CSS into the user's project, adds `@cuttle-ui/core` as dependency
- [ ] Component registry (JSON) describing files and dependencies for each component
- [ ] `npx cuttle update <component>` — 3-way merge with conflict report (can be basic in this phase)

## 5. Docs

- [ ] One page per component: live demo, install (package + CLI), anatomy, API table, keyboard table, a11y notes
- [ ] "Getting started with React" guide (Vite + Next.js)
- [ ] Theme playground v1: change accent color and radius, preview components, copy CSS variables

## 6. Release

- [ ] Publish `@cuttle-ui/core`, `@cuttle-ui/styles`, `@cuttle-ui/icons`, `@cuttle-ui/react`, `@cuttle-ui/cli` at `0.1.0`
- [ ] Launch post / README showcase with screenshots (light + dark)

---

## Exit criteria

- [ ] All 15 components pass the "done" checklist in React
- [ ] Works in Next.js (app router, SSR) and Vite
- [ ] `cuttle init` + `cuttle add` work in a fresh project
- [ ] Docs live with all 15 component pages
- [ ] v0.1.0 published to npm
