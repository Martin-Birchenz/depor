const express = require("express");
const router = express.Router();
const communicationController = require("../controllers/communication.controller.js");

// Enviar recordatorios de cobro a socios con cuota vencida
router.post(
  "/send-debtor-reminders",
  communicationController.sendDebtorReminders,
);

// Enviar campaña de obras o proyectos a los socios
router.post(
  "/broadcast-campaign",
  communicationController.sendBroadcastCampaign,
);

module.exports = router;
