export type Bot = {
  id: number;
  secret: string;
  defaultName: string;
  username: string;
};

const torrenteBot: Bot = {
  id: 6001219979,
  secret: "AAFw6gVr1oD9OPCd6O9hvooaByAoVTG7bVo",
  defaultName: "Torrente",
  username: "JLTorrenteBot",
};

const sigmundBot: Bot = {
  id: 878538078,
  secret: "AAEFZqpnPyx_6MESh5p0eVCvNWQf_i2rv2A",
  defaultName: "Sigmund Freud",
  username: "Sigmund_Freud_Bot",
};

const alfredBot: Bot = {
  id: 6169444370,
  secret: "AAFTfq-b1eFxDB_epHEYnzoa6W4J7s4hh4M",
  defaultName: "Alfred",
  username: "AlfredMayordomoBot",
};

export const bots: Bot[] = [torrenteBot, alfredBot, sigmundBot];
