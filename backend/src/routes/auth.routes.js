const { Router } = require("express");
const authController = require("../controllers/auth.controller.js");
const { loginSchema } = require("../schemas/auth.schema.js");
const validate = require("../middlewares/validate.middleware.js");

const router = Router();

router.post("/login", validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next),
);

module.exports = router;
