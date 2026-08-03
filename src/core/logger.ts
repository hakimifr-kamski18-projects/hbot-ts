import {
  configure,
  getAnsiColorFormatter,
  getConsoleSink,
  getLogger,
  type LogLevel,
} from "@logtape/logtape";

import { LOG_LEVEL } from "../constants";

const ROOT = "hbot";

async function setupLogging(): Promise<void> {
  await configure({
    sinks: {
      console: getConsoleSink({ formatter: getAnsiColorFormatter() }),
    },
    loggers: [
      { category: ROOT, lowestLevel: LOG_LEVEL, sinks: ["console"] },
      { category: ["logtape", "meta"], sinks: [] },
    ],
  });
}

function log(...category: string[]) {
  return getLogger([ROOT, ...category]);
}

export { setupLogging, log, type LogLevel };
