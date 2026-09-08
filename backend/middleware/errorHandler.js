function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const isClientError = statusCode >= 400 && statusCode < 500;

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: isClientError ? err.message : "Internal server error",
  });
}

module.exports = { errorHandler };
