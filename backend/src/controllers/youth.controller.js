const pool = require("../config/db.js");
const { sendSuccess } = require("../middlewares/responseHandler.js");

class YouthController {
  async getCategories(req, res, next) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM youth_categories ORDER BY birth_year ASC",
      );
      return sendSuccess(res, rows, "Categorías obtenidas con éxito", 200);
    } catch (error) {
      next(error);
    }
  }

  async getPlayers(req, res, next) {
    try {
      const { categoryId } = req.query;
      let query = `
        SELECT yp.*, yc.name as category_name, yc.birth_year 
        FROM youth_players yp
        JOIN youth_categories yc ON yp.category_id = yc.id
      `;
      const params = [];

      if (categoryId) {
        query += " WHERE yp.category_id = ?";
        params.push(categoryId);
      }

      query += " ORDER BY yp.last_name ASC, yp.first_name ASC";

      const [rows] = await pool.query(query, params);
      return sendSuccess(res, rows, "Jugadores obtenidos con éxito", 200);
    } catch (error) {
      next(error);
    }
  }

  async createPlayer(req, res, next) {
    try {
      const {
        categoryId,
        firstName,
        lastName,
        dni,
        birthDate,
        guardianName,
        guardianPhone,
      } = req.body;

      const [result] = await pool.query(
        `INSERT INTO youth_players 
        (category_id, first_name, last_name, dni, birth_date, guardian_name, guardian_phone, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'activo')`,
        [
          categoryId,
          firstName,
          lastName,
          dni,
          birthDate,
          guardianName,
          guardianPhone,
        ],
      );

      return sendSuccess(
        res,
        { id: result.insertId, ...req.body },
        "Jugador inscripto con éxito",
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  async updatePlayerStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await pool.query("UPDATE youth_players SET status = ? WHERE id = ?", [
        status,
        id,
      ]);

      return sendSuccess(
        res,
        { id, status },
        "Estado actualizado con éxito",
        200,
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new YouthController();
