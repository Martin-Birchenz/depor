const productRepository = require("../repositories/product.repository.js");

class ProductService {
  async getProducts(filters) {
    return await productRepository.findAll(filters);
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      const error = new Error(`Producto con ID ${id} no encontrado`);
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  async createProduct(data) {
    const { variants, ...productData } = data;
    const newId = await productRepository.createWithVariants(
      productData,
      variants,
    );
    return await productRepository.findById(newId);
  }

  async updateProduct(id, data) {
    await this.getProductById(id);
    await productRepository.update(id, data);
    return await productRepository.findById(id);
  }

  async addVariant(productId, variantData) {
    await this.getProductById(productId);
    const variantId = await productRepository.addVariant(
      productId,
      variantData,
    );
    return {
      id: variantId,
      productId,
      ...variantData,
    };
  }

  async updateStock(variantId, stock) {
    const updated = await productRepository.updateVariantStock(
      variantId,
      stock,
    );
    if (!updated) {
      const error = new Error(`Variante con ID ${variantId} no encontrada`);
      error.statusCode = 404;
      throw error;
    }
    return { variantId, stock };
  }
}

module.exports = new ProductService();
