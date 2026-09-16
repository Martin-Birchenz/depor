const handleError = (err, req, res, next) => {
  console.error(
    "Error captured in errorHandler middleware:",
    err || err.message,
  );

  // Si el error fue originado por una validación de Zod
  if (err.name === "ZodError") {
    return res.status(400).json({
      status: "error",
      message: "Invalid request",
      errors: err.errors.map((e) => ({
        campo: e.path.join("."),
        mensaje: e.message,
      })),
    });
  }

  // Para errores controlados de lógica de negocio
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  return res.status(statusCode).json({
    status: "error",
    message,
  });
};

module.exports = handleError;
