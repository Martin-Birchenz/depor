const express = require("express");
const router = express.Router();
const footballController = require("../controllers/football.controller");
// Agregá tus middlewares de auth/roles si los usás en las otras rutas:
// const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");

router.get("/players", footballController.getPlayers);
router.post("/players", footballController.createPlayer);
router.put("/players/:id", footballController.updatePlayer);
router.delete("/players/:id", footballController.deletePlayer);

router.get("/expenses", footballController.getExpenses);
router.post("/expenses", footballController.createExpense);
router.post("/expenses/close", footballController.closeExpensesSession);

module.exports = router;
