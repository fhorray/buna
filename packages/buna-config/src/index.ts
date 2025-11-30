import { buna } from "@buna/vite-plugin";
import { resolve } from "node:path";
import type { UserConfig as ViteUserConfig } from "vite";
import { ensureGeneratedViteConfig } from "./generate.ts";
import type { BunaConfig, ResolvedBunaConfig, BunaRuntime } from "./type.ts";
import { createViteConfigFromBuna } from "./vite.ts";


function createDefaultViteConfig(root: string, config: BunaConfig): ViteUserConfig {
  return {
    plugins: [

      buna(config),
    ],
    resolve: {
      alias: {
        "#router": resolve(root, ".buna/client-routes.generated.ts"),
        "#server": resolve(root, ".buna/server-routes.generated.ts"),
        "#api": resolve(root, ".buna/query.generated.ts"),
        "@": resolve(root, "src"),
      },
    },
  };
}

export function defineConfig(config: BunaConfig): ResolvedBunaConfig {
  const root = process.cwd();
  const routesDir = config.routesDir ?? 'src/routes';

  const defaultVite = createDefaultViteConfig(root, {
    routesDir,
  });

  return {
    // runtime: config.runtime === "node" ? "node" : "cloudflare", // for future implementation
    routesDir,
    serverDir: config.serverDir ?? 'src/server',
    outputClient: config.outputClient ?? '.buna/client-routes.generated.ts',
    outputHono: config.outputHono ?? '.buna/server-routes.generated.ts',
    apiFile: config.apiFile ?? 'src/server/api.ts',
    outputQuery: config.outputQuery ?? '.buna/query.generated.ts',
    outputTypes: config.outputTypes ?? '.buna/routes.generated.d.ts',
    apiBasePath: config.apiBasePath ?? '/api',
    vite: {
      ...defaultVite,
      ...config.vite,
      plugins: [
        ...(defaultVite.plugins ?? []),
        ...(config.vite?.plugins ?? []),
      ],
    },
  };
}

export { createViteConfigFromBuna, ensureGeneratedViteConfig };
export type { BunaConfig, ResolvedBunaConfig, BunaRuntime };

