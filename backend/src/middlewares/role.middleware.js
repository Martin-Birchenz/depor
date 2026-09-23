const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        const error = new Error("Unauthorized");
        error.statusCode = 401;
        throw error;
      }

      if (req.user.role === "adminBirchenz") {
        return next();
      }

      if (!allowedRoles.includes(req.user.role)) {
        const error = new Error("Unauthorized");
        error.statusCode = 403;
        throw error;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = authorize;
