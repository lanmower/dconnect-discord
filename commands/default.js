const { runContract, contract } = require('../eos.js');
module.exports = {
    commands: ['default'],
    run: async (msg, dbo) => {
        const words = msg.content.split(' ');
        let app = words.shift().split('&')[1];
        let key = words[0];
        const author = msg.author.id;
        console.log(app, cont);
        for (let index in words) {
            words[index] = words[index].replace('<@', '').replace('!', '').replace('>', '')
        }
        const channel = msg.channel ? msg.channel.id : null;
        const server = msg.guild ? msg.guild.id : null;
        if (cont.code && cont.view) {
            const http = require('http');
            console.log(words);
            const data = JSON.stringify({
                payload: JSON.stringify(words),
                code: cont.code,
                contract: app
            })

            const options = {
                hostname: 'localhost',
                port: 3000,
                path: '/test',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                }
            }

            const req = http.request(options, (res) => {
                console.log(`statusCode: ${res.statusCode}`)
                let data = '';
                res.on('end', () => {
                    console.log(data);
                    msg.reply(JSON.parse(data).logs.message);
                });
                res.on('data', (d) => {
                    console.log(d);
                    data += d ? d : '';
                })
            })

            req.on('error', (error) => {
                console.error(error)
            })

            req.write(data)
            req.end()
            return;
        }
        const log = await runContract(app, key, JSON.stringify({ author, channel, server, data: words }), dbo);
        if (log.res.logs.message) msg.reply(log.res.logs.message).catch(e => { console.error(e) });
    }
}