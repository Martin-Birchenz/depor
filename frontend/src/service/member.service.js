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

export const applyPrepaidPlan = async (memberId, planData) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL || "/api"}/members/${memberId}/prepaid-plan`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(planData),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Error al registrar el plan adelantado",
    );
  }

  return await response.json();
};

export const sendDebtorReminders = async () => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL || "/api"}/communication/send-debtor-reminders`,
    {
      method: "POST",
    },
  );
  if (!res.ok) throw new Error("Error al enviar recordatorios");
  return await res.json();
};

export const broadcastCampaign = async (campaignData) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL || "/api"}/communication/broadcast-campaign`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(campaignData),
    },
  );
  if (!res.ok) throw new Error("Error al difundir campaña");
  return await res.json();
};
