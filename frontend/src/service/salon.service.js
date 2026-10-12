import api from "./api";

export const getSalonFacilities = async () => {
  const { data } = await api.get("/salon/facilities");
  return data;
};

export const getSalonReservations = async (month, year) => {
  const params = month && year ? `?month=${month}&year=${year}` : "";
  const { data } = await api.get(`/salon/reservations${params}`);
  return data;
};

export const createSalonReservation = async (reservationData) => {
  const { data } = await api.post("/salon/reservations", reservationData);
  return data;
};

export const updateSalonReservationStatus = async (id, status) => {
  const { data } = await api.patch(`/salon/reservations/${id}/status`, {
    status,
  });
  return data;
};
