const { runContract, contract } = require('../eos.js');
module.exports = {
    commands: ['default'],
    run: async (msg, dbo) => {
        const words = msg.content.split(' ');
        let app = words.shift().split('&')[1];
        let key = words[0];
        const author = msg.author.id;
        for (let index in words) {
            words[index] = words[index].replace('<@', '').replace('!', '').replace('>', '')
        }
        const channel = msg.channel ? msg.channel.id : null;
        const server = msg.guild ? msg.guild.id : null;
        try {
            const log = await runContract(app, key, { author, channel, server, data: words }, dbo);
            if (log && log.logs.message) msg.reply(log.logs.message).catch(e => { console.error(e) });
        } catch(e) {
            msg.reply(e.message + e.stack);
            console.log(e.stack);
        }
    }
}
