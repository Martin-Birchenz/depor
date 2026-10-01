const authService = require("../services/auth.service.js");
const { sendSuccess } = require("../middlewares/responseHandler.js");

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return sendSuccess(res, result, "Login successful", 200);
    } catch (error) {
      next(error);
    }
  }
  async register(req, res, next) {
    try {
      const result = await authService.registerUser(req.body, req.user);
      return sendSuccess(res, result, "Usuario creado exitosamente", 201);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
