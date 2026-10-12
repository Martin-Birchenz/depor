import api from "./api";

export const getPadelCourts = async () => {
  const { data } = await api.get("/padel/courts");
  return data;
};

export const getPadelReservations = async (date) => {
  const { data } = await api.get(
    `/padel/reservations${date ? `?date=${date}` : ""}`,
  );
  return data;
};

export const createPadelReservation = async (reservationData) => {
  const { data } = await api.post("/padel/reservations", reservationData);
  return data;
};

export const updatePadelReservationStatus = async (id, status) => {
  const { data } = await api.patch(`/padel/reservations/${id}/status`, {
    status,
  });
  return data;
};
