const pool = require("../config/db.js");

class ProductRepository {
  async findAll({ onlyActive = true }) {
    let query = `SELECT idproducts, name, description, price, member_price, image_url, is_active FROM products WHERE 1=1`;

    if (onlyActive) {
      query += ` AND is_active = 1`;
    }

    query += ` ORDER BY created_at DESC`;

    const [products] = await pool.execute(query);

    if (!products || products.length === 0) {
      return [];
    }

    const productIds = products.map((product) => product.idproducts);
    const placeholders = productIds.map(() => "?").join(",");
    const [variants] = await pool.execute(
      `SELECT idproducts_variants, product_id, size, stock FROM products_variants WHERE product_id IN (${placeholders})`,
      productIds,
    );

    return products.map((product) => ({
      ...product,
      variants: variants.filter((v) => v.product_id === product.idproducts),
    }));
  }
  async findById(id) {
    const query = `
        SELECT idproducts, name, description, price, member_price, image_url, is_active, created_at
      FROM products
      WHERE idproducts = ?
      LIMIT 1`;

    const [rows] = await pool.execute(query, [id]);

    if (rows.length === 0) return null;

    const product = rows[0];

    const [variants] = await pool.execute(
      `SELECT idproducts_variants, product_id, size, stock FROM products_variants WHERE product_id = ?`,
      [id],
    );

    return {
      ...product,
      variants,
    };
  }
  async createWithVariants(productData, variants) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const productQuery = `
        INSERT INTO products (name, description, price, member_price, image_url, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [productResult] = await connection.execute(productQuery, [
        productData.name,
        productData.description || null,
        productData.price,
        productData.memberPrice || null,
        productData.imageUrl || null,
        productData.isActive !== undefined ? (productData.isActive ? 1 : 0) : 1,
      ]);

      const productId = productResult.insertId;

      if (variants && variants.length > 0) {
        for (const variant of variants) {
          await connection.execute(
            `INSERT INTO products_variants (product_id, size, stock) VALUES (?, ?, ?)`,
            [productId, variant.size, variant.stock || 0],
          );
        }
      }

      await connection.commit();
      return productId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async update(id, data) {
    const fields = [];
    const params = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      params.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      params.push(data.description);
    }
    if (data.price !== undefined) {
      fields.push("price = ?");
      params.push(data.price);
    }
    if (data.memberPrice !== undefined) {
      fields.push("member_price = ?");
      params.push(data.memberPrice);
    }
    if (data.imageUrl !== undefined) {
      fields.push("image_url = ?");
      params.push(data.imageUrl);
    }
    if (data.isActive !== undefined) {
      fields.push("is_active = ?");
      params.push(data.isActive ? 1 : 0);
    }

    if (fields.length === 0) return false;

    params.push(id);
    const query = `UPDATE products SET ${fields.join(", ")} WHERE idproducts = ?`;
    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  }

  async addVariant(productId, { size, stock }) {
    const query = `INSERT INTO products_variants (product_id, size, stock) VALUES (?, ?, ?)`;
    const [result] = await pool.execute(query, [productId, size, stock || 0]);
    return result.insertId;
  }

  async updateVariantStock(variantId, stock) {
    const query = `UPDATE products_variants SET stock = ? WHERE idproducts_variants = ?`;
    const [result] = await pool.execute(query, [stock, variantId]);
    return result.affectedRows > 0;
  }
}

module.exports = new ProductRepository();
