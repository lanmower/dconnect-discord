const { send } = require('../eos.js');

const { val } = require('../value.js');
module.exports = {
    authors: ['512212602613399552'],
    run: async (msg, dbo) => {
        const words = msg.content.split(' ');
        if (words[2] == 'sent') {
            console.log(words[6].split('*')[0]);
            const amnt = (await val(list, words[4].split('*')[0], 1)) * parseFloat(msg.content.split('$')[1].split(')')[0]);
            const user = await client.fetchUser(words[1].replace('!', '').split('@')[1].split('>')[0]);

            const sendWords = user.lastMessage.content.split(' ');
            if (words[3] == '<@336904195619815425>') {
                const res = await send(amnt, user.id);
                //console.log(res.processed);
                const logs = await dbo.collection('logs');
                const watchCursor = logs.watch();
                let done;
                const watcher = setInterval(async () => {
                    const log = await logs.findOne({ id: res.transaction_id });
                    if (!log) return;
                    if (log.res.logs.events && log.res.logs.events[0].event == 'transfer') {
                        msg.reply(`${amnt} ₣₣ added to your account`);
                        clearInterval(watcher);
                    } else {
                        msg.reply(`transfer failed ` + JSON.stringify(log.res.logs));
                        clearInterval(watcher);
                    }
                    done = true;
                    watchCursor.close();
                }, 500);
                setTimeout(() => {
                    if (!done) {
                        clearInterval(watcher);
                        msg.reply('timeout waiting for response');
                    }
                }, 30000);
            }
        }
    }
}