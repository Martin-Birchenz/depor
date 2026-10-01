const { Router } = require("express");
const productController = require("../controllers/product.controller.js");
const validate = require("../middlewares/validate.middleware.js");
const authenticate = require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/role.middleware.js");
const {
  createProductSchema,
  updateProductSchema,
  updateVariantStockSchema,
  addVariantSchema,
} = require("../schemas/product.schema.js");

const router = Router();

router.get("/", (req, res, next) => productController.getAll(req, res, next));
router.get("/:id", (req, res, next) =>
  productController.getById(req, res, next),
);

router.use(authenticate);
router.use(authorize(["adminBirchenz", "tienda"]));

router.post("/", validate(createProductSchema), (req, res, next) =>
  productController.create(req, res, next),
);

router.put("/:id", validate(updateProductSchema), (req, res, next) =>
  productController.update(req, res, next),
);

router.post("/:id/variants", validate(addVariantSchema), (req, res, next) =>
  productController.addVariant(req, res, next),
);

router.patch(
  "/variants/:variantId/stock",
  validate(updateVariantStockSchema),
  (req, res, next) => productController.updateStock(req, res, next),
);

module.exports = router;
