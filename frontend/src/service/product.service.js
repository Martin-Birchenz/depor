import api from "./api.js";

export const getProducts = async () => {
  const response = await api.get("/products");
  const items = response.data?.data || response.data;
  return Array.isArray(items) ? items : [];
};
