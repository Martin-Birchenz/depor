const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller.js");

// Consultar deuda por DNI o N° socio
router.get("/check-debt", paymentController.checkMemberDebt);

// Crear preferencia de Mercado Pago
router.post(
  "/create-preference",
  paymentController.createMemberPaymentPreference,
);

// Webhook que recibe las notificaciones de Mercado Pago
router.post("/webhook", paymentController.handleWebhook);

module.exports = router;
