import api from "./api";

export const getCanteenProducts = async () => {
  const response = await api.get("/canteen/products");
  return response.data.data;
};

export const createCanteenProduct = async (productData) => {
  const response = await api.post("/canteen/products", productData);
  return response.data.data;
};

export const getCanteenSales = async () => {
  const response = await api.get("/canteen/sales");
  return response.data.data;
};

export const recordCanteenSale = async (saleData) => {
  const response = await api.post("/canteen/sales", saleData);
  return response.data.data;
};
