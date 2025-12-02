import type { BunaConfig, ResolvedBunaConfig } from "./types";
import { resolve } from "node:path";

export function defineConfig(config: BunaConfig): ResolvedBunaConfig {
  const cwd = process.cwd();

  if (!config.routesDir || !config.outDir) {
    throw new Error("buna config requires 'routesDir' and 'outDir'.");
  }

  return {
    routesDir: resolve(cwd, config.routesDir),
    outDir: resolve(cwd, config.outDir),
    routes: config.routes
  };
}
