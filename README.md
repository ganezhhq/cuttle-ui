# Cuttle UI

Simple, catchy, accessible UI components for every framework.

> Status: Phase 0 (foundation) is in progress. No public components yet, and nothing is published to npm. See [project status](docs/roadmap/STATUS.md) and the [roadmap](docs/roadmap/README.md).

## Packages

| Package | Purpose |
|---|---|
| `@cuttle/core` | Framework-free state machines and DOM utilities |
| `@cuttle/styles` | CSS tokens, reset and shared recipes |
| `@cuttle/icons` | SVG icons as strings and React components |
| `@cuttle/react` | React adapter |
| `@cuttle/cli` | `cuttle init` and, later, `add` and `update` |

Package names may change, because the `@cuttle` npm scope appears to be taken. See [the blocker](docs/roadmap/STATUS.md#blocker-npm-names-are-taken).

## Develop

Requires Node 22 or newer and pnpm 12.

```bash
pnpm install
pnpm build
pnpm test
```

Setting up a new machine? Follow [the setup steps](docs/roadmap/STATUS.md#set-up-a-new-machine). See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow. Released under the [MIT license](LICENSE).
