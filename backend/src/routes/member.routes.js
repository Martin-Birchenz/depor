const { Router } = require("express");
const memberController = require("../controllers/member.controller.js");
const validate = require("../middlewares/validate.middleware.js");
const authorize = require("../middlewares/role.middleware.js");
const authenticate = require("../middlewares/auth.middleware.js");
const { createMemberSchema } = require("../schemas/member.schema.js");

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize(["adminBirchenz", "secretaria", "turneras", "tenis"]),
  (req, res, next) => memberController.getAll(req, res, next),
);

router.get(
  "/by-dni/:dni",
  authorize(["adminBirchenz", "secretaria", "turneras", "tenis"]),
  (req, res, next) => memberController.getByDni(req, res, next),
);

router.post(
  "/",
  authorize(["adminBirchenz", "secretaria"]),
  validate(createMemberSchema),
  (req, res, next) => memberController.create(req, res, next),
);

module.exports = router;
