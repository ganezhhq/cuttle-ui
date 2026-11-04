# Project status and handoff

Last updated: 2026-11-04, after commit `5e9afeb`, which fixed the end-to-end test.

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
- Pushing to `main` starts the CI workflow. The Release workflow is paused and only runs manually for now.
- TypeScript stays on 5.9, because `typescript-eslint` does not support TypeScript 7 yet.
- React packages require React 19 or newer.

## Current state

From [CI run 41842420616](https://github.com/ganezhhq/cuttle-ui/actions/runs/41842420616) and [Release run 41842420667](https://github.com/ganezhhq/cuttle-ui/actions/runs/41842420667), both on commit `5e9afeb`:

| Check | Result |
|---|---|
| Install, lint, typecheck | Passed |
| Unit tests (`pnpm test`) | Passed |
| Build, including the docs site and Next.js SSR check | Passed |
| End-to-end tests (`test:e2e`) | Passed |
| Release workflow | **Failed** on that run, nothing was published. Now paused, see next steps |

Not checked yet:

- The playground and docs site have not been opened and looked at by a person. End-to-end tests cover token values and axe-core on the playground only.
- The docs site is built but not deployed.
- Bundle size reporting only runs on pull requests, so it has never run.
- Visual snapshots have no baselines, so screenshot comparison is off.

## Next steps, in order

1. **Choose the npm scope (decision needed).** See the blocker below.
2. **Turn automatic publishing back on.** The Release workflow is paused and only runs manually, because it tried to publish on every push and failed with a 404. Rename the packages, set real versions and add the `NPM_TOKEN` repository secret, then restore the `push` trigger in `.github/workflows/release.yml`. Set real versions first, because with a token and no pending changesets, any run can publish version `0.0.0`. This applies to manual runs too. Then update the Release note in `CLAUDE.md` and `CONTRIBUTING.md` if needed.
3. **Prove the release pipeline** by publishing a test package to npm.
4. **Deploy the docs site**, for example to Vercel.
5. **Open the playground and docs site** and check them by eye in light and dark mode.
6. **Finish the smaller items:** enforce commitlint with a commit hook or CI step, create Linux snapshot baselines, and turn on GitHub Discussions and the roadmap board.

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
