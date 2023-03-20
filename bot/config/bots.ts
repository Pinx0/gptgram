export type Bot = {
    id: number;
    secret: string | undefined;
    defaultName: string;
    username: string;
};

const torrenteBot: Bot = {
    id: 6001219979,
    secret: process.env.TORRENTE_BOT,
    defaultName: 'Torrente',
    username: 'JLTorrenteBot',
};

const sigmundBot: Bot = {
    id: 878538078,
    secret: process.env.SIGMUND_BOT,
    defaultName: 'Sigmund Freud',
    username: 'Sigmund_Freud_Bot',
};

const alfredBot: Bot = {
    id: 6169444370,
    secret: process.env.ALFRED_BOT,
    defaultName: 'Alfred',
    username: 'AlfredMayordomoBot',
};

const botijinBot: Bot = {
    id: 6169444370,
    secret: process.env.BOTIJIN_BOT,
    defaultName: 'Botijín',
    username: 'spacecowboys_bot',
};

export const bots: Bot[] = [torrenteBot, alfredBot, sigmundBot, botijinBot];
