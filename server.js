require('dotenv').config()
// server.js
// where your node app starts
// init project
const express = require('express');
const http = require('http');
const https = require('https'); 
const app = express();
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

const CoinGecko = require('coingecko-api');

const CoinGeckoClient = new CoinGecko();

let output = [];
var list;
var val = async (list, symbol, price)=>{
 try {
  if(!list) await run();
  var item = list.filter((item)=>{
    return item.symbol == symbol
  })[0];
  var data = (await CoinGeckoClient.coins.fetch(item.id)).data;
  let p;
  p = data.market_data.price_change_percentage_1h;
  if(p>0) { return price-(price * (0.01*p)); }
  p = data.market_data.price_change_percentage_24h;
  if(p>0) { return price-(price * (0.01*p)); }
  else return price;
 } catch(e) {
  console.error(e);
  return 1;
 } 
} 

async function run() {
  list = (await CoinGeckoClient.coins.list()).data;
console.log(await val(list, 'goat', 10));
}
 
run();
setTimeout(run, 10000);

 
const ecc = require('eosjs-ecc');
const { Api, JsonRpc, RpcError } = require('eosjs');
const JsSignatureProvider = require('eosjs/dist/eosjs-jssig').default;  // development only
const fetch = require('node-fetch');                            // node only; not needed in browsers
const rpc = new JsonRpc('https://api.eosdetroit.io', { fetch, chainId:'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' });
const { TextEncoder, TextDecoder } = require('util');           // node only; native TextEncoder/Decoder
const defaultPrivateKey = process.env.SECRET;
const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);
const eos = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
function send(amount, user, author)  {
  console.log("SENDING", user, amount, author, server=null, channel=null);
  return eos.transact({
    actions: [{
      account: 'dconnectlive',
      name: 'set',
      authorization: [{
        actor: process.env.ACC,
        permission: 'active',
      }],
      data: {
        app: 'dconnectlive',
        account: process.env.ACC,
        key: 'send',
        value:JSON.stringify({author, server, channel,data:[user,amount]})
      },
    }]
  }, {
    blocksBehind: 9,
    expireSeconds: 180
  });
}
function sendeos(amount, user,memo="dconnect transaction")  {
  console.log("SENDING EOS", JSON.stringify({
    actions: [{
      account: 'eosio.token',
      name: 'transfer',
      authorization: [{
        actor: process.env.ACC,
        permission: 'active',
      }],
      data: {
        from: process.env.ACC,
        to: user,
        quantity: amount+' EOS',
        memo
      },
    }]
  }));
  return eos.transact({
    actions: [{
      account: 'eosio.token',
      name: 'transfer',
      authorization: [{
        actor: process.env.ACC,
        permission: 'active',
      }],
      data: {
        from: process.env.ACC,
        to: user,
        quantity: amount+' EOS',
        memo
      },
    }]
  }, {
    blocksBehind: 9,
    expireSeconds: 180
  });
}
 
async function amount(user, token) {
    const account = (await dbo.collection('dconnectlive'+token.toUpperCase()).findOne({_id:user}));
    return account?account.amount:0;
}
async function contract(contract, action) {
    let contracts = await dbo.collection('contract');
    return (await contracts.findOne({contract, action}));
}
const Discord = require('discord.js');
const client = new Discord.Client();
var MongoClient = require('mongodb').MongoClient;
let mongoclient;
MongoClient.connect(process.env.url, { useNewUrlParser: true,reconnectTries: 60,poolSize: 1,  reconnectInterval: 1000}, async function(err, db) {
  console.log(err);
  mongoclient = db;
  global.dbo = db.db("dconnectlive");
}); 
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on('message', async msg => {
  console.log(msg.author.id, msg.content);
  const words = msg.content.replace(/  /gi,' ').split(' ');
  if(words[0] == '&checkbals') {
    msg.channel.send('!bals');
  } else if(words[0] == '&bals' || words[0] == '&balls' || words[0] == '&bas' || words[0] == '&bls' || words[0] == '&b' || words[0] == '&balances' || words[0] == '&blas') {
    const token = words.length==2?words[1]:'FF';
    if(token == 'FF') {
      var message = "";
      var col = (await dbo.collection('dconnectlive'));
      var size = await col.count();
      let state = col.find().forEach(async (item)=>{
	const amnt = await amount(msg.author.id, item._id);
        message += amnt?amnt+' '+item._id+"\n":'';
	if(size--==1) msg.reply(message);
      }); 
    } else msg.reply((await amount(msg.author.id, token))+' '+token);
  } else if(words[0] == '&list') {
      var message = "";
      var col = (await dbo.collection('dconnectliveoffers'));
      var size = await col.count();
      let state = col.find().forEach(async (item)=>{
	const useramount = await amount(msg.author.id, item.targetName); 
        if(item.user != msg.author.id) {
		const itemamount = Number(item.amount).toFixed(4);
		message += useramount>=item.targetAmount?item._id+' '+item.amount+' '+item.tokenName+' for '+item.targetAmount+' '+item.targetName+"\n":'';
	}
	if(size--==1) msg.reply(message!=''?message:"No offers found.");
      });
  } else if(words[0] == '&stats') {
    const stats = await dbo.collection('state').findOne();
    var offset = new Date().getTime() - new Date(stats.blockInfo.timestamp).getTime();
    const before = new Date(stats.blockInfo.timestamp).getTime();
    setTimeout(async ()=>{
	const stats = await dbo.collection('state').findOne();
	const after = new Date(stats.blockInfo.timestamp).getTime();
        const blocks = offset/500;
        const blocksbefore = before;
        const blocksafter = after;
	
	const persec = (blocksafter - blocksbefore) / 10000;
	console.log({blocksafter, blocksbefore, blocks, persec});
	msg.reply(Number(offset/1000/60/60).toFixed(2)+" hours behind "+Number(blocks/persec/60/60).toFixed(2)+" hours ETA");
    },10000);
  } else if(words[0] == '&convert') {
    const id = words[1].replace('<@!','').replace('>','');
var options = {
    host: 'api.coingecko.com',
    path: '/api/v3/simple/price?ids=eos&vs_currencies=usd',
    headers: {'User-Agent': 'request'}
};
https.get(options, function (res) {
    var json = '';
    res.on('data', function (chunk) {
        json += chunk;
    });
    let eosres, sendres;
    res.on('end', async function () {
        if (res.statusCode === 200) {
            try {
                var data = JSON.parse(json);
		const parsedamnt = parseFloat(words[1]);
                const amnt =Number(parsedamnt/(data.eos.usd*1.05)).toFixed(4);
                const user = words[2];
                const before = await amount(msg.author.id, "FF");
                sendres = await send(parsedamnt, id, msg.author.id);
	if(!sendres.processed || sendres.processed.length == 0) {
	      msg.reply('failure sending ??');
	      return;
	}
    let memo;
    if(words.length == 4) memo = words[3];
    if(!memo) {
        msg.reply(`please add a memo as your last parameter (if this is to discordtipio its your unique withdrawal code from DM`);
	return;
    }
    eosres = await sendeos(amnt, user, memo);
    const logs = await dbo.collection('logs');
    const watchCursor = logs.watch();
    let done;
    const watcher = setInterval(async ()=> {
      let log = await logs.findOne({id:eosres.transaction_id});

      if(!log) return;
      if(log.res) { 
          msg.reply(`sent ${amnt} EOS to ${user}, deducted ${parsedamnt} ₣₣`);
          clearInterval(watcher);
      } else {
        msg.reply(`transfer failed `+JSON.stringify(log.res.logs));
	clearInterval(watcher);
      }
      done = true;
      watchCursor.close(); 
    }, 500);
    setTimeout(()=>{
      if(!done) {
        clearInterval(watcher);
        msg.reply(`timeout waiting for response`);
      }
    }, 30000);
            } catch (e) {
                console.error(e);
            }
        } else {
            console.log('Status:', res.statusCode);
            //console.log(res); 
        }
    });
}).on('error', function (err) {
      console.log('Error:', err);
});
  } else if(words[0][0] == '&') {
    let app = words.shift().split('&')[1];
    let key = words[0];
    const author = msg.author.id;
    let cont = await contract(app, key);
    if(!cont) {
        key=app;
        app='dconnectlive';
	cont = await contract(app, key);
	if(!cont) {
		msg.reply('contract not found');
		return;
	}
    } else {
        words.shift();
    }
    //console.log(cont);
    for(let index in words) {
	words[index] = words[index].replace('<@','').replace('!','').replace('>','')
    }
    const channel = msg.channel.id;
    const server = msg.server.id;
    const res = await eos.transact({
    actions: [{
      account: 'dconnectlive',
      name: 'set',
      authorization: [{
        actor: process.env.ACC,
        permission: 'active',
      }],
      data: { 
        app,
        account: process.env.ACC,
        key,
        value:JSON.stringify({author, channel, server,data:words})
      },
    }]
  }, {
    blocksBehind: 9,
    expireSeconds: 180
  });
console.log(res);
    const logs = await dbo.collection('logs');
    const watchCursor = logs.watch();
    let done;
    const watcher = setInterval(async ()=> {
      const log = await logs.findOne({id:res.transaction_id});
      if(!log) return;
      if(log.res.logs.errors.length == 0) { 
	  log.res.logs.events.forEach(log=>{
	    if(log.event == 'message') msg.reply(log.data.text).catch(e=>{console.error(e)});
	  });
          clearInterval(watcher);
      } else {
        msg.reply(`failed `+JSON.stringify(log.res.logs));
	clearInterval(watcher);
      }
      done = true;
      watchCursor.close();
    }, 500);
    setTimeout(()=>{
      if(!done) {
        clearInterval(watcher);
        msg.reply(`timeout waiting for response`);
      }
    }, 30000);

  } else if (msg.author.id === '512212602613399552') {
    const words = msg.content.split(' ');
    if(words[2] == 'sent') {
console.log(words[6].split('*')[0]); 
      const amnt = (await val(list, words[4].split('*')[0], 1))*parseFloat(msg.content.split('$')[1].split(')')[0]);
      const user = await client.fetchUser(words[1].replace('!','').split('@')[1].split('>')[0]);
      
      const sendWords = user.lastMessage.content.split(' ');
      if(words[3] == '<@336904195619815425>') {
        const res = await send(amnt, user.id);
    //console.log(res.processed);
    const logs = await dbo.collection('logs');
    const watchCursor = logs.watch();
    let done; 
    const watcher = setInterval(async()=> {
      const log = await logs.findOne({id:res.transaction_id});
      if(!log) return;
      if(log.res.logs.events && log.res.logs.events[0].event == 'transfer') { 
        msg.reply(`${amnt} ₣₣ added to your account`);
	clearInterval(watcher);
      } else {
        msg.reply(`transfer failed `+JSON.stringify(log.res.logs));
	clearInterval(watcher);
      }
      done = true;
      watchCursor.close();
    }, 500);
    setTimeout(()=>{
      if(!done) {
        clearInterval(watcher);
        msg.reply('timeout waiting for response');
      }
    }, 30000);
      }
    }
  }
});

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
if(process.env.start) client.login(process.env.TOKEN);

// Create a function to terminate your app gracefully:
function gracefulShutdown(){
    // First argument is [force], see mongoose doc.
    if(mongoclient) mongoclient.close(false, () => {
      console.log('MongoDb connection closed.');
    });
}

process.stdin.resume();//so the program will not close instantly
process.on('exit', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('uncaughtException', gracefulShutdown);
