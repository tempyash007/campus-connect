/**
 * Global Error Handlers
 */

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}. Resource does not exist.`
  });
};

const errorHandler = (err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(err.status || 500).json({
    status: err.status || 500,
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred on the server.'
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
