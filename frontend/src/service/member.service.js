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

export const uploadMemberPhoto = async (file) => {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await fetch(
    `${import.meta.env.VITE_API_URL || "/api"}/upload/photo`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error("Error al subir la imagen a Cloudinary");
  }

  const data = await response.json();
  return data.url;
};
