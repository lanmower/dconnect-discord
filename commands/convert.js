async function amount(user, token, dbo) {
    const account = (await dbo.collection('dconnectlive' + token.toUpperCase()).findOne({ _id: user }));
    return account ? account.amount : 0;
}
const https = require('https');
const val = require('../value.js');
const { send, sendEos } = require('../eos.js');

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
                        const amnt = Number(parsedamnt / (data.eos.usd * 1.05)).toFixed(4);
                        const user = words[2];
                        const before = await amount(msg.author.id, "FF", dbo);
                        sendres = await send(parsedamnt, id, dbo, msg.author.id);
                        if (!sendres.res.logs.events || sendres.res.logs.events.length == 0) {
                            msg.reply('failure sending ?');
                            return;
                        }
                        let memo;
                        if (words.length == 4) memo = words[3];
                        if (!memo) {
                            msg.reply(`please add a memo as your last parameter (if this is to discordtipio its your unique withdrawal code from DM`);
                            return;
                        }
                        eosres = await sendeos(amnt, user, memo, dbo);
                        msg.reply(eosres.res.logs.message);
                    } catch (e) {
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