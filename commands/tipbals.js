module.exports = {
    commands: ['tipbals'],
    run: async (msg, dbo) => {
        msg.channel.send("!bals");
        waiting.push({time:new Date().getTime(), expiry:180000, run:(msg)=>{
            const words = msg.content.split(' ');
            console.log(words);
        }})
    }
}