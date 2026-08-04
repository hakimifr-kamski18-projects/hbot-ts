import { TelegramClient } from "@mtcute/bun";
import { Dispatcher } from "@mtcute/dispatcher";
import { dispose as disposeLogging } from "@logtape/logtape";

import { API_ID, API_HASH, BOT_TOKEN } from "./constants";
import { setupLogging, log } from "./core/logger";
import {
  discoverPlugins,
  registerPlugins,
  disposePlugins,
} from "./core/loader";
import { setLoadedPlugins } from "./core/registry";
import type { Plugin } from "./core/plugin";

await setupLogging();
const logger = log("main");

const tg = new TelegramClient({
  apiId: API_ID,
  apiHash: API_HASH,
  storage: "Bot-session",
});

// Dispatcher used for managing updates. Each plugin gets a child of this.
const dp = Dispatcher.for(tg);

const discovered = await discoverPlugins();
const loaded: Plugin[] = await registerPlugins(tg, dp, discovered);
setLoadedPlugins(loaded);
logger.info("{count} plugin(s) loaded", { count: loaded.length });

const self = await tg.start();
logger.info("logged in as {name}", { name: self.displayName });

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info("received {signal}, shutting down", { signal });
  await disposePlugins(loaded);
  try {
    await tg.destroy();
  } catch (e: any) {
    logger.warn(e);
  }
  await disposeLogging();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
