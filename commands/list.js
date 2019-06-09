const { runContract, contract } = require('../eos.js');

async function amount(user, token, dbo) {
    const account = (await dbo.collection('dconnectlive' + token.toUpperCase()).findOne({ _id: user }));
    return account ? account.amount : 0;
}

module.exports = {
    commands: ['list', 'l'],
    run: async (msg, dbo) => {
        console.log('list');
        const words = msg.content.split(' ');
        let message = "";
        let col = (await dbo.collection('dconnectliveoffers'));
        let size = await col.count();
        let state = col.find().forEach(async (item) => {
            const useramount = await amount(msg.author.id, item.targetName, dbo);
            if (item.user != msg.author.id) {
                const itemamount = Number(item.amount).toFixed(4);
                if(useramount >= item.targetAmount) {
                    const m = await msg.author.send(item._id + ' ' + item.amount + ' ' + item.tokenName + ' for ' + item.targetAmount + ' ' + item.targetName + "\n");
                    const filter = (reaction, user) => {
                        return ['🆗'].includes(reaction.emoji.name) && user.id === msg.author.id;
                    };
                    m.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
                        collected.forEach(async reaction=>{
                            if (reaction.emoji.name === '🆗') {
                                const mes = await runContract('dconnectlive', 'accept', { author:msg.author.id, channel:msg.channel?msg.channel.id:null, server:msg.server?msg.server.id:null, data: [item._id] }, dbo);
                                msg.reply(mes);
                            }
                        });
                    }).catch(collected => {
                    });
                    await m.react("🆗");
                    ++size;
                };
            }
            if (--size == 0) msg.reply(message != '' ? message : "No offers found.");
        });
        
    }
}