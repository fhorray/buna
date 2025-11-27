import path from "node:path";
import type { UserConfig } from "vite";
import type { BunaConfig } from "./type";
import hono from "@hono/vite-dev-server"

export function createViteConfigFromBuna(config: BunaConfig): UserConfig {
  const root = config.root ?? process.cwd();
  const routesDir = config.routes?.dir ?? 'src/routes';
  const userVite = config.vite ?? {};

  const finalConfig: UserConfig = {
    root,
    server: {
      port: config.server?.port ?? 5173,
      ...userVite.server,
    },
    ...userVite,
    plugins: [
      ...(userVite.plugins ?? []),
      hono({
        entry: path.resolve(root, 'src/server.tsx')
      }),
    ],
  }

  return finalConfig
}
