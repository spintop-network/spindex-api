const express = require("express");
const cors = require("cors");
const fs = require("fs");
const util = require("util");
const ethers = require("ethers");

require("dotenv").config();

const fetchData = require("./routes/Dashboard");
const fetchFarms = require("./routes/Farms");
const { time } = require("console");

// promisify to use in async function
const readdir = util.promisify(fs.readFile);

// set express&cors
const app = express();
app.use(cors());
const PORT = 5001;

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

const farmsLoop = async (farms, database) => {
  try {
    let promises = farms.farms.map(async (farm, index) => {
      return fetchFarms(farms, index, database).then(async (data) => {
        farms.farms[index] = data.farms[index];
      });
    });
    await Promise.all(promises);
    return farms;
  } catch (err) {
    console.log("Error: ", err);
  }
};

setInterval(async () => {
  let database = await readdir("./stores/data.json");
  database = JSON.parse(database);
  database = await fetchData(database);

  let farms = await readdir("./stores/Farms.json");
  farms = JSON.parse(farms);
  farms = await farmsLoop(farms, database);

  fs.writeFileSync("./stores/data.json", JSON.stringify(database));
  fs.writeFileSync("./stores/Farms.json", JSON.stringify(farms));
}, 20000);

app.get("/", (req, res) => {
  res.send("Spindex Temporary API");
});

app.listen(PORT, () =>
  console.log(`Server is running on : http://localhost:${PORT}`)
);
