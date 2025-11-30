import path from 'node:path';
import type { UserConfig } from 'vite';
import type { BunaConfig, BunaRuntime } from './type';
import devServer from '@hono/vite-dev-server';
import buildNode from '@hono/vite-build/node';

export function createViteConfigFromBuna(config: BunaConfig): UserConfig {
  const root = process.cwd();
  // const runtime: BunaRuntime = config.runtime ?? 'cloudflare';
  const userVite = config.vite ?? {};

  const plugins = [...(userVite.plugins ?? [])];

  // For future implementation
  // if (runtime === 'node') {
  // Enable Node runtime build (server + client)
  // This injects proper entries for both SSR and client-side hydration.
  // plugins.push(
  //   buildNode({
  //     entry: path.resolve(root, 'src/server/index.tsx'),
  //     port: 3001,
  //     // Optional: explicit entries can be defined here.
  //     // If omitted, sensible defaults will be used.
  //     // entry: path.resolve(root, 'src/server/index.tsx'),
  //     // client: path.resolve(root, 'src/client.tsx'),
  //   }) as any,
  // );

  // Dev server for Node runtime (supports SSR + HMR)
  plugins.push(
    devServer({
      // Explicit server entry for SSR during development
      entry: path.resolve(root, 'src/server/index.tsx'),
    }) as any,
  );
  // } else {
  // Cloudflare runtime:
  // Do NOT include devServer here, because @cloudflare/vite-plugin
  // already handles all required Worker integration internally.
  // Any Cloudflare configuration should be added directly
  // by the user through userVite.plugins (e.g., cloudflare()).
  // }

  return {
    // Spread all user-provided Vite settings
    ...userVite,
    root,

    // Preserve user server config but always guarantee a port (default: 5173)
    server: {
      port: userVite.server?.port ?? 5173,
      ...(userVite.server ?? {}),
    },

    // Final list of plugins (user plugins + runtime plugins)
    plugins,
  };
}