const ethers = require("ethers");
const abiToken = require("../stores/ABI").abiToken;
const spinAddress = "0x6aa217312960a21adbde1478dc8cbcf828110a67";
const bscProvider = new ethers.providers.JsonRpcProvider(
  "https://bsc-dataseed1.defibit.io"
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
    const [anyswapBalance, spinStakedBalance] = await Promise.all([
      await contract.balanceOf("0x171a9377C5013bb06Bca8CfE22B9C007f2C319F1"),
      await contract.balanceOf("0x3B5095a84a5902E963BF6e302fcdBC38771B0C8c")
    ]);
    const [balance1, balance2] = await Promise.all([
      await contract.balanceOf("0x719361F0f9A775deB653410472dcFD3c9E011c5E"),
      await contract.balanceOf("0x2020501b0B221710E000707696375631d26821B9")
    ]);
    const [balance3, balance4] = await Promise.all([
      await contract.balanceOf("0x9b76d22A0F96785EBDc778576DB1f9F60d7A1D2B"),
      await contract.balanceOf("0x159f805bBD076bcA897904F0Ca1d18901D1CE9D0")
    ]);
    const balance5 = await contract.balanceOf("0x7019E1139949464EF520143eFe37A69EC0E48f45");
    return parseFloat(ethers.utils.formatEther(totalSupply.sub(anyswapBalance).sub(spinStakedBalance).sub(balance1).sub(balance2).sub(balance3).sub(balance4).sub(balance5)));
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
