const cron = require("node-cron");
const memberRepository = require("../repositories/member.repository.js");
const emailService = require("./email.service.js");

const CUOTA_MENSUAL = Number(process.env.VALOR_CUOTA_SOCIO) || 5000;

const initCronJobs = () => {
  // 1. Verificación diaria de cuotas vencidas (00:05 AM)
  cron.schedule("5 0 * * *", async () => {
    try {
      console.log("[CRON] Ejecutando verificación de vencimientos...");
      await memberRepository.updateExpiredMemberships();
    } catch (error) {
      console.error("[CRON] Error al actualizar vencimientos:", error);
    }
  });

  // 2. Disparo de recordatorios por email (Todos los lunes a las 09:00 AM)
  cron.schedule("0 9 * * 1", async () => {
    try {
      console.log("[CRON] Enviando recordatorios semanales a deudores...");
      const debtors = await memberRepository.findAll({ status: "debtor" });
      const recipients = debtors.filter(
        (m) => m.email && m.email.includes("@"),
      );

      for (const debtor of recipients) {
        try {
          await emailService.sendDebtReminder({
            to: debtor.email,
            name: `${debtor.first_name} ${debtor.last_name}`,
            memberNumber: debtor.member_number,
            debtAmount: CUOTA_MENSUAL,
          });
        } catch (e) {
          console.error(`[CRON] Falló envío a ${debtor.email}`);
        }
      }
    } catch (error) {
      console.error("[CRON] Error en recordatorios automáticos:", error);
    }
  });
};

module.exports = { initCronJobs };
