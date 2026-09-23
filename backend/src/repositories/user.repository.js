const pool = require("../config/db.js");

class UserRepository {
  async findByEmailWithRole(email) {
    const query = `
            SELECT u.idusers, u.name, u.email, u.password, u.is_active, r.id AS role_id, r.name AS role_name FROM users u INNER JOIN roles r ON u.role_id = r.id WHERE u.email = ? LIMIT 1
        `;
    const [rows] = await pool.execute(query, [email]);
    return rows[0] || null;
  }
}

module.exports = new UserRepository();
