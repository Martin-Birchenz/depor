import api from "./api";

export const getDashboardStats = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [membersRes, reservationsRes, campRes] = await Promise.all([
      api.get("/members").catch(() => ({ data: { data: [] } })),
      api
        .get("/reservations", { params: { date: today } })
        .catch(() => ({ data: { data: [] } })),
      api.get("/camp-registrations").catch(() => ({ data: { data: [] } })),
    ]);

    const members = membersRes.data?.data || [];
    const reservations = reservationsRes.data?.data || [];
    const camp = campRes.data?.data || [];

    const activeMembers = members.filter(
      (m) =>
        (m.status || "").toLowerCase() === "active" ||
        (m.status || "").toLowerCase() === "activo",
    ).length;

    const confirmedBookings = reservations.filter(
      (r) =>
        (r.status || "").toLowerCase() === "confirmado" ||
        (r.status || "").toLowerCase() === "confirmed",
    ).length;

    return {
      activeMembers,
      totalMembers: members.length,
      todayBookings: reservations.length,
      confirmedBookings,
      campRegistrations: camp.length,
    };
  } catch (error) {
    console.error("Error calculando métricas:", error);
    return {
      activeMembers: 0,
      totalMembers: 0,
      todayBookings: 0,
      confirmedBookings: 0,
      campRegistrations: 0,
    };
  }
};
