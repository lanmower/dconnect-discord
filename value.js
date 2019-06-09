const CoinGecko = require('coingecko-api');

const CoinGeckoClient = new CoinGecko();

var list;
const val = async (symbol, price) => {
  try {
    console.log("CHECKING:",symbol, price);
    if (!list) await run();
    var item = list.filter((item) => {
      console.log(item.symbol);
      return item.symbol == symbol
    })[0];
    var data = (await CoinGeckoClient.coins.fetch(item.id)).data;
    let p;
    p = data.market_data.price_change_percentage_1h;
    if (p > 0) { return price - (price * (0.01 * p)); }
    p = data.market_data.price_change_percentage_24h;
    if (p > 0) { return price - (price * (0.01 * p)); }
    else return price;
  } catch (e) {
    console.error(e);
    return 1;
  }
}

async function run() {
  list = (await CoinGeckoClient.coins.list()).data;
}

run();
setTimeout(run, 10000);
module.exports = val;