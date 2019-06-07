async function contract(contract, action, dbo) {
    let contracts = await dbo.collection('contract');
    return (await contracts.findOne({ contract, action }));
}
module.exports = {
    commands: ['default'],
    run: async (msg, dbo) => {
        const words = msg.content.split(' ');
        let app = words.shift().split('&')[1];
        let key = words[0];
        const author = msg.author.id;
        let cont = await contract(app, key, dbo);
        if (!cont) {
            key = app;
            app = 'dconnectlive';
            cont = await contract(app, key, dbo);
            if (!cont) {
                msg.reply('contract not found');
                return;
            }
        } else {
            words.shift();
        }
        //console.log(cont);
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
                    value: JSON.stringify({ author, channel, server, data: words })
                },
            }]
        }, {
                blocksBehind: 9,
                expireSeconds: 180
            });

        const logs = await dbo.collection('logs');
        const watchCursor = logs.watch();
        let done;
        const watcher = setInterval(async () => {
            const log = await logs.findOne({ id: res.transaction_id });
            if (!log) return;
            if (log.res.logs.errors.length == 0) {
                console.log(log);
                if (log.res.logs.message) msg.reply(log.res.logs.message).catch(e => { console.error(e) });
                log.res.logs.events.forEach(log => {
                    if (log.event == 'message') msg.reply(log.data.text).catch(e => { console.error(e) });
                });
                clearInterval(watcher);
            } else {
                msg.reply(`failed ` + JSON.stringify(log.res.logs));
                clearInterval(watcher);
            }
            done = true;
            watchCursor.close();
        }, 500);
        setTimeout(() => {
            if (!done) {
                clearInterval(watcher);
                msg.reply(`timeout waiting for response`);
            }
        }, 30000);
    }
}