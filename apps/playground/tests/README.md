# Playground tests

Run `pnpm --filter @cuttle-ui/playground test:e2e` after `pnpm exec playwright install chromium`.

Screenshots differ between operating systems, so comparison only runs in CI, where `VISUAL_SNAPSHOTS=1` is set. It is off on other machines.

To update the baselines after an intended visual change, run the **Update snapshots** workflow on GitHub, download its `snapshots` artifact, and commit the files to `apps/playground/tests/`.
