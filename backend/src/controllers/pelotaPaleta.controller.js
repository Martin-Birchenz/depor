const pool = require("../config/db.js");
const {
  createPelotaPaletaReservationSchema,
  createBuffetProductSchema,
  createBuffetSaleSchema,
} = require("../schemas/pelotaPaleta.schema.js");

const getPelotaPaletaCourts = async (req, res, next) => {
  try {
    const [courts] = await pool.query(
      "SELECT * FROM facilities WHERE sport_type = 'pelota_paleta' AND is_active = 1",
    );
    res.json(courts);
  } catch (error) {
    next(error);
  }
};

const getPelotaPaletaReservations = async (req, res, next) => {
  try {
    const { date } = req.query;
    let query = `
      SELECT r.*, f.name AS court_name, m.dni AS member_dni
      FROM reservations r
      JOIN facilities f ON r.facility_id = f.idfacilities
      LEFT JOIN members m ON r.member_id = m.idmembers
      WHERE f.sport_type = 'pelota_paleta'
    `;
    const params = [];

    if (date) {
      query += " AND r.reservation_date = ?";
      params.push(date);
    }

    query += " ORDER BY r.reservation_date DESC, r.start_time ASC";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

const createPelotaPaletaReservation = async (req, res, next) => {
  try {
    const parsedData = createPelotaPaletaReservationSchema.parse(req.body);
    const userId =
      req.user?.id ||
      req.user?.idusers ||
      req.user?.userId ||
      req.user?.id_user;

    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const [existing] = await pool.query(
      `SELECT idreservations FROM reservations 
       WHERE facility_id = ? 
         AND reservation_date = ? 
         AND status != 'cancelada'
         AND (
           (start_time <= ? AND end_time > ?) OR
           (start_time < ? AND end_time >= ?) OR
           (start_time >= ? AND end_time <= ?)
         )`,
      [
        parsedData.facility_id,
        parsedData.reservation_date,
        parsedData.start_time,
        parsedData.start_time,
        parsedData.end_time,
        parsedData.end_time,
        parsedData.start_time,
        parsedData.end_time,
      ],
    );

    if (existing.length > 0) {
      return res
        .status(409)
        .json({ message: "El Trinquete ya está ocupado en ese horario" });
    }

    const [result] = await pool.query(
      `INSERT INTO reservations 
        (facility_id, user_id, member_id, client_name, client_phone, reservation_date, start_time, end_time, reservation_type, final_price, payment_method, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'casual', ?, ?, 'confirmada', ?)`,
      [
        parsedData.facility_id,
        userId,
        parsedData.member_id || null,
        parsedData.client_name,
        parsedData.client_phone,
        parsedData.reservation_date,
        parsedData.start_time,
        parsedData.end_time,
        parsedData.final_price,
        parsedData.payment_method,
        parsedData.notes || null,
      ],
    );

    res
      .status(201)
      .json({ message: "Turno reservado con éxito", id: result.insertId });
  } catch (error) {
    next(error);
  }
};

const updateReservationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["confirmada", "cancelada", "completada"].includes(status)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    await pool.query(
      "UPDATE reservations SET status = ? WHERE idreservations = ?",
      [status, id],
    );
    res.json({ message: `Turno actualizado a ${status}` });
  } catch (error) {
    next(error);
  }
};

const getBuffetProducts = async (req, res, next) => {
  try {
    const [products] = await pool.query(
      "SELECT * FROM canteen_products WHERE point_of_sale = 'pelota_paleta' AND is_active = 1 ORDER BY name ASC",
    );
    res.json(products);
  } catch (error) {
    next(error);
  }
};

const createBuffetProduct = async (req, res, next) => {
  try {
    const data = createBuffetProductSchema.parse(req.body);
    const [result] = await pool.query(
      `INSERT INTO canteen_products (name, category, point_of_sale, cost_price, sale_price, stock, is_active)
       VALUES (?, ?, 'pelota_paleta', ?, ?, ?, 1)`,
      [data.name, data.category, data.cost_price, data.sale_price, data.stock],
    );
    res
      .status(201)
      .json({ message: "Producto añadido al buffet", id: result.insertId });
  } catch (error) {
    next(error);
  }
};

const createBuffetSale = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const data = createBuffetSaleSchema.parse(req.body);
    await connection.beginTransaction();

    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );

    const [saleResult] = await connection.query(
      `INSERT INTO canteen_sales (total_amount, payment_method, point_of_sale, notes)
       VALUES (?, ?, 'pelota_paleta', ?)`,
      [totalAmount, data.payment_method, data.notes || null],
    );

    const saleId = saleResult.insertId;

    for (const item of data.items) {
      await connection.query(
        `INSERT INTO canteen_sale_items (sale_id, product_id, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [
          saleId,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.subtotal,
        ],
      );

      await connection.query(
        "UPDATE canteen_products SET stock = GREATEST(0, stock - ?) WHERE id = ?",
        [item.quantity, item.product_id],
      );
    }

    await connection.commit();
    res.status(201).json({ message: "Venta registrada con éxito", saleId });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

const getBuffetRecentSales = async (req, res, next) => {
  try {
    const [sales] = await pool.query(
      `SELECT s.*, DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i') as formatted_date
       FROM canteen_sales s
       WHERE s.point_of_sale = 'pelota_paleta'
       ORDER BY s.created_at DESC
       LIMIT 15`,
    );
    res.json(sales);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPelotaPaletaCourts,
  getPelotaPaletaReservations,
  createPelotaPaletaReservation,
  updateReservationStatus,
  getBuffetProducts,
  createBuffetProduct,
  createBuffetSale,
  getBuffetRecentSales,
};
