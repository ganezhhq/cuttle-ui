# Phase 0 — Foundation (v0.0)

**Goal:** Set up the monorepo, tokens, core utilities, tooling and docs skeleton so every later component has a solid base.

**Ships:** no public components. Internal release only.

---

## 1. Repository setup

- [ ] Create GitHub repo `cuttle-ui` under GanezhHQ
- [ ] pnpm workspaces + Turborepo
- [ ] Shared `tsconfig` (strict) in `tooling/tsconfig`
- [ ] Shared ESLint + Prettier config in `tooling/eslint-config`
- [ ] Changesets for versioning
- [ ] Conventional Commits + commitlint
- [ ] MIT `LICENSE`, `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`
- [ ] Issue templates: bug, feature, new component proposal
- [ ] GitHub Discussions + public roadmap (GitHub Projects)

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
│   └── playground/
├── tooling/
├── .changeset/
├── turbo.json
└── pnpm-workspace.yaml
```

## 2. `@cuttle/styles`

- [ ] `tokens.css` — color, radius, spacing, type, elevation, motion (light + dark)
- [ ] `reset.css` — minimal CSS reset
- [ ] `prefers-reduced-motion` and `prefers-color-scheme` handling
- [ ] `[data-theme="light" | "dark"]` manual override
- [ ] Styling convention: components styled via `[data-cuttle="name"]` and `data-*` state attributes
- [ ] Decide focus ring + shimmer-focus recipe (shared utility class / mixin)

## 3. `@cuttle/core` utilities

Framework-free TypeScript building blocks every component uses:

- [ ] `createId` — stable, SSR-safe IDs
- [ ] `createMachine` — tiny state-machine + subscribe pattern
- [ ] `focusTrap` — trap and return focus
- [ ] `dismissableLayer` — Esc key, outside click, layer stacking
- [ ] `portal` helpers
- [ ] `positioner` — wrapper over Floating UI
- [ ] `scrollLock`
- [ ] `typeahead` + `rovingFocus` helpers for menus/lists
- [ ] `mergeProps` + event composition
- [ ] Unit tests for each (Vitest)

## 4. `@cuttle/react` adapter base

- [ ] `useMachine` hook to bind a core machine to React state
- [ ] `asChild` / Slot support
- [ ] `mergeRefs`, polymorphic typing helpers
- [ ] SSR check in a Next.js app router playground

## 5. `@cuttle/icons`

- [ ] Small initial SVG set (chevrons, close, check, search, plus, minus, calendar, info, warning)
- [ ] Build to framework-agnostic SVG strings + React components

## 6. `@cuttle/cli` (skeleton)

- [ ] `npx cuttle init` — detect framework, write `cuttle.json`, copy `tokens.css`
- [ ] Command structure ready for `add` and `update` (implemented in Phase 1)

## 7. Docs & playground

- [ ] Astro docs site in `apps/docs` (supports React/Vue/Svelte islands)
- [ ] Pages: Introduction, Installation, Theming, Tokens
- [ ] Framework tabs component for code samples
- [ ] `apps/playground` dev sandbox (Vite)

## 8. CI/CD

- [ ] GitHub Actions: install, lint, typecheck, test, build (Turborepo cache)
- [ ] Playwright set up for visual snapshots
- [ ] axe-core test helper
- [ ] Changesets release workflow (npm publish on merge to `main`)
- [ ] Bundle size reporting on PRs

---

## Exit criteria

- [ ] `pnpm build` and `pnpm test` pass on CI
- [ ] Tokens render correctly in light and dark mode in the playground
- [ ] All core utilities have tests
- [ ] Docs site deploys (e.g. Vercel) with Installation + Theming pages
- [ ] Release pipeline can publish a test package to npm
