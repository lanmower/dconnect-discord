const { send } = require('../eos.js');

const val = require('../value.js');
module.exports = {
    authors: ['512212602613399552'],
    run: async (msg, dbo) => {
        const words = msg.content.split(' ');
        if (words[2] == 'sent') {
            //console.log(words[6].split('*')[0]);
            if (words[3] == '<@502921403385774090>') {
                try { 
                    amnt = (await val(words[5].split('*')[0], 1)) * parseFloat(msg.content.split('$')[1].split(')')[0]);
                    const user = words[1].replace('!', '').split('@')[1].split('>')[0];
		    if(isNaN(amnt)) {
			   token = words[5].split('*')[0];
			   amnt = words[4].split('**')[1];
			   msg.reply('token not supported, attempting refund');
			   msg.channel.send('!tip <@'+user+'> '+amnt+' '+token);
			   return;
		    }
		    console.log("AMOUNT",amnt);
                    const log = await send(amnt, user, dbo);
                    //console.log("LOG", log);
                    let message = log.res.logs.message;
                    if(message == '') message = null;
                    if (log && log.res.logs.message) {
                        msg.reply(message).catch(e => { console.error(e) });
                    }
                } catch(e) {
                    console.error(e);
                    if(e.res && e.res.logs.errors) msg.reply(e.res.logs.errors.join(';\n'));
                    else msg.reply(e.message);
                }
            }
        }
    }
}