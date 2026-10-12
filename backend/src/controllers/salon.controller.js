const pool = require("../config/db.js");
const { createSalonReservationSchema } = require("../schemas/salon.schema.js");

const SHIFT_HOURS = {
  mediodia: { start: "11:00", end: "17:00" },
  noche: { start: "19:00", end: "05:00" },
  completo: { start: "10:00", end: "05:00" },
};

const getSalonFacilities = async (req, res, next) => {
  try {
    const [facilities] = await pool.query(
      "SELECT * FROM facilities WHERE sport_type = 'salon_parrilla' AND is_active = 1",
    );
    res.json(facilities);
  } catch (error) {
    next(error);
  }
};

const getSalonReservations = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    let query = `
      SELECT r.*, f.name AS facility_name, m.dni AS member_dni
      FROM reservations r
      JOIN facilities f ON r.facility_id = f.idfacilities
      LEFT JOIN members m ON r.member_id = m.idmembers
      WHERE f.sport_type = 'salon_parrilla'
    `;
    const params = [];

    if (month && year) {
      query +=
        " AND MONTH(r.reservation_date) = ? AND YEAR(r.reservation_date) = ?";
      params.push(month, year);
    }

    query += " ORDER BY r.reservation_date ASC, r.start_time ASC";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

const createSalonReservation = async (req, res, next) => {
  try {
    const parsedData = createSalonReservationSchema.parse(req.body);
    const userId =
      req.user?.id ||
      req.user?.idusers ||
      req.user?.userId ||
      req.user?.id_user;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Usuario no identificado en la sesión" });
    }

    const hours = SHIFT_HOURS[parsedData.shift];

    const [existing] = await pool.query(
      `SELECT idreservations, notes FROM reservations
       WHERE facility_id = ?
         AND reservation_date = ?
         AND status != 'cancelada'`,
      [parsedData.facility_id, parsedData.reservation_date],
    );

    const hasCollision = existing.some((res) => {
      const isFullDay =
        res.notes?.includes("completo") || parsedData.shift === "completo";
      const sameShift = res.notes?.includes(parsedData.shift);
      return isFullDay || sameShift;
    });

    if (hasCollision) {
      return res.status(409).json({
        message: "El sector ya se encuentra reservado para esa jornada/turno",
      });
    }

    const notePayload =
      `Jornada: ${parsedData.shift}. ${parsedData.notes || ""}`.trim();

    const [result] = await pool.query(
      `INSERT INTO reservations
        (facility_id, user_id, member_id, client_name, client_phone, reservation_date, start_time, end_time, reservation_type, final_price, payment_method, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'evento', ?, ?, 'confirmada', ?)`,
      [
        parsedData.facility_id,
        userId,
        parsedData.member_id || null,
        parsedData.client_name,
        parsedData.client_phone,
        parsedData.reservation_date,
        hours.start,
        hours.end,
        parsedData.final_price,
        parsedData.payment_method,
        notePayload,
      ],
    );

    res
      .status(201)
      .json({ message: "Alquiler reservado con éxito", id: result.insertId });
  } catch (error) {
    next(error);
  }
};

const updateSalonReservationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["confirmada", "cancelada", "completada"].includes(status)) {
      return res.status(400).json({ message: "Estado de reserva inválido" });
    }

    await pool.query(
      "UPDATE reservations SET status = ? WHERE idreservations = ?",
      [status, id],
    );
    res.json({ message: `Alquiler actualizado a ${status}` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalonFacilities,
  getSalonReservations,
  createSalonReservation,
  updateSalonReservationStatus,
};
