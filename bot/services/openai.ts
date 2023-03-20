import type { Chat, User, Message } from '../../generated/client'
import type { Bot } from "../config/bots";

type GptMessage = { role: "system" | "user" | "assistant"; content: string };

export type Prompt = {
  messages: GptMessage[];
};

type GetGptResponseCommand = {
  prompt: Prompt;
  chatConfig: Chat;
};

type GptChoice = {
  message: {
    role: "assistant";
    content: string;
  };
  finish_reason: string;
  index: number;
};

export type GptValidResponse = {
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
  created: number;
  id: string;
  model: string;
  choices: GptChoice[];
};
type GptInvalidResponse = {
  error: {
    message: string;
    code: string;
  };
};
type GptResult = GptValidResponse | GptInvalidResponse;
export const getGptResponse = async (
  requestBody: GetGptResponseCommand
): Promise<GptResult> => {
  const { prompt, chatConfig } = requestBody;
  try {
    const body = JSON.stringify({
      messages: prompt.messages,
      max_tokens: chatConfig.token_limit,
      temperature: chatConfig.temperature,
      frequency_penalty: chatConfig.frequency_penalty,
      presence_penalty: chatConfig.presence_penalty,
      model: chatConfig.model,
    });
    const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: chatConfig.api_key ?? "",
      },
      body,
    });
    return (await response.json()) as GptValidResponse | GptInvalidResponse;
  } catch (error) {
    return { error: { message: error as string, code: "unknown" } };
  }
};
type MessageWithUser = Message & {
  user: User;
};

export const preparePrompt = (
  chatMessages: MessageWithUser[],
  chatConfig: Chat,
  bot: Bot
): Prompt => {
  const messages: GptMessage[] = [];
  //add system message
  messages.push({
    role: "system",
    content: chatConfig.personality ?? "You are a chatbot.",
  });
  //add bot first message to set tone
  if (chatConfig.first_message) {
    messages.push({
      role: "assistant",
      content: chatConfig.bot_name + ": " + chatConfig.first_message,
    });
  }
  //add all messages in chronological order
  chatMessages
    .sort((a, b) => a.date - b.date)
    .map((m) => {
      const isBotMessage = m.user_id === BigInt(bot.id);
      const role = isBotMessage ? "assistant" : "user";
      const name = isBotMessage ? chatConfig.bot_name : m.user.first_name;
      const processedMessage =
        name + ": " + m.content.replace(bot.username, chatConfig.bot_name);

      messages.push({
        role: role,
        content: processedMessage,
      });
    });
  return { messages };
};
