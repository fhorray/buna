// packages/buna-router/src/runtime-hono.ts
import { Hono } from 'hono';
import type { RoutesContext } from './router-core';
import { buildRoutesContextFromModules } from './router-core';

export type HonoConfig = {
  app: Hono;
  routesMeta: {
    pattern: string;
    filePath: string;
    directory: string;
  }[];
  directoryLayers: RoutesContext['directoryLayers'];
  directoryOrder: string[];
};

/**
 * Build a Hono app from import.meta.glob files.
 * Each page entry becomes a GET route.
 */
export function createHonoAppFromGlob(
  files: Record<string, any>,
  options: { routesBase: string },
): HonoConfig {
  const ctx = buildRoutesContextFromModules(files, options);

  const app = new Hono();

  for (const entry of ctx.pageEntries) {
    const Component = entry.module?.default;
    if (!Component) continue;

    app.get(entry.pattern, (c) =>
      c.render(<Component c={c} params={c.req.param()} />),
    );
  }

  const routesMeta = ctx.pageEntries.map((entry) => ({
    pattern: entry.pattern,
    filePath: entry.filePath,
    directory: entry.directory,
  }));

  return {
    app,
    routesMeta,
    directoryLayers: ctx.directoryLayers,
    directoryOrder: ctx.sortedDirectories,
  };
}
