const { Router } = require("express");
const {
  getSalonFacilities,
  getSalonReservations,
  createSalonReservation,
  updateSalonReservationStatus,
} = require("../controllers/salon.controller.js");

const authMiddleware = require("../middlewares/auth.middleware.js");
const { authorize } = require("../middlewares/role.middleware.js");

const router = Router();

router.use(authMiddleware);
router.use(authorize("salon"));

router.get("/facilities", getSalonFacilities);
router.get("/reservations", getSalonReservations);
router.post("/reservations", createSalonReservation);
router.patch("/reservations/:id/status", updateSalonReservationStatus);

module.exports = router;
