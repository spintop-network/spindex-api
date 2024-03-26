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

const fetchCirculatingSupply = async () => {
  try {
    const totalSupply = await contract.totalSupply();
    const anyswapBalance = await contract.balanceOf("0x171a9377C5013bb06Bca8CfE22B9C007f2C319F1");
    const spinStakedBalance = await contract.balanceOf("0x3B5095a84a5902E963BF6e302fcdBC38771B0C8c");
    return parseFloat(ethers.utils.formatEther(totalSupply.sub(anyswapBalance).sub(spinStakedBalance)));
  } catch (e) {
    console.error(e)
    return 0
  }
}

module.exports = {
  fetchTotalSupply,
  fetchTotalBurned,
  fetchCirculatingSupply
};
