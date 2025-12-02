import type { ResolvedBunaConfig } from "../config/types";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join, relative, dirname } from "node:path";

async function ensureDir(path: string) {
  await mkdir(path, { recursive: true });
}

async function getFilesRecursively(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getFilesRecursively(fullPath)));
    } else if (entry.isFile() && /\.(tsx|jsx|ts|js)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function filePathToRoute(pathname: string, routesDir: string): string {
  const rel = relative(routesDir, pathname).replace(/\\/g, "/");
  const withoutExt = rel.replace(/\.(tsx|jsx|ts|js)$/, "");
  const segments = withoutExt.split("/");

  // Special-case root index route
  if (segments.length === 1 && segments[0] === "index") {
    return "/";
  }

  // Treat "*/index" as the directory route (including dynamic segments)
  const isIndexRoute = segments[segments.length - 1] === "index";
  const coreSegments = isIndexRoute ? segments.slice(0, -1) : segments;

  const mapped = coreSegments.map(segment => {
    if (segment.startsWith("[") && segment.endsWith("]")) {
      const inner = segment.slice(1, -1);

      // Support catch-all segments like "[...slug]" -> "*"
      if (inner.startsWith("...")) {
        return "*";
      }

      // "[id]" -> ":id"
      return ":" + inner;
    }

    return segment;
  });

  // If everything collapsed (e.g. "index" only), this is "/"
  if (mapped.length === 0) {
    return "/";
  }

  return "/" + mapped.join("/");
}

export async function generateRoutes(config: ResolvedBunaConfig) {
  const { routesDir, outDir } = config;

  const projectRoot = process.cwd();
  const pagesDir = join(outDir, "pages");

  await ensureDir(pagesDir);

  const files = await getFilesRecursively(routesDir);

  let imports = "";
  let routesObject = "export const routes = {\n";

  for (const [index, file] of files.entries()) {
    // 1. rota HTTP
    const routePath = filePathToRoute(file, routesDir);

    // 2. nome para HTML
    const relFromRoutes = relative(routesDir, file)
      .replace(/\\/g, "/")
      .replace(/\.(tsx|jsx|ts|js)$/, "");

    const htmlRelPath = `${relFromRoutes}.html`;
    const htmlDiskPath = join(pagesDir, htmlRelPath);

    // 3. script src relativo ao HTML
    const scriptSrc = relative(dirname(htmlDiskPath), file).replace(/\\/g, "/");

    const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <title>${routePath}</title>
    <link rel="stylesheet" href="tailwindcss" />
  </head>
  <body data-buna-route="${routePath}">
    <div id="root"></div>
    <script type="module" src="${scriptSrc}"></script>
  </body>
</html>
`;

    await ensureDir(dirname(htmlDiskPath));
    await writeFile(htmlDiskPath, htmlContent, "utf8");

    const importVar = `Page_${index}`;
    const importPathForTs = `./pages/${htmlRelPath}`;

    imports += `import ${importVar} from "${importPathForTs}";\n`;
    routesObject += `  "${routePath}": ${importVar},\n`;
  }

  routesObject += "};\n";

  const tsContent = `// AUTO-GENERATED. DO NOT EDIT.
${imports}
${routesObject}
`;

  await writeFile(join(outDir, "routes.generated.ts"), tsContent, "utf8");
}
