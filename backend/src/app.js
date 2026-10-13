const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler.js");

const authRoutes = require("./routes/auth.routes.js");
const memberRoutes = require("./routes/member.routes.js");
const facilityRoutes = require("./routes/facility.routes.js");
const reservationRoutes = require("./routes/reservation.routes.js");
const campRegistrationRoutes = require("./routes/campRegistration.routes.js");
const productRoutes = require("./routes/product.routes.js");
const youthRoutes = require("./routes/youth.routes.js");
const canteenRoutes = require("./routes/canteen.routes.js");
const tennisRoutes = require("./routes/tennis.routes.js");
const padelRoutes = require("./routes/padel.routes.js");
const pelotaPaletaRoutes = require("./routes/pelotaPaleta.routes.js");
const salonRoutes = require("./routes/salon.routes.js");
const dashboardRoutes = require("./routes/dashboard.routes.js");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/camp-registrations", campRegistrationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/youth", youthRoutes);
app.use("/api/canteen", canteenRoutes);
app.use("/api/tennis", tennisRoutes);
app.use("/api/padel", padelRoutes);
app.use("/api/pelota-paleta", pelotaPaletaRoutes);
app.use("/api/salon", salonRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(errorHandler);

module.exports = app;
