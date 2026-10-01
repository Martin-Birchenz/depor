const pool = require("../config/db.js");

class UserRepository {
  async findByEmailWithRole(email) {
    const query = `
            SELECT u.idusers, u.name, u.email, u.password, u.is_active, r.id AS role_id, r.name AS role_name FROM users u INNER JOIN roles r ON u.role_id = r.id WHERE u.email = ? LIMIT 1
        `;
    const [rows] = await pool.execute(query, [email]);
    return rows[0] || null;
  }
  async countUsers() {
    const query = `SELECT COUNT(*) AS total FROM users`;
    const [rows] = await pool.execute(query);
    return rows[0].total;
  }
  async create({ roleId, name, email, passwordHash }) {
    const query = `
      INSERT INTO users (role_id, name, email, password, is_active)
      VALUES (?, ?, ?, ?, 1)
    `;
    const [result] = await pool.execute(query, [
      roleId,
      name,
      email,
      passwordHash,
    ]);
    return result.insertId;
  }
}

module.exports = new UserRepository();
