import api from "./api";

export const getFacilities = async () => {
  const response = await api.get("/facilities");
  return response.data.data;
};

export const getBookings = async (params = {}) => {
  const response = await api.get("/reservations", { params });
  return response.data.data;
};

export const createBookingAdmin = async (bookingData) => {
  const response = await api.post("/reservations", bookingData);
  return response.data.data;
};

export const updateBookingStatus = async (id, status) => {
  const response = await api.patch(`/reservations/${id}/status`, { status });
  return response.data.data;
};
