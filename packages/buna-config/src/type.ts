import type { UserConfig as ViteUserConfig } from 'vite'

export type BunaConfig = {
  /**
   * Relative path (from project root) to the routes directory
   * Example: 'src/routes'
   */
  routesDir?: string
  /**
   * Relative path (from project root) to the server directory
   * Example: 'src/server'
   */
  serverDir?: string

  /**
   * Relative path (from project root) to the generated client routes file
   * Example: '.buna/client-routes.generated.ts'
   */
  outputClient?: string

  /**
   * Relative path (from project root) to the generated Hono routes file
   * Example: '.buna/server-routes.generated.tsx'
   */
  outputHono?: string

  /**
   * Relative path (from project root) to your Hono API entry file.
   * Example: 'src/server/api.ts' or 'apps/playground/src/server/index.tsx'
   */
  apiFile?: string;


  /**
   * Where to generate nanoquery stores file.
   * Example: '.buna/query.generated.ts'
   */
  outputQuery?: string;

  apiBasePath?: string;


  /**
   * (Optional) Overrides for Vite itself.
   * Use this to inject extra Vite plugins or custom resolve settings.
   *
   * Everything defined here will be merged with Buna's defaults,
   * so this is the right place for user-level customization.
   */
  vite?: ViteUserConfig
}

export type ResolvedBunaConfig = {
  routesDir: string
  serverDir: string
  outputClient: string
  outputHono: string
  apiFile: string
  outputQuery: string;
  apiBasePath: string;
  vite: ViteUserConfig
}