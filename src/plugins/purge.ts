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
        const purgeStartTime = performance.now();

        let shouldDelete: (m: Message | null) => boolean;

        if (chat.isForum) {
          log.info("purging in forum/topic mode, this might be slower");
          const targetThreadId = msg.replyToMessage.threadId
            ? msg.replyToMessage.threadId > 62000
              ? 1
              : msg.replyToMessage.threadId
            : 1;

          log.info("thread id = {targetThreadId}", { targetThreadId });

          shouldDelete =
            targetThreadId != 1
              ? (m) => m?.replyToMessage?.threadId === targetThreadId
              : (m) => !!m && !m?.isTopicMessage;
        } else {
          log.info("purging in non-topic group");
          shouldDelete = (m) => !!m;
        }

        const start = msg.replyToMessage.id!;
        const end = msg.id;
        const length = end - start;
        const msgIds = Array.from({ length }, (_, i) => start + i);
        const msgs = await tg.getMessages(msg.chat.id, msgIds);

        const toDelete = msgs.filter(shouldDelete);

        await tg.deleteMessages(toDelete as Message[], { revoke: true });
        const purgeTimeDelta = performance.now() - purgeStartTime;
        log.info("purge completed in {purgeTimeDelta} ms", {
          purgeTimeDelta,
        });
        msg.edit({
          text: md(`__Purge completed! Took ${purgeTimeDelta.toFixed(3)} ms__`),
        });
      },
    );
  },
});
