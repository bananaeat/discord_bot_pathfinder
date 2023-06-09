import { capitalize, DiscordRequest } from "./utils.js";

export async function HasGuildCommands(appId, guildId, commands) {
  if (guildId === "" || appId === "") return;

  commands.forEach((c) => HasGuildCommand(appId, guildId, c));
}

// Checks for a command
async function HasGuildCommand(appId, guildId, command) {
  // API endpoint to get and post guild commands
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;

  try {
    const res = await DiscordRequest(endpoint, { method: "GET" });
    const data = await res.json();

    if (data) {
      const installedNames = data.map((c) => c["name"]);
      // This is just matching on the name, so it's not good for updates
      // if (!installedNames.includes(command["name"])) {
      //   console.log(`Installing "${command["name"]}"`);
      //   InstallGuildCommand(appId, guildId, command);
      // } else {
      //   console.log(`"${command["name"]}" command already installed`);
      //   UpdateGuildCommand(appId, guildId, command);
      // }
      console.log(`Installing "${command["name"]}"`);
      InstallGuildCommand(appId, guildId, command);
    }
  } catch (err) {
    console.error(err);
  }
}

// Installs a command
export async function InstallGuildCommand(appId, guildId, command) {
  // API endpoint to get and post guild commands
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;
  // install command
  try {
    await DiscordRequest(endpoint, { method: "POST", body: command });
  } catch (err) {
    console.error(err);
  }
}

// Simple test command
export const TEST_COMMAND = {
  name: "test",
  description: "Basic guild command",
  type: 1,
};

export const SPELL_COMMAND = {
  name: "spell",
  description: "Spell Search",
  type: 1,
  options: [
    {
      name: "spell_name",
      description: "The name of the spell",
      type: 3,
      required: true,
    },
  ],
};

export const DICE_COMMAND = {
  name: "dice",
  description: "Roll a dice!",
  type: 1,
  options: [
    {
      name: "dice_expr",
      description: "The expression for rolling dices",
      type: 3,
      required: true,
    },
    {
      name: "target",
      description: "why rolling dice",
      type: 3,
      required: false,
    },
  ],
};
