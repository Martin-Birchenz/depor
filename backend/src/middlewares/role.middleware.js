const authorize = (...allowedRoles) => {
  const roles = Array.isArray(allowedRoles[0]) ? allowedRoles[0] : allowedRoles;

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res
        .status(401)
        .json({ message: "No autenticado o rol no asignado" });
    }

    if (req.user.role === "adminBirchenz") {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message:
          "Acceso denegado: no tenés permisos para gestionar este módulo",
      });
    }

    next();
  };
};

module.exports = {
  authorize,
  authorizeRoles: authorize,
};
