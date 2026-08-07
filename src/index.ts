import { TelegramClient } from "@mtcute/bun";
import { Dispatcher } from "@mtcute/dispatcher";
import { dispose as disposeLogging } from "@logtape/logtape";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { API_ID, API_HASH, SESSION_STRING } from "./constants";
import { setupLogging, log } from "./core/logger";
import {
  discoverPlugins,
  registerPlugins,
  disposePlugins,
} from "./core/loader";
import { setLoadedPlugins } from "./core/registry";
import type { Plugin } from "./core/plugin";
import { writeFileSync } from "fs";

await setupLogging();
const logger = log("main");

const tg = new TelegramClient({
  apiId: API_ID,
  apiHash: API_HASH,
  storage: "Bot-session",
});

let shuttingDown = false;
let exportSession = false;
let loaded: Plugin[];

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

async function main(): Promise<void> {
  const dp = Dispatcher.for(tg);

  const discovered = await discoverPlugins();
  loaded = await registerPlugins(tg, dp, discovered);
  setLoadedPlugins(loaded);
  logger.info("{count} plugin(s) loaded", { count: loaded.length });

  if (SESSION_STRING) {
    logger.info("using session string from env var SESSION_STRING");
    await tg.importSession(SESSION_STRING, true);
  }

  const self = await tg.start();
  logger.info("logged in as {name}", { name: self.displayName });
  if (exportSession) {
    logger.info("exporting session string as requested by cmdline flag");
    writeFileSync("Bot-session-string", await tg.exportSession());
  }
}

const parsed = await yargs(hideBin(process.argv))
  .boolean(["export-session-string"])
  .parse();
if (parsed["export-session-string"]) {
  logger.info("switch export-session-string is enabled");
  exportSession = true;
}

await main();

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
