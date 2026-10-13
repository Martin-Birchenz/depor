const authorize = (...allowedRoles) => {
  const roles = Array.isArray(allowedRoles[0]) ? allowedRoles[0] : allowedRoles;

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res
        .status(401)
        .json({ message: "No autenticado o rol no asignado" });
    }

    const userRole = req.user.role;

    if (
      userRole === "admin" ||
      userRole === "adminBirchenz" ||
      userRole === "secretaria"
    ) {
      return next();
    }

    if (!roles.includes(userRole)) {
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
