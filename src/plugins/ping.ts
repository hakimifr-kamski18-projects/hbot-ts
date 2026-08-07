import { filters } from "@mtcute/dispatcher";

import { definePlugin } from "../core/plugin";
import { PREFIXES } from "../constants";

export default definePlugin({
  name: "ping",
  description: "Check if the bot is alive.",
  commands: [{ name: "ping", description: "Reply with round-trip latency" }],

  register({ tg, dp, log }) {
    dp.onNewMessage(
      filters.and(filters.command("ping", { prefixes: PREFIXES }), filters.me),
      async (msg) => {
        const start = performance.now();
        const sent = await msg.edit({ text: "Pong!" });
        const ms = performance.now() - start;

        log.info("pong in {ms} ms", { ms });
        await tg.editMessage({
          message: sent,
          text: `Pong! latency: ${ms.toFixed(3)} ms`,
        });
      },
    );
  },
});
