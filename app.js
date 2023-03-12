import express from "express";
import { Dice } from "dice-typescript";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from "discord-interactions";
import {
  VerifyDiscordRequest,
  getRandomEmoji,
  DiscordRequest,
  SearchDatabase,
  SpellDataFormatter
} from "./utils.js"
import { SPELL_COMMAND, TEST_COMMAND, DICE_COMMAND, HasGuildCommands } from "./commands.js";
import { createRequire } from "module";



// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

const require = createRequire(import.meta.url);
const spells_database = require("./spells.json");

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post("/interactions", async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" guild command
    if (name === "test") {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: "hello world " + getRandomEmoji(),
        },
      });
    }

    if (name === "spell") {
      // Send a message into the channel where command was triggered from
      const spell_name = data.options[0].value;
      const spell = SearchDatabase(spell_name, spells_database)
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: spell.length == 0 ? 'Spell not found' : SpellDataFormatter(spell),
        },
      });
    }
    
    if (name === "dice") {
      // Send a message into the channel where command was triggered from
      const dice_expr = data.options[0].value;
      const dice_target = data.options.length > 1 ? data.options[1].value : null;
      
      const dice = new Dice();
      const result = dice.roll(dice_expr);
      
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: (dice_target != null ? 'Result for ' + dice_target + '\n': '') + dice_expr + ' = ' + result.total + '\n' + result.renderedExpression.toString()
        },
      });
    }
  }
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);

  // Check if guild commands from commands.json are installed (if not, install them)
  HasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [
    TEST_COMMAND,
    SPELL_COMMAND,
    DICE_COMMAND
  ]);
});
