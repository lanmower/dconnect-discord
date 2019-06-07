let mongoclient;
function gracefulShutdown() {
    if (mongoclient) {
        mongoclient.close(false, () => {
            console.log('MongoDb connection closed.');
            process.exit();
        })
    } else {
        console.log('no mongo to close');
        process.exit();
    }
}

process.stdin.resume();
process.on('exit', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('uncaughtException', gracefulShutdown);

//const package = require('module-name')

module.exports = function init() {
    let ret = new Promise((resolve, reject) => {
        const MongoClient = require('mongodb').MongoClient;
        MongoClient.connect(process.env.url, { useNewUrlParser: true, reconnectTries: 60, poolSize: 1, reconnectInterval: 1000 }, async function (err, db) {
            if (!err) {
                mongoclient = db;
                resolve(mongoclient.db("dconnectlive"));
            } else {
                console.error('Can not connect to mongodb');
                process.exit();
            }
        });
    });
    return ret;
}
