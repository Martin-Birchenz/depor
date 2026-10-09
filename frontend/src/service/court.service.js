import api from "./api";

export const getFacilities = async () => {
  const response = await api.get("/facilities");
  return response.data.data;
};

export const getBookings = async (params = {}) => {
  const response = await api.get("/bookings", { params });
  return response.data.data;
};

export const createBookingAdmin = async (bookingData) => {
  const response = await api.post("/bookings", bookingData);
  return response.data.data;
};

export const updateBookingStatus = async (id, status) => {
  const response = await api.patch(`/bookings/${id}/status`, { status });
  return response.data.data;
};

export const updateBookingPayment = async (id, paymentData) => {
  const response = await api.patch(`/bookings/${id}/payment`, paymentData);
  return response.data.data;
};
