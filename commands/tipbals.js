module.exports = {
    commands: ['tipbals'],
    run: async (msg, dbo) => {
        msg.channel.send("!bals");
        waiting.push({time:new Date().getTime(), expiry:180000, run:(response)=>{
            if(response.author.id == '512212602613399552') {
                try {console.log("FOUND", (response.embeds[0].description))} catch(err){
                    console.error(err);
                };
                
                return false;
            }
            console.log('not found so far', response.content);
            return true;
        }})
    }
}