# Project status and handoff

Last updated: 2026-11-04, after commit `4b6a0b8`, which turned on screenshot comparison in CI.

**Start here when continuing on a new machine.** Phase 0 is mostly built, but it is not finished. Do not start Phase 1 until the [Phase 0 exit criteria](phase-0-foundation.md#exit-criteria) are met.

## Set up a new machine

You need Git and Node 22 or newer.

```bash
git clone https://github.com/ganezhhq/cuttle-ui.git
```

```bash
cd cuttle-ui
```

```bash
npm install -g pnpm@12.16.1
```

```bash
pnpm install
```

```bash
pnpm build
```

```bash
pnpm test
```

Run `pnpm build` before starting an app, because the apps use the built output of the packages.

| Task | Command |
|---|---|
| Open the playground | `pnpm --filter @cuttle-ui/playground dev` |
| Open the docs site | `pnpm --filter @cuttle-ui/docs dev` |
| Install the browser for end-to-end tests (once) | `pnpm --filter @cuttle-ui/playground exec playwright install chromium` |
| Run end-to-end tests | `pnpm --filter @cuttle-ui/playground test:e2e` |

Open the playground through the URL that the dev server prints. Opening `apps/playground/index.html` directly shows a blank page, because the page needs Vite to compile it.

Set your Git name and email on the new machine before committing. This repository is public, so the email you use will be visible.

## Working agreements

- Commit directly to `main`. Do not create feature branches.
- Pushing to `main` starts the CI workflow. The Release workflow is paused and only runs manually for now.
- TypeScript stays on 5.9, because `typescript-eslint` does not support TypeScript 7 yet.
- React packages require React 19 or newer.

## Current state

From [CI run 41844876155](https://github.com/ganezhhq/cuttle-ui/actions/runs/41844876155) on commit `4b6a0b8`:

| Check | Result |
|---|---|
| Install, commit messages, lint, typecheck | Passed |
| Unit tests (`pnpm test`) | Passed |
| Build, including the docs site and Next.js SSR check | Passed |
| End-to-end tests (`test:e2e`), including screenshot comparison | Passed |
| Release workflow | Paused, so it did not run. Its last run failed on `9bd1fc2`, and nothing was published |

Not checked yet:

- The playground and docs site were opened in a browser by Claude, not yet by a person. The playground was checked in light and dark mode, and the theme buttons work. On the docs site, the Introduction, Installation and Theming pages were checked in light mode and the Tokens page in dark mode. Neither site logged console errors.
- The docs site is built but not deployed.
- Bundle size reporting only runs on pull requests, so it has never run.

## Next steps, in order

1. **Create the `@cuttle-ui` organisation on npm (owner action).** See [npm scope](#npm-scope).
2. **Turn automatic publishing back on.** The Release workflow is paused and only runs manually, because it tried to publish on every push and failed with a 404. Set real versions and add the `NPM_TOKEN` repository secret, then restore the `push` trigger in `.github/workflows/release.yml`. Set real versions first, because with a token and no pending changesets, any run can publish version `0.0.0`. This applies to manual runs too. Then update the Release note in `CLAUDE.md` and `CONTRIBUTING.md` if needed.
3. **Prove the release pipeline** by publishing a test package to npm.
4. **Deploy the docs site**, for example to Vercel.
5. **Open the playground and docs site** and check them by eye. Automated checks are done, so this only needs a person's look.
6. **Create the roadmap board.** This needs the `project` scope on the GitHub CLI token (`gh auth refresh -s project`).

## npm scope

- The packages use the `@cuttle-ui` scope. `@cuttle/core` on npm belongs to another maintainer, so the original `@cuttle` scope could not be used.
- The `@cuttle-ui` npm organisation must be created by the owner before anything can be published. Its availability has not been confirmed.
- The unscoped `cuttle` package also exists, at version 0.8.0. `npx cuttle init` would run that package, not ours. The docs use `npx @cuttle-ui/cli init`.

## Differences from the original plan

- Roadmap files moved from the repository root to `docs/roadmap/`, and the root `README.md` is now the project README.
- `apps/ssr-check` was added for the Next.js SSR check, as a separate app from the Vite playground.
- The shared Prettier config is at the repository root, not in `tooling/eslint-config`.
- The focus recipe is the `.cuttle-focus` class in `packages/styles/focus.css`.
- The docs site does not have framework integrations installed yet. Add `@astrojs/react` and the others when live demos need them.
