const emailService = require("../services/email.service.js");
const memberRepository = require("../repositories/member.repository.js");

const CUOTA_MENSUAL = Number(process.env.VALOR_CUOTA_SOCIO) || 5000;

class CommunicationController {
  // Disparo manual o programado a deudores
  async sendDebtorReminders(req, res, next) {
    try {
      const debtors = await memberRepository.findAll({ status: "debtor" });
      const debtorsWithEmail = debtors.filter(
        (m) => m.email && m.email.includes("@"),
      );

      let sentCount = 0;
      for (const debtor of debtorsWithEmail) {
        try {
          await emailService.sendDebtReminder({
            to: debtor.email,
            name: `${debtor.first_name} ${debtor.last_name}`,
            memberNumber: debtor.member_number,
            debtAmount: CUOTA_MENSUAL,
          });
          sentCount++;
        } catch (err) {
          console.error(`Error enviando mail a ${debtor.email}:`, err.message);
        }
      }

      return res.status(200).json({
        message: `Se enviaron recordatorios a ${sentCount} socio(s) deudor(es).`,
        totalDebtors: debtorsWithEmail.length,
        sent: sentCount,
      });
    } catch (error) {
      next(error);
    }
  }

  // Enviar campaña comunitaria/obras a todos los socios activos
  async sendBroadcastCampaign(req, res, next) {
    try {
      const { title, message, projectGoal, linkAction } = req.body;

      if (!title || !message) {
        return res
          .status(400)
          .json({ message: "El título y el mensaje son obligatorios." });
      }

      const allMembers = await memberRepository.findAll({});
      const recipients = allMembers.filter(
        (m) => m.email && m.email.includes("@"),
      );

      let sentCount = 0;
      for (const member of recipients) {
        try {
          await emailService.sendProjectCampaign({
            to: member.email,
            title,
            message,
            projectGoal,
            linkAction,
          });
          sentCount++;
        } catch (err) {
          console.error(
            `Error enviando campaña a ${member.email}:`,
            err.message,
          );
        }
      }

      return res.status(200).json({
        message: `Campaña enviada a ${sentCount} socio(s).`,
        totalRecipients: recipients.length,
        sent: sentCount,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommunicationController();
