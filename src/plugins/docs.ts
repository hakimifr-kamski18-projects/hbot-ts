import { md } from "@mtcute/bun";
import { PREFIXES } from "../constants";
import { filters } from "@mtcute/dispatcher";
import { definePlugin } from "../core/plugin";

export default definePlugin({
  name: "docs",
  description: "Get the docs URL of RM6785",
  commands: [
    { name: "docs", description: "Reply with the current URL of RM6785 docs" },
  ],

  register({ dp, log }) {
    dp.onNewMessage(
      filters.command("docs", { prefixes: PREFIXES }),
      async (msg) => {
        const docs = "https://realme-mt6785-devs.github.io/RM6785-docs";
        const chatId = msg.chat.id;

        log.info("Docs URL requested at {chatId}", { chatId });

        await msg.edit({
          text: md`**RM6785 Official Docs**\n\n${docs}`,
        });
      },
    );
  },
});
