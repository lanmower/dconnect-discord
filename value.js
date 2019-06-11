const CoinGecko = require('coingecko-api');

const CoinGeckoClient = new CoinGecko();

var data;
const val = async (symbol, input, gt = false) => {
  try {
    if (!list) await run();
    var item = list.filter((item) => {
      return item.symbol == symbol.toLowerCase();
    })[0];
    let p;
    p = data.market_data.price_change_percentage_24h;
    const low = data.market_data.low_24h.usd;
    const high = data.market_data.high_24h.usd;
    const current = data.market_data.current_price.usd;
    const gtret = input*(low/current);
    const ltret = input*(high/current);
    console.log({low, current, high, gtret, ltret}) 
    return gt?gtret:ltret;
  } catch (e) {
    console.error(e);
    return input;
  }
}

async function run() {
  data = (await CoinGeckoClient.coins.list()).data;
}

run();
setTimeout(run, 10000);
module.exports = val;