const pool = require("../config/db.js");
const {
  createTennisReservationSchema,
  createTennisGroupSchema,
  createTennisStudentSchema,
} = require("../schemas/tennis.schema.js");

const getTennisCourts = async (req, res, next) => {
  try {
    const [courts] = await pool.query(
      "SELECT * FROM facilities WHERE sport_type = 'tenis' AND is_active = 1",
    );
    res.json(courts);
  } catch (error) {
    next(error);
  }
};

const getTennisReservations = async (req, res, next) => {
  try {
    const { date } = req.query;
    let query = `
      SELECT r.*, f.name AS court_name, m.dni AS member_dni
      FROM reservations r
      JOIN facilities f ON r.facility_id = f.idfacilities
      LEFT JOIN members m ON r.member_id = m.idmembers
      WHERE f.sport_type = 'tenis'
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

const createTennisReservation = async (req, res, next) => {
  try {
    const parsedData = createTennisReservationSchema.parse(req.body);

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
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmada', ?)`,
      [
        parsedData.facility_id,
        userId,
        parsedData.member_id || null,
        parsedData.client_name,
        parsedData.client_phone,
        parsedData.reservation_date,
        parsedData.start_time,
        parsedData.end_time,
        parsedData.reservation_type,
        parsedData.final_price,
        parsedData.payment_method,
        parsedData.notes || null,
      ],
    );

    res
      .status(201)
      .json({ message: "Turno reservado con éxito", id: result.insertId });
  } catch (error) {
    next(error);
  }
};

const updateReservationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'confirmada', 'cancelada', 'completada'

    if (!["confirmada", "cancelada", "completada"].includes(status)) {
      return res.status(400).json({ message: "Estado de reserva inválido" });
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

const getTennisGroups = async (req, res, next) => {
  try {
    const [groups] = await pool.query(`
      SELECT g.*, f.name AS court_name, COUNT(s.id) AS total_students
      FROM tennis_groups g
      JOIN facilities f ON g.facility_id = f.idfacilities
      LEFT JOIN tennis_students s ON g.id = s.group_id AND s.status != 'inactivo'
      WHERE g.is_active = 1
      GROUP BY g.id
      ORDER BY FIELD(g.day_of_week, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'), g.start_time
    `);
    res.json(groups);
  } catch (error) {
    next(error);
  }
};

const createTennisGroup = async (req, res, next) => {
  try {
    const data = createTennisGroupSchema.parse(req.body);
    const [result] = await pool.query(
      `INSERT INTO tennis_groups (facility_id, name, day_of_week, start_time, end_time, coach_name, monthly_fee)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.facility_id,
        data.name,
        data.day_of_week,
        data.start_time,
        data.end_time,
        data.coach_name || null,
        data.monthly_fee,
      ],
    );
    res
      .status(201)
      .json({ message: "Grupo creado con éxito", id: result.insertId });
  } catch (error) {
    next(error);
  }
};

const getStudentsByGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const [students] = await pool.query(
      `SELECT s.*, m.member_number, m.dni AS member_dni
       FROM tennis_students s
       LEFT JOIN members m ON s.member_id = m.idmembers
       WHERE s.group_id = ?
       ORDER BY s.full_name ASC`,
      [groupId],
    );
    res.json(students);
  } catch (error) {
    next(error);
  }
};

const addStudentToGroup = async (req, res, next) => {
  try {
    const data = createTennisStudentSchema.parse(req.body);
    const [result] = await pool.query(
      `INSERT INTO tennis_students (group_id, member_id, full_name, phone, email, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.group_id,
        data.member_id || null,
        data.full_name,
        data.phone,
        data.email || null,
        data.status,
      ],
    );
    res
      .status(201)
      .json({ message: "Alumno inscripto con éxito", id: result.insertId });
  } catch (error) {
    next(error);
  }
};

const updateStudentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["activo", "inactivo", "al_dia", "moroso"].includes(status)) {
      return res.status(400).json({ message: "Estado de alumno inválido" });
    }

    await pool.query("UPDATE tennis_students SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
    res.json({ message: "Estado de alumno actualizado" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTennisCourts,
  getTennisReservations,
  createTennisReservation,
  updateReservationStatus,
  getTennisGroups,
  createTennisGroup,
  getStudentsByGroup,
  addStudentToGroup,
  updateStudentStatus,
};
