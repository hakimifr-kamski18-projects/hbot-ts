import { filters } from "@mtcute/dispatcher";

import { definePlugin } from "../core/plugin";
import { PREFIXES } from "../constants";

export default definePlugin({
  name: "basic",
  description: "Basic bot commands.",
  commands: [
    { name: "start", description: "Check if the bot is alive" },
    { name: "echo", description: "Repeat back your text", usage: "<text>" },
  ],

  register({ dp, log }) {
    dp.onNewMessage(
      filters.and(filters.command("start", { prefixes: PREFIXES }), filters.me),
      async (msg) => {
        log.info("start from {chatId}", { chatId: msg.chat.id });
        msg.edit({ text: "Hello from hbot!" });
      },
    );

    dp.onNewMessage(
      filters.and(filters.command("echo", { prefixes: PREFIXES }), filters.me),
      async (msg) => {
        // msg.command[0] is the command itself; the rest are arguments.
        const args = msg.command.slice(1);

        if (args.length === 0) {
          msg.edit({ text: "Please provide args after the command." });
          return;
        }

        msg.edit({ text: args.join(" ") });
      },
    );
  },
});
