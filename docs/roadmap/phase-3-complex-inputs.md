# Phase 3 — Complex Inputs (v0.3)

**Goal:** Ship the harder interactive input components, and add **Angular** and **Web Components**.

**Frameworks:** React + Vue (new components) + **Angular** and **Web Components** (new adapters, all components so far)

---

## 1. Angular adapter

- [ ] `@cuttle-ui/angular` package (ng-packagr)
- [ ] Signals-based binding to core machines
- [ ] Standalone components + directives (`cuttleButton`, `cuttleDialogTrigger`, …)
- [ ] Reactive Forms and template-driven forms support (`ControlValueAccessor`) for all form controls
- [ ] SSR check with Angular SSR
- [ ] Dedicated Angular CI job
- [ ] Port all Phase 1 + Phase 2 components

## 2. Web Components (`@cuttle-ui/elements`)

- [ ] Lit-based custom elements (`<cuttle-button>`, `<cuttle-dialog>`, …)
- [ ] Form-associated custom elements (`ElementInternals`) for form controls
- [ ] Slots for parts; events for state changes (`cuttle-change`, `cuttle-open-change`)
- [ ] Generate `custom-elements.json` manifest for IDE support
- [ ] CDN build (single script + CSS) for plain HTML usage
- [ ] Port all Phase 1 + Phase 2 components

## 3. New components

| # | Component | Core logic | Notes |
|---|---|---|---|
| 1 | Combobox / Autocomplete | ✅ | filtering, async options, multi-select, creatable |
| 2 | Calendar | ✅ | grid navigation, locale, week start, min/max, disabled dates |
| 3 | Date Picker | ✅ | Calendar inside Popover, typed input with parsing |
| 4 | Time Picker | ✅ | 12/24h, step, keyboard segments |
| 5 | Date-Range Picker | ✅ | range selection, presets, two-month view |
| 6 | Slider | ✅ | single/range, steps, marks, vertical |
| 7 | Input OTP | ✅ | paste support, auto-advance, masking |
| 8 | Input Group | — | prefix/suffix icons, addons, buttons |
| 9 | Command | ✅ | ⌘K palette, fuzzy search, groups, keyboard navigation |
| 10 | Toggle | ✅ | pressed state |
| 11 | Toggle Group | ✅ | single/multiple, roving focus |
| 12 | Rating | ✅ | half values, read-only, keyboard |
| 13 | Form | ✅ | validation wiring, error summary, schema-agnostic (works with Zod, Yup, etc.) |

## 4. Internationalization (needed for date/time)

- [ ] Use `Intl` APIs for dates, numbers, and plural rules
- [ ] Locale prop / provider across all frameworks
- [ ] RTL verified on Calendar, Slider, Combobox

## 5. CLI & docs

- [ ] `cuttle init` / `cuttle add` support Angular and plain HTML
- [ ] Framework switcher now: React / Vue / Angular / HTML
- [ ] "Getting started" guides for Angular and Web Components (incl. CDN usage)
- [ ] Date & time localization guide

## 6. Release

- [ ] Publish `@cuttle-ui/angular`, `@cuttle-ui/elements` and updated packages at `0.3.0`

---

## Exit criteria

- [ ] 46 components pass the "done" checklist in **React, Vue, Angular and Web Components**
- [ ] Angular form controls work with Reactive Forms
- [ ] Web Component form controls submit inside native `<form>`
- [ ] Date components work in at least 5 locales incl. one RTL
- [ ] v0.3.0 published
