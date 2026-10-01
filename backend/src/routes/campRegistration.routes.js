const { Router } = require("express");
const campRegistrationController = require("../controllers/campRegistration.controller");
const validate = require("../middlewares/validate.middleware");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const {
  createCampRegistrationSchema,
  updateCampRegistrationStatusSchema,
} = require("../schemas/campRegistration.schema");

const router = Router();

router.post("/", validate(createCampRegistrationSchema), (req, res, next) =>
  campRegistrationController.create(req, res, next),
);

router.get(
  "/",
  authenticate,
  authorize(["adminBirchenz", "secretaria"]),
  (req, res, next) => campRegistrationController.getAll(req, res, next),
);

router.patch(
  "/:id/status",
  authenticate,
  authorize(["adminBirchenz", "secretaria"]),
  validate(updateCampRegistrationStatusSchema),
  (req, res, next) => campRegistrationController.updateStatus(req, res, next),
);

module.exports = router;
