const { Router } = require("express");
const authController = require("../controllers/auth.controller.js");
const validate = require("../middlewares/validate.middleware.js");
const authenticate = require("../middlewares/auth.middleware.js");
const { optionalAuthenticate } = require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/role.middleware.js");
const {
  loginSchema,
  registerUserSchema,
} = require("../schemas/auth.schema.js");
const { sendSuccess } = require("../middlewares/responseHandler.js");

const router = Router();

router.post("/login", validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next),
);

router.post(
  "/register",
  optionalAuthenticate,
  validate(registerUserSchema),
  (req, res, next) => authController.register(req, res, next),
);

router.get("/me", authenticate, (req, res) => {
  return sendSuccess(res, req.user, "Usuario autenticado correctamente");
});

router.get(
  "/admin-only",
  authenticate,
  authorize(["adminBirchenz"]),
  (req, res) => {
    return sendSuccess(
      res,
      { secret: "Información sensible de administración" },
      "Acceso permitido",
    );
  },
);

module.exports = router;
