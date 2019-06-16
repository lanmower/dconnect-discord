require('dotenv').config()
const express = require('express');
const app = express();
const { send } = require('./eos.js');
app.use(express.static('public'));

const plugins = [];
var normalizedPath = require("path").join(__dirname, "commands");
global.waiting = [];
require("fs").readdirSync(normalizedPath).forEach(function (file) {
  plugins.push(require("./commands/" + file));
});
async function start() {
  console.log('starting mongo');
  const commands = {};
  const authors = {};
  plugins.forEach((plugin) => {
    if (plugin.commands) plugin.commands.forEach((command) => {
      commands[command] = plugin;
    });
    if (plugin.authors) plugin.authors.forEach((author) => {
      authors[author] = plugin;
    });
  })
  console.log(commands);
  console.log('starting');
  const Discord = require('discord.js');
  const client = new Discord.Client();

  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

  const dbo = await require('./mongo.js')();

  const events = {
    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
  };

  client.on('raw', async event => {
    if (!events.hasOwnProperty(event.t)) return;

    const { d: data } = event;
    const user = client.users.get(data.user_id);
    const channel = client.channels.get(data.channel_id) || await user.createDM();

    if (channel.messages.has(data.message_id)) return;

    const message = await channel.fetchMessage(data.message_id);
    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    let reaction = message.reactions.get(emojiKey);

    if (!reaction) {
      const emoji = new Discord.Emoji(client.guilds.get(data.guild_id), data.emoji);
      reaction = new Discord.MessageReaction(message, emoji, 1, data.user_id === client.user.id);
    }

    client.emit(events[event.t], reaction, user);
  });

  client.on('messageReactionAdd', (reaction, user) => {
    //console.log(`${user.username} reacted with "${reaction.emoji.name}" to ${reaction.message.id}.`);
  });

  client.on('messageReactionRemove', (reaction, user) => {
    //console.log(`${user.username} removed their "${reaction.emoji.name}" reaction.`);
  });

  const authorlist = {};
  client.on('message', async msg => {
    //console.log(msg.author.id, msg.content);
	if(!authorlist[msg.author.id] && !msg.author.bot) {
		authorlist[msg.author.id]={count:1, id:msg.author.id, date:new Date()};
	}

        for(let index in authorlist) {
	    const auth = authorlist[index];
	    if(auth.id == msg.author.id) {
		if(auth.count > 100) {
			await send(1, 'dconnectlive', dbo, msg.author.id);
			msg.reply("You have received 1 TEXT token for your chat activity, check your balances with &bals");
			delete authorlist[msg.author.id]; 
		} else if(auth.date.getTime()+30000>new Date().getTime()) {
			authorlist[msg.author.id] = {count:authorlist[msg.author.id].count+1, id:msg.author.id, date:new Date()}
		}
            }  
            if(auth.date.getTime()+86400000<new Date().getTime()) delete authorlist[msg.author.id]; 
	};
    const words = msg.content.replace(/  /gi, ' ').split(' ');
    let ran = false;
    waiting = waiting.filter((item)=>{
      console.log('processing', item.time+item.expiry, new Date().getTime());
      if(item.time+item.expiry <  new Date().getTime()) {
        console.log('timeout');
        return false;
      } 
      return item.run(msg);
    });    
    if (msg.content[0] == '&') {
      const command = msg.content.replace('&', '').split(' ')[0];
      ran = true;
      //console.log("COMMAND RUN", command, commands, commands[command]);
      if (commands[command]) await commands[command].run(msg, dbo);
      else await commands['default'].run(msg, dbo);
    } else {
      const author = msg.author.id;
      if (authors[author]) authors[author].run(msg, dbo)
    }
  });

  client.login(process.env.TOKEN);
}
if (process.env.start) start();
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
