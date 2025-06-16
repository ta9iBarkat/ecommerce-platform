import ErrorHandler from '../utils/errorHandler.js';

const errorHandler = (err, req, res, next) => {
  // Set default status code and message if not already set by our custom ErrorHandler
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // --- Handling Specific Mongoose Errors ---

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 404);
  }

  // 2. Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered.`;
    err = new ErrorHandler(message, 400);
  }

  // 3. Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    const message = `Invalid input data. ${messages.join('. ')}`;
    err = new ErrorHandler(message, 400);
  }

  // --- Send Final JSON Response ---
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    // Include stack trace only in development environment
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default errorHandler;