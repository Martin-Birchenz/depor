const { ZodError } = require("zod");

const errorHandler = (err, req, res, next) => {
  console.error("Error captured in errorHandler middleware:", err);

  if (err instanceof ZodError) {
    const issues = err.issues || err.errors || [];
    const formattedErrors = issues.map((issue) => ({
      field: issue.path ? issue.path.join(".") : "general",
      message: issue.message,
    }));

    return res.status(400).json({
      status: "error",
      message: "Error de validación en los datos enviados",
      errors: formattedErrors,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Error interno del servidor";

  return res.status(statusCode).json({
    status: "error",
    message,
  });
};

module.exports = errorHandler;
