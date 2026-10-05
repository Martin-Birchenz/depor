import api from "./api.js";

export const registerCampParticipant = async (campData) => {
  const response = await api.post("/camp-registrations", campData);
  return response.data.data;
};
