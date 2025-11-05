const { AppError } = require('../errors/AppError');

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    error = new AppError(message, statusCode);
  }

  const response = {
    error: error.message,
    code: error.code,
  };

  if (error.details && Object.keys(error.details).length > 0) {
    response.details = error.details;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  console.error(`[${error.code}] ${error.message}`, error.details || '');

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
