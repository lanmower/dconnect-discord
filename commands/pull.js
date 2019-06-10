module.exports = {
    commands: ['pull'],
    run: async (msg, dbo) => {
        msg.channel.send("!tip <@336904195619815425> ALL "+msg.content.split(' ')[1])
    }
}