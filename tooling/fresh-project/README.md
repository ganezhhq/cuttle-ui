# Fresh project check

Tries Cuttle the way a user would. It packs the packages as npm would publish them, installs them into new apps outside the repository, builds the apps and tests them in a browser.

| Setup          | What it checks                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| `vite-cli`     | `cuttle init`, `add --all` and `update`, a typecheck and a build, then layout and behavior in a browser |
| `next-cli`     | `cuttle init` and `add --all` with `--dir`, a build, then hydration and behavior in a browser                      |
| `vite-package` | The Vite steps from the "Getting started" guide, a typecheck and a build, then behavior in a browser    |
| `next-package` | The Next.js steps from the guide, a build, then the server-rendered page in a browser                   |

The package setups read their code samples from `apps/docs/src/pages/getting-started.astro`, so a broken sample fails this check.

Run `pnpm build` first, and install the browser once with `pnpm --filter @cuttle-ui/fresh-project exec playwright install chromium`.

```bash
pnpm --filter @cuttle-ui/fresh-project check
```

To run one setup, name it:

```bash
pnpm --filter @cuttle-ui/fresh-project check vite-cli
```
