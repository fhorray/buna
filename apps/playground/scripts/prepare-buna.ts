#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const bunaDir = path.join(projectRoot, ".buna");
const templatePath = path.join(projectRoot, "scripts", "buna-build-template.ts");

await rm(bunaDir, { recursive: true, force: true });
await runCodegen();
await mkdir(bunaDir, { recursive: true });
await ensureBuildScript();

async function runCodegen() {
  const cliName = process.platform === "win32" ? "buna.exe" : "buna";
  const cliPath = path.join(projectRoot, "node_modules", ".bin", cliName);

  if (!existsSync(cliPath)) {
    throw new Error(
      `Buna CLI não encontrado em ${cliPath}. Execute "bun install" dentro de apps/playground.`
    );
  }

  const proc = Bun.spawn({
    cmd: [cliPath, "codegen", "--config", "buna.config.ts"],
    cwd: projectRoot,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(`"buna codegen" finalizou com código ${exitCode}.`);
  }
}

async function ensureBuildScript() {
  const target = path.join(bunaDir, "build.ts");
  const template = await Bun.file(templatePath).text();
  await writeFile(target, template, "utf8");
}
