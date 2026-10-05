import api from "./api.js";

export const getFacilities = async () => {
  const response = await api.get("/facilities");
  return response.data.data;
};
