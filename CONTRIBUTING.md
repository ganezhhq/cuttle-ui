# Contributing

1. Install dependencies with `pnpm install` (Node 22 or newer, pnpm 12), then run `pnpm build`.
2. Commit directly to `main`. This project does not use feature branches.
3. Before pushing, run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`. Pushing to `main` starts the CI workflow. The Release workflow is paused and only runs manually for now.
4. Add a changeset with `pnpm changeset` if a published package changed.
5. Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages, for example `feat(core): add scroll lock`.

New components must meet the "done" checklist in the [roadmap](docs/roadmap/README.md). For current status and next steps, see [STATUS.md](docs/roadmap/STATUS.md).
