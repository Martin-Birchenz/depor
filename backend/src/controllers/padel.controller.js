const pool = require("../config/db.js");
const { createPadelReservationSchema } = require("../schemas/padel.schema.js");

const getPadelCourts = async (req, res, next) => {
  try {
    const [courts] = await pool.query(
      "SELECT * FROM facilities WHERE sport_type = 'padel' AND is_active = 1",
    );
    res.json(courts);
  } catch (error) {
    next(error);
  }
};

const getPadelReservations = async (req, res, next) => {
  try {
    const { date } = req.query;
    let query = `
      SELECT r.*, f.name AS court_name, m.dni AS member_dni
      FROM reservations r
      JOIN facilities f ON r.facility_id = f.idfacilities
      LEFT JOIN members m ON r.member_id = m.idmembers
      WHERE f.sport_type = 'padel'
    `;
    const params = [];

    if (date) {
      query += " AND r.reservation_date = ?";
      params.push(date);
    }

    query += " ORDER BY r.reservation_date DESC, r.start_time ASC";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

const createPadelReservation = async (req, res, next) => {
  try {
    const parsedData = createPadelReservationSchema.parse(req.body);
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

    const [existing] = await pool.query(
      `SELECT idreservations FROM reservations 
       WHERE facility_id = ? 
         AND reservation_date = ? 
         AND status != 'cancelada'
         AND (
           (start_time <= ? AND end_time > ?) OR
           (start_time < ? AND end_time >= ?) OR
           (start_time >= ? AND end_time <= ?)
         )`,
      [
        parsedData.facility_id,
        parsedData.reservation_date,
        parsedData.start_time,
        parsedData.start_time,
        parsedData.end_time,
        parsedData.end_time,
        parsedData.start_time,
        parsedData.end_time,
      ],
    );

    if (existing.length > 0) {
      return res
        .status(409)
        .json({ message: "La cancha ya está ocupada en ese horario" });
    }

    const [result] = await pool.query(
      `INSERT INTO reservations 
        (facility_id, user_id, member_id, client_name, client_phone, reservation_date, start_time, end_time, reservation_type, final_price, payment_method, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'casual', ?, ?, 'confirmada', ?)`,
      [
        parsedData.facility_id,
        userId,
        parsedData.member_id || null,
        parsedData.client_name,
        parsedData.client_phone,
        parsedData.reservation_date,
        parsedData.start_time,
        parsedData.end_time,
        parsedData.final_price,
        parsedData.payment_method,
        parsedData.notes || null,
      ],
    );

    res
      .status(201)
      .json({
        message: "Turno de pádel reservado con éxito",
        id: result.insertId,
      });
  } catch (error) {
    next(error);
  }
};

const updatePadelReservationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["confirmada", "cancelada", "completada"].includes(status)) {
      return res.status(400).json({ message: "Estado de turno inválido" });
    }

    await pool.query(
      "UPDATE reservations SET status = ? WHERE idreservations = ?",
      [status, id],
    );
    res.json({ message: `Turno actualizado a ${status}` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPadelCourts,
  getPadelReservations,
  createPadelReservation,
  updatePadelReservationStatus,
};
