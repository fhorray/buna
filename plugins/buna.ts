// scripts/vite-auto-routes.ts
import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

const ROUTES_DIR = 'src/routes'

// aqui você escolhe onde quer cachear:
const OUTPUT_FRONT = '.buna/client-routes.generated.ts'
const OUTPUT_HONO = '.buna/hono-routes.generated.tsx'

type RouteEntry = {
  name: string
  pattern: string
  importPath: string
  importName: string
}

function walkRoutesDir(rootDir: string): string[] {
  const result: string[] = []

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
        result.push(full)
      }
    }
  }

  walk(rootDir)
  return result
}

function toRouteEntry(rootDir: string, filePath: string, projectRoot: string): RouteEntry | null {
  const relFromRoutes = path
    .relative(rootDir, filePath)
    .replace(/\\/g, '/')
    .replace(/\.(tsx?|jsx?)$/, '')

  const segments = relFromRoutes.split('/')
  const isIndex = segments.at(-1) === 'index'
  const effectiveSegments = isIndex ? segments.slice(0, -1) : segments

  let patternSegments = effectiveSegments.map((seg) => {
    if (/^\[.*\]$/.test(seg)) {
      const raw = seg.slice(1, -1)
      const optional = raw.endsWith('?')
      const name = optional ? raw.slice(0, -1) : raw
      return ':' + name + (optional ? '?' : '')
    }
    return seg === 'index' ? '' : seg
  })

  if (patternSegments.length === 0) {
    patternSegments = ['']
  }

  const pattern =
    '/' +
    patternSegments
      .filter(Boolean)
      .join('/')
      .replace(/\/+/g, '/')

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

  const importName =
    'Route_' +
    name
      .split('_')
      .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ''))
      .join('')

  // caminho de import relativo ao arquivo gerado do FRONT (OUTPUT_FRONT)
  const outputDir = path.dirname(path.resolve(projectRoot, OUTPUT_FRONT))
  const absFilePath = path.resolve(filePath)
  let importPath = path.relative(outputDir, absFilePath).replace(/\\/g, '/')
  if (!importPath.startsWith('.')) {
    importPath = './' + importPath
  }

  return { name, pattern, importPath, importName }
}

function writeFileSafe(projectRoot: string, relPath: string, content: string) {
  const fullPath = path.resolve(projectRoot, relPath)
  const dir = path.dirname(fullPath)

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(fullPath, content, 'utf8')
}

function generateFiles(projectRoot: string) {
  const routesDir = path.resolve(projectRoot, ROUTES_DIR)

  if (!fs.existsSync(routesDir)) {
    console.warn(`[auto-routes] Routes dir not found: ${routesDir}`)
    return
  }

  const files = walkRoutesDir(routesDir)
  const entries: RouteEntry[] = []

  for (const file of files) {
    const entry = toRouteEntry(routesDir, path.resolve(file), projectRoot)
    if (entry) entries.push(entry)
  }

  // FRONT (nanostores)
  const frontLines: string[] = []
  frontLines.push('// AUTO-GENERATED. DO NOT EDIT.')
  frontLines.push("import { createRouter } from '@nanostores/router'")
  for (const e of entries) {
    frontLines.push(`import ${e.importName} from '${e.importPath}'`)
  }
  frontLines.push('')
  frontLines.push('export const routes = {')
  for (const e of entries) {
    frontLines.push(`  ${e.name}: '${e.pattern}',`)
  }
  frontLines.push('} as const')
  frontLines.push('')
  frontLines.push('export const routeComponents = {')
  for (const e of entries) {
    frontLines.push(`  ${e.name}: ${e.importName},`)
  }
  frontLines.push('} as const')
  frontLines.push('')
  frontLines.push('export const $router = createRouter(routes)')
  frontLines.push('')

  // HONO
  const honoLines: string[] = []
  honoLines.push('// AUTO-GENERATED. DO NOT EDIT.')
  honoLines.push("import { Hono } from 'hono'")
  for (const e of entries) {
    honoLines.push(`import ${e.importName} from '${e.importPath}'`)
  }
  honoLines.push('')
  honoLines.push('const app = new Hono()')
  honoLines.push('')
  for (const e of entries) {
    honoLines.push(
      `app.get('${e.pattern}', c => c.render(<${e.importName} c={c} params={c.req.param()} />))`
    )
  }
  honoLines.push('')
  honoLines.push('export default app')
  honoLines.push('')

  writeFileSafe(projectRoot, OUTPUT_FRONT, frontLines.join('\n'))
  writeFileSafe(projectRoot, OUTPUT_HONO, honoLines.join('\n'))

  console.log(
    `[auto-routes] Generated ${OUTPUT_FRONT} and ${OUTPUT_HONO} (${entries.length} routes).`
  )
}

export function buna(): Plugin {
  let root = process.cwd()

  return {
    name: 'auto-routes-plugin',

    configResolved(config) {
      root = config.root
    },

    buildStart() {
      generateFiles(root)
    },

    configureServer(server) {
      const watchDir = path.resolve(root, ROUTES_DIR)

      const maybeGenerate = (file: string) => {
        if (file.startsWith(watchDir)) {
          generateFiles(root)
        }
      }

      server.watcher.on('add', maybeGenerate)
      server.watcher.on('unlink', maybeGenerate)
      server.watcher.on('change', maybeGenerate)
    },
  }
}
