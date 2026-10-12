import api from "./api";

export const getPelotaPaletaCourts = async () => {
  const { data } = await api.get("/pelota-paleta/courts");
  return data;
};

export const getPelotaPaletaReservations = async (date) => {
  const { data } = await api.get(
    `/pelota-paleta/reservations${date ? `?date=${date}` : ""}`,
  );
  return data;
};

export const createPelotaPaletaReservation = async (reservationData) => {
  const { data } = await api.post(
    "/pelota-paleta/reservations",
    reservationData,
  );
  return data;
};

export const updatePelotaPaletaReservationStatus = async (id, status) => {
  const { data } = await api.patch(`/pelota-paleta/reservations/${id}/status`, {
    status,
  });
  return data;
};

export const getBuffetProducts = async () => {
  const { data } = await api.get("/pelota-paleta/buffet/products");
  return data;
};

export const createBuffetProduct = async (productData) => {
  const { data } = await api.post(
    "/pelota-paleta/buffet/products",
    productData,
  );
  return data;
};

export const createBuffetSale = async (saleData) => {
  const { data } = await api.post("/pelota-paleta/buffet/sales", saleData);
  return data;
};

export const getBuffetRecentSales = async () => {
  const { data } = await api.get("/pelota-paleta/buffet/sales");
  return data;
};
