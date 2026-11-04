# Cuttle UI — Phase Plan

> Simple, catchy, accessible UI components for every framework.

This folder splits the Cuttle UI implementation plan into phases. Each phase has its own file with goals, scope, tasks, and exit criteria. Finish a phase's exit criteria before starting the next.

**Current status and next steps are in [STATUS.md](STATUS.md).**

| Phase | File | Status | Release | Theme | Components | Frameworks added |
|---|---|---|---|---|---|---|
| 0 | [phase-0-foundation.md](phase-0-foundation.md) | In progress | v0.0 | Foundation | — | — |
| 1 | [phase-1-basics.md](phase-1-basics.md) | Not started | v0.1 | Basics | 15 | React |
| 2 | [phase-2-everyday-ui.md](phase-2-everyday-ui.md) | Not started | v0.2 | Everyday UI | 18 | Vue |
| 3 | [phase-3-complex-inputs.md](phase-3-complex-inputs.md) | Not started | v0.3 | Complex inputs | 13 | Angular, Web Components |
| 4 | [phase-4-navigation-layout.md](phase-4-navigation-layout.md) | Not started | v0.4 | Navigation & layout | 15 | Svelte |
| 5 | [phase-5-heavy-components.md](phase-5-heavy-components.md) | Not started | v1.0 | Heavy components + stable release | 10 | — |

## Ground rules for every phase

- **React first, then port.** New components ship in React, then every other active framework via the shared core.
- **Every active framework catches up.** When a framework is added, all earlier components are ported to it in that phase.
- **Quality bar applies to every component** (see below).
- **One monorepo** (`cuttle-ui`), many npm packages (`@cuttle-ui/core`, `@cuttle-ui/styles`, `@cuttle-ui/react`, `@cuttle-ui/vue`, `@cuttle-ui/angular`, `@cuttle-ui/svelte`, `@cuttle-ui/elements`, `@cuttle-ui/cli`).

## Component "done" checklist

- [ ] Core state machine + unit tests (Vitest)
- [ ] Follows the matching WAI-ARIA Authoring Practices pattern
- [ ] Full keyboard support documented
- [ ] axe-core passes; screen-reader tested (NVDA + VoiceOver)
- [ ] Light + dark mode, RTL support
- [ ] `prefers-reduced-motion` respected
- [ ] Controlled + uncontrolled modes
- [ ] SSR-safe (Next.js, Nuxt, Angular SSR, SvelteKit)
- [ ] Adapter tests for every active framework
- [ ] Playwright visual snapshot
- [ ] Docs page: demo, anatomy, API table, keyboard table, a11y notes
- [ ] Bundle size checked

## Visual language (applies to all phases)

- Neutral base, **one accent** (ink-violet `#4f46e5` light / `#818cf8` dark)
- 1px borders, subtle shadows, generous spacing, Geist / Inter type
- Signature details: **ink accent**, **shimmer focus**, **10px radius + pill chips**, **springy motion**, **tinted surfaces**
- All values come from CSS variable tokens in `@cuttle-ui/styles/tokens.css`
