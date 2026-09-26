const pool = require("../config/db.js");

class ReservationRepository {
  async findOverlapping({
    facilityId,
    reservationDate,
    startTime,
    endTime,
    excludeReservationId = null,
  }) {
    let query = `SELECT idreservations, facility_id, reservation_date, start_time, end_time,status`;

    const params = [facilityId, reservationDate, startTime, endTime];

    if (excludeReservationId) {
      query += ` AND idreservations != ?`;
      params.push(excludeReservationId);
    }

    const [rows] = await pool.query(query, params);

    return rows;
  }
  async create(data) {
    const query = `INSERT INTO reservations (
    facility_id,
    user_id,
    member_id,
    client_name,
    client_phone,
    reservation_date,
    start_time,
    end_time,
    reservation_type,
    final_price,
    payment_method,
    status,
    notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await pool.execute(query, [
      data.facilityId,
      data.memberId || null,
      data.userId,
      data.clientName,
      data.clientPhone,
      data.reservationDate,
      data.startTime,
      data.endTime,
      data.reservationType || "casual",
      data.finalPrice,
      data.paymentMethod || "pendiente",
      data.status || "pendiente",
      data.notes || null,
    ]);

    return result.insertId;
  }
  async findByFilters({ facilityId, date, status }) {
    let query = `
    SELECT
    r.idreservations,
    r.facility_id,
    f.name,
    AS
    facility_name,
    f.sport_type,
    r.user_id,
    u.name,
    AS
    operator_name,
    r.member_id,
    r.client_name,
    r.client_phone,
    r.reservation_date,
    r.start_time,
    r.end_time,
    r.reservation_type,
    r.final_price,
    r.payment_method,
    r.status,
    r.notes,
    r.created_at
    FROM reservations r
    INNER JOIN facilities f ON r.facility_id = f.idfacilities
    INNER JOIN users u ON r.user_id = u.idusers
    WHERE 1=1
    `;

    const params = [];

    if (facilityId) {
      query += ` AND r.facility_id = ?`;
      params.push(facilityId);
    }

    if (date) {
      query += ` AND r.reservation_date = ?`;
      params.push(date);
    }

    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY r.reservation_date ASC, r.start_time ASC`;

    const [rows] = await pool.query(query, params);

    return rows;
  }
  async findById(id) {
    const query = `SELECT * FROM reservations WHERE idreservations = ? LIMIT 1`;

    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
  }
  async updateStatus(id, { status, paymentMethod }) {
    const fields = ["status = ?"];
    const params = [status];

    if (paymentMethod) {
      fields.push("payment_method = ?");
      params.push(paymentMethod);
    }

    params.push(id);

    const query = `UPDATE reservations SET ${fields.join(", ")} WHERE idreservations = ?`;

    const [result] = await pool.execute(query, params);

    return result.affectedRows > 0;
  }
}

module.exports = new ReservationRepository();
