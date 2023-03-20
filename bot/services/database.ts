import { Message, MessageType, Prisma, PrismaClient } from "@prisma/client";
import type { CreateMessage } from "./converter";
import type { GptValidResponse } from "./openai";
import type { Bot } from "../config/bots";

export const database = new PrismaClient();

type QueryChatConfig = {
  chat_id: number;
  bot_id: number;
};
type CreateChatConfig = {
  chat_id: number;
  bot_id: number;
  name: string;
};
type QueryLastMessages = {
  chat_id: number;
  bot_id: number;
  number_of_messages: number;
  min_date?: number;
};
type QueryLastClear = {
  chat_id: number;
  bot_id: number;
};
export const getLastClear = async ({ chat_id, bot_id }: QueryLastClear) => {
  return database.message.findFirst({
    orderBy: [
      {
        date: "desc",
      },
    ],
    where: {
      AND: {
        chat_id: { equals: chat_id },
        bot_id: { equals: bot_id },
        content: { startsWith: "/clear" },
      },
    },
  });
};

export const getLastMessages = async ({
  chat_id,
  bot_id,
  number_of_messages,
  min_date,
}: QueryLastMessages) => {
  return database.message.findMany({
    take: number_of_messages,
    orderBy: [
      {
        date: "desc",
      },
    ],
    where: {
      AND: {
        chat_id: { equals: chat_id },
        bot_id: { equals: bot_id },
        date: { gt: min_date },
        message_type: MessageType.Text,
      },
    },
    include: {
      user: true,
    },
  });
};
export const getChatConfig = async ({ chat_id, bot_id }: QueryChatConfig) => {
  return database.chat.findUnique({
    where: {
      chat_id_bot_id: {
        chat_id,
        bot_id,
      },
    },
  });
};
export const updateChatConfig = async ({
  chat_id,
  bot_id,
  bot_name,
  frequency_penalty,
  presence_penalty,
  token_limit,
  temperature,
  history_length,
  api_key,
  first_message,
  personality,
  speak_chance,
}: Prisma.ChatUpdateInput & CreateChatConfig) => {
  return database.chat.update({
    where: { chat_id_bot_id: { bot_id, chat_id } },
    data: {
      bot_name,
      frequency_penalty,
      presence_penalty,
      token_limit,
      temperature,
      history_length,
      api_key,
      first_message,
      personality,
      speak_chance,
    },
  });
};

export const saveCompletion = async (
  gptResponse: GptValidResponse,
  message: Message,
  bot: Bot
) => {
  return database.completion.create({
    data: {
      completion_tokens: gptResponse.usage.completion_tokens,
      message_id: message.message_id,
      chat_id: message.chat_id,
      bot_id: bot.id,
      completion_id: gptResponse.id,
      prompt_tokens: gptResponse.usage.prompt_tokens,
      content: gptResponse.choices[0].message.content,
      model: gptResponse.model,
      date: gptResponse.created,
      finish_reason: gptResponse.choices[0].finish_reason,
    },
  });
};

export const createMessage = async (createMessage: CreateMessage) => {
  const message = await database.message.findUnique({
    where: {
      chat_id_bot_id_message_id: {
        message_id: createMessage.message.message_id,
        chat_id: createMessage.chat.chat_id,
        bot_id: createMessage.bot.id,
      },
    },
  });
  if (message) {
    console.log("Message already in DB", message);
    return message;
  }
  return database.message.create({
    data: {
      reply_to_message_id: createMessage.message.reply_to_message_id,
      message_id: createMessage.message.message_id,
      date: createMessage.message.date,
      content: createMessage.message.content,
      message_type: createMessage.message.message_type,
      chat: {
        connectOrCreate: {
          where: {
            chat_id_bot_id: {
              chat_id: createMessage.chat.chat_id,
              bot_id: createMessage.bot.id,
            },
          },
          create: {
            chat_id: createMessage.chat.chat_id,
            bot_id: createMessage.bot.id,
            bot_name: createMessage.bot.defaultName,
            title: createMessage.chat.title,
            type: createMessage.chat.type,
            frequency_penalty: 2,
            presence_penalty: 1,
            token_limit: 300,
            temperature: 1,
            history_length: 20,
          },
        },
      },
      user: {
        connectOrCreate: {
          where: { user_id: createMessage.user.user_id },
          create: {
            user_id: createMessage.user.user_id,
            is_bot: createMessage.user.is_bot,
            first_name: createMessage.user.first_name,
            last_name: createMessage.user.last_name,
            username: createMessage.user.username,
          },
        },
      },
    },
  });
};
