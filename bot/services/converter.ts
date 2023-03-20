import type { Message } from "@grammyjs/types";
import { ChatType, MessageType } from '../../generated/client'
import type { Bot } from "../config/bots";

const chatTypeConverter = {
  private: ChatType.Private,
  channel: ChatType.Channel,
  group: ChatType.Group,
  supergroup: ChatType.Supergroup,
};

export type CreateMessage = {
  message: {
    reply_to_message_id: number | null;
    message_id: number;
    date: number;
    content: string;
    message_type: MessageType;
  };
  user: {
    user_id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  chat: {
    chat_id: number;
    title: string;
    type: ChatType;
  };
  bot: Bot;
};

export const FromTelegramToCreateMessageCommand = (
  message: Message,
  bot: Bot
): CreateMessage => {
  let content = "";
  let message_type: MessageType = MessageType.Other;

  if (message.text) {
    content = message.text;
    message_type = MessageType.Text;
  } else if (message.animation) {
    content = message.animation.file_id;
    message_type = MessageType.Animation;
  } else if (message.video) {
    content = message.video.file_id;
    message_type = MessageType.Video;
  } else if (message.document) {
    content = message.document.file_id;
    message_type = MessageType.Document;
  } else if (message.audio) {
    content = message.audio.file_id;
    message_type = MessageType.Audio;
  } else if (message.sticker) {
    content = message.sticker.file_id;
    message_type = MessageType.Sticker;
  } else if (message.photo) {
    content = message.photo[0].file_id;
    message_type = MessageType.Sticker;
  }
  let chatTitle;
  if (message.chat.type === "private") {
    chatTitle = message.from?.first_name ?? "Unknown";
  } else {
    chatTitle = message.chat.title;
  }
  let userId = 0;
  let isBot = false;
  let firstName = "";
  let lastName;
  let userName;
  if (message.from) {
    userId = message.from.id;
    isBot = message.from.is_bot;
    firstName = message.from.first_name;
    lastName = message.from.last_name;
    userName = message.from.username;
  }

  return {
    message: {
      reply_to_message_id: message.reply_to_message
        ? message.reply_to_message.message_id
        : null,
      message_id: message.message_id,
      message_type: message_type,
      content: content,
      date: message.date,
    },
    user: {
      user_id: userId,
      username: userName,
      is_bot: isBot,
      first_name: firstName,
      last_name: lastName,
    },
    chat: {
      chat_id: message.chat.id,
      type: chatTypeConverter[message.chat.type],
      title: chatTitle,
    },
    bot,
  };
};
