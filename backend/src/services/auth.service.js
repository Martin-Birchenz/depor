const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/user.repository.js");

class AuthService {
  async login(email, password) {
    const user = await userRepository.findByEmailWithRole(email);

    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    if (!user.is_active) {
      const error = new Error("User is not active");
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const payload = {
      userId: user.idusers,
      name: user.name,
      email: user.email,
      role: user.role_name,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    return {
      token,
      user: {
        id: user.idusers,
        name: user.name,
        email: user.email,
        role: user.role_name,
      },
    };
  }
  async registerUser(userData, requestingUser) {
    const totalUsers = await userRepository.countUsers();

    if (totalUsers > 0) {
      if (!requestingUser || requestingUser.role !== "adminBirchenz") {
        const error = new Error(
          "Solo el administrador general puede crear nuevas cuentas",
        );
        error.statusCode = 403;
        throw error;
      }
    }

    const existing = await userRepository.findByEmailWithRole(userData.email);
    if (existing) {
      const error = new Error(`El email ${userData.email} ya está registrado`);
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    const newId = await userRepository.create({
      roleId: userData.roleId,
      name: userData.name,
      email: userData.email,
      passwordHash,
    });

    return {
      id: newId,
      name: userData.name,
      email: userData.email,
      roleId: userData.roleId,
    };
  }
}

module.exports = new AuthService();
