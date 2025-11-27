// packages/buna-config/src/types.ts
import type { UserConfig as ViteUserConfig } from 'vite'

export type BunaConfig = {
  /**
   * Root directory of the project.
   * If not provided, it will default to process.cwd().
   * 
   * Use this only if your project is NOT located at the repository root
   * or if you want Buna to scan/build from a specific directory.
   */
  root?: string

  /**
   * Settings for file-based routes.
   * Used by the Buna plugin to automatically scan and generate route files.
   */
  routes?: {
    /**
     * Directory where page files are located.
     * React components inside this folder will be treated as pages.
     * 
     * Example:
     *  'src/routes'  →  /about.tsx  →  /about
     */
    dir?: string
  }

  /**
   * Configuration of the dev server only.
   * Useful when overriding the default port or customizing server behavior.
   */
  server?: {
    /**
     * Port number used by Vite dev server.
     * Default: 5173
     */
    port?: number
  }

  /**
   * (Optional) Overrides for Vite itself.
   * Use this to inject extra Vite plugins or custom resolve settings.
   *
   * Everything defined here will be merged with Buna's defaults,
   * so this is the right place for user-level customization.
   */
  vite?: ViteUserConfig
}
