# Telegram bot

## How it works

When you create a bot using @BotFather, you will be assigned a token.

You can use that token to set a webhook, by calling:

`https://api.telegram.org/bot{yourTokenHere}/setWebhook`

Pass it a body like this:

```
{
    "url": "https://youapp.vercel.app/api/bot",
    "allowed_updates": ["message"],
    "secret_token":"some_secret_value_you_want"
}
```

You then need to add the bot to the source code in `src/bot/config/bots`, where you can configure the name you have
given, the `user_id` of the bot (the part in the token before the colon) and the secret token you just defined.