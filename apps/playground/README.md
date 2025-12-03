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

| Command                                                | Description                                                                                                               |              |                                                                                                                                                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `buna dev`                                             | Runs Turborepo in development mode (includes apps and packages), automatically executing the playground’s `buna:prepare`. |              |                                                                                                                                                                                      |
| `buna build --runtime <bun                             | node                                                                                                                      | cloudflare>` | Runs the full build pipeline (packages + apps). For the playground, it creates the Cloudflare worker at `.buna/cloudflare-worker/worker.js` when `--runtime cloudflare` is selected. |
| `buna check-types`                                     | Runs `tsc --noEmit` across all workspaces.                                                                                |              |                                                                                                                                                                                      |
| `buna codegen --config apps/playground/buna.config.ts` | Manually generates the routes in `.buna/routes.generated.ts`. It is usually called by `buna:prepare`.                     |              |                                                                                                                                                                                      |

## Notes

* Always use `bun run dev` (or `buna dev`) during development, as this ensures `.buna` is recreated before starting the server.
* Worker artifacts are located in `.buna/cloudflare-worker`. Run `buna build --runtime cloudflare` to generate them again.
