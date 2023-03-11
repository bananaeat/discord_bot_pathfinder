import fetch from 'node-fetch';
import { verifyKey } from 'discord-interactions';

export function VerifyDiscordRequest(clientKey) {
  return function (req, res, buf, encoding) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send('Bad request signature');
      throw new Error('Bad request signature');
    }
  };
}

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use node-fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)'
    },
    ...options
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export function SearchDatabase(key, database) {
  var spell = {name: null};
  database.forEach(function(d){
    if(d["name"] == key)
      spell = d;
  });
  // return original response
  return spell;
}

export function SpellDataFormatter(spell) {
  // String for spell level
  var spell_level = "";
  spell['source']['class'].forEach(function(c){
    spell_level += c[0] + ' ' + c[1] + ', '
  })
  spell_level = spell_level.substring(0,spell_level.length-2);
  
  //String for components
  var components = "";
  Object.keys(spell['components']).forEach(function(c){
    if(c != 'materials')
      components += c + ', '
    else
      components += c + '(' + spell['materials']['value'] + 
        ('gpValue' in spell['materials'] ? (', ' + spell['materials']['gpValue'] + 'gp')
      : '') + ')' + ', '
  })
  components = components.substring(0,components.length-2);
  
  //String for range
  var range = "";
  if(spell['range']['units'] in ['touch', 'personal', 'close', 'medium', 'long'])
    range = spell['range']['units']
  else
    range = spell['range']['value'] + ' ' + spell['range']['units']
  
  return spell['name'] + '\n' +
          '**学派** ' + spell['school'] + '\n' +
          '**等级** ' + spell_level + '\n' +
          '**动作** ' + spell['action']['cost'] + ' ' + spell['action']['type'] + '\n' +
          '**成分** ' + components + '\n' +
          '**距离** ' + range + '\n' +
          (spell['effect'] != '' ? '**效果** ' + spell['effect'] + '\n' : '') + 
          (spell['target'] != '' ? '**目标** ' + spell['target'] + '\n' : '') +
          '**持续时间** ' + spell['duration'] + '\n' + 
          '**豁免** ' + spell['save'] + '\n' + ;
          
}

// Simple method that returns a random emoji from list
export function getRandomEmoji() {
  const emojiList = ['😭','😄','😌','🤓','😎','😤','🤖','😶‍🌫️','🌏','📸','💿','👋','🌊','✨'];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}