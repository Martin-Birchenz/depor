import api from "./api";

export const getProducts = async () => {
  const response = await api.get("/products");
  return response.data.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data.data;
};

export const createProduct = async (productData) => {
  const response = await api.post("/products", productData);
  return response.data.data;
};
