# GPTGram

This is an integration between the ChatGPT API and the Telegram API.

You can create a bot in Telegram that will respond and interact with people based on the responses of GPT.

## How it works

This project is using the following technologies:

-   Telegram API
-   OpenAI API
-   Prisma
-   Some external DB (such as MySQL)
-   Serverless Framework
-   AWS Lambda & AWS API Gateway

It's meant to work as a serverless function. As is, it is ready to be deployed in AWS, 
but you can achieve similar functionality with something like Vercel or Netlify.

The general flow is as follows:

- This project will expose an endpoint that will be called by the Telegram API
- It saves a copy of the received messages into a database
- Depending on the type of message (reply, quote or regular), it determines if the bot should answer or not
- In case it needs to answer, it polls the latest N messages from DB
- It creates an appropriate prompt for GPT, based on the personality you want the bot to have
- With the OpenAI response, it calls the Telegram API to send a message

### Creating a serverless app

Use https://www.serverless.com/ or your platform of choice and follow their instructions to setup your account and credentials.

You need to add there two environment variables, as set in [.env.example](/.env.example) for your database connection, that we will create now.

### Setting up the database

For this project to work, you need to have an external database somewhere.

It can be any kind of database support by [Prisma](https://www.prisma.io/), that is the library used to act as ORM.

When working with prisma remember that after each modification you have to regenerate the source by calling:

```
$ prisma generate
```

And in serverless, it needs the `rhel` engine to run. The issue is that this engine gets created
on the `generated/client` folder when you run and apparently after deploy,
the lambda is looking for it in the base directory, 
so you will have to move it yourself, along with `schema.prisma`

That is the reason that file is included in the repo.

### Deployment

Be sure to follow all instructions to install the serverless CLI.

Once done and setup, you need to run the following command to deploy:

```
$ serverless deploy
```

Or you can configure CI/CD in https://app.serverless.com/ to autodeploy on merge/push to git.

After running deploy, you should see output similar to:

```bash
Deploying gptgram to stage prod (eu-west-3, "personal-account" provider)

✔ Service deployed to stack gptgram-prod (37s)

dashboard: https://app.serverless.com/xxxxx/apps/gptgram/gptgram/prod/eu-west-3
endpoint: POST - https://xxxxxxx.execute-api.eu-west-3.amazonaws.com/gptgram/message
functions:
  processMessage: gptgram-prod-processMessage
```

### Creating the telegram bot

First of all, you need to create a bot using telegram and talking to @BotFather, when done, you will be assigned a token.

You can use that token to set a webhook, by calling:

`https://api.telegram.org/bot{yourTokenHere}/setWebhook`

Pass it a body like this:

```
{
    "url": "https://xxxxxxxx.execute-api.eu-west-3.amazonaws.com/gptgram/message",
    "allowed_updates": ["message"],
    "secret_token":"some_secret_value_you_want"
}
```

The url is the one that you got in the last step, where your endpoint is.

You then need to add the bot to the source code of your fork in `bot/config/bots`, where you can configure the `default_name` it will
have the first time you add the bot to a chat, the `user_id` of the bot (the part in the token before the colon)
and the secret token you just defined.

### Once it is live

You are still missing one piece, and that is the OpenAI configuration.

You need an API Key to call their API, since it is not free.

Also, once you have included your bot in a channel and sent at least one message, you will need to fill the personality 
of the bot in the Chat table of your database. There you can finetune some OpenAI parameters as well for better responses.