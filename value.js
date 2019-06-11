const CoinGecko = require('coingecko-api');

const CoinGeckoClient = new CoinGecko();

var list;
const val = async (symbol, input, gt = false) => {
  try {
    console.log("CHECKING:",{symbol, input, gt});
    if (!list) await run();
    var item = list.filter((item) => {
      return item.symbol == symbol.toLowerCase();
    })[0];
    console.log({symbol, item});
    var data = (await CoinGeckoClient.coins.fetch(item.id)).data;
    console.log(data.market_data);
    let p;
    p = data.market_data.price_change_percentage_24h;
    const low = data.market_data.low_24h;
    const high = data.market_data.high_24h;
    const current = data.market_data.current_price;
    if(gt) {
      return parseFloat(input)*(parseFloat(low)/parseFloat(current));
    } else {
      return parseFloat(input)*(parseFloat(high)/parseFloat(current));
    }
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