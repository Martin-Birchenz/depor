const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler.js");

const authRoutes = require("./routes/auth.routes.js");
const memberRoutes = require("./routes/member.routes.js");
const facilityRoutes = require("./routes/facility.routes.js");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/facilities", facilityRoutes);

app.use(errorHandler);

module.exports = app;
