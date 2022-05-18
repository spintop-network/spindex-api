const ethers = require("ethers");
const fs = require("fs");

const abiLP = require("../stores/ABI").abiLP;
const abiToken = require("../stores/ABI").abiToken;
const abiFarm = require("../stores/ABI").abiFarm;

// connect to provider at start
let provider;
const connectNode = async () => {
  try {
    provider = new ethers.providers.JsonRpcProvider(process.env.BINANCE_RPC);
  } catch (err) {
    console.log("Error: ", err);
  }
};
connectNode();

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
}, 10000);

const fetchFarms = async (farm, id, database) => {
  if (farm.farms[id].chainID != 56) {
    return farm;
  }
  // console.log("Fetching ", farm.farms[id].title);
  const farmContract = new ethers.Contract(
    farm.farms[id].addrFarm,
    abiFarm,
    provider
  );
  const collateralContract = new ethers.Contract(
    farm.farms[id].addrStake,
    abiLP,
    provider
  );

  if (farm.farms[id].type == "farm") {
    const farmBalance = ethers.utils.formatUnits(
      await collateralContract.balanceOf(farm.farms[id].addrFarm)
    );
    const lpTotalSupply = ethers.utils.formatUnits(
      await collateralContract.totalSupply()
    );
    const token_0 = await collateralContract.token0();
    const reserves = await collateralContract.getReserves();
    const reserve_0 = ethers.utils.formatUnits(reserves[0]);
    const reserve_1 = ethers.utils.formatUnits(reserves[1]);
    const reserve = token_0 == addr.token.spin ? reserve_0 : reserve_1;
    farm.farms[id].tvl =
      reserve * 2 * database.spinPrice * (farmBalance / lpTotalSupply);
    farm.farms[id].collateralPrice =
      (reserve * 2 * database.spinPrice) / lpTotalSupply;
    farm.farms[id].rewardPrice = database.spinPrice;

    const rewardPerSecond = ethers.utils.formatUnits(
      await farmContract.rewardRate()
    );
    const rewardPerYear = rewardPerSecond * 60 * 60 * 24 * 365;
    const rewardValue = rewardPerYear * database.spinPrice;
    farm.farms[id].apr = (rewardValue / farm.farms[id].tvl) * 100;
    farm.farms[id].dailyApr = farm.farms[id].apr / 365;

    farm.farms[id].totalStaked = ethers.utils.formatUnits(
      await farmContract.totalStaked()
    );
    farm.farms[id].totalStaked =
      farm.farms[id].totalStaked * farm.farms[id].collateralPrice;
  } else if (farm.farms[id].type == "pool") {
    const farmBalance = ethers.utils.formatUnits(
      await farmContract.totalStaked()
    );
    if (farm.farms[id].rewardToken != "SPIN") {
      const rewardLPContract = new ethers.Contract(
        farm.farms[id].addrLP,
        abiLP,
        provider
      );
      const token_0 = await rewardLPContract.token0();
      const reserves = await rewardLPContract.getReserves();
      if (token_0 == addr.token.spin_polygon || token_0 == addr.token.spin) {
        farm.farms[id].rewardPrice =
          (ethers.utils.formatUnits(reserves[0]) /
            ethers.utils.formatUnits(reserves[1], farm.farms[id].decimal)) *
          database.spinPrice;
      } else {
        farm.farms[id].rewardPrice =
          (ethers.utils.formatUnits(reserves[1], farm.farms[id].decimal) /
            ethers.utils.formatUnits(reserves[0])) *
          database.spinPrice;
      }
    } else {
      farm.farms[id].rewardPrice = database.spinPrice;
    }
    farm.farms[id].collateralPrice = database.spinPrice;

    farm.farms[id].tvl = farmBalance * database.spinPrice;
    const rewardPerSecond = ethers.utils.formatUnits(
      await farmContract.rewardRate(),
      farm.farms[id].decimal
    );
    const rewardPerYear = rewardPerSecond * 60 * 60 * 24 * 365;
    const rewardValue = rewardPerYear * farm.farms[id].rewardPrice;
    farm.farms[id].apr = (rewardValue / farm.farms[id].tvl) * 100;
    farm.farms[id].dailyApr = farm.farms[id].apr / 365;
    farm.farms[id].totalStaked = ethers.utils.formatUnits(
      await farmContract.totalStaked()
    );
    farm.farms[id].totalStaked =
      farm.farms[id].totalStaked * database.spinPrice;
  }
  if (farm.farms[id].limit) {
    farm.farms[id].periodFinish = await farmContract.periodFinish();
  }
  // console.log("Fetched ", farm.farms[id].title);
  return farm;
};

module.exports = fetchFarms;
