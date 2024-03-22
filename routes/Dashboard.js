const ethers = require("ethers");
const fs = require("fs");

// dynamic read for static file
let addr;
const fetchAddr = () => {
  fs.readFile("./stores/Address.json", "utf8", (err, data) => {
    addr = JSON.parse(data);
  });
};
fetchAddr();
setInterval(() => {
  fetchAddr();
}, 20000);

// connect to provider at start
let binanceProvider;
let polygonProvider;
const connectNodes = async () => {
  try {
    console.log('Binance node connected');
    binanceProvider = new ethers.providers.JsonRpcProvider(
      "https://bsc-dataseed1.binance.org/"
    );
  } catch (err) {
    console.log("Error: ", err);
  }
  try {
    polygonProvider = new ethers.providers.JsonRpcProvider(
      process.env.POLYGON_RPC
    );
  } catch (err) {
    console.log("Error: ", err);
  }
};
connectNodes();

const abiLP = require("../stores/ABI").abiLP;
const abiToken = require("../stores/ABI").abiToken;
const abiFarm = require("../stores/ABI").abiFarm;

// async operations in queue
const fetchData = async (database) => {
  try {
    const spinContract = new ethers.Contract(
      addr.token.spin,
      abiToken,
      binanceProvider
    );
    const [totalSupply, totalBurned] = await Promise.all([
      spinContract.totalSupply(),
      spinContract.totalBurned(),
    ]);
    database.totalMinted = parseFloat(
      ethers.utils.formatUnits(totalSupply.add(totalBurned))
    );
    database.totalBurned = parseFloat(
      ethers.utils.formatUnits(totalBurned)
    );

    // bnb price
    const bnbBusdContract = new ethers.Contract(
      addr.lp.bnbBusd,
      abiLP,
      binanceProvider
    );
    const bnbBusdReserves = await bnbBusdContract.getReserves();
    const bnbBusdReserve_0 = ethers.utils.formatUnits(bnbBusdReserves[0]);
    const bnbBusdReserve_1 = ethers.utils.formatUnits(bnbBusdReserves[1]);
    const bnbPrice = bnbBusdReserve_1 / bnbBusdReserve_0;

    // spin price
    const bnbSpinContract = new ethers.Contract(
      addr.lp.spinBnb,
      abiLP,
      binanceProvider
    );
    const bnbSpinReserves = await bnbSpinContract.getReserves();
    const bnbSpinReserve_0 = ethers.utils.formatUnits(bnbSpinReserves[0]);
    const bnbSpinReserve_1 = ethers.utils.formatUnits(bnbSpinReserves[1]);
    database.spinPrice = (bnbSpinReserve_1 / bnbSpinReserve_0) * bnbPrice;
    database.marketCap =
      (database.totalMinted - database.totalBurned) * database.spinPrice;

    const polygonTVL = await fetchPolygonTVL(database.spinPrice);

    // farms tvl
    const farmSpinBnb = new ethers.Contract(
      addr.farm.spinBnb,
      abiFarm,
      binanceProvider
    );
    const farmSpinSfund = new ethers.Contract(
      addr.farm.spinSfund,
      abiFarm,
      binanceProvider
    );
    const farmSpinAot = new ethers.Contract(
      addr.farm.spinAot,
      abiFarm,
      binanceProvider
    );
    const farmSpinKing = new ethers.Contract(
      addr.farm.spinKing,
      abiFarm,
      binanceProvider
    );
    const farmSpinDnxc = new ethers.Contract(
      addr.farm.spinDnxc,
      abiFarm,
      binanceProvider
    );
    const farmSpinMts = new ethers.Contract(
      addr.farm.spinMts,
      abiFarm,
      binanceProvider
    );
    const farmSpinSkill = new ethers.Contract(
      addr.farm.spinSkill,
      abiFarm,
      binanceProvider
    );
    const farmSpinPXP = new ethers.Contract(
      addr.farm.spinPXP,
      abiFarm,
      binanceProvider
    );
    const farmSpinCreo = new ethers.Contract(
      addr.farm.spinCreo,
      abiFarm,
      binanceProvider
    );
    const farmSpinTrivia = new ethers.Contract(
      addr.farm.spinTrivia,
      abiFarm,
      binanceProvider
    );

    const farmSpinBnbTotalStaked = await farmSpinBnb.totalStaked();
    const farmSpinSfundTotalStaked = await farmSpinSfund.totalStaked();
    const farmSpinAotTotalStaked = await farmSpinAot.totalStaked();
    const farmSpinKingTotalStaked = await farmSpinKing.totalStaked();
    const farmSpinDnxcTotalStaked = await farmSpinDnxc.totalStaked();
    const farmSpinMtsTotalStaked = await farmSpinMts.totalStaked();
    const farmSpinSkillTotalStaked = await farmSpinSkill.totalStaked();
    const farmSpinPXPTotalStaked = await farmSpinPXP.totalStaked();
    const farmSpinCreoTotalStaked = await farmSpinCreo.totalStaked();
    const farmSpinTriviaTotalStaked = await farmSpinTrivia.totalStaked();

    const spinBnbTVL = await fetchFarmTVL(
      addr.lp.spinBnb,
      farmSpinBnbTotalStaked,
      database.spinPrice
    );
    const spinSfundTVL = await fetchFarmTVL(
      addr.lp.spinSfund,
      farmSpinSfundTotalStaked,
      database.spinPrice
    );
    const spinAotTVL = await fetchFarmTVL(
      addr.lp.spinAot,
      farmSpinAotTotalStaked,
      database.spinPrice
    );
    const spinKingTVL = await fetchFarmTVL(
      addr.lp.spinKing,
      farmSpinKingTotalStaked,
      database.spinPrice
    );
    const spinDnxcTVL = await fetchFarmTVL(
      addr.lp.spinDnxc,
      farmSpinDnxcTotalStaked,
      database.spinPrice
    );
    const spinMtsTVL = await fetchFarmTVL(
      addr.lp.spinMts,
      farmSpinMtsTotalStaked,
      database.spinPrice
    );
    const spinSkillTVL = await fetchFarmTVL(
      addr.lp.spinSkill,
      farmSpinSkillTotalStaked,
      database.spinPrice
    );
    const spinPXPTVL = await fetchFarmTVL(
      addr.lp.spinPXP,
      farmSpinPXPTotalStaked,
      database.spinPrice
    );
    const spinCreoTVL = await fetchFarmTVL(
      addr.lp.spinCreo,
      farmSpinCreoTotalStaked,
      database.spinPrice
    );
    const spinTriviaTVL = await fetchFarmTVL(
      addr.lp.spinTrivia,
      farmSpinTriviaTotalStaked,
      database.spinPrice
    );

    // pools tvl
    const poolSpin = new ethers.Contract(
      addr.pool.spin,
      abiFarm,
      binanceProvider
    );
    const poolSfund = new ethers.Contract(
      addr.pool.sfund,
      abiFarm,
      binanceProvider
    );
    const poolAot = new ethers.Contract(
      addr.pool.aot,
      abiFarm,
      binanceProvider
    );
    const poolKing = new ethers.Contract(
      addr.pool.king,
      abiFarm,
      binanceProvider
    );
    const poolDnxc = new ethers.Contract(
      addr.pool.dnxc,
      abiFarm,
      binanceProvider
    );
    const poolMts = new ethers.Contract(
      addr.pool.mts,
      abiFarm,
      binanceProvider
    );
    const poolSkill = new ethers.Contract(
      addr.pool.skill,
      abiFarm,
      binanceProvider
    );
    const poolPXP = new ethers.Contract(
      addr.pool.pxp,
      abiFarm,
      binanceProvider
    );
    const poolCreo = new ethers.Contract(
      addr.pool.creo,
      abiFarm,
      binanceProvider
    );
    const poolTrivia = new ethers.Contract(
      addr.pool.trivia,
      abiFarm,
      binanceProvider
    );

    const poolSpinTotalStaked = parseInt(
      ethers.utils.formatUnits(await poolSpin.totalStaked())
    );
    const poolSfundTotalStaked = parseInt(
      ethers.utils.formatUnits(await poolSfund.totalStaked())
    );
    const poolAotTotalStaked = parseInt(
      ethers.utils.formatUnits(await poolAot.totalStaked())
    );
    const poolKingTotalStaked = parseInt(
      ethers.utils.formatUnits(await poolKing.totalStaked())
    );
    const poolDnxcTotalStaked = parseInt(
      ethers.utils.formatUnits(await poolDnxc.totalStaked())
    );
    const poolMtsTotalStaked = parseInt(
      ethers.utils.formatUnits(await poolMts.totalStaked())
    );
    const poolSkillTotalStaked = parseInt(
      ethers.utils.formatUnits(await poolSkill.totalStaked())
    );
    const poolPXPTotalStaked = parseInt(
      ethers.utils.formatUnits(await poolPXP.totalStaked())
    );
    const poolCreoTotalStaked = parseInt(
      ethers.utils.formatUnits(await poolCreo.totalStaked())
    );
    const poolTriviaTotalStaked = parseInt(
      ethers.utils.formatUnits(await poolTrivia.totalStaked())
    );

    database.tvl =
      polygonTVL +
      spinBnbTVL +
      spinSfundTVL +
      spinAotTVL +
      spinKingTVL +
      spinDnxcTVL +
      spinMtsTVL +
      spinSkillTVL +
      spinPXPTVL +
      spinCreoTVL +
      spinTriviaTVL +
      (poolSpinTotalStaked +
        poolSfundTotalStaked +
        poolAotTotalStaked +
        poolKingTotalStaked +
        poolDnxcTotalStaked +
        poolMtsTotalStaked +
        poolSkillTotalStaked +
        poolPXPTotalStaked +
        poolCreoTotalStaked +
        poolTriviaTotalStaked) *
        database.spinPrice;

    fs.writeFileSync("./stores/data.json", JSON.stringify(database));
  } catch (err) {
    console.log("error: ", err);
  }
};

const fetchFarmTVL = async (addr_, farmBalance, spinPrice) => {
  const lpContract = new ethers.Contract(addr_, abiLP, binanceProvider);
  const lpTotalSupply = await lpContract.totalSupply();
  const token_0 = await lpContract.token0();
  const reserves = await lpContract.getReserves();
  const reserve_0 = ethers.utils.formatUnits(reserves[0]);
  const reserve_1 = ethers.utils.formatUnits(reserves[1]);
  const reserve = token_0 == addr.token.spin ? reserve_0 : reserve_1;
  return parseInt(reserve * 2 * spinPrice * (farmBalance / lpTotalSupply));
};

const fetchPolygonFarmTVL = async (addr_, farmBalance, spinPrice) => {
  const lpContract = new ethers.Contract(addr_, abiLP, polygonProvider);
  const lpTotalSupply = await lpContract.totalSupply();
  const token_0 = await lpContract.token0();
  const reserves = await lpContract.getReserves();
  const reserve_0 = ethers.utils.formatUnits(reserves[0]);
  const reserve_1 = ethers.utils.formatUnits(reserves[1]);
  const reserve = token_0 == addr.token.spin ? reserve_0 : reserve_1;
  return parseInt(reserve * 2 * spinPrice * (farmBalance / lpTotalSupply));
};

const fetchPolygonTVL = async (spinPrice) => {
  const spinMatic = new ethers.Contract(
    addr.farm.spinMatic,
    abiFarm,
    polygonProvider
  );
  const farmSpinMaticTotalStaked = await spinMatic.totalStaked();
  const spinMaticTVL = await fetchPolygonFarmTVL(
    addr.lp.spinMatic,
    farmSpinMaticTotalStaked,
    spinPrice
  );

  const spinTRY = new ethers.Contract(
    addr.farm.spinTRY,
    abiFarm,
    polygonProvider
  );
  const farmSpinTRYTotalStaked = await spinTRY.totalStaked();
  const spinTRYTVL = await fetchPolygonFarmTVL(
    addr.lp.spinTRY,
    farmSpinTRYTotalStaked,
    spinPrice
  );

  const spinPolygonPool = new ethers.Contract(
    addr.pool.spin_polygon,
    abiFarm,
    polygonProvider
  );
  const spinPolygonTotalStaked = parseInt(
    ethers.utils.formatUnits(await spinPolygonPool.totalStaked())
  );
  const spinPolygonTVL = spinPolygonTotalStaked * spinPrice;

  return spinMaticTVL + spinTRYTVL + spinPolygonTVL;
};

module.exports = fetchData;
