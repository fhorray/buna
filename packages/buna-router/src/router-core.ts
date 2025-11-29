import { FC } from 'hono/jsx'
import {
  filePathToPath,
  groupByDirectory,
  listByDirectory,
  sortDirectoriesByDepth,
  pathToDirectoryPath,
} from './fs-helpers'

export type RouteModule = {
  default?: FC
  [key: string]: any
}

export type RouteEntry = {
  name: string
  pattern: string
  directory: string // '' | 'blog' | 'blog/admin'
  filePath: string // relative to routes base, with extension
  module: RouteModule
}

export type DirectoryLayer = {
  notFound?: RouteModule['default']
  layout?: RouteModule['default']
  error?: RouteModule['default']
  loading?: RouteModule['default']
}

export type RoutesContext = {
  entries: RouteEntry[]
  pageEntries: RouteEntry[]
  directoryLayers: Record<string, DirectoryLayer>
  sortedDirectories: string[]
}

/**
 * Build a routes context from a Vite import.meta.glob map.
 * files keys must be absolute or root-relative paths including the routesBase.
 */
export function buildRoutesContextFromModules(
  files: Record<string, RouteModule>,
  options: { routesBase: string }
): RoutesContext {
  const routesBase = normalizeBase(options.routesBase)

  const entries: RouteEntry[] = []
  const entryByRelFile: Record<string, RouteEntry> = {}
  const fileMapRelToModule: Record<string, RouteModule> = {}

  for (const [absPath, mod] of Object.entries(files)) {
    const relWithExt = normalizeRelativePath(absPath, routesBase)
    fileMapRelToModule[relWithExt] = mod

    const entry = toRouteEntryFromModule(relWithExt, mod)
    entries.push(entry)
    entryByRelFile[entry.filePath] = entry
  }

  const pageEntries = entries.filter((e) => {
    const base = e.filePath.split('/').pop() ?? ''
    const baseNoExt = base.replace(/\.(tsx?|jsx?|mdx?)$/, '')
    return !baseNoExt.startsWith('_')
  })

  const groupedByDir = groupByDirectory(fileMapRelToModule)
  const sortedDirObjects = sortDirectoriesByDepth(groupedByDir)
  const sortedDirectories = sortedDirObjects.map((obj) => Object.keys(obj)[0] ?? '')

  const filesByDirWithInheritance = listByDirectory(fileMapRelToModule)

  const directoryLayers: Record<string, DirectoryLayer> = {}

  const kindToSuffix: Record<keyof DirectoryLayer, string> = {
    notFound: '_not-found.tsx',
    layout: '_layout.tsx',
    error: '_error.tsx',
    loading: '_loading.tsx',
  }

  for (const dir of sortedDirectories) {
    const inheritedFiles = filesByDirWithInheritance[dir] ?? []
    const ownFileNames = Object.keys(groupedByDir[dir] ?? {}) // tipo: ['_layout.tsx', 'index.tsx']
    const ownFiles = ownFileNames.map((name) =>
      dir ? `${dir}/${name}` : name,
    )

    const layer: DirectoryLayer = {}

      ; (Object.keys(kindToSuffix) as (keyof DirectoryLayer)[]).forEach((kind) => {
        const suffix = kindToSuffix[kind]

        // layout: only look files inside its own directory
        // others: (eror, notFound, loading): normal inheritance
        const relFiles =
          kind === 'layout'
            ? ownFiles
            : inheritedFiles

        const candidates = relFiles.filter((rel) => rel.endsWith(suffix))
        if (candidates.length > 0) {
          const chosenRel = candidates[candidates.length - 1]
          const entry = entryByRelFile[chosenRel]
          if (entry?.module?.default) {
            layer[kind] = entry.module.default
          }
        }
      })

    directoryLayers[dir] = layer
  }

  return {
    entries,
    pageEntries,
    directoryLayers,
    sortedDirectories,
  }
}

function normalizeBase(base: string): string {
  let b = base.replace(/\\/g, '/')
  if (!b.startsWith('/')) b = '/' + b
  return b.replace(/\/$/, '')
}

function normalizeRelativePath(absPath: string, routesBase: string): string {
  const normalizedAbs = absPath.replace(/\\/g, '/')
  const base = routesBase.replace(/\\/g, '/').replace(/\/$/, '')
  if (!normalizedAbs.startsWith(base)) {
    throw new Error(
      `[buna-router] File path "${normalizedAbs}" does not start with routesBase "${base}".`
    )
  }
  const rel = normalizedAbs.slice(base.length + 1) // remove "base/"
  return rel
}

function toRouteEntryFromModule(relWithExt: string, mod: RouteModule): RouteEntry {
  const relNoExt = relWithExt.replace(/\.(tsx?|jsx?|mdx?)$/, '')

  const pattern = filePathToPath(relWithExt)

  const segments = relNoExt.split('/')
  const isIndex = segments.at(-1) === 'index'
  const effectiveSegments = isIndex ? segments.slice(0, -1) : segments

  const name =
    effectiveSegments.length === 0
      ? 'home'
      : effectiveSegments
        .map((seg) =>
          seg
            .replace(/^\[|\]$/g, '')
            .replace(/\?/g, '')
            .replace(/[^a-zA-Z0-9]+/g, '_')
        )
        .join('_')

  const directoryRaw = pathToDirectoryPath(relWithExt) // 'blog/' | ''
  const directory = directoryRaw.replace(/\/$/, '') // 'blog' | ''

  return {
    name,
    pattern,
    directory,
    filePath: relWithExt,
    module: mod,
  }
}