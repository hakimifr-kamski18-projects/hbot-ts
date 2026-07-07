const API_ID: number = parseInt(process.env.API_ID || "0");
const API_HASH: string = process.env.API_HASH || "";
const BOT_TOKEN: string = process.env.BOT_TOKEN || "";

if (!API_ID || !API_HASH || !BOT_TOKEN)
  throw new Error("required variables not set!");

export { API_ID, API_HASH, BOT_TOKEN };
