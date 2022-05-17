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
}, 10000);

// connect to provider at start
let provider;
const connectNode = async () => {
  provider = new ethers.providers.JsonRpcProvider(process.env.BINANCE_RPC);
};
connectNode();
