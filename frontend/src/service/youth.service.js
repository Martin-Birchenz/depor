import api from "./api";

export const getYouthCategories = async () => {
  const response = await api.get("/youth/categories");
  return response.data.data;
};

export const getYouthPlayers = async (params = {}) => {
  const response = await api.get("/youth/players", { params });
  return response.data.data;
};

export const createYouthPlayer = async (playerData) => {
  const response = await api.post("/youth/players", playerData);
  return response.data.data;
};

export const updateYouthPlayerStatus = async (id, status) => {
  const response = await api.patch(`/youth/players/${id}/status`, { status });
  return response.data.data;
};
