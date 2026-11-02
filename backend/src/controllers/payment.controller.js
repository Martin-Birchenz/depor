const { preferenceClient, paymentClient } = require("../config/mercadopago.js");
const memberRepository = require("../repositories/member.repository.js");

// Valor fijo de cuota mensual (configurable por variable de entorno o fallback fijo)
const CUOTA_MENSUAL = Number(process.env.VALOR_CUOTA_SOCIO) || 5000;

class PaymentController {
  // 1. Consultar estado societario para pago
  async checkMemberDebt(req, res, next) {
    try {
      const { identifier } = req.query; // Puede ser DNI o N° de socio
      if (!identifier) {
        return res
          .status(400)
          .json({ message: "Se requiere DNI o N° de Socio" });
      }

      let member = await memberRepository.findByDni(identifier);
      if (!member && !isNaN(identifier)) {
        member = await memberRepository.findByMemberNumber(Number(identifier));
      }

      if (!member) {
        return res
          .status(404)
          .json({ message: "No se encontró ningún socio con esos datos" });
      }

      if (member.category === "honorario") {
        return res.status(200).json({
          status: "exempt",
          message:
            "El socio honorario se encuentra exento de abonar cuota societaria.",
          member,
        });
      }

      const isUpToDate = member.status === "active";

      return res.status(200).json({
        status: isUpToDate ? "up_to_date" : "pending",
        amount: CUOTA_MENSUAL,
        member: {
          id: member.idmembers,
          name: `${member.first_name} ${member.last_name}`,
          dni: member.dni,
          memberNumber: member.member_number,
          category: member.category,
          status: member.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 2. Crear preferencia para abonar cuota de socio existente
  async createMemberPaymentPreference(req, res, next) {
    try {
      const { memberId } = req.body;
      const member = await memberRepository.findById(memberId);

      if (!member) {
        return res.status(404).json({ message: "Socio no encontrado" });
      }

      if (member.category === "honorario") {
        return res
          .status(400)
          .json({ message: "Los socios honorarios están exentos de cuota." });
      }

      const clientUrl =
        process.env.CLIENT_URL || "https://depor-club.vercel.app";
      const backendUrl =
        process.env.BACKEND_URL || "https://depor-z5fe.onrender.com";

      const preference = await preferenceClient.create({
        body: {
          items: [
            {
              id: `cuota-${member.idmembers}`,
              title: `Cuota Social El Depor - Socio #${member.member_number || member.idmembers}`,
              description: `Abono de cuota para ${member.first_name} ${member.last_name}`,
              quantity: 1,
              unit_price: CUOTA_MENSUAL,
              currency_id: "ARS",
            },
          ],
          payer: {
            name: member.first_name,
            surname: member.last_name,
            email: member.email || "socio@eldepor.com.ar",
          },
          external_reference: `member_fee:${member.idmembers}`,
          back_urls: {
            success: `${clientUrl}/pago-exitoso`,
            failure: `${clientUrl}/pago-fallido`,
            pending: `${clientUrl}/pago-pendiente`,
          },
          auto_return: "approved",
          notification_url: `${backendUrl}/api/payments/webhook`,
        },
      });

      return res.status(200).json({
        initPoint: preference.init_point,
      });
    } catch (error) {
      next(error);
    }
  }

  // 3. Webhook de Mercado Pago
  async handleWebhook(req, res, next) {
    try {
      const { query } = req;
      const topic = query.topic || query.type;
      const paymentId = query.id || query["data.id"];

      // Responder 200 de inmediato a Mercado Pago
      res.status(200).send("OK");

      if (topic === "payment" && paymentId) {
        const payment = await paymentClient.get({ id: paymentId });

        if (payment && payment.status === "approved") {
          const externalRef = payment.external_reference;

          if (externalRef && externalRef.startsWith("member_fee:")) {
            const memberId = externalRef.split(":")[1];
            await memberRepository.updateStatus(memberId, "active");
          }
        }
      }
    } catch (error) {
      console.error("Error en Webhook Mercado Pago:", error);
    }
  }
}

module.exports = new PaymentController();
