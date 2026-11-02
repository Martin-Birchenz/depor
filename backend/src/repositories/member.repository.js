const pool = require("../config/db.js");

class MemberRepository {
  async getNextMemberNumber() {
    const query = `SELECT MAX(member_number) as maxNumber FROM members`;
    const [rows] = await pool.execute(query);
    const maxNum = rows[0]?.maxNumber;
    return maxNum ? Number(maxNum) + 1 : 1;
  }

  async findByDni(dni) {
    const query = `
      SELECT idmembers, dni, cuit, first_name, last_name, phone, email, photo_url, status, category, tutor_info, family_members, member_number, created_at 
      FROM members 
      WHERE dni = ? 
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [dni]);
    return rows[0] || null;
  }

  async findByMemberNumber(memberNumber) {
    const query = `
      SELECT idmembers, dni, cuit, first_name, last_name, phone, email, photo_url, status, category, tutor_info, family_members, member_number, created_at 
      FROM members 
      WHERE member_number = ? 
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [memberNumber]);
    return rows[0] || null;
  }

  async create(data) {
    // Si no viene un número asignado manualmente, calculamos el consecutivo histórico
    const memberNum = data.memberNumber ?? (await this.getNextMemberNumber());

    const query = `
      INSERT INTO members (
        dni, cuit, first_name, last_name, phone, email, photo_url, status, category, tutor_info, family_members, member_number
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.dni ?? null,
      data.cuit ?? null,
      data.firstName ?? data.first_name ?? null,
      data.lastName ?? data.last_name ?? null,
      data.phone ?? null,
      data.email ?? null,
      data.photoUrl ?? data.photo_url ?? null,
      data.status ?? "active",
      data.category ?? "general",
      data.tutorInfo ? JSON.stringify(data.tutorInfo) : null,
      data.familyMembers ? JSON.stringify(data.familyMembers) : null,
      memberNum,
    ];

    const [result] = await pool.execute(query, params);
    return { insertId: result.insertId, memberNumber: memberNum };
  }

  async findAll({ search, status, category }) {
    let query = `
      SELECT idmembers, dni, cuit, first_name, last_name, phone, email, photo_url, status, category, tutor_info, family_members, member_number, created_at 
      FROM members 
      WHERE 1=1 `;

    const params = [];

    if (status && status !== "todos") {
      query += ` AND status = ?`;
      params.push(status);
    }

    if (category && category !== "todas") {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (search) {
      query += ` AND (dni LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR cuit LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
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
      SELECT idmembers, dni, cuit, first_name, last_name, phone, email, photo_url, status, category, tutor_info, family_members, member_number, created_at 
      FROM members 
      WHERE idmembers = ? 
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }
}

module.exports = new MemberRepository();
