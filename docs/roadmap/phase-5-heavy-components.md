# Phase 5 — Heavy Components & Stable Release (v1.0)

**Goal:** Ship the large, data-heavy components that neither MUI (free tier) nor shadcn fully provide, then stabilize the API and release **v1.0**.

**Frameworks:** all 5 targets (React, Vue, Angular, Svelte, Web Components)

> Tip: start design and prototyping for Data Grid during Phase 3–4. It's the longest single item.

---

## 1. New components

| # | Component | Package | Notes |
|---|---|---|---|
| 1 | Table | `@cuttle/<fw>` | simple semantic table, sticky header, striped/compact |
| 2 | Data Grid | `@cuttle/grid` | see feature list below |
| 3 | Tree View | `@cuttle/<fw>` | expand/collapse, multi-select, checkboxes, lazy loading, keyboard |
| 4 | Charts | `@cuttle/charts` | line, bar, area, pie/donut, scatter; themed by tokens; accessible data tables |
| 5 | Timeline | `@cuttle/<fw>` | vertical/horizontal, alternating |
| 6 | Transfer List | `@cuttle/<fw>` | two lists, search, select all |
| 7 | Masonry | `@cuttle/<fw>` | responsive columns |
| 8 | Image List | `@cuttle/<fw>` | grid, quilted, with captions |
| 9 | List | `@cuttle/<fw>` | items, icons, actions, nested |
| 10 | Empty | `@cuttle/<fw>` | empty-state with icon, text, action |

### Data Grid features (all free / MIT)

- [ ] Virtualized rows and columns
- [ ] Sorting (single + multi)
- [ ] Filtering (column filters + quick search)
- [ ] Pagination (client + server)
- [ ] Column resize, reorder, pin (left/right), hide
- [ ] Row selection (checkbox, range)
- [ ] Inline cell editing with validation
- [ ] Grouping + aggregation
- [ ] Tree data / expandable rows
- [ ] Export to CSV
- [ ] Server-side data mode
- [ ] Full keyboard grid navigation (`role="grid"`)
- [ ] Headless core in `@cuttle/core/grid`, adapters per framework

## 2. API stabilization

- [ ] Review every component's props, parts and events for consistency across frameworks
- [ ] Remove deprecated APIs; document breaking changes
- [ ] Freeze token names (semver-protected from v1.0)
- [ ] Migration guide 0.x → 1.0

## 3. Quality & performance

- [ ] Full a11y audit (axe + manual screen-reader pass) of all components
- [ ] Performance benchmarks for Data Grid (e.g. 100k rows) and Charts
- [ ] Bundle-size budget per component
- [ ] Visual regression baseline for every component, light + dark, all frameworks

## 4. Docs & community

- [ ] Data Grid and Charts guides with real-world examples
- [ ] "Why Cuttle" page (all frameworks, free heavy components, signature look)
- [ ] Comparison pages: Cuttle vs MUI, Cuttle vs shadcn/ui
- [ ] Showcase page for projects using Cuttle
- [ ] Good-first-issue backlog for contributors

## 5. Release

- [ ] Publish all packages at `1.0.0`, including `@cuttle/grid` and `@cuttle/charts`
- [ ] Launch: blog post, GitHub release notes, demo video

---

## Exit criteria

- [ ] All ~75 components pass the "done" checklist in all 5 targets
- [ ] Data Grid handles 100k rows smoothly with virtualization
- [ ] Public API and tokens documented and frozen
- [ ] v1.0.0 published 🎉
