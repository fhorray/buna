import { buna } from "@buna/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import type { UserConfig as ViteUserConfig } from "vite";
import ssrPlugin from "vite-ssr-components/plugin";
import { ensureGeneratedViteConfig } from "./generate.ts";
import type { BunaConfig, ResolvedBunaConfig } from "./type.ts";
import { createViteConfigFromBuna } from "./vite.ts";


function createDefaultViteConfig(root: string, config: BunaConfig): ViteUserConfig {
  return {
    plugins: [
      ssrPlugin(),
      tailwindcss(),
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

// TODO: here should accept BunaConfig, I should verify the type error from the routerDir
export function defineConfig(config: BunaConfig): ResolvedBunaConfig {
  const root = process.cwd();
  const routesDir = config.routesDir ?? 'src/routes';
  const defaultVite = createDefaultViteConfig(root, {
    routesDir,
  });
  const userVite = config.vite ?? {};

  const mergedResolve = {
    ...defaultVite.resolve,
    ...(userVite.resolve ?? {}),
    alias: {
      ...defaultVite.resolve?.alias,
      ...(userVite.resolve?.alias ?? {}),
    },
  };

  const mergedPlugins = [
    ...(defaultVite.plugins ?? []),
    ...(userVite.plugins ?? []),
  ];
  const mergedVite: ViteUserConfig = {
    ...defaultVite,
    ...userVite,
    resolve: mergedResolve,
    plugins: mergedPlugins,
  };

  return {
    ...config,
    vite: mergedVite,
  } as ResolvedBunaConfig
};

export { createViteConfigFromBuna, ensureGeneratedViteConfig };
export type { BunaConfig, ResolvedBunaConfig };

