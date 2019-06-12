module.exports = {
    commands: ['tipbals'],
    run: async (msg, dbo) => {
        msg.channel.send("!bals");
        waiting.push({time:new Date().getTime(), expiry:180000, run:(msg)=>{
            if(msg.author.id == '512212602613399552') {
                console.log("FOUND", msg.content);
                return false;
            }
            console.log('not found so far', msg.content);
            return true;
        }})
    }
}