import { filters } from "@mtcute/dispatcher";
import { md } from "@mtcute/markdown-parser";

import { definePlugin } from "../core/plugin";
import { PREFIXES } from "../constants";
import type { Message } from "@mtcute/bun";

export default definePlugin({
  name: "purge",
  description: "Purge messages up to replied point. Supports topic.",
  commands: [
    { name: "purge", description: "Purge messages up to replied point." },
  ],

  register({ tg, dp, log }) {
    dp.onNewMessage(
      filters.command("purge", { prefixes: PREFIXES }),
      async (msg) => {
        if (!msg.replyToMessage) return;

        log.debug("starting purge");
        msg.edit({ text: md("__Purging...__") });

        const chat = await tg.getChat(msg.chat.id);

        if (chat.isForum) {
          log.info("purging in forum/topic mode, this might be slower");
          const targetThreadId = msg.replyToMessage.threadId
            ? msg.replyToMessage.threadId > 62000
              ? 1
              : msg.replyToMessage.threadId
            : 1;
          const start = msg.replyToMessage.id!;
          const end = msg.id;
          const length = end - start;
          const msgIds = Array.from({ length }, (_, i) => start + i);
          const msgs = await tg.getMessages(msg.chat.id, msgIds);
          let toDelete: Array<Message | null>;

          log.info("thread id = {targetThreadId}", { targetThreadId });

          if (targetThreadId != 1)
            toDelete = msgs.filter(
              (m) => m?.replyToMessage?.threadId === targetThreadId,
            );
          else toDelete = msgs.filter((m) => m && !m?.isTopicMessage);

          await tg.deleteMessages(toDelete as Message[], { revoke: true });
          log.info("purge completed");
          msg.edit({ text: md("__Purge completed!__") });
        } else {
          log.info("purging in non-topic group");
          const start = msg.replyToMessage.id!;
          const end = msg.id;
          const length = end - start;
          const msgIds = Array.from({ length }, (_, i) => start + i);
          const msgs = await tg.getMessages(msg.chat.id, msgIds);

          const toDelete = msgs.filter((m) => !!m);

          await tg.deleteMessages(msgs as Message[], { revoke: true });
          log.info("purge completed");
          msg.edit({ text: md("__Purge completed!__") });
        }
      },
    );
  },
});
