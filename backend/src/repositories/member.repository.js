const pool = require("../config/db.js");

class MemberRepository {
  async findByDni(dni) {
    const query = `
            SELECT idmembers, dni, first_name, last_name, phone, email, status, member_number, created_at FROM members WHERE dni = ? LIMIT 1
        `;
    const [rows] = await pool.execute(query, [dni]);
    return rows[0] || null;
  }
  async findByMemberNumber(memberNumber) {
    const query = `
            SELECT idmembers, dni, first_name, last_name, phone, email, status, member_number, created_at FROM members WHERE member_number = ? LIMIT 1
        `;
    const [rows] = await pool.execute(query, [memberNumber]);
    return rows[0] || null;
  }
  async create(data) {
    const query = `
            INSERT INTO members (dni, first_name, last_name, phone, email, status, member_numbe) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
    const [result] = await pool.execute(query, [
      data.dni,
      data.firstName,
      data.lastName,
      data.phone,
      data.email || null,
      data.status || "active",
      data.memberNumber || null,
    ]);
    return result.insertId;
  }
  async findAll({ search, status }) {
    let query = `
    SELECT idmembers, dni, first_name, last_name, phone, email, status, member_number, created_at FROM members WHERE 1=1 `;

    const params = [];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (dni LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await pool.execute(query, params);
    return rows;
  }
}

module.exports = new MemberRepository();
