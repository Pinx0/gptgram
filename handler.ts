import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { bots } from './bot/config/bots';
import { processUpdate } from './bot/services/processUpdate';
import { Update } from '@grammyjs/types';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const processMessage = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const secret = event.headers['x-telegram-bot-api-secret-token'];
        const botToBot = Number(event.headers['x-bot-to-bot']);
        const bot = secret ? bots.find((b) => b.secret === secret) : undefined;
        if (!bot) {
            console.log('Invalid bot', secret);
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid bot',
                }),
            };
        }
        if (!event.body) {
            console.log('Invalid body', secret);
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid body.',
                }),
            };
        }
        const respondingBot = botToBot > 0 ? bots.find((b) => b.id === botToBot) : undefined;
        console.log('responding bot', respondingBot);
        const update = JSON.parse(event.body) as Update;
        const result = await processUpdate(respondingBot ?? bot, update, respondingBot !== undefined);
        if ('error' in result) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: result.error,
                }),
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Success!',
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};
