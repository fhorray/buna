import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname as pathDirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { BunPlugin } from "bun";
import type { ResolvedBunaConfig } from "../config/types";

type WorkerAsset = {
  entryPath: string;
  urlPath: string;
  contents: string;
  contentType: string;
};

type HtmlRouteRecord = {
  pattern: string;
  html: string;
  regex: string | null;
};

type BuildLog = {
  message: string;
  location?: {
    file?: string;
    line?: number;
    column?: number;
  };
};

const DEFAULT_ASSET_PREFIX = "/_buna/assets";
const DEFAULT_HTML_CACHE = "public, max-age=60";
const DEFAULT_STATIC_CACHE = "public, max-age=31536000, immutable";

export interface CloudflareBuildOptions {
  config: ResolvedBunaConfig;
  /** Directory where the worker file should be emitted. Defaults to `<config.outDir>/cloudflare-worker`. */
  outDir?: string;
  /** URL prefix used for static assets served by the worker. */
  assetsBasePath?: string;
  /** Override the working directory for resolving relative paths. Defaults to `process.cwd()`. */
  projectRoot?: string;
  /** Whether client bundles should be minified. Defaults to true. */
  minify?: boolean;
  /** Cache-Control header for HTML routes. */
  htmlCacheControl?: string;
  /** Cache-Control header for JS/CSS assets. */
  assetCacheControl?: string;
}

export interface CloudflareBuildResult {
  workerPath: string;
  assets: number;
  routes: number;
}

const thisDir = pathDirname(fileURLToPath(import.meta.url));
const BUNA_SRC_DIR = resolve(thisDir, "..");

interface TransformContext {
  projectRoot: string;
  minify: boolean;
  assetsBasePath: string;
  assetCache: Map<string, WorkerAsset>;
  assets: WorkerAsset[];
  plugins: BunPlugin[];
  config: ResolvedBunaConfig;
  tailwindAsset?: WorkerAsset | null;
  tailwindPlugin?: BunPlugin | null;
}

export async function buildCloudflareWorker(options: CloudflareBuildOptions): Promise<CloudflareBuildResult> {
  const {
    config,
    projectRoot = process.cwd(),
    minify = true,
    assetsBasePath = DEFAULT_ASSET_PREFIX,
    outDir,
    htmlCacheControl = DEFAULT_HTML_CACHE,
    assetCacheControl = DEFAULT_STATIC_CACHE,
  } = options;

  const resolvedOutDir = resolveOutputDirectory(outDir ?? join(config.outDir, "cloudflare-worker"), projectRoot);
  await ensureDir(resolvedOutDir);

  const pagesDir = join(config.outDir, "pages");
  const htmlFiles = await collectHtmlFiles(pagesDir);

  if (htmlFiles.length === 0) {
    throw new Error(`Nenhuma página .html encontrada em "${pagesDir}". Execute "buna codegen" antes de gerar o worker.`);
  }

  const ctx: TransformContext = {
    projectRoot,
    minify,
    assetsBasePath: sanitizeAssetPrefix(assetsBasePath),
    assetCache: new Map(),
    assets: [],
    plugins: [createWorkspaceResolverPlugin(), createExtensionFallbackPlugin()],
    config,
  };

  const routes: HtmlRouteRecord[] = [];

  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    const pattern = extractRoutePattern(html) ?? inferRouteFromFile(file, pagesDir);

    if (!pattern) {
      throw new Error(`Não foi possível determinar o caminho da rota para o arquivo ${file}`);
    }

    const transformed = await transformHtmlFile(file, html, ctx);
    routes.push({
      pattern,
      html: transformed,
      regex: compilePatternToRegex(pattern),
    });
  }

  const workerSource = createWorkerSource({
    routes,
    assets: ctx.assets,
    htmlCacheControl,
    assetCacheControl,
  });

  const workerPath = join(resolvedOutDir, "worker.js");
  await writeFile(workerPath, workerSource, "utf8");

  return { workerPath, assets: ctx.assets.length, routes: routes.length };
}

async function ensureDir(path: string) {
  await mkdir(path, { recursive: true });
}

async function collectHtmlFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await collectHtmlFiles(full)));
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        files.push(full);
      }
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw err;
  }
  return files;
}

function extractRoutePattern(html: string): string | null {
  const match = html.match(/data-buna-route="([^"]+)"/);
  return match ? match[1] : null;
}

function inferRouteFromFile(filePath: string, pagesDir: string): string {
  const relativePath = relative(pagesDir, filePath).replace(/\\/g, "/");
  const withoutExt = relativePath.replace(/\.html$/, "");
  const segments = withoutExt.split("/");

  if (segments.length === 1 && segments[0] === "index") {
    return "/";
  }

  const normalizedSegments = segments
    .filter(Boolean)
    .map((segment, index, arr) =>
      index === arr.length - 1 && segment === "index"
        ? null
        : segment.startsWith("[") && segment.endsWith("]")
          ? segment.startsWith("[...")
            ? "*"
            : `:${segment.slice(1, -1)}`
          : segment,
    )
    .filter((segment): segment is string => Boolean(segment));

  if (normalizedSegments.length === 0) {
    return "/";
  }

  return `/${normalizedSegments.join("/")}`;
}

async function transformHtmlFile(filePath: string, html: string, ctx: TransformContext): Promise<string> {
  let output = html;
  const dir = pathDirname(filePath);

  for (const script of extractScriptTags(html)) {
    if (!script.isModule || !isRelativeAsset(script.src)) {
      continue;
    }

    const entryPath = resolve(dir, script.src);
    const asset = await compileScriptAsset(entryPath, ctx);
    const newTag = `<script type="module" src="${asset.urlPath}" data-buna-asset="true"></script>`;
    output = output.replace(script.original, newTag);
  }

  for (const sheet of extractStylesheetLinks(html)) {
    if (sheet.href === "tailwindcss") {
      const asset = await compileTailwindAsset(ctx);
      if (!asset) {
        continue;
      }
      const newTag = `<link rel="stylesheet" href="${asset.urlPath}" data-buna-asset="true" />`;
      output = output.replace(sheet.original, newTag);
      continue;
    }

    if (!isRelativeAsset(sheet.href)) {
      continue;
    }

    const entryPath = resolve(dir, sheet.href);
    const asset = await compileCssAsset(entryPath, ctx);
    const newTag = `<link rel="stylesheet" href="${asset.urlPath}" data-buna-asset="true" />`;
    output = output.replace(sheet.original, newTag);
  }

  return output;
}

type ScriptTag = { original: string; src: string; isModule: boolean };
type StylesheetTag = { original: string; href: string };

function extractScriptTags(html: string): ScriptTag[] {
  const regex = /<script\b[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi;
  const tags: ScriptTag[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html))) {
    const original = match[0];
    const attrs = original.toLowerCase();
    const isModule = attrs.includes('type="module"') || attrs.includes("type='module'");
    tags.push({ original, src: match[1], isModule });
  }

  return tags;
}

function extractStylesheetLinks(html: string): StylesheetTag[] {
  const regex = /<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi;
  const tags: StylesheetTag[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html))) {
    const original = match[0];
    const hrefMatch = original.match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    tags.push({ original, href: hrefMatch[1] });
  }

  return tags;
}

function isRelativeAsset(value: string): boolean {
  if (!value) return false;
  return value.startsWith("./") || value.startsWith("../");
}

async function compileScriptAsset(entryPath: string, ctx: TransformContext): Promise<WorkerAsset> {
  const cached = ctx.assetCache.get(entryPath);
  if (cached) return cached;

  const result = await Bun.build({
    entrypoints: [entryPath],
    target: "browser",
    format: "esm",
    splitting: false,
    minify: ctx.minify,
    plugins: ctx.plugins,
  });

  if (!result.success) {
    throw new Error(formatBuildErrors(entryPath, result.logs));
  }

  const artifact = result.outputs.find(
    (output) => output.kind === "entry-point" || output.kind === "asset",
  );

  if (!artifact) {
    throw new Error(`Bun.build não retornou artefatos para ${entryPath}`);
  }

  const contents = await artifact.text();
  const filename = `${slugify(relative(ctx.projectRoot, entryPath).replace(/\\/g, "/").replace(/\.[tj]sx?$/, ""))}-${artifact.hash}.js`;
  const urlPath = `${ctx.assetsBasePath}/${filename}`;

  const asset: WorkerAsset = {
    entryPath,
    urlPath,
    contents,
    contentType: "text/javascript; charset=utf-8",
  };

  ctx.assetCache.set(entryPath, asset);
  ctx.assets.push(asset);

  return asset;
}

async function compileCssAsset(entryPath: string, ctx: TransformContext): Promise<WorkerAsset> {
  const cached = ctx.assetCache.get(entryPath);
  if (cached) return cached;

  try {
    await stat(entryPath);
  } catch (err) {
    throw new Error(`Arquivo CSS não encontrado: ${entryPath}`);
  }

  const contents = await readFile(entryPath, "utf8");
  const filename = `${slugify(relative(ctx.projectRoot, entryPath).replace(/\\/g, "/").replace(/\.[cm]?css$/, ""))}-${hashString(contents)}.css`;
  const urlPath = `${ctx.assetsBasePath}/${filename}`;

  const asset: WorkerAsset = {
    entryPath,
    urlPath,
    contents,
    contentType: "text/css; charset=utf-8",
  };

  ctx.assetCache.set(entryPath, asset);
  ctx.assets.push(asset);

  return asset;
}

async function compileTailwindAsset(ctx: TransformContext): Promise<WorkerAsset | null> {
  if (ctx.tailwindAsset) {
    return ctx.tailwindAsset;
  }

  const plugin = await ensureTailwindPlugin(ctx);
  if (!plugin) {
    console.warn("⚠️  No Tailwind plugin found. Make sure to install 'bun-plugin-tailwind' in your project.");
    return null;
  }

  const entryPath = join(ctx.config.outDir, "__tailwind-entry.css");
  await ensureDir(pathDirname(entryPath));
  await writeFile(entryPath, '@import "tailwindcss";\n', "utf8");

  const result = await Bun.build({
    entrypoints: [entryPath],
    target: "browser",
    format: "esm",
    splitting: false,
    minify: ctx.minify,
    plugins: [...ctx.plugins, plugin],
  });

  if (!result.success) {
    throw new Error(formatBuildErrors("tailwindcss", result.logs));
  }

  const artifact = result.outputs.find(
    (output) => output.kind === "entry-point" || output.kind === "asset",
  );
  if (!artifact) {
    throw new Error("Falha ao gerar CSS do Tailwind");
  }

  const contents = await artifact.text();
  const filename = `tailwind-${artifact.hash}.css`;
  const urlPath = `${ctx.assetsBasePath}/${filename}`;

  const asset: WorkerAsset = {
    entryPath: "tailwindcss",
    urlPath,
    contents,
    contentType: "text/css; charset=utf-8",
  };

  ctx.tailwindAsset = asset;
  ctx.assets.push(asset);

  await rm(entryPath).catch(() => { });

  return asset;
}

async function ensureTailwindPlugin(ctx: TransformContext): Promise<BunPlugin | null> {
  if (ctx.tailwindPlugin !== undefined) {
    return ctx.tailwindPlugin;
  }

  const plugin = await loadTailwindPluginFromProject(ctx.projectRoot);
  ctx.tailwindPlugin = plugin;
  return plugin;
}

async function loadTailwindPluginFromProject(projectRoot: string): Promise<BunPlugin | null> {
  try {
    const mod = await import("bun-plugin-tailwind");
    return (mod.default ?? mod) as BunPlugin;
  } catch {
    // fall through
  }

  const packagePath = resolve(projectRoot, "node_modules", "bun-plugin-tailwind", "package.json");
  try {
    const pkgRaw = await readFile(packagePath, "utf8");
    const pkg = JSON.parse(pkgRaw) as { module?: string; main?: string };
    const candidates = [pkg.module, pkg.main, "index.mjs", "index.js"].filter(Boolean) as string[];

    for (const candidate of candidates) {
      const candidatePath = resolve(projectRoot, "node_modules", "bun-plugin-tailwind", candidate);
      try {
        const mod = await import(pathToFileURL(candidatePath).href);
        return (mod.default ?? mod) as BunPlugin;
      } catch {
        continue;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

function hashString(value: string): string {
  const data = new TextEncoder().encode(value);
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash * 31 + data[i]) >>> 0;
  }
  return hash.toString(16);
}

function slugify(value: string): string {
  return value
    .replace(/\\/g, "/")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-") || "bundle";
}

function sanitizeAssetPrefix(prefix: string): string {
  if (!prefix.startsWith("/")) {
    prefix = `/${prefix}`;
  }
  return prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
}

function resolveOutputDirectory(dir: string, cwd: string): string {
  return isAbsolute(dir) ? dir : resolve(cwd, dir);
}

function compilePatternToRegex(pattern: string): string | null {
  if (!pattern || pattern === "/") {
    return null;
  }

  if (!pattern.includes(":") && !pattern.includes("*")) {
    return null;
  }

  const segments = pattern.split("/").filter(Boolean);
  const parts = segments.map((segment) => {
    if (segment === "*") {
      return "(.*)";
    }
    if (segment.startsWith(":")) {
      return "([^/]+)";
    }
    return escapeRegex(segment);
  });

  return `^/${parts.join("/")}` + "$";
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createWorkerSource(params: {
  routes: HtmlRouteRecord[];
  assets: WorkerAsset[];
  htmlCacheControl: string;
  assetCacheControl: string;
}): string {
  const routeEntries = params.routes
    .map((route) => {
      const matcher = route.regex ? `new RegExp(${JSON.stringify(route.regex)})` : "null";
      return `{ pattern: ${JSON.stringify(route.pattern)}, html: ${JSON.stringify(route.html)}, matcher: ${matcher} }`;
    })
    .join(",\n  ");

  const assetEntries = params.assets
    .map((asset) => `[${JSON.stringify(asset.urlPath)}, { body: ${JSON.stringify(asset.contents)}, contentType: ${JSON.stringify(asset.contentType)} }]`)
    .join(",\n  ");

  return `// GENERATED BY buna cloudflare builder
const HTML_ROUTES = [
  ${routeEntries}
];

const STATIC_ASSETS = new Map([
  ${assetEntries}
]);

const HTML_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": ${JSON.stringify(params.htmlCacheControl)},
};

const ASSET_CACHE = ${JSON.stringify(params.assetCacheControl)};

function normalizePath(pathname) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function matchHtmlRoute(pathname) {
  for (const route of HTML_ROUTES) {
    if (route.pattern === pathname) {
      return route;
    }
    if (route.matcher && route.matcher.test(pathname)) {
      return route;
    }
  }
  return null;
}

function serveAsset(pathname) {
  const asset = STATIC_ASSETS.get(pathname);
  if (!asset) return null;
  return new Response(asset.body, {
    headers: {
      "content-type": asset.contentType,
      "cache-control": ASSET_CACHE,
    },
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const normalized = normalizePath(url.pathname);

    const assetResponse = serveAsset(normalized);
    if (assetResponse) {
      return assetResponse;
    }

    const route = matchHtmlRoute(normalized);
    if (route) {
      return new Response(route.html, { headers: HTML_HEADERS });
    }

    return new Response("Not Found", { status: 404 });
  },
};
`;
}

function formatBuildErrors(entryPath: string, logs?: BuildLog[]): string {
  if (!logs || logs.length === 0) {
    return `Falha ao compilar ${entryPath}`;
  }
  const formatted = logs
    .map((log) => {
      const location = log.location ? `${log.location.file}:${log.location.line}:${log.location.column}` : entryPath;
      return `${location}\n${log.message}`;
    })
    .join("\n\n");
  return `Falha ao compilar ${entryPath}:\n${formatted}`;
}

export function createWorkspaceResolverPlugin(): BunPlugin {
  return {
    name: "buna-workspace-resolver",
    setup(build) {
      build.onResolve({ filter: /^buna(\/.*)?$/ }, (args) => {
        const subpath = args.path === "buna" ? "" : args.path.replace(/^buna\//, "");
        const resolved = subpath ? join(BUNA_SRC_DIR, subpath) : join(BUNA_SRC_DIR, "index.ts");
        return { path: resolved };
      });
    },
  };
}

export function createExtensionFallbackPlugin(): BunPlugin {
  const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
  return {
    name: "extension-fallback",
    setup(build) {
      build.onResolve({ filter: /^\./ }, async (args) => {
        const hasKnownExtension = extensions.some((ext) => args.path.endsWith(ext));
        if (hasKnownExtension) {
          return null;
        }

        const abs = resolve(args.resolveDir, args.path);
        const candidates = [
          abs,
          ...extensions.map((ext) => abs + ext),
          ...extensions.map((ext) => join(abs, `index${ext}`)),
        ];

        for (const candidate of candidates) {
          if (await Bun.file(candidate).exists()) {
            return { path: candidate };
          }
        }

        return null;
      });
    },
  };
}

export function createHtmlStubPlugin(): BunPlugin {
  return {
    name: "html-stub",
    setup(build) {
      build.onLoad({ filter: /\.html$/ }, () => ({
        contents: "export default {};",
        loader: "js",
      }));
    },
  };
}
