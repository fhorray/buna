#!/usr/bin/env bun
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  cancel,
  intro,
  isCancel,
  log,
  note,
  outro,
  select,
  spinner,
} from "@clack/prompts";
import { defineConfig } from "../config/define-config";
import type { BunaConfig, ResolvedBunaConfig } from "../config/types";
import { generateRoutes } from "../dev/generate-routes";

type BunaCommand = "dev" | "build" | "check-types" | "codegen";

interface ParsedCliArgs {
  command?: BunaCommand;
  args: string[];
  configFile: string;
  helpRequested: boolean;
  unknownCommand?: string;
}

interface CommandContext {
  args: string[];
  configFile: string;
}

const TURBO_TASK_HINT = {
  dev: "turbo run dev --parallel",
  build: "turbo run build",
  "check-types": "turbo run check-types",
};

function isBunaCommand(value: string): value is BunaCommand {
  return ["dev", "build", "check-types", "codegen"].includes(value);
}

function parseCliArgs(argv: string[]): ParsedCliArgs {
  const rest: string[] = [];
  let helpRequested = false;
  let configFile = "buna.config.ts";

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg) continue;

    if (arg === "--help" || arg === "-h") {
      helpRequested = true;
      continue;
    }

    if (arg === "--config") {
      const value = argv[i + 1];
      if (value) {
        configFile = value;
        i++;
      }
      continue;
    }

    rest.push(arg);
  }

  if (rest.length === 0) {
    return { args: [], configFile, helpRequested };
  }

  const maybeCommand = rest[0];
  if (!maybeCommand) {
    return { args: rest, configFile, helpRequested };
  }

  if (!isBunaCommand(maybeCommand)) {
    return {
      args: rest.slice(1),
      configFile,
      helpRequested,
      unknownCommand: maybeCommand,
    };
  }

  return {
    command: maybeCommand,
    args: rest.slice(1),
    configFile,
    helpRequested,
  };
}

async function loadConfig(configFile: string): Promise<ResolvedBunaConfig> {
  const configPath = resolve(process.cwd(), configFile);
  const configUrl = pathToFileURL(configPath).href;

  const mod = await import(configUrl);
  const config = (mod.default ?? mod.config) as BunaConfig | undefined;

  if (!config) {
    throw new Error(`Config file "${configFile}" does not export a configuration.`);
  }

  return defineConfig(config);
}

function findWorkspaceRoot(start = process.cwd()): string | null {
  let current = start;
  while (true) {
    if (existsSync(join(current, "turbo.json"))) {
      return current;
    }

    const parent = dirname(current);
    if (parent === current) {
      return null;
    }

    current = parent;
  }
}

function resolveTurboBin(root: string): string | null {
  const binDir = join(root, "node_modules", ".bin");
  const isWindows = process.platform === "win32";
  const candidates = isWindows
    ? ["turbo.exe", "turbo.cmd", "turbo.bunx"]
    : ["turbo", "turbo.exe"];

  for (const candidate of candidates) {
    const fullPath = join(binDir, candidate);
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

async function runTurboTask(task: "dev" | "build" | "check-types", args: string[]) {
  const workspaceRoot = findWorkspaceRoot();
  if (!workspaceRoot) {
    throw new Error('Could not find a "turbo.json" to identify the monorepo.');
  }

  const turboBin = resolveTurboBin(workspaceRoot);
  if (!turboBin) {
    throw new Error(
      "Turbo is not installed. Run `bun install` to install the dependencies."
    );
  }

  note(`root: ${workspaceRoot}`, `turbo ${task}`);

  const turboArgs = ["run", task, ...args];

  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(turboBin, turboArgs, {
      cwd: workspaceRoot,
      stdio: "inherit",
      shell: false,
    });

    child.on("exit", code => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(
          new Error(`Turbo exited with code ${code ?? "unknown"}.`)
        );
      }
    });

    child.on("error", err => {
      rejectPromise(err);
    });
  });
}

async function runCodegen(configFile: string) {
  const s = spinner();
  s.start(`Generating routes from ${configFile}...`);
  const config = await loadConfig(configFile);
  await generateRoutes(config);
  s.stop("Routes updated successfully!");
}

async function ensureCommand(command?: BunaCommand): Promise<BunaCommand> {
  if (command) {
    return command;
  }

  const selection = await select({
    message: "Which command do you want to run?",
    options: [
      {
        value: "dev",
        label: "Start development",
        hint: TURBO_TASK_HINT.dev,
      },
      {
        value: "build",
        label: "Full build",
        hint: TURBO_TASK_HINT.build,
      },
      {
        value: "check-types",
        label: "Check types",
        hint: TURBO_TASK_HINT["check-types"],
      },
      {
        value: "codegen",
        label: "Generate routes (buna.config)",
        hint: "Updates .buna/routes.generated.ts",
      },
    ],
  });

  if (isCancel(selection)) {
    cancel("No command selected.");
    process.exit(0);
  }

  return selection as BunaCommand;
}

function printHelp() {
  console.log(`Buna CLI

Usage:
  buna <command> [options]

Available commands:
  dev             Runs turbo in development mode (parallel)
  build           Runs the full build pipeline
  check-types     Validates types in all workspaces
  codegen         Generates the routes defined in buna.config.ts

Options:
  --config <file>     Uses an alternative config file for codegen
  -h, --help          Shows this help message

Examples:
  buna dev --filter=apps/playground
  buna build
  buna codegen --config apps/playground/buna.config.ts
`);
}

const commandHandlers: Record<
  BunaCommand,
  (ctx: CommandContext) => Promise<void>
> = {
  dev: async ({ args }) => {
    const turboArgs = args.includes("--parallel")
      ? args
      : ["--parallel", ...args];
    await runTurboTask("dev", turboArgs);
  },
  build: async ({ args }) => {
    await runTurboTask("build", args);
  },
  "check-types": async ({ args }) => {
    await runTurboTask("check-types", args);
  },
  codegen: async ({ configFile }) => {
    await runCodegen(configFile);
  },
};

async function main() {
  const parsed = parseCliArgs(process.argv.slice(2));

  if (parsed.helpRequested) {
    printHelp();
    return;
  }

  if (parsed.unknownCommand) {
    log.error(`Unknown command: ${parsed.unknownCommand}`);
    printHelp();
    process.exit(1);
  }

  intro("Buna CLI");

  const command = await ensureCommand(parsed.command);
  const handler = commandHandlers[command];

  if (!handler) {
    log.error(`Command "${command}" has no registered handler.`);
    process.exit(1);
  }

  try {
    await handler({ args: parsed.args, configFile: parsed.configFile });
    outro(`Command "${command}" finished.`);
  } catch (error) {
    log.error(
      error instanceof Error ? error.message : "Unknown error while executing the command."
    );
    process.exit(1);
  }
}

main().catch(error => {
  log.error(
    error instanceof Error ? error.message : "Unexpected error while running the CLI."
  );
  process.exit(1);
});
