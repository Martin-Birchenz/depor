const pool = require("../config/db.js");
const { sendSuccess } = require("../middlewares/responseHandler.js");

class CanteenController {
  async getProducts(req, res, next) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM canteen_products WHERE is_active = TRUE ORDER BY name ASC",
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
        `INSERT INTO canteen_products (name, category, sale_price, stock) 
         VALUES (?, ?, ?, ?)`,
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
        "UPDATE canteen_products SET sale_price = COALESCE(?, sale_price), stock = COALESCE(?, stock), is_active = COALESCE(?, is_active) WHERE id = ?",
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
        "SELECT * FROM canteen_sales ORDER BY created_at DESC LIMIT 50",
      );
      return sendSuccess(res, rows, "Ventas obtenidas", 200);
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
          "SELECT sale_price, stock FROM canteen_products WHERE id = ?",
          [item.productId],
        );

        if (prodRows.length === 0) {
          throw new Error(`Producto ${item.productId} no encontrado`);
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
        "INSERT INTO canteen_sales (total_amount, payment_method, notes) VALUES (?, ?, ?)",
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
