const pool = require("../config/db.js");

class MemberRepository {
  async findByDni(dni) {
    const query = `
      SELECT idmembers, dni, first_name, last_name, phone, email, status, category, member_number, created_at 
      FROM members 
      WHERE dni = ? 
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [dni]);
    return rows[0] || null;
  }

  async findByMemberNumber(memberNumber) {
    const query = `
      SELECT idmembers, dni, first_name, last_name, phone, email, status, category, member_number, created_at 
      FROM members 
      WHERE member_number = ? 
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [memberNumber]);
    return rows[0] || null;
  }

  async create(data) {
    const query = `
      INSERT INTO members (dni, first_name, last_name, phone, email, status, category, member_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.dni ?? null,
      data.firstName ?? data.first_name ?? null,
      data.lastName ?? data.last_name ?? null,
      data.phone ?? null,
      data.email ?? null,
      data.status ?? "active",
      data.category ?? "general",
      data.memberNumber ?? data.member_number ?? null,
    ];

    const [result] = await pool.execute(query, params);
    return result.insertId;
  }

  async findAll({ search, status }) {
    let query = `
      SELECT idmembers, dni, first_name, last_name, phone, email, status, category, member_number, created_at 
      FROM members 
      WHERE 1=1 `;

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

  async updateStatus(id, status) {
    const query = `
      UPDATE members
      SET status = ?
      WHERE idmembers = ?
    `;
    const [result] = await pool.execute(query, [status, id]);
    return result.affectedRows > 0;
  }

  async findById(id) {
    const query = `
      SELECT idmembers, dni, first_name, last_name, phone, email, status, category, member_number, created_at 
      FROM members 
      WHERE idmembers = ? 
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }
}

module.exports = new MemberRepository();
