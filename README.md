# Cuttle UI

Simple, catchy, accessible UI components for every framework.

> Status: Phase 0 (foundation) is in progress. No public components yet, and nothing is published to npm. See [project status](docs/roadmap/STATUS.md) and the [roadmap](docs/roadmap/README.md).

## Packages

| Package | Purpose |
|---|---|
| `@cuttle-ui/core` | Framework-free state machines and DOM utilities |
| `@cuttle-ui/styles` | CSS tokens, reset and shared recipes |
| `@cuttle-ui/icons` | SVG icons as strings and React components |
| `@cuttle-ui/react` | React adapter |
| `@cuttle-ui/cli` | `cuttle init` and, later, `add` and `update` |

Nothing is published under the `@cuttle-ui` scope yet. See [the npm scope notes](docs/roadmap/STATUS.md#npm-scope).

## Develop

Requires Node 22 or newer and pnpm 12.

```bash
pnpm install
pnpm build
pnpm test
```

Setting up a new machine? Follow [the setup steps](docs/roadmap/STATUS.md#set-up-a-new-machine). See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow. Released under the [MIT license](LICENSE).
