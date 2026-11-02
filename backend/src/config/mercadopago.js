const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
});

const preferenceClient = new Preference(client);
const paymentClient = new Payment(client);

module.exports = {
  client,
  preferenceClient,
  paymentClient,
};
