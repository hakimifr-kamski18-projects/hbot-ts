import { API_ID, API_HASH, BOT_TOKEN } from "./constants";

import { TelegramClient } from "@mtcute/bun";
import { Dispatcher, filters } from "@mtcute/dispatcher";

const tg = new TelegramClient({
  apiId: API_ID,
  apiHash: API_HASH,
  storage: "Bot-session",
});

// Dispatcher used for managing updates.
const dp = Dispatcher.for(tg);

dp.onNewMessage(filters.command("start"), async (msg) => {
  await msg.replyText("Hello from hbot!");
});

dp.onNewMessage(filters.command("echo"), async (msg) => {
  const args = msg.command.slice(1);

  if (args.length === 0) {
    await msg.replyText("Please provide args after the command.");
    return; // To prevent the rest of code from running.
  }

  const fulltext = args.join(" ");
  await msg.replyText(fulltext);
});

const self = await tg.start({
  botToken: String(BOT_TOKEN),
});
console.log(`Logged in as ${self.displayName}`);
