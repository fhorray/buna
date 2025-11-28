// packages/buna-router/src/runtime-client.ts
import { createRouter } from '@nanostores/router'
import type { RoutesContext, RouteEntry, DirectoryLayer } from './router-core'
import { buildRoutesContextFromModules } from './router-core'

export type RouterConfig = {
  routes: Record<string, string>
  routeComponents: Record<string, RouteEntry['module']['default']>
  routesMeta: Record<
    string,
    {
      pattern: string
      directory: string
      filePath: string
    }
  >
  directoryLayers: Record<string, DirectoryLayer>
  directoryOrder: string[]
  $router: ReturnType<typeof createRouter>
}

/**
 * Build a client-side router config (Nanostores) from import.meta.glob files.
 */
export function createRouterConfigFromGlob(
  files: Record<string, any>,
  options: { routesBase: string }
): RouterConfig {
  const ctx = buildRoutesContextFromModules(files, options)

  const routes: Record<string, string> = {}
  const routeComponents: Record<string, any> = {}
  const routesMeta: RouterConfig['routesMeta'] = {}

  for (const entry of ctx.pageEntries) {
    routes[entry.name] = entry.pattern
    routesMeta[entry.name] = {
      pattern: entry.pattern,
      directory: entry.directory,
      filePath: entry.filePath,
    }

    if (entry.module?.default) {
      routeComponents[entry.name] = entry.module.default
    }
  }

  const $router = createRouter(routes)

  return {
    routes,
    routeComponents,
    routesMeta,
    directoryLayers: ctx.directoryLayers,
    directoryOrder: ctx.sortedDirectories,
    $router: $router as ReturnType<typeof createRouter>,
  }
}