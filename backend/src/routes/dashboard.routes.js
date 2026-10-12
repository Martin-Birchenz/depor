const { Router } = require("express");
const dashboardController = require("../controllers/dashboard.controller.js");
const authenticate = require("../middlewares/auth.middleware.js");

const router = Router();

router.use(authenticate);

router.get("/metrics", (req, res, next) =>
  dashboardController.getMetrics(req, res, next),
);

module.exports = router;
