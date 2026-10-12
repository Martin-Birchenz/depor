const pool = require("../config/db.js");
const { sendSuccess } = require("../middlewares/responseHandler.js");

class CanteenController {
  async getProducts(req, res, next) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM canteen_products WHERE point_of_sale = 'general' AND is_active = TRUE ORDER BY name ASC",
      );
      return sendSuccess(res, rows, "Productos de cantina obtenidos", 200);
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req, res, next) {
    try {
      const { name, category, salePrice, stock } = req.body;
      const [result] = await pool.query(
        `INSERT INTO canteen_products (name, category, point_of_sale, sale_price, stock, is_active) 
         VALUES (?, ?, 'general', ?, ?, 1)`,
        [name, category || "comida", salePrice, stock || 0],
      );

      return sendSuccess(
        res,
        { id: result.insertId, ...req.body },
        "Producto creado con éxito",
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const { salePrice, stock, isActive } = req.body;

      await pool.query(
        "UPDATE canteen_products SET sale_price = COALESCE(?, sale_price), stock = COALESCE(?, stock), is_active = COALESCE(?, is_active) WHERE id = ? AND point_of_sale = 'general'",
        [salePrice, stock, isActive, id],
      );

      return sendSuccess(res, { id }, "Producto actualizado con éxito", 200);
    } catch (error) {
      next(error);
    }
  }

  async getSales(req, res, next) {
    try {
      const [rows] = await pool.query(
        `SELECT s.*, DATE_FORMAT(s.created_at, '%d/%m %H:%i') as sale_time 
         FROM canteen_sales s
         WHERE s.point_of_sale = 'general' AND s.is_closed = 0
         ORDER BY s.created_at DESC`,
      );
      return sendSuccess(res, rows, "Ventas de la jornada obtenidas", 200);
    } catch (error) {
      next(error);
    }
  }

  async getDailySummary(req, res, next) {
    try {
      const [totals] = await pool.query(
        `SELECT 
           COALESCE(SUM(total_amount), 0) AS total,
           COALESCE(SUM(CASE WHEN payment_method = 'efectivo' THEN total_amount ELSE 0 END), 0) AS efectivo,
           COALESCE(SUM(CASE WHEN payment_method = 'transferencia' THEN total_amount ELSE 0 END), 0) AS transferencia,
           COALESCE(SUM(CASE WHEN payment_method = 'debito' THEN total_amount ELSE 0 END), 0) AS debito,
           COUNT(*) AS total_tickets
         FROM canteen_sales
         WHERE point_of_sale = 'general' AND is_closed = 0`,
      );

      const [itemsSummary] = await pool.query(
        `SELECT 
           p.name,
           SUM(csi.quantity) AS total_qty,
           SUM(csi.subtotal) AS total_amount
         FROM canteen_sale_items csi
         JOIN canteen_products p ON csi.product_id = p.id
         JOIN canteen_sales s ON csi.sale_id = s.id
         WHERE s.point_of_sale = 'general' AND s.is_closed = 0
         GROUP BY p.id, p.name
         ORDER BY total_qty DESC`,
      );

      return sendSuccess(
        res,
        {
          summary: totals[0],
          items: itemsSummary,
        },
        "Resumen de jornada generado",
        200,
      );
    } catch (error) {
      next(error);
    }
  }

  async closeDailySession(req, res, next) {
    try {
      await pool.query(
        "UPDATE canteen_sales SET is_closed = 1 WHERE point_of_sale = 'general' AND is_closed = 0",
      );

      return sendSuccess(
        res,
        null,
        "Jornada cerrada exitosamente. Caja reiniciada.",
        200,
      );
    } catch (error) {
      next(error);
    }
  }

  async recordSale(req, res, next) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { paymentMethod, notes, items } = req.body;

      let totalAmount = 0;
      const itemsToInsert = [];

      for (const item of items) {
        const [prodRows] = await connection.query(
          "SELECT sale_price, stock FROM canteen_products WHERE id = ? AND point_of_sale = 'general'",
          [item.productId],
        );

        if (prodRows.length === 0) {
          throw new Error(
            `Producto ${item.productId} no encontrado en cantina general`,
          );
        }

        const price = Number(prodRows[0].sale_price);
        const subtotal = price * item.quantity;
        totalAmount += subtotal;

        itemsToInsert.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: price,
          subtotal,
        });

        await connection.query(
          "UPDATE canteen_products SET stock = GREATEST(0, stock - ?) WHERE id = ?",
          [item.quantity, item.productId],
        );
      }

      const [saleResult] = await connection.query(
        "INSERT INTO canteen_sales (total_amount, payment_method, point_of_sale, notes) VALUES (?, ?, 'general', ?)",
        [totalAmount, paymentMethod || "efectivo", notes || null],
      );

      const saleId = saleResult.insertId;

      for (const it of itemsToInsert) {
        await connection.query(
          "INSERT INTO canteen_sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)",
          [saleId, it.productId, it.quantity, it.unitPrice, it.subtotal],
        );
      }

      await connection.commit();
      return sendSuccess(
        res,
        { saleId, totalAmount },
        "Venta registrada con éxito",
        201,
      );
    } catch (error) {
      await connection.rollback();
      next(error);
    } finally {
      connection.release();
    }
  }
}

module.exports = new CanteenController();
