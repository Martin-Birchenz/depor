const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler.js");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.use(errorHandler);

module.exports = app;
