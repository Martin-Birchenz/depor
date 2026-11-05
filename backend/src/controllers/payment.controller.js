const { preferenceClient, paymentClient } = require("../config/mercadopago.js");
const memberRepository = require("../repositories/member.repository.js");

// Valor fijo de cuota mensual
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
      const { memberId, months = 1 } = req.body;
      const monthsQty = Math.max(1, Number(months));

      const member = await memberRepository.findById(memberId);
      if (!member) {
        return res.status(404).json({ message: "Socio no encontrado" });
      }

      const totalAmount = CUOTA_MENSUAL * monthsQty;
      const title =
        monthsQty === 1
          ? "Cuota Social Mensual - El Depor"
          : `Abono de ${monthsQty} Cuotas Sociales - El Depor`;

      const preference = await preferenceClient.create({
        body: {
          items: [
            {
              id: `fee_${member.idmembers || member.id}`,
              title: title,
              quantity: 1,
              unit_price: totalAmount,
              currency_id: "ARS",
            },
          ],
          payer: {
            name: member.first_name || "Socio",
            surname: member.last_name || "Depor",
            email: member.email || "socio@eldepor.com.ar",
          },
          // Guardamos tanto el memberId como la cantidad de meses en la referencia externa
          external_reference: `member_fee:${member.idmembers || member.id}:${monthsQty}`,
          back_urls: {
            success: `${process.env.FRONTEND_URL || "http://localhost:5173"}/socios?status=success`,
            failure: `${process.env.FRONTEND_URL || "http://localhost:5173"}/socios?status=failure`,
            pending: `${process.env.FRONTEND_URL || "http://localhost:5173"}/socios?status=pending`,
          },
          auto_return: "approved",
        },
      });

      return res.status(200).json({
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point,
        totalAmount,
        months: monthsQty,
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
            const parts = externalRef.split(":");
            const memberId = parts[1];
            const months = parts[2] ? Number(parts[2]) : 1;

            // Extiende X meses
            await memberRepository.extendMonths(memberId, months);
          }
        }
      }
    } catch (error) {
      console.error("Error en Webhook Mercado Pago:", error);
    }
  }
}

module.exports = new PaymentController();
