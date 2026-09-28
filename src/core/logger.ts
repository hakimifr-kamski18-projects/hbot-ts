import {
  configure,
  getConsoleSink,
  getLogger,
  type LogLevel,
} from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";

import { LOG_LEVEL } from "../constants";

const ROOT = "hbot";

async function setupLogging(): Promise<void> {
  return configure({
    sinks: {
      console: getConsoleSink({
        formatter: getPrettyFormatter({ categoryTruncate: false }),
      }),
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
