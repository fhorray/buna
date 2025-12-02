#!/usr/bin/env bun

import fs from "node:fs";
import path from "node:path";
import blessed from "blessed";

type AppStatus = "starting" | "running" | "exited" | "error" | "stopped";

type AppProcess = {
  name: string;
  cwd: string;
  status: AppStatus;
  logs: string[];
  process?: Subprocess;
  exitCode?: number;
};

const APPS_DIR = "./apps";
const MAX_LOG_LINES = 500;

type Subprocess = ReturnType<typeof Bun.spawn>;

function discoverApps(): AppProcess[] {
  if (!fs.existsSync(APPS_DIR)) {
    console.error(`apps/ directory not found at: ${APPS_DIR}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(APPS_DIR, { withFileTypes: true });
  const apps: AppProcess[] = entries
    .filter((e) => e.isDirectory())
    .map((e) => {
      const appPath = path.join(APPS_DIR, e.name);
      const pkgJsonPath = path.join(appPath, "package.json");
      const hasPackageJson = fs.existsSync(pkgJsonPath);

      return {
        name: e.name,
        cwd: appPath,
        status: hasPackageJson ? "starting" : "error",
        logs: hasPackageJson
          ? [`{gray-fg}> bun dev (cwd: ${appPath}){/}`]
          : ["{red-fg}Missing package.json{/}"],
      };
    });

  if (apps.length === 0) {
    console.error("No apps found inside ./apps/");
    process.exit(1);
  }

  return apps;
}

function statusBadge(app: AppProcess): string {
  const status = app.status;
  if (status === "starting") return "{yellow-bg}{black-fg} STARTING {/}";
  if (status === "running") return "{green-bg}{black-fg} RUNNING  {/}";
  if (status === "stopped") return "{gray-bg}{black-fg} STOPPED  {/}";
  if (status === "exited") {
    const code = app.exitCode ?? 0;
    if (code === 0) return "{gray-bg}{black-fg} EXITED 0 {/}";
    return `{red-bg}{black-fg} EXITED ${code} {/}`;
  }
  return "{red-bg}{black-fg} ERROR    {/}";
}

async function attachProcess(
  app: AppProcess,
  onUpdate: () => void,
) {
  if (app.status === "error") {
    onUpdate();
    return;
  }

  // Kill previous process if exists
  if (app.process) {
    try {
      app.process.kill();
    } catch {
      // ignore
    }
  }

  app.status = "starting";
  app.exitCode = undefined;
  app.logs.push("{yellow-fg}> restarting bun dev...{/}");

  const proc = Bun.spawn({
    cmd: ["bun", "dev"],
    cwd: app.cwd,
    stdout: "pipe",
    stderr: "pipe",
  });

  app.process = proc;
  app.status = "running";
  app.logs.push("{green-fg}> process started{/}");
  onUpdate();

  const readStream = async (
    stream: ReadableStream<Uint8Array> | null,
    isError: boolean,
  ) => {
    if (!stream) return;
    const decoder = new TextDecoder();
    const reader = stream.getReader();
    let pending = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (!value) continue;

      pending += decoder.decode(value, { stream: true });
      const lines = pending.split(/\r?\n/);
      pending = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;
        const prefix = isError ? "{red-fg}[stderr]{/} " : "";
        app.logs.push(prefix + line);
        if (app.logs.length > MAX_LOG_LINES) {
          app.logs.splice(0, app.logs.length - MAX_LOG_LINES);
        }
      }
      onUpdate();
    }

    if (pending.trim()) {
      const prefix = isError ? "{red-fg}[stderr]{/} " : "";
      app.logs.push(prefix + pending);
      if (app.logs.length > MAX_LOG_LINES) {
        app.logs.splice(0, app.logs.length - MAX_LOG_LINES);
      }
      onUpdate();
    }

    reader.releaseLock();
  };

  // background read
  readStream(proc.stdout, false);
  readStream(proc.stderr, true);

  const exitCode = await proc.exited;
  app.exitCode = exitCode;
  app.process = undefined;
  app.status = exitCode === 0 ? "exited" : "error";
  app.logs.push(
    exitCode === 0
      ? "{gray-fg}> process exited with code 0{/}"
      : `{red-fg}> process exited with code ${exitCode}{/}`,
  );
  onUpdate();
}

function stopProcess(app: AppProcess, onUpdate: () => void) {
  if (!app.process) {
    app.logs.push("{gray-fg}> process is not running{/}");
    onUpdate();
    return;
  }
  try {
    app.process.kill();
  } catch {
    // ignore
  }
  app.process = undefined;
  app.status = "stopped";
  app.logs.push("{gray-fg}> process stopped by user{/}");
  onUpdate();
}

async function main() {
  const apps = discoverApps();
  let selectedIndex = 0;

  const screen = blessed.screen({
    smartCSR: true,
    title: "Buna Dev TUI",
  });

  const root = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    style: { bg: "black" },
  });

  const header = blessed.box({
    parent: root,
    top: 0,
    left: 0,
    width: "100%",
    height: 1,
    tags: true,
    content:
      "{bold}{cyan-fg}Opaca Dev TUI{/}  {gray-fg}– Turbo-style dashboard for ./apps{/}",
    style: {
      fg: "white",
      bg: "blue",
    },
  });

  const footer = blessed.box({
    parent: root,
    bottom: 0,
    left: 0,
    width: "100%",
    height: 1,
    tags: true,
    content:
      "{gray-fg}[↑/↓ or j/k] Select  {yellow-fg}[r]{/} Restart  {yellow-fg}[s]{/} Stop  {yellow-fg}[c]{/} Clear logs  {red-fg}[q]{/} Quit{/}",
    style: {
      fg: "white",
      bg: "black",
    },
  });

  const appList = blessed.list({
    parent: root,
    top: 1,
    left: 0,
    width: "30%",
    height: "100%-2",
    label: " Apps ",
    keys: true,
    mouse: true,
    vi: true,
    border: { type: "line" },
    tags: true,
    style: {
      border: { fg: "gray" },
      selected: { bg: "blue", fg: "white" },
      item: { fg: "white" },
    },
  });

  const logBox = blessed.log({
    parent: root,
    top: 1,
    left: "30%",
    width: "70%",
    height: "100%-2",
    label: " Logs ",
    tags: true,
    border: { type: "line" },
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
      ch: " ",
      track: { bg: "gray" },
      style: { bg: "white" },
    },
    style: {
      border: { fg: "gray" },
      fg: "white",
    },
  });

  function renderAppList() {
    const items = apps.map((app, idx) => {
      const isSelected = idx === selectedIndex;
      const bullet = isSelected ? "➤" : "•";
      const badge = statusBadge(app);
      return `${bullet} {cyan-fg}${app.name}{/}  ${badge}`;
    });
    appList.setItems(items);
  }

  function renderLogs() {
    const app = apps[selectedIndex];
    const headerLines = [
      `{bold}${app?.name}{/}  ${statusBadge(app as AppProcess)}`,
      `{gray-fg}${(app as AppProcess).cwd}{/}`,
      "",
    ];
    logBox.setContent(headerLines.concat((app as AppProcess).logs).join("\n"));
    logBox.setScrollPerc(100);
  }

  function renderAll() {
    renderAppList();
    renderLogs();
    screen.render();
  }

  function onUpdate() {
    renderAll();
  }

  // Key bindings
  screen.key(["q", "C-c"], () => {
    screen.destroy();
    process.exit(0);
  });

  appList.key(["up", "k"], () => {
    if (selectedIndex > 0) {
      selectedIndex--;
      renderAll();
    }
  });

  appList.key(["down", "j"], () => {
    if (selectedIndex < apps.length - 1) {
      selectedIndex++;
      renderAll();
    }
  });

  // Restart
  screen.key(["r"], () => {
    const app = apps[selectedIndex];
    (app as AppProcess).logs.push("{yellow-fg}> user requested restart{/}");
    attachProcess(app as AppProcess, onUpdate);
    renderAll();
  });

  // Stop
  screen.key(["s"], () => {
    const app = apps[selectedIndex];
    stopProcess(app as AppProcess, onUpdate);
  });

  // Clear logs
  screen.key(["c"], () => {
    const app = apps[selectedIndex];
    (app as AppProcess).logs = ["{gray-fg}(logs cleared){/}"];
    renderAll();
  });

  appList.on("select", (_, index) => {
    selectedIndex = index;
    renderAll();
  });

  appList.focus();

  // Start processes for all apps
  apps.forEach((app) => {
    attachProcess(app, onUpdate);
  });

  renderAll();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
