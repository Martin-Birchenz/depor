import api from "./api";

export const getFootballPlayers = async (params = {}) => {
  const res = await api.get("/football/players", { params });
  return res.data.data || res.data;
};

export const createFootballPlayer = async (data) => {
  const res = await api.post("/football/players", data);
  return res.data;
};

export const updateFootballPlayer = async (id, data) => {
  const res = await api.put(`/football/players/${id}`, data);
  return res.data;
};

export const deleteFootballPlayer = async (id) => {
  const res = await api.delete(`/football/players/${id}`);
  return res.data;
};

export const getFootballExpenses = async () => {
  const res = await api.get("/football/expenses");
  return res.data.data || res.data;
};

export const createFootballExpense = async (data) => {
  const res = await api.post("/football/expenses", data);
  return res.data;
};

export const closeFootballExpenses = async () => {
  const res = await api.post("/football/expenses/close");
  return res.data;
};
