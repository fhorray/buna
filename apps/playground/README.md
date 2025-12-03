# Buna Playground

## Installation

```bash
bun install
```

## App scripts (`apps/playground`)

| Command                | Description                                                                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run buna:prepare` | Cleans `.buna`, regenerates the routes (`buna codegen`), and recreates the hidden runner in `.buna/build.ts`.                                       |
| `bun run dev`          | Runs `buna:prepare` and starts the server with `bun --hot src/entry.ts`. Use this command (or `buna dev`) to avoid `#buna/routes.generated` errors. |
| `bun run build`        | Runs `buna:prepare` and executes `.buna/build.ts`, respecting the selected target (`bun`, `node`, or `cloudflare`).                                 |
| `bun run check-types`  | Runs `tsc --noEmit` to check types in the playground.                                                                                               |

## Global monorepo commands

All commands below must be executed from the root directory (`/buna`):

| Command | Description |
| ------- | ----------- |
| `buna dev` | Runs Turborepo in development mode (apps + packages) and calls each workspace’s `buna:prepare`. |
| `buna build --runtime <bun\|node\|cloudflare>` | Runs the full build pipeline (packages + apps). When `cloudflare` is selected the worker bundle is written to `.buna/cloudflare-worker`. |
| `buna build` | Same as above but the runtime is chosen interactively via the CLI prompts. |
| `buna check-types` | Runs `tsc --noEmit` across all workspaces. |
| `buna codegen --config apps/playground/buna.config.ts` | Manually regenerates `.buna/routes.generated.ts`. Usually called by `buna:prepare`. |

## Cloudflare bundle layout

Running `buna build --runtime cloudflare` creates the worker payload at `.buna/cloudflare-worker/` with the following files:

- `worker.js`: the request handler that proxies asset fetches to Wrangler’s `ASSETS` binding and serves the compiled HTML.
- `assets/`: hashed JS/CSS artifacts referenced in the HTML and exposed through the `ASSETS` binding configured in `wrangler.jsonc`.
- `pages/`: HTML snapshots emitted from `.buna/pages` for visibility/debugging.
- Use `apps/playground/wrangler.jsonc` (already pointing to these locations) to run `wrangler dev` or `wrangler deploy`.

## Notes

* Always use `bun run dev` (or `buna dev`) during development, as this ensures `.buna` is recreated before starting the server.
* Worker artifacts are located in `.buna/cloudflare-worker`. Run `buna build --runtime cloudflare` to regenerate them whenever routes or assets change.
