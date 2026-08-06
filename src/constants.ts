import { isLogLevel, type LogLevel } from "@logtape/logtape";

const API_ID: number = parseInt(process.env.API_ID || "0");
const API_HASH: string = process.env.API_HASH || "";
const BOT_TOKEN: string = process.env.BOT_TOKEN || "";
const SESSION_STRING: string | null = process.env.SESSION_STRING || null;

if (!API_ID || !API_HASH || !BOT_TOKEN)
  throw new Error("required variables not set!");

const _level = process.env.LOG_LEVEL ?? "info";
if (!isLogLevel(_level)) throw new Error(`invalid LOG_LEVEL '${_level}'`);

const LOG_LEVEL: LogLevel = _level;

/** Command prefixes, mirroring hbot's configurable global prefixes. */
const PREFIXES: string[] = (process.env.PREFIXES ?? "/.,").split("");

export { API_ID, API_HASH, BOT_TOKEN, SESSION_STRING, LOG_LEVEL, PREFIXES };
