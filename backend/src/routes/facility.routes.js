const { Router } = require("express");
const facilityController = require("../controllers/facility.controller.js");
const validate = require("../middlewares/validate.middleware.js");
const authorize = require("../middlewares/role.middleware.js");
const authenticate = require("../middlewares/auth.middleware.js");
const {
  createFacilitySchema,
  updateFacilitySchema,
} = require("../schemas/facility.schema.js");

const router = Router();

router.get("/", (req, res, next) => facilityController.getAll(req, res, next));
router.get("/:id", (req, res, next) =>
  facilityController.getById(req, res, next),
);

router.post(
  "/",
  authenticate,
  authorize(["adminBirchenz"]),
  validate(createFacilitySchema),
  (req, res, next) => facilityController.create(req, res, next),
);

router.put(
  "/:id",
  authenticate,
  authorize(["adminBirchenz", "turneras", "tenis"]),
  validate(updateFacilitySchema),
  (req, res, next) => facilityController.update(req, res, next),
);

module.exports = router;
