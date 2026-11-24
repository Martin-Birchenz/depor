const pool = require("../config/db.js");

class FootballController {
  // --- PLANTEL Y SEGURO SOCIAL ---
  async getPlayers(req, res, next) {
    try {
      const { division, insuranceStatus, search } = req.query;
      let query = `SELECT * FROM football_players WHERE 1=1`;
      const params = [];

      if (division && division !== "todas") {
        query += ` AND division = ?`;
        params.push(division);
      }
      if (insuranceStatus && insuranceStatus !== "todos") {
        query += ` AND insurance_status = ?`;
        params.push(insuranceStatus);
      }
      if (search) {
        query += ` AND (first_name LIKE ? OR last_name LIKE ? OR dni LIKE ?)`;
        const term = `%${search}%`;
        params.push(term, term, term);
      }

      query += ` ORDER BY last_name ASC, first_name ASC`;
      const [rows] = await pool.execute(query, params);
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      next(error);
    }
  }

  async createPlayer(req, res, next) {
    try {
      const {
        firstName,
        lastName,
        dni,
        birthDate,
        phone,
        division,
        insuranceStatus,
        insuranceValidUntil,
        notes,
      } = req.body;

      const query = `
        INSERT INTO football_players 
        (first_name, last_name, dni, birth_date, phone, division, insurance_status, insurance_valid_until, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.execute(query, [
        firstName,
        lastName,
        dni,
        birthDate || null,
        phone || null,
        division || "primera",
        insuranceStatus || "pendiente_alta",
        insuranceValidUntil || null,
        notes || null,
      ]);

      return res.status(201).json({
        success: true,
        message: "Jugador agregado al plantel",
        data: { id: result.insertId },
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePlayer(req, res, next) {
    try {
      const { id } = req.params;
      const {
        firstName,
        lastName,
        dni,
        birthDate,
        phone,
        division,
        insuranceStatus,
        insuranceValidUntil,
        notes,
      } = req.body;

      const query = `
        UPDATE football_players 
        SET first_name = COALESCE(?, first_name),
            last_name = COALESCE(?, last_name),
            dni = COALESCE(?, dni),
            birth_date = ?,
            phone = ?,
            division = COALESCE(?, division),
            insurance_status = COALESCE(?, insurance_status),
            insurance_valid_until = ?,
            notes = ?
        WHERE id = ?
      `;
      await pool.execute(query, [
        firstName ?? null,
        lastName ?? null,
        dni ?? null,
        birthDate || null,
        phone || null,
        division ?? null,
        insuranceStatus ?? null,
        insuranceValidUntil || null,
        notes || null,
        id,
      ]);

      return res.status(200).json({
        success: true,
        message: "Datos del jugador actualizados",
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePlayer(req, res, next) {
    try {
      const { id } = req.params;
      await pool.execute(`DELETE FROM football_players WHERE id = ?`, [id]);
      return res
        .status(200)
        .json({ success: true, message: "Jugador eliminado" });
    } catch (error) {
      next(error);
    }
  }

  // --- EGRESOS OPERATIVOS (POLICÍA, SEGURO, VIAJES, ETC.) ---
  async getExpenses(req, res, next) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM football_expenses WHERE session_closed = 0 ORDER BY expense_date DESC, created_at DESC`,
      );
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      next(error);
    }
  }

  async createExpense(req, res, next) {
    try {
      const { concept, category, amount, paymentMethod, expenseDate, notes } =
        req.body;
      const dateVal = expenseDate || new Date().toISOString().split("T")[0];

      const query = `
        INSERT INTO football_expenses (concept, category, amount, payment_method, expense_date, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.execute(query, [
        concept,
        category || "otros",
        Number(amount),
        paymentMethod || "efectivo",
        dateVal,
        notes || null,
      ]);

      return res.status(201).json({
        success: true,
        message: "Gasto operativo registrado",
        data: { id: result.insertId },
      });
    } catch (error) {
      next(error);
    }
  }

  async closeExpensesSession(req, res, next) {
    try {
      await pool.execute(
        `UPDATE football_expenses SET session_closed = 1 WHERE session_closed = 0`,
      );
      return res
        .status(200)
        .json({ success: true, message: "Gastos de jornada cerrados" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FootballController();
