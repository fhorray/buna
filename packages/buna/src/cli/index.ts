import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { generateRoutes } from "../dev/generate-routes";
import type { BunaConfig } from "../config/types";

async function loadConfig(configFile: string): Promise<BunaConfig> {
  const configPath = resolve(process.cwd(), configFile);
  const configUrl = pathToFileURL(configPath).href;

  const mod = await import(configUrl);
  const config = (mod.default ?? mod.config) as BunaConfig | undefined;

  if (!config) {
    throw new Error(
      `Config file "${configFile}" does not have a default export.`
    );
  }

  return config;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] ?? "codegen";

  const configFlagIndex = args.indexOf("--config");
  const configFile =
    configFlagIndex !== -1 && args[configFlagIndex + 1]
      ? args[configFlagIndex + 1]
      : "buna.config.ts";

  if (command === "codegen") {
    const config = await loadConfig(configFile as string);
    await generateRoutes(config);
    console.log(`✅ Buna routes generated from "${configFile}".`);
    return;
  }

  console.error(`Unknown buna command: ${command}`);
  process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});