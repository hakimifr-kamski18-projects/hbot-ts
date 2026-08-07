import { filters } from "@mtcute/dispatcher";
import { md } from "@mtcute/markdown-parser";

import { PREFIXES } from "../constants";
import { definePlugin } from "../core/plugin";

// filters - checks incoming messages to "filter" it
// md - for markdown
// PREFIXES - prefixs to trigger the bot
// definePlugin - helper function to ensure my plugin follows the correct format

export default definePlugin({
  name: "id",
  description: "Get the ID of the current chat and user.",
  commands: [
    { name: "id", description: "Reply with current chat and sender IDs" },
  ],
  // export default - the main function of this file
  // dp: Dispatcher - listen for an upcoming message
  // log - a logger to print messages
  // register - called when the bot starts and passes those two parameters

  register({ dp, log }) {
    dp.onNewMessage(
      filters.command("id", { prefixes: PREFIXES }),
      async (msg) => {
        const chatId = msg.chat.id;

        log.info("id requested in chat {chatId}", { chatId });

        await msg.edit({
          text: md`**Chat ID:** \`${chatId}\` `,
        });
      },
    );
  },
});