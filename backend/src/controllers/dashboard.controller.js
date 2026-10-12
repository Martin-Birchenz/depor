const pool = require("../config/db.js");
const { sendSuccess } = require("../middlewares/responseHandler.js");

class DashboardController {
  async getMetrics(req, res, next) {
    try {
      const [membersTotals] = await pool.query(`
        SELECT 
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_count,
          SUM(CASE WHEN status = 'debtor' THEN 1 ELSE 0 END) AS debtor_count,
          SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactive_count
        FROM members
      `);

      const [recentMembers] = await pool.query(`
        SELECT idmembers, first_name, last_name, dni, phone, status, created_at
        FROM members
        ORDER BY created_at DESC
        LIMIT 5
      `);

      const [campTotals] = await pool.query(`
        SELECT 
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'confirmado' THEN 1 ELSE 0 END) AS confirmed_count,
          SUM(CASE WHEN status = 'pendiente' THEN 1 ELSE 0 END) AS pending_count,
          SUM(CASE WHEN status = 'baja' THEN 1 ELSE 0 END) AS dropped_count,
          SUM(CASE WHEN shift = 'mañana' THEN 1 ELSE 0 END) AS morning_shift,
          SUM(CASE WHEN shift = 'tarde' THEN 1 ELSE 0 END) AS afternoon_shift,
          SUM(CASE WHEN is_member = 1 THEN 1 ELSE 0 END) AS members_in_camp
        FROM camp_registrations
      `);

      const [recentCamp] = await pool.query(`
        SELECT idcamp_registrations, minor_full_name, guardian_name, guardian_phone, shift, status, created_at
        FROM camp_registrations
        ORDER BY created_at DESC
        LIMIT 5
      `);

      const [canteenActiveSession] = await pool.query(`
        SELECT 
          COALESCE(SUM(total_amount), 0) AS total_amount,
          COALESCE(SUM(CASE WHEN payment_method = 'efectivo' THEN total_amount ELSE 0 END), 0) AS efectivo,
          COALESCE(SUM(CASE WHEN payment_method = 'transferencia' THEN total_amount ELSE 0 END), 0) AS transferencia,
          COALESCE(SUM(CASE WHEN payment_method = 'debito' THEN total_amount ELSE 0 END), 0) AS debito,
          COUNT(*) AS tickets_count
        FROM canteen_sales
        WHERE point_of_sale = 'general' AND is_closed = 0
      `);

      const [topCanteenProducts] = await pool.query(`
        SELECT 
          p.name,
          SUM(csi.quantity) AS total_qty,
          SUM(csi.subtotal) AS total_sales
        FROM canteen_sale_items csi
        JOIN canteen_products p ON csi.product_id = p.id
        JOIN canteen_sales s ON csi.sale_id = s.id
        WHERE s.point_of_sale = 'general' AND s.is_closed = 0
        GROUP BY p.id, p.name
        ORDER BY total_qty DESC
        LIMIT 5
      `);

      const [apparelStats] = await pool.query(`
        SELECT 
          COUNT(*) AS total_products,
          COALESCE(SUM(total_stock), 0) AS total_units,
          SUM(CASE WHEN total_stock < 5 THEN 1 ELSE 0 END) AS low_stock_variants
        FROM (
          SELECT 
            p.idproducts,
            COALESCE(SUM(pv.stock), 0) AS total_stock
          FROM products p
          LEFT JOIN products_variants pv ON p.idproducts = pv.product_id
          WHERE p.is_active = 1
          GROUP BY p.idproducts
        ) AS product_totals
      `);

      return sendSuccess(
        res,
        {
          members: {
            totals: membersTotals[0] || {
              total: 0,
              active_count: 0,
              debtor_count: 0,
              inactive_count: 0,
            },
            recent: recentMembers,
          },
          camp: {
            totals: campTotals[0] || {
              total: 0,
              confirmed_count: 0,
              pending_count: 0,
              dropped_count: 0,
              morning_shift: 0,
              afternoon_shift: 0,
              members_in_camp: 0,
            },
            recent: recentCamp,
          },
          canteen: {
            session: canteenActiveSession[0] || {
              total_amount: 0,
              efectivo: 0,
              transferencia: 0,
              debito: 0,
              tickets_count: 0,
            },
            topProducts: topCanteenProducts,
          },
          apparel: apparelStats[0] || {
            total_products: 0,
            total_units: 0,
            low_stock_variants: 0,
          },
        },
        "Métricas consolidadas obtenidas",
        200,
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
