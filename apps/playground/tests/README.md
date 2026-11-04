# Playground tests

Run `pnpm --filter @cuttle/playground test:e2e` after `pnpm exec playwright install chromium`.

Screenshot comparison is off unless `VISUAL_SNAPSHOTS=1` is set, because rendering differs between operating systems. Create baselines on Linux, commit them, then set `VISUAL_SNAPSHOTS=1` in CI to turn comparison on:

```bash
VISUAL_SNAPSHOTS=1 pnpm --filter @cuttle/playground exec playwright test --update-snapshots
```
