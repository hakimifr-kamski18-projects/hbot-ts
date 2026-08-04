import { basename } from "node:path";

import { Glob } from "bun";
import type { TelegramClient } from "@mtcute/bun";
import { Dispatcher } from "@mtcute/dispatcher";

import { log } from "./logger";
import type { Plugin } from "./plugin";

const logger = log("core", "loader");

const PLUGINS_DIR = new URL("../plugins/", import.meta.url).pathname;

/** File starting with '_' will be skipped from being loaded. */
async function discoverPlugins(dir: string = PLUGINS_DIR): Promise<Plugin[]> {
  const files = await Array.fromAsync(
    new Glob("*.ts").scan({ cwd: dir, absolute: true }),
  );
  logger.info("scanned {dir}, found {count} plugins", {
    dir,
    count: files.length,
  });

  files.sort();

  const plugins: Plugin[] = [];

  for (const file of files) {
    const filename = basename(file);
    if (filename.startsWith("_")) continue;

    logger.debug("loading {filename}", { filename });

    const module: { default?: unknown } = await import(file);
    const plugin = module.default;

    if (!isPlugin(plugin)) {
      logger.warning("skipping {filename}: no valid default plugin export", {
        filename,
      });
      continue;
    }

    plugins.push(plugin);
  }

  return plugins;
}

async function registerPlugins(
  tg: TelegramClient,
  root: Dispatcher,
  plugins: Plugin[],
): Promise<Plugin[]> {
  const loaded: Plugin[] = [];

  for (const plugin of plugins) {
    const dp = Dispatcher.child();

    try {
      await plugin.register({
        tg,
        dp,
        log: log("plugin", plugin.name),
      });
    } catch (error) {
      logger.error("plugin {plugin} failed to register: {error}", {
        plugin: plugin.name,
        error,
      });
      continue;
    }

    root.addChild(dp);
    loaded.push(plugin);

    logger.info("loaded plugin {plugin} ({commands} command(s))", {
      plugin: plugin.name,
      commands: plugin.commands?.length ?? 0,
    });
  }

  return loaded;
}

/** Call `dispose()` on each plugin that has one, in reverse load order. */
async function disposePlugins(plugins: Plugin[]): Promise<void> {
  for (const plugin of [...plugins].reverse()) {
    if (!plugin.dispose) continue;

    try {
      await plugin.dispose();
      logger.debug("disposed plugin {plugin}", { plugin: plugin.name });
    } catch (error) {
      logger.error("plugin {plugin} failed to dispose: {error}", {
        plugin: plugin.name,
        error,
      });
    }
  }
}

function isPlugin(value: unknown): value is Plugin {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Plugin).name === "string" &&
    typeof (value as Plugin).description === "string" &&
    typeof (value as Plugin).register === "function"
  );
}

export { discoverPlugins, registerPlugins, disposePlugins, PLUGINS_DIR };
