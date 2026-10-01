const productService = require("../services/product.service.js");
const { sendSuccess } = require("../middlewares/responseHandler.js");

class ProductController {
  async getAll(req, res, next) {
    try {
      const { all } = req.query;
      const onlyActive = all !== "true";
      const products = await productService.getProducts({ onlyActive });
      return sendSuccess(
        res,
        products,
        "Productos obtenidos exitosamente",
        200,
      );
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(Number(id));
      return sendSuccess(res, product, "Producto obtenido exitosamente", 200);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const product = await productService.createProduct(req.body);
      return sendSuccess(res, product, "Producto creado exitosamente", 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await productService.updateProduct(Number(id), req.body);
      return sendSuccess(
        res,
        updated,
        "Producto actualizado exitosamente",
        200,
      );
    } catch (error) {
      next(error);
    }
  }

  async addVariant(req, res, next) {
    try {
      const { id } = req.params;
      const variant = await productService.addVariant(Number(id), req.body);
      return sendSuccess(res, variant, "Variante agregada exitosamente", 201);
    } catch (error) {
      next(error);
    }
  }

  async updateStock(req, res, next) {
    try {
      const { variantId } = req.params;
      const result = await productService.updateStock(
        Number(variantId),
        req.body.stock,
      );
      return sendSuccess(res, result, "Stock actualizado exitosamente", 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
