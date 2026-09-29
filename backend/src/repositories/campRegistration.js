const pool = require("../config/db.js");

class CampRegistrationRepository {
  async create(data) {
    const query = `INSERT INTO camp_registrations (minor_full_name, minor_birth_date, guardian_name, guardian_phone, medical_notes, status) VALUES (?, ?, ?, ?, ?, 'pendiente')`;

    const [result] = await pool.execute(query, [
      data.minorFullName,
      data.minorBirthDate,
      data.guardianName,
      data.guardianPhone,
      data.medicalNotes || null,
    ]);

    return result.insertId;
  }
  async findAll({ status, search }) {
    let query = `SELECT
    idcamp_registrations,
    minor_full_name,
    minor_birth_date,
    guardian_name,
    guardian_phone,
    medical_notes,
    status,
    created_at
    FROM camp_registrations WHERE 1=1`;

    const params = [];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (minor_full_name LIKE ? OR guardian_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await pool.execute(query, params);

    return rows;
  }
  async findById(id) {
    const query = `SELECT * FROM camp_registrations WHERE idcamp_registrations = ? LIMIT 1`;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }
  async updateStatus(id, updateData) {
    const query = `
        UPDATE camp_registrations
        SET status = ?
        WHERE idcamp_registrations = ?
    `;
    const [result] = await pool.execute(query, [updateData.status, id]);
    return result.affectedRows > 0;
  }
}

module.exports = new CampRegistrationRepository();
