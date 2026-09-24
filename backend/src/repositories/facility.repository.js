const pool = require("../config/db.js");

class FacilityRepository {
  async findAll({ sportType, onlyActive = true }) {
    let query = `SELECT idfacilities, name, sport_type, pricing_type, default_price, member_discount_percent, is_active FROM facilities WHERE 1=1 `;

    const params = [];

    if (onlyActive) {
      query += ` AND is_active = 1`;
    }

    if (sportType) {
      query += ` AND sport_type = ?`;
      params.push(sportType);
    }

    query += " ORDER BY sport_type ASC, name ASC";

    const [rows] = await pool.execute(query, params);
    return rows;
  }
  async findById(id) {
    const query = `SELECT idfacilities, name, sport_type, pricing_type, default_price, member_discount_percent, is_active FROM facilities WHERE idfacilities = ? LIMIT 1`;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }
  async create(data) {
    const query = `INSERT INTO facilities (name, sport_type, pricing_type, default_price, member_discount_percent, is_active) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(query, [
      data.name,
      data.sportType,
      data.pricingType || "hourly",
      data.defaultPrice,
      data.memberDiscountPercent ?? 0,
      data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
    ]);
    return result.insertId;
  }
  async update(id, data) {
    const fields = [];
    const params = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      params.push(data.name);
    }
    if (data.sportType !== undefined) {
      fields.push("sport_type = ?");
      params.push(data.sportType);
    }
    if (data.pricingType !== undefined) {
      fields.push("pricing_type = ?");
      params.push(data.pricingType);
    }
    if (data.defaultPrice !== undefined) {
      fields.push("default_price = ?");
      params.push(data.defaultPrice);
    }
    if (data.memberDiscountPercent !== undefined) {
      fields.push("member_discount_percent = ?");
      params.push(data.memberDiscountPercent);
    }
    if (data.isActive !== undefined) {
      fields.push("is_active = ?");
      params.push(data.isActive ? 1 : 0);
    }
    if (fields.length === 0) return false;

    params.push(id);

    const query = `UPDATE facilities SET ${fields.join(", ")} WHERE idfacilities = ?`;

    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  }
}

module.exports = new FacilityRepository();
