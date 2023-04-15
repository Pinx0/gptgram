import type { Message as TelegramMessage, Update } from '@grammyjs/types';
import { FromTelegramToCreateMessageCommand } from './converter';
import {
    createMessage,
    getByMessageId,
    getChatConfig,
    getLastClear,
    getLastMessages,
    saveCompletion,
} from './database';
import { sendMessage } from './telegram';
import type { Chat } from '../../generated/client';
import type { Bot } from '../config/bots';
import { getGptResponse, preparePrompt, validateConfig } from './openai';

type Success = {
    ok: { messageSent: boolean };
};
type Failure = {
    error: 'GPT' | 'Invalid update' | 'DB error';
};
export type Result = Success | Failure;

export const processUpdate = async (bot: Bot, update: Update): Promise<Result> => {
    const token = bot.id.toString() + ':' + bot.secret;
    const message = update?.message;
    if (!message) {
        console.log('Invalid update', update);
        return {
            error: 'Invalid update',
        };
    }
    const chat = message.chat;
    const chat_id = chat.id;

    //convert telegram format to DB format
    const createMessageCommand = FromTelegramToCreateMessageCommand(message, bot);
    console.log('Message parsed');

    //log message to db
    let dbMessage;
    try {
        dbMessage = await createMessage(createMessageCommand);
        console.log('Message saved to DB');
    } catch (error) {
        console.log("Couldn't save message to DB", error);
        return { error: 'DB error' };
    }

    //get chat config
    let chatConfig = await getChatConfig({ chat_id, bot_id: bot.id });
    console.log('Chat config', chatConfig);

    if (!chatConfig) {
        return { error: 'DB error' };
    }

    //check if should respond
    const speak = shouldSpeak(message, chatConfig, bot);
    if (!speak.send) return { ok: { messageSent: false } };
    //check errors in config
    const validationResult = validateConfig(chatConfig);
    if ('errors' in validationResult) {
        const responseToUser =
            'Your config is not valid due to: ' +
            validationResult.errors.join(', ') +
            '. You can ask @PabloLopezPonce for help.';
        console.log('Invalid config', validationResult.errors);
        const telegramResponse = await sendMessage({
            token,
            chat_id,
            text: responseToUser,
            reply_to_message_id: speak.reply ? message.message_id : undefined,
        });
        console.log('Telegram Response', telegramResponse);

        return { ok: { messageSent: true } };
    }
    const validConfig = validationResult.validConfig;

    //get last N messages from DB
    const contextDate = await getContextStart({
        chat_id,
        bot_id: bot.id,
        origin: speak.origin,
        message_id: message.message_id,
    });

    const lastMessages = await getLastMessages({
        chat_id,
        bot_id: bot.id,
        number_of_messages: validConfig.history_length,
        min_date: contextDate,
    });
    //prepare openAI prompt
    const prompt = preparePrompt(lastMessages, validConfig, bot);
    console.log('Prompt ready');
    //call openAI
    const gptResponse = await getGptResponse({ prompt, chatConfig: validConfig });
    console.log('GPT Response', gptResponse);

    if ('error' in gptResponse) {
        if (gptResponse.error.code === 'invalid_api_key') {
            const responseToUser = 'The API key you provided is being rejected ';
            const telegramResponse = await sendMessage({
                token,
                chat_id,
                text: responseToUser,
                reply_to_message_id: speak.reply ? message.message_id : undefined,
            });
            console.log('Telegram Response', telegramResponse);
            return { ok: { messageSent: true } };
        }
        return { error: 'GPT' };
    }
    //log completion
    await saveCompletion(gptResponse, dbMessage, bot);

    const gptMessage = gptResponse.choices[0].message.content;
    const responseToUser = trimUserNameFromMessage(gptMessage);
    //send message
    const telegramResponse = await sendMessage({
        token,
        chat_id,
        text: responseToUser,
        reply_to_message_id: speak.reply ? message.message_id : undefined,
    });
    console.log('Telegram Response', telegramResponse);
    const botMessage = telegramResponse.response?.result as TelegramMessage.TextMessage;
    const createBotMessageCommand = FromTelegramToCreateMessageCommand(botMessage, bot);

    //save it to database
    await createMessage(createBotMessageCommand);
    return { ok: { messageSent: true } };
};

type GetContextStartParams = {
    chat_id: number;
    bot_id: number;
    origin: SpeakOrigin;
    message_id: number;
};
const getContextStart = async ({ chat_id, bot_id, origin, message_id }: GetContextStartParams) => {
    const lastClear = await getLastClear({
        chat_id,
        bot_id: bot_id,
    });
    let originalMention = message_id;
    let originalDate = 0;
    const oldestCap = Date.now() / 1000 - 60 * 60 * 5;
    console.log('Last clear', lastClear);
    if (origin === 'reply') {
        while (true) {
            const repliedTo = await getByMessageId({
                chat_id,
                bot_id,
                message_id: originalMention,
            });
            if (repliedTo === null) break;
            originalDate = repliedTo.date;
            if (repliedTo.reply_to_message_id === null) break;
            originalMention = Number(repliedTo.reply_to_message_id);
            console.log('Checking previous message', originalMention);
        }
    }
    if (origin === 'mention') {
        const repliedTo = await getByMessageId({
            chat_id,
            bot_id,
            message_id: originalMention,
        });
        console.log('Answering to mention', [repliedTo?.date, lastClear?.date, oldestCap]);
        return repliedTo?.date ?? lastClear?.date ?? oldestCap;
    }
    console.log('Including in context up to...', [lastClear?.date, oldestCap, originalDate]);
    return Math.max(lastClear?.date ?? oldestCap, originalDate);
};

const trimUserNameFromMessage = (input: string) => {
    const regex = /^((?:\S+\s){0,3}\S+)\s?:\s?([\s\S]*)$/;
    const result = input.match(regex);

    return result && result.length > 1 && result[2] ? result[2] : input;
};
export type SpeakOrigin = 'command' | 'private' | 'mention' | 'reply' | 'spontaneous';
type ShouldSpeakResult = {
    origin: SpeakOrigin;
    send: boolean;
    reply: boolean;
};
const shouldSpeak = (message: TelegramMessage, chatConfig: Chat, bot: Bot): ShouldSpeakResult => {
    if (message.text?.startsWith('/')) {
        console.log('Is command');
        return { send: false, reply: false, origin: 'command' };
    }
    if (message.chat.type === 'private') {
        console.log('Is private chat');
        return { send: true, reply: false, origin: 'private' };
    }
    if (message.reply_to_message?.from?.id && BigInt(message.reply_to_message?.from?.id) === chatConfig.bot_id) {
        console.log('Is replying to bot message');
        return { send: true, reply: true, origin: 'reply' };
    }
    if (message.text && message.text.includes(bot.username)) {
        console.log('Is mentioning the bot');
        return { send: true, reply: true, origin: 'mention' };
    }
    const dice = Math.random();
    console.log(`Dice: ${dice} - Speak chance: ${chatConfig.speak_chance}`);
    return { send: dice < chatConfig.speak_chance, reply: false, origin: 'spontaneous' };
};
