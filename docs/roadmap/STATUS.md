# Project status and handoff

Last updated: 2026-11-04, at the Phase 0 scaffold commit `c94287a`.

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
| Open the playground | `pnpm --filter @cuttle/playground dev` |
| Open the docs site | `pnpm --filter @cuttle/docs dev` |
| Install the browser for end-to-end tests (once) | `pnpm --filter @cuttle/playground exec playwright install chromium` |
| Run end-to-end tests | `pnpm --filter @cuttle/playground test:e2e` |

Open the playground through the URL that the dev server prints. Opening `apps/playground/index.html` directly shows a blank page, because the page needs Vite to compile it.

Set your Git name and email on the new machine before committing. This repository is public, so the email you use will be visible.

## Working agreements

- Commit directly to `main`. Do not create feature branches.
- Pushing to `main` starts the CI and Release workflows.
- TypeScript stays on 5.9, because `typescript-eslint` does not support TypeScript 7 yet.
- React packages require React 19 or newer.

## Current state

From [CI run 41823985762](https://github.com/ganezhhq/cuttle-ui/actions/runs/41823985762):

| Check | Result |
|---|---|
| Install, lint, typecheck | Passed |
| Unit tests (`pnpm test`) | Passed |
| Build, including the docs site and Next.js SSR check | Passed |
| End-to-end tests (`test:e2e`) | **1 failed**, 5 passed |
| Release workflow | **Failed**, nothing was published |

Not checked yet:

- The playground and docs site have not been opened and looked at by a person. End-to-end tests cover token values and axe-core on the playground only.
- The docs site is built but not deployed.
- Bundle size reporting only runs on pull requests, so it has never run.
- Visual snapshots have no baselines, so screenshot comparison is off.

## Next steps, in order

1. **Fix the failing end-to-end test.** In `apps/playground/tests/tokens.spec.ts` (line 49), the test expects `0ms` but receives `0s`. Both mean the same thing, so the test should accept either, for example `toMatch(/^0m?s$/)`. This should turn CI green.
2. **Choose the npm scope (decision needed).** See the blocker below.
3. **Stop the Release workflow failing on every push.** It tries to publish whenever no changesets are pending, and currently fails with a 404. Rename the packages and add the `NPM_TOKEN` repository secret, or disable the workflow until then. Once a token is added, any push to `main` with no pending changesets can publish version `0.0.0`, so set real versions first.
4. **Prove the release pipeline** by publishing a test package to npm.
5. **Deploy the docs site**, for example to Vercel.
6. **Open the playground and docs site** and check them by eye in light and dark mode.
7. **Finish the smaller items:** enforce commitlint with a commit hook or CI step, create Linux snapshot baselines, and turn on GitHub Discussions and the roadmap board.

## Blocker: npm names are taken

- `@cuttle/core` already exists on npm at version 1.0.6. It was not published by this project, so the `@cuttle` scope probably belongs to someone else. Check its owner on npmjs.com.
- Unless you control that scope, the packages need a new scope, such as one you own. Renaming affects every `package.json`, the imports, the lockfile and these docs, so do it before Phase 1.
- The unscoped `cuttle` package also exists, at version 0.8.0. `npx cuttle init` would run that package, not ours. The docs use `npx @cuttle/cli init` for now, and that command must change with the scope.

## Differences from the original plan

- Roadmap files moved from the repository root to `docs/roadmap/`, and the root `README.md` is now the project README.
- `apps/ssr-check` was added for the Next.js SSR check, as a separate app from the Vite playground.
- The shared Prettier config is at the repository root, not in `tooling/eslint-config`.
- The focus recipe is the `.cuttle-focus` class in `packages/styles/focus.css`.
- The docs site does not have framework integrations installed yet. Add `@astrojs/react` and the others when live demos need them.
