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
}

module.exports = new AuthService();
