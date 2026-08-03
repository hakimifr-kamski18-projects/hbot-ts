import type { TelegramClient } from "@mtcute/bun";
import type { Dispatcher } from "@mtcute/dispatcher";
import type { Logger } from "@logtape/logtape";

type PluginContext = {
  tg: TelegramClient;
  dp: Dispatcher;
  log: Logger;
};

type CommandDoc = {
  name: string;
  description: string;
  usage?: string;
};

type Plugin = {
  name: string;
  description: string;
  commands?: CommandDoc[];
  register(ctx: PluginContext): void | Promise<void>;
  dispose?(): void | Promise<void>;
};

/** Identity helper that pins the type so plugin files get inference + checking. */
const definePlugin = (plugin: Plugin): Plugin => plugin;

export { definePlugin, type Plugin, type PluginContext, type CommandDoc };
