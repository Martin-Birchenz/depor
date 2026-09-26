const { Router } = require("express");
const reservationController = require("../controllers/reservation.controller.js");
const validate = require("../middlewares/validate");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const {
  createReservationSchema,
  updateReservationStatusSchema,
} = require("../schemas/reservation.schema");

const router = Router();

router.use(authenticate);
router.use(authorize(["adminBirchenz", "secretaria", "tenis", "turneras"]));

router.get("/", (req, res, next) =>
  reservationController.getAll(req, res, next),
);

router.post("/", validate(createReservationSchema), (req, res, next) =>
  reservationController.create(req, res, next),
);

router.patch(
  "/:id/status",
  validate(updateReservationStatusSchema),
  (req, res, next) => reservationController.updateStatus(req, res, next),
);

module.exports = router;
