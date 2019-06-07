require('dotenv').config()
const express = require('express');
const app = express();
app.use(express.static('public'));

const plugins = [];
var normalizedPath = require("path").join(__dirname, "commands");

require("fs").readdirSync(normalizedPath).forEach(function(file) {
  plugins.push(require("./commands/" + file));
});
async function start() {
  console.log('starting mongo');
  const commands = {};
  const authors = {};
  plugins.forEach((plugin)=>{
    if(plugin.commands) plugin.commands.forEach((command)=>{
      commands[command] = plugin;
    });
    if(plugin.authors) plugin.authors.forEach((author)=>{
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
  client.on('message', async msg => {
    console.log(msg.author.id, msg.content);

    const words = msg.content.replace(/  /gi, ' ').split(' ');
    let ran = false;
    console.log('checking against plugins');
    if (msg.content[0] == '&') {
      const command = msg.content.replace('&', '').split(' ')[0];
      ran = true;
      console.log("COMMAND RUN", commands[command]);
      if(commands[command]) await commands[command].run(msg, dbo);
      else await commands['default'].run(msg,dbo);
    } else {
      const author = msg.author.id;
      if(authors[author]) authors[author].run(msg,dbo)
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
