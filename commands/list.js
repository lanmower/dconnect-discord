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
        let size = 0;
        let state = col.find().forEach(async (item) => {
            const useramount = await amount(msg.author.id, item.targetName, dbo);
            if (item.user != msg.author.id) {
                const itemamount = Number(item.amount).toFixed(4);
                if(useramount >= item.targetAmount) {
                    const m = await msg.author.send(item._id + ' ' + item.amount + ' ' + item.tokenName + ' for ' + item.targetAmount + ' ' + item.targetName + "\n");
                    await m.react('😄');
                    size++;
                };
            }
            console.log(size);
        });
        if (!size) msg.reply(message != '' ? message : "No offers found.");
        
    }
}