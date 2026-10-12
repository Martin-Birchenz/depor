const { Router } = require("express");
const {
  getPadelCourts,
  getPadelReservations,
  createPadelReservation,
  updatePadelReservationStatus,
} = require("../controllers/padel.controller.js");

const authMiddleware = require("../middlewares/auth.middleware.js");
const { authorize } = require("../middlewares/role.middleware.js");

const router = Router();

router.use(authMiddleware);
router.use(authorize("padel"));

router.get("/courts", getPadelCourts);
router.get("/reservations", getPadelReservations);
router.post("/reservations", createPadelReservation);
router.patch("/reservations/:id/status", updatePadelReservationStatus);

module.exports = router;
