# Phase 0 — Foundation (v0.0)

**Status: in progress.** A ticked item is built and passed CI where CI covers it. See [STATUS.md](STATUS.md) for setup steps, blockers and what to do next.

**Goal:** Set up the monorepo, tokens, core utilities, tooling and docs skeleton so every later component has a solid base.

**Ships:** no public components. Internal release only.

---

## 1. Repository setup

- [x] Create GitHub repo `cuttle-ui` under GanezhHQ
- [x] pnpm workspaces + Turborepo
- [x] Shared `tsconfig` (strict) in `tooling/tsconfig`
- [x] Shared ESLint + Prettier config in `tooling/eslint-config` (Prettier config is at the repo root)
- [x] Changesets for versioning
- [x] Conventional Commits + commitlint (checked in CI)
- [x] MIT `LICENSE`, `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`
- [x] Issue templates: bug, feature, new component proposal
- [ ] GitHub Discussions + public roadmap (GitHub Projects): Discussions are on, the roadmap board does not exist yet

### Folder layout

```
cuttle-ui/
├── packages/
│   ├── core/
│   ├── styles/
│   ├── icons/
│   ├── react/
│   ├── vue/          # empty until Phase 2
│   ├── angular/      # empty until Phase 3
│   ├── elements/     # empty until Phase 3
│   ├── svelte/       # empty until Phase 4
│   └── cli/
├── apps/
│   ├── docs/
│   ├── playground/
│   └── ssr-check/    # Next.js app router SSR check
├── docs/roadmap/     # this plan
├── tooling/
├── .changeset/
├── turbo.json
└── pnpm-workspace.yaml
```

## 2. `@cuttle-ui/styles`

- [x] `tokens.css` — color, radius, spacing, type, elevation, motion (light + dark)
- [x] `reset.css` — minimal CSS reset
- [x] `prefers-reduced-motion` and `prefers-color-scheme` handling
- [x] `[data-theme="light" | "dark"]` manual override
- [x] Styling convention: components styled via `[data-cuttle="name"]` and `data-*` state attributes
- [x] Decide focus ring + shimmer-focus recipe (shared utility class / mixin): `.cuttle-focus` in `focus.css`

## 3. `@cuttle-ui/core` utilities

Framework-free TypeScript building blocks every component uses:

- [x] `createId` — stable, SSR-safe IDs
- [x] `createMachine` — tiny state-machine + subscribe pattern
- [x] `focusTrap` — trap and return focus
- [x] `dismissableLayer` — Esc key, outside click, layer stacking
- [x] `portal` helpers
- [x] `positioner` — wrapper over Floating UI
- [x] `scrollLock`
- [x] `typeahead` + `rovingFocus` helpers for menus/lists
- [x] `mergeProps` + event composition
- [x] Unit tests for each (Vitest)

## 4. `@cuttle-ui/react` adapter base

- [x] `useMachine` hook to bind a core machine to React state
- [x] `asChild` / Slot support
- [x] `mergeRefs`, polymorphic typing helpers
- [x] SSR check in a Next.js app router playground: `apps/ssr-check` builds on CI (hydration not yet checked in a browser)

## 5. `@cuttle-ui/icons`

- [x] Small initial SVG set (chevrons, close, check, search, plus, minus, calendar, info, warning)
- [x] Build to framework-agnostic SVG strings + React components

## 6. `@cuttle-ui/cli` (skeleton)

- [x] `cuttle init` — detect framework, write `cuttle.json`, copy `tokens.css` (`npx cuttle` would run another package, see [the npm scope notes](STATUS.md#npm-scope))
- [x] Command structure ready for `add` and `update` (implemented in Phase 1)

## 7. Docs & playground

- [x] Astro docs site in `apps/docs` (island integrations are added when demos need them)
- [x] Pages: Introduction, Installation, Theming, Tokens
- [x] Framework tabs component for code samples
- [x] `apps/playground` dev sandbox (Vite)

## 8. CI/CD

- [x] GitHub Actions: install, lint, typecheck, test, build (Turborepo cache)
- [x] Playwright set up for visual snapshots (Linux baseline committed, compared in CI)
- [x] axe-core test helper
- [ ] Changesets release workflow (npm publish on merge to `main`): written, paused (manual runs only) until the npm scope is chosen
- [ ] Bundle size reporting on PRs: written, has never run

---

## Exit criteria

- [x] `pnpm build` and `pnpm test` pass on CI, and so does the separate end-to-end step
- [x] Tokens render correctly in light and dark mode in the playground (token values checked by end-to-end tests, both modes checked in a browser by Claude, not yet by a person)
- [x] All core utilities have tests
- [x] Docs site deploys ([GitHub Pages](https://ganezhhq.github.io/cuttle-ui/)) with Installation + Theming pages
- [ ] Release pipeline can publish a test package to npm
