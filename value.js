const CoinGecko = require('coingecko-api');

const CoinGeckoClient = new CoinGecko();

var list;
const val = async (symbol, price, gt = false) => {
  try {
    console.log("CHECKING:",{symbol, price, gt});
    if (!list) await run();
    var item = list.filter((item) => {
      return item.symbol == symbol.toLowerCase();
    })[0];
    var data = (await CoinGeckoClient.coins.fetch(item.id)).data;
    let p;
    p = data.market_data.price_change_percentage_1h;
    if(gt) {
      if (p > 0) { price -= (price * (0.01 * p)); }
    } else {
      if (p < 0) { price += (price * (0.01 * p)); }
    }
    p = data.market_data.price_change_percentage_24h;
    if(gt) {
      if (p > 0) { return price - (price * (0.01 * p)); }
    } else {
      if (p < 0) { return price + (price * (0.01 * p)); }
    }
    console.log(price);
    return price;
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