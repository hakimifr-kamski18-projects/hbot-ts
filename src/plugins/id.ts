import { filters } from "@mtcute/dispatcher";
import { md } from "@mtcute/markdown-parser";

import { PREFIXES } from "../constants";
import { definePlugin } from "../core/plugin";

export default definePlugin({
  name: "id",
  description: "Get the ID of the current chat and user.",
  commands: [
    { name: "id", description: "Reply with current chat and sender IDs" },
  ],

  register({ dp, log }) {
    dp.onNewMessage(
      filters.command("id", { prefixes: PREFIXES }),
      async (msg) => {
        const chatId = msg.chat.id;
        const replyTo = (msg as any).messages?.[0]?.raw?.replyTo;
        // log.info(( msg as any).messages?.[0]) to see the full JSON string

        log.info("id requested in chat {chatId}", { chatId });

        if (replyTo?.forumTopic) {
          await msg.edit({
            text: md`**Chat ID:** \`${msg.chat.id}\`\n**This Topic ID:** \`${replyTo.replyToMsgId}\` `,
          });
        } else {
          await msg.edit({
            text: md`**Chat ID:** \`${msg.chat.id}\` `,
          });
        }
      },
    );
  },
});

// ? means if its exist, then proceed
