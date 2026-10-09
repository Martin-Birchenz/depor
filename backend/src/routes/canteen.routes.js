const { Router } = require("express");
const canteenController = require("../controllers/canteen.controller.js");
const validate = require("../middlewares/validate.middleware.js");
const authenticate = require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/role.middleware.js");
const { createCanteenSaleSchema } = require("../schemas/canteen.schema.js");

const router = Router();

router.use(authenticate);
router.use(authorize(["adminBirchenz", "cantina", "secretaria"]));

router.get("/products", (req, res, next) =>
  canteenController.getProducts(req, res, next),
);
router.post("/products", (req, res, next) =>
  canteenController.createProduct(req, res, next),
);
router.put("/products/:id", (req, res, next) =>
  canteenController.updateProduct(req, res, next),
);

router.get("/sales", (req, res, next) =>
  canteenController.getSales(req, res, next),
);
router.post("/sales", validate(createCanteenSaleSchema), (req, res, next) =>
  canteenController.recordSale(req, res, next),
);

module.exports = router;
