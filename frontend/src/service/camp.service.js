import api from "./api.js";

export const registerCampParticipant = async (campData) => {
  const response = await api.post("/camp-registrations", campData);
  return response.data.data;
};

export const getCampRegistrations = async (params = {}) => {
  const response = await api.get("/camp-registrations", { params });
  return response.data.data;
};

export const updateCampRegistrationStatus = async (id, status) => {
  const response = await api.patch(`/camp-registrations/${id}/status`, {
    status,
  });
  return response.data.data;
};
