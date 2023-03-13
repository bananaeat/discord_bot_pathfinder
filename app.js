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
import { getValue, updateValue, actOnValue } from "./dbutils.js"
import { createRequire } from "module";
import Discord from "discord.js";

const client = new Discord.Client({
	intents: [
		1 << 0,
		1 << 1,
    1 << 9,
    1 << 12,
		1 << 15,
	],
});

client.on("messageCreate", message => {
  const m = message.content;
  if(m.startsWith('!')){
    if(m.startsWith('!spell')){
      const args = m.split(' ');
      if(args.length < 2){
        message.reply("命令格式不正确！");
        return;
      }
      const spell_name = m.substring(7);
      const spell = SearchDatabase(spell_name, spells_database);
      const reply = spell.length == 0 ? 'Spell not found' : SpellDataFormatter(spell);
      message.reply(reply);
    }

    if(m.startsWith('!dice')){
      const args = m.split(' ');
      if(args.length < 2){
        message.reply("命令格式不正确！");
        return;
      }
      const dice_expr = args[1]
      const dice_target = args.length > 2 ? args[2] : null;
      const dice = new Dice();
      const result = dice.roll(dice_expr);
      const reply = (dice_target != null ? '泉津的魔法骰子，目标是 ' + dice_target + '\n': '') + "投骰结果：" + dice_expr + ' = ' + result.total + '\n' + "骰值列表：" +result.renderedExpression.toString();
      message.reply(reply);
    }
    
    if(m.startsWith('!ri')){
      const args = m.split(' ');
      const ri_expr = args[0].substring(2)
      const ri_target = args.length > 1 ? args[1] : null;
      const dice_expr = "d20" + ri_expr;
      const dice_target = args.length > 2 ? args[2] : null;
      const dice = new Dice();
      const result = dice.roll(dice_expr);
      const init_list = JSON.parse(getValue("init"));
      const init_instance = {username: message.author.username, charname: message.author.username, init_value: result.total};
      init_list.push(init_instance);
      updateValue("init", JSON.stringify(init_list));
      const reply = "泉津的先攻更新，" + ri_target == null ? message.author.username : ri_target + "的先攻结果：" + dice_expr + " = " + result.total;
      message.reply(reply);
    }
    
    if(m.startsWith('!init')){
      const args = m.split(' ');
      const init_target = args.length > 1 ? args[1] : null;
      if(init_target == "list"){
        const init_list = JSON.parse(getValue("init"));
        const reply = "泉津的先攻记录：\n";
        init_list.forEach(function(ins){
          reply += ins.charname + ": " + ins.init_value + "\n";
        })
        message.reply(reply);
        return;
      }
      if(init_target == "clear"){
        updateValue("init", "[]");
        message.reply("先攻记录清理完成！");
        return;
      }
    }
  }
});

client.on("ready", () => {
  console.log("Logged in as " + client.user.tag + "!");
  
  setInterval(() => {
    client.user.setStatus('TRPGing');
    client.user.setActivity(`和群友们`, {type: '玩耍'}); 
  }, 10000);
});

client.login(process.env.DISCORD_TOKEN);



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
          content: (dice_target != null ? '泉津的魔法骰子，目标是 ' + dice_target + '\n': '') + "投骰结果：" + dice_expr + ' = ' + result.total + '\n' + "骰值列表：" +result.renderedExpression.toString()
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
