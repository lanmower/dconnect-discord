

const ecc = require('eosjs-ecc');
const { Api, JsonRpc, RpcError } = require('eosjs');
const JsSignatureProvider = require('eosjs/dist/eosjs-jssig').default;  // development only
const fetch = require('node-fetch');                            // node only; not needed in browsers
const rpc = new JsonRpc('https://api.eosdetroit.io', { fetch, chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' });
const { TextEncoder, TextDecoder } = require('util');           // node only; native TextEncoder/Decoder
const defaultPrivateKey = process.env.SECRET;
const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);
const eos = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

module.exports = {
    send: function (amount, user, author) {
        console.log("SENDING", user, amount, author, server = null, channel = null);
        return eos.transact({
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
                    value: JSON.stringify({ author, server, channel, data: [user, amount] })
                },
            }]
        }, {
                blocksBehind: 9,
                expireSeconds: 180
            });
    }, sendeos: function (amount, user, memo = "dconnect transaction") {
        console.log("SENDING EOS", JSON.stringify({
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
        }));
        return eos.transact({
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
        }, {
                blocksBehind: 9,
                expireSeconds: 180
            });
    }
}