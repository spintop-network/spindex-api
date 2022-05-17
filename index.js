// import express from "express";
// import cors from "cors";

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const util = require("util");
const ethers = require("ethers");
const abiLP = require("./stores/ABI").abiLP;
const abiToken = require("./stores/ABI").abiToken;
const abiFarm = require("./stores/ABI").abiFarm;

// promisify to use in async function
const readdir = util.promisify(fs.readFile);

// set express&cors
const app = express();
app.use(cors());
const PORT = 5000;

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
}, 60000);

// connect to provider at start
let provider;
const connectNode = async () => {
  provider = new ethers.providers.JsonRpcProvider(
    "https://fragrant-silent-snowflake.bsc.quiknode.pro/1c75461abd6819322507a060e5f05fa910e03446/"
  );
};
connectNode();

app.get("/getData", (req, res) => {
  fs.readFile("./data.json", "utf8", (err, data) => {
    const database = JSON.parse(data);
    res.send(database);
  });
});

setInterval(async () => {
  let database = await readdir("./data.json");
  database = JSON.parse(database);
  let database_ = await fetchData(database);
  fs.writeFileSync("./data.json", JSON.stringify(database_));
}, 20000);

const fetchData = async (database) => {
  const spinContract = new ethers.Contract(addr.token.spin, abiToken, provider);
  database.totalMinted = ethers.utils.formatUnits(
    await spinContract.totalSupply()
  );
  database.totalBurned = ethers.utils.formatUnits(
    await spinContract.totalBurned()
  );

  // bnb price
  const bnbBusdContract = new ethers.Contract(addr.lp.bnbBusd, abiLP, provider);
  const bnbBusdReserves = await bnbBusdContract.getReserves();
  const bnbBusdReserve_0 = ethers.utils.formatUnits(bnbBusdReserves[0]);
  const bnbBusdReserve_1 = ethers.utils.formatUnits(bnbBusdReserves[1]);
  const bnbPrice = bnbBusdReserve_1 / bnbBusdReserve_0;

  // spin price
  const bnbSpinContract = new ethers.Contract(addr.lp.spinBnb, abiLP, provider);
  const bnbSpinReserves = await bnbSpinContract.getReserves();
  const bnbSpinReserve_0 = ethers.utils.formatUnits(bnbSpinReserves[0]);
  const bnbSpinReserve_1 = ethers.utils.formatUnits(bnbSpinReserves[1]);
  database.spinPrice = (bnbSpinReserve_1 / bnbSpinReserve_0) * bnbPrice;
  database.marketCap =
    (database.totalMinted - database.totalBurned) * database.spinPrice;

  // farms tvl
  const farmSpinBnb = new ethers.Contract(addr.farm.spinBnb, abiFarm, provider);
  const farmSpinSfund = new ethers.Contract(
    addr.farm.spinSfund,
    abiFarm,
    provider
  );
  const farmSpinAot = new ethers.Contract(addr.farm.spinAot, abiFarm, provider);
  const farmSpinKing = new ethers.Contract(
    addr.farm.spinKing,
    abiFarm,
    provider
  );
  const farmSpinDnxc = new ethers.Contract(
    addr.farm.spinDnxc,
    abiFarm,
    provider
  );
  const farmSpinMts = new ethers.Contract(addr.farm.spinMts, abiFarm, provider);
  const farmSpinSkill = new ethers.Contract(
    addr.farm.spinSkill,
    abiFarm,
    provider
  );
  const farmSpinPXP = new ethers.Contract(addr.farm.spinPXP, abiFarm, provider);
  const farmSpinCreo = new ethers.Contract(
    addr.farm.spinCreo,
    abiFarm,
    provider
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

  // pools tvl
  const poolSpin = new ethers.Contract(addr.pool.spin, abiFarm, provider);
  const poolSfund = new ethers.Contract(addr.pool.sfund, abiFarm, provider);
  const poolAot = new ethers.Contract(addr.pool.aot, abiFarm, provider);
  const poolKing = new ethers.Contract(addr.pool.king, abiFarm, provider);
  const poolDnxc = new ethers.Contract(addr.pool.dnxc, abiFarm, provider);
  const poolMts = new ethers.Contract(addr.pool.mts, abiFarm, provider);
  const poolSkill = new ethers.Contract(addr.pool.skill, abiFarm, provider);
  const poolPXP = new ethers.Contract(addr.pool.pxp, abiFarm, provider);
  const poolCreo = new ethers.Contract(addr.pool.creo, abiFarm, provider);

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

  database.tvl =
    spinBnbTVL +
    spinSfundTVL +
    spinAotTVL +
    spinKingTVL +
    spinDnxcTVL +
    spinMtsTVL +
    spinSkillTVL +
    spinPXPTVL +
    spinCreoTVL +
    (poolSpinTotalStaked +
      poolSfundTotalStaked +
      poolAotTotalStaked +
      poolKingTotalStaked +
      poolDnxcTotalStaked +
      poolMtsTotalStaked +
      poolSkillTotalStaked +
      poolPXPTotalStaked +
      poolCreoTotalStaked) *
      database.spinPrice;

  return database;
};

const fetchFarmTVL = async (addr_, farmBalance, spinPrice) => {
  const lpContract = new ethers.Contract(addr_, abiLP, provider);
  const lpTotalSupply = await lpContract.totalSupply();
  const token_0 = await lpContract.token0();
  const reserves = await lpContract.getReserves();
  const reserve_0 = ethers.utils.formatUnits(reserves[0]);
  const reserve_1 = ethers.utils.formatUnits(reserves[1]);
  const reserve = token_0 == addr.token.spin ? reserve_0 : reserve_1;
  return parseInt(reserve * 2 * spinPrice * (farmBalance / lpTotalSupply));
};

app.get("/", (req, res) => {
  res.send("Spindex Temporary API");
});

app.listen(PORT, () =>
  console.log(`Server is running on : http://localhost:${PORT}`)
);
