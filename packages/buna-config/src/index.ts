import type { BunaConfig } from "./type";
import type { PluginOption, UserConfig as ViteUserConfig } from "vite";
import { ensureGeneratedViteConfig } from "./generate.ts"
import { createViteConfigFromBuna } from "./vite.ts"
import { resolve } from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import ssrPlugin from "vite-ssr-components/plugin";
import tailwindcss from "@tailwindcss/vite";
import { buna } from "@buna/vite-plugin";

function createDefaultViteConfig(root: string, routesDir: string): ViteUserConfig {
  return {
    plugins: [
      cloudflare(),
      ssrPlugin(),
      tailwindcss(),
      buna({
        routesDir,
      }),
    ],
    resolve: {
      alias: {
        "#router": resolve(root, ".buna/client-routes.generated.ts"),
        "#hono-app": resolve(root, ".buna/hono-routes.generated.ts"),
        "@": resolve(root, "src"),
      },
    },
  };
}

export function defineConfig(config: BunaConfig): BunaConfig {
  const root = config.root ?? process.cwd();
  const routesDir = config.routes?.dir ?? 'src/routes';
  const defaultVite = createDefaultViteConfig(root, routesDir);
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
  }
};

export type { BunaConfig }
export { ensureGeneratedViteConfig, createViteConfigFromBuna }
