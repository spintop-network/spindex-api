// import express from "express";
// import cors from "cors";

const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
const PORT = 5000;

app.get("/getData", (req, res) => {
  fs.readFile("./data.json", "utf8", (err, data) => {
    const database = JSON.parse(data);
    res.send(database);
  });
});

app.get("/", (req, res) => {
  res.send("Spindex Temporary API");
});

app.listen(PORT, () =>
  console.log(`Server is running on : http://localhost:${PORT}`)
);
