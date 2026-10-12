import api from "./api"; //

export const getTennisCourts = async () => {
  const { data } = await api.get("/tennis/courts");
  return data;
};

export const getTennisReservations = async (date) => {
  const { data } = await api.get(
    `/tennis/reservations${date ? `?date=${date}` : ""}`,
  );
  return data;
};

export const createTennisReservation = async (reservationData) => {
  const { data } = (await api.get)
    ? await api.post("/tennis/reservations", reservationData)
    : null;
  return data;
};

export const updateReservationStatus = async (id, status) => {
  const { data } = await api.patch(`/tennis/reservations/${id}/status`, {
    status,
  });
  return data;
};

export const getTennisGroups = async () => {
  const { data } = await api.get("/tennis/groups");
  return data;
};

export const createTennisGroup = async (groupData) => {
  const { data } = await api.post("/tennis/groups", groupData);
  return data;
};

export const getGroupStudents = async (groupId) => {
  const { data } = await api.get(`/tennis/groups/${groupId}/students`);
  return data;
};

export const addTennisStudent = async (studentData) => {
  const { data } = await api.post("/tennis/students", studentData);
  return data;
};

export const updateStudentStatus = async (id, status) => {
  const { data } = await api.patch(`/tennis/students/${id}/status`, { status });
  return data;
};
