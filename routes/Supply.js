const ethers = require("ethers");
const abiToken = require("../stores/ABI").abiToken;
const spinAddress = "0x6aa217312960a21adbde1478dc8cbcf828110a67";
const bscProvider = new ethers.providers.JsonRpcProvider(
  "https://bsc-dataseed1.binance.org/"
);
const contract = new ethers.Contract(spinAddress, abiToken, bscProvider);
const fetchTotalSupply = async () => {
  const result = parseFloat(
    ethers.utils.formatEther(await contract.totalSupply())
  );
  return result;
};
const fetchTotalBurned = async () => {
  const result = parseFloat(
    ethers.utils.formatEther(await contract.totalBurned())
  );
  return result;
};
module.exports.fetchTotalSupply = fetchTotalSupply;
module.exports.fetchTotalBurned = fetchTotalBurned;
