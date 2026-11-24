const { Router } = require("express");
const footballController = require("../controllers/football.controller.js");
const authenticate = require("../middlewares/auth.middleware.js");
const { authorize } = require("../middlewares/role.middleware.js");

const router = Router();

router.use(authenticate);
router.use(authorize(["adminBirchenz", "futbol", "secretaria"]));

// Plantel / Seguro de jugadores
router.get("/players", (req, res, next) =>
  footballController.getPlayers(req, res, next),
);
router.post("/players", (req, res, next) =>
  footballController.createPlayer(req, res, next),
);
router.put("/players/:id", (req, res, next) =>
  footballController.updatePlayer(req, res, next),
);
router.delete("/players/:id", (req, res, next) =>
  footballController.deletePlayer(req, res, next),
);

// Gastos y cierre de caja
router.get("/expenses", (req, res, next) =>
  footballController.getExpenses(req, res, next),
);
router.post("/expenses", (req, res, next) =>
  footballController.createExpense(req, res, next),
);
router.post("/expenses/close", (req, res, next) =>
  footballController.closeExpenses(req, res, next),
);

module.exports = router;
