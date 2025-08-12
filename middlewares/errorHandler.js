export const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message;
  let errorDetails = null;

  // --- Error Type Handling ---
  // Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errorDetails = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message,
      type: val.kind
    }));
  }

  // MongoDB Duplicate Key
  else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
    errorDetails = {
      field: Object.keys(err.keyPattern)[0],
      value: Object.values(err.keyValue)[0]
    };
  }

  // JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // --- Production vs Development ---
  const response = {
    success: false,
    status: statusCode,
    message: process.env.NODE_ENV === 'production' && statusCode >= 500 
      ? 'Internal server error' 
      : message,
    ...(process.env.NODE_ENV !== 'production' && {
      stack: err.stack,
      type: err.name,
      fullError: err
    }),
    ...(errorDetails && { errors: errorDetails })
  };

  // --- Logging ---
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    status: statusCode,
    message: message,
    ...(err.stack && { stack: err.stack.split('\n') }),
    ...(req.user && { userId: req.user.id })
  };

  console.error('ERROR:', JSON.stringify(logEntry, null, 2));

  // --- Response ---
  res.status(statusCode).json(response);
};

// Catch 404 and forward to error handler
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
};

// Async error wrapper (eliminates try-catch blocks)
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};