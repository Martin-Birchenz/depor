const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_SECURE === "true" || true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

class EmailService {
  // 1. Correo individual de recordatorio de cuota
  async sendDebtReminder({ to, name, memberNumber, debtAmount }) {
    const frontendUrl =
      process.env.FRONTEND_URL || "https://depor-club.vercel.app";
    const paymentLink = `${frontendUrl}/socios`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #000; color: #fff; padding: 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px; letter-spacing: 1px;">CLUB DEPORTIVO NOGOYÁ</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: #aaa;">El Depor - Barrio Lourdes</p>
        </div>
        <div style="padding: 24px; color: #333; line-height: 1.6;">
          <p>Hola <strong>${name}</strong> (Socio #${String(memberNumber || "").padStart(4, "0")}),</p>
          <p>Te escribimos desde la administración del club para recordarte que tenés pendiente el abono de tu cuota social.</p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #dc3545; padding: 12px 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #555;">Estado: <strong style="color: #dc3545;">Cuota Vencida</strong></p>
            <p style="margin: 4px 0 0; font-size: 16px;">Total a regularizar: <strong>$${Number(debtAmount).toLocaleString("es-AR")}</strong></p>
          </div>

          <p>El aporte de cada socio es fundamental para mantener las instalaciones y seguir mejorando los deportes de nuestra institución.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentLink}" style="background-color: #009ee3; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 6px; display: inline-block;">
              Pagar Cuota Online con Mercado Pago
            </a>
          </div>

          <p style="font-size: 12px; color: #777;">Si ya abonaste en secretaría en las últimas 48 horas, por favor desestimá este mensaje.</p>
        </div>
        <div style="background-color: #f1f1f1; padding: 12px; text-align: center; font-size: 12px; color: #666;">
          Sede Social: Mihura y Fritz Gerald, Nogoyá, Entre Ríos.
        </div>
      </div>
    `;

    return await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `Recordatorio de Cuota Social - Club Deportivo Nogoyá`,
      html,
    });
  }

  // 2. Correo masivo para Campañas Comunitarias y Obras
  async sendProjectCampaign({ to, title, message, projectGoal, linkAction }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #000; color: #fff; padding: 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px; letter-spacing: 1px;">CLUB DEPORTIVO NOGOYÁ</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: #aaa;">Construyendo el futuro de el club</p>
        </div>
        <div style="padding: 24px; color: #333; line-height: 1.6;">
          <h3 style="color: #111; margin-top: 0;">${title}</h3>
          <div style="font-size: 15px; margin: 16px 0; white-space: pre-line;">
            ${message}
          </div>

          ${
            projectGoal
              ? `<div style="background-color: #e8f4fd; border-left: 4px solid #009ee3; padding: 12px 16px; margin: 20px 0;">
                   <strong>Objetivo institucional:</strong> ${projectGoal}
                 </div>`
              : ""
          }

          ${
            linkAction
              ? `<div style="text-align: center; margin: 30px 0;">
                   <a href="${linkAction}" style="background-color: #111; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 6px; display: inline-block;">
                     Sumarme al Proyecto
                   </a>
                 </div>`
              : ""
          }

          <p style="font-size: 13px; color: #555;">¡Gracias por formar parte de nuestra comunidad!</p>
        </div>
        <div style="background-color: #f1f1f1; padding: 12px; text-align: center; font-size: 12px; color: #666;">
          Comisión Directiva - Club Deportivo Nogoyá
        </div>
      </div>
    `;

    return await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `${title} - El Depor Informa`,
      html,
    });
  }
}

module.exports = new EmailService();
