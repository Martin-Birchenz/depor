const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);

    req.user = decoded;
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      error.statusCode = 401;
      error.message = "Unauthorized";
    }
    next(error);
  }
};

const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(); // Continúa sin req.user
  }
  try {
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "secreto_default_dev";
    req.user = jwt.verify(token, secret);
  } catch (error) {}
  next();
};

module.exports = authenticate;
module.exports.optionalAuthenticate = optionalAuthenticate;
