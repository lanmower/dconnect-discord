async function amount(user, token, dbo) {
    const account = (await dbo.collection('dconnectlive' + token.toUpperCase()).findOne({ _id: user }));
    return account ? account.amount : 0;
}
const https = require('https');
const val = require('../value.js');
const { send, sendeos } = require('../eos.js');

module.exports = {
    commands: ['convert', 'conv', 'con', 'c'],
    run: async (msg, dbo) => {
        const words = msg.content.split(' ');
        const id = words[1].replace('<@!', '').replace('>', '');
        const currency = words[2].toLowerCase().replace('vtc','vertcoin').replace('btc','bitcoin').replace('goat','goat-cash');
        var options = {
            host: 'api.coingecko.com',
            path: '/api/v3/simple/price?ids='+currency+'&vs_currencies=usd',
            headers: { 'User-Agent': 'request' }
        };
        https.get(options, function (res) {
            var json = '';
            res.on('data', function (chunk) {
                json += chunk;
            });
            let  sendres;
            res.on('end', async function () {
                if (res.statusCode === 200) {
                    try {
                        var data = JSON.parse(json);
                        const parsedamnt = parseFloat(words[1]);
			if(!data[currency]) {
				msg.reply('this currency is not supported')
			}
                        const price = await val(words[2],parseFloat(data[currency].usd),false);
                        const amnt = Number((parsedamnt*0.9)/price).toFixed(4);
        msg.channel.send("!bal "+currency);
        waiting.push({time:new Date().getTime(), expiry:180000, run:async (response)=>{
            if(response.author.id == '512212602613399552') {
                try {
		    const balance = parseFloat(response.embeds[0].fields[0].value.split('**')[1].split('**')[0].split(' ')[0]);
                    sendres = await send(parsedamnt, '502921403385774090', dbo, msg.author.id);
                    console.log(amnt, price, data[currency].usd, parsedamnt);

                    if(isNaN(amnt)) msg.channel.send(`amount is not a number, ${amnt}, ${parsedamnt}`);
                    else if(balance<parsedamnt) msg.channel.send(`not enough balance to do conversion`);
                    else msg.channel.send(`!tip <@${msg.author.id}> ${amnt} `+currency);
		    return false;
                } catch(err){
                    console.error(err); 
		    return false;
                };
                return false;
            }
            console.log('not found so far', response.content);
            return true;
        }})

                    } catch (e) {
                        msg.reply(e.message||e.res.logs.message);
                        console.error(e);
                    }
                } else {
                    console.log('Status:', res.statusCode);
                }
            });
        }).on('error', function (err) {
            console.log('Error:', err);
        });
    }
}