async function amount(user, token, dbo) {
    const account = (await dbo.collection('dconnectlive' + token.toUpperCase()).findOne({ _id: user }));
    return account ? account.amount : 0;
}
module.exports = {
    commands: ['pull'],
    run: async (msg, dbo) => {
        msg.channel.send("!tip <@336904195619815425> ALL "+msg.content)
    }
}