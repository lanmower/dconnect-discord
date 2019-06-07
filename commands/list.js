async function amount(user, token) {
    const account = (await dbo.collection('dconnectlive' + token.toUpperCase()).findOne({ _id: user }));
    return account ? account.amount : 0;
}
module.exports = {
    commands: ['list', 'l'],
    run: async (msg, dbo) => {
        console.log('list');
        const words = msg.content.split(' ');
        var message = "";
        var col = (await dbo.collection('dconnectliveoffers'));
        var size = await col.count();
        let state = col.find().forEach(async (item) => {
            const useramount = await amount(msg.author.id, item.targetName, dbo);
            if (item.user != msg.author.id) {
                const itemamount = Number(item.amount).toFixed(4);
                message += useramount >= item.targetAmount ? item._id + ' ' + item.amount + ' ' + item.tokenName + ' for ' + item.targetAmount + ' ' + item.targetName + "\n" : '';
            }
            if (size-- == 1) msg.reply(message != '' ? message : "No offers found.");
        });
    }
}