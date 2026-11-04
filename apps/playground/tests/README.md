# Playground tests

Run `pnpm --filter @cuttle-ui/playground test:e2e` after `pnpm exec playwright install chromium`.

Components are at `/?view=components`.

Screenshots differ between operating systems, so comparison only runs in CI, where `VISUAL_SNAPSHOTS=1` is set. It is off on other machines.

To add or update baselines without a failed CI run on `main`:

1. Commit the change locally, without pushing `main`.
2. Push a temporary tag, and run the **Update snapshots** workflow on it: `git tag snapshots-tmp`, `git push origin snapshots-tmp`, then `gh workflow run update-snapshots.yml --ref snapshots-tmp`.
3. Download the `snapshots` artifact, and commit its files to `apps/playground/tests/`.
4. Push `main`, and delete the tag: `git push origin main`, `git tag -d snapshots-tmp`, `git push origin :refs/tags/snapshots-tmp`.
