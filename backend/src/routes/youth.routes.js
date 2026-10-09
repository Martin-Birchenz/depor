const { Router } = require("express");
const youthController = require("../controllers/youth.controller.js");
const validate = require("../middlewares/validate.middleware.js");
const authenticate = require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/role.middleware.js");
const { createYouthPlayerSchema } = require("../schemas/youth.schema.js");

const router = Router();

router.use(authenticate);
router.use(authorize(["adminBirchenz", "coordinador_futbol", "secretaria"]));

router.get("/categories", (req, res, next) =>
  youthController.getCategories(req, res, next),
);
router.get("/players", (req, res, next) =>
  youthController.getPlayers(req, res, next),
);
router.post("/players", validate(createYouthPlayerSchema), (req, res, next) =>
  youthController.createPlayer(req, res, next),
);
router.patch("/players/:id/status", (req, res, next) =>
  youthController.updatePlayerStatus(req, res, next),
);

module.exports = router;
