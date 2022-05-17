const express = require("express");
const cors = require("cors");
const fs = require("fs");
const util = require("util");
const ethers = require("ethers");

require("dotenv").config();

const fetchData = require("./routes/Dashboard");

// promisify to use in async function
const readdir = util.promisify(fs.readFile);

// set express&cors
const app = express();
app.use(cors());
const PORT = 5000;

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

setInterval(async () => {
  let database = await readdir("./stores/data.json");
  database = JSON.parse(database);
  let database_ = await fetchData(database);
  fs.writeFileSync("./stores/data.json", JSON.stringify(database_));
}, 20000);

app.get("/", (req, res) => {
  res.send("Spindex Temporary API");
});

app.listen(PORT, () =>
  console.log(`Server is running on : http://localhost:${PORT}`)
);
