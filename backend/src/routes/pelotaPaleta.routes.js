const { Router } = require("express");
const {
  getPelotaPaletaCourts,
  getPelotaPaletaReservations,
  createPelotaPaletaReservation,
  updateReservationStatus,
  getBuffetProducts,
  createBuffetProduct,
  createBuffetSale,
  getBuffetRecentSales,
} = require("../controllers/pelotaPaleta.controller.js");

const authMiddleware = require("../middlewares/auth.middleware.js");
const { authorize } = require("../middlewares/role.middleware.js");

const router = Router();

router.use(authMiddleware);
router.use(authorize("pelota_paleta"));

router.get("/courts", getPelotaPaletaCourts);
router.get("/reservations", getPelotaPaletaReservations);
router.post("/reservations", createPelotaPaletaReservation);
router.patch("/reservations/:id/status", updateReservationStatus);

router.get("/buffet/products", getBuffetProducts);
router.post("/buffet/products", createBuffetProduct);
router.post("/buffet/sales", createBuffetSale);
router.get("/buffet/sales", getBuffetRecentSales);

module.exports = router;
