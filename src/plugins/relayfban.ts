import { MtPeerNotFoundError, User } from "@mtcute/core";
import { filters } from "@mtcute/dispatcher";
import { md } from "@mtcute/markdown-parser";

import { definePlugin } from "../core/plugin";
import { PREFIXES } from "../constants";
import type { Message, TextWithEntities } from "@mtcute/bun";

const FBAN_CHAT: number = -1001754321934;
const WHITELIST: number[] = [
  -1001309495065, // r6
  -1001754321934, // rm6785 chat
  -1002237651092, // rm6785 disc
];

export default definePlugin({
  name: "relayfban",
  description: "allows group admin to fban/unfban through me",
  commands: [
    { name: "rf", description: "relay fban the replied user/provided id" },
  ],

  register({ tg, dp, log }) {
    dp.onNewMessage(
      filters.command(
        ["rf", "relayfban", "unrf", "unrelayfban", "relayunfban"],
        { prefixes: PREFIXES },
      ),
      async (msg) => {
        const respond = async (
          t: string | TextWithEntities,
        ): Promise<Message> => {
          if (msg.sender.id === (await tg.getMe()).id) {
            return msg.edit({ text: t });
          } else {
            return msg.replyText(t);
          }
        };

        if (!WHITELIST.includes(msg.chat.id)) {
          log.info`chat ${msg.chat.id} not in whitelist`;
          return;
        }
        const a = await tg.getChatMembers(msg.chat.id, {
          limit: 200,
          type: "admins",
        });
        const admins = a.map((m) => m.user.id);
        if (!admins.includes(msg.sender.id)) {
          log.info`user ${msg.sender.id} called relayfban, but they're not an admin`;
          return;
        }

        const args: string[] = msg.text.split(" ");
        let command: string;
        if (["rf", "relayfban"].includes(args[0]!.slice(1))) command = "fban";
        else command = "unfban";
        args.shift();

        const requesterName = msg.sender.displayName;
        const requesterId = msg.sender.id;
        let targetUserId: number;

        if (msg.replyToMessage) {
          const fullRtm = await tg.getReplyTo(msg);
          targetUserId = fullRtm!.sender.id;
        } else {
          if (args.length < 1) {
            respond(
              md("__no user id provided, and you did not reply to anyone!__"),
            );
            return;
          }
          const tId: number = Number.parseInt(args[0]!);
          if (Number.isNaN(tId)) {
            let u: User;
            try {
              u = await tg.getUser(args[0]!.slice(1));
            } catch (e) {
              if (e instanceof MtPeerNotFoundError) {
                respond(
                  md(
                    "__no user id provided, and you did not reply to anyone!__",
                  ),
                );
                return;
              }
              throw new Error("unknown error when fetching username");
            }
            targetUserId = u.id;
          } else {
            targetUserId = tId;
          }
          args.shift();
        }

        const reason = args.join(" ") || "no reason provided";
        const fbanMsg = tg.sendText(
          FBAN_CHAT,
          md(
            `!${command} ${targetUserId} relay${command} requested by: ` +
              `[${requesterName}](tg://user?id=${requesterId}), ` +
              `"message link: ${msg.link}, reason: ${reason}`,
          ),
        );
        fbanMsg.then((msg) => {
          log.info(
            `sending ${command}, requester: ${requesterId}, ` +
              `target user: ${targetUserId}, admin reasoning: ${reason}, ` +
              `request message link: ${msg.link}`,
          );
          respond(msg.link);
        });
      },
    );
  },
});
