const production = true;
const port = 5000;

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const util = require("util");
const https = require("https");
require("dotenv").config();

const fetchData = require("./routes/Dashboard");
const fetchFarms = require("./routes/Farms");
const {fetchTotalSupply, fetchTotalBurned, fetchCirculatingSupply} = require("./routes/Supply");

const readdir = util.promisify(fs.readFile);
const app = express();
app.use(cors());

let totalSupply = 0;
let totalBurned = 0;
let circSupply = 0;

const farmsLoop = async (farms, database) => {
  try {
    let promises = farms.farms.map(async (farm, index) => {
      return fetchFarms(farms, index, database).then(async (data) => {
        farms.farms[index] = data.farms[index];
      });
    });
    await Promise.all(promises);
    fs.writeFileSync("./stores/Farms.json", JSON.stringify(farms));
  } catch (err) {
    console.log("Error: ", err);
  }
};

setInterval(async () => {
  let database = await readdir("./stores/data.json");
  database = JSON.parse(database);
  await fetchData(database);

  let farms = await readdir("./stores/Farms.json");
  farms = JSON.parse(farms);
  await farmsLoop(farms, database);
}, 20000);
setInterval(async () => {
  totalSupply = await fetchTotalSupply();
  totalBurned = await fetchTotalBurned();
  circSupply = await fetchCirculatingSupply();
}, 20000);

app.get("/totalSupply", (req, res) => {
  res.send(totalSupply.toString());
});
app.get("/circSupply", (req, res) => {
  res.send(circSupply.toString());
});
app.get("/getData", (req, res) => {
  fs.readFile("./stores/data.json", "utf8", (err, data) => {
    const database = JSON.parse(data);
    res.send(database);
  });
});
app.get("/getFarms", (req, res) => {
  fs.readFile("./stores/Farms.json", "utf8", (err, data) => {
    const database = JSON.parse(data);
    res.send(database);
  });
});
app.get("/getAddr", (req, res) => {
  fs.readFile("./stores/Address.json", "utf8", (err, data) => {
    const database = JSON.parse(data);
    res.send(database);
  });
});
app.get("/", (req, res) => {
  res.send("Spindex Temporary API");
});

  app.listen(port, () => {
    console.log(`Test app listening at http://localhost:${port}`);
  });
