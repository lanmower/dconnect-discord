const CoinGecko = require('coingecko-api');

const CoinGeckoClient = new CoinGecko();

var list;
const val = async (symbol, input, highsel=true) => {
  try {
    if (!list) await run();
    var item = list.filter((item) => {
      return item.symbol == symbol.toLowerCase();
    })[0];
    var data = (await CoinGeckoClient.coins.fetch(item.id)).data;
    let p;
    p = data.market_data.price_change_percentage_24h;
    const low = data.market_data.low_24h.usd;
    const high = data.market_data.high_24h.usd;
    const current = data.market_data.current_price.usd;
    const lowret = input*(low/current);
    const highret = input*(high/current);
    console.log("value estimate: highsel?low:high")
    return highsel?lowret:highret;
  } catch (e) {
    console.error(e);
    return input;
  }
}

async function run() {
  list = (await CoinGeckoClient.coins.list()).data;
}

run();
setTimeout(run, 10000);
module.exports = val;