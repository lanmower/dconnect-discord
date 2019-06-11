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
        var options = {
            host: 'api.coingecko.com',
            path: '/api/v3/simple/price?ids=eos&vs_currencies=usd',
            headers: { 'User-Agent': 'request' }
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
                        const price = val('EOS',parseFloat(data.eos.usd)/1.10,false);
                        const amnt = Number(parsedamnt/price).toFixed(4);
                        sendres = await send(parsedamnt, id, dbo, msg.author.id);
                        /*if (!sendres.res.logs.events || sendres.res.logs.events.length == 0) {
                            msg.reply('failure sending ?');
                            return;
                        }
                        let memo;
                        if (words.length == 4) memo = words[3];
                        if (!memo) {
                            msg.reply(`please add a memo as your last parameter (if this is to discordtipio its your unique withdrawal code from DM`);
                            return;
                        }
                        console.log('sending eos');
                        eosres = await sendeos(amnt, user, memo, dbo);*/
                        console.log(amnt, price, data.eos.usd, parsedamnt);
                        if(amnt === NaN) msg.channel.send(`amount is not a number, ${amnt}, ${parsedamnt}`);
                        else msg.channel.send(`!tip <@${msg.author.id}> ${amnt} EOS`);
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