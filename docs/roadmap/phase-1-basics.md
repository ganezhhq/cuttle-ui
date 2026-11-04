# Phase 1 — Basics (v0.1)

**Goal:** Ship the first 15 essential components in React and prove the core → styles → adapter pattern end to end. First public release.

**Frameworks:** React

---

## 1. Reference implementations (do these first)

1. **Button** — the first stateless component. Defines variants, sizes, `asChild`, loading state, and docs page format. Every later component follows its pattern.
2. **Dialog** — the first stateful component. Validates the core machine, focus trap, dismissable layer, portal, and spring motion.

Don't start the rest until both are fully "done" per the checklist.

### Component status

All 15 components are built. **None is fully "done" yet, because none has been tested with a screen reader.** The owner chose to build the other 13 before that test on Button and Dialog, so any problem it finds may need fixing across all of them.

| Item | Status |
|---|---|
| Screen-reader tested (NVDA + VoiceOver) | **Not yet, needs a person** |
| Automated checks (axe, keyboard, light, dark, RTL, reduced motion, snapshots) | Passing |
| SSR | The Next.js check builds with the components. Copied components were also built and run in a new Next.js app, where they hydrated with no console errors |
| Bundle size, gzipped, before tree-shaking | React package 7.3 KB, core package 4.4 KB. CSS: Button 1.0 KB, Dialog 0.6 KB, forms 1.4 KB, overlays 1.0 KB, layout and type 0.6 KB |

Differences from the checklist and table:

- Label, Card, Stack and Typography have no core logic, and neither does Input, as the table shows. They have no state or keyboard behavior of their own.
- Field and Textarea use core helpers rather than a state machine, because they have no states to move between.
- Radio Group uses native radios, which provide the roving focus and arrow keys. This means `rovingFocus` from core is not used yet.
- Select takes its options as a list, rather than as child components.
- The CLI runs as `npx @cuttle-ui/cli`, because the unscoped `cuttle` package on npm belongs to someone else.
- Components without a keyboard interaction, such as Card and Stack, have no keyboard table on their docs pages.
- The guide's package steps were followed by hand in new Vite and Next.js apps, using packed packages. They have not been tried from npm, because nothing is published yet.
- The fresh-project check was done by hand, using packed packages in new Vite and Next.js apps. CI does not run it. CI only covers `cuttle add` and `update` through the CLI's own tests.
- The `region` axe rule is turned off while an overlay is open, because floating layers sit outside the page landmarks by design.

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
- [x] Shimmer focus on Input, Textarea, Select trigger, Button
- [x] Spring open/close on Dialog, Popover, Tooltip, Select
- [x] Tinted surfaces on Card, Popover, Dialog

## 4. CLI

- [x] `cuttle add <component>` — copies React adapter + CSS into the user's project, adds `@cuttle-ui/core` as dependency
- [x] Component registry (JSON) describing files and dependencies for each component
- [x] `cuttle update <component>` — 3-way merge with conflict report

## 5. Docs

- [x] One page per component: live demo, install (package + CLI), anatomy, API table, keyboard table, a11y notes
- [x] "Getting started with React" guide (Vite + Next.js)
- [x] Theme playground v1: change accent color and radius, preview components, copy CSS variables

## 6. Release

- [ ] Publish `@cuttle-ui/core`, `@cuttle-ui/styles`, `@cuttle-ui/icons`, `@cuttle-ui/react`, `@cuttle-ui/cli` at `0.1.0`
- [ ] Launch post / README showcase with screenshots (light + dark)

---

## Exit criteria

- [ ] All 15 components pass the "done" checklist in React
- [x] Works in Next.js (app router, SSR) and Vite
- [x] `cuttle init` + `cuttle add` work in a fresh project
- [x] Docs live with all 15 component pages
- [ ] v0.1.0 published to npm
