import api from "./api.js";

export const registerMember = async (memberData) => {
  const response = await api.post("/members", memberData);
  return response.data;
};
