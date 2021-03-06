const ecc = require('eosjs-ecc');
const { Api, JsonRpc, RpcError } = require('eosjs');
const JsSignatureProvider = require('eosjs/dist/eosjs-jssig').default;  // development only
const fetch = require('node-fetch');                            // node only; not needed in browsers
const rpc = new JsonRpc('https://api.eosdetroit.io', { fetch, chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' });
const { TextEncoder, TextDecoder } = require('util');           // node only; native TextEncoder/Decoder
const defaultPrivateKey = process.env.SECRET;
const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);
const eos = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

async function contract(contract, action, dbo) {
    let contracts = await dbo.collection('contract');
    return (await contracts.findOne({ contract, action }));
}

async function runContract(iapp, ikey, input, dbo) {
    let app = iapp;
    let key = ikey;
    let cont = await contract(app, key, dbo);
    if (!cont) {
        cont = await contract('dconnectlive', app, dbo);

        if (!cont) throw new Error(`action not found: ${app} on dconnectlive`);
        app = 'dconnectlive';
        key = iapp;
    } else {
        //data.data.shift();
    }
    console.log(input);
    if (cont.code && cont.view) {
        return new Promise((resolve, reject) => {
            const http = require('http');
            const data = JSON.stringify({
                payload: JSON.stringify(input.data),
                code: cont.code,
                contract: app
            })
            console.log(data);
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: '/test',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                }
            }

            const req = http.request(options, (res) => {
                let data = '';
                res.on('end', () => {
                    data = JSON.parse(data);
                    resolve({ res: data });
                });
                res.on('data', (d) => {
                    data += d ? d : '';
                })
            })

            req.on('error', (error) => {
                reject(error);
            })

            req.write(data)
            req.end()
        });
    }


    return await run({
        actions: [{
            account: 'dconnectlive',
            name: 'set',
            authorization: [{
                actor: process.env.ACC,
                permission: 'active',
            }],
            data: {
                app,
                account: process.env.ACC,
                key,
                value: JSON.stringify(input)
            },
        }]
    }, dbo);
}



function run(data, dbo) {
    return new Promise(async (resolve, reject) => {
        const logs = await dbo.collection('logs');
        const watchCursor = logs.watch();
        console.log("TRYING", data);
        const res = await eos.transact(data, {
            blocksBehind: 9,
            expireSeconds: 180
        });
        console.log(res);
        let done;
        const start = new Date().getTime();
        const watcher = setInterval(async () => {
            if (new Date().getTime() - 90000 > start) {
                if (!done) {
                    clearInterval(watcher);
                    reject(new Error(`timeout waiting for result of transaction`));
                }
            }
            const log = await logs.findOne({ id: res.transaction_id });
            if (!log) return;
            console.log("LOG",log);

            if (log.res.logs.errors.length == 0) {
                if (log.res.logs.message) {
                    log.res.logs.message += `\n\n\`https://bloks.io/transaction/${log.id}\``;
                }
                resolve(log);
                clearInterval(watcher);
            } else {
                console.error(log.res.logs.errors);
                throw new Error(log.res.logs.errors);
                clearInterval(watcher);
            }
            done = true;
            watchCursor.close();
        }, 500);
    });
}

module.exports = {
    contract,
    runContract,
    send: async function (amount, user, dbo, author) {
        console.log("SENDING", {user, amount, dbo, author});
        return await run({
            actions: [{
                account: 'dconnectlive',
                name: 'set',
                authorization: [{
                    actor: process.env.ACC,
                    permission: 'active',
                }],
                data: {
                    app: 'dconnectlive',
                    account: process.env.ACC,
                    key: 'send',
                    value: JSON.stringify({ author, data: [user, amount] })
                },
            }]
        }, dbo);
    }, sendeos: async function (amount, user, memo = "dconnect transaction", dbo) {
        console.log("SENDING EOS", amount,user,memo, dbo);
        return await run({
            actions: [{
                account: 'eosio.token',
                name: 'transfer',
                authorization: [{
                    actor: process.env.ACC,
                    permission: 'active',
                }],
                data: {
                    from: process.env.ACC,
                    to: user,
                    quantity: amount + ' EOS',
                    memo
                },
            }]
        }, dbo);
    }
}
