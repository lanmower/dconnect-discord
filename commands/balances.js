async function amount(user, token, dbo) {
    console.log(dbo);
    const account = (await dbo.collection('dconnectlive' + token.toUpperCase()).findOne({ _id: user }));
    return account ? account.amount : 0;
}
module.exports = {
    commands: ['bals', 'balls', 'bas', 'bls', 'b', 'balances', 'blas'],
    run: async (msg, dbo) => {
        const words = msg.content.split(' ');
        const token = words.length == 2 ? words[1] : 'FF';
        if (token == 'FF') {
            var message = "";
            var col = await dbo.collection('dconnectlive');
            var size = await col.count();
            let state = col.find().forEach(async (item) => {
                const amnt = await amount(msg.author.id, item._id, dbo);
                message += amnt ? amnt + ' ' + item._id + "\n" : '';
                if (size-- == 1) msg.reply(message);
            });
        } else msg.reply((await amount(msg.author.id, token, dbo)) + ' ' + token);
    }
}