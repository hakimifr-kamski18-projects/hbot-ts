import { filters } from "@mtcute/dispatcher";
import { thtml } from "@mtcute/html-parser";

import { definePlugin } from "../core/plugin";
import { getLoadedPlugins } from "../core/registry";
import { PREFIXES } from "../constants";

const prefix = PREFIXES[0] ?? "/";
const esc = thtml.escape;

export default definePlugin({
  name: "help",
  description: "List available commands.",
  commands: [{ name: "help", description: "Show this message" }],

  register({ dp, log }) {
    dp.onNewMessage(
      filters.command("help", { prefixes: PREFIXES }),
      async (msg) => {
        const plugins = getLoadedPlugins();
        log.info("building help for {count} plugin(s)", {
          count: plugins.length,
        });

        const sections = plugins.map((plugin) => {
          const lines = [
            `<b>📦 ${esc(plugin.name)}</b>`,
            `<i>${esc(plugin.description)}</i>`,
          ];

          if (plugin.commands?.length) {
            for (const cmd of plugin.commands) {
              const usage = cmd.usage ? ` ${cmd.usage}` : "";
              lines.push(
                `  • <code>${esc(prefix + cmd.name + usage)}</code> — ${esc(cmd.description)}`,
              );
            }
          } else {
            lines.push("  <i>No commands</i>");
          }

          return lines.join("\n");
        });

        // thtml (not html) because it preserves newlines instead of
        // collapsing them, and takes a prebuilt string via its 1-arg overload.
        await msg.replyText(
          thtml(`<b>🤖 Bot Commands</b>\n\n${sections.join("\n\n")}`),
        );
      },
    );
  },
});
