import api from "./api.js";

export const getMembers = async (params = {}) => {
  const response = await api.get("/members", { params });
  return response.data.data;
};

export const registerMember = async (memberData) => {
  const response = await api.post("/members", memberData);
  return response.data;
};

export const updateMemberStatus = async (id, status) => {
  const response = await api.patch(`/members/${id}/status`, { status });
  return response.data.data;
};
