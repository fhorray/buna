# Buna → Cloudflare Worker

Use the builder in this folder to turn a Buna project into a Worker ready to deploy on Cloudflare.

## Prerequisites

- Run the commands from the app directory (e.g. `apps/playground`) so that `buna.config.ts` is resolved correctly.
- Run `bun run ../../packages/buna/src/cli/index.ts codegen` (or the `buna:codegen` script) before starting the build to make sure `.buna/` is up to date.

## How to use

```bash
# inside the app
bun run ../../packages/buna/src/cloudflare/index.ts --config buna.config.ts
```

Useful options:

* `--dev`: disables minification and cache headers to make debugging easier.
* `--out <dir>`: changes the output directory (default: `<outDir>/cloudflare-worker`).
* `--assets-base <path>`: changes the public prefix for assets (default: `/_buna/assets`).
* `--skip-codegen`: skips running `generateRoutes` automatically (if you’ve already executed it).
* Using Tailwind via `<link href="tailwindcss" />` requires `bun-plugin-tailwind` + `tailwindcss` to be installed in your app (the builder will compile and include the generated CSS automatically).

The command generates:

* A worker (`worker.js`) containing all HTML routing and in-memory assets.
* Bundles for the `.tsx` files imported from the generated HTML files.

Then just deploy the resulting `worker.js` to Cloudflare Workers.
