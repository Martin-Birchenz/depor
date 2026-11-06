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

  const { data } = await api.post("/upload/photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data.url;
};

export const applyPrepaidPlan = async (memberId, planData) => {
  const { data } = await api.post(
    `/members/${memberId}/prepaid-plan`,
    planData,
  );
  return data;
};

export const sendDebtorReminders = async () => {
  const { data } = await api.post("/communication/send-debtor-reminders");
  return data;
};

export const broadcastCampaign = async (campaignData) => {
  const { data } = await api.post(
    "/communication/broadcast-campaign",
    campaignData,
  );
  return data;
};

export const updateMember = async (id, memberData) => {
  const response = await api.put(`/members/${id}`, memberData);
  return response.data;
};
