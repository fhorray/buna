#!/usr/bin/env bun
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyDir(src: string, dest: string) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    // Skip some files/folders that should not be part of the template
    if (entry.name === "node_modules" || entry.name === ".buna" || entry.name === "dist") {
      continue;
    }

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      ensureDir(destPath);
      copyDir(srcPath, destPath);
    } else {
      if (entry.name === "package.json") {
        // package.json is handled separately in main
        continue;
      }
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function createPackageJson(templatePath: string, targetPath: string, appName: string) {
  const raw = fs.readFileSync(templatePath, "utf8");
  const pkg = JSON.parse(raw) as Record<string, any>;

  pkg.name = appName;
  pkg.version = "0.0.0";
  pkg.private = true;

  // Map for published versions (used when not in monorepo)
  const bunaVersions: Record<string, string> = {
    "@buna/cli": "^0.1.0",
    "@buna/config": "^0.1.0",
    "@buna/router": "^0.1.0",
    "@buna/react": "^0.1.0",
    "@buna/vite-plugin": "^0.1.0"
  };

  // Try to detect if we are inside the monorepo
  // From create-buna-app/src/index.ts: ../../.. -> repo root
  const monorepoRoot = path.resolve(__dirname, "../../..");
  const isMonorepoDev =
    fs.existsSync(path.join(monorepoRoot, "packages/buna-cli")) &&
    fs.existsSync(path.join(monorepoRoot, "apps/playground"));

  const localPackages: Record<string, string> = isMonorepoDev
    ? {
      "@buna/cli": path.join(monorepoRoot, "packages/buna-cli"),
      "@buna/config": path.join(monorepoRoot, "packages/buna-config"),
      "@buna/router": path.join(monorepoRoot, "packages/buna-router"),
      "@buna/vite-plugin": path.join(monorepoRoot, "packages/buna-vite-plugin"),
      "@buna/react": path.join(monorepoRoot, "packages/buna-react")
    }
    : {};

  function rewriteDeps(deps?: Record<string, string>) {
    if (!deps) return;
    for (const depName of Object.keys(deps)) {
      const value = deps[depName];

      if (value !== "workspace:*") continue;

      if (isMonorepoDev && localPackages[depName]) {
        // Dev mode: link to local packages
        const absolute = localPackages[depName];
        const rel = path.relative(path.dirname(targetPath), absolute).replace(/\\/g, "/");
        deps[depName] = `file:${rel}`;
      } else if (bunaVersions[depName]) {
        // Published mode: use registry version
        deps[depName] = bunaVersions[depName];
      }
    }
  }

  rewriteDeps(pkg.dependencies);
  rewriteDeps(pkg.devDependencies);

  fs.writeFileSync(targetPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
}

async function main() {
  const [, , appName] = process.argv;

  if (!appName) {
    console.error("Usage: bunx create-buna-app <app-name>");
    process.exit(1);
  }

  const cwd = process.cwd();
  const targetDir = path.resolve(cwd, appName);

  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    console.error(`Target directory '${appName}' already exists and is not empty.`);
    process.exit(1);
  }

  // In the monorepo the template is apps/playground.
  // From this script file, go up to repo root and into apps/playground.
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const templateDir = path.resolve(__dirname, "../../../apps/playground");

  if (!fs.existsSync(templateDir)) {
    console.error("Could not find template directory at " + templateDir);
    process.exit(1);
  }

  ensureDir(targetDir);

  // Copy everything except package.json
  copyDir(templateDir, targetDir);

  // Generate package.json based on template one, but with new name
  const templatePkg = path.join(templateDir, "package.json");
  const targetPkg = path.join(targetDir, "package.json");
  createPackageJson(templatePkg, targetPkg, appName);

  console.log(`\nBuna app created in ./${appName}`);
  console.log("Next steps:");
  console.log(`  cd ${appName}`);
  console.log("  bun install");
  console.log("  bun dev");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});