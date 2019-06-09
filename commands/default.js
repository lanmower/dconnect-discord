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
            console.log("RUNNING", app, key);
            const log = await runContract(app, key, { author, channel, server, data: words }, dbo);
            console.log("LOG", log);
            let message = log.res.logs.message;
            if(message == '') message = null;
            if (log && log.res.logs.message) {
                msg.reply(`${message} \nhttps://bloks.io/transaction/05a95727de597af51026bfffd950afce2d3a53de53afea15270e5961afa02dc8`).catch(e => { console.error(e) });
            }
        } catch(e) {
            console.error(e);
            if(e.res && e.res.logs.errors) msg.reply(e.res.logs.errors.join(';\n'));
            else msg.reply(e.message);
        }
    }
}
