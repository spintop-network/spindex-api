const express = require("express");
const cors = require("cors");
const fs = require("fs");
const util = require("util");
const ethers = require("ethers");
const https = require("https");

require("dotenv").config();

const fetchData = require("./routes/Dashboard");
const fetchFarms = require("./routes/Farms");
const { time } = require("console");

// promisify to use in async function
const readdir = util.promisify(fs.readFile);

// set express&cors
const app = express();
app.use(cors());
// serve the API with signed certificate on 443 (SSL/HTTPS) port
const httpsServer = https.createServer(
  {
    key: fs.readFileSync("/etc/letsencrypt/live/bluechip.wtf/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/bluechip.wtf/fullchain.pem"),
  },
  app
);

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

// async operations in parallel
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

app.get("/", (req, res) => {
  res.send("Spindex Temporary API");
});

httpsServer.listen(443, () => {
  console.log("HTTPS Server running on port 443");
});
