import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join, relative, dirname } from "node:path";
import type { BunaConfig } from "../runtime/types";

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

  if (segments.length === 1 && segments[0] === "index") {
    return "/";
  }

  const last = segments[segments.length - 1];
  if (last === "index") {
    const base = segments.slice(0, -1).join("/");
    return "/" + base;
  }

  const mapped = segments.map(segment =>
    segment.startsWith("[") && segment.endsWith("]")
      ? ":" + segment.slice(1, -1)
      : segment
  );

  return "/" + mapped.join("/");
}

export async function generateRoutes(config: BunaConfig) {
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
  </head>
  <body>
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